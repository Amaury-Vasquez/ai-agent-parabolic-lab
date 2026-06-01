import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchEscenario } from "@/fetchers/escenarios";
import SimuladorWrapper from "@/modules/SimuladorWrapper";
import { buildMetadata } from "@/utils/metadata";

interface SimuladorPageProps {
  params: Promise<{ idactividad: string; idescenario: string }>;
}

export async function generateMetadata({
  params,
}: SimuladorPageProps): Promise<Metadata> {
  const { idescenario } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  let nombre: string | null = null;
  if (token) {
    try {
      const escenario = await fetchEscenario(token, idescenario);
      nombre = escenario?.nombre ?? null;
    } catch {
      nombre = null;
    }
  }
  return buildMetadata({
    title: nombre ? `Simulador: ${nombre}` : "Simulador de tiro parabólico",
    description: nombre
      ? `Resuelve el escenario «${nombre}» en el simulador de tiro parabólico de ParabolicLab.`
      : "Resuelve escenarios de tiro parabólico en el simulador interactivo de ParabolicLab.",
    noindex: true,
  });
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