"""
Servicio para generación de reportes en CSV y PDF.
Incluye desempeño de estudiantes, parámetros físicos y estadísticas de éxito.
"""

import csv
import io
import logging
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

from app.models.alumno import Alumno
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.escenario import Escenario
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.salon import Salon


class ReportService:
    """Servicio para generar reportes de desempeño académico."""

    @staticmethod
    async def generate_salon_csv_report(db: AsyncSession, salon_id: str) -> bytes:
        """
        Genera un reporte CSV consolidado del salón.

        Incluye:
        - Estadísticas del salón
        - Resumen por estudiante
        - Desempeño en escenarios
        """
        # Obtener salón con estudiantes
        result = await db.execute(
            select(Salon)
            .where(Salon.idsalon == salon_id)
            .options(
                selectinload(Salon.alumnos)
                .selectinload(AlumnoEnSalon.alumno)
                .selectinload(Alumno.usuario)
            )
        )
        salon = result.scalar_one_or_none()
        if not salon:
            raise ValueError(f"Salón {salon_id} no encontrado")

        # Crear buffer para CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # Encabezado general
        writer.writerow(["REPORTE DE DESEMPEÑO - SALÓN"])
        writer.writerow([])
        writer.writerow(["Salón:", salon.nombresalon])
        writer.writerow(["Código de Acceso:", salon.codigoacceso])
        writer.writerow(["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M")])
        writer.writerow([])

        # Encabezado de tabla de estudiantes
        writer.writerow(
            [
                "Nombre",
                "Apellido Paterno",
                "Apellido Materno",
                "Matrícula",
                "Salón",
                "Intentos Totales",
                "Escenarios Completados",
                "Promedio Puntuación",
                "Tiempo Total (min)",
                "Tasa Éxito (%)",
            ]
        )

        # Procesar cada estudiante
        for alumno_en_salon in salon.alumnos:
            if not alumno_en_salon.activo:
                continue
            alumno = alumno_en_salon.alumno
            usuario = alumno.usuario

            # Obtener interacciones del estudiante en escenarios de este salón
            result = await db.execute(
                select(InteraccionEscenario).where(
                    InteraccionEscenario.idalumno == alumno.idalumno,
                    InteraccionEscenario.idescenario.in_(
                        select(Escenario.idescenario).where(Escenario.idsalon == salon.idsalon)
                    ),
                )
            )
            interacciones = result.scalars().all()

            # Calcular estadísticas usando intentosrealizados reales
            total_intentos = sum(int(i.intentosrealizados or 0) for i in interacciones)
            completadas = sum(1 for i in interacciones if i.completado)
            num_interacciones = len(interacciones)

            if interacciones:
                puntuacion_promedio = (
                    sum(float(i.puntuacion or 0) for i in interacciones) / num_interacciones
                )
                tiempo_total_seg = sum(int(i.tiempototal or 0) for i in interacciones)
                tasa_exito = (completadas / num_interacciones * 100) if num_interacciones > 0 else 0
            else:
                puntuacion_promedio = 0
                tiempo_total_seg = 0
                tasa_exito = 0

            writer.writerow(
                [
                    usuario.nombre or "Sin nombre",
                    usuario.apellidopaterno or "",
                    usuario.apellidomaterno or "",
                    alumno.matricula,
                    salon.nombresalon,
                    total_intentos,
                    completadas,
                    round(puntuacion_promedio, 2),
                    round(tiempo_total_seg / 60, 2),
                    round(tasa_exito, 2),
                ]
            )

        # Convertir a bytes con BOM for Excel compatibility
        bom = "\ufeff"
        return (bom + output.getvalue()).encode("utf-8")

    @staticmethod
    async def generate_student_csv_report(db: AsyncSession, alumno_id: str, salon_id: str) -> bytes:
        """Genera reporte CSV de un estudiante específico en un salón."""
        # Obtener alumno
        result = await db.execute(
            select(Alumno).where(Alumno.idalumno == alumno_id).options(selectinload(Alumno.usuario))
        )
        alumno = result.scalar_one_or_none()
        if not alumno:
            raise ValueError(f"Estudiante {alumno_id} no encontrado")

        usuario = alumno.usuario

        # Obtener interacciones del estudiante en el salón
        result = await db.execute(
            select(InteraccionEscenario)
            .where(
                InteraccionEscenario.idalumno == alumno_id,
                InteraccionEscenario.idescenario.in_(
                    select(Escenario.idescenario).where(Escenario.idsalon == salon_id)
                ),
            )
            .options(selectinload(InteraccionEscenario.escenario))
        )
        interacciones = result.scalars().all()

        # Crear buffer
        output = io.StringIO()
        writer = csv.writer(output)

        # Encabezado
        nombre_completo = " ".join(
            filter(None, [usuario.nombre, usuario.apellidopaterno, usuario.apellidomaterno])
        )
        writer.writerow(["EXPEDIENTE DE DESEMPEÑO - ESTUDIANTE"])
        writer.writerow([])
        writer.writerow(["Nombre:", nombre_completo or "Sin nombre"])
        writer.writerow(["Matrícula:", alumno.matricula])
        writer.writerow(["Email:", usuario.email or "N/A"])
        writer.writerow(["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M")])
        writer.writerow([])

        if not interacciones:
            writer.writerow(["Sin datos registrados"])
            writer.writerow([])
            writer.writerow(["Este estudiante aún no ha participado en escenarios."])
        else:
            # Tabla de intentos
            writer.writerow(
                [
                    "Escenario",
                    "Nivel Dificultad",
                    "Velocidad Inicial (m/s)",
                    "Ángulo (°)",
                    "Intentos",
                    "Completado",
                    "Puntuación",
                    "Tiempo Total (seg)",
                    "Fecha",
                ]
            )

            for interaccion in interacciones:
                escenario = interaccion.escenario
                datos = interaccion.datosinteraccion or {}

                v0 = datos.get("velocidadInicial", "N/A")
                angulo = datos.get("angulo", "N/A")

                writer.writerow(
                    [
                        escenario.nombre,
                        escenario.niveldificultad,
                        v0,
                        angulo,
                        interaccion.intentosrealizados,
                        "Sí" if interaccion.completado else "No",
                        round(float(interaccion.puntuacion) if interaccion.puntuacion else 0, 2),
                        int(interaccion.tiempototal) if interaccion.tiempototal else 0,
                        interaccion.fechafin.strftime("%Y-%m-%d %H:%M") if interaccion.fechafin else "Sin registro",
                    ]
                )

        # BOM for Excel compatibility
        bom = "\ufeff"
        return (bom + output.getvalue()).encode("utf-8")

    @staticmethod
    async def generate_salon_pdf_report(db: AsyncSession, salon_id: str) -> bytes:
        """
        Genera un reporte PDF profesional del salón.
        Incluye tablas, estadísticas y parámetros físicos.
        """
        # Obtener datos del salón
        result = await db.execute(
            select(Salon)
            .where(Salon.idsalon == salon_id)
            .options(
                selectinload(Salon.alumnos)
                .selectinload(AlumnoEnSalon.alumno)
                .selectinload(Alumno.usuario)
            )
        )
        salon = result.scalar_one_or_none()
        if not salon:
            raise ValueError(f"Salón {salon_id} no encontrado")

        # Crear documento PDF
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=0.5 * inch,
            leftMargin=0.5 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            textColor=colors.HexColor("#1F4788"),
            spaceAfter=12,
            alignment=1,  # Centrado
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=colors.HexColor("#2C5AA0"),
            spaceAfter=10,
            spaceBefore=10,
        )

        # Contenido del documento
        elements = []

        # Título
        elements.append(Paragraph("PARABOLIC LAB", title_style))
        elements.append(Paragraph("Reporte de Desempeño - Salón", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))

        # Información del salón
        salon_info = [
            ["Salón:", salon.nombresalon],
            ["Código de Acceso:", salon.codigoacceso],
            ["Total Estudiantes:", len(salon.alumnos)],
            ["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ]
        salon_table = Table(salon_info, colWidths=[2 * inch, 4 * inch])
        salon_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ]
            )
        )
        elements.append(salon_table)
        elements.append(Spacer(1, 0.3 * inch))

        # --- Collect per-student data ---
        student_rows = []  # list of dicts with computed stats
        try:
            for alumno_en_salon in salon.alumnos:
                alumno = alumno_en_salon.alumno
                usuario = alumno.usuario
                nombre_completo = " ".join(
                    filter(None, [usuario.nombre, usuario.apellidopaterno, usuario.apellidomaterno])
                )

                # Obtener interacciones
                result = await db.execute(
                    select(InteraccionEscenario).where(
                        InteraccionEscenario.idalumno == alumno.idalumno,
                        InteraccionEscenario.idescenario.in_(
                            select(Escenario.idescenario).where(Escenario.idsalon == salon.idsalon)
                        ),
                    )
                )
                interacciones = result.scalars().all()

                total_intentos = sum(int(i.intentosrealizados or 0) for i in interacciones)
                completadas = sum(1 for i in interacciones if i.completado)
                num_interacciones = len(interacciones)

                if interacciones:
                    promedio = (
                        sum(float(i.puntuacion or 0) for i in interacciones) / num_interacciones
                    )
                    mejor = max((float(i.puntuacion or 0) for i in interacciones), default=0)
                    tiempo_seg = sum(int(i.tiempototal or 0) for i in interacciones)
                    tasa = (completadas / num_interacciones * 100) if num_interacciones > 0 else 0
                else:
                    promedio = 0
                    mejor = 0
                    tiempo_seg = 0
                    tasa = 0

                student_rows.append(
                    {
                        "nombre": nombre_completo or "Sin nombre",
                        "matricula": alumno.matricula,
                        "promedio": float(promedio),
                        "mejor": float(mejor),
                        "completados": int(completadas),
                        "intentos": int(total_intentos),
                        "tiempo_min": round(tiempo_seg / 60, 2),
                        "tasa": round(float(tasa), 1),
                        "num_interacciones": int(num_interacciones),
                    }
                )

            # --- Resumen General de Desempeño ---
            has_data = any(s["num_interacciones"] > 0 for s in student_rows)

            if len(salon.alumnos) == 0:
                elements.append(Paragraph("Sin datos registrados - El salón no tiene estudiantes.", styles["Normal"]))
            elif not has_data:
                elements.append(
                    Paragraph(
                        "No hay datos de interacción registrados aún para ningún estudiante.",
                        styles["Normal"],
                    )
                )
            else:
                elements.append(Paragraph("Resumen General de Desempeño", heading_style))

                resumen_data = [
                    [
                        "Estudiante",
                        "Promedio",
                        "Mejor Puntaje",
                        "Completados",
                        "Intentos",
                        "Tiempo (min)",
                        "Tasa de Éxito (%)",
                    ]
                ]
                for s in student_rows:
                    resumen_data.append(
                        [
                            s["nombre"],
                            f"{s['promedio']:.2f}",
                            f"{s['mejor']:.2f}",
                            str(s["completados"]),
                            str(s["intentos"]),
                            f"{s['tiempo_min']:.2f}",
                            f"{s['tasa']:.1f}%",
                        ]
                    )

                resumen_table = Table(
                    resumen_data,
                    colWidths=[
                        1.8 * inch,
                        0.8 * inch,
                        0.9 * inch,
                        0.9 * inch,
                        0.8 * inch,
                        0.9 * inch,
                        1.0 * inch,
                    ],
                )
                resumen_table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C5AA0")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, -1), 9),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5FB")]),
                        ]
                    )
                )
                elements.append(resumen_table)
                elements.append(Spacer(1, 0.3 * inch))

                # --- Desglose por Estudiante (tabla detallada) ---
                elements.append(Paragraph("Desempeño por Estudiante", heading_style))

                detail_data = [
                    [
                        "Estudiante",
                        "Matrícula",
                        "Intentos",
                        "Completados",
                        "Promedio",
                        "Tiempo",
                        "Tasa Éxito (%)",
                    ]
                ]
                for s in student_rows:
                    tiempo_seg_total = int(s["tiempo_min"] * 60)
                    detail_data.append(
                        [
                            s["nombre"],
                            s["matricula"],
                            str(s["intentos"]),
                            str(s["completados"]),
                            f"{s['promedio']:.2f}",
                            f"{tiempo_seg_total // 60}m {tiempo_seg_total % 60}s",
                            f"{s['tasa']:.1f}%",
                        ]
                    )

                table = Table(
                    detail_data,
                    colWidths=[
                        1.8 * inch,
                        1 * inch,
                        0.8 * inch,
                        1 * inch,
                        0.8 * inch,
                        1 * inch,
                        1 * inch,
                    ],
                )
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C5AA0")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, -1), 9),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5FB")]),
                        ]
                    )
                )
                elements.append(table)

            elements.append(Spacer(1, 0.2 * inch))

            # Pie de página
            elements.append(Spacer(1, 0.3 * inch))
            elements.append(
                Paragraph(
                    f"<font size=8>Reporte generado automáticamente el "
                    f"{datetime.now().strftime('%Y-%m-%d %H:%M')}</font>",
                    styles["Normal"],
                )
            )

            # Construir PDF
            doc.build(elements)

        except Exception:
            logger.exception("Error generando PDF del salón %s", salon_id)
            raise

        return pdf_buffer.getvalue()

    @staticmethod
    async def generate_student_pdf_report(db: AsyncSession, alumno_id: str, salon_id: str) -> bytes:
        """
        Genera un reporte PDF de expediente del estudiante.
        Incluye detalles de intentos, parámetros físicos y tiempo de resolución.
        """
        # Obtener estudiante e interacciones
        result = await db.execute(
            select(Alumno).where(Alumno.idalumno == alumno_id).options(selectinload(Alumno.usuario))
        )
        alumno = result.scalar_one_or_none()
        if not alumno:
            raise ValueError(f"Estudiante {alumno_id} no encontrado")

        # Obtener interacciones del salón
        result = await db.execute(
            select(InteraccionEscenario)
            .where(
                InteraccionEscenario.idalumno == alumno_id,
                InteraccionEscenario.idescenario.in_(
                    select(Escenario.idescenario).where(Escenario.idsalon == salon_id)
                ),
            )
            .options(selectinload(InteraccionEscenario.escenario))
        )
        interacciones = result.scalars().all()

        usuario = alumno.usuario

        # Crear documento PDF
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=0.5 * inch,
            leftMargin=0.5 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=22,
            textColor=colors.HexColor("#1F4788"),
            spaceAfter=12,
            alignment=1,
        )

        elements = []

        # Título
        elements.append(Paragraph("PARABOLIC LAB", title_style))
        elements.append(Paragraph("Expediente de Estudiante", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))

        # Información del estudiante
        nombre_completo = " ".join(
            filter(None, [usuario.nombre, usuario.apellidopaterno, usuario.apellidomaterno])
        )
        student_info = [
            ["Nombre:", nombre_completo or "Sin nombre"],
            ["Matrícula:", alumno.matricula],
            ["Email:", usuario.email or "N/A"],
            ["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ]
        student_table = Table(student_info, colWidths=[2 * inch, 4 * inch])
        student_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ]
            )
        )
        elements.append(student_table)
        elements.append(Spacer(1, 0.3 * inch))

        if not interacciones:
            elements.append(
                Paragraph(
                    "Sin datos registrados - Este estudiante aún no ha participado en escenarios.", styles["Normal"]
                )
            )
        else:
            # --- Resumen General de Desempeño (upfront) ---
            heading_style = ParagraphStyle(
                "CustomHeading",
                parent=styles["Heading2"],
                fontSize=14,
                textColor=colors.HexColor("#2C5AA0"),
                spaceAfter=10,
                spaceBefore=10,
            )
            elements.append(Paragraph("Resumen General de Desempeño", heading_style))

            total_intentos_resumen = sum(int(i.intentosrealizados or 0) for i in interacciones)
            completadas_resumen = sum(1 for i in interacciones if i.completado)
            puntuacion_total_resumen = sum(float(i.puntuacion or 0) for i in interacciones)
            num_interacciones = len(interacciones)
            promedio_resumen = puntuacion_total_resumen / num_interacciones if num_interacciones > 0 else 0
            mejor_resumen = max((float(i.puntuacion or 0) for i in interacciones), default=0)
            tiempo_total_resumen = sum(int(i.tiempototal or 0) for i in interacciones)

            tasa_exito_resumen = (
                completadas_resumen / num_interacciones * 100 if num_interacciones > 0 else 0
            )
            resumen_data = [
                ["Promedio de Puntuación:", f"{promedio_resumen:.1f}"],
                ["Mejor Puntuación:", f"{mejor_resumen:.1f}"],
                ["Escenarios Completados:", f"{completadas_resumen} / {num_interacciones}"],
                ["Intentos Totales:", str(total_intentos_resumen)],
                ["Tiempo Total:", f"{tiempo_total_resumen} seg ({tiempo_total_resumen // 60} min)"],
                ["Tasa de Éxito:", f"{tasa_exito_resumen:.1f}%"],
            ]
            resumen_table = Table(resumen_data, colWidths=[2.5 * inch, 3.5 * inch])
            resumen_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                    ]
                )
            )
            elements.append(resumen_table)
            elements.append(Spacer(1, 0.3 * inch))

            # --- Detalle de Interacciones ---
            elements.append(Paragraph("Detalle de Interacciones", heading_style))

            # Tabla de intentos detallada
            table_data = [
                ["Escenario", "Nivel", "v₀ (m/s)", "θ (°)", "Intentos", "Completado", "Puntos", "Tiempo (s)", "Fecha"]
            ]

            for interaccion in interacciones:
                escenario = interaccion.escenario
                datos = interaccion.datosinteraccion or {}

                v0 = str(datos.get("velocidadInicial", "N/A"))
                angulo = str(datos.get("angulo", "N/A"))

                table_data.append(
                    [
                        escenario.nombre[:30],
                        escenario.niveldificultad[:3],
                        v0,
                        angulo,
                        str(interaccion.intentosrealizados or 0),
                        "✓" if interaccion.completado else "✗",
                        f"{float(interaccion.puntuacion or 0):.1f}",
                        f"{int(interaccion.tiempototal or 0)}",
                        interaccion.fechafin.strftime("%Y-%m-%d %H:%M") if interaccion.fechafin else "Sin registro",
                    ]
                )

            table = Table(
                table_data,
                colWidths=[
                    1.5 * inch,
                    0.7 * inch,
                    0.7 * inch,
                    0.6 * inch,
                    0.7 * inch,
                    0.75 * inch,
                    0.6 * inch,
                    0.75 * inch,
                    0.75 * inch,
                ],
            )
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C5AA0")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, 1), 8),
                        ("FONTSIZE", (0, 2), (-1, -1), 8),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5FB")]),
                    ]
                )
            )
            elements.append(table)

            # The summary stats are now shown at the top of the report.
            # No duplicate stats section at the bottom.

        # Pie de página
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(
            Paragraph(
                f"<font size=8>Reporte generado automáticamente el "
                f"{datetime.now().strftime('%Y-%m-%d %H:%M')}</font>",
                styles["Normal"],
            )
        )

        doc.build(elements)
        return pdf_buffer.getvalue()
