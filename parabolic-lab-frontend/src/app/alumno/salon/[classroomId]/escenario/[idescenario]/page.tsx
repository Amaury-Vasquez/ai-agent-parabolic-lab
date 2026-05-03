import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario } from "@/fetchers/escenarios";
import SimuladorWrapper from "@/modules/SimuladorWrapper";

interface SimuladorSalonPageProps {
  params: Promise<{ classroomId: string; idescenario: string }>;
}

export default async function SimuladorSalonPage({ params }: SimuladorSalonPageProps) {
  const { classroomId, idescenario } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  let scenario = null;
  if (token) {
    try {
      scenario = await fetchEscenario(token, idescenario);
    } catch {
      scenario = null;
    }
  }

  return (
    <SimuladorWrapper
      idactividad={classroomId}
      idescenario={idescenario}
      scenario={scenario}
      returnUrl={`/alumno/salon/${classroomId}`}
    />
  );
}
