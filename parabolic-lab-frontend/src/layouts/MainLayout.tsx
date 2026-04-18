import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { MAIN_NAV_LINKS } from "@/constants/navLinks";
import Footer from "@/components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <div className="bg-gradient-to-br from-base-100 to-base-200">
    <Navbar navigationItems={MAIN_NAV_LINKS} />
    {/* Main Content with top margin to account for fixed navbar */}
    <main className="mt-16 min-h-[calc(100dvh-9rem)]">{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
