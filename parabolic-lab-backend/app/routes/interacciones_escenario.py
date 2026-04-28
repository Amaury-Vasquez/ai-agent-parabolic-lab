from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.usuario import Usuario
from app.schemas.interaccion_escenario import (
    InteraccionEscenarioCreate,
    InteraccionEscenarioRead,
    InteraccionEscenarioUpdate,
    ProgresoAlumnoRead,
)

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
        select(InteraccionEscenario).where(InteraccionEscenario.idalumno == idalumno)
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
    result = await db.execute(select(InteraccionEscenario))
    return result.scalars().all()


@router.get("/{idinteraccion}", response_model=InteraccionEscenarioRead)
async def obtener_interaccion_escenario(
    idinteraccion: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(InteraccionEscenario).where(InteraccionEscenario.idinteraccion == idinteraccion))
    interaccion = result.scalar_one_or_none()
    if not interaccion:
        raise HTTPException(status_code=404, detail="Interaccion de escenario no encontrada")
    return interaccion


@router.post("/", response_model=InteraccionEscenarioRead, status_code=201)
async def crear_interaccion_escenario(
    data: InteraccionEscenarioCreate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    interaccion = InteraccionEscenario(
        idescenario=data.idescenario,
        idalumno=data.idalumno,
    )
    db.add(interaccion)
    await db.commit()
    await db.refresh(interaccion)
    return interaccion


@router.patch("/{idinteraccion}", response_model=InteraccionEscenarioRead)
async def actualizar_interaccion_escenario(
    idinteraccion: UUID,
    data: InteraccionEscenarioUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(InteraccionEscenario).where(InteraccionEscenario.idinteraccion == idinteraccion))
    interaccion = result.scalar_one_or_none()
    if not interaccion:
        raise HTTPException(status_code=404, detail="Interaccion de escenario no encontrada")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(interaccion, field, value)

    await db.commit()
    await db.refresh(interaccion)
    return interaccion
