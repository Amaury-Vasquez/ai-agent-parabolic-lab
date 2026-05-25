"use client";
import { Dropdown } from "amvasdev-ui";
import { LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { PROFILE_HREF } from "@/constants/navLinks";
import useLogout from "@/hooks/useLogout";
import { useMe } from "@/queries/useMe";

const ROLE_LABEL: Record<string, string> = {
  docente: "Docente",
  alumno: "Alumno",
  admin: "Administrador",
};

const getInitials = (
  nombre?: string,
  apellido?: string | null,
): string => {
  const first = nombre?.trim()?.[0] ?? "";
  const last = apellido?.trim()?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
};

const UserMenu = () => {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  if (isLoading || !user) return null;

  const initials = getInitials(user.nombre, user.apellidopaterno);
  const profileHref = PROFILE_HREF[user.tipousuario] ?? "/";
  const roleLabel = ROLE_LABEL[user.tipousuario] ?? user.tipousuario;

  return (
    <Dropdown
      position="right"
      showChevron={false}
      unstyledTrigger
      triggerClassName="btn btn-ghost rounded-full pl-1 pr-2 sm:pr-3 h-10 gap-2 normal-case font-normal"
      menuClassName="bg-base-100 border border-base-300 rounded-xl shadow-lg p-2 min-w-56 mt-2"
      triggerElement={
        <span className="flex items-center gap-2 max-w-[12rem]">
          <span
            className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-content font-semibold text-sm shrink-0"
            aria-hidden
          >
            {initials}
          </span>
          <span className="hidden md:flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold leading-tight truncate max-w-[9rem]">
              {user.nombre} {user.apellidopaterno}
            </span>
            <span className="text-xs opacity-60 leading-tight">
              {roleLabel}
            </span>
          </span>
        </span>
      }
    >
      <div className="flex flex-col gap-1">
        <div className="px-3 py-2 border-b border-base-300 mb-1 md:hidden">
          <p className="font-semibold text-sm truncate">
            {user.nombre} {user.apellidopaterno}
          </p>
          <p className="text-xs opacity-60">{roleLabel}</p>
        </div>
        <Link
          href={profileHref}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors text-sm"
        >
          <UserCog size={16} className="text-primary" />
          Mi Perfil
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors text-sm text-error w-full text-left"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </Dropdown>
  );
};

export default UserMenu;
