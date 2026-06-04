export interface PasoTutorial {
  emoji: string;
  titulo: string;
  descripcion: string;
}

// Claves de localStorage para no volver a mostrar el toast de tutorial una
// vez que el usuario lo aceptó o lo descartó.
export const TUTORIAL_PROMPT_STORAGE_KEYS = {
  docente: "tutorial-prompt-docente",
  alumno: "tutorial-prompt-alumno",
  admin: "tutorial-prompt-admin",
} as const;

export const DOCENTE_TUTORIAL_PASOS: PasoTutorial[] = [
  {
    emoji: "🚀",
    titulo: "¡Bienvenido a Parabolic-Lab!",
    descripcion:
      "La plataforma donde gestionar tus clases de física se vuelve interactivo. Aquí crearás salones, diseñarás simulaciones y seguirás el avance de cada estudiante.",
  },
  {
    emoji: "🏫",
    titulo: "Gestiona tus Salones",
    descripcion:
      "Crea salones con el botón '+'. Cada tarjeta tiene un engranaje para editar el nombre, ver y eliminar escenarios asignados, puedes ver los leaderboards de tus estudiantes inscritos en ese salón en VER PROGRESO.",
  },
  {
    emoji: "👥",
    titulo: "Ver Progreso",
    descripcion:
      "En VER PROGRESO puedes ver los leaderboards de tus estudiantes inscritos en ese salón, gestionar sus perfiles, presionando el boton de 👥 podras ver a detalle su fecha de inscripcion y datos del mismo, al igual que eliminar del salón con el botón de basura y agregar un estudiante manualmente mediante su correo registrado en el botón de +Agregar estudiante.",
  },
  {
    emoji: "🔬",
    titulo: "Biblioteca de Escenarios",
    descripcion:
      "Desde la Biblioteca creas escenarios de tiro parabólico: configuras física, dificultad e instrucciones para tus alumnos. Luego los asignas a los salones que elijas.",
  },
  {
    emoji: "📊",
    titulo: "Reportes y Progreso",
    descripcion:
      "Visualiza el avance de tus estudiantes por salón y descarga reportes oficiales en PDF y CSV con sus estadisticas y desempeños en las simulaciones.",
  },
  {
    emoji: "💡",
    titulo: "¿Necesitas recordar algo?",
    descripcion:
      "Puedes volver a ver este tutorial en cualquier momento entrando a tu Perfil y presionando el botón 'Ver tutorial'.",
  },
];

export const ADMIN_TUTORIAL_PASOS: PasoTutorial[] = [
  {
    emoji: "🚀",
    titulo: "¡Bienvenido a Parabolic-Lab!",
    descripcion:
      "Como administrador supervisas toda la actividad de tu institución: usuarios, salones y el desempeño general de los estudiantes.",
  },
  {
    emoji: "🏢",
    titulo: "Resumen de tu Institución",
    descripcion:
      "En el panel principal encuentras el ID de tu institución (compártelo con docentes y alumnos para que se registren) y las métricas globales: docentes, alumnos y salones activos.",
  },
  {
    emoji: "👥",
    titulo: "Gestión de Usuarios",
    descripcion:
      "En la sección Usuarios puedes consultar a los docentes y alumnos registrados en tu institución, revisar sus datos y administrar sus cuentas.",
  },
  {
    emoji: "🏫",
    titulo: "Salones",
    descripcion:
      "En Salones ves todos los grupos de tu institución, qué docente los imparte, sus códigos de acceso y los escenarios asignados.",
  },
  {
    emoji: "📊",
    titulo: "Actividad de Alumnos",
    descripcion:
      "En Actividad de Alumnos sigues el desempeño de los estudiantes en las simulaciones y puedes descargar reportes con sus estadísticas.",
  },
];
