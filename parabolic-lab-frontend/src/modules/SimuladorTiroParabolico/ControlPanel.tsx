"use client";

import { Button } from "amvasdev-ui";
import clsx from "clsx";
import {
  Lightbulb,
  Lock,
  Music,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  VolumeX,
  Wand2,
  Zap,
} from "lucide-react";
import AssetPreview from "./AssetPreview";
import type { ContextualHint } from "./physics";
import type { ScoreState, SimSettings } from "./types";
import {
  CANNON_ASSET_KEYS,
  CANNON_LABELS,
  PROJECTILE_ASSET_KEYS,
  PROJECTILE_LABELS,
  TARGET_ASSET_KEYS,
  TARGET_LABELS,
  type CannonAssetKey,
  type ProjectileAssetKey,
  type TargetAssetKey,
} from "@/constants/simulatorAssets";
import {
  BACKGROUND_ASSET_KEYS,
  BACKGROUND_LABELS,
  BACKGROUND_THEMES,
  type BackgroundAssetKey,
} from "@/constants/simulatorBackgrounds";
import {
  MUSIC_TRACK_KEYS,
  MUSIC_TRACK_LABELS,
  PLAYBACK_SPEEDS,
  type MusicTrackKey,
  type PlaybackSpeed,
} from "@/constants/simulatorPlayback";
import { Scenario } from "@/models/scenario";

interface ControlPanelRanges {
  angleMin: number;
  angleMax: number;
  velocityMin: number;
  velocityMax: number;
  cannonHeightMin: number;
  cannonHeightMax: number;
  cannonXMin: number;
  cannonXMax: number;
}

interface ControlPanelLocks {
  angle: boolean;
  velocity: boolean;
  cannonHeight: boolean;
  cannonX: boolean;
}

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
  musicTrack: MusicTrackKey;
  onMusicTrackChange: (track: MusicTrackKey) => void;
  canFire: boolean;
  ranges: ControlPanelRanges;
  locks: ControlPanelLocks;
  intentosRestantes: number | null;
  paused: boolean;
  onTogglePause: () => void;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  cannonAsset: CannonAssetKey;
  projectileAsset: ProjectileAssetKey;
  targetAsset: TargetAssetKey;
  backgroundAsset: BackgroundAssetKey;
  onCannonAssetChange: (key: CannonAssetKey) => void;
  onProjectileAssetChange: (key: ProjectileAssetKey) => void;
  onTargetAssetChange: (key: TargetAssetKey) => void;
  onBackgroundAssetChange: (key: BackgroundAssetKey) => void;
  onResetAssetsToTeacherDefault: () => void;
  isAssetOverridden: boolean;
  hint: ContextualHint | null;
  bestAutoScore: number | null;
  lastAutoScore: number | null;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  accent: string;
  locked?: boolean;
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
  locked,
  onChange,
}: SliderProps) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-semibold flex items-center gap-1">
        {label}
        {locked ? (
          <span
            className="tooltip tooltip-right"
            data-tip="Rango definido por el docente"
          >
            <Lock className="w-3 h-3 text-warning" />
          </span>
        ) : null}
      </label>
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
      className={clsx("range", accent)}
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

interface AssetSelectorRowProps<K extends string> {
  label: string;
  kind: "cannon" | "projectile" | "target";
  keys: readonly K[];
  labels: Record<K, string>;
  value: K;
  onChange: (k: K) => void;
}

const AssetSelectorRow = <K extends string>({
  label,
  kind,
  keys,
  labels,
  value,
  onChange,
}: AssetSelectorRowProps<K>) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase opacity-60 font-semibold">
      {label}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {keys.map((k) => {
        const selected = k === value;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={clsx(
              "rounded-md border-2 p-1 transition flex flex-col items-center gap-0.5",
              selected
                ? "border-primary bg-primary/10"
                : "border-base-300 hover:border-base-content/30"
            )}
            title={labels[k]}
          >
            <AssetPreview kind={kind} assetKey={k} size={42} />
            <span className="text-[9px] font-medium leading-tight">
              {labels[k]}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const BackgroundSelectorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BackgroundAssetKey;
  onChange: (k: BackgroundAssetKey) => void;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase opacity-60 font-semibold">
      {label}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {BACKGROUND_ASSET_KEYS.map((k) => {
        const selected = k === value;
        const theme = BACKGROUND_THEMES[k];
        return (
          <Button
            key={k}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(k)}
            className={clsx(
              "!h-auto min-h-0 rounded-md border-2 p-1 transition flex flex-col items-center gap-0.5",
              selected
                ? "border-primary bg-primary/10"
                : "border-base-300 hover:border-base-content/30"
            )}
            title={BACKGROUND_LABELS[k]}
          >
            <span
              className="block w-[42px] h-[42px] rounded"
              style={{
                background: `linear-gradient(to bottom, ${theme.sky[0]}, ${theme.sky[1]} 45%, ${theme.sky[2]} 62%, ${theme.ground[0]} 62%, ${theme.ground[1]} 80%, ${theme.ground[2]})`,
              }}
            />
            <span className="text-[9px] font-medium leading-tight">
              {BACKGROUND_LABELS[k]}
            </span>
          </Button>
        );
      })}
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
  musicTrack,
  onMusicTrackChange,
  canFire,
  ranges,
  locks,
  intentosRestantes,
  paused,
  onTogglePause,
  speed,
  onSpeedChange,
  cannonAsset,
  projectileAsset,
  targetAsset,
  backgroundAsset,
  onCannonAssetChange,
  onProjectileAssetChange,
  onTargetAssetChange,
  onBackgroundAssetChange,
  onResetAssetsToTeacherDefault,
  isAssetOverridden,
  hint,
  bestAutoScore,
  lastAutoScore,
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
          <div className="text-[10px] opacity-60">Auto-score</div>
          <div className="text-lg font-bold tabular-nums text-primary">
            {bestAutoScore !== null ? Math.round(bestAutoScore) : "—"}
          </div>
          <div className="text-[10px] opacity-60">
            {lastAutoScore !== null
              ? `último ${Math.round(lastAutoScore)}`
              : "mejor disparo"}
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

      {hint ? (
        <div className="bg-info/10 border border-info/30 rounded-lg p-2 flex gap-2 items-start">
          <Lightbulb className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p className="text-xs leading-snug">{hint.message}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Slider
          label="Ángulo"
          value={settings.angle}
          min={ranges.angleMin}
          max={ranges.angleMax}
          unit="°"
          accent="range-primary"
          locked={locks.angle}
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
          locked={locks.velocity}
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
          locked={locks.cannonHeight}
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
          locked={locks.cannonX}
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
            variant={paused ? "warning" : "ghost"}
            className="gap-1"
            size="sm"
            onClick={onTogglePause}
          >
            {paused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            {paused ? "Reanudar" : "Pausa"}
          </Button>
          <Button
            variant="ghost"
            className="gap-1"
            size="sm"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <div>
          <div className="text-[10px] uppercase opacity-60 font-semibold mb-1">
            Velocidad de reproducción
          </div>
          <div className="grid grid-cols-4 gap-1">
            {PLAYBACK_SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={clsx(
                  "btn btn-xs",
                  s === speed ? "btn-primary" : "btn-ghost"
                )}
                onClick={() => onSpeedChange(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase opacity-60 font-semibold">
            Música
          </span>
          <Button
            variant={musicOn ? "primary" : "ghost"}
            size="xs"
            className="gap-1"
            onClick={onToggleMusic}
          >
            {musicOn ? (
              <Music className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
            {musicOn ? "Sonando" : "Mute"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {MUSIC_TRACK_KEYS.map((t) => (
            <button
              key={t}
              type="button"
              className={clsx(
                "btn btn-xs",
                t === musicTrack ? "btn-secondary" : "btn-ghost"
              )}
              onClick={() => onMusicTrackChange(t)}
            >
              {MUSIC_TRACK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <details className="bg-base-100 rounded-lg">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-secondary" />
          Personalizar visuales
        </summary>
        <div className="px-3 pb-3 flex flex-col gap-2">
          <AssetSelectorRow
            label="Cañón"
            kind="cannon"
            keys={CANNON_ASSET_KEYS}
            labels={CANNON_LABELS}
            value={cannonAsset}
            onChange={onCannonAssetChange}
          />
          <AssetSelectorRow
            label="Proyectil"
            kind="projectile"
            keys={PROJECTILE_ASSET_KEYS}
            labels={PROJECTILE_LABELS}
            value={projectileAsset}
            onChange={onProjectileAssetChange}
          />
          <AssetSelectorRow
            label="Blanco"
            kind="target"
            keys={TARGET_ASSET_KEYS}
            labels={TARGET_LABELS}
            value={targetAsset}
            onChange={onTargetAssetChange}
          />
          <BackgroundSelectorRow
            label="Fondo"
            value={backgroundAsset}
            onChange={onBackgroundAssetChange}
          />
          {isAssetOverridden ? (
            <button
              type="button"
              className="btn btn-xs btn-ghost gap-1 self-start"
              onClick={onResetAssetsToTeacherDefault}
            >
              <RotateCcw className="w-3 h-3" />
              Volver al default del docente
            </button>
          ) : null}
        </div>
      </details>
    </div>
  );
};

export default ControlPanel;
