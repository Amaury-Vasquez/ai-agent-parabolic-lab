from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.escenario import Escenario
from app.models.salon import Salon

def list_escenarios_by_salon(idsalon: UUID, db: AsyncSession):
    query = select(Escenario).where(Escenario.idsalon == idsalon)
    return db.execute(query)

def list_escenarios_by_docente(docente_id: UUID, db: AsyncSession):
    query = (
        select(Escenario)
        .join(Salon, Salon.idsalon == Escenario.idsalon)
        .where(Salon.iddocente == docente_id)
        .where(Escenario.activo.is_(True))
    )
    return db.execute(query)

def get_escenario(idescenario: UUID, db: AsyncSession):
    query = select(Escenario).where(Escenario.idescenario == idescenario)
    return db.execute(query)

def create_escenario(data, db: AsyncSession):
    escenario = Escenario(
        idsalon=data.idsalon,
        nombre=data.nombre,
        descripcion=data.descripcion,
        niveldificultad=data.niveldificultad,
        tipoescenario=data.tipoescenario,
        objetivosaprendizaje=data.objetivosaprendizaje,
        instrucciones=data.instrucciones,
        tiempolimite=data.tiempolimite,
        intentospermitidos=data.intentospermitidos,
        configuracionescenario=data.configuracionescenario or {},
    )
    db.add(escenario)
    db.commit()
    db.refresh(escenario)
    return escenario

def update_escenario(idescenario: UUID, data, db: AsyncSession):
    query = select(Escenario).where(Escenario.idescenario == idescenario)
    escenario = db.execute(query).scalar_one_or_none()
    if escenario:
        for key, value in data.items():
            setattr(escenario, key, value)
        escenario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
        db.commit()
        db.refresh(escenario)
    return escenario

def delete_escenario(idescenario: UUID, db: AsyncSession):
    query = select(Escenario).where(Escenario.idescenario == idescenario)
    escenario = db.execute(query).scalar_one_or_none()
    if escenario:
        escenario.activo = False
        escenario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
        db.commit()
    return escenario

def asignar_escenario(idescenario: UUID, data, db: AsyncSession):
    query = select(Escenario).where(Escenario.idescenario == idescenario)
    escenario_original = db.execute(query).scalar_one_or_none()
    if escenario_original:
        nuevo_escenario = Escenario(
            idsalon=data.idsalon,
            nombre=escenario_original.nombre,
            descripcion=escenario_original.descripcion,
            niveldificultad=escenario_original.niveldificultad,
            tipoescenario=escenario_original.tipoescenario,
            objetivosaprendizaje=escenario_original.objetivosaprendizaje,
            instrucciones=escenario_original.instrucciones,
            tiempolimite=escenario_original.tiempolimite,
            intentospermitidos=escenario_original.intentospermitidos,
            configuracionescenario=escenario_original.configuracionescenario or {},
        )
        db.add(nuevo_escenario)
        db.commit()
        db.refresh(nuevo_escenario)
    return nuevo_escenario