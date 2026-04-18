"use client";
import { Building2, GraduationCap, UserCircle } from "lucide-react";
import RegistrationCard from "./RegistrationCard";
import RegistrationCardWithInput from "./RegistrationCardWithInput";
import { REGISTER_INSTITUTION_LINK } from "@/constants/navLinks";

const CardsView = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {/* Institution/Principal Card */}
    <RegistrationCard
      icon={Building2}
      title="Institución Educativa"
      description="Soy director o docente y quiero registrar mi institución para comenzar a usar ParabolicLab con mis estudiantes."
      href={REGISTER_INSTITUTION_LINK}
      buttonText="Registrar Institución"
    />
    {/* Teacher Card */}
    <RegistrationCardWithInput
      icon={UserCircle}
      title="Docente"
      description="Soy docente de una institución ya registrada y tengo el ID de mi institución para unirme como profesor."
      baseHref="/registro/[institutionId]/docente"
      buttonText="Registrarme como Docente"
    />
    {/* Student Card */}
    <RegistrationCardWithInput
      icon={GraduationCap}
      title="Alumno"
      description="Ya pertenezco a una institución registrada y tengo el ID de mi institución para crear mi cuenta de estudiante."
      baseHref="/registro/[institutionId]/alumno"
      buttonText="Registrarme como Alumno"
    />
  </div>
);

export default CardsView;
