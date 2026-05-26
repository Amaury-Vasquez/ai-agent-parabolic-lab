"use client";

import clsx from "clsx";
import { ArrowDown, ArrowRight, ArrowUp, Gauge, Mountain, Timer } from "lucide-react";
import type { TrajectoryMetrics } from "./types";

interface TrajectoryHUDProps {
  metrics: TrajectoryMetrics | null;
  inFlight: boolean;
}

interface MetricCellProps {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  accent: string;
}

const MetricCell = ({ label, value, unit, icon, accent }: MetricCellProps) => (
  <div className="bg-base-100 rounded-lg px-3 py-2 flex items-center gap-2 min-w-[120px]">
    <div className={clsx("rounded-md p-1.5", accent)}>{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] opacity-60 uppercase tracking-wide">
        {label}
      </span>
      <span className="font-mono font-bold text-sm tabular-nums leading-tight">
        {value}
        <span className="text-[10px] opacity-60 ml-0.5">{unit}</span>
      </span>
    </div>
  </div>
);

const TrajectoryHUD = ({ metrics, inFlight }: TrajectoryHUDProps) => {
  const m = metrics ?? {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    alturaMaxima: 0,
    tiempoVuelo: 0,
    alcance: 0,
  };
  const fmt = (n: number, d = 1) => n.toFixed(d);

  return (
    <div
      className={clsx(
        "bg-base-200 rounded-lg p-3 flex flex-col gap-2 transition-opacity",
        metrics ? "opacity-100" : "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold flex items-center gap-1">
          <Gauge className="w-4 h-4 text-primary" />
          Trayectoria
        </h4>
        <span
          className={clsx(
            "text-[10px] px-2 py-0.5 rounded-full",
            inFlight
              ? "bg-success/20 text-success"
              : metrics
                ? "bg-base-100"
                : "bg-base-100 opacity-60"
          )}
        >
          {inFlight ? "En vuelo" : metrics ? "Final" : "Sin datos"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <MetricCell
          label="Altura máx"
          value={fmt(m.alturaMaxima)}
          unit="m"
          icon={<Mountain className="w-3.5 h-3.5 text-white" />}
          accent="bg-emerald-500"
        />
        <MetricCell
          label="Alcance"
          value={fmt(m.alcance)}
          unit="m"
          icon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
          accent="bg-sky-500"
        />
        <MetricCell
          label="Tiempo vuelo"
          value={fmt(m.tiempoVuelo, 2)}
          unit="s"
          icon={<Timer className="w-3.5 h-3.5 text-white" />}
          accent="bg-violet-500"
        />
        <MetricCell
          label="vₓ"
          value={fmt(m.vx)}
          unit="m/s"
          icon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
          accent="bg-amber-500"
        />
        <MetricCell
          label="vᵧ"
          value={fmt(m.vy)}
          unit="m/s"
          icon={
            m.vy >= 0 ? (
              <ArrowUp className="w-3.5 h-3.5 text-white" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-white" />
            )
          }
          accent={m.vy >= 0 ? "bg-rose-500" : "bg-indigo-500"}
        />
      </div>
    </div>
  );
};

export default TrajectoryHUD;
