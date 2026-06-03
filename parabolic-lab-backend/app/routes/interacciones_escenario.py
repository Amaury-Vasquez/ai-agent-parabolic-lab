import io
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.alumno import Alumno
from app.models.escenario import Escenario
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.interaccion_escenario import (
    AnalisisReporte,
    DisparoReporte,
    IntentoComparativo,
    InteraccionEscenarioCreate,
    InteraccionEscenarioRead,
    InteraccionEscenarioUpdate,
    ProgresoAlumnoRead,
    ReporteInteraccionRead,
)
from app.services.reports import ReportService

router = APIRouter(prefix="/interacciones-escenario", tags=["InteraccionesEscenario"])


def _require_alumno(current_user: Usuario) -> None:
    if current_user.tipousuario != "alumno" or not current_user.alumno:
        raise HTTPException(status_code=403, detail="Acceso restringido a alumnos")


@router.get("/me", response_model=ProgresoAlumnoRead)
async def obtener_progreso_alumno(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    _require_alumno(current_user)
    idalumno = current_user.alumno.idalumno

    result = await db.execute(
        select(InteraccionEscenario)
        .where(InteraccionEscenario.idalumno == idalumno)
        .options(selectinload(InteraccionEscenario.escenario))
    )
    interacciones = result.scalars().all()

    puntuaciones = [float(i.puntuacion) for i in interacciones if i.puntuacion is not None]
    tiempos = [i.tiempototal for i in interacciones if i.tiempototal is not None]

    return ProgresoAlumnoRead(
        total_escenarios=len({i.idescenario for i in interacciones}),
        escenarios_completados=len({i.idescenario for i in interacciones if i.completado}),
        puntuacion_promedio=sum(puntuaciones) / len(puntuaciones) if puntuaciones else None,
        mejor_puntuacion=max(puntuaciones) if puntuaciones else None,
        tiempo_total_minutos=sum(tiempos) / 60 if tiempos else 0.0,
        interacciones=list(interacciones),
    )


@router.get("/", response_model=list[InteraccionEscenarioRead])
async def listar_interacciones_escenario(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(
        select(InteraccionEscenario).options(
            selectinload(InteraccionEscenario.escenario)
        )
    )
    return result.scalars().all()


@router.get("/{idinteraccion}", response_model=InteraccionEscenarioRead)
async def obtener_interaccion_escenario(
    idinteraccion: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(
        select(InteraccionEscenario)
        .where(InteraccionEscenario.idinteraccion == idinteraccion)
        .options(selectinload(InteraccionEscenario.escenario))
    )
    interaccion = result.scalar_one_or_none()
    if not interaccion:
        raise HTTPException(status_code=404, detail="Interaccion de escenario no encontrada")
    return interaccion


@router.post("/", response_model=InteraccionEscenarioRead, status_code=201)
async def crear_interaccion_escenario(
    data: InteraccionEscenarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Si el usuario es alumno: usar su propio idalumno (ignora body para evitar suplantación).
    # Para otros roles, mantener el comportamiento anterior basado en el body.
    if current_user.tipousuario == "alumno":
        if not current_user.alumno:
            raise HTTPException(status_code=403, detail="Alumno no encontrado")
        idalumno = current_user.alumno.idalumno
    else:
        idalumno = data.idalumno

    interaccion = InteraccionEscenario(
        idescenario=data.idescenario,
        idalumno=idalumno,
    )
    db.add(interaccion)
    await db.commit()
    await db.refresh(interaccion, attribute_names=["escenario"])
    return interaccion


@router.patch("/{idinteraccion}", response_model=InteraccionEscenarioRead)
async def actualizar_interaccion_escenario(
    idinteraccion: UUID,
    data: InteraccionEscenarioUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(
        select(InteraccionEscenario)
        .where(InteraccionEscenario.idinteraccion == idinteraccion)
        .options(selectinload(InteraccionEscenario.escenario))
    )
    interaccion = result.scalar_one_or_none()
    if not interaccion:
        raise HTTPException(status_code=404, detail="Interaccion de escenario no encontrada")

    payload = data.model_dump(exclude_none=True)
    # Si el cliente marca completado y no envía fechafin, lo asignamos en el server.
    if payload.get("completado") is True and "fechafin" not in payload:
        payload["fechafin"] = datetime.utcnow()

    for field, value in payload.items():
        # Las columnas DateTime del modelo son naive. Si el cliente manda ISO
        # con timezone (e.g. ...Z), lo convertimos a UTC naive antes de asignar.
        if (
            field == "fechafin"
            and hasattr(value, "tzinfo")
            and value.tzinfo is not None
        ):
            value = value.astimezone(UTC).replace(tzinfo=None)
        setattr(interaccion, field, value)

    await db.commit()
    await db.refresh(interaccion)
    return interaccion


async def _get_reporte_data(
    idinteraccion: UUID,
    db: AsyncSession,
    current_user: Usuario,
) -> ReporteInteraccionRead:
    """Construye los datos del reporte para un intento completado."""
    result = await db.execute(
        select(InteraccionEscenario)
        .where(InteraccionEscenario.idinteraccion == idinteraccion)
        .options(selectinload(InteraccionEscenario.escenario))
    )
    interaccion = result.scalar_one_or_none()
    if not interaccion:
        raise HTTPException(status_code=404, detail="Interaccion de escenario no encontrada")

    if not interaccion.completado:
        raise HTTPException(status_code=400, detail="El intento no ha sido completado aún")

    # Autorización: alumno dueño, docente del salón al que pertenece el
    # escenario, o admin de la institución del alumno
    if current_user.tipousuario == "alumno":
        if not current_user.alumno or interaccion.idalumno != current_user.alumno.idalumno:
            raise HTTPException(status_code=403, detail="No tienes acceso a este reporte")
    elif current_user.tipousuario == "docente":
        if not current_user.docente:
            raise HTTPException(status_code=403, detail="Acceso denegado")
        # El escenario pertenece a un salón; verificamos que ese salón sea del
        # docente con una consulta directa. No usamos current_user.docente.salones
        # porque esa relación no se carga en get_current_user y un lazy-load en
        # contexto async lanza MissingGreenlet.
        escenario_result = await db.execute(
            select(Escenario).where(Escenario.idescenario == interaccion.idescenario)
        )
        escenario_obj = escenario_result.scalar_one_or_none()
        if not escenario_obj:
            raise HTTPException(status_code=403, detail="No tienes acceso a este reporte")

        salon_result = await db.execute(
            select(Salon).where(
                Salon.idsalon == escenario_obj.idsalon,
                Salon.iddocente == current_user.docente.iddocente,
            )
        )
        if not salon_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="No tienes acceso a este reporte")
    elif current_user.tipousuario == "admin":
        if not current_user.admin:
            raise HTTPException(status_code=403, detail="Acceso denegado")
        # El alumno del intento debe pertenecer a la institución del admin.
        alumno_result = await db.execute(
            select(Alumno)
            .join(Usuario, Alumno.idusuario == Usuario.idusuario)
            .where(
                Alumno.idalumno == interaccion.idalumno,
                Usuario.idinstitucion == current_user.idinstitucion,
            )
        )
        if not alumno_result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="No tienes acceso a este reporte")
    else:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    escenario = interaccion.escenario
    cfg = (escenario.configuracionescenario or {}) if escenario else {}
    physics = cfg.get("physics", {})

    datos = interaccion.datosinteraccion or {}
    disparos_raw = datos.get("disparos", [])
    resolucion = datos.get("resolucion", {})
    respuestas = resolucion.get("respuestas", {}) if resolucion else {}

    # Construir lista de disparos
    disparos = [
        DisparoReporte(
            n=d.get("n", i + 1),
            angulo=d.get("angle"),
            velocidad=d.get("velocity"),
            altura_canon=d.get("cannonHeight"),
            distancia=d.get("distance"),
            acierto=bool(d.get("hit", False)),
            puntos=int(d.get("points", 0)),
        )
        for i, d in enumerate(disparos_raw)
    ]

    # Construir análisis
    angulo_correcto = physics.get("angleDefault") or cfg.get("angle")
    velocidad_correcta = physics.get("velocityDefault") or cfg.get("velocity")
    alcance_correcto = physics.get("targetDistance") or cfg.get("targetDistance")

    analisis = AnalisisReporte(
        angulo_alumno=respuestas.get("angulo"),
        angulo_correcto=float(angulo_correcto) if angulo_correcto is not None else None,
        velocidad_alumno=respuestas.get("velocidad"),
        velocidad_correcta=float(velocidad_correcta) if velocidad_correcta is not None else None,
        alcance_alumno=respuestas.get("alcance"),
        alcance_correcto=float(alcance_correcto) if alcance_correcto is not None else None,
        altura_maxima_alumno=respuestas.get("alturaMaxima"),
        tiempo_vuelo_alumno=respuestas.get("tiempoVuelo"),
        procedimiento=resolucion.get("procedimiento") if resolucion else None,
        notas=resolucion.get("notas") if resolucion else None,
    )

    # Comparativa: otros intentos del mismo alumno en el mismo escenario
    comp_result = await db.execute(
        select(InteraccionEscenario).where(
            InteraccionEscenario.idalumno == interaccion.idalumno,
            InteraccionEscenario.idescenario == interaccion.idescenario,
            InteraccionEscenario.idinteraccion != idinteraccion,
        )
    )
    otros = comp_result.scalars().all()
    comparativa = [
        IntentoComparativo(
            idinteraccion=o.idinteraccion,
            fechainicio=o.fechainicio,
            puntuacion=float(o.puntuacion) if o.puntuacion is not None else None,
            intentosrealizados=o.intentosrealizados,
            completado=o.completado,
        )
        for o in otros
    ]

    return ReporteInteraccionRead(
        idinteraccion=interaccion.idinteraccion,
        idescenario=interaccion.idescenario,
        nombre_escenario=escenario.nombre if escenario else "Escenario",
        descripcion=escenario.descripcion if escenario else None,
        niveldificultad=escenario.niveldificultad if escenario else "—",
        fechainicio=interaccion.fechainicio,
        fechafin=interaccion.fechafin,
        tiempototal=interaccion.tiempototal,
        intentosrealizados=interaccion.intentosrealizados,
        puntuacion=float(interaccion.puntuacion) if interaccion.puntuacion is not None else None,
        disparos=disparos,
        analisis=analisis,
        comparativa=comparativa,
    )


@router.get("/{idinteraccion}/reporte", response_model=ReporteInteraccionRead)
async def obtener_reporte_intento(
    idinteraccion: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return await _get_reporte_data(idinteraccion, db, current_user)


@router.get("/{idinteraccion}/reporte/pdf")
async def descargar_reporte_intento_pdf(
    idinteraccion: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = await _get_reporte_data(idinteraccion, db, current_user)
    pdf_bytes = await ReportService.generate_interaccion_pdf_report(reporte)
    filename = f"reporte_{str(idinteraccion)[:8]}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{idinteraccion}/reporte/xlsx")
async def descargar_reporte_intento_xlsx(
    idinteraccion: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    reporte = await _get_reporte_data(idinteraccion, db, current_user)
    xlsx_bytes = await ReportService.generate_interaccion_xlsx_report(reporte)
    filename = f"reporte_{str(idinteraccion)[:8]}.xlsx"
    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
