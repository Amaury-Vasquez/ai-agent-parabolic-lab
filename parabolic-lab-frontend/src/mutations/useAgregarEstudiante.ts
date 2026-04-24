import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { EstudianteEnSalon, SALON_ESTUDIANTES_QUERY_KEY } from "@/queries/useEstudiantesBySalon";

export async function agregarEstudianteASalon(
  token: string,
  salonId: string,
  correoAlumno: string
): Promise<EstudianteEnSalon> {
  return post<EstudianteEnSalon>(
    `/salones/${salonId}/agregar-estudiante`,
    { correo: correoAlumno },
    { token }
  );
}

export function useAgregarEstudiante() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutateAsync: agregarEstudiante, ...rest } = useMutation({
    mutationFn: ({ salonId, correoAlumno }: { salonId: string; correoAlumno: string }) =>
      agregarEstudianteASalon(token, salonId, correoAlumno),
    onSuccess: (_, { salonId }) => {
      queryClient.invalidateQueries({ queryKey: SALON_ESTUDIANTES_QUERY_KEY(salonId) });
    },
  });
  return { agregarEstudiante, ...rest };
}
