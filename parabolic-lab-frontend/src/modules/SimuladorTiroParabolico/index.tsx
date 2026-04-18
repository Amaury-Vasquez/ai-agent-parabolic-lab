"use client";

import { Scenario } from "@/models/scenario";
import ControlPanel from "./ControlPanel";
import SimulationCanvas from "./SimulationCanvas";

interface SimuladorTiroParabolicoProps {
  scenario?: Scenario;
}

interface SimulationSettings {
  angle: number;
  velocity: number;
  targetDistance: number;
  cannonHeight: number;
}

const DEFAULT_SETTINGS: SimulationSettings = {
  angle: 45,
  velocity: 20,
  targetDistance: 50,
  cannonHeight: 0,
};

const SimuladorTiroParabolico = ({
  scenario,
}: SimuladorTiroParabolicoProps) => {
  // TODO: Use scenario data to configure simulation parameters
  const settings: SimulationSettings = scenario?.configuracionescenario
    ? (scenario.configuracionescenario as unknown as SimulationSettings)
    : DEFAULT_SETTINGS;

  return (
    <div className="flex flex-col gap-6">
      {scenario ? (
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="text-2xl font-bold">{scenario.nombre}</h2>
          {scenario.descripcion ? (
            <p className="text-sm opacity-70 mt-2">{scenario.descripcion}</p>
          ) : null}
        </div>
      ) : (
        <div className="bg-base-200 rounded-lg p-4">
          <h2 className="text-2xl font-bold">Simulador de Tiro Parabólico</h2>
          <p className="text-sm opacity-70 mt-2">
            Experimenta con diferentes ángulos y velocidades para entender el
            movimiento parabólico
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SimulationCanvas
            angle={settings.angle}
            velocity={settings.velocity}
            targetDistance={settings.targetDistance}
            cannonHeight={settings.cannonHeight}
          />
        </div>

        <div className="lg:col-span-1">
          <ControlPanel
            scenario={scenario}
            defaultAngle={settings.angle}
            defaultVelocity={settings.velocity}
          />
        </div>
      </div>
    </div>
  );
};

export default SimuladorTiroParabolico;
