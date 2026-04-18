"use client";
import { useState } from "react";
import { STUDENTS, Student } from "@/constants/students";
import { UserType } from "@/models/users";
import { searchIgnoreAccents } from "@/utils/string";
import FiltersSection, {
  DifficultyFilter,
  RankingType,
} from "./FiltersSection";
import HeaderSection from "./HeaderSection";
import RankingSection from "./RankingSection";

interface ClassroomDetailProps {
  classroomId: string;
  userType?: UserType;
}

const ClassroomDetail = ({
  classroomId,
  userType = "docente",
}: ClassroomDetailProps) => {
  const [rankingType, setRankingType] = useState<RankingType>("totalScore");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const isStudent = userType === "alumno";

  const filterStudents = (students: Student[]): Student[] => {
    let filtered = students;

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

  const sortStudents = (students: Student[]): Student[] => {
    const sorted = [...students];

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

  const filteredAndSortedStudents = sortStudents(filterStudents(STUDENTS));

  return (
    <div className="p-4 md:p-8">
      <HeaderSection
        classroomId={classroomId}
        studentsCount={STUDENTS.length}
        userType={userType}
      />

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
