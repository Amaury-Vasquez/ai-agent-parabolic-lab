import { Building2 } from "lucide-react";
import ProfileField from "@/components/ProfileField";
import SectionCard from "@/components/SectionCard";
import type { Institucion } from "@/models/institucion";

interface InstitucionCardProps {
  institucion: Institucion;
}

const InstitucionCard = ({ institucion }: InstitucionCardProps) => (
  <SectionCard
    icon={<Building2 size={22} />}
    title="Mi Institución"
    description="Tu centro educativo"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ProfileField
        icon={<Building2 size={16} />}
        label="Nombre"
        value={institucion.nombre}
      />
    </div>
  </SectionCard>
);

export default InstitucionCard;
