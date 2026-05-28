"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchReporteIntento,
  REPORTE_INTENTO_QUERY_KEY,
} from "@/fetchers/reportes";
import {
  fetchDesempenoAlumno,
  SALON_ALUMNO_DESEMPENO_QUERY_KEY,
} from "@/fetchers/salones";

export function useReporteAlumnoDocente(
  idalumno: string,
  idsalon: string,
  habilitado: boolean,
) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  const desempenoQuery = useQuery({
    queryKey: SALON_ALUMNO_DESEMPENO_QUERY_KEY(idsalon, idalumno),
    queryFn: () => fetchDesempenoAlumno(token, idsalon, idalumno),
    enabled: !!token && !!idalumno && !!idsalon && habilitado,
  });

  const idinteraccion = useMemo<string | null>(() => {
    const interacciones = desempenoQuery.data?.interacciones ?? [];
    const completadas = interacciones.filter((i) => i.completado);
    const ordenadas = [...completadas].sort((a, b) => {
      const ta = a.fechafin ? new Date(a.fechafin).getTime() : 0;
      const tb = b.fechafin ? new Date(b.fechafin).getTime() : 0;
      return tb - ta;
    });
    return ordenadas[0]?.idinteraccion ?? null;
  }, [desempenoQuery.data]);

  const reporteQuery = useQuery({
    queryKey: REPORTE_INTENTO_QUERY_KEY(idinteraccion ?? ""),
    queryFn: () => fetchReporteIntento(token, idinteraccion!),
    enabled: !!token && !!idinteraccion && habilitado,
  });

  const sinReportes =
    desempenoQuery.isSuccess && !desempenoQuery.isLoading && idinteraccion === null;

  return {
    data: reporteQuery.data,
    idinteraccion,
    isLoading:
      desempenoQuery.isLoading ||
      (!!idinteraccion && reporteQuery.isLoading),
    isError: desempenoQuery.isError || reporteQuery.isError,
    sinReportes,
  };
}
