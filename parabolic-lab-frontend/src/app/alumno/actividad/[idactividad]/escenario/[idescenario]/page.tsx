import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario } from "@/queries/useEscenario";
import SimuladorWrapper from "@/modules/SimuladorWrapper";

interface SimuladorPageProps {
  params: Promise<{ idactividad: string; idescenario: string }>;
}

export default async function SimuladorPage({ params }: SimuladorPageProps) {
  const { idactividad, idescenario } = await params;
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
      idactividad={idactividad}
      idescenario={idescenario}
      scenario={scenario}
    />
  );
}