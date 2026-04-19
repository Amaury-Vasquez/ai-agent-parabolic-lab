from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.salon import Salon
from app.models.alumno_en_salon import AlumnoEnSalon

def list_salones_by_docente(docente_id: UUID, db: AsyncSession):
    query = (
        select(Salon)
        .where(Salon.iddocente == docente_id)
        .where(Salon.activo.is_(True))
        .options(selectinload(Salon.escenarios), selectinload(Salon.alumnos))
    )
    return db.execute(query)

def get_salon(idsalon: UUID, db: AsyncSession):
    query = select(Salon).where(Salon.idsalon == idsalon)
    return db.execute(query)

def create_salon(data, docente_id: UUID, institucion_id: UUID, db: AsyncSession):
    salon = Salon(
        iddocente=docente_id,
        idinstitucion=institucion_id,
        nombresalon=data.nombresalon,
    )
    db.add(salon)
    db.commit()
    db.refresh(salon)
    return salon

def update_salon(idsalon: UUID, data, db: AsyncSession):
    query = select(Salon).where(Salon.idsalon == idsalon)
    salon = db.execute(query).scalar_one_or_none()
    if salon:
        for key, value in data.items():
            setattr(salon, key, value)
        salon.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
        db.commit()
        db.refresh(salon)
    return salon

def delete_salon(idsalon: UUID, db: AsyncSession):
    query = select(Salon).where(Salon.idsalon == idsalon)
    salon = db.execute(query).scalar_one_or_none()
    if salon:
        salon.activo = False
        salon.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
        db.commit()
    return salon