"use client";
import { Button } from "amvasdev-ui";
import clsx from "clsx";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Lightbulb,
  Rocket,
  SkipForward,
  Star,
  Target,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMe } from "@/queries/useMe";

const tutorialStorageKey = (idusuario: string) => `tutorial_visto_${idusuario}`;

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
  { id: "bienvenida",  label: "Bienvenida",             titulo: "¡Bienvenido a ParabolicLab!",          icono: <Rocket className="size-8" />,      color: "text-primary" },
  { id: "salones",     label: "Mis Salones",             titulo: "Mis Salones",                          icono: <Home className="size-8" />,         color: "text-secondary" },
  { id: "escenarios",  label: "Escenarios y Actividades",titulo: "Mis Escenarios y Actividades",         icono: <BookOpen className="size-8" />,     color: "text-accent" },
  { id: "simulador",   label: "El Simulador",            titulo: "El Simulador de Tiro Parabólico",      icono: <Target className="size-8" />,       color: "text-warning" },
  { id: "reportes",    label: "Reportes",                titulo: "Reportes de tus Intentos",             icono: <FileText className="size-8" />,     color: "text-info" },
  { id: "progreso",    label: "Mi Progreso",             titulo: "Mi Progreso",                          icono: <BarChart3 className="size-8" />,    color: "text-success" },
  { id: "logros",      label: "Logros y Ranking",        titulo: "Logros y Ranking",                     icono: <Trophy className="size-8" />,       color: "text-warning" },
  { id: "perfil",      label: "Mi Perfil",               titulo: "Mi Perfil",                            icono: <User className="size-8" />,         color: "text-primary" },
  { id: "listo",       label: "¡Listo!",                 titulo: "¡Todo listo para empezar!",            icono: <CheckCircle className="size-8" />,  color: "text-success" },
];

/* ─── sub-componentes ─────────────────────────────────────────── */

const ImagenPlaceholder = ({ descripcion }: { descripcion: string }) => (
  <div className="w-full rounded-xl bg-base-200 border border-dashed border-base-300 flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
    <HelpCircle className="size-8 opacity-30" />
    <p className="text-sm opacity-40 italic">{descripcion}</p>
  </div>
);

const Tip = ({ texto }: { texto: string }) => (
  <div className="flex gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm">
    <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
    <span><span className="font-semibold text-primary">Consejo: </span>{texto}</span>
  </div>
);

interface LogroMiniProps {
  icono: React.ReactNode;
  titulo: string;
  condicion: string;
}

const LogroMini = ({ icono, titulo, condicion }: LogroMiniProps) => (
  <div className="flex items-start gap-2 bg-base-200 rounded-lg p-2.5">
    <span className="text-warning mt-0.5">{icono}</span>
    <div>
      <p className="text-sm font-semibold leading-snug">{titulo}</p>
      <p className="text-xs opacity-60">{condicion}</p>
    </div>
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

const TutorialAlumno = () => {
  const { data: me } = useMe();
  const router = useRouter();

  const handleComenzar = () => {
    if (me?.idusuario) {
      localStorage.setItem(tutorialStorageKey(me.idusuario), "1");
    }
    router.push("/alumno");
  };

  const handleOmitir = () => {
    if (me?.idusuario) {
      localStorage.setItem(tutorialStorageKey(me.idusuario), "1");
    }
    router.push("/alumno");
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Índice lateral — solo desktop */}
      <aside className="hidden lg:block w-52 shrink-0">
        <nav className="sticky top-6 flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase opacity-50 mb-1 px-2">Contenido</p>
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

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOmitir}
            className="gap-2"
          >
            <SkipForward className="size-4" />
            Omitir tutorial
          </Button>
        </div>

        {/* ① Bienvenida */}
        <Seccion id="bienvenida" icono={<Rocket className="size-8" />} color="text-primary" titulo="¡Bienvenido a ParabolicLab!">
          <p className="text-base leading-relaxed">
            ¡Hola! 👋 <strong>ParabolicLab</strong> es tu laboratorio virtual de física donde
            vas a lanzar proyectiles, calcular trayectorias y aprender todo sobre el
            <strong> tiro parabólico</strong> de una forma divertida e interactiva.
          </p>
          <p className="leading-relaxed opacity-80">
            Tu profe ya armó los escenarios y actividades. Solo tienes que unirte a tu salón,
            practicar en el simulador y ver cómo mejoras con cada intento. ¡Este tutorial
            te explica todo paso a paso!
          </p>
          <ImagenPlaceholder descripcion="Imagen: pantalla principal de ParabolicLab con el simulador en acción" />
          <Tip texto="Puedes regresar a este tutorial en cualquier momento desde el menú lateral, en la sección 'Tutorial'." />
        </Seccion>

        {/* ② Mis Salones */}
        <Seccion id="salones" icono={<Home className="size-8" />} color="text-secondary" titulo="Mis Salones">
          <p className="leading-relaxed">
            Los <strong>salones</strong> son como tus grupos de clase en la app. Tu profe
            crea el salón y te da un <strong>código de acceso</strong> (una combinación
            de letras y números). Con ese código te unes desde la app.
          </p>
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="size-4 text-secondary" /> ¿Cómo me uno a un salón?
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-sm leading-relaxed opacity-90 pl-1">
              <li>Ve a <strong>Mis Salones</strong> en el menú lateral.</li>
              <li>Haz clic en el botón <strong className="text-primary">"Unirse a un Salón"</strong>.</li>
              <li>Escribe el <strong>código de acceso</strong> que te dio tu profe.</li>
              <li>¡Listo! Ya verás el salón en tu pantalla.</li>
            </ol>
          </div>
          <ImagenPlaceholder descripcion="Imagen: modal de 'Unirse a un Salón' con el campo del código de acceso" />
          <Tip texto="Si tu profe aún no te ha dado el código, escríbele. Sin el código no podrás unirte." />
        </Seccion>

        {/* ③ Escenarios y Actividades */}
        <Seccion id="escenarios" icono={<BookOpen className="size-8" />} color="text-accent" titulo="Mis Escenarios y Actividades">
          <p className="leading-relaxed">
            Dentro de tu salón hay <strong>escenarios</strong>: son retos de física que
            tu profe diseñó para que practiques. Cada escenario tiene un objetivo,
            instrucciones y un simulador configurado con parámetros específicos.
          </p>
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="size-4 text-accent" /> ¿Qué son las actividades?
            </h3>
            <p className="text-sm leading-relaxed opacity-90">
              Las <strong>actividades</strong> agrupan varios escenarios en una tarea
              con fecha y objetivo. Tu profe puede asignarte actividades con varios retos
              que debes completar. Las encontrarás en <strong>Mis Actividades</strong> del menú.
            </p>
          </div>
          <ImagenPlaceholder descripcion="Imagen: lista de escenarios disponibles con su nivel de dificultad y estado" />
          <Tip texto="Un escenario 'En progreso' significa que ya lo iniciaste pero no terminaste. ¡Puedes retomarlo cuando quieras!" />
        </Seccion>

        {/* ④ El Simulador */}
        <Seccion id="simulador" icono={<Target className="size-8" />} color="text-warning" titulo="El Simulador de Tiro Parabólico">
          <p className="leading-relaxed">
            El simulador es el corazón de ParabolicLab. Aquí vas a disparar un proyectil
            ajustando el <strong>ángulo</strong> y la <strong>velocidad inicial</strong>
            para intentar alcanzar un objetivo en la distancia indicada.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { titulo: "Ángulo de disparo", desc: "Entre 0° y 90°. A 45° obtienes el mayor alcance.", icono: "📐" },
              { titulo: "Velocidad inicial", desc: "Qué tan fuerte sale el proyectil (en m/s).", icono: "💨" },
              { titulo: "Botón de disparo", desc: "Lanza el proyectil con los valores actuales.", icono: "🚀" },
              { titulo: "Panel de resolución", desc: "Escribe tu procedimiento matemático y respuestas.", icono: "✏️" },
            ].map(({ titulo, desc, icono }) => (
              <div key={titulo} className="bg-base-200 rounded-xl p-3 flex gap-2.5 items-start">
                <span className="text-xl leading-none mt-0.5">{icono}</span>
                <div>
                  <p className="font-semibold text-sm">{titulo}</p>
                  <p className="text-xs opacity-70 leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="leading-relaxed opacity-80 text-sm">
            Cuando hayas terminado todos tus intentos, presiona{" "}
            <strong className="text-primary">"Terminar actividad"</strong>. Esto marca
            el escenario como <strong>completado</strong> y genera tu reporte automáticamente.
          </p>
          <ImagenPlaceholder descripcion="Imagen: interfaz del simulador mostrando el cañón, la trayectoria y los controles" />
          <Tip texto="¡No te preocupes si no aciertas al primer intento! El simulador guarda tu progreso automáticamente cada vez que disparas." />
        </Seccion>

        {/* ⑤ Reportes */}
        <Seccion id="reportes" icono={<FileText className="size-8" />} color="text-info" titulo="Reportes de tus Intentos">
          <p className="leading-relaxed">
            Cuando completas un escenario, <strong>ParabolicLab genera un reporte automático</strong>{" "}
            con todo lo que hiciste. Aparece en un modal justo al terminar, y también
            puedes verlo después desde <strong>Mi Progreso</strong>.
          </p>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">¿Qué tiene el reporte?</h3>
            <ul className="space-y-1.5 text-sm opacity-90 leading-relaxed">
              <li>📊 <strong>Tus datos:</strong> ángulo, velocidad, distancia, tiempo y puntuación</li>
              <li>🔍 <strong>Análisis:</strong> comparación de tus respuestas con la solución correcta</li>
              <li>📈 <strong>Gráfica:</strong> la trayectoria real de tu proyectil</li>
              <li>🏆 <strong>Comparativa:</strong> cómo te fue en intentos anteriores del mismo escenario</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-outline badge-sm">📄 Descargar en PDF</span>
            <span className="badge badge-outline badge-sm">📊 Descargar en Excel (XLSX)</span>
            <span className="badge badge-outline badge-sm">🖨️ Imprimir</span>
          </div>
          <ImagenPlaceholder descripcion="Imagen: modal de reporte con la gráfica de trayectoria y tabla de análisis" />
          <Tip texto="Puedes revisitar tus reportes anteriores en 'Mi Progreso' haciendo clic en 'Ver reporte' en cualquier intento completado." />
        </Seccion>

        {/* ⑥ Mi Progreso */}
        <Seccion id="progreso" icono={<BarChart3 className="size-8" />} color="text-success" titulo="Mi Progreso">
          <p className="leading-relaxed">
            En <strong>Mi Progreso</strong> puedes ver un resumen de todo lo que has hecho
            en ParabolicLab: cuántos escenarios completaste, tu puntuación promedio,
            tu mejor nota y el tiempo total que has practicado.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { emoji: "🗂️", label: "Escenarios totales", desc: "Cuántos escenarios has iniciado" },
              { emoji: "✅", label: "Completados", desc: "Los que terminaste hasta el final" },
              { emoji: "⭐", label: "Puntuación promedio", desc: "El promedio de todos tus intentos" },
              { emoji: "⏱️", label: "Tiempo total", desc: "Minutos u horas que has practicado" },
            ].map(({ emoji, label, desc }) => (
              <div key={label} className="bg-base-200 rounded-xl p-3 text-center flex flex-col gap-1 items-center">
                <span className="text-2xl">{emoji}</span>
                <p className="text-xs font-semibold leading-snug">{label}</p>
                <p className="text-[10px] opacity-50 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
          <ImagenPlaceholder descripcion="Imagen: página Mi Progreso con estadísticas y tabla de interacciones recientes" />
          <Tip texto="La tabla de 'Interacciones recientes' muestra todos tus intentos. Los completados tienen el botón 'Ver reporte'." />
        </Seccion>

        {/* ⑦ Logros */}
        <Seccion id="logros" icono={<Trophy className="size-8" />} color="text-warning" titulo="Logros y Ranking">
          <p className="leading-relaxed">
            ¡Completa retos y gana <strong>logros</strong>! Son medallas virtuales que
            desbloqueas al cumplir objetivos dentro de la app. Hay 7 logros disponibles:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <LogroMini icono={<Trophy className="size-4" />} titulo="Primer escenario completado" condicion="Completa tu primer escenario" />
            <LogroMini icono={<Star className="size-4" />} titulo="En camino" condicion="Completa 3 escenarios" />
            <LogroMini icono={<Award className="size-4" />} titulo="Maestro del simulador" condicion="Completa 5 escenarios" />
            <LogroMini icono={<GraduationCap className="size-4" />} titulo="Estudiante dedicado" condicion="Completa 10 escenarios" />
            <LogroMini icono={<Target className="size-4" />} titulo="Puntuación perfecta" condicion="Obtén 100 puntos en algún escenario" />
            <LogroMini icono={<Compass className="size-4" />} titulo="Explorador" condicion="Interactúa con 10 escenarios distintos" />
            <LogroMini icono={<Clock className="size-4" />} titulo="Hora de práctica" condicion="Acumula 60 minutos de práctica" />
          </div>
          <ImagenPlaceholder descripcion="Imagen: página de Logros con las medallas desbloqueadas y las que faltan" />
          <Tip texto="Los logros bloqueados se muestran en gris. ¡Ve completando escenarios para desbloquearlos todos!" />
        </Seccion>

        {/* ⑧ Mi Perfil */}
        <Seccion id="perfil" icono={<User className="size-8" />} color="text-primary" titulo="Mi Perfil">
          <p className="leading-relaxed">
            En <strong>Mi Perfil</strong> puedes editar tu información personal como
            nombre y apellido, ver tu institución y correo, revisar tus últimos logros
            y cambiar el <strong>tema visual</strong> de la aplicación.
          </p>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">¿Qué puedo hacer desde Mi Perfil?</h3>
            <ul className="text-sm space-y-1.5 leading-relaxed opacity-90">
              <li>✏️ <strong>Editar</strong> tu nombre y apellido</li>
              <li>🎨 <strong>Cambiar el tema</strong> visual (oscuro, claro, colorido...)</li>
              <li>🏫 Ver tu institución y correo registrado</li>
              <li>🏆 Ver tus últimos logros desbloqueados</li>
            </ul>
          </div>
          <ImagenPlaceholder descripcion="Imagen: página Mi Perfil con el formulario de edición y selector de tema" />
          <Tip texto="El tema que elijas se guarda en tu cuenta. La próxima vez que entres, la app lo recordará." />
        </Seccion>

        {/* ⑨ Listo */}
        <Seccion id="listo" icono={<CheckCircle className="size-8" />} color="text-success" titulo="¡Todo listo para empezar!">
          <p className="text-base leading-relaxed">
            ¡Ya conoces todo lo que necesitas para usar <strong>ParabolicLab</strong>! 🎉
          </p>
          <p className="leading-relaxed opacity-80">
            Recuerda: puedes regresar a este tutorial cuando quieras desde el menú lateral.
            No dudes en explorar, equivocarte y volver a intentarlo — eso es exactamente
            de lo que se trata la ciencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 bg-base-200 rounded-xl p-4 text-sm">
            <div className="flex-1 flex flex-col gap-1">
              <p className="font-semibold">Tus próximos pasos:</p>
              <ol className="list-decimal list-inside space-y-1 opacity-80">
                <li>Únete a tu salón con el código de tu profe</li>
                <li>Abre un escenario o actividad asignada</li>
                <li>¡Lanza tu primer proyectil en el simulador!</li>
              </ol>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleComenzar}
              className="w-full sm:w-auto px-10"
            >
              <Rocket className="size-5" />
              ¡Comenzar mi aventura!
            </Button>
          </div>
        </Seccion>

      </main>
    </div>
  );
};

export default TutorialAlumno;
