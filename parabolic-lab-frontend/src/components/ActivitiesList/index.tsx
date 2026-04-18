import ActivityCard from "./ActivityCard";
import { ActivityWithScenarios } from "@/constants/activities";

interface ActivitiesListProps {
  activities: ActivityWithScenarios[];
  emptyMessage?: string;
}

const ActivitiesList = ({
  activities,
  emptyMessage = "No hay actividades disponibles",
}: ActivitiesListProps) => {
  return activities.length > 0 ? (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {activities.map((activity) => (
        <ActivityCard key={activity.idactividad} activity={activity} />
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-lg opacity-60">{emptyMessage}</p>
    </div>
  );
};

export default ActivitiesList;
