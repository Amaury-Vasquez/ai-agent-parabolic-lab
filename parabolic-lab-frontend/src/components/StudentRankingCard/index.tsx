import { Badge } from "amvasdev-ui";
import {
  Activity,
  Award,
  Clock,
  Hash,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Student } from "@/constants/students";

interface StudentRankingCardProps {
  student: Student;
  rank: number;
  rankingType: string;
  href?: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
  if (rank === 2) return <Trophy className="text-gray-400" size={24} />;
  if (rank === 3) return <Trophy className="text-orange-600" size={24} />;
  return (
    <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center font-bold">
      {rank}
    </div>
  );
};

const getMainMetric = (student: Student, rankingType: string) => {
  switch (rankingType) {
    case "activitiesCompleted":
      return {
        icon: <Activity size={16} />,
        label: "Actividades",
        value: student.activitiesCompleted,
      };
    case "totalScore":
      return {
        icon: <Target size={16} />,
        label: "Puntaje Total",
        value: student.totalScore,
      };
    case "maxScore":
      return {
        icon: <Award size={16} />,
        label: "Puntaje Máximo",
        value: student.maxScore,
      };
    case "averageTime":
      return {
        icon: <Clock size={16} />,
        label: "Tiempo Promedio",
        value: `${student.averageTime} min`,
      };
    case "totalAttempts":
      return {
        icon: <Hash size={16} />,
        label: "Intentos",
        value: student.totalAttempts,
      };
    case "lastAccess":
      return {
        icon: <Clock size={16} />,
        label: "Último Acceso",
        value: student.lastAccess.toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
        }),
      };
    case "difficultyLevel":
      return {
        icon: <TrendingUp size={16} />,
        label: "Dificultad",
        value: student.difficultyLevel,
      };
    default:
      return {
        icon: <Target size={16} />,
        label: "Puntaje",
        value: student.totalScore,
      };
  }
};

const StudentRankingCard = ({
  student,
  rank,
  rankingType,
  href,
}: StudentRankingCardProps) => {
  const metric = getMainMetric(student, rankingType);
  const difficultyColors = {
    Fácil: "success",
    Intermedio: "warning",
    Difícil: "error",
  } as const;

  const cardContent = (
    <div className="bg-base-100 rounded-lg p-4 flex items-center gap-4 hover:bg-base-200 transition-colors">
      {/* Rank */}
      <div className="flex-shrink-0">{getRankIcon(rank)}</div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-semibold text-lg">
            {student.nombre} {student.apellido}
          </h3>
          <Badge variant={difficultyColors[student.difficultyLevel]} size="sm">
            {student.difficultyLevel}
          </Badge>
        </div>
        <div className="flex gap-4 mt-2 text-sm flex-wrap">
          <span className="flex items-center gap-1">
            <Activity size={14} />
            {student.activitiesCompleted} actividades
          </span>
          <span className="flex items-center gap-1">
            <Target size={14} />
            {student.totalScore} pts
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {student.averageTime} min
          </span>
        </div>
      </div>

      {/* Main Metric */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          {metric.icon}
          <span className="text-xs opacity-60">{metric.label}</span>
        </div>
        <div className="text-2xl font-bold">{metric.value}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{cardContent}</Link> : cardContent;
};

export default StudentRankingCard;
