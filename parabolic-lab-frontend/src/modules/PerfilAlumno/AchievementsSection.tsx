import { Trophy } from "lucide-react";
import SectionCard from "@/components/SectionCard";
import AchievementCard from "./AchievementCard";
import type { Achievement } from "./helpers";

interface AchievementsSectionProps {
  logros: Achievement[];
}

const EmptyState = () => (
  <div className="rounded-xl border border-dashed border-base-300 bg-base-100 py-10 px-6 text-center">
    <Trophy size={36} className="mx-auto opacity-30 mb-3" aria-hidden="true" />
    <p className="font-medium">Aún no tienes logros</p>
    <p className="text-sm opacity-70 mt-1">
      Completa escenarios para empezar a coleccionar logros.
    </p>
  </div>
);

const AchievementsSection = ({ logros }: AchievementsSectionProps) => (
  <SectionCard
    icon={<Trophy size={22} />}
    title="Últimos Logros"
    description="Tus escenarios completados más recientes"
  >
    {logros.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {logros.map((logro) => (
          <AchievementCard key={logro.idinteraccion} logro={logro} />
        ))}
      </div>
    ) : (
      <EmptyState />
    )}
  </SectionCard>
);

export default AchievementsSection;
