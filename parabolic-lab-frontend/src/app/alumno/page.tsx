import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import Alumno from "@/modules/Alumno";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Inicio",
  description:
    "Accede a tus salones, actividades y simulaciones de tiro parabólico en ParabolicLab.",
  noindex: true,
});

export default async function AlumnoPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Alumno />
    </HydrationBoundary>
  );
}