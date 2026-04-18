"use client";

import { Input } from "amvasdev-ui";
import { PHYSICS_DEFAULTS } from "@/constants/physicsDefaults";
import type { PhysicsConfig } from "@/types/physicsConfig";

interface PhysicsConfigBuilderProps {
  config: PhysicsConfig;
  onChange: (config: PhysicsConfig) => void;
}

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

  const handleInputChange = (field: keyof PhysicsConfig, e: React.FormEvent<HTMLInputElement>) => {
    const value = parseFloat(e.currentTarget.value);
    if (!isNaN(value)) {
      handleChange(field, value);
    }
  };

  const handleCheckboxChange = (field: keyof PhysicsConfig, checked: boolean) => {
    onChange({
      ...config,
      [field]: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Configuración de Parámetros Físicos
        </h3>
        <p className="text-sm text-base-content/70 mb-4">
          Define los rangos y valores predeterminados que verán los alumnos en
          el simulador.
        </p>
      </div>

      {/* Ángulo del Cañón */}
      <div className="p-4 space-y-3">
        <h4 className="font-medium">Ángulo del Cañón (grados)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Mínimo</span>
            </label>
            <Input
              id="angleMin"
              type="number"
              value={config.angleMin}
              onChange={(e) => handleInputChange("angleMin", e)}
              min={PHYSICS_DEFAULTS.ANGLE_MIN}
              max={config.angleMax}
              step={PHYSICS_DEFAULTS.ANGLE_STEP}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Máximo</span>
            </label>
            <Input
              id="angleMax"
              type="number"
              value={config.angleMax}
              onChange={(e) => handleInputChange("angleMax", e)}
              min={config.angleMin}
              max={PHYSICS_DEFAULTS.ANGLE_MAX}
              step={PHYSICS_DEFAULTS.ANGLE_STEP}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Predeterminado</span>
            </label>
            <Input
              id="angleDefault"
              type="number"
              value={config.angleDefault}
              onChange={(e) => handleInputChange("angleDefault", e)}
              min={config.angleMin}
              max={config.angleMax}
              step={PHYSICS_DEFAULTS.ANGLE_STEP}
            />
          </div>
        </div>
      </div>

      {/* Velocidad Inicial */}
      <div className="p-4 space-y-3">
        <h4 className="font-medium">Velocidad Inicial (m/s)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Mínimo</span>
            </label>
            <Input
              id="velocityMin"
              type="number"
              value={config.velocityMin}
              onChange={(e) => handleInputChange("velocityMin", e)}
              min={PHYSICS_DEFAULTS.VELOCITY_MIN}
              max={config.velocityMax}
              step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Máximo</span>
            </label>
            <Input
              id="velocityMax"
              type="number"
              value={config.velocityMax}
              onChange={(e) => handleInputChange("velocityMax", e)}
              min={config.velocityMin}
              max={PHYSICS_DEFAULTS.VELOCITY_MAX}
              step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Predeterminado</span>
            </label>
            <Input
              id="velocityDefault"
              type="number"
              value={config.velocityDefault}
              onChange={(e) => handleInputChange("velocityDefault", e)}
              min={config.velocityMin}
              max={config.velocityMax}
              step={PHYSICS_DEFAULTS.VELOCITY_STEP}
            />
          </div>
        </div>
      </div>

      {/* Altura del Cañón */}
      <div className="p-4 space-y-3">
        <h4 className="font-medium">Altura del Cañón (metros)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Altura</span>
            </label>
            <Input
              id="cannonHeight"
              type="number"
              value={config.cannonHeight}
              onChange={(e) => handleInputChange("cannonHeight", e)}
              min={PHYSICS_DEFAULTS.CANNON_HEIGHT_MIN}
              max={PHYSICS_DEFAULTS.CANNON_HEIGHT_MAX}
              step={PHYSICS_DEFAULTS.CANNON_HEIGHT_STEP}
            />
          </div>
        </div>
      </div>

      {/* Configuración del Objetivo */}
      <div className="p-4 space-y-3">
        <h4 className="font-medium">Objetivo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Distancia (metros)</span>
            </label>
            <Input
              id="targetDistance"
              type="number"
              value={config.targetDistance}
              onChange={(e) => handleInputChange("targetDistance", e)}
              min={PHYSICS_DEFAULTS.TARGET_DISTANCE_MIN}
              max={PHYSICS_DEFAULTS.TARGET_DISTANCE_MAX}
              step={PHYSICS_DEFAULTS.TARGET_DISTANCE_STEP}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Radio (metros)</span>
            </label>
            <Input
              id="targetRadius"
              type="number"
              value={config.targetRadius}
              onChange={(e) => handleInputChange("targetRadius", e)}
              min={PHYSICS_DEFAULTS.TARGET_RADIUS_MIN}
              max={PHYSICS_DEFAULTS.TARGET_RADIUS_MAX}
              step={PHYSICS_DEFAULTS.TARGET_RADIUS_STEP}
            />
          </div>
        </div>
      </div>

      {/* Opciones Visuales */}
      <div className="p-4 space-y-3">
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

export default PhysicsConfigBuilder;
