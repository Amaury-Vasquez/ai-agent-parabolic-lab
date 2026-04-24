import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export interface EstudianteEnSalon {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  ultimo_acceso: string | null;
  escenarios_completados: number;
  total_escenarios: number;
}

export const SALON_ESTUDIANTES_QUERY_KEY = (salonId: string) => ["salones", salonId, "estudiantes"];

export async function fetchEstudiantesBySalon(
  token: string,
  salonId: string
): Promise<EstudianteEnSalon[]> {
  return get<EstudianteEnSalon[]>(`/salones/${salonId}/estudiantes`, { token });
}

export function useEstudiantesBySalon(salonId: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: SALON_ESTUDIANTES_QUERY_KEY(salonId),
    queryFn: () => fetchEstudiantesBySalon(token, salonId),
    enabled: !!token && !!salonId,
  });
}
