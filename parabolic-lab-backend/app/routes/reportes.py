"""
Router para reportes de desempeño.
Genera reportes CSV y PDF para docentes.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.usuario import Usuario
from app.models.salon import Salon
from app.models.alumno import Alumno
from app.services.reports import ReportService

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/salon/{salon_id}/csv")
async def get_salon_csv_report(
    salon_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Descarga reporte CSV consolidado del salón.
    Solo docentes propietarios del salón pueden acceder.
    """
    # Validar que el usuario es docente
    if not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar reportes",
        )

    # Validar que el salón pertenece al docente
    result = await db.execute(
        select(Salon).where(
            Salon.idsalon == salon_id,
            Salon.iddocente == current_user.docente.iddocente,
        )
    )
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salón no encontrado o no tienes permisos",
        )

    # Generar reporte
    csv_data = await ReportService.generate_salon_csv_report(db, salon_id)

    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_salon_{salon.nombresalon.replace(" ", "_")}.csv"'
        },
    )


@router.get("/salon/{salon_id}/pdf")
async def get_salon_pdf_report(
    salon_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Descarga reporte PDF del salón.
    Solo docentes propietarios del salón pueden acceder.
    """
    # Validar que el usuario es docente
    if not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar reportes",
        )

    # Validar que el salón pertenece al docente
    result = await db.execute(
        select(Salon).where(
            Salon.idsalon == salon_id,
            Salon.iddocente == current_user.docente.iddocente,
        )
    )
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salón no encontrado o no tienes permisos",
        )

    # Generar reporte
    pdf_data = await ReportService.generate_salon_pdf_report(db, salon_id)

    return StreamingResponse(
        iter([pdf_data]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_salon_{salon.nombresalon.replace(" ", "_")}.pdf"'
        },
    )


@router.get("/estudiante/{alumno_id}/salon/{salon_id}/csv")
async def get_student_csv_report(
    alumno_id: str,
    salon_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Descarga reporte CSV del expediente de un estudiante.
    Solo el docente propietario del salón puede acceder.
    """
    # Validar que el usuario es docente
    if not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar reportes",
        )

    # Validar que el salón pertenece al docente
    result = await db.execute(
        select(Salon).where(
            Salon.idsalon == salon_id,
            Salon.iddocente == current_user.docente.iddocente,
        )
    )
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salón no encontrado o no tienes permisos",
        )

    # Generar reporte
    try:
        csv_data = await ReportService.generate_student_csv_report(
            db, alumno_id, salon_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    # Obtener nombre del estudiante
    result = await db.execute(
        select(Alumno)
        .where(Alumno.idalumno == alumno_id)
        .options(selectinload(Alumno.usuario))
    )
    alumno = result.scalar_one_or_none()
    nombre_alumno = alumno.usuario.nombre.replace(" ", "_") if alumno else "estudiante"

    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="expediente_{nombre_alumno}.csv"'
        },
    )


@router.get("/estudiante/{alumno_id}/salon/{salon_id}/pdf")
async def get_student_pdf_report(
    alumno_id: str,
    salon_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Descarga reporte PDF del expediente de un estudiante.
    Solo el docente propietario del salón puede acceder.
    """
    # Validar que el usuario es docente
    if not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar reportes",
        )

    # Validar que el salón pertenece al docente
    result = await db.execute(
        select(Salon).where(
            Salon.idsalon == salon_id,
            Salon.iddocente == current_user.docente.iddocente,
        )
    )
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salón no encontrado o no tienes permisos",
        )

    # Generar reporte
    try:
        pdf_data = await ReportService.generate_student_pdf_report(
            db, alumno_id, salon_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    # Obtener nombre del estudiante
    result = await db.execute(
        select(Alumno)
        .where(Alumno.idalumno == alumno_id)
        .options(selectinload(Alumno.usuario))
    )
    alumno = result.scalar_one_or_none()
    nombre_alumno = alumno.usuario.nombre.replace(" ", "_") if alumno else "estudiante"

    return StreamingResponse(
        iter([pdf_data]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="expediente_{nombre_alumno}.pdf"'
        },
    )
