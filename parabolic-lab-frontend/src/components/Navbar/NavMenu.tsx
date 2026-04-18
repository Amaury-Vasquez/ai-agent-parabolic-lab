"use client";
import { HamburgerMenu } from "amvasdev-ui";
import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCookies } from "react-cookie";
import {
  AUTH_ONLY_ROUTES,
  AUTH_REDIRECT,
  USER_TYPE_COOKIE,
} from "@/constants/auth";
import { NavLink } from "@/constants/navLinks";
import { matchesRoutes } from "@/utils/routes";

interface NavMenuProps {
  navigationItems: NavLink[];
  isAuthenticated: boolean;
}

const NavMenu = ({ navigationItems, isAuthenticated }: NavMenuProps) => {
  const pathname = usePathname();
  const [cookies] = useCookies([USER_TYPE_COOKIE]);
  const userType = cookies[USER_TYPE_COOKIE];
  const dashboardHref = AUTH_REDIRECT[userType];

  const visibleItems = isAuthenticated
    ? navigationItems.filter(
        (item) => !matchesRoutes(item.href, AUTH_ONLY_ROUTES),
      )
    : navigationItems;

  return (
    <HamburgerMenu icon={Menu} key={pathname}>
      <ul className="flex flex-col gap-2 min-w-64 max-w-full">
        {isAuthenticated && dashboardHref ? (
          <li>
            <Link href={dashboardHref} className="w-full font-semibold">
              <LayoutDashboard className="size-4" />
              Mi Panel
            </Link>
          </li>
        ) : null}
        {visibleItems.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="w-full">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </HamburgerMenu>
  );
};

export default NavMenu;
