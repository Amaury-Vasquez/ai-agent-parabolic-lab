import clsx, { ClassValue } from "clsx";
import { ReactNode } from "react";

export type ShadowSize = "sm" | "md" | "lg" | "xl" | "2xl" | "none";

interface CardProps {
  children: ReactNode;
  className?: ClassValue;
  contentClassName?: ClassValue;
  border?: boolean;
  shadow?: ShadowSize;
}

const SHADOW_CLASSES: Record<ShadowSize, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};

const Card = ({
  children,
  className,
  contentClassName,
  border = true,
  shadow = "xl",
}: CardProps) => (
  <div
    className={clsx(
      "card bg-base-100",
      SHADOW_CLASSES[shadow],
      {
        "border border-solid border-base-300": border,
      },
      className
    )}
  >
    <div className={clsx("card-body", contentClassName)}>{children}</div>
  </div>
);

export default Card;
