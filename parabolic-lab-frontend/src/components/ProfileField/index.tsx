import { ReactNode } from "react";

interface ProfileFieldProps {
  icon?: ReactNode;
  label: string;
  value?: string | null;
}

const ProfileField = ({ icon, label, value }: ProfileFieldProps) => (
  <div className="flex items-start gap-3 rounded-xl bg-base-100 border border-base-300 p-4">
    {icon ? (
      <div className="shrink-0 rounded-lg bg-primary/10 text-primary p-2">
        {icon}
      </div>
    ) : null}
    <div className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wide opacity-60 font-semibold">
        {label}
      </p>
      <p className="font-medium wrap-break-word mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

export default ProfileField;
