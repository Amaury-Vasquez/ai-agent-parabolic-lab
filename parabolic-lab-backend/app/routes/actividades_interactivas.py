from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_current_user, get_db
from app.models.actividad_interactiva import ActividadInteractiva
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.escenario_en_actividad import EscenarioEnActividad
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.actividad_interactiva import (
    ActividadConEscenariosRead,
    ActividadInteractivaRead,
)
from app.schemas.escenario import EscenarioRead

router = APIRouter(prefix="/actividades-interactivas", tags=["ActividadesInteractivas"])


def _serializar_con_escenarios(actividad: ActividadInteractiva) -> ActividadConEscenariosRead:
    escenarios = [
        EscenarioRead.model_validate(rel.escenario)
        for rel in actividad.escenarios
        if rel.escenario is not None and rel.escenario.activo
    ]
    return ActividadConEscenariosRead(
        idactividad=actividad.idactividad,
        idsalon=actividad.idsalon,
        titulo=actividad.titulo,
        descripcion=actividad.descripcion,
        instrucciones=actividad.instrucciones,
        duracionminutos=actividad.duracionminutos,
        intentospermitidos=actividad.intentospermitidos,
        fechacreacion=actividad.fechacreacion,
        fechamodificacion=actividad.fechamodificacion,
        fechaexpiracion=actividad.fechaexpiracion,
        puntuaciontotal=actividad.puntuaciontotal,
        tipoactividad=actividad.tipoactividad,
        activa=actividad.activa,
        escenarios=escenarios,
    )


@router.get("/me", response_model=list[ActividadConEscenariosRead])
async def listar_mis_actividades(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Devuelve actividades del usuario actual con escenarios anidados.

    - Alumno: actividades de sus salones activos
    - Docente: actividades de los salones que administra
    """
    if current_user.tipousuario == "alumno":
        if not current_user.alumno:
            return []
        salones_query = (
            select(Salon.idsalon)
            .join(AlumnoEnSalon, AlumnoEnSalon.idsalon == Salon.idsalon)
            .where(AlumnoEnSalon.idalumno == current_user.alumno.idalumno)
            .where(AlumnoEnSalon.activo.is_(True))
            .where(Salon.activo.is_(True))
        )
    elif current_user.tipousuario == "docente":
        if not current_user.docente:
            return []
        salones_query = (
            select(Salon.idsalon)
            .where(Salon.iddocente == current_user.docente.iddocente)
            .where(Salon.activo.is_(True))
        )
    else:
        return []

    salones_result = await db.execute(salones_query)
    idsalones = [row[0] for row in salones_result.all()]
    if not idsalones:
        return []

    query = (
        select(ActividadInteractiva)
        .where(ActividadInteractiva.idsalon.in_(idsalones))
        .where(ActividadInteractiva.activa.is_(True))
        .options(
            selectinload(ActividadInteractiva.escenarios).selectinload(
                EscenarioEnActividad.escenario
            )
        )
        .order_by(ActividadInteractiva.fechacreacion.desc())
    )
    result = await db.execute(query)
    actividades = result.scalars().unique().all()
    return [_serializar_con_escenarios(a) for a in actividades]


@router.get("/", response_model=list[ActividadInteractivaRead])
async def listar_actividades_interactivas(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(ActividadInteractiva))
    return result.scalars().all()


@router.get("/{idactividad}", response_model=ActividadInteractivaRead)
async def obtener_actividad_interactiva(
    idactividad: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(ActividadInteractiva).where(ActividadInteractiva.idactividad == idactividad))
    actividad = result.scalar_one_or_none()
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad interactiva no encontrada")
    return actividad
