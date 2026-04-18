import { BarChart3, LucideIcon, Target, Trophy } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: BarChart3,
    title: "Reportes Detallados",
    description:
      "Visualiza el progreso individual y grupal con métricas claras sobre el desempeño.",
  },
  {
    icon: Target,
    title: "Alineación Curricular",
    description:
      "Todos los escenarios están diseñados conforme a los objetivos educativos de 2° de secundaria.",
  },
  {
    icon: Trophy,
    title: "Motivación Estudiantil",
    description:
      "El sistema de leaderboards y gamificación mantiene a los alumnos comprometidos.",
  },
];

const TeacherBenefitsSection = () => (
  <section className="py-24 px-6 bg-gradient-to-br from-base-200 to-base-100">
    <div className="container max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Herramientas Poderosas para Docentes
          </h2>

          <div className="space-y-8">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-base-content/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Stats Dashboard */}
        <div className="bg-base-200 rounded-3xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-8">Panel de Control Docente</h3>

          <div className="space-y-6">
            <div className="bg-base-100 rounded-2xl p-6">
              <p className="text-sm text-base-content/60 mb-2">
                Estudiantes Activos
              </p>
              <p className="text-5xl font-bold text-primary mb-2">156</p>
              <p className="text-sm text-success">
                ↗︎ 12% más que el mes pasado
              </p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6">
              <p className="text-sm text-base-content/60 mb-2">
                Escenarios Completados
              </p>
              <p className="text-5xl font-bold text-secondary mb-2">1,284</p>
              <p className="text-sm text-base-content/60">
                En las últimas 4 semanas
              </p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6">
              <p className="text-sm text-base-content/60 mb-2">
                Promedio de Precisión
              </p>
              <p className="text-5xl font-bold text-accent mb-2">87%</p>
              <p className="text-sm text-success">Mejorando constantemente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TeacherBenefitsSection;
