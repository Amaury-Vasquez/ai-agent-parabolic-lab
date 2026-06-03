"use client";

import { Input } from "amvasdev-ui";
import { Calculator, Pencil } from "lucide-react";
import type {
  CampoResolucion,
  ResolucionAlumno,
} from "@/types/datosInteraccion";

interface ResolucionPanelProps {
  resolucion: ResolucionAlumno;
  onChange: (next: ResolucionAlumno) => void;
  errores?: Set<CampoResolucion>;
}

interface NumericFieldProps {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  value: number | null;
  onChange: (n: number | null) => void;
  error?: boolean;
}

const NumericField = ({
  id,
  label,
  unit,
  placeholder,
  value,
  onChange,
  error = false,
}: NumericFieldProps) => (
  <div>
    <label className="label py-1" htmlFor={id}>
      <span className="label-text text-xs">
        {label} <span className="opacity-50">({unit})</span>
      </span>
    </label>
    <Input
      id={id}
      type="number"
      step="0.1"
      placeholder={placeholder}
      value={value ?? ""}
      variant={error ? "error" : undefined}
      errorMessage={error ? "Obligatorio" : undefined}
      onChange={(e) => {
        const raw = e.currentTarget.value;
        onChange(raw === "" ? null : Number(raw));
      }}
    />
  </div>
);

const ResolucionPanel = ({
  resolucion,
  onChange,
  errores,
}: ResolucionPanelProps) => {
  const tieneError = (campo: CampoResolucion) => errores?.has(campo) ?? false;
  const setRespuesta = <K extends keyof ResolucionAlumno["respuestas"]>(
    key: K,
    value: ResolucionAlumno["respuestas"][K]
  ) =>
    onChange({
      ...resolucion,
      respuestas: { ...resolucion.respuestas, [key]: value },
    });

  return (
    <div
      id="panel-mi-solucion"
      className="bg-base-200 rounded-lg p-4 sm:p-5 flex flex-col gap-4"
    >
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Pencil className="w-5 h-5 text-primary" />
          Mi solución
        </h3>
        <p className="text-xs opacity-70 mt-1">
          Escribe tus cálculos y los valores que resuelven el problema. Tu
          docente revisará tu trabajo.
        </p>
      </div>

      <div>
        <label className="label py-1">
          <span className="label-text text-sm font-semibold flex items-center gap-1">
            <Calculator className="w-4 h-4" />
            Procedimiento y cálculos
          </span>
        </label>
        <textarea
          className={`textarea textarea-bordered w-full font-mono text-sm ${
            tieneError("procedimiento") ? "textarea-error" : ""
          }`}
          rows={6}
          placeholder={"v₀² · sen(2θ) / g = alcance\n30² · sen(90°) / 9.81 ≈ 91.7 m"}
          value={resolucion.procedimiento}
          onChange={(e) =>
            onChange({ ...resolucion, procedimiento: e.currentTarget.value })
          }
        />
        {tieneError("procedimiento") ? (
          <span className="text-xs text-error mt-1 block">
            Describe tu procedimiento antes de terminar.
          </span>
        ) : null}
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Respuestas</div>
        <div className="grid grid-cols-2 gap-3">
          <NumericField
            id="resolucion-angulo"
            label="Ángulo"
            unit="°"
            placeholder="45"
            value={resolucion.respuestas.angulo}
            onChange={(v) => setRespuesta("angulo", v)}
            error={tieneError("angulo")}
          />
          <NumericField
            id="resolucion-velocidad"
            label="Velocidad inicial"
            unit="m/s"
            placeholder="30"
            value={resolucion.respuestas.velocidad}
            onChange={(v) => setRespuesta("velocidad", v)}
            error={tieneError("velocidad")}
          />
          <NumericField
            id="resolucion-altura-maxima"
            label="Altura máxima"
            unit="m"
            placeholder="22.9"
            value={resolucion.respuestas.alturaMaxima}
            onChange={(v) => setRespuesta("alturaMaxima", v)}
            error={tieneError("alturaMaxima")}
          />
          <NumericField
            id="resolucion-alcance"
            label="Alcance"
            unit="m"
            placeholder="91.7"
            value={resolucion.respuestas.alcance}
            onChange={(v) => setRespuesta("alcance", v)}
            error={tieneError("alcance")}
          />
          <NumericField
            id="resolucion-tiempo-vuelo"
            label="Tiempo de vuelo"
            unit="s"
            placeholder="4.3"
            value={resolucion.respuestas.tiempoVuelo}
            onChange={(v) => setRespuesta("tiempoVuelo", v)}
            error={tieneError("tiempoVuelo")}
          />
        </div>
      </div>

      <div>
        <label className="label py-1">
          <span className="label-text text-sm font-semibold">
            Notas adicionales
          </span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full text-sm"
          rows={2}
          placeholder="Reflexiones, dudas o observaciones..."
          value={resolucion.notas}
          onChange={(e) =>
            onChange({ ...resolucion, notas: e.currentTarget.value })
          }
        />
      </div>
    </div>
  );
};

export default ResolucionPanel;
