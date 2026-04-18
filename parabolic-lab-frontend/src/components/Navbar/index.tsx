"use client";
import { Button } from "amvasdev-ui";
import clsx from "clsx";
import { LogIn, LogOut, Rocket, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCookies } from "react-cookie";
import AuthMenu from "./AuthMenu";
import NavMenu from "./NavMenu";
import CustomLink from "@/components/CustomLink";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { NavLink, LOGIN_LINK, REGISTER_LINK } from "@/constants/navLinks";
import useLogout from "@/hooks/useLogout";

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
  const logout = useLogout();
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const authenticated = isAuthenticated ?? !!cookies[ACCESS_TOKEN_COOKIE];

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

      {/* Auth Section - Right (Desktop) */}
      <div className="navbar-end gap-2 hidden lg:flex">
        {authenticated ? (
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size="16" strokeWidth="2.5" />
            Cerrar Sesión
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Auth Section - Right (Mobile) */}
      <div className="navbar-end lg:hidden">
        {authenticated ? (
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size="16" strokeWidth="2.5" />
          </Button>
        ) : (
          <AuthMenu />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
