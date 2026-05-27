"use client";

import { Input } from "amvasdev-ui";
import clsx from "clsx";
import { Layers } from "lucide-react";
import AssetPreview from "@/modules/SimuladorTiroParabolico/AssetPreview";
import {
  CANNON_ASSET_KEYS,
  CANNON_LABELS,
  DEFAULT_ASSETS,
  PROJECTILE_ASSET_KEYS,
  PROJECTILE_LABELS,
  TARGET_ASSET_KEYS,
  TARGET_LABELS,
  type CannonAssetKey,
  type ProjectileAssetKey,
  type TargetAssetKey,
} from "@/constants/simulatorAssets";

interface ScenarioAssetsBuilderProps {
  cannon: CannonAssetKey;
  projectile: ProjectileAssetKey;
  target: TargetAssetKey;
  orden: number;
  onChange: (next: {
    cannon: CannonAssetKey;
    projectile: ProjectileAssetKey;
    target: TargetAssetKey;
    orden: number;
  }) => void;
}

interface PickerProps<K extends string> {
  label: string;
  kind: "cannon" | "projectile" | "target";
  keys: readonly K[];
  labels: Record<K, string>;
  value: K;
  onChange: (k: K) => void;
}

const Picker = <K extends string>({
  label,
  kind,
  keys,
  labels,
  value,
  onChange,
}: PickerProps<K>) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-semibold">{label}</span>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {keys.map((k) => {
        const selected = k === value;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={clsx(
              "rounded-lg border-2 p-2 transition flex flex-col items-center gap-1",
              selected
                ? "border-primary bg-primary/10"
                : "border-base-300 hover:border-base-content/30"
            )}
          >
            <AssetPreview kind={kind} assetKey={k} size={64} />
            <span className="text-xs font-medium leading-tight text-center">
              {labels[k]}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const ScenarioAssetsBuilder = ({
  cannon,
  projectile,
  target,
  orden,
  onChange,
}: ScenarioAssetsBuilderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Visuales y progresión
        </h3>
        <p className="text-sm opacity-70">
          Elige los visuales que verá el alumno por defecto y define la posición
          de este escenario dentro de su nivel de dificultad.
        </p>
      </div>

      <Picker
        label="Cañón"
        kind="cannon"
        keys={CANNON_ASSET_KEYS}
        labels={CANNON_LABELS}
        value={cannon || DEFAULT_ASSETS.cannon}
        onChange={(c) =>
          onChange({ cannon: c, projectile, target, orden })
        }
      />
      <Picker
        label="Proyectil"
        kind="projectile"
        keys={PROJECTILE_ASSET_KEYS}
        labels={PROJECTILE_LABELS}
        value={projectile || DEFAULT_ASSETS.projectile}
        onChange={(p) =>
          onChange({ cannon, projectile: p, target, orden })
        }
      />
      <Picker
        label="Blanco"
        kind="target"
        keys={TARGET_ASSET_KEYS}
        labels={TARGET_LABELS}
        value={target || DEFAULT_ASSETS.target}
        onChange={(t) =>
          onChange({ cannon, projectile, target: t, orden })
        }
      />

      <div>
        <label className="label" htmlFor="orden">
          <span className="label-text font-semibold">
            Orden dentro del nivel de dificultad
          </span>
        </label>
        <Input
          id="orden"
          type="number"
          min={0}
          step={1}
          value={orden}
          placeholder="1"
          onChange={(e) =>
            onChange({
              cannon,
              projectile,
              target,
              orden: parseInt(e.currentTarget.value, 10) || 0,
            })
          }
        />
        <label className="label">
          <span className="label-text-alt opacity-70">
            Los alumnos desbloquean este escenario al completar el anterior con
            el mismo nivel de dificultad.
          </span>
        </label>
      </div>
    </div>
  );
};

export default ScenarioAssetsBuilder;
