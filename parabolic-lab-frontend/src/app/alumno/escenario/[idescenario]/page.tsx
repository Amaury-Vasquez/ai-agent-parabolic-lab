import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario } from "@/fetchers/escenarios";
import SimuladorWrapper from "@/modules/SimuladorWrapper";

interface SimuladorDirectoPageProps {
  params: Promise<{ idescenario: string }>;
}

export default async function SimuladorDirectoPage({
  params,
}: SimuladorDirectoPageProps) {
  const { idescenario } = await params;
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
      idescenario={idescenario}
      scenario={scenario}
      returnUrl="/alumno/escenarios"
    />
  );
}
