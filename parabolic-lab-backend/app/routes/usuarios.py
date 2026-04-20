from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioRead, UsuarioUpdate

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me", response_model=UsuarioRead)
async def obtener_usuario_actual(
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene el perfil del usuario actual autenticado."""
    return current_user


@router.patch("/me", response_model=UsuarioRead)
async def actualizar_usuario_actual(
    usuario_update: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza el perfil del usuario actual con los campos proporcionados."""
    # Actualizar solo los campos que vengan en el body (no None)
    if usuario_update.nombre is not None:
        current_user.nombre = usuario_update.nombre
    if usuario_update.apellidopaterno is not None:
        current_user.apellidopaterno = usuario_update.apellidopaterno
    if usuario_update.apellidomaterno is not None:
        current_user.apellidomaterno = usuario_update.apellidomaterno

    current_user.fechamodificacion = datetime.now(timezone.utc)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/", response_model=list[UsuarioRead])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Usuario))
    return result.scalars().all()


@router.get("/{idusuario}", response_model=UsuarioRead)
async def obtener_usuario(
    idusuario: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Usuario).where(Usuario.idusuario == idusuario))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
