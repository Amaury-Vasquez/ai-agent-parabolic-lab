import RegisterTeacher from "@/modules/RegisterTeacher";

interface RegisterTeacherPageProps {
  params: Promise<{ institutionId: string }>;
}

export default async function RegisterTeacherPage({
  params,
}: RegisterTeacherPageProps) {
  const { institutionId } = await params;

  return <RegisterTeacher institutionId={institutionId} />;
}
