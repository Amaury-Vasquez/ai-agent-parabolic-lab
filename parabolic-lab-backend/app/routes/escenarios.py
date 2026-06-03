from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.escenario import Escenario
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.escenario import AsignarEscenarioRequest, EscenarioCreate, EscenarioRead, EscenarioUpdate

router = APIRouter(prefix="/escenarios", tags=["Escenarios"])


def _require_docente(current_user: Usuario) -> None:
    if current_user.tipousuario != "docente" or not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden realizar esta acción",
        )


async def _verificar_salon_del_docente(idsalon: UUID, docente_id: UUID, db: AsyncSession) -> Salon:
    """Verifica que el salón existe y pertenece al docente."""
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != docente_id:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este salon")
    return salon


async def _verificar_escenario_del_docente(escenario: Escenario, docente_id: UUID, db: AsyncSession) -> None:
    """Verifica que el escenario pertenece al docente.

    La propiedad se resuelve por iddocente; para escenarios previos a esa
    columna se cae al salón al que están asignados.
    """
    if escenario.iddocente is not None:
        if escenario.iddocente != docente_id:
            raise HTTPException(status_code=403, detail="No tienes permiso sobre este escenario")
        return
    if escenario.idsalon is not None:
        await _verificar_salon_del_docente(escenario.idsalon, docente_id, db)
        return
    raise HTTPException(status_code=403, detail="No tienes permiso sobre este escenario")


# ── READ ──────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=list[EscenarioRead])
async def mis_escenarios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Devuelve los escenarios visibles para el usuario actual.

    - Docente: escenarios originales de su biblioteca (no copias)
    - Alumno: escenarios de los salones donde está inscrito
    """
    if current_user.tipousuario == "docente":
        if not current_user.docente:
            return []
        query = (
            select(Escenario)
            .where(Escenario.iddocente == current_user.docente.iddocente)
            .where(Escenario.activo.is_(True))
            .where(Escenario.idescenario_origen.is_(None))
            .order_by(Escenario.fechacreacion.desc())
        )
    elif current_user.tipousuario == "alumno":
        if not current_user.alumno:
            return []
        query = (
            select(Escenario)
            .join(Salon, Salon.idsalon == Escenario.idsalon)
            .join(AlumnoEnSalon, AlumnoEnSalon.idsalon == Salon.idsalon)
            .where(AlumnoEnSalon.idalumno == current_user.alumno.idalumno)
            .where(AlumnoEnSalon.activo.is_(True))
            .where(Salon.activo.is_(True))
            .where(Escenario.activo.is_(True))
            .order_by(Escenario.fechacreacion.desc())
        )
    else:
        return []

    result = await db.execute(query)
    return result.scalars().unique().all()


@router.get("/", response_model=list[EscenarioRead])
async def listar_escenarios(
    idsalon: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    query = select(Escenario)
    if idsalon:
        query = query.where(Escenario.idsalon == idsalon).where(Escenario.activo.is_(True))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{idescenario}", response_model=EscenarioRead)
async def obtener_escenario(
    idescenario: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Escenario).where(Escenario.idescenario == idescenario))
    escenario = result.scalar_one_or_none()
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")
    return escenario


# ── WRITE ─────────────────────────────────────────────────────────────────────


@router.post("/", response_model=EscenarioRead, status_code=status.HTTP_201_CREATED)
async def crear_escenario(
    data: EscenarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea un escenario en la biblioteca del docente (sin asignar a un salón)."""
    _require_docente(current_user)

    escenario = Escenario(
        iddocente=current_user.docente.iddocente,
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
    await db.commit()
    await db.refresh(escenario)
    return escenario


@router.post(
    "/{idescenario}/asignar",
    response_model=list[EscenarioRead],
    status_code=status.HTTP_201_CREATED,
)
async def asignar_escenario(
    idescenario: UUID,
    data: AsignarEscenarioRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Asigna un escenario a uno o varios salones creando una copia por salón.

    Solo el docente dueño del escenario y de los salones. Los salones donde
    el escenario ya está asignado se omiten; si no queda ninguno por asignar
    se responde 409.
    """
    _require_docente(current_user)

    # Obtener el escenario original
    result = await db.execute(select(Escenario).where(Escenario.idescenario == idescenario))
    escenario_original = result.scalar_one_or_none()
    if not escenario_original:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    # Verificar que el docente es dueño del escenario
    await _verificar_escenario_del_docente(escenario_original, current_user.docente.iddocente, db)

    # Determinar el escenario raíz (si el original ya es una copia, usar su origen)
    idorigen_raiz = escenario_original.idescenario_origen or idescenario

    # Salones (activos) que ya tienen una copia del mismo origen o el propio raíz
    ya_asignados_result = await db.execute(
        select(Escenario.idsalon)
        .where(Escenario.idsalon.is_not(None))
        .where(Escenario.activo.is_(True))
        .where(
            (Escenario.idescenario_origen == idorigen_raiz)
            | (Escenario.idescenario == idorigen_raiz)
        )
    )
    salones_ya_asignados = set(ya_asignados_result.scalars().all())

    nuevos_escenarios: list[Escenario] = []
    for idsalon in dict.fromkeys(data.idsalones):
        # Verificar que el docente es dueño del salón destino
        await _verificar_salon_del_docente(idsalon, current_user.docente.iddocente, db)

        if idsalon in salones_ya_asignados:
            continue

        # Crear una copia ligada al original
        nuevos_escenarios.append(
            Escenario(
                idsalon=idsalon,
                iddocente=current_user.docente.iddocente,
                idescenario_origen=idorigen_raiz,
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
        )

    if not nuevos_escenarios:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este escenario ya está asignado a los salones seleccionados",
        )

    db.add_all(nuevos_escenarios)
    await db.commit()
    for nuevo in nuevos_escenarios:
        await db.refresh(nuevo)
    return nuevos_escenarios


async def _actualizar_escenario_impl(
    idescenario: UUID,
    data: EscenarioUpdate,
    db: AsyncSession,
    current_user: Usuario,
):
    """Implementación compartida de actualización para PUT y PATCH."""
    _require_docente(current_user)

    result = await db.execute(select(Escenario).where(Escenario.idescenario == idescenario))
    escenario = result.scalar_one_or_none()
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    await _verificar_escenario_del_docente(escenario, current_user.docente.iddocente, db)

    campos = data.model_dump(exclude_unset=True)
    for campo, valor in campos.items():
        setattr(escenario, campo, valor)
    escenario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()
    await db.refresh(escenario)
    return escenario


@router.put("/{idescenario}", response_model=EscenarioRead)
async def actualizar_escenario_put(
    idescenario: UUID,
    data: EscenarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Edita un escenario (PUT). Solo el docente dueño del salón al que pertenece."""
    return await _actualizar_escenario_impl(idescenario, data, db, current_user)


@router.patch("/{idescenario}", response_model=EscenarioRead)
async def actualizar_escenario_patch(
    idescenario: UUID,
    data: EscenarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Edita un escenario (PATCH). Solo el docente dueño del salón al que pertenece."""
    return await _actualizar_escenario_impl(idescenario, data, db, current_user)


@router.delete("/{idescenario}/asignacion", status_code=status.HTTP_204_NO_CONTENT)
async def desasignar_escenario(
    idescenario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Quita un escenario de su salón sin borrarlo de la biblioteca.

    - Copia asignada a un salón: se desactiva (solo existe para ese salón).
    - Original asignado a un salón (datos previos): se regresa a la biblioteca.
    """
    _require_docente(current_user)

    result = await db.execute(select(Escenario).where(Escenario.idescenario == idescenario))
    escenario = result.scalar_one_or_none()
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    await _verificar_escenario_del_docente(escenario, current_user.docente.iddocente, db)

    if escenario.idsalon is None:
        raise HTTPException(status_code=400, detail="El escenario no está asignado a un salón")

    if escenario.idescenario_origen is not None:
        escenario.activo = False
    else:
        escenario.idsalon = None
    escenario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()


@router.delete("/{idescenario}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_escenario(
    idescenario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Desactiva un escenario (soft delete). Solo el docente dueño.

    Si es un original de la biblioteca, también desactiva las copias
    asignadas a salones.
    """
    _require_docente(current_user)

    result = await db.execute(select(Escenario).where(Escenario.idescenario == idescenario))
    escenario = result.scalar_one_or_none()
    if not escenario:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    await _verificar_escenario_del_docente(escenario, current_user.docente.iddocente, db)

    ahora = datetime.now(UTC).replace(tzinfo=None)
    escenario.activo = False
    escenario.fechamodificacion = ahora

    if escenario.idescenario_origen is None:
        copias_result = await db.execute(
            select(Escenario)
            .where(Escenario.idescenario_origen == idescenario)
            .where(Escenario.activo.is_(True))
        )
        for copia in copias_result.scalars().all():
            copia.activo = False
            copia.fechamodificacion = ahora

    await db.commit()
