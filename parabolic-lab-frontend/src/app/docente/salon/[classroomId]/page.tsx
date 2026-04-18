import ClassroomDetail from "@/modules/ClassroomDetail";

interface ClassroomDetailPageProps {
  params: Promise<{
    classroomId: string;
  }>;
}

export default async function ClassroomDetailPage({
  params,
}: ClassroomDetailPageProps) {
  const { classroomId } = await params;
  return <ClassroomDetail classroomId={classroomId} />;
}
