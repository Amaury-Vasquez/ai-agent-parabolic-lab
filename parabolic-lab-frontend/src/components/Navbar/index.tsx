"use client";
import clsx from "clsx";
import { LayoutDashboard, LogIn, Rocket, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCookies } from "react-cookie";
import AuthMenu from "./AuthMenu";
import NavMenu from "./NavMenu";
import CustomLink from "@/components/CustomLink";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_REDIRECT,
  USER_TYPE_COOKIE,
} from "@/constants/auth";
import { LOGIN_LINK, NavLink, REGISTER_LINK } from "@/constants/navLinks";

const AUTH_LINKS = [
  {
    href: LOGIN_LINK,
    label: "Iniciar Sesión",
    icon: <LogIn size="16" strokeWidth="2.5" />,
  },
  {
    href: REGISTER_LINK,
    label: "Registrarse",
    icon: <UserPlus size="16" strokeWidth="2.5" />,
  },
];

interface NavbarProps {
  navigationItems?: NavLink[];
  showHamburger?: boolean;
  isAuthenticated?: boolean;
  fixed?: boolean;
}

const Navbar = ({
  navigationItems = [],
  showHamburger = true,
  isAuthenticated,
  fixed = true,
}: NavbarProps) => {
  const pathname = usePathname();
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE, USER_TYPE_COOKIE]);
  const authenticated = isAuthenticated ?? !!cookies[ACCESS_TOKEN_COOKIE];
  const userType = cookies[USER_TYPE_COOKIE];
  const dashboardHref = AUTH_REDIRECT[userType];
  const isOnPublicRoute = navigationItems.length > 0;

  return (
    <nav
      className={clsx("navbar bg-base-100 z-50 shadow-md", {
        "fixed top-0 left-0 right-0": fixed,
        "sticky top-0": !fixed,
      })}
    >
      {/* Hamburger Menu - Left */}
      <div className="navbar-start">
        {showHamburger && navigationItems.length > 0 ? (
          <NavMenu
            navigationItems={navigationItems}
            isAuthenticated={authenticated}
          />
        ) : null}
      </div>

      {/* App Name - Center */}
      <div className="navbar-center">
        <CustomLink href="/" variant="ghost" className="text-xl">
          <Rocket size="18" className="text-primary" />
          ParabolicLab
        </CustomLink>
      </div>

      {/* Auth Section - Right */}
      <div className="navbar-end gap-1 sm:gap-2">
        <ThemeToggle />
        {authenticated ? (
          <>
            {isOnPublicRoute && dashboardHref ? (
              <CustomLink
                href={dashboardHref}
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <LayoutDashboard size="16" />
                Mi Panel
              </CustomLink>
            ) : null}
            <UserMenu />
          </>
        ) : (
          <>
            <div className="hidden lg:flex gap-2">
              {AUTH_LINKS.filter((link) => link.href !== pathname).map(
                (link) => (
                  <CustomLink
                    key={link.label}
                    href={link.href}
                    variant="ghost"
                    size="sm"
                  >
                    {link.icon}
                    {link.label}
                  </CustomLink>
                ),
              )}
            </div>
            <div className="lg:hidden">
              <AuthMenu />
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
