"use client";

import { Input } from "amvasdev-ui";
import { Lock, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PHYSICS_DEFAULTS } from "@/constants/physicsDefaults";
import type { ParameterLock, PhysicsConfig, PhysicsLocks } from "@/types/physicsConfig";

interface PhysicsConfigBuilderProps {
  config: PhysicsConfig;
  onChange: (config: PhysicsConfig) => void;
}

type LockKey = keyof PhysicsLocks;

const DEFAULT_LOCK_VALUES: Record<LockKey, ParameterLock> = {
  angle: {
    enabled: false,
    min: PHYSICS_DEFAULTS.ANGLE_MIN,
    max: PHYSICS_DEFAULTS.ANGLE_MAX,
  },
  velocity: {
    enabled: false,
    min: PHYSICS_DEFAULTS.VELOCITY_MIN,
    max: PHYSICS_DEFAULTS.VELOCITY_MAX,
  },
  cannonHeight: {
    enabled: false,
    min: PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN,
    max: PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX,
  },
  cannonX: {
    enabled: false,
    min: 0,
    max: 20,
  },
  targetDistance: {
    enabled: false,
    min: PHYSICS_DEFAULTS.TARGET_DISTANCE_MIN,
    max: PHYSICS_DEFAULTS.TARGET_DISTANCE_MAX,
  },
};

const PhysicsConfigBuilder = ({
  config,
  onChange,
}: PhysicsConfigBuilderProps) => {
  const handleChange = (field: keyof PhysicsConfig, value: number) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleCheckboxChange = (
    field: keyof PhysicsConfig,
    checked: boolean
  ) => {
    onChange({
      ...config,
      [field]: checked,
    });
  };

  const locks: PhysicsLocks = config.locks ?? {};

  const updateLock = (key: LockKey, patch: Partial<ParameterLock>) => {
    const current = locks[key] ?? DEFAULT_LOCK_VALUES[key];
    const nextLock: ParameterLock = {
      enabled: current.enabled,
      min: current.min,
      max: current.max,
      ...patch,
    };
    onChange({
      ...config,
      locks: {
        ...locks,
        [key]: nextLock,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Configuración de Parámetros Físicos
        </h3>
        <p className="text-sm opacity-70 mb-4">
          Define los rangos y valores predeterminados. Los rangos de ángulo y
          velocidad ya limitan al alumno; para altura, posición X del cañón y
          posición del blanco activa el candado para restringir el rango
          permitido.
        </p>
      </div>

      {/* Ángulo del Cañón */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Ángulo del Cañón (°)</h4>
          <LockBadge enabled={config.angleMin === config.angleMax} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ParamInput
            id="angleMin"
            label="Mínimo"
            value={config.angleMin}
            min={PHYSICS_DEFAULTS.ANGLE_MIN}
            max={config.angleMax}
            step={PHYSICS_DEFAULTS.ANGLE_STEP}
            onValueChange={(v) => handleChange("angleMin", v)}
          />
          <ParamInput
            id="angleMax"
            label="Máximo"
            value={config.angleMax}
            min={config.angleMin}
            max={PHYSICS_DEFAULTS.ANGLE_MAX}
            step={PHYSICS_DEFAULTS.ANGLE_STEP}
            onValueChange={(v) => handleChange("angleMax", v)}
          />
          <ParamInput
            id="angleDefault"
            label="Predeterminado"
            value={config.angleDefault}
            min={config.angleMin}
            max={config.angleMax}
            step={PHYSICS_DEFAULTS.ANGLE_STEP}
            onValueChange={(v) => handleChange("angleDefault", v)}
          />
        </div>
      </div>

      {/* Velocidad Inicial */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Velocidad Inicial (m/s)</h4>
          <LockBadge enabled={config.velocityMin === config.velocityMax} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ParamInput
            id="velocityMin"
            label="Mínimo"
            value={config.velocityMin}
            min={PHYSICS_DEFAULTS.VELOCITY_MIN}
            max={config.velocityMax}
            step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            onValueChange={(v) => handleChange("velocityMin", v)}
          />
          <ParamInput
            id="velocityMax"
            label="Máximo"
            value={config.velocityMax}
            min={config.velocityMin}
            max={PHYSICS_DEFAULTS.VELOCITY_MAX}
            step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            onValueChange={(v) => handleChange("velocityMax", v)}
          />
          <ParamInput
            id="velocityDefault"
            label="Predeterminado"
            value={config.velocityDefault}
            min={config.velocityMin}
            max={config.velocityMax}
            step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            onValueChange={(v) => handleChange("velocityDefault", v)}
          />
        </div>
      </div>

      {/* Altura del Cañón */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <LockHeader
          title="Altura del Cañón (m)"
          locked={Boolean(locks.cannonHeight?.enabled)}
          onToggle={(enabled) => updateLock("cannonHeight", { enabled })}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ParamInput
            id="cannonHeight"
            label="Predeterminado"
            value={config.cannonHeight}
            min={PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN}
            max={PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX}
            step={PHYSICS_DEFAULTS.CANNON_HEIGHT_STEP}
            onValueChange={(v) => handleChange("cannonHeight", v)}
          />
          <ParamInput
            id="cannonHeightLockMin"
            label="Mínimo permitido"
            value={(locks.cannonHeight ?? DEFAULT_LOCK_VALUES.cannonHeight).min}
            min={PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN}
            max={(locks.cannonHeight ?? DEFAULT_LOCK_VALUES.cannonHeight).max}
            step={PHYSICS_DEFAULTS.CANNON_HEIGHT_STEP}
            onValueChange={(v) => updateLock("cannonHeight", { min: v })}
            disabled={!locks.cannonHeight?.enabled}
          />
          <ParamInput
            id="cannonHeightLockMax"
            label="Máximo permitido"
            value={(locks.cannonHeight ?? DEFAULT_LOCK_VALUES.cannonHeight).max}
            min={(locks.cannonHeight ?? DEFAULT_LOCK_VALUES.cannonHeight).min}
            max={PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX}
            step={PHYSICS_DEFAULTS.CANNON_HEIGHT_STEP}
            onValueChange={(v) => updateLock("cannonHeight", { max: v })}
            disabled={!locks.cannonHeight?.enabled}
          />
        </div>
      </div>

      {/* Posición horizontal del cañón */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <LockHeader
          title="Posición horizontal del cañón (m)"
          locked={Boolean(locks.cannonX?.enabled)}
          onToggle={(enabled) => updateLock("cannonX", { enabled })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParamInput
            id="cannonXLockMin"
            label="Mínimo permitido"
            value={(locks.cannonX ?? DEFAULT_LOCK_VALUES.cannonX).min}
            min={0}
            max={(locks.cannonX ?? DEFAULT_LOCK_VALUES.cannonX).max}
            step={0.5}
            onValueChange={(v) => updateLock("cannonX", { min: v })}
            disabled={!locks.cannonX?.enabled}
          />
          <ParamInput
            id="cannonXLockMax"
            label="Máximo permitido"
            value={(locks.cannonX ?? DEFAULT_LOCK_VALUES.cannonX).max}
            min={(locks.cannonX ?? DEFAULT_LOCK_VALUES.cannonX).min}
            max={config.targetDistance}
            step={0.5}
            onValueChange={(v) => updateLock("cannonX", { max: v })}
            disabled={!locks.cannonX?.enabled}
          />
        </div>
      </div>

      {/* Configuración del Objetivo */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <LockHeader
          title="Objetivo"
          locked={Boolean(locks.targetDistance?.enabled)}
          onToggle={(enabled) => updateLock("targetDistance", { enabled })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParamInput
            id="targetDistance"
            label="Distancia (m)"
            value={config.targetDistance}
            min={PHYSICS_DEFAULTS.TARGET_DISTANCE_MIN}
            max={PHYSICS_DEFAULTS.TARGET_DISTANCE_MAX}
            step={PHYSICS_DEFAULTS.TARGET_DISTANCE_STEP}
            onValueChange={(v) => handleChange("targetDistance", v)}
          />
          <ParamInput
            id="targetRadius"
            label="Radio (m)"
            value={config.targetRadius}
            min={PHYSICS_DEFAULTS.TARGET_RADIUS_MIN}
            max={PHYSICS_DEFAULTS.TARGET_RADIUS_MAX}
            step={PHYSICS_DEFAULTS.TARGET_RADIUS_STEP}
            onValueChange={(v) => handleChange("targetRadius", v)}
          />
          <ParamInput
            id="targetDistanceLockMin"
            label="Mínimo permitido"
            value={
              (locks.targetDistance ?? DEFAULT_LOCK_VALUES.targetDistance).min
            }
            min={PHYSICS_DEFAULTS.TARGET_DISTANCE_MIN}
            max={
              (locks.targetDistance ?? DEFAULT_LOCK_VALUES.targetDistance).max
            }
            step={PHYSICS_DEFAULTS.TARGET_DISTANCE_STEP}
            onValueChange={(v) => updateLock("targetDistance", { min: v })}
            disabled={!locks.targetDistance?.enabled}
          />
          <ParamInput
            id="targetDistanceLockMax"
            label="Máximo permitido"
            value={
              (locks.targetDistance ?? DEFAULT_LOCK_VALUES.targetDistance).max
            }
            min={
              (locks.targetDistance ?? DEFAULT_LOCK_VALUES.targetDistance).min
            }
            max={PHYSICS_DEFAULTS.TARGET_DISTANCE_MAX}
            step={PHYSICS_DEFAULTS.TARGET_DISTANCE_STEP}
            onValueChange={(v) => updateLock("targetDistance", { max: v })}
            disabled={!locks.targetDistance?.enabled}
          />
        </div>
      </div>

      {/* Opciones Visuales */}
      <div className="p-4 space-y-3 bg-base-100 rounded-lg">
        <h4 className="font-medium">Opciones de Visualización</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={config.showTrajectory ?? true}
              onChange={(e) =>
                handleCheckboxChange("showTrajectory", e.target.checked)
              }
            />
            <span className="label-text">Mostrar trayectoria</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={config.showVectors ?? false}
              onChange={(e) =>
                handleCheckboxChange("showVectors", e.target.checked)
              }
            />
            <span className="label-text">Mostrar vectores de velocidad</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={config.showGrid ?? true}
              onChange={(e) =>
                handleCheckboxChange("showGrid", e.target.checked)
              }
            />
            <span className="label-text">Mostrar cuadrícula</span>
          </label>
        </div>
      </div>
    </div>
  );
};

interface ParamInputProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}

const ParamInput = ({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled,
  onValueChange,
}: ParamInputProps) => {
  // Texto local: permite vaciar y reescribir el campo libremente.
  // Solo se propaga un número cuando es válido; al perder el foco vacío,
  // se restaura el último valor numérico.
  const [text, setText] = useState(String(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setText(String(value));
  }, [value]);

  return (
    <div>
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <Input
        id={id}
        type="number"
        value={text}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          const n = parseFloat(text);
          if (text.trim() === "" || isNaN(n)) {
            setText(String(value));
          }
        }}
        onChange={(e) => {
          const raw = e.currentTarget.value;
          setText(raw);
          if (raw.trim() !== "") {
            const n = parseFloat(raw);
            if (!isNaN(n)) onValueChange(n);
          }
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
};

const LockBadge = ({ enabled }: { enabled: boolean }) =>
  enabled ? (
    <span className="badge badge-warning gap-1">
      <Lock className="w-3 h-3" />
      Valor fijo
    </span>
  ) : (
    <span className="badge badge-ghost gap-1">
      <Unlock className="w-3 h-3" />
      Rango libre
    </span>
  );

interface LockHeaderProps {
  title: string;
  locked: boolean;
  onToggle: (enabled: boolean) => void;
}

const LockHeader = ({ title, locked, onToggle }: LockHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <h4 className="font-medium">{title}</h4>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="toggle toggle-warning toggle-sm"
        checked={locked}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span className="text-xs font-medium flex items-center gap-1">
        {locked ? (
          <>
            <Lock className="w-3 h-3" />
            Restringido
          </>
        ) : (
          <>
            <Unlock className="w-3 h-3" />
            Sin restricción
          </>
        )}
      </span>
    </label>
  </div>
);

export default PhysicsConfigBuilder;
