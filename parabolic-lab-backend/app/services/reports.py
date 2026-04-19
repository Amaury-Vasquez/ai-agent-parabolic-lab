"""
Servicio para generación de reportes en CSV y PDF.
Incluye desempeño de estudiantes, parámetros físicos y estadísticas de éxito.
"""

import csv
import io
from datetime import datetime
from decimal import Decimal
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from decimal import Decimal as Dec

from app.models.salon import Salon
from app.models.alumno import Alumno
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.escenario import Escenario


class ReportService:
    """Servicio para generar reportes de desempeño académico."""

    @staticmethod
    async def generate_salon_csv_report(
        db: AsyncSession, salon_id: str
    ) -> bytes:
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
            .options(selectinload(Salon.alumnos))
        )
        salon = result.scalar_one_or_none()
        if not salon:
            raise ValueError(f"Salón {salon_id} no encontrado")

        # Crear buffer para CSV
        output = io.StringIO()
        writer = csv.writer(output, encoding="utf-8")

        # Encabezado general
        writer.writerow(["REPORTE DE DESEMPEÑO - SALÓN"])
        writer.writerow([])
        writer.writerow(["Salón:", salon.nombresalon])
        writer.writerow(["Código de Acceso:", salon.codigoacceso])
        writer.writerow(["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow([])

        # Encabezado de tabla de estudiantes
        writer.writerow([
            "Nombre Estudiante",
            "Matrícula",
            "Total Intentos",
            "Escenarios Completados",
            "Puntuación Promedio",
            "Tiempo Promedio (seg)",
            "Tasa Éxito (%)"
        ])

        # Procesar cada estudiante
        for alumno_en_salon in salon.alumnos:
            alumno = alumno_en_salon.alumno
            usuario = alumno.usuario

            # Obtener interacciones del estudiante en escenarios de este salón
            result = await db.execute(
                select(InteraccionEscenario).where(
                    InteraccionEscenario.idalumno == alumno.idalumno,
                    InteraccionEscenario.idescenario.in_(
                        select(Escenario.idescenario).where(
                            Escenario.idsalon == salon.idsalon
                        )
                    )
                )
            )
            interacciones = result.scalars().all()

            # Calcular estadísticas
            total_intentos = len(interacciones)
            completadas = sum(1 for i in interacciones if i.completado)
            
            if interacciones:
                puntuacion_promedio = sum(
                    float(i.puntuacion) for i in interacciones if i.puntuacion
                ) / len(interacciones) if total_intentos > 0 else 0
                
                tiempo_promedio = sum(
                    int(i.tiempototal) for i in interacciones if i.tiempototal
                ) / len(interacciones) if total_intentos > 0 else 0
                
                tasa_exito = (completadas / total_intentos * 100) if total_intentos > 0 else 0
            else:
                puntuacion_promedio = 0
                tiempo_promedio = 0
                tasa_exito = 0

            writer.writerow([
                usuario.nombre or "Sin nombre",
                alumno.matricula,
                total_intentos,
                completadas,
                round(puntuacion_promedio, 2),
                round(tiempo_promedio, 2),
                round(tasa_exito, 2)
            ])

        # Convertir a bytes
        return output.getvalue().encode("utf-8")

    @staticmethod
    async def generate_student_csv_report(
        db: AsyncSession, alumno_id: str, salon_id: str
    ) -> bytes:
        """Genera reporte CSV de un estudiante específico en un salón."""
        # Obtener alumno
        result = await db.execute(
            select(Alumno)
            .where(Alumno.idalumno == alumno_id)
            .options(selectinload(Alumno.usuario))
        )
        alumno = result.scalar_one_or_none()
        if not alumno:
            raise ValueError(f"Estudiante {alumno_id} no encontrado")
        
        usuario = alumno.usuario

        # Obtener interacciones del estudiante en el salón
        result = await db.execute(
            select(InteraccionEscenario).where(
                InteraccionEscenario.idalumno == alumno_id,
                InteraccionEscenario.idescenario.in_(
                    select(Escenario.idescenario).where(
                        Escenario.idsalon == salon_id
                    )
                )
            ).options(
                selectinload(InteraccionEscenario.escenario)
            )
        )
        interacciones = result.scalars().all()

        # Crear buffer
        output = io.StringIO()
        writer = csv.writer(output, encoding="utf-8")

        # Encabezado
        writer.writerow(["EXPEDIENTE DE DESEMPEÑO - ESTUDIANTE"])
        writer.writerow([])
        writer.writerow(["Nombre:", usuario.nombre or "Sin nombre"])
        writer.writerow(["Matrícula:", alumno.matricula])
        writer.writerow(["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow([])

        if not interacciones:
            writer.writerow(["Sin datos registrados"])
            writer.writerow([])
            writer.writerow(["Este estudiante aún no ha participado en escenarios."])
        else:
            # Tabla de intentos
            writer.writerow([
                "Escenario",
                "Nivel Dificultad",
                "Velocidad Inicial (m/s)",
                "Ángulo (°)",
                "Intentos",
                "Completado",
                "Puntuación",
                "Tiempo Total (seg)",
                "Fecha"
            ])

            for interaccion in interacciones:
                escenario = interaccion.escenario
                datos = interaccion.datosinteraccion or {}
                
                v0 = datos.get("velocidadInicial", "N/A")
                angulo = datos.get("angulo", "N/A")
                
                writer.writerow([
                    escenario.nombre,
                    escenario.niveldificultad,
                    v0,
                    angulo,
                    interaccion.intentosrealizados,
                    "Sí" if interaccion.completado else "No",
                    round(float(interaccion.puntuacion) if interaccion.puntuacion else 0, 2),
                    int(interaccion.tiempototal) if interaccion.tiempototal else 0,
                    interaccion.fechafin.strftime("%Y-%m-%d %H:%M") if interaccion.fechafin else "En progreso"
                ])

        return output.getvalue().encode("utf-8")

    @staticmethod
    async def generate_salon_pdf_report(
        db: AsyncSession, salon_id: str
    ) -> bytes:
        """
        Genera un reporte PDF profesional del salón.
        Incluye tablas, estadísticas y parámetros físicos.
        """
        # Obtener datos del salón
        result = await db.execute(
            select(Salon)
            .where(Salon.idsalon == salon_id)
            .options(selectinload(Salon.alumnos).selectinload(AlumnoEnSalon.alumno))
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
            ["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ]
        salon_table = Table(salon_info, colWidths=[2 * inch, 4 * inch])
        salon_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ])
        )
        elements.append(salon_table)
        elements.append(Spacer(1, 0.3 * inch))

        # Tabla de estudiantes
        elements.append(Paragraph("Desempeño por Estudiante", heading_style))

        table_data = [[
            "Estudiante",
            "Matrícula",
            "Intentos",
            "Completados",
            "Promedio",
            "Tiempo Promedio",
            "Tasa Éxito (%)",
        ]]

        has_data = False
        for alumno_en_salon in salon.alumnos:
            alumno = alumno_en_salon.alumno
            usuario = alumno.usuario

            # Obtener interacciones
            result = await db.execute(
                select(InteraccionEscenario).where(
                    InteraccionEscenario.idalumno == alumno.idalumno,
                    InteraccionEscenario.idescenario.in_(
                        select(Escenario.idescenario).where(
                            Escenario.idsalon == salon.idsalon
                        )
                    )
                )
            )
            interacciones = result.scalars().all()

            total_intentos = len(interacciones)
            completadas = sum(1 for i in interacciones if i.completado)
            
            if interacciones:
                has_data = True
                promedio = sum(
                    float(i.puntuacion) for i in interacciones if i.puntuacion
                ) / len(interacciones) if total_intentos > 0 else 0
                
                tiempo = sum(
                    int(i.tiempototal) for i in interacciones if i.tiempototal
                ) / len(interacciones) if total_intentos > 0 else 0
                
                tasa = (completadas / total_intentos * 100) if total_intentos > 0 else 0
            else:
                promedio = 0
                tiempo = 0
                tasa = 0

            table_data.append([
                usuario.nombre or "Sin nombre",
                alumno.matricula,
                str(total_intentos),
                str(completadas),
                f"{promedio:.2f}",
                f"{tiempo:.0f}s",
                f"{tasa:.1f}%",
            ])

        if not has_data and len(salon.alumnos) > 0:
            elements.append(Paragraph(
                "No hay datos de interacción registrados aún para ningún estudiante.",
                styles["Normal"]
            ))
        elif len(salon.alumnos) == 0:
            elements.append(Paragraph(
                "Sin datos registrados - El salón no tiene estudiantes.",
                styles["Normal"]
            ))
        else:
            # Crear tabla
            table = Table(table_data, colWidths=[1.8*inch, 1*inch, 0.8*inch, 1*inch, 0.8*inch, 1*inch, 1*inch])
            table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2C5AA0")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F0F5FB")]),
                ])
            )
            elements.append(table)
        elements.append(Spacer(1, 0.2 * inch))

        # Pie de página
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph(
            f"<font size=8>Reporte generado automáticamente el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</font>",
            styles["Normal"]
        ))

        # Construir PDF
        doc.build(elements)

        return pdf_buffer.getvalue()

    @staticmethod
    async def generate_student_pdf_report(
        db: AsyncSession, alumno_id: str, salon_id: str
    ) -> bytes:
        """
        Genera un reporte PDF de expediente del estudiante.
        Incluye detalles de intentos, parámetros físicos y tiempo de resolución.
        """
        # Obtener estudiante e interacciones
        result = await db.execute(
            select(Alumno)
            .where(Alumno.idalumno == alumno_id)
            .options(selectinload(Alumno.usuario))
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
                    select(Escenario.idescenario).where(
                        Escenario.idsalon == salon_id
                    )
                )
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
        student_info = [
            ["Nombre:", usuario.nombre or "Sin nombre"],
            ["Matrícula:", alumno.matricula],
            ["Email:", usuario.email or "N/A"],
            ["Fecha Reporte:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        ]
        student_table = Table(student_info, colWidths=[2 * inch, 4 * inch])
        student_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ])
        )
        elements.append(student_table)
        elements.append(Spacer(1, 0.3 * inch))

        if not interacciones:
            elements.append(Paragraph(
                "Sin datos registrados - Este estudiante aún no ha participado en escenarios.",
                styles["Normal"]
            ))
        else:
            # Tabla de intentos detallada
            table_data = [[
                "Escenario",
                "Nivel",
                "v₀ (m/s)",
                "θ (°)",
                "Intentos",
                "Completado",
                "Puntos",
                "Tiempo (s)",
                "Fecha"
            ]]

            for interaccion in interacciones:
                escenario = interaccion.escenario
                datos = interaccion.datosinteraccion or {}
                
                v0 = str(datos.get("velocidadInicial", "N/A"))
                angulo = str(datos.get("angulo", "N/A"))
                
                table_data.append([
                    escenario.nombre[:20],
                    escenario.niveldificultad[:3],
                    v0,
                    angulo,
                    str(interaccion.intentosrealizados or 0),
                    "✓" if interaccion.completado else "✗",
                    f"{float(interaccion.puntuacion or 0):.1f}",
                    f"{int(interaccion.tiempototal or 0)}",
                    interaccion.fechafin.strftime("%m/%d") if interaccion.fechafin else "---"
                ])

            table = Table(table_data, colWidths=[1.5*inch, 0.7*inch, 0.7*inch, 0.6*inch, 0.7*inch, 0.75*inch, 0.6*inch, 0.75*inch, 0.75*inch])
            table.setStyle(
                TableStyle([
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
                ])
            )
            elements.append(table)

            # Estadísticas finales
            elements.append(Spacer(1, 0.2 * inch))
            
            total_intentos = len(interacciones)
            completadas = sum(1 for i in interacciones if i.completado)
            puntuacion_total = sum(float(i.puntuacion or 0) for i in interacciones)
            tiempo_total = sum(int(i.tiempototal or 0) for i in interacciones)
            
            stats_info = [
                ["Total Escenarios:", str(total_intentos)],
                ["Completados:", str(completadas)],
                ["Tasa de Éxito:", f"{(completadas/total_intentos*100 if total_intentos > 0 else 0):.1f}%"],
                ["Puntuación Total:", f"{puntuacion_total:.1f}"],
                ["Tiempo Total Invertido:", f"{tiempo_total} segundos ({tiempo_total//60} min)"],
            ]
            stats_table = Table(stats_info, colWidths=[2.5*inch, 3.5*inch])
            stats_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F0F8")),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ])
            )
            elements.append(stats_table)

        # Pie de página
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph(
            f"<font size=8>Reporte generado automáticamente el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</font>",
            styles["Normal"]
        ))

        doc.build(elements)
        return pdf_buffer.getvalue()
