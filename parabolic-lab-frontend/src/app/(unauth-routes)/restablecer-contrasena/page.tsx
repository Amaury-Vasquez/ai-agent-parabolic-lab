import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import RestablecerContrasena from "@/modules/RestablecerContrasena";
import { buildMetadata } from "@/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Restablecer contraseña",
  description:
    "Define una nueva contraseña para tu cuenta de ParabolicLab y recupera el acceso a tus salones y simulaciones.",
  noindex: true,
});

const Fallback = () => (
  <div className="flex justify-center py-12">
    <span className="loading loading-spinner loading-lg" />
  </div>
);

export default function RestablecerContrasenaPage() {
  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center justify-center size-12 bg-primary rounded-2xl">
            <KeyRound className="size-6 text-primary-content" />
          </span>
        </div>
        <Suspense fallback={<Fallback />}>
          <RestablecerContrasena />
        </Suspense>
      </div>
    </div>
  );
}
