import Link from "next/link";
import CardsView from "./CardsView";
import { LOGIN_LINK } from "@/constants/navLinks";

const Registro = () => (
  <div className="bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Únete a ParabolicLab
        </h1>
        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
          Selecciona el tipo de registro que corresponda a tu situación
        </p>
      </div>
      <CardsView />
      <p className="text-center mt-8 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href={LOGIN_LINK} className="link link-primary font-medium">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  </div>
);

export default Registro;
