import { ArrowLeft } from "lucide-react";
import CustomLink from "@/components/CustomLink";
import ActivitiesList from "@/components/ActivitiesList";
import { MOCK_ACTIVITIES } from "@/constants/activities";

interface ClassroomActividadesPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function ClassroomActividadesPage({
  params,
}: ClassroomActividadesPageProps) {
  const { classroomId } = await params;

  // Filter activities for this specific classroom
  const classroomActivities = MOCK_ACTIVITIES.filter(
    (activity) => activity.idsalon === classroomId
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <CustomLink
          href={`/alumno/salon/${classroomId}`}
          variant="ghost"
          className="btn-square"
        >
          <ArrowLeft size={20} />
        </CustomLink>
        <div>
          <h1 className="text-3xl font-bold">Actividades del Salon</h1>
          <p className="mt-1">Actividades asignadas para este salon</p>
        </div>
      </div>

      <ActivitiesList
        activities={classroomActivities}
        emptyMessage="No hay actividades asignadas para este salon"
      />
    </div>
  );
}
