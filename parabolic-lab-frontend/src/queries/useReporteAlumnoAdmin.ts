"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_ALUMNO_INTERACCIONES_QUERY_KEY,
  fetchAdminAlumnoInteracciones,
} from "@/fetchers/admin";
import {
  fetchReporteIntento,
  REPORTE_INTENTO_QUERY_KEY,
} from "@/fetchers/reportes";

export function useReporteAlumnoAdmin(idalumno: string, habilitado: boolean) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  const interaccionesQuery = useQuery({
    queryKey: ADMIN_ALUMNO_INTERACCIONES_QUERY_KEY(idalumno),
    queryFn: () => fetchAdminAlumnoInteracciones(token, idalumno),
    enabled: !!token && !!idalumno && habilitado,
  });

  const idinteraccion = useMemo<string | null>(() => {
    const interacciones = interaccionesQuery.data ?? [];
    const completadas = interacciones.filter((i) => i.completado);
    const ordenadas = [...completadas].sort((a, b) => {
      const ta = a.fechafin ? new Date(a.fechafin).getTime() : 0;
      const tb = b.fechafin ? new Date(b.fechafin).getTime() : 0;
      return tb - ta;
    });
    return ordenadas[0]?.idinteraccion ?? null;
  }, [interaccionesQuery.data]);

  const reporteQuery = useQuery({
    queryKey: REPORTE_INTENTO_QUERY_KEY(idinteraccion ?? ""),
    queryFn: () => fetchReporteIntento(token, idinteraccion!),
    enabled: !!token && !!idinteraccion && habilitado,
  });

  const sinReportes =
    interaccionesQuery.isSuccess &&
    !interaccionesQuery.isLoading &&
    idinteraccion === null;

  return {
    data: reporteQuery.data,
    idinteraccion,
    isLoading:
      interaccionesQuery.isLoading ||
      (!!idinteraccion && reporteQuery.isLoading),
    isError: interaccionesQuery.isError || reporteQuery.isError,
    sinReportes,
  };
}
