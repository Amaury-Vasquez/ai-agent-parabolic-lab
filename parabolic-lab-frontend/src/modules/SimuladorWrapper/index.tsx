"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { Scenario } from "@/models/scenario";
import SimuladorTiroParabolico from "@/modules/SimuladorTiroParabolico";
import { createInteraccion, updateInteraccion } from "@/fetchers/interacciones";
import { useUser } from "@stackframe/stack";

interface SimuladorWrapperProps {
  idactividad: string;
  idescenario: string;
  scenario: Scenario | null;
}

const SimuladorWrapper = ({
  idactividad,
  idescenario,
  scenario,
}: SimuladorWrapperProps) => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const user = useUser();
  const router = useRouter();
  const interaccionId = useRef<string | null>(null);
  const startTime = useRef<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    const iniciarInteraccion = async () => {
      try {
        const interaccion = await createInteraccion(token, {
          idescenario,
          idalumno: user.id,
        });
        interaccionId.current = interaccion.idinteraccion;
        startTime.current = new Date();
      } catch (error) {
        console.error("Error al iniciar interacción:", error);
      } finally {
        setLoading(false);
      }
    };

    iniciarInteraccion();
  }, [token, user, idescenario]);

  const handleTerminar = async () => {
    if (!interaccionId.current || !token) return;

    const fechafin = new Date();
    const tiempototal = Math.floor(
      (fechafin.getTime() - startTime.current.getTime()) / 1000
    );

    try {
      await updateInteraccion(token, interaccionId.current, {
        fechafin: fechafin.toISOString(),
        tiempototal,
        completado: true,
      });
    } catch (error) {
      console.error("Error al terminar interacción:", error);
    }

    router.push(`/alumno/actividad/${idactividad}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <SimuladorTiroParabolico scenario={scenario ?? undefined} />
      <button
        className="btn btn-primary w-full md:w-auto md:self-end"
        onClick={handleTerminar}
      >
        Terminar actividad
      </button>
    </div>
  );
};

export default SimuladorWrapper;