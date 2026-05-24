import clsx from "clsx";
import { Award, Star } from "lucide-react";
import type { Achievement } from "./helpers";

const HIGH_SCORE_THRESHOLD = 80;

interface AchievementCardProps {
  logro: Achievement;
}

const AchievementCard = ({ logro }: AchievementCardProps) => {
  const isHigh = (logro.puntuacion ?? 0) >= HIGH_SCORE_THRESHOLD;
  return (
    <article className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
      <div
        className={clsx(
          "shrink-0 rounded-xl p-2.5",
          isHigh ? "bg-warning/15 text-warning" : "bg-info/10 text-info",
        )}
      >
        {isHigh ? (
          <Star size={24} className="fill-current" />
        ) : (
          <Award size={24} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">
          {logro.escenarioNombre ?? "Escenario completado"}
        </p>
        <p className="text-xs opacity-70">
          Puntuación: {logro.puntuacion ?? "N/A"}
        </p>
        {logro.fechafin ? (
          <p className="text-xs opacity-50">
            {new Date(logro.fechafin).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default AchievementCard;
