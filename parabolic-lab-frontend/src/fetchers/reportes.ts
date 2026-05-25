import { downloadReport, get } from "@/services/api";
import { ReporteIntento } from "@/types/reporteIntento";

export const REPORTE_INTENTO_QUERY_KEY = (idinteraccion: string) => [
  "interacciones-escenario",
  idinteraccion,
  "reporte",
];

export async function fetchReporteIntento(
  token: string,
  idinteraccion: string,
): Promise<ReporteIntento> {
  return get<ReporteIntento>(
    `/interacciones-escenario/${idinteraccion}/reporte`,
    { token },
  );
}

export async function descargarReportePdf(
  token: string,
  idinteraccion: string,
): Promise<void> {
  await downloadReport(
    `/interacciones-escenario/${idinteraccion}/reporte/pdf`,
    token,
    `reporte_${idinteraccion.slice(0, 8)}.pdf`,
  );
}

export async function descargarReporteXlsx(
  token: string,
  idinteraccion: string,
): Promise<void> {
  await downloadReport(
    `/interacciones-escenario/${idinteraccion}/reporte/xlsx`,
    token,
    `reporte_${idinteraccion.slice(0, 8)}.xlsx`,
  );
}
