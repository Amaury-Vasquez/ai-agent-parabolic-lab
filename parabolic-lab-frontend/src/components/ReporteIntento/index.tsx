"use client";
import { Badge, Button } from "amvasdev-ui";
import { Calculator, CheckCircle, Clock, Download, FileSpreadsheet, Target, Trophy, XCircle } from "lucide-react";
import { useState } from "react";
import { useCookies } from "react-cookie";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { descargarReportePdf, descargarReporteXlsx } from "@/fetchers/reportes";
import { AnalisisReporte, DisparoReporte, IntentoComparativo, ReporteIntento } from "@/types/reporteIntento";

const G = 9.8;

function calcularTrayectoria(
  anguloDeg: number,
  velocidad: number,
  alturaCanon: number,
): { x: number; y: number }[] {
  const rad = (anguloDeg * Math.PI) / 180;
  const vx = velocidad * Math.cos(rad);
  const vy = velocidad * Math.sin(rad);
  const puntos: { x: number; y: number }[] = [];
  const dt = 0.05;
  let t = 0;
  while (true) {
    const x = vx * t;
    const y = alturaCanon + vy * t - 0.5 * G * t * t;
    puntos.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    if (y < 0 && t > 0) break;
    if (t > 300) break;
    t += dt;
  }
  return puntos;
}

const formatVal = (v: number | null | undefined, dec = 1): string => {
  if (v === null || v === undefined) return "—";
  return v.toFixed(dec);
};

const formatDt = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTiempo = (seg: number | null | undefined): string => {
  if (!seg) return "0:00";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface AnalisisRowProps {
  label: string;
  alumno: string;
  correcto: string;
  tieneCorreto: boolean;
}

const AnalisisRow = ({ label, alumno, correcto, tieneCorreto }: AnalisisRowProps) => (
  <tr>
    <td className="font-medium">{label}</td>
    <td className="text-center font-mono">{alumno}</td>
    <td className="text-center font-mono opacity-70">{tieneCorreto ? correcto : "—"}</td>
  </tr>
);

interface TrayectoriaChartProps {
  disparos: DisparoReporte[];
  alcanceCorrecto: number | null;
}

const TrayectoriaChart = ({ disparos, alcanceCorrecto }: TrayectoriaChartProps) => {
  const mejorDisparo = disparos.find((d) => d.acierto) ?? disparos[disparos.length - 1];
  if (!mejorDisparo || mejorDisparo.angulo === null || mejorDisparo.velocidad === null) {
    return (
      <p className="text-center opacity-50 text-sm py-4">
        No hay datos de disparo para graficar la trayectoria.
      </p>
    );
  }
  const trayectoria = calcularTrayectoria(
    mejorDisparo.angulo,
    mejorDisparo.velocidad,
    mejorDisparo.altura_canon ?? 0,
  );

  return (
    <div className="h-52 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trayectoria} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="x"
            label={{ value: "Distancia (m)", position: "insideBottomRight", offset: -8, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            label={{ value: "Altura (m)", angle: -90, position: "insideLeft", fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => `${value} m`}
            labelFormatter={(label) => `x = ${label} m`}
          />
          {alcanceCorrecto !== null ? (
            <ReferenceLine
              x={alcanceCorrecto}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: "Objetivo", position: "top", fontSize: 10, fill: "#ef4444" }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="y"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            name="Altura"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ComparativaProps {
  comparativa: IntentoComparativo[];
  idActual: string;
}

const Comparativa = ({ comparativa, idActual }: ComparativaProps) => {
  if (comparativa.length === 0) {
    return (
      <p className="text-sm opacity-50 text-center py-2">
        Este es tu primer intento en este escenario.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-xs w-full">
        <thead>
          <tr>
            <th>Fecha inicio</th>
            <th>Puntuación</th>
            <th>Intentos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {comparativa.map((c) => (
            <tr key={c.idinteraccion} className={c.idinteraccion === idActual ? "font-bold" : ""}>
              <td>{formatDt(c.fechainicio)}</td>
              <td>{formatVal(c.puntuacion)}</td>
              <td>{c.intentosrealizados ?? 0}</td>
              <td>
                {c.completado ? (
                  <Badge variant="success" soft>
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="neutral">En progreso</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface SeccionProps {
  titulo: string;
  children: React.ReactNode;
}

const Seccion = ({ titulo, children }: SeccionProps) => (
  <div className="card bg-base-100 border border-solid border-base-300 shadow-sm">
    <div className="card-body gap-3 p-4 md:p-5">
      <h3 className="text-base font-bold">{titulo}</h3>
      {children}
    </div>
  </div>
);

interface ReporteIntentoProps {
  reporte: ReporteIntento;
  modoImpresion?: boolean;
}

const ReporteIntentoContent = ({ reporte, modoImpresion = false }: ReporteIntentoProps) => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [descargandoXlsx, setDescargandoXlsx] = useState(false);

  const handleDescargaPdf = async () => {
    setDescargandoPdf(true);
    try {
      await descargarReportePdf(token, reporte.idinteraccion);
    } finally {
      setDescargandoPdf(false);
    }
  };

  const handleDescargaXlsx = async () => {
    setDescargandoXlsx(true);
    try {
      await descargarReporteXlsx(token, reporte.idinteraccion);
    } finally {
      setDescargandoXlsx(false);
    }
  };

  const handleImprimir = () => window.print();

  const analisis: AnalisisReporte = reporte.analisis;

  return (
    <div className="flex flex-col gap-4 print:gap-3">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{reporte.nombre_escenario}</h2>
          <p className="text-sm opacity-60 mt-0.5">
            Nivel: {reporte.niveldificultad} · Finalizado: {formatDt(reporte.fechafin)}
          </p>
        </div>
        {!modoImpresion ? (
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button size="sm" variant="ghost" onClick={handleImprimir}>
              Imprimir
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDescargaXlsx}
              disabled={descargandoXlsx}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {descargandoXlsx ? "..." : "XLSX"}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDescargaPdf}
              disabled={descargandoPdf}
            >
              <Download className="w-4 h-4" />
              {descargandoPdf ? "..." : "PDF"}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Resumen numérico */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: <Trophy className="w-4 h-4 text-warning" />, label: "Puntuación", value: formatVal(reporte.puntuacion, 1) },
          { icon: <Clock className="w-4 h-4 text-info" />, label: "Tiempo", value: formatTiempo(reporte.tiempototal) },
          { icon: <Target className="w-4 h-4 text-error" />, label: "Intentos", value: String(reporte.intentosrealizados ?? 0) },
          {
            icon: <CheckCircle className="w-4 h-4 text-success" />,
            label: "Aciertos",
            value: `${reporte.disparos.filter((d) => d.acierto).length}/${reporte.disparos.length}`,
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-base-200 rounded-lg p-3 flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[11px] uppercase opacity-60">
              {icon}
              {label}
            </span>
            <span className="text-xl font-bold">{value}</span>
          </div>
        ))}
      </div>

      {/* Análisis */}
      <Seccion titulo="Análisis — Tus respuestas vs la solución correcta">
        <div className="overflow-x-auto">
          <table className="table table-xs w-full">
            <thead>
              <tr>
                <th>Variable</th>
                <th className="text-center">Tu respuesta</th>
                <th className="text-center">Valor correcto</th>
              </tr>
            </thead>
            <tbody>
              <AnalisisRow
                label="Ángulo (°)"
                alumno={formatVal(analisis.angulo_alumno)}
                correcto={formatVal(analisis.angulo_correcto)}
                tieneCorreto={analisis.angulo_correcto !== null}
              />
              <AnalisisRow
                label="Velocidad inicial (m/s)"
                alumno={formatVal(analisis.velocidad_alumno)}
                correcto={formatVal(analisis.velocidad_correcta)}
                tieneCorreto={analisis.velocidad_correcta !== null}
              />
              <AnalisisRow
                label="Alcance (m)"
                alumno={formatVal(analisis.alcance_alumno)}
                correcto={formatVal(analisis.alcance_correcto)}
                tieneCorreto={analisis.alcance_correcto !== null}
              />
              <AnalisisRow
                label="Altura máxima (m)"
                alumno={formatVal(analisis.altura_maxima_alumno)}
                correcto="—"
                tieneCorreto={false}
              />
              <AnalisisRow
                label="Tiempo de vuelo (s)"
                alumno={formatVal(analisis.tiempo_vuelo_alumno)}
                correcto="—"
                tieneCorreto={false}
              />
            </tbody>
          </table>
        </div>
        {analisis.procedimiento ? (
          <div className="mt-2">
            <p className="text-xs font-semibold opacity-60 flex items-center gap-1 mb-1">
              <Calculator className="w-3 h-3" /> Procedimiento
            </p>
            <pre className="bg-base-200 rounded p-3 text-xs whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
              {analisis.procedimiento}
            </pre>
          </div>
        ) : null}
        {analisis.notas ? (
          <div className="mt-1">
            <p className="text-xs font-semibold opacity-60 mb-1">Notas</p>
            <p className="bg-base-200 rounded p-3 text-xs whitespace-pre-wrap">{analisis.notas}</p>
          </div>
        ) : null}
      </Seccion>

      {/* Gráfica de trayectoria */}
      <Seccion titulo="Trayectoria del proyectil (último disparo)">
        <TrayectoriaChart disparos={reporte.disparos} alcanceCorrecto={analisis.alcance_correcto} />
      </Seccion>

      {/* Historial de disparos */}
      {reporte.disparos.length > 0 ? (
        <Seccion titulo={`Historial de disparos (${reporte.disparos.length})`}>
          <div className="overflow-x-auto">
            <table className="table table-xs table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ángulo (°)</th>
                  <th>Vel. (m/s)</th>
                  <th>Alt. (m)</th>
                  <th>Dist. (m)</th>
                  <th>Resultado</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {reporte.disparos.map((d) => (
                  <tr key={d.n}>
                    <td>{d.n}</td>
                    <td>{formatVal(d.angulo)}</td>
                    <td>{formatVal(d.velocidad)}</td>
                    <td>{formatVal(d.altura_canon)}</td>
                    <td>{formatVal(d.distancia)}</td>
                    <td>
                      {d.acierto ? (
                        <span className="flex items-center gap-1 text-success text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" /> Acierto
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 opacity-50 text-xs">
                          <XCircle className="w-3 h-3" /> Falló
                        </span>
                      )}
                    </td>
                    <td>{d.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>
      ) : null}

      {/* Comparativa */}
      <Seccion titulo="Comparativa — Tus intentos anteriores en este escenario">
        <Comparativa comparativa={reporte.comparativa} idActual={reporte.idinteraccion} />
      </Seccion>
    </div>
  );
};

export default ReporteIntentoContent;
