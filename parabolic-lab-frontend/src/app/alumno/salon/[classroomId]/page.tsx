import ClassroomDetail from "@/modules/ClassroomDetail";

interface AlumnoClassroomDetailPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function AlumnoClassroomDetailPage({
  params,
}: AlumnoClassroomDetailPageProps) {
  const { classroomId } = await params;
  return <ClassroomDetail classroomId={classroomId} userType="alumno" />;
}
