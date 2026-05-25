import { KeyRound } from "lucide-react";
import RecuperarContrasena from "@/modules/RecuperarContrasena";

export default function RecuperarContrasenaPage() {
  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center justify-center size-12 bg-primary rounded-2xl">
            <KeyRound className="size-6 text-primary-content" />
          </span>
        </div>
        <RecuperarContrasena />
      </div>
    </div>
  );
}
