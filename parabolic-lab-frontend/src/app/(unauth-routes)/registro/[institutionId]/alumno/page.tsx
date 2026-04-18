import RegisterStudent from "@/modules/RegisterStudent";

interface RegisterStudentPageProps {
  params: Promise<{ institutionId: string }>;
}

export default async function RegisterStudentPage({
  params,
}: RegisterStudentPageProps) {
  const { institutionId } = await params;

  return <RegisterStudent institutionId={institutionId} />;
}
