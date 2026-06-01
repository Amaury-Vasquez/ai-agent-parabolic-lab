import { redirect } from "next/navigation";

// El alumno no interactúa con escenarios fuera del contexto de un salón.
// El acceso al simulador ocurre desde su salón
// (/alumno/salon/[classroomId]/escenario/[idescenario]) o desde una actividad,
// así que esta ruta directa redirige a sus salones.
export default function SimuladorDirectoPage() {
  redirect("/alumno");
}
