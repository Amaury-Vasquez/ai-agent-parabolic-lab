import { Button } from "amvasdev-ui";
import { Building2, Edit2, MapPin, Phone } from "lucide-react";
import { ChangeEvent } from "react";
import FormField from "@/components/FormField";
import ProfileField from "@/components/ProfileField";
import SectionCard from "@/components/SectionCard";
import type { Institucion } from "@/models/institucion";
import type { InstitutionFormState } from "./helpers";

interface InstitutionInfoCardProps {
  institucion: Institucion;
  isAdmin: boolean;
  isEditing: boolean;
  isSaving: boolean;
  form: InstitutionFormState;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const InstitutionInfoCard = ({
  institucion,
  isAdmin,
  isEditing,
  isSaving,
  form,
  onEdit,
  onCancel,
  onChange,
  onSave,
}: InstitutionInfoCardProps) => (
  <SectionCard
    icon={<Building2 size={22} />}
    title="Información de la Institución"
    description={
      isAdmin
        ? "Gestiona los datos de tu institución"
        : "Datos de tu institución"
    }
    action={
      !isEditing && isAdmin ? (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 size={16} />
          Editar
        </Button>
      ) : null
    }
  >
    {!isEditing ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ProfileField
          icon={<Building2 size={16} />}
          label="Nombre"
          value={institucion.nombre}
        />
        {isAdmin ? (
          <>
            <ProfileField
              icon={<MapPin size={16} />}
              label="Dirección"
              value={institucion.direccion}
            />
            <ProfileField
              icon={<Phone size={16} />}
              label="Teléfono"
              value={institucion.telefono}
            />
          </>
        ) : null}
      </div>
    ) : isAdmin ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="inst-nombre"
            name="nombre"
            label="Nombre de Institución"
            placeholder="Colegio Nacional"
            value={form.nombre}
            onChange={onChange}
          />
          <FormField
            id="inst-direccion"
            name="direccion"
            label="Dirección"
            placeholder="Calle Principal 123"
            value={form.direccion}
            onChange={onChange}
          />
          <FormField
            id="inst-telefono"
            name="telefono"
            label="Teléfono"
            placeholder="(555) 123-4567"
            value={form.telefono}
            onChange={onChange}
          />
        </div>
        <div className="flex gap-3 pt-2 flex-wrap">
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
        </div>
      </div>
    ) : null}
  </SectionCard>
);

export default InstitutionInfoCard;
