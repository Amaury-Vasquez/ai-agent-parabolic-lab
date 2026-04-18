"use client";
import Link from "next/link";
import { ButtonVariant, ButtonSize, getButtonClasses } from "amvasdev-ui";
import clsx from "clsx";
import { ReactNode } from "react";

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  outlined?: boolean;
  className?: string;
}

/**
 * CustomLink component - A Next.js Link wrapper styled as a button using amvasdev-ui utilities
 *
 * Use this component when you need a link that should look like a button.
 * It combines Next.js Link functionality with DaisyUI button styling via getButtonClasses().
 *
 * @example
 * <CustomLink href="/dashboard" variant="primary">
 *   Go to Dashboard
 * </CustomLink>
 *
 * @example
 * <CustomLink href="/about" variant="ghost" size="lg">
 *   Learn MoreI
 * </CustomLink>
 */
const CustomLink = ({
  href,
  children,
  variant = "base",
  size = "md",
  outlined = false,
  className = "",
}: CustomLinkProps) => {
  const buttonClasses = getButtonClasses({
    variant,
    size,
    outlined,
  });

  return (
    <Link href={href} className={clsx(buttonClasses, className)}>
      {children}
    </Link>
  );
};

export default CustomLink;
