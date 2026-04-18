"use client";
import { Button, Input } from "amvasdev-ui";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import Card from "@/components/Card";
import CustomLink from "@/components/CustomLink";

interface RegistrationCardWithInputProps {
  title: string;
  description: string;
  icon: LucideIcon;
  baseHref: string;
  buttonText: string;
}

const RegistrationCardWithInput = ({
  title,
  description,
  icon: Icon,
  baseHref,
  buttonText,
}: RegistrationCardWithInputProps) => {
  const [institutionId, setInstitutionId] = useState("");

  const finalHref = institutionId
    ? baseHref.replace("[institutionId]", institutionId)
    : "";

  return (
    <Card contentClassName="flex flex-col gap-4">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
        <Icon className="size-7 text-primary" />
      </div>

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-base-content/70 leading-relaxed flex-1">
        {description}
      </p>

      <Input
        id={`institution-id-${title.replace(/\s/g, "-")}`}
        label="ID de Institución"
        type="text"
        placeholder="ABC123XYZ"
        value={institutionId}
        onChange={(e) => setInstitutionId(e.currentTarget.value)}
      />

      {finalHref ? (
        <CustomLink href={finalHref} variant="primary" className="w-full">
          {buttonText}
        </CustomLink>
      ) : (
        <Button variant="primary" className="w-full" disabled>
          {buttonText}
        </Button>
      )}
    </Card>
  );
};

export default RegistrationCardWithInput;
