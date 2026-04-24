from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alumno import Alumno
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.salon import Salon
from app.models.usuario import Usuario


async def unirse(db: AsyncSession, usuario: Usuario, codigoacceso: str) -> AlumnoEnSalon:
    salon_result = await db.execute(select(Salon).where(Salon.codigoacceso == codigoacceso))
    salon = salon_result.scalar_one_or_none()
    if not salon:
        raise ValueError("Salon no encontrado")

    alumno_result = await db.execute(select(Alumno).where(Alumno.idusuario == usuario.idusuario))
    alumno = alumno_result.scalar_one_or_none()
    if not alumno:
        raise ValueError("Alumno no encontrado")

    existing = await db.execute(
        select(AlumnoEnSalon).where(
            AlumnoEnSalon.idalumno == alumno.idalumno,
            AlumnoEnSalon.idsalon == salon.idsalon,
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("Ya estás inscrito en este salón")

    registro = AlumnoEnSalon(idalumno=alumno.idalumno, idsalon=salon.idsalon)
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro
