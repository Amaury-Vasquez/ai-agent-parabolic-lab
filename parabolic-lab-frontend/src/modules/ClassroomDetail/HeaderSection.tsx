"use client";
import { Badge } from "amvasdev-ui";
import { UserType } from "@/models/users";

interface HeaderSectionProps {
  classroomId: string;
  studentsCount: number;
  userType?: UserType;
}

const HeaderSection = ({
  classroomId,
  studentsCount,
}: HeaderSectionProps) => (
  <div className="flex w-full items-center gap-2 justify-between py-4">
    <div className="flex-1 flex flex-col gap-2">
      <h1 className="text-2xl md:text-3xl font-bold text-ellipsis">
        Física 101
      </h1>
      <p className="mt-1 text-ellipsis">Salón #{classroomId}</p>
    </div>
    <Badge variant="info" size="lg">
      {studentsCount} estudiantes
    </Badge>
  </div>
);

export default HeaderSection;
