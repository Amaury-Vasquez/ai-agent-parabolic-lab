import { ReactNode } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";

interface DocenteLayoutProps {
  children: ReactNode;
}

export default function DocenteLayout({ children }: DocenteLayoutProps) {
  return <SidebarLayout panelType="docente">{children}</SidebarLayout>;
}
