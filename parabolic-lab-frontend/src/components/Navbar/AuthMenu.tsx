"use client";
import { HamburgerMenu } from "amvasdev-ui";
import { CircleUserRound, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGIN_LINK, REGISTER_LINK } from "@/constants/navLinks";

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

const AuthMenu = () => {
  const pathname = usePathname();
  const visibleLinks = AUTH_LINKS.filter((link) => link.href !== pathname);

  return (
    <HamburgerMenu icon={CircleUserRound} key={pathname} position="right">
      <ul className="flex flex-col gap-2 min-w-64 max-w-full">
        {visibleLinks.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="w-full">
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </HamburgerMenu>
  );
};

export default AuthMenu;
