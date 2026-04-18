import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Home,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { ReactNode } from "react";

export interface NavLink {
  href: string;
  label: string;
  icon?: ReactNode;
}

export const TEACHER_NAV_LINKS: NavLink[] = [
  {
    href: "/docente",
    label: "Mis Salones",
    icon: <Home className="size-5" />,
  },
  {
    href: "/docente/biblioteca",
    label: "Biblioteca de Escenarios",
    icon: <BookOpen className="size-5" />,
  },
  {
    href: "/docente/estudiantes",
    label: "Gestión de Estudiantes",
    icon: <Users className="size-5" />,
  },
  {
    href: "/docente/reportes",
    label: "Reportes y Progreso",
    icon: <BarChart3 className="size-5" />,
  },
  {
    href: "/docente/perfil",
    label: "Mi Perfil",
    icon: <User className="size-5" />,
  },
];

export const STUDENT_NAV_LINKS: NavLink[] = [
  {
    href: "/alumno",
    label: "Mis Salones",
    icon: <Home className="size-5" />,
  },
  {
    href: "/alumno/escenarios",
    label: "Mis Escenarios",
    icon: <GraduationCap className="size-5" />,
  },
  {
    href: "/alumno/logros",
    label: "Logros y Ranking",
    icon: <Trophy className="size-5" />,
  },
  {
    href: "/alumno/progreso",
    label: "Mi Progreso",
    icon: <BarChart3 className="size-5" />,
  },
  {
    href: "/alumno/perfil",
    label: "Mi Perfil",
    icon: <User className="size-5" />,
  },
];

export const LOGIN_LINK = "/login";
export const REGISTER_LINK = "/registro";
export const REGISTER_INSTITUTION_LINK = "/registro/institucion";

export const MAIN_NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Registrarme", href: REGISTER_LINK },
  { label: "Registrar institución", href: REGISTER_INSTITUTION_LINK },
  { label: "Acerca de", href: "/acerca-de" },
  { label: "Contacto", href: "/contacto" },
];
