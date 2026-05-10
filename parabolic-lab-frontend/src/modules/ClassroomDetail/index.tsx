"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Student } from "@/constants/students";
import type { SalonProgresoEstudiante } from "@/models/estudiante";
import { UserType } from "@/models/users";
import { useMySalones } from "@/queries/useMySalones";
import { useSalonProgreso } from "@/queries/useSalonProgreso";
import { searchIgnoreAccents } from "@/utils/string";
import FiltersSection, {
  DifficultyFilter,
  RankingType,
} from "./FiltersSection";
import HeaderSection from "./HeaderSection";
import ManageSalonModal from "./ManageSalonModal";
import RankingSection from "./RankingSection";

interface ClassroomDetailProps {
  classroomId: string;
  userType?: UserType;
}

const mapProgresoToStudent = (progreso: SalonProgresoEstudiante): Student => ({
  id: progreso.idalumno,
  nombre: progreso.nombre,
  apellido: [progreso.apellidopaterno, progreso.apellidomaterno].filter(Boolean).join(" "),
  totalScore: progreso.promedio_puntuacion ?? 0,
  activitiesCompleted: progreso.escenarios_completados,
  totalAttempts: progreso.total_intentos,
  averageTime: progreso.tiempo_total_minutos,
  maxScore: progreso.mejor_puntuacion ?? 0,
  difficultyLevel: "Intermedio",
  lastAccess: new Date(),
  scenariosCompleted: [],
});

const ClassroomDetail = ({
  classroomId,
  userType = "docente",
}: ClassroomDetailProps) => {
  const router = useRouter();
  const [rankingType, setRankingType] = useState<RankingType>("totalScore");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isManageSalonModalOpen, setIsManageSalonModalOpen] = useState(false);

  const isStudent = userType === "alumno";

  // Fetch progreso data
  const { data: progresoData, isLoading: isProgresoLoading } =
    useSalonProgreso(classroomId);

  // Fetch salon name
  const { data: salones } = useMySalones();
  const salonNombre = salones?.find(
    (s) => s.idsalon === classroomId
  )?.nombresalon;

  // Map progreso to Student interface
  const students: Student[] = (progresoData || []).map(mapProgresoToStudent);

  const filterStudents = (studentsToFilter: Student[]): Student[] => {
    let filtered = studentsToFilter;

    // Filter by search term (ignoring accents)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (student) =>
          searchIgnoreAccents(student.nombre, searchTerm) ||
          searchIgnoreAccents(student.apellido, searchTerm)
      );
    }

    // Filter by difficulty (only for teachers/admin)
    if (!isStudent && difficultyFilter !== "all") {
      filtered = filtered.filter(
        (student) => student.difficultyLevel === difficultyFilter
      );
    }

    return filtered;
  };

  const sortStudents = (studentsToSort: Student[]): Student[] => {
    const sorted = [...studentsToSort];

    switch (rankingType) {
      case "activitiesCompleted":
        return sorted.sort(
          (a, b) => b.activitiesCompleted - a.activitiesCompleted
        );
      case "totalScore":
        return sorted.sort((a, b) => b.totalScore - a.totalScore);
      case "maxScore":
        return sorted.sort((a, b) => b.maxScore - a.maxScore);
      case "averageTime":
        return sorted.sort((a, b) => a.averageTime - b.averageTime);
      case "totalAttempts":
        return sorted.sort((a, b) => b.totalAttempts - a.totalAttempts);
      case "lastAccess":
        return sorted.sort(
          (a, b) => b.lastAccess.getTime() - a.lastAccess.getTime()
        );
      case "difficultyLevel":
        const difficultyOrder = { Difícil: 3, Intermedio: 2, Fácil: 1 };
        return sorted.sort(
          (a, b) =>
            difficultyOrder[b.difficultyLevel] -
            difficultyOrder[a.difficultyLevel]
        );
      default:
        return sorted;
    }
  };

  const filteredAndSortedStudents = sortStudents(filterStudents(students));

  if (isProgresoLoading) {
    return (
      <div className="p-4 md:p-8 flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <HeaderSection
        classroomId={classroomId}
        studentsCount={students.length}
        userType={userType}
        nombre={salonNombre}
        onEstudiantesClick={!isStudent ? () => router.push(`/docente/salon/${classroomId}/estudiantes`) : undefined}
        onSettingsClick={!isStudent ? () => setIsManageSalonModalOpen(true) : undefined}
      />

      {salonNombre && !isStudent ? (
        <ManageSalonModal
          isOpen={isManageSalonModalOpen}
          onClose={() => setIsManageSalonModalOpen(false)}
          salonId={classroomId}
          salonNombre={salonNombre}
        />
      ) : null}

      <FiltersSection
        rankingType={rankingType}
        difficultyFilter={difficultyFilter}
        searchTerm={searchTerm}
        onRankingChange={setRankingType}
        onDifficultyChange={setDifficultyFilter}
        onSearchChange={setSearchTerm}
        showAllFilters={!isStudent}
      />

      <RankingSection
        students={filteredAndSortedStudents}
        rankingType={rankingType}
        classroomId={classroomId}
        userType={userType}
      />
    </div>
  );
};

export default ClassroomDetail;
