import { Button } from "amvasdev-ui";
import CustomLink from "@/components/CustomLink";
import { REGISTER_INSTITUTION_LINK } from "@/constants/navLinks";

const CTASection = () => (
  <section className="py-24 px-6 bg-gradient-to-r from-primary to-secondary">
    <div className="container max-w-5xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-primary-content mb-6">
        ¿Listo para transformar la enseñanza de física?
      </h2>
      <p className="text-xl text-primary-content/90 mb-10 leading-relaxed max-w-3xl mx-auto">
        Únete a las instituciones que ya están utilizando ParabolicLab para
        hacer el aprendizaje más interactivo y efectivo
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <CustomLink
          href={REGISTER_INSTITUTION_LINK}
          variant="base"
          size="lg"
          className="bg-base-100 text-primary hover:bg-base-200"
        >
          Registrar mi Institución
        </CustomLink>
        <Button
          variant="ghost"
          size="lg"
          className="text-primary-content border-2 border-primary-content hover:bg-primary-content/20"
        >
          Contactar al Equipo
        </Button>
      </div>
    </div>
  </section>
);

export default CTASection;
