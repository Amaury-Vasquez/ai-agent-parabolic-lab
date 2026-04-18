"use client";
import { IconButton } from "amvasdev-ui";
import clsx, { ClassValue } from "clsx";
import { PanelRightClose, PanelLeftClose } from "lucide-react";
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

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ heading, routes, isShrinked, toggleSidebar, className }, ref) => {
    const pathname = usePathname();

    return (
      <nav
        ref={ref}
        className={clsx(
          "bg-base-200 flex flex-col gap-4 border border-solid border-transparent border-r-base-300 transition-all",
          {
            "w-64": !isShrinked,
            "w-14": isShrinked,
          },
          className
        )}
      >
        {/* Heading Section */}
        <div
          className={clsx("flex w-full items-center p-4", {
            "justify-between": !isShrinked,
            "justify-center": isShrinked,
          })}
        >
          {!isShrinked ? heading : null}
          <IconButton
            icon={
              isShrinked ? (
                <PanelRightClose size={20} />
              ) : (
                <PanelLeftClose size={24} />
              )
            }
            onClick={toggleSidebar}
            className="hover:bg-base-300"
          />
        </div>

        {/* Navigation Menu */}
        <ul className="flex flex-col">
          {routes.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-2 h-12 py-3 px-4 focus-visible:bg-base-300 hover:bg-base-300 transition-all hover:text-primary",
                  {
                    "bg-base-300 text-primary font-semibold": pathname === href,
                    "w-64": !isShrinked,
                    "w-14": isShrinked,
                  }
                )}
              >
                {icon}
                {isShrinked ? null : (
                  <span className="animate-slide-in">{label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
