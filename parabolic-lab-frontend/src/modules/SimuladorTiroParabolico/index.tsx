"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import GameCanvas from "./GameCanvas";
import {
  isMusicPlaying,
  startMusic,
  stopMusic,
  unlockAudio,
} from "./audio";
import type { ScoreState, SimSettings } from "./types";
import { PHYSICS_DEFAULTS } from "@/constants/physicsDefaults";
import { Scenario } from "@/models/scenario";
import type { PhysicsConfig } from "@/types/physicsConfig";

interface SimuladorTiroParabolicoProps {
  scenario?: Scenario;
}

const INITIAL_SCORE: ScoreState = {
  shots: 0,
  hits: 0,
  streak: 0,
  bestStreak: 0,
  points: 0,
};

interface ResolvedConfig {
  initial: SimSettings;
  ranges: {
    angleMin: number;
    angleMax: number;
    velocityMin: number;
    velocityMax: number;
    cannonHeightMin: number;
    cannonHeightMax: number;
    cannonXMin: number;
    cannonXMax: number;
  };
}

function resolveConfig(scenario?: Scenario): ResolvedConfig {
  const cfg = scenario?.configuracionescenario as
    | {
        physics?: Partial<PhysicsConfig>;
        angle?: number;
        velocity?: number;
        targetDistance?: number;
        cannonHeight?: number;
      }
    | undefined;
  const physics = cfg?.physics;

  const angleDefault =
    physics?.angleDefault ?? cfg?.angle ?? PHYSICS_DEFAULTS.ANGLE_DEFAULT;
  const velocityDefault =
    physics?.velocityDefault ??
    cfg?.velocity ??
    PHYSICS_DEFAULTS.VELOCITY_DEFAULT;
  const cannonHeight =
    physics?.cannonHeight ??
    cfg?.cannonHeight ??
    PHYSICS_DEFAULTS.CANNON_HEIGHT_DEFAULT;
  const targetDistance =
    physics?.targetDistance ??
    cfg?.targetDistance ??
    PHYSICS_DEFAULTS.TARGET_DISTANCE_DEFAULT;
  const targetRadius =
    physics?.targetRadius ?? PHYSICS_DEFAULTS.TARGET_RADIUS_DEFAULT;

  return {
    initial: {
      angle: angleDefault,
      velocity: velocityDefault,
      cannonHeight,
      cannonX: 0,
      targetDistance,
      targetRadius,
      gravity: PHYSICS_DEFAULTS.GRAVITY,
    },
    ranges: {
      angleMin: physics?.angleMin ?? PHYSICS_DEFAULTS.ANGLE_MIN,
      angleMax: physics?.angleMax ?? PHYSICS_DEFAULTS.ANGLE_MAX,
      velocityMin: physics?.velocityMin ?? PHYSICS_DEFAULTS.VELOCITY_MIN,
      velocityMax: physics?.velocityMax ?? PHYSICS_DEFAULTS.VELOCITY_MAX,
      cannonHeightMin: PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN,
      cannonHeightMax: PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX,
      cannonXMin: 0,
      cannonXMax: Math.max(20, targetDistance - 5),
    },
  };
}

const SimuladorTiroParabolico = ({ scenario }: SimuladorTiroParabolicoProps) => {
  const config = useMemo(() => resolveConfig(scenario), [scenario]);
  const [settings, setSettings] = useState<SimSettings>(config.initial);
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);
  const [musicOn, setMusicOn] = useState(false);
  const [fireSignal, setFireSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [canFire, setCanFire] = useState(true);
  const lastResultRef = useRef<{ hit: boolean; points: number } | null>(null);

  useEffect(() => {
    setSettings(config.initial);
  }, [config]);

  useEffect(
    () => () => {
      stopMusic();
    },
    []
  );

  const handleLaunch = () => {
    if (!canFire) return;
    unlockAudio();
    setCanFire(false);
    setFireSignal((n) => n + 1);
  };

  const handleReset = () => {
    setResetSignal((n) => n + 1);
    setCanFire(true);
  };

  const handleResetScore = () => {
    setScore(INITIAL_SCORE);
    setResetSignal((n) => n + 1);
    setCanFire(true);
  };

  const handleResult = (result: {
    hit: boolean;
    points: number;
    distance: number;
  }) => {
    if (lastResultRef.current === result) return;
    lastResultRef.current = result;
    setScore((s) => {
      const shots = s.shots + 1;
      if (result.hit) {
        const streak = s.streak + 1;
        const bonus = streak >= 3 ? 25 : 0;
        return {
          shots,
          hits: s.hits + 1,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          points: s.points + result.points + bonus,
        };
      }
      return {
        ...s,
        shots,
        streak: 0,
      };
    });
    window.setTimeout(() => setCanFire(true), 950);
  };

  const handleToggleMusic = () => {
    unlockAudio();
    if (isMusicPlaying()) {
      stopMusic();
      setMusicOn(false);
    } else {
      startMusic();
      setMusicOn(true);
    }
  };

  const handleSettingsChange = (next: SimSettings) => {
    const clamped: SimSettings = {
      ...next,
      angle: Math.max(
        config.ranges.angleMin,
        Math.min(config.ranges.angleMax, next.angle)
      ),
      velocity: Math.max(
        config.ranges.velocityMin,
        Math.min(config.ranges.velocityMax, next.velocity)
      ),
      cannonHeight: Math.max(
        config.ranges.cannonHeightMin,
        Math.min(config.ranges.cannonHeightMax, next.cannonHeight)
      ),
      cannonX: Math.max(
        config.ranges.cannonXMin,
        Math.min(config.ranges.cannonXMax, next.cannonX)
      ),
    };
    setSettings(clamped);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-200 rounded-lg p-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold truncate">
            {scenario?.nombre ?? "Simulador de Tiro Parabólico"}
          </h2>
          <p className="text-sm opacity-70 mt-1">
            {scenario?.descripcion ??
              "Arrastra el cañón como una resortera o ajusta los controles para impactar el blanco."}
          </p>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleResetScore}
          type="button"
        >
          Reiniciar puntaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GameCanvas
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onResult={handleResult}
            fireSignal={fireSignal}
            resetSignal={resetSignal}
          />
        </div>
        <div className="lg:col-span-1">
          <ControlPanel
            scenario={scenario}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onLaunch={handleLaunch}
            onReset={handleReset}
            score={score}
            musicOn={musicOn}
            onToggleMusic={handleToggleMusic}
            canFire={canFire}
            ranges={config.ranges}
          />
        </div>
      </div>
    </div>
  );
};

export default SimuladorTiroParabolico;
