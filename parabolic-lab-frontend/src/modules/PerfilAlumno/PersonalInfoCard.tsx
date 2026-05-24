import { Button } from "amvasdev-ui";
import { Edit2, Mail, User } from "lucide-react";
import { ChangeEvent } from "react";
import FormField from "@/components/FormField";
import ProfileField from "@/components/ProfileField";
import SectionCard from "@/components/SectionCard";
import type { UserProfile } from "@/models/user";
import type { ProfileFormState } from "./helpers";

interface PersonalInfoCardProps {
  user: UserProfile;
  isEditing: boolean;
  isSaving: boolean;
  form: ProfileFormState;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const PersonalInfoCard = ({
  user,
  isEditing,
  isSaving,
  form,
  onEdit,
  onCancel,
  onChange,
  onSave,
}: PersonalInfoCardProps) => (
  <SectionCard
    icon={<User size={22} />}
    title="Información Personal"
    description="Mantén tus datos actualizados"
    action={
      !isEditing ? (
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
          icon={<User size={16} />}
          label="Nombre"
          value={user.nombre}
        />
        <ProfileField
          icon={<User size={16} />}
          label="Apellido Paterno"
          value={user.apellidopaterno}
        />
        <ProfileField
          icon={<User size={16} />}
          label="Apellido Materno"
          value={user.apellidomaterno}
        />
        <ProfileField
          icon={<Mail size={16} />}
          label="Correo Electrónico"
          value={user.email}
        />
      </div>
    ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="nombre"
            name="nombre"
            label="Nombre"
            placeholder="Juan"
            value={form.nombre}
            onChange={onChange}
          />
          <FormField
            id="apellidopaterno"
            name="apellidopaterno"
            label="Apellido Paterno"
            placeholder="García"
            value={form.apellidopaterno}
            onChange={onChange}
          />
          <FormField
            id="apellidomaterno"
            name="apellidomaterno"
            label="Apellido Materno"
            placeholder="Martínez"
            value={form.apellidomaterno}
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
    )}
  </SectionCard>
);

export default PersonalInfoCard;
