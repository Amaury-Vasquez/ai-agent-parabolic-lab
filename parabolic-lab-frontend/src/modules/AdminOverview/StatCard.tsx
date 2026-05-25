import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "error";
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: StatCardProps) => (
  <div className="bg-base-100 border border-base-300 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm">
    <div className={clsx("rounded-xl p-3 shrink-0", ACCENT_CLASSES[accent])}>
      <Icon size={24} />
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase opacity-60">{label}</p>
      <p className="text-2xl md:text-3xl font-bold leading-tight">{value}</p>
      {hint ? <p className="text-xs opacity-60 mt-0.5">{hint}</p> : null}
    </div>
  </div>
);

export default StatCard;
