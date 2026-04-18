"use client";
import ActivitiesList from "@/components/ActivitiesList";
import { MOCK_ACTIVITIES } from "@/constants/activities";

export default function ActividadesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Actividades</h1>
        <p className="mt-1">
          Todas las actividades asignadas en tus salones
        </p>
      </div>

      <ActivitiesList activities={MOCK_ACTIVITIES} />
    </div>
  );
}
