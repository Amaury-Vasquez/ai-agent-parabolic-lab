import { Building2, Rocket, Zap } from "lucide-react";
import CustomLink from "@/components/CustomLink";
import { REGISTER_INSTITUTION_LINK } from "@/constants/navLinks";

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center px-6 py-20">
      <div className="container max-w-6xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Física Interactiva
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Aprende Física de Manera{" "}
            <span className="text-primary">Divertida</span> e{" "}
            <span className="text-secondary">Interactiva</span>
          </h1>

          <p className="text-lg md:text-xl text-base-content/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Laboratorio virtual de tiro parabólico diseñado para alumnos de 2°
            de secundaria. Experimenta con variables físicas, resuelve desafíos
            y domina los conceptos de movimiento de proyectiles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            <CustomLink
              variant="primary"
              size="lg"
              href={REGISTER_INSTITUTION_LINK}
            >
              <Building2 size="16" />
              Registrar Institución
            </CustomLink>
            <CustomLink variant="ghost" size="lg" href="/simulador">
              Probar simulador <Rocket size="16" />
            </CustomLink>
          </div>
        </div>
      </div>
    </section>
  );
}
