"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isMusicPlaying,
  setMusicTrack as setAudioTrack,
  startMusic,
  stopMusic,
  unlockAudio,
} from "./audio";
import ControlPanel from "./ControlPanel";
import GameCanvas from "./GameCanvas";
import {
  computeContextualHint,
  type ContextualHint,
} from "./physics";
import ProblemPanel from "./ProblemPanel";
import ResolucionPanel from "./ResolucionPanel";
import TrajectoryHUD from "./TrajectoryHUD";
import type {
  ScoreState,
  ShotOutcome,
  SimSettings,
  TrajectoryMetrics,
} from "./types";
import { PHYSICS_DEFAULTS } from "@/constants/physicsDefaults";
import {
  DEFAULT_ASSETS,
  CANNON_ASSET_KEYS,
  PROJECTILE_ASSET_KEYS,
  TARGET_ASSET_KEYS,
  type CannonAssetKey,
  type ProjectileAssetKey,
  type TargetAssetKey,
} from "@/constants/simulatorAssets";
import {
  BACKGROUND_ASSET_KEYS,
  DEFAULT_BACKGROUND,
  type BackgroundAssetKey,
} from "@/constants/simulatorBackgrounds";
import {
  DEFAULT_MUSIC_TRACK,
  DEFAULT_PLAYBACK_SPEED,
  MUSIC_TRACK_KEYS,
  type MusicTrackKey,
  type PlaybackSpeed,
} from "@/constants/simulatorPlayback";
import { Scenario } from "@/models/scenario";
import type { Disparo, ResolucionAlumno } from "@/types/datosInteraccion";
import type {
  AssetSelection,
  ParameterLock,
  PhysicsConfig,
} from "@/types/physicsConfig";

interface SimuladorTiroParabolicoProps {
  scenario?: Scenario;
  resolucion?: ResolucionAlumno;
  onResolucionChange?: (next: ResolucionAlumno) => void;
  onDisparo?: (disparo: Disparo) => void;
  onScoreChange?: (score: ScoreState) => void;
  onAutoScoreChange?: (best: number) => void;
  onShotOutcome?: (outcome: ShotOutcome) => void;
  onTiempoAgotado?: () => void;
  startTime?: number;
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
  locks: {
    angle: boolean;
    velocity: boolean;
    cannonHeight: boolean;
    cannonX: boolean;
  };
  teacherAssets: {
    cannon: CannonAssetKey;
    projectile: ProjectileAssetKey;
    target: TargetAssetKey;
    background: BackgroundAssetKey;
  };
}

function clampInto(range: ParameterLock | undefined, value: number, fallbackMin: number, fallbackMax: number) {
  const min = range?.enabled ? range.min : fallbackMin;
  const max = range?.enabled ? range.max : fallbackMax;
  return { min, max, locked: Boolean(range?.enabled) };
}

function resolveConfig(scenario?: Scenario): ResolvedConfig {
  const cfg = scenario?.configuracionescenario as
    | {
        physics?: Partial<PhysicsConfig>;
        assets?: Partial<AssetSelection>;
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

  const locks = physics?.locks;
  const angleRange = clampInto(
    locks?.angle,
    angleDefault,
    physics?.angleMin ?? PHYSICS_DEFAULTS.ANGLE_MIN,
    physics?.angleMax ?? PHYSICS_DEFAULTS.ANGLE_MAX
  );
  const velocityRange = clampInto(
    locks?.velocity,
    velocityDefault,
    physics?.velocityMin ?? PHYSICS_DEFAULTS.VELOCITY_MIN,
    physics?.velocityMax ?? PHYSICS_DEFAULTS.VELOCITY_MAX
  );
  const cannonHeightRange = clampInto(
    locks?.cannonHeight,
    cannonHeight,
    PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN,
    PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX
  );
  const cannonXRange = clampInto(
    locks?.cannonX,
    0,
    0,
    Math.max(20, targetDistance - 5)
  );

  const teacherAssets = {
    cannon:
      (cfg?.assets?.cannon as CannonAssetKey | undefined) &&
      CANNON_ASSET_KEYS.includes(cfg!.assets!.cannon as CannonAssetKey)
        ? (cfg!.assets!.cannon as CannonAssetKey)
        : DEFAULT_ASSETS.cannon,
    projectile:
      (cfg?.assets?.projectile as ProjectileAssetKey | undefined) &&
      PROJECTILE_ASSET_KEYS.includes(
        cfg!.assets!.projectile as ProjectileAssetKey
      )
        ? (cfg!.assets!.projectile as ProjectileAssetKey)
        : DEFAULT_ASSETS.projectile,
    target:
      (cfg?.assets?.target as TargetAssetKey | undefined) &&
      TARGET_ASSET_KEYS.includes(cfg!.assets!.target as TargetAssetKey)
        ? (cfg!.assets!.target as TargetAssetKey)
        : DEFAULT_ASSETS.target,
    background:
      (cfg?.assets?.background as BackgroundAssetKey | undefined) &&
      BACKGROUND_ASSET_KEYS.includes(cfg!.assets!.background as BackgroundAssetKey)
        ? (cfg!.assets!.background as BackgroundAssetKey)
        : DEFAULT_BACKGROUND,
  };

  return {
    initial: {
      angle: Math.min(angleRange.max, Math.max(angleRange.min, angleDefault)),
      velocity: Math.min(
        velocityRange.max,
        Math.max(velocityRange.min, velocityDefault)
      ),
      cannonHeight: Math.min(
        cannonHeightRange.max,
        Math.max(cannonHeightRange.min, cannonHeight)
      ),
      cannonX: Math.min(cannonXRange.max, Math.max(cannonXRange.min, 0)),
      targetDistance,
      targetRadius,
      gravity: PHYSICS_DEFAULTS.GRAVITY,
    },
    ranges: {
      angleMin: angleRange.min,
      angleMax: angleRange.max,
      velocityMin: velocityRange.min,
      velocityMax: velocityRange.max,
      cannonHeightMin: cannonHeightRange.min,
      cannonHeightMax: cannonHeightRange.max,
      cannonXMin: cannonXRange.min,
      cannonXMax: cannonXRange.max,
    },
    locks: {
      angle: angleRange.locked,
      velocity: velocityRange.locked,
      cannonHeight: cannonHeightRange.locked,
      cannonX: cannonXRange.locked,
    },
    teacherAssets,
  };
}

const ASSET_OVERRIDE_PREFIX = "parabolic-lab.assets.";

function loadAssetOverride(idescenario?: string): Partial<{
  cannon: CannonAssetKey;
  projectile: ProjectileAssetKey;
  target: TargetAssetKey;
  background: BackgroundAssetKey;
}> {
  if (typeof window === "undefined" || !idescenario) return {};
  try {
    const raw = window.localStorage.getItem(`${ASSET_OVERRIDE_PREFIX}${idescenario}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      cannon: CANNON_ASSET_KEYS.includes(parsed.cannon) ? parsed.cannon : undefined,
      projectile: PROJECTILE_ASSET_KEYS.includes(parsed.projectile)
        ? parsed.projectile
        : undefined,
      target: TARGET_ASSET_KEYS.includes(parsed.target) ? parsed.target : undefined,
      background: BACKGROUND_ASSET_KEYS.includes(parsed.background)
        ? parsed.background
        : undefined,
    };
  } catch {
    return {};
  }
}

function saveAssetOverride(
  idescenario: string | undefined,
  override: {
    cannon: CannonAssetKey;
    projectile: ProjectileAssetKey;
    target: TargetAssetKey;
    background: BackgroundAssetKey;
  }
) {
  if (typeof window === "undefined" || !idescenario) return;
  window.localStorage.setItem(
    `${ASSET_OVERRIDE_PREFIX}${idescenario}`,
    JSON.stringify(override)
  );
}

function clearAssetOverride(idescenario: string | undefined) {
  if (typeof window === "undefined" || !idescenario) return;
  window.localStorage.removeItem(`${ASSET_OVERRIDE_PREFIX}${idescenario}`);
}

const SimuladorTiroParabolico = ({
  scenario,
  resolucion,
  onResolucionChange,
  onDisparo,
  onScoreChange,
  onAutoScoreChange,
  onShotOutcome,
  onTiempoAgotado,
  startTime,
}: SimuladorTiroParabolicoProps) => {
  const config = useMemo(() => resolveConfig(scenario), [scenario]);
  const [settings, setSettings] = useState<SimSettings>(config.initial);
  const [score, setScore] = useState<ScoreState>(INITIAL_SCORE);
  const [musicOn, setMusicOn] = useState(false);
  const [musicTrack, setMusicTrackState] = useState<MusicTrackKey>(
    DEFAULT_MUSIC_TRACK
  );
  const [fireSignal, setFireSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [canFire, setCanFire] = useState(true);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(DEFAULT_PLAYBACK_SPEED);
  const [metrics, setMetrics] = useState<TrajectoryMetrics | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const [hint, setHint] = useState<ContextualHint | null>(null);
  const [lastAutoScore, setLastAutoScore] = useState<number | null>(null);
  const [bestAutoScore, setBestAutoScore] = useState<number | null>(null);

  const overrideRef = useRef<ReturnType<typeof loadAssetOverride>>({});
  const [overrideVersion, setOverrideVersion] = useState(0);

  useEffect(() => {
    overrideRef.current = loadAssetOverride(scenario?.idescenario);
    setOverrideVersion((v) => v + 1);
  }, [scenario?.idescenario]);

  const effectiveAssets = useMemo(() => {
    void overrideVersion;
    return {
      cannon: overrideRef.current.cannon ?? config.teacherAssets.cannon,
      projectile:
        overrideRef.current.projectile ?? config.teacherAssets.projectile,
      target: overrideRef.current.target ?? config.teacherAssets.target,
      background:
        overrideRef.current.background ?? config.teacherAssets.background,
    };
  }, [config.teacherAssets, overrideVersion]);

  const isAssetOverridden = useMemo(() => {
    void overrideVersion;
    const o = overrideRef.current;
    return Boolean(o.cannon || o.projectile || o.target || o.background);
  }, [overrideVersion]);

  const lastResultRef = useRef<ShotOutcome | null>(null);
  const onDisparoRef = useRef(onDisparo);
  const onScoreChangeRef = useRef(onScoreChange);
  const onAutoScoreChangeRef = useRef(onAutoScoreChange);
  const onShotOutcomeRef = useRef(onShotOutcome);
  const settingsAtLaunchRef = useRef<SimSettings>(settings);

  const intentos = scenario?.intentospermitidos ?? null;
  const sinIntentos = intentos !== null && score.shots >= intentos;
  const internalStartTime = useRef<number>(startTime ?? Date.now());

  useEffect(() => {
    onDisparoRef.current = onDisparo;
  }, [onDisparo]);
  useEffect(() => {
    onScoreChangeRef.current = onScoreChange;
  }, [onScoreChange]);
  useEffect(() => {
    onAutoScoreChangeRef.current = onAutoScoreChange;
  }, [onAutoScoreChange]);
  useEffect(() => {
    onShotOutcomeRef.current = onShotOutcome;
  }, [onShotOutcome]);

  useEffect(() => {
    setSettings(config.initial);
    setHint(null);
    setMetrics(null);
    setLastAutoScore(null);
    setBestAutoScore(null);
  }, [config]);

  useEffect(
    () => () => {
      stopMusic();
    },
    []
  );

  useEffect(() => {
    onScoreChangeRef.current?.(score);
  }, [score]);

  const handleLaunch = () => {
    if (!canFire || sinIntentos) return;
    unlockAudio();
    settingsAtLaunchRef.current = settings;
    setCanFire(false);
    setPaused(false);
    setInFlight(true);
    setFireSignal((n) => n + 1);
  };

  const handleReset = () => {
    setResetSignal((n) => n + 1);
    setCanFire(true);
    setPaused(false);
    setMetrics(null);
    setInFlight(false);
  };

  const handleResetScore = () => {
    setScore(INITIAL_SCORE);
    setResetSignal((n) => n + 1);
    setCanFire(true);
    setPaused(false);
    setMetrics(null);
    setInFlight(false);
    setHint(null);
    setLastAutoScore(null);
    setBestAutoScore(null);
  };

  const handleResult = useCallback((result: ShotOutcome) => {
    if (lastResultRef.current === result) return;
    lastResultRef.current = result;

    const fired = settingsAtLaunchRef.current;
    setInFlight(false);
    const newHint = computeContextualHint(
      result.landingX,
      result.landingY,
      fired,
      result.hit
    );
    setHint(newHint);
    setLastAutoScore(result.autoScore);
    setBestAutoScore((prev) => {
      const next = prev === null ? result.autoScore : Math.max(prev, result.autoScore);
      onAutoScoreChangeRef.current?.(next);
      return next;
    });

    setScore((s) => {
      const shotsNew = s.shots + 1;
      let next: ScoreState;
      if (result.hit) {
        const streak = s.streak + 1;
        const bonus = streak >= 3 ? 25 : 0;
        next = {
          shots: shotsNew,
          hits: s.hits + 1,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          points: s.points + Math.round(result.autoScore) + bonus,
        };
      } else {
        next = {
          ...s,
          shots: shotsNew,
          streak: 0,
          points: s.points + Math.round(result.autoScore * 0.3),
        };
      }

      onDisparoRef.current?.({
        n: shotsNew,
        angle: fired.angle,
        velocity: fired.velocity,
        cannonHeight: fired.cannonHeight,
        cannonX: fired.cannonX,
        hit: result.hit,
        distance: result.distance,
        points: Math.round(result.autoScore),
        timestamp: new Date().toISOString(),
      });

      return next;
    });
    onShotOutcomeRef.current?.(result);
    window.setTimeout(() => setCanFire(true), 950);
  }, []);

  const handleToggleMusic = () => {
    unlockAudio();
    if (isMusicPlaying()) {
      stopMusic();
      setMusicOn(false);
    } else {
      startMusic(musicTrack);
      setMusicOn(true);
    }
  };

  const handleMusicTrackChange = (track: MusicTrackKey) => {
    if (!MUSIC_TRACK_KEYS.includes(track)) return;
    setMusicTrackState(track);
    setAudioTrack(track);
  };

  const handleSettingsChange = useCallback(
    (next: SimSettings) => {
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
    },
    [config.ranges]
  );

  const handleMetricsUpdate = useCallback((m: TrajectoryMetrics | null) => {
    setMetrics(m);
  }, []);

  const updateOverride = (
    patch: Partial<{
      cannon: CannonAssetKey;
      projectile: ProjectileAssetKey;
      target: TargetAssetKey;
      background: BackgroundAssetKey;
    }>
  ) => {
    overrideRef.current = { ...overrideRef.current, ...patch };
    const merged = {
      cannon: overrideRef.current.cannon ?? config.teacherAssets.cannon,
      projectile:
        overrideRef.current.projectile ?? config.teacherAssets.projectile,
      target: overrideRef.current.target ?? config.teacherAssets.target,
      background:
        overrideRef.current.background ?? config.teacherAssets.background,
    };
    saveAssetOverride(scenario?.idescenario, merged);
    setOverrideVersion((v) => v + 1);
  };

  const handleResetAssets = () => {
    overrideRef.current = {};
    clearAssetOverride(scenario?.idescenario);
    setOverrideVersion((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      {scenario ? (
        <ProblemPanel
          scenario={scenario}
          intentosUsados={score.shots}
          startTime={startTime ?? internalStartTime.current}
          onTiempoAgotado={onTiempoAgotado}
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <GameCanvas
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onResult={handleResult}
            onMetricsUpdate={handleMetricsUpdate}
            fireSignal={fireSignal}
            resetSignal={resetSignal}
            paused={paused}
            speedMultiplier={speed}
            cannonAsset={effectiveAssets.cannon}
            projectileAsset={effectiveAssets.projectile}
            targetAsset={effectiveAssets.target}
            backgroundAsset={effectiveAssets.background}
          />
          <TrajectoryHUD metrics={metrics} inFlight={inFlight} />
          {sinIntentos ? (
            <div className="alert alert-warning">
              <span>
                Has usado tus {intentos} intentos. Revisa tu solución y termina
                la actividad cuando estés listo.
              </span>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-1">
          <ControlPanel
            scenario={scenario}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onLaunch={handleLaunch}
            onReset={handleReset}
            onResetScore={handleResetScore}
            score={score}
            musicOn={musicOn}
            onToggleMusic={handleToggleMusic}
            musicTrack={musicTrack}
            onMusicTrackChange={handleMusicTrackChange}
            canFire={canFire && !sinIntentos}
            ranges={config.ranges}
            locks={config.locks}
            intentosRestantes={
              intentos !== null ? Math.max(0, intentos - score.shots) : null
            }
            paused={paused}
            onTogglePause={() => setPaused((p) => !p)}
            speed={speed}
            onSpeedChange={setSpeed}
            cannonAsset={effectiveAssets.cannon}
            projectileAsset={effectiveAssets.projectile}
            targetAsset={effectiveAssets.target}
            backgroundAsset={effectiveAssets.background}
            onCannonAssetChange={(k) => updateOverride({ cannon: k })}
            onProjectileAssetChange={(k) => updateOverride({ projectile: k })}
            onTargetAssetChange={(k) => updateOverride({ target: k })}
            onBackgroundAssetChange={(k) => updateOverride({ background: k })}
            onResetAssetsToTeacherDefault={handleResetAssets}
            isAssetOverridden={isAssetOverridden}
            hint={hint}
            bestAutoScore={bestAutoScore}
            lastAutoScore={lastAutoScore}
          />
        </div>
      </div>

      {resolucion && onResolucionChange ? (
        <ResolucionPanel
          resolucion={resolucion}
          onChange={onResolucionChange}
        />
      ) : null}
    </div>
  );
};

export default SimuladorTiroParabolico;
