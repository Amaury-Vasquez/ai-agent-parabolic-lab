import clsx from "clsx";
import { ReactNode } from "react";

export type StatAccent = "primary" | "success" | "warning" | "info";

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: StatAccent;
}

const ACCENT_CLASSES: Record<StatAccent, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const StatTile = ({ icon, label, value, accent = "primary" }: StatTileProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
    <div className={clsx("shrink-0 rounded-lg p-2.5", ACCENT_CLASSES[accent])}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide opacity-60 font-semibold">
        {label}
      </p>
      <p className="font-semibold text-lg leading-tight truncate">{value}</p>
    </div>
  </div>
);

export default StatTile;
