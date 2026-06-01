import { redirect } from "next/navigation";

// Los escenarios son una función que el docente crea y asigna a cada salón.
// El alumno solo accede a los escenarios asignados desde su salón, no a un
// listado global, por lo que esta ruta redirige a sus salones.
export default function EscenariosAlumnoPage() {
  redirect("/alumno");
}
