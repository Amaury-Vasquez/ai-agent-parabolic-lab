"use client";
import { Button, Input, Select, useToggle } from "amvasdev-ui";
import clsx from "clsx";
import { Funnel, FunnelX, Search } from "lucide-react";

export type RankingType =
  | "activitiesCompleted"
  | "totalScore"
  | "maxScore"
  | "averageTime"
  | "totalAttempts"
  | "lastAccess"
  | "difficultyLevel";

export type DifficultyFilter = "all" | "Fácil" | "Intermedio" | "Difícil";

const RANKING_OPTIONS = [
  { id: "activitiesCompleted", text: "Actividades Completadas" },
  { id: "totalScore", text: "Puntaje Total" },
  { id: "maxScore", text: "Puntaje Máximo" },
  { id: "averageTime", text: "Tiempo Promedio" },
  { id: "totalAttempts", text: "Intentos Totales" },
  { id: "lastAccess", text: "Último Acceso" },
  { id: "difficultyLevel", text: "Dificultad Completada" },
];

const DIFFICULTY_OPTIONS = [
  { id: "all", text: "Todas las Dificultades" },
  { id: "Fácil", text: "Fácil" },
  { id: "Intermedio", text: "Intermedio" },
  { id: "Difícil", text: "Difícil" },
];

interface FiltersSectionProps {
  rankingType: RankingType;
  difficultyFilter: DifficultyFilter;
  searchTerm: string;
  onRankingChange: (rankingType: RankingType) => void;
  onDifficultyChange: (difficulty: DifficultyFilter) => void;
  onSearchChange: (searchTerm: string) => void;
  showAllFilters?: boolean;
}

const FiltersSection = ({
  rankingType,
  difficultyFilter,
  searchTerm,
  onRankingChange,
  onDifficultyChange,
  onSearchChange,
  showAllFilters = true,
}: FiltersSectionProps) => {
  // Filter ranking options based on user type
  const availableRankingOptions = showAllFilters
    ? RANKING_OPTIONS
    : RANKING_OPTIONS.filter(
        (opt) => opt.id !== "lastAccess" && opt.id !== "totalAttempts"
      );

  const selectedRankingOption =
    availableRankingOptions.find((opt) => opt.id === rankingType) ||
    availableRankingOptions[1];
  const selectedDifficultyOption =
    DIFFICULTY_OPTIONS.find((opt) => opt.id === difficultyFilter) ||
    DIFFICULTY_OPTIONS[0];
  const [showFilters, toggleShowFilters] = useToggle();

  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <Input
        id="search-student"
        label="Buscar alumno"
        type="text"
        placeholder="Juan Pérez"
        value={searchTerm}
        onChange={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        leftIcon={<Search size="16" />}
        containerClassName="max-w-80"
      />
      <Button
        variant="primary"
        className="md:hidden w-full"
        onClick={toggleShowFilters}
      >
        {showFilters ? (
          <>
            <FunnelX size="16" />
            Ocultar filtros
          </>
        ) : (
          <>
            <Funnel size="16" />
            Mostrar filtros
          </>
        )}
      </Button>

      <div
        className={clsx(
          "items-center gap-4 flex flex-col max-md:w-full md:flex-row",
          {
            "hidden md:flex": !showFilters,
          }
        )}
      >
        <Select
          id="ranking-type"
          label="Ordenar por"
          options={availableRankingOptions}
          value={selectedRankingOption}
          onChange={(option) => onRankingChange(option.id as RankingType)}
          className="text-ellipsis"
          containerClassName="w-full md:w-60"
          selectClassName="w-full"
        />

        <Select
          id="difficulty-filter"
          label="Filtrar por dificultad"
          options={DIFFICULTY_OPTIONS}
          value={selectedDifficultyOption}
          onChange={(option) =>
            onDifficultyChange(option.id as DifficultyFilter)
          }
          containerClassName="w-full md:w-60"
          menuClassName="right-0 left-auto"
          selectClassName="w-full"
        />
      </div>
    </div>
  );
};

export default FiltersSection;
