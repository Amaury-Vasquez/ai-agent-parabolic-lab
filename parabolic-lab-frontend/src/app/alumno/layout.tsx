import { ReactNode } from "react";
import SidebarLayout from "@/layouts/SidebarLayout";

interface AlumnoLayoutProps {
  children: ReactNode;
}

export default function AlumnoLayout({ children }: AlumnoLayoutProps) {
  return <SidebarLayout panelType="alumno">{children}</SidebarLayout>;
}
