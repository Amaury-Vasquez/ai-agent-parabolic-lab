import { Rocket } from "lucide-react";
import { getCurrentYear } from "@/utils/date";

const Footer = () => (
  <footer className="p-4 md:p-6 min-h-20 bg-base-200 border-t border-0 border-solid border-base-300 flex items-center justify-center gap-4 md:gap-8 flex-col md:flex-row max-md:text-center">
    <div className="flex items-center justify-center gap-2">
      <Rocket className="size-6 text-primary" />
      <span className="text-xl font-bold">ParabolicLab</span>
    </div>
    <p className="text-sm font-semibold">
      Copyright © {getCurrentYear()} - Todos los derechos reservados
    </p>
  </footer>
);

export default Footer;
