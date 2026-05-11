"use client";

import { Button } from "amvasdev-ui";
import { Music, RotateCcw, Trash2, VolumeX, Zap } from "lucide-react";
import type { ScoreState, SimSettings } from "./types";
import { Scenario } from "@/models/scenario";

interface ControlPanelProps {
  scenario?: Scenario;
  settings: SimSettings;
  onSettingsChange: (next: SimSettings) => void;
  onLaunch: () => void;
  onReset: () => void;
  onResetScore: () => void;
  score: ScoreState;
  musicOn: boolean;
  onToggleMusic: () => void;
  canFire: boolean;
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
  intentosRestantes: number | null;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  accent: string;
  onChange: (n: number) => void;
}

const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  accent,
  onChange,
}: SliderProps) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-semibold">{label}</label>
      <div className="bg-base-100 px-2 py-0.5 rounded font-mono font-bold text-sm tabular-nums min-w-[68px] text-center">
        {value}
        {unit}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`range ${accent}`}
    />
    <div className="flex justify-between text-[10px] opacity-50 mt-0.5">
      <span>
        {min}
        {unit}
      </span>
      <span>
        {max}
        {unit}
      </span>
    </div>
  </div>
);

const ControlPanel = ({
  settings,
  onSettingsChange,
  onLaunch,
  onReset,
  onResetScore,
  score,
  musicOn,
  onToggleMusic,
  canFire,
  ranges,
  intentosRestantes,
}: ControlPanelProps) => {
  const accuracy =
    score.shots === 0 ? 0 : Math.round((score.hits / score.shots) * 100);

  const set = <K extends keyof SimSettings>(k: K, v: SimSettings[K]) =>
    onSettingsChange({ ...settings, [k]: v });

  return (
    <div className="bg-base-200 rounded-lg p-4 md:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Controles</h3>
        <button
          className="btn btn-xs btn-ghost gap-1"
          onClick={onResetScore}
          type="button"
        >
          <Trash2 className="w-3 h-3" />
          Puntaje
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-base-100 rounded-lg p-2 text-center">
          <div className="text-[10px] opacity-60">Puntos</div>
          <div className="text-lg font-bold tabular-nums text-primary">
            {score.points}
          </div>
        </div>
        <div className="bg-base-100 rounded-lg p-2 text-center">
          <div className="text-[10px] opacity-60">Aciertos</div>
          <div className="text-lg font-bold tabular-nums">
            {score.hits}/{score.shots}
          </div>
          <div className="text-[10px] opacity-60">{accuracy}%</div>
        </div>
        <div className="bg-base-100 rounded-lg p-2 text-center">
          <div className="text-[10px] opacity-60">Racha</div>
          <div className="text-lg font-bold tabular-nums text-warning">
            {score.streak}
          </div>
          <div className="text-[10px] opacity-60">máx {score.bestStreak}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Slider
          label="Ángulo"
          value={settings.angle}
          min={ranges.angleMin}
          max={ranges.angleMax}
          unit="°"
          accent="range-primary"
          onChange={(n) => set("angle", n)}
        />
        <Slider
          label="Velocidad inicial"
          value={settings.velocity}
          min={ranges.velocityMin}
          max={ranges.velocityMax}
          step={0.5}
          unit=" m/s"
          accent="range-secondary"
          onChange={(n) => set("velocity", n)}
        />
        <Slider
          label="Altura del cañón"
          value={settings.cannonHeight}
          min={ranges.cannonHeightMin}
          max={ranges.cannonHeightMax}
          step={0.5}
          unit=" m"
          accent="range-accent"
          onChange={(n) => set("cannonHeight", n)}
        />
        <Slider
          label="Posición horizontal"
          value={settings.cannonX}
          min={ranges.cannonXMin}
          max={ranges.cannonXMax}
          step={0.5}
          unit=" m"
          accent="range-info"
          onChange={(n) => set("cannonX", n)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          className="w-full gap-2"
          size="lg"
          onClick={onLaunch}
          disabled={!canFire}
        >
          <Zap className="w-5 h-5" />
          {intentosRestantes !== null
            ? `Lanzar (${intentosRestantes} restantes)`
            : "Lanzar"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            className="gap-1"
            size="sm"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant={musicOn ? "primary" : "ghost"}
            className="gap-1"
            size="sm"
            onClick={onToggleMusic}
          >
            {musicOn ? (
              <Music className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            {musicOn ? "Música" : "Mute"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
