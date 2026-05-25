"use client";
import { IconButton } from "amvasdev-ui";
import clsx, { ClassValue } from "clsx";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, ReactNode } from "react";

export interface SidebarRoute {
  href: string;
  label: string;
  icon?: ReactNode;
}

interface SidebarProps {
  heading: ReactNode;
  routes: Array<SidebarRoute>;
  isShrinked?: boolean;
  toggleSidebar?: () => void;
  className?: ClassValue;
}

const isRouteActive = (pathname: string, href: string): boolean => {
  if (pathname === href) return true;
  if (href === "/" || href === "/docente" || href === "/alumno" || href === "/admin") {
    return false;
  }
  return pathname.startsWith(`${href}/`);
};

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ heading, routes, isShrinked, toggleSidebar, className }, ref) => {
    const pathname = usePathname();

    return (
      <nav
        ref={ref}
        aria-label="Navegación principal"
        className={clsx(
          "bg-base-200 flex flex-col gap-3 border-r border-base-300 transition-[width] duration-200 ease-out shadow-sm",
          {
            "w-64": !isShrinked,
            "w-14": isShrinked,
          },
          className,
        )}
      >
        {/* Heading Section */}
        <div
          className={clsx(
            "flex w-full items-center px-3 pt-3 pb-2 min-h-16",
            {
              "justify-between gap-2": !isShrinked,
              "justify-center": isShrinked,
            },
          )}
        >
          {!isShrinked ? heading : null}
          <IconButton
            icon={
              isShrinked ? (
                <PanelRightClose size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )
            }
            onClick={toggleSidebar}
            aria-label={isShrinked ? "Expandir menú" : "Contraer menú"}
            className="hover:bg-base-300 rounded-lg"
          />
        </div>

        <div className="mx-3 border-t border-base-300/60" />

        {/* Navigation Menu */}
        <ul
          className={clsx("flex flex-col gap-1", {
            "px-2": !isShrinked,
            "px-1.5": isShrinked,
          })}
        >
          {routes.map(({ href, label, icon }) => {
            const active = isRouteActive(pathname, href);
            return (
              <li key={href} className="relative">
                {/* Active left accent bar */}
                <span
                  aria-hidden
                  className={clsx(
                    "pointer-events-none absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-all",
                    active ? "bg-primary opacity-100" : "bg-primary opacity-0",
                  )}
                />
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  title={isShrinked ? label : undefined}
                  className={clsx(
                    "group flex items-center gap-3 h-11 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    {
                      "px-3": !isShrinked,
                      "justify-center px-0": isShrinked,
                      "bg-primary/12 text-primary font-semibold": active,
                      "text-base hover:bg-base-300/70 hover:text-primary":
                        !active,
                    },
                  )}
                >
                  <span
                    className={clsx(
                      "flex items-center justify-center size-8 rounded-lg shrink-0 transition-colors",
                      {
                        "bg-primary text-primary-content shadow-sm": active,
                        "bg-base-100 text-base-content/70 group-hover:bg-primary/10 group-hover:text-primary":
                          !active,
                      },
                    )}
                  >
                    {icon}
                  </span>
                  {isShrinked ? null : (
                    <span className="animate-slide-in truncate text-sm">
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
