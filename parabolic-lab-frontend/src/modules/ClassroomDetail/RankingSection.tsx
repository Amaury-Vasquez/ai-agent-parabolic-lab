import StudentRankingCard from "@/components/StudentRankingCard";
import { Student } from "@/constants/students";
import { UserType } from "@/models/users";
import { RankingType } from "./FiltersSection";

interface RankingSectionProps {
  students: Student[];
  rankingType: RankingType;
  classroomId: string;
  userType?: UserType;
}

const RankingSection = ({
  students,
  rankingType,
  classroomId,
  userType = "docente",
}: RankingSectionProps) => {
  const isStudent = userType === "alumno";

  return (
    <div className="flex flex-col">
      {students.map((student, index) => (
        <StudentRankingCard
          key={student.id}
          student={student}
          rank={index + 1}
          rankingType={rankingType}
          href={
            isStudent
              ? undefined
              : `/docente/salon/${classroomId}/alumno/${student.id}`
          }
        />
      ))}
    </div>
  );
};

export default RankingSection;
