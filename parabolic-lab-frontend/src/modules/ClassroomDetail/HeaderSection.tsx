"use client";
import { Badge, Button } from "amvasdev-ui";
import { Settings, Users } from "lucide-react";
import { UserType } from "@/models/users";

interface HeaderSectionProps {
  classroomId: string;
  studentsCount: number;
  userType?: UserType;
  nombre?: string;
  onSettingsClick?: () => void;
  onEstudiantesClick?: () => void;
}

const HeaderSection = ({
  classroomId,
  studentsCount,
  nombre,
  onSettingsClick,
  onEstudiantesClick,
}: HeaderSectionProps) => (
  <div className="flex w-full items-center gap-2 justify-between py-4">
    <div className="flex-1 flex flex-col gap-2">
      <h1 className="text-2xl md:text-3xl font-bold text-ellipsis">
        {nombre || classroomId}
      </h1>
      <p className="mt-1 text-ellipsis">Salón #{classroomId}</p>
    </div>
    <div className="flex items-center gap-2">
      {onEstudiantesClick ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEstudiantesClick}
          title="Gestionar estudiantes"
        >
          <Users size={20} />
        </Button>
      ) : null}
      {onSettingsClick ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          title="Gestionar salón"
        >
          <Settings size={20} />
        </Button>
      ) : null}
      <Badge variant="info" size="lg">
        {studentsCount} estudiantes
      </Badge>
    </div>
  </div>
);

export default HeaderSection;
