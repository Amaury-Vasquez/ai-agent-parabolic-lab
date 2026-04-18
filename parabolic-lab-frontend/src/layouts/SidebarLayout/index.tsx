"use client";
import { useOnClickOutside, useToggle } from "amvasdev-ui";
import clsx from "clsx";
import { ReactNode, useRef } from "react";
import Heading from "./Heading";
import Navbar from "@/components/Navbar";
import Sidebar, { SidebarRoute } from "@/components/Sidebar";
import { STUDENT_NAV_LINKS, TEACHER_NAV_LINKS } from "@/constants/navLinks";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import { UserType } from "@/models/users";

interface SidebarLayoutProps {
  children: ReactNode;
  panelType: UserType;
}

const PanelDescription: Record<UserType, string> = {
  docente: "Docente",
  alumno: "Alumno",
  admin: "Admin",
};

const PanelRoutes: Record<UserType, SidebarRoute[]> = {
  docente: TEACHER_NAV_LINKS,
  alumno: STUDENT_NAV_LINKS,
  admin: [],
};

const SidebarLayout = ({ children, panelType }: SidebarLayoutProps) => {
  const routes = PanelRoutes[panelType];
  const panelDescription = PanelDescription[panelType];
  const [isShrinked, toggleSidebar] = useToggle(true);
  const isMobileOrTablet = useIsMobileOrTablet();
  const sidebarRef = useRef<HTMLElement>(null);

  useOnClickOutside(sidebarRef, () => {
    if (!isShrinked && isMobileOrTablet) {
      toggleSidebar();
    }
  });

  return (
    <div className="min-h-dvh flex relative">
      {/* Sidebar */}
      <div
        className={clsx("flex transition-colors fixed left-0 h-dvh", {
          "w-screen bg-black/30 fixed inset-0 z-50":
            isMobileOrTablet && !isShrinked,
        })}
      >
        <Sidebar
          ref={sidebarRef}
          heading={<Heading panelDescription={panelDescription} />}
          routes={routes}
          isShrinked={isShrinked}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={clsx(
          "flex-1 bg-gradient-to-br from-base-100 to-base-200 ml-14 transition-[margin-left] ease-out",
          {
            "lg:ml-64": !isShrinked && !isMobileOrTablet,
          }
        )}
      >
        <Navbar isAuthenticated fixed={false} showHamburger={false} />
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
