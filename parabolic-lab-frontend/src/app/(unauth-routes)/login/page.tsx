import type { Metadata } from "next";
import Login from "@/modules/Login";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de ParabolicLab para continuar aprendiendo o enseñando tiro parabólico con simulaciones interactivas de física.",
  path: "/login",
  keywords: ["iniciar sesión", "acceso docentes", "acceso estudiantes"],
});

export default function LoginPage() {
  return <Login />;
}
