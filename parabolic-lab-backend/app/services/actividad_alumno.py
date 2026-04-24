from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.actividad_alumno import ActividadAlumno
from app.schemas.actividad_alumno import ActividadAlumnoCreate, ActividadAlumnoUpdate


async def crear_actividad_alumno(
    db: AsyncSession,
    data: ActividadAlumnoCreate,
) -> ActividadAlumno:
    registro = ActividadAlumno(
        idactividad=data.idactividad,
        idalumno=data.idalumno,
    )
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro


async def actualizar_actividad_alumno(
    db: AsyncSession,
    idactividadalumno: UUID,
    data: ActividadAlumnoUpdate,
) -> ActividadAlumno | None:
    result = await db.execute(
        select(ActividadAlumno).where(ActividadAlumno.idactividadalumno == idactividadalumno)
    )
    registro = result.scalar_one_or_none()
    if not registro:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)

    await db.commit()
    await db.refresh(registro)
    return registro
