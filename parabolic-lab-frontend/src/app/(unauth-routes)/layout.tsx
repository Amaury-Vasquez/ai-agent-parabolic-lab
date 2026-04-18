import { ReactNode } from "react";
import MainLayout from "@/layouts/MainLayout";

interface UnauthLayoutProps {
  children: ReactNode;
}

export default function UnauthLayout({ children }: UnauthLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
