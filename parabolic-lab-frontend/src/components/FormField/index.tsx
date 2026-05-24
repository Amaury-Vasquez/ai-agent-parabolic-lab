import { Input } from "amvasdev-ui";
import { ChangeEvent } from "react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FormField = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
}: FormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <Input
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default FormField;
