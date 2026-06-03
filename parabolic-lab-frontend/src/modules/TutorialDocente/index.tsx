"use client";
import { Button } from "amvasdev-ui";
import clsx from "clsx";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Lightbulb,
  Home,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── tipos ─────────────────────────────────────────────────── */

interface SeccionDef {
  id: string;
  label: string;
  titulo: string;
  icono: React.ReactNode;
  color: string;
}

/* ─── constantes ─────────────────────────────────────────────── */

const SECCIONES: SeccionDef[] = [
  {
    id: "bienvenida",
    label: "Bienvenida",
    titulo: "Bienvenida a ParabolicLab",
    icono: <GraduationCap className="size-8" />,
    color: "text-primary",
  },
  {
    id: "salones",
    label: "Mis Salones",
    titulo: "Gestión de Salones",
    icono: <Home className="size-8" />,
    color: "text-secondary",
  },
  {
    id: "biblioteca",
    label: "Biblioteca",
    titulo: "Biblioteca de Escenarios Didácticos",
    icono: <BookOpen className="size-8" />,
    color: "text-accent",
  },
  {
    id: "reportes",
    label: "Reportes",
    titulo: "Monitoreo y Analítica",
    icono: <BarChart3 className="size-8" />,
    color: "text-info",
  },
  {
    id: "perfil",
    label: "Mi Perfil",
    titulo: "Configuración de Perfil",
    icono: <User className="size-8" />,
    color: "text-primary",
  },
  {
    id: "listo",
    label: "Listo",
    titulo: "Sistema Configurado",
    icono: <CheckCircle className="size-8" />,
    color: "text-success",
  },
];

/* ─── sub-componentes ─────────────────────────────────────────── */

const ImagenSeccion = ({ src, alt }: { src: string; alt: string }) => (
  <div className="w-full overflow-hidden rounded-xl border border-base-300 bg-base-200">
    <img
      src={src}
      alt={alt}
      className="h-auto w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  </div>
);

const Tip = ({ texto }: { texto: string }) => (
  <div className="flex gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm">
    <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
    <span>
      <span className="font-semibold text-primary">Nota: </span>
      {texto}
    </span>
  </div>
);

interface SeccionProps {
  id: string;
  icono: React.ReactNode;
  color: string;
  titulo: string;
  children: React.ReactNode;
}

const Seccion = ({ id, icono, color, titulo, children }: SeccionProps) => (
  <section
    id={id}
    className="card bg-base-100 border border-solid border-base-300 shadow-sm scroll-mt-6"
  >
    <div className="card-body gap-5 p-5 md:p-7">
      <div className="flex items-center gap-3">
        <span className={clsx("p-2 rounded-xl bg-base-200", color)}>{icono}</span>
        <h2 className="text-xl md:text-2xl font-bold leading-tight">{titulo}</h2>
      </div>
      {children}
    </div>
  </section>
);

/* ─── módulo principal ────────────────────────────────────────── */

const TutorialDocente = () => {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Índice lateral — solo desktop */}
      <aside className="hidden lg:block w-52 shrink-0">
        <nav className="sticky top-6 flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase opacity-50 mb-1 px-2">
            Contenido
          </p>
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm px-3 py-1.5 rounded-lg hover:bg-base-200 transition-colors opacity-70 hover:opacity-100 leading-snug"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 min-w-0 flex flex-col gap-5">
        {/* ① Bienvenida */}
        <Seccion
          id="bienvenida"
          icono={<GraduationCap className="size-8" />}
          color="text-primary"
          titulo="Bienvenida a ParabolicLab"
        >
          <p className="text-base leading-relaxed">
            <strong>ParabolicLab</strong> es una plataforma de gestión académica y
            simulación de tiro parabólico. Este tutorial le guiará a través de las
            herramientas de administración, creación de material didáctico y monitoreo
            del rendimiento estudiantil.
          </p>
        </Seccion>
        {/* ② Gestión de Salones */}
        <Seccion
          id="salones"
          icono={<Home className="size-8" />}
          color="text-secondary"
          titulo="Gestión de Salones"
        >
          <p className="leading-relaxed">
            Los <strong>salones</strong> representan sus grupos académicos. Desde el
            panel principal puede crear nuevos espacios, generar{" "}
            <strong>códigos de acceso únicos</strong> para la matriculación de alumnos
            y administrar la estructura de sus clases.
          </p>

          <ImagenSeccion
            src="/paginadocente.png"
            alt="Panel de salones con tarjetas de grupo y código de acceso visible"
          />

          <Tip texto="Utilice el icono de engranaje en cada tarjeta de salón para editar su nombre o desvincular escenarios asignados." />
          <Button
            outlined
            className="mt-4 w-fit"
            onClick={() => router.push("/docente")}
          >
            Ir a Mis Salones
          </Button>
        </Seccion>

        {/* ③ Biblioteca de Escenarios */}
        <Seccion
          id="biblioteca"
          icono={<BookOpen className="size-8" />}
          color="text-accent"
          titulo="Biblioteca de Escenarios Didácticos"
        >
          <p className="leading-relaxed">
            La biblioteca es su repositorio central de material interactivo. Aquí puede
            diseñar nuevos escenarios físicos definiendo variables como{" "}
            <strong>velocidad</strong>, <strong>ángulo</strong>, <strong>gravedad</strong>{" "}
            y metas específicas. Una vez creados, puede asignarlos de forma individual o
            masiva a sus distintos salones.
          </p>

          <ImagenSeccion
            src="/biblioteca.png"
            alt="Biblioteca de escenarios con listado de escenarios creados y opciones de asignación"
          />

          <Tip texto="Un escenario puede reutilizarse y asignarse a múltiples salones simultáneamente, optimizando su tiempo de planeación didáctica." />
          <Button
            outlined
            className="mt-4 w-fit"
            onClick={() => router.push("/docente/biblioteca")}
          >
            Ir a la Biblioteca
          </Button>
        </Seccion>

        {/* ④ Reportes y Analítica */}
        <Seccion
          id="reportes"
          icono={<BarChart3 className="size-8" />}
          color="text-info"
          titulo="Monitoreo y Analítica"
        >
          <p className="leading-relaxed">
            Visualice el rendimiento de sus estudiantes de forma granular. El sistema
            aísla los datos por salón, permitiéndole evaluar el progreso, la cantidad de
            intentos, el tiempo invertido y las calificaciones de manera precisa y
            exportable.
          </p>

          <ImagenSeccion
            src="/reportesdesempeño.png"
            alt="Panel de reportes con gráficas de rendimiento por salón y estudiante"
          />

          <Tip texto="Puede exportar los resultados de cualquier estudiante o salón a formato PDF o CSV para integrarlos en sus registros de evaluación institucional." />
          <Button
            outlined
            className="mt-4 w-fit"
            onClick={() => router.push("/docente/reportes")}
          >
            Ir a Reportes
          </Button>
        </Seccion>

        {/* ⑤ Configuración de Perfil */}
        <Seccion
          id="perfil"
          icono={<User className="size-8" />}
          color="text-primary"
          titulo="Configuración de Perfil"
        >
          <p className="leading-relaxed">
            Gestione su información institucional, actualice la asignatura que imparte y
            personalice la apariencia de la plataforma mediante la selección de temas de
            interfaz adaptables al entorno académico.
          </p>

          <ImagenSeccion
            src="/perfildocente.png"
            alt="Página de perfil con formulario de datos personales y selector de tema"
          />

          <Button
            outlined
            className="mt-4 w-fit"
            onClick={() => router.push("/docente/perfil")}
          >
            Ir a Mi Perfil
          </Button>
        </Seccion>

        {/* ⑥ Sistema Configurado */}
        <Seccion
          id="listo"
          icono={<CheckCircle className="size-8" />}
          color="text-success"
          titulo="Sistema Configurado"
        >
          <p className="text-base leading-relaxed">
            Su entorno de trabajo está listo. Si requiere consultar este manual
            nuevamente, lo encontrará disponible en su panel de configuración de perfil.
          </p>
          <div className="flex justify-center mt-6">
            <Button
              variant="primary"
              className="active:scale-95"
              onClick={() => router.push("/docente")}
            >
              Ir al Panel Principal
            </Button>
          </div>
        </Seccion>
      </main>
    </div>
  );
};

export default TutorialDocente;