from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.functions import coalesce

from app.auth import stack_auth
from app.dependencies import get_current_user, get_db
from app.models.admin import Admin
from app.models.alumno import Alumno
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.docente import Docente
from app.models.escenario import Escenario
from app.models.institucion import Institucion
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.admin import (
    AdminAlumnoActividadRow,
    AdminOverview,
    AdminRead,
    AdminSalonRow,
    AdminUsuarioRow,
)
from app.schemas.interaccion_escenario import InteraccionEscenarioRead

router = APIRouter(prefix="/admins", tags=["Admins"])


def _require_admin(current_user: Usuario) -> None:
    """Verifica que el usuario actual es admin."""
    if current_user.tipousuario != "admin" or not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta acción",
        )


@router.get("/me/overview", response_model=AdminOverview)
async def obtener_overview(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Resumen para el panel del admin: institución + conteos globales."""
    _require_admin(current_user)
    idinstitucion = current_user.idinstitucion

    institucion = (
        await db.execute(select(Institucion).where(Institucion.idinstitucion == idinstitucion))
    ).scalar_one()

    docentes_q = await db.execute(
        select(
            func.count(Usuario.idusuario),
            func.sum(case((Usuario.activo.is_(True), 1), else_=0)),
        )
        .where(Usuario.idinstitucion == idinstitucion)
        .where(Usuario.tipousuario == "docente")
    )
    total_docentes, total_docentes_activos = docentes_q.one()

    alumnos_q = await db.execute(
        select(
            func.count(Usuario.idusuario),
            func.sum(case((Usuario.activo.is_(True), 1), else_=0)),
        )
        .where(Usuario.idinstitucion == idinstitucion)
        .where(Usuario.tipousuario == "alumno")
    )
    total_alumnos, total_alumnos_activos = alumnos_q.one()

    salones_q = await db.execute(
        select(
            func.count(Salon.idsalon),
            func.sum(case((Salon.activo.is_(True), 1), else_=0)),
        ).where(Salon.idinstitucion == idinstitucion)
    )
    total_salones, total_salones_activos = salones_q.one()

    return AdminOverview(
        idinstitucion=institucion.idinstitucion,
        nombre_institucion=institucion.nombre,
        clavect=institucion.clavect,
        total_docentes=total_docentes or 0,
        total_docentes_activos=total_docentes_activos or 0,
        total_alumnos=total_alumnos or 0,
        total_alumnos_activos=total_alumnos_activos or 0,
        total_salones=total_salones or 0,
        total_salones_activos=total_salones_activos or 0,
    )


@router.get("/me/usuarios", response_model=list[AdminUsuarioRow])
async def listar_usuarios_institucion(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    tipo: str | None = None,
    activo: bool | None = None,
):
    """Lista todos los usuarios de la institución del admin.

    Filtros opcionales:
    - tipo: alumno | docente | admin
    - activo: true | false
    """
    _require_admin(current_user)

    query = (
        select(
            Usuario.idusuario,
            Usuario.authid,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
            Usuario.email,
            Usuario.tipousuario,
            Usuario.activo,
            Usuario.fecharegistro,
            Usuario.ultimoacceso,
            Alumno.matricula,
            Docente.gradoacademico,
        )
        .select_from(Usuario)
        .outerjoin(Alumno, Alumno.idusuario == Usuario.idusuario)
        .outerjoin(Docente, Docente.idusuario == Usuario.idusuario)
        .where(Usuario.idinstitucion == current_user.idinstitucion)
        .order_by(Usuario.tipousuario.asc(), Usuario.apellidopaterno.asc(), Usuario.nombre.asc())
    )

    if tipo in ("alumno", "docente", "admin"):
        query = query.where(Usuario.tipousuario == tipo)
    if activo is not None:
        query = query.where(Usuario.activo.is_(activo))

    rows = (await db.execute(query)).all()
    return [
        AdminUsuarioRow(
            idusuario=row.idusuario,
            authid=row.authid,
            nombre=row.nombre,
            apellidopaterno=row.apellidopaterno,
            apellidomaterno=row.apellidomaterno,
            email=row.email,
            tipousuario=row.tipousuario,
            activo=row.activo,
            fecharegistro=row.fecharegistro,
            ultimoacceso=row.ultimoacceso,
            matricula=row.matricula,
            gradoacademico=row.gradoacademico,
        )
        for row in rows
    ]


@router.get("/me/salones", response_model=list[AdminSalonRow])
async def listar_salones_institucion(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los salones de la institución del admin, con su docente y conteos."""
    _require_admin(current_user)

    alumnos_count = (
        select(
            AlumnoEnSalon.idsalon.label("idsalon"),
            func.count(AlumnoEnSalon.idalumno).label("total_alumnos"),
        )
        .where(AlumnoEnSalon.activo.is_(True))
        .group_by(AlumnoEnSalon.idsalon)
        .subquery()
    )
    escenarios_count = (
        select(
            Escenario.idsalon.label("idsalon"),
            func.count(Escenario.idescenario).label("total_escenarios"),
        )
        .where(Escenario.activo.is_(True))
        .group_by(Escenario.idsalon)
        .subquery()
    )

    query = (
        select(
            Salon.idsalon,
            Salon.nombresalon,
            Salon.codigoacceso,
            Salon.activo,
            Salon.fechacreacion,
            Salon.iddocente,
            Usuario.nombre.label("docente_nombre"),
            Usuario.apellidopaterno.label("docente_apellidopaterno"),
            coalesce(alumnos_count.c.total_alumnos, 0).label("total_alumnos"),
            coalesce(escenarios_count.c.total_escenarios, 0).label("total_escenarios"),
        )
        .join(Docente, Salon.iddocente == Docente.iddocente)
        .join(Usuario, Docente.idusuario == Usuario.idusuario)
        .outerjoin(alumnos_count, alumnos_count.c.idsalon == Salon.idsalon)
        .outerjoin(escenarios_count, escenarios_count.c.idsalon == Salon.idsalon)
        .where(Salon.idinstitucion == current_user.idinstitucion)
        .order_by(Salon.fechacreacion.desc())
    )

    rows = (await db.execute(query)).all()
    return [
        AdminSalonRow(
            idsalon=row.idsalon,
            nombresalon=row.nombresalon,
            codigoacceso=row.codigoacceso,
            activo=row.activo,
            fechacreacion=row.fechacreacion,
            iddocente=row.iddocente,
            docente_nombre=row.docente_nombre,
            docente_apellidopaterno=row.docente_apellidopaterno,
            total_alumnos=row.total_alumnos,
            total_escenarios=row.total_escenarios,
        )
        for row in rows
    ]


@router.get("/me/alumnos-actividad", response_model=list[AdminAlumnoActividadRow])
async def listar_actividad_alumnos(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Resumen de actividad de todos los alumnos de la institución (a través de salones)."""
    _require_admin(current_user)

    salones_activos_count = (
        select(
            AlumnoEnSalon.idalumno.label("idalumno"),
            func.count(AlumnoEnSalon.idsalon).label("total_salones"),
        )
        .join(Salon, AlumnoEnSalon.idsalon == Salon.idsalon)
        .where(AlumnoEnSalon.activo.is_(True))
        .where(Salon.idinstitucion == current_user.idinstitucion)
        .group_by(AlumnoEnSalon.idalumno)
        .subquery()
    )

    interacciones_stats = (
        select(
            InteraccionEscenario.idalumno.label("idalumno"),
            func.count(InteraccionEscenario.idinteraccion).label("total_interacciones"),
            func.sum(case((InteraccionEscenario.completado.is_(True), 1), else_=0)).label(
                "escenarios_completados"
            ),
            func.avg(InteraccionEscenario.puntuacion).label("promedio_puntuacion"),
            (coalesce(func.sum(InteraccionEscenario.tiempototal), 0) / 60.0).label(
                "tiempo_total_minutos"
            ),
        )
        .group_by(InteraccionEscenario.idalumno)
        .subquery()
    )

    query = (
        select(
            Alumno.idalumno,
            Alumno.idusuario,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
            Usuario.email,
            Alumno.matricula,
            Usuario.activo,
            Usuario.ultimoacceso,
            coalesce(salones_activos_count.c.total_salones, 0).label("total_salones"),
            coalesce(interacciones_stats.c.total_interacciones, 0).label("total_interacciones"),
            coalesce(interacciones_stats.c.escenarios_completados, 0).label("escenarios_completados"),
            interacciones_stats.c.promedio_puntuacion,
            coalesce(interacciones_stats.c.tiempo_total_minutos, 0.0).label("tiempo_total_minutos"),
        )
        .join(Usuario, Alumno.idusuario == Usuario.idusuario)
        .outerjoin(salones_activos_count, salones_activos_count.c.idalumno == Alumno.idalumno)
        .outerjoin(interacciones_stats, interacciones_stats.c.idalumno == Alumno.idalumno)
        .where(Usuario.idinstitucion == current_user.idinstitucion)
        .order_by(Usuario.apellidopaterno.asc(), Usuario.nombre.asc())
    )

    rows = (await db.execute(query)).all()
    return [
        AdminAlumnoActividadRow(
            idalumno=row.idalumno,
            idusuario=row.idusuario,
            nombre=row.nombre,
            apellidopaterno=row.apellidopaterno,
            apellidomaterno=row.apellidomaterno,
            email=row.email,
            matricula=row.matricula,
            activo=row.activo,
            ultimoacceso=row.ultimoacceso,
            total_salones=row.total_salones,
            total_interacciones=row.total_interacciones,
            escenarios_completados=row.escenarios_completados,
            promedio_puntuacion=float(row.promedio_puntuacion) if row.promedio_puntuacion is not None else None,
            tiempo_total_minutos=float(row.tiempo_total_minutos),
        )
        for row in rows
    ]


@router.get(
    "/me/alumnos/{idalumno}/interacciones",
    response_model=list[InteraccionEscenarioRead],
)
async def listar_interacciones_alumno(
    idalumno: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista las interacciones de un alumno de la institución del admin.

    Permite al admin abrir el mismo reporte de intento que ven alumnos y
    docentes, localizando el intento completado más reciente.
    """
    _require_admin(current_user)

    alumno = (
        await db.execute(
            select(Alumno)
            .join(Usuario, Alumno.idusuario == Usuario.idusuario)
            .where(
                Alumno.idalumno == idalumno,
                Usuario.idinstitucion == current_user.idinstitucion,
            )
        )
    ).scalar_one_or_none()
    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alumno no encontrado"
        )

    result = await db.execute(
        select(InteraccionEscenario)
        .where(InteraccionEscenario.idalumno == idalumno)
        .options(selectinload(InteraccionEscenario.escenario))
    )
    return result.scalars().all()


async def _load_usuario_for_admin_action(
    db: AsyncSession, current_user: Usuario, idusuario: UUID
) -> Usuario:
    """Carga un usuario y verifica que el admin actual puede actuar sobre él."""
    _require_admin(current_user)
    if current_user.idusuario == idusuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes modificar tu propio estado desde aquí",
        )
    usuario = (
        await db.execute(select(Usuario).where(Usuario.idusuario == idusuario))
    ).scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if usuario.idinstitucion != current_user.idinstitucion:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a este usuario",
        )
    return usuario


@router.patch("/me/usuarios/{idusuario}/desactivar", response_model=AdminUsuarioRow)
async def desactivar_usuario(
    idusuario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Soft delete: marca al usuario como inactivo (activo=false)."""
    usuario = await _load_usuario_for_admin_action(db, current_user, idusuario)
    usuario.activo = False
    usuario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()
    await db.refresh(usuario)
    return AdminUsuarioRow(
        idusuario=usuario.idusuario,
        authid=usuario.authid,
        nombre=usuario.nombre,
        apellidopaterno=usuario.apellidopaterno,
        apellidomaterno=usuario.apellidomaterno,
        email=usuario.email,
        tipousuario=usuario.tipousuario,
        activo=usuario.activo,
        fecharegistro=usuario.fecharegistro,
        ultimoacceso=usuario.ultimoacceso,
    )


@router.patch("/me/usuarios/{idusuario}/reactivar", response_model=AdminUsuarioRow)
async def reactivar_usuario(
    idusuario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Revierte el soft delete: marca al usuario como activo (activo=true)."""
    usuario = await _load_usuario_for_admin_action(db, current_user, idusuario)
    usuario.activo = True
    usuario.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()
    await db.refresh(usuario)
    return AdminUsuarioRow(
        idusuario=usuario.idusuario,
        authid=usuario.authid,
        nombre=usuario.nombre,
        apellidopaterno=usuario.apellidopaterno,
        apellidomaterno=usuario.apellidomaterno,
        email=usuario.email,
        tipousuario=usuario.tipousuario,
        activo=usuario.activo,
        fecharegistro=usuario.fecharegistro,
        ultimoacceso=usuario.ultimoacceso,
    )


@router.delete("/me/usuarios/{idusuario}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(
    idusuario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Eliminación permanente: borra el usuario de Stack Auth y de neon_auth.users_sync.

    El borrado en neon_auth.users_sync dispara ON DELETE CASCADE sobre usuario.
    """
    usuario = await _load_usuario_for_admin_action(db, current_user, idusuario)
    auth_id = usuario.authid
    await stack_auth.delete_stack_user(auth_id)
    await db.execute(
        text("DELETE FROM neon_auth.users_sync WHERE id = :id"),
        {"id": auth_id},
    )
    await db.commit()


@router.get("/", response_model=list[AdminRead])
async def listar_admins(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Admin))
    return result.scalars().all()


@router.get("/{idadmin}", response_model=AdminRead)
async def obtener_admin(
    idadmin: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Admin).where(Admin.idadmin == idadmin))
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin no encontrado")
    return admin
