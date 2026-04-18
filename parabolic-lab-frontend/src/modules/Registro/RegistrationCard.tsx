"use client";
import { LucideIcon } from "lucide-react";
import Card from "@/components/Card";
import CustomLink from "@/components/CustomLink";

interface RegistrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
}

const RegistrationCard = ({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
}: RegistrationCardProps) => (
  <Card contentClassName="flex flex-col gap-4">
    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
      <Icon className="w-7 h-7 text-primary" />
    </div>

    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-base-content/70 leading-relaxed flex-1">{description}</p>

    <CustomLink href={href} variant="primary" className="w-full">
      {buttonText}
    </CustomLink>
  </Card>
);

export default RegistrationCard;
