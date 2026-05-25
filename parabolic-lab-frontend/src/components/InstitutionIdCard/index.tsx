"use client";
import { Button } from "amvasdev-ui";
import { Building2, Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";

interface InstitutionIdCardProps {
  idinstitucion: string;
  nombreInstitucion: string;
  clavect?: string | null;
  description?: string;
}

const InstitutionIdCard = ({
  idinstitucion,
  nombreInstitucion,
  clavect,
  description,
}: InstitutionIdCardProps) => {
  const [copiado, setCopiado] = useState<"id" | "clave" | null>(null);

  const copiar = async (value: string, kind: "id" | "clave") => {
    await navigator.clipboard.writeText(value);
    setCopiado(kind);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <section className="rounded-2xl bg-base-200 border border-base-300 p-5 md:p-7 shadow-sm">
      <header className="flex items-start gap-3 mb-5">
        <div className="rounded-xl bg-primary/15 text-primary p-2.5 shrink-0">
          <Building2 size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold leading-tight">
            {nombreInstitucion}
          </h2>
          <p className="text-sm opacity-70 mt-1">
            {description ??
              "Comparte el ID con tus docentes y alumnos para que puedan registrarse en esta institución."}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase opacity-60 mb-1">ID de institución</p>
            <p className="font-mono font-semibold text-sm md:text-base break-all">
              {idinstitucion}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(idinstitucion, "id")}
            className="w-full sm:w-auto"
          >
            {copiado === "id" ? <Check size={16} /> : <Copy size={16} />}
            {copiado === "id" ? "Copiado" : "Copiar"}
          </Button>
        </div>

        {clavect ? (
          <div className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2">
              <KeyRound size={16} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs uppercase opacity-60 mb-1">
                  Clave CT
                </p>
                <p className="font-mono font-semibold text-sm md:text-base break-all">
                  {clavect}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copiar(clavect, "clave")}
              className="w-full sm:w-auto"
            >
              {copiado === "clave" ? <Check size={16} /> : <Copy size={16} />}
              {copiado === "clave" ? "Copiado" : "Copiar"}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default InstitutionIdCard;
