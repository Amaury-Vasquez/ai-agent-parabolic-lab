from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.escenario import Escenario
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.escenario import EscenarioUpdate


async def assert_es_dueno_del_salon(db: AsyncSession, usuario: Usuario, idsalon: UUID) -> Salon:
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise LookupError("Salon no encontrado")
    if salon.iddocente != usuario.docente.iddocente:
        raise PermissionError("No tienes permiso sobre este salon")
    return salon


async def actualizar_escenario(db: AsyncSession, escenario: Escenario, data: EscenarioUpdate) -> Escenario:
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(escenario, campo, valor)
    escenario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()
    await db.refresh(escenario)
    return escenario
