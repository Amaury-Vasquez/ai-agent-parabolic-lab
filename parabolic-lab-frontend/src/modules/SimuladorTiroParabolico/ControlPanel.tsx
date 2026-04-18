"use client";

import { useState } from "react";
import { Rocket, RotateCcw } from "lucide-react";
import { Badge, Button } from "amvasdev-ui";
import { Scenario } from "@/models/scenario";

interface ControlPanelProps {
  scenario?: Scenario;
  defaultAngle: number;
  defaultVelocity: number;
}

const ControlPanel = ({
  scenario,
  defaultAngle,
  defaultVelocity,
}: ControlPanelProps) => {
  const [angle, setAngle] = useState(defaultAngle);
  const [velocity, setVelocity] = useState(defaultVelocity);

  return (
    <div className="bg-base-200 rounded-lg p-4 md:p-6 flex flex-col gap-4 md:gap-6">
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-2">Controles</h3>
        {scenario ? (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="info">{scenario.tipoescenario}</Badge>
            <Badge variant="warning">{scenario.niveldificultad}</Badge>
          </div>
        ) : null}
      </div>

      {/* Angle control */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Ángulo de lanzamiento
        </label>
        <div className="flex items-center gap-2 md:gap-4">
          <input
            type="range"
            min="0"
            max="90"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="range range-primary flex-1"
          />
          <div className="bg-base-100 px-2 py-1 md:px-3 md:py-2 rounded-lg min-w-[50px] md:min-w-[60px] text-center font-bold text-sm md:text-base">
            {angle}°
          </div>
        </div>
        <div className="flex justify-between text-xs opacity-60 mt-1">
          <span>0°</span>
          <span>45°</span>
          <span>90°</span>
        </div>
      </div>

      {/* Velocity control */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Velocidad inicial
        </label>
        <div className="flex items-center gap-2 md:gap-4">
          <input
            type="range"
            min="5"
            max="50"
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="range range-secondary flex-1"
          />
          <div className="bg-base-100 px-2 py-1 md:px-3 md:py-2 rounded-lg min-w-[60px] md:min-w-[70px] text-center font-bold text-sm md:text-base">
            {velocity} m/s
          </div>
        </div>
        <div className="flex justify-between text-xs opacity-60 mt-1">
          <span>5 m/s</span>
          <span>25 m/s</span>
          <span>50 m/s</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 md:gap-3 mt-2 md:mt-4">
        <Button variant="primary" className="w-full gap-2" size="lg">
          <Rocket className="w-4 h-4 md:w-5 md:h-5" />
          Lanzar
        </Button>
        <Button variant="ghost" className="w-full gap-2">
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </Button>
      </div>

      {/* Physics info panel */}
      <div className="bg-base-100 rounded-lg p-3 md:p-4 mt-1 md:mt-2">
        <h4 className="text-sm font-bold mb-2 md:mb-3 opacity-70">
          Cálculos (preview)
        </h4>
        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
          <div className="flex justify-between">
            <span className="opacity-70">Alcance máximo:</span>
            <span className="font-semibold">-- m</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Altura máxima:</span>
            <span className="font-semibold">-- m</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Tiempo de vuelo:</span>
            <span className="font-semibold">-- s</span>
          </div>
        </div>
      </div>

      {/* Scenario objectives (if available) */}
      {scenario?.objetivosaprendizaje ? (
        <div className="bg-info bg-opacity-10 rounded-lg p-3 md:p-4 border-l-4 border-info">
          <h4 className="text-sm font-bold mb-2">Objetivos</h4>
          <p className="text-xs md:text-sm opacity-80">
            {scenario.objetivosaprendizaje}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ControlPanel;
