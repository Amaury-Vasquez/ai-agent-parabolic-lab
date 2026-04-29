from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.institucion import Institucion
from app.models.usuario import Usuario
from app.schemas.institucion import InstitucionRead, InstitucionUpdate

router = APIRouter(prefix="/instituciones", tags=["Instituciones"])


@router.get("/", response_model=list[InstitucionRead])
async def listar_instituciones(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Institucion))
    return result.scalars().all()


@router.get("/{idinstitucion}", response_model=InstitucionRead)
async def obtener_institucion(
    idinstitucion: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Institucion).where(Institucion.idinstitucion == idinstitucion))
    institucion = result.scalar_one_or_none()
    if not institucion:
        raise HTTPException(status_code=404, detail="Institucion no encontrada")
    return institucion


@router.patch("/{idinstitucion}", response_model=InstitucionRead)
async def actualizar_institucion(
    idinstitucion: UUID,
    institucion_update: InstitucionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza los datos de una institución.
    Solo es accesible si el usuario actual es admin y pertenece a esa institución.
    """
    # Verificar que el usuario es admin
    if current_user.tipousuario != "admin" or not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden actualizar instituciones",
        )

    # Verificar que el admin pertenece a esa institución
    if current_user.idinstitucion != idinstitucion:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a esta institución",
        )

    result = await db.execute(select(Institucion).where(Institucion.idinstitucion == idinstitucion))
    institucion = result.scalar_one_or_none()
    if not institucion:
        raise HTTPException(status_code=404, detail="Institucion no encontrada")

    # Actualizar solo los campos que vengan en el body (no None)
    if institucion_update.nombre is not None:
        institucion.nombre = institucion_update.nombre
    if institucion_update.direccion is not None:
        institucion.direccion = institucion_update.direccion
    if institucion_update.telefono is not None:
        institucion.telefono = institucion_update.telefono

    institucion.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)

    db.add(institucion)
    await db.commit()
    await db.refresh(institucion)
    return institucion
