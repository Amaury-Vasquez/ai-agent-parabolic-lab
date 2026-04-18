import {
  BarChart3,
  BookOpen,
  FlaskConical,
  Gamepad2,
  LucideIcon,
  Trophy,
  Users,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: FlaskConical,
    title: "Laboratorio Virtual",
    description:
      "Experimenta con variables como ángulo, fuerza y número de proyectiles. Observa en tiempo real el impacto de cada ajuste.",
  },
  {
    icon: Gamepad2,
    title: "Minijuegos Educativos",
    description:
      "Aprende jugando con escenarios virtuales desafiantes que combinan física y gamificación.",
  },
  {
    icon: BarChart3,
    title: "Análisis de Datos",
    description:
      "Evalua el progreso de tus alumnos con métricas claras sobre el desempeño.",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description:
      "Los docentes pueden comparar el rendimiento de los estudiantes y fomentar la competencia sana.",
  },
  {
    icon: BookOpen,
    title: "Escenarios Personalizados",
    description:
      "Biblioteca de escenarios alineados con los objetivos curriculares de 2° de secundaria.",
  },
  {
    icon: Users,
    title: "Gestión de Grupos",
    description:
      "Herramientas para docentes que facilitan la administración de salones y seguimiento del progreso.",
  },
];

const FeaturesSection = () => (
  <section className="py-24 px-6 bg-base-100">
    <div className="container max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          ¿Qué hace especial a ParabolicLab?
        </h2>
        <p className="text-lg text-base-content/70 max-w-3xl mx-auto">
          Una plataforma completa que combina simulación física, gamificación y
          herramientas de análisis para docentes
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-base-200 rounded-2xl p-8 hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <feature.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-base-content/70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
