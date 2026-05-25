import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  HelpCircle,
  Home,
  Rocket,
  School,
  Trophy,
  UserPlus,
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
];

export const ADMIN_NAV_LINKS: NavLink[] = [
  {
    href: "/admin",
    label: "Resumen",
    icon: <Building2 className="size-5" />,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: <Users className="size-5" />,
  },
  {
    href: "/admin/salones",
    label: "Salones",
    icon: <School className="size-5" />,
  },
  {
    href: "/admin/actividad",
    label: "Actividad de Alumnos",
    icon: <Activity className="size-5" />,
  },
];

export const STUDENT_NAV_LINKS: NavLink[] = [
  {
    href: "/alumno",
    label: "Mis Salones",
    icon: <Home className="size-5" />,
  },
  {
    href: "/alumno/actividades",
    label: "Mis Actividades",
    icon: <ClipboardList className="size-5" />,
  },
  {
    href: "/alumno/escenarios",
    label: "Mis Escenarios",
    icon: <Rocket className="size-5" />,
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
    href: "/alumno/tutorial",
    label: "Tutorial",
    icon: <HelpCircle className="size-5" />,
  },
];

export const LOGIN_LINK = "/login";
export const REGISTER_LINK = "/registro";
export const REGISTER_INSTITUTION_LINK = "/registro/institucion";
export const FORGOT_PASSWORD_LINK = "/recuperar-contrasena";
export const RESET_PASSWORD_LINK = "/restablecer-contrasena";

export const MAIN_NAV_LINKS: NavLink[] = [
  {
    label: "Inicio",
    href: "/",
    icon: <Home className="size-4" />,
  },
  {
    label: "Probar simulador",
    href: "/simulador",
    icon: <Rocket className="size-4" />,
  },
  {
    label: "Registrarme",
    href: REGISTER_LINK,
    icon: <UserPlus className="size-4" />,
  },
  {
    label: "Registrar institución",
    href: REGISTER_INSTITUTION_LINK,
    icon: <Building2 className="size-4" />,
  },
];

export const PROFILE_HREF: Record<string, string> = {
  docente: "/docente/perfil",
  alumno: "/alumno/perfil",
  admin: "/admin/perfil",
};
