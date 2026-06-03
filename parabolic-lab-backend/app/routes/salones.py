import random
import string
from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.functions import coalesce

from app.dependencies import get_current_user, get_db
from app.models.alumno import Alumno
from app.models.alumno_en_salon import AlumnoEnSalon
from app.models.escenario import Escenario
from app.models.interaccion_escenario import InteraccionEscenario
from app.models.salon import Salon
from app.models.usuario import Usuario
from app.schemas.salon import (
    AgregarEstudianteRequest,
    AgregarEstudianteResponse,
    DesempenoAlumnoEnSalon,
    EscenarioEnSalon,
    EstudianteEnSalon,
    InteraccionConEscenario,
    ResolucionAlumno,
    ResolucionesEscenario,
    SalonCreate,
    SalonProgresoAlumno,
    SalonRead,
    SalonUpdate,
    SalonUpdateFull,
    SalonWithDetails,
)

router = APIRouter(prefix="/salones", tags=["Salones"])


def _generar_codigo(longitud: int = 6) -> str:
    """Genera un código de acceso alfanumérico en mayúsculas."""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=longitud))


def _require_docente(current_user: Usuario) -> None:
    if current_user.tipousuario != "docente" or not current_user.docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden realizar esta acción",
        )


# ── READ ──────────────────────────────────────────────────────────────────────


@router.get("/me", response_model=list[SalonWithDetails])
async def mis_salones(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Devuelve los salones del usuario actual con detalles."""
    if current_user.tipousuario == "docente":
        if not current_user.docente:
            return []
        query = (
            select(Salon)
            .where(Salon.iddocente == current_user.docente.iddocente)
            .where(Salon.activo.is_(True))
            .options(selectinload(Salon.escenarios), selectinload(Salon.alumnos))
        )
    elif current_user.tipousuario == "alumno":
        if not current_user.alumno:
            return []
        query = (
            select(Salon)
            .join(AlumnoEnSalon, AlumnoEnSalon.idsalon == Salon.idsalon)
            .where(AlumnoEnSalon.idalumno == current_user.alumno.idalumno)
            .where(AlumnoEnSalon.activo.is_(True))
            .where(Salon.activo.is_(True))
            .options(selectinload(Salon.escenarios), selectinload(Salon.alumnos))
        )
    elif current_user.tipousuario == "admin":
        query = (
            select(Salon)
            .where(Salon.idinstitucion == current_user.idinstitucion)
            .where(Salon.activo.is_(True))
            .options(selectinload(Salon.escenarios), selectinload(Salon.alumnos))
        )
    else:
        return []

    result = await db.execute(query)
    salones = result.scalars().unique().all()
    return [
        SalonWithDetails(
            idsalon=s.idsalon,
            idinstitucion=s.idinstitucion,
            nombresalon=s.nombresalon,
            codigoacceso=s.codigoacceso,
            activo=s.activo,
            escenarios=[
                EscenarioEnSalon(
                    idescenario=e.idescenario,
                    nombre=e.nombre,
                    idescenario_origen=e.idescenario_origen,
                )
                for e in s.escenarios
                if e.activo
            ],
            num_estudiantes=sum(1 for a in s.alumnos if a.activo),
        )
        for s in salones
    ]


@router.get("/", response_model=list[SalonRead])
async def listar_salones(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Salon))
    return result.scalars().all()


@router.get("/{idsalon}", response_model=SalonRead)
async def obtener_salon(
    idsalon: UUID,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    return salon


# ── WRITE ─────────────────────────────────────────────────────────────────────


@router.post("/", response_model=SalonRead, status_code=status.HTTP_201_CREATED)
async def crear_salon(
    data: SalonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea un nuevo salón. Solo docentes."""
    _require_docente(current_user)

    # Generar código único dentro de la institución
    for _ in range(10):
        codigo = _generar_codigo()
        existe = await db.execute(
            select(Salon).where(
                Salon.codigoacceso == codigo,
                Salon.idinstitucion == current_user.idinstitucion,
            )
        )
        if not existe.scalar_one_or_none():
            break

    salon = Salon(
        iddocente=current_user.docente.iddocente,
        idinstitucion=current_user.idinstitucion,
        codigoacceso=codigo,
        nombresalon=data.nombresalon,
    )
    db.add(salon)
    await db.commit()
    await db.refresh(salon)
    return salon


@router.put("/{idsalon}", response_model=SalonRead)
async def actualizar_salon(
    idsalon: UUID,
    data: SalonUpdateFull,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Edita un salón. Solo el docente dueño."""
    _require_docente(current_user)

    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este salon")

    if data.nombresalon is not None:
        salon.nombresalon = data.nombresalon
    if data.activo is not None:
        salon.activo = data.activo
    salon.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()
    await db.refresh(salon)
    return salon


@router.patch("/{idsalon}", response_model=SalonRead)
async def actualizar_nombre_salon(
    idsalon: UUID,
    data: SalonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza solo el nombre de un salón via PATCH. Solo el docente dueño."""
    _require_docente(current_user)

    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este salon")

    salon.nombresalon = data.nombresalon
    salon.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)

    await db.commit()
    await db.refresh(salon)
    return salon


@router.delete("/{idsalon}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_salon(
    idsalon: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Desactiva un salón (soft delete). Solo el docente dueño."""
    _require_docente(current_user)

    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este salon")

    salon.activo = False
    salon.fechamodificacion = datetime.now(UTC).replace(tzinfo=None)
    await db.commit()


@router.get("/{idsalon}/progreso", response_model=list[SalonProgresoAlumno])
async def obtener_progreso_salon(
    idsalon: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Obtiene el progreso de todos los alumnos en un salón.
    Solo el docente dueño del salón puede acceder.
    Retorna estadísticas agregadas de interacciones para cada alumno.
    """
    _require_docente(current_user)

    # Verificar que el salon existe y que el usuario es el dueño
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver el progreso de este salon")

    # Subquery: escenarios activos de este salón. Sin este filtro en el JOIN,
    # las agregaciones sumarían interacciones del alumno en OTROS salones.
    escenarios_salon_subq = (
        select(Escenario.idescenario)
        .where(Escenario.idsalon == idsalon)
        .where(Escenario.activo.is_(True))
        .scalar_subquery()
    )

    # Query para obtener estadísticas de alumnos con outer join para incluir
    # alumnos sin interacciones. Las métricas se restringen estrictamente a
    # interacciones cuyos escenarios pertenecen a este salón.
    query = (
        select(
            Alumno.idalumno,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
            coalesce(func.count(InteraccionEscenario.idinteraccion), 0).label("total_interacciones"),
            func.avg(InteraccionEscenario.puntuacion).label("promedio_puntuacion"),
            func.max(InteraccionEscenario.puntuacion).label("mejor_puntuacion"),
            coalesce(func.sum(InteraccionEscenario.intentosrealizados), 0).label("total_intentos"),
            coalesce(
                func.count(
                    func.distinct(
                        case(
                            (
                                InteraccionEscenario.completado.is_(True),
                                InteraccionEscenario.idescenario,
                            ),
                            else_=None,
                        )
                    )
                ),
                0,
            ).label("escenarios_completados"),
            coalesce(func.sum(InteraccionEscenario.tiempototal) / 60.0, 0.0).label("tiempo_total_minutos"),
        )
        .join(AlumnoEnSalon, Alumno.idalumno == AlumnoEnSalon.idalumno)
        .join(Usuario, Alumno.idusuario == Usuario.idusuario)
        .outerjoin(
            InteraccionEscenario,
            and_(
                Alumno.idalumno == InteraccionEscenario.idalumno,
                InteraccionEscenario.idescenario.in_(escenarios_salon_subq),
            ),
        )
        .where(AlumnoEnSalon.idsalon == idsalon)
        .where(AlumnoEnSalon.activo.is_(True))
        .group_by(
            Alumno.idalumno,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
        )
        .order_by(Usuario.nombre, Usuario.apellidopaterno)
    )

    result = await db.execute(query)
    rows = result.all()

    # Convertir rows a SalonProgresoAlumno objects
    return [
        SalonProgresoAlumno(
            idalumno=row.idalumno,
            nombre=row.nombre,
            apellidopaterno=row.apellidopaterno,
            apellidomaterno=row.apellidomaterno,
            total_interacciones=row.total_interacciones,
            promedio_puntuacion=row.promedio_puntuacion,
            mejor_puntuacion=row.mejor_puntuacion,
            total_intentos=row.total_intentos,
            escenarios_completados=row.escenarios_completados,
            tiempo_total_minutos=float(row.tiempo_total_minutos),
        )
        for row in rows
    ]


# ── GESTIÓN DE ESTUDIANTES ────────────────────────────────────────────────────


@router.get("/{idsalon}/estudiantes", response_model=list[EstudianteEnSalon])
async def listar_estudiantes_salon(
    idsalon: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Obtiene la lista de estudiantes en un salón con su información de progreso.
    Solo el docente dueño del salón puede acceder.
    """
    _require_docente(current_user)

    # Verificar que el salon existe y que el usuario es el dueño
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los estudiantes de este salon")

    # Obtener el total de escenarios activos en el salón
    total_escenarios_result = await db.execute(
        select(func.count(Escenario.idescenario)).where(
            Escenario.idsalon == idsalon,
            Escenario.activo.is_(True),
        )
    )
    total_escenarios = total_escenarios_result.scalar() or 0

    # Subquery: escenarios activos del salón (para limitar el conteo de
    # interacciones a las que pertenecen a este salón).
    escenarios_salon_subq = (
        select(Escenario.idescenario)
        .where(Escenario.idsalon == idsalon)
        .where(Escenario.activo.is_(True))
        .scalar_subquery()
    )

    # Query para obtener estudiantes con información de progreso.
    # Cuenta escenarios únicos completados (DISTINCT idescenario) para que
    # múltiples intentos sobre el mismo escenario no inflen el progreso.
    query = (
        select(
            Alumno.idalumno,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
            Usuario.email,
            Usuario.ultimoacceso,
            coalesce(
                func.count(
                    func.distinct(
                        case(
                            (
                                InteraccionEscenario.completado.is_(True),
                                InteraccionEscenario.idescenario,
                            ),
                            else_=None,
                        )
                    )
                ),
                0,
            ).label("escenarios_completados"),
        )
        .join(AlumnoEnSalon, Alumno.idalumno == AlumnoEnSalon.idalumno)
        .join(Usuario, Alumno.idusuario == Usuario.idusuario)
        .outerjoin(
            InteraccionEscenario,
            and_(
                Alumno.idalumno == InteraccionEscenario.idalumno,
                InteraccionEscenario.idescenario.in_(escenarios_salon_subq),
            ),
        )
        .where(AlumnoEnSalon.idsalon == idsalon)
        .where(AlumnoEnSalon.activo.is_(True))
        .group_by(
            Alumno.idalumno,
            Usuario.nombre,
            Usuario.apellidopaterno,
            Usuario.apellidomaterno,
            Usuario.email,
            Usuario.ultimoacceso,
        )
        .order_by(Usuario.nombre, Usuario.apellidopaterno)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        EstudianteEnSalon(
            idalumno=row.idalumno,
            nombre=row.nombre,
            apellidopaterno=row.apellidopaterno,
            apellidomaterno=row.apellidomaterno,
            email=row.email,
            ultimo_acceso=row.ultimoacceso,
            escenarios_completados=row.escenarios_completados,
            total_escenarios=total_escenarios,
        )
        for row in rows
    ]


@router.post("/{idsalon}/agregar-estudiante", response_model=AgregarEstudianteResponse, status_code=status.HTTP_201_CREATED)
async def agregar_estudiante_salon(
    idsalon: UUID,
    data: AgregarEstudianteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Agrega un estudiante a un salón por su email.
    Solo el docente dueño del salón puede realizar esta acción.
    Retorna la información del alumno agregado.
    """
    _require_docente(current_user)

    # Verificar que el salon existe y que el usuario es el dueño
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para agregar estudiantes a este salon")

    # Buscar al usuario por email
    result = await db.execute(select(Usuario).where(Usuario.email == data.correo))
    usuario = result.scalar_one_or_none()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado con ese email")

    # Verificar que el usuario es alumno por tipo
    if usuario.tipousuario != "alumno":
        raise HTTPException(status_code=422, detail="El usuario no es un alumno valido")

    # Cargar el alumno explícitamente (evita lazy load en async)
    alumno_result = await db.execute(
        select(Alumno).where(Alumno.idusuario == usuario.idusuario)
    )
    alumno = alumno_result.scalar_one_or_none()
    if not alumno:
        raise HTTPException(status_code=422, detail="El usuario no tiene registro de alumno")

    # Verificar que el alumno no esté ya en el salón
    result = await db.execute(
        select(AlumnoEnSalon).where(
            AlumnoEnSalon.idalumno == alumno.idalumno,
            AlumnoEnSalon.idsalon == idsalon,
        )
    )
    alumno_en_salon = result.scalar_one_or_none()
    if alumno_en_salon:
        if alumno_en_salon.activo:
            raise HTTPException(
                status_code=409,
                detail="El estudiante ya está inscrito en este salon",
            )
        else:
            # Reactivar si estaba inactivo
            alumno_en_salon.activo = True
            await db.commit()
            await db.refresh(alumno_en_salon)
            return AgregarEstudianteResponse(
                mensaje="Estudiante reactivado en el salon",
                idalumno=alumno.idalumno,
                nombre=usuario.nombre,
                email=usuario.email,
            )

    # Crear la relación alumno-salon
    nuevo_alumno_en_salon = AlumnoEnSalon(
        idalumno=alumno.idalumno,
        idsalon=idsalon,
    )
    db.add(nuevo_alumno_en_salon)
    await db.commit()
    await db.refresh(nuevo_alumno_en_salon)

    return AgregarEstudianteResponse(
        mensaje="Estudiante agregado al salon correctamente",
        idalumno=alumno.idalumno,
        nombre=usuario.nombre,
        email=usuario.email,
    )


@router.delete("/{idsalon}/estudiantes/{idalumno}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_estudiante_salon(
    idsalon: UUID,
    idalumno: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Elimina (desactiva) un estudiante de un salón.
    Solo el docente dueño del salón puede realizar esta acción.
    """
    _require_docente(current_user)

    # Verificar que el salon existe y que el usuario es el dueño
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar estudiantes de este salon")

    # Buscar la relación alumno-salon
    result = await db.execute(
        select(AlumnoEnSalon).where(
            AlumnoEnSalon.idalumno == idalumno,
            AlumnoEnSalon.idsalon == idsalon,
        )
    )
    alumno_en_salon = result.scalar_one_or_none()
    if not alumno_en_salon:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado en este salon")

    # Soft delete: desactivar la relación
    alumno_en_salon.activo = False
    await db.commit()


# ── DESEMPEÑO / RESOLUCIONES ──────────────────────────────────────────────────


async def _verificar_salon_docente(
    db: AsyncSession, idsalon: UUID, current_user: Usuario
) -> Salon:
    _require_docente(current_user)
    result = await db.execute(select(Salon).where(Salon.idsalon == idsalon))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon no encontrado")
    if salon.iddocente != current_user.docente.iddocente:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este salon")
    return salon


@router.get(
    "/{idsalon}/alumnos/{idalumno}/desempeno",
    response_model=DesempenoAlumnoEnSalon,
)
async def obtener_desempeno_alumno(
    idsalon: UUID,
    idalumno: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Detalle de desempeño de un alumno en los escenarios de un salón.
    Solo el docente dueño del salón puede acceder.
    """
    await _verificar_salon_docente(db, idsalon, current_user)

    # Verificar que el alumno está en el salón
    rel_result = await db.execute(
        select(AlumnoEnSalon)
        .where(AlumnoEnSalon.idalumno == idalumno)
        .where(AlumnoEnSalon.idsalon == idsalon)
        .where(AlumnoEnSalon.activo.is_(True))
    )
    if rel_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=404, detail="Alumno no encontrado en este salon"
        )

    alumno_result = await db.execute(
        select(Alumno, Usuario)
        .join(Usuario, Alumno.idusuario == Usuario.idusuario)
        .where(Alumno.idalumno == idalumno)
    )
    row = alumno_result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    _alumno, usuario = row

    # Total de escenarios activos asignados al salón — denominador del progreso.
    total_escenarios_result = await db.execute(
        select(func.count(Escenario.idescenario)).where(
            Escenario.idsalon == idsalon,
            Escenario.activo.is_(True),
        )
    )
    total_escenarios_salon = int(total_escenarios_result.scalar() or 0)

    # Interacciones del alumno en escenarios activos de este salón.
    # Orden DESC por fechainicio para que, al agrupar, el primer registro de
    # cada escenario sea el intento más reciente.
    interacciones_result = await db.execute(
        select(InteraccionEscenario, Escenario)
        .join(Escenario, InteraccionEscenario.idescenario == Escenario.idescenario)
        .where(InteraccionEscenario.idalumno == idalumno)
        .where(Escenario.idsalon == idsalon)
        .where(Escenario.activo.is_(True))
        .order_by(InteraccionEscenario.fechainicio.desc())
    )
    rows = interacciones_result.all()

    # Agrupar por escenario: una sola fila por escenario, con la mejor
    # puntuación y la suma de tiempos / intentos de todos los intentos.
    grupos: dict[UUID, dict] = {}
    intentos_total_global = 0
    tiempo_total_segundos = 0

    for interaccion, escenario in rows:
        punt = (
            float(interaccion.puntuacion)
            if interaccion.puntuacion is not None
            else None
        )
        tiempo = interaccion.tiempototal or 0
        intentos = interaccion.intentosrealizados or 0
        completado = bool(interaccion.completado)

        intentos_total_global += intentos
        tiempo_total_segundos += tiempo

        grupo = grupos.get(interaccion.idescenario)
        if grupo is None:
            # Primer registro = más reciente (rows vienen DESC por fechainicio).
            grupos[interaccion.idescenario] = {
                "escenario": escenario,
                "mejor_interaccion": interaccion,
                "mejor_puntuacion": punt,
                "tiempo_sum": tiempo,
                "intentos_sum": intentos,
                "completado": completado,
                "fechainicio_first": interaccion.fechainicio,
                "fechafin_last": interaccion.fechafin,
            }
            continue

        grupo["tiempo_sum"] += tiempo
        grupo["intentos_sum"] += intentos
        grupo["completado"] = grupo["completado"] or completado

        # Conservar la interacción con la mejor puntuación como representante.
        if punt is not None and (
            grupo["mejor_puntuacion"] is None or punt > grupo["mejor_puntuacion"]
        ):
            grupo["mejor_interaccion"] = interaccion
            grupo["mejor_puntuacion"] = punt

        # Rango de fechas del escenario: inicio más temprano, fin más reciente.
        if interaccion.fechainicio is not None and (
            grupo["fechainicio_first"] is None
            or interaccion.fechainicio < grupo["fechainicio_first"]
        ):
            grupo["fechainicio_first"] = interaccion.fechainicio
        if interaccion.fechafin is not None and (
            grupo["fechafin_last"] is None
            or interaccion.fechafin > grupo["fechafin_last"]
        ):
            grupo["fechafin_last"] = interaccion.fechafin

    interacciones_payload: list[InteraccionConEscenario] = []
    mejores_por_escenario: list[float] = []
    completados = 0

    for grupo in grupos.values():
        escenario = grupo["escenario"]
        mejor_interaccion: InteraccionEscenario = grupo["mejor_interaccion"]
        mejor_puntuacion: float | None = grupo["mejor_puntuacion"]
        if grupo["completado"]:
            completados += 1
        if mejor_puntuacion is not None:
            mejores_por_escenario.append(mejor_puntuacion)

        interacciones_payload.append(
            InteraccionConEscenario(
                idinteraccion=mejor_interaccion.idinteraccion,
                idescenario=escenario.idescenario,
                escenario_nombre=escenario.nombre,
                escenario_dificultad=escenario.niveldificultad,
                fechainicio=grupo["fechainicio_first"],
                fechafin=grupo["fechafin_last"],
                tiempototal=grupo["tiempo_sum"],
                intentosrealizados=grupo["intentos_sum"],
                puntuacion=(
                    Decimal(str(mejor_puntuacion))
                    if mejor_puntuacion is not None
                    else None
                ),
                completado=grupo["completado"],
                datosinteraccion=mejor_interaccion.datosinteraccion,
            )
        )

    promedio = (
        Decimal(str(sum(mejores_por_escenario) / len(mejores_por_escenario)))
        if mejores_por_escenario
        else None
    )
    mejor = (
        Decimal(str(max(mejores_por_escenario)))
        if mejores_por_escenario
        else None
    )
    tiempo_min = tiempo_total_segundos / 60.0 if tiempo_total_segundos else 0.0

    return DesempenoAlumnoEnSalon(
        idalumno=idalumno,
        nombre=usuario.nombre,
        apellidopaterno=usuario.apellidopaterno,
        apellidomaterno=usuario.apellidomaterno,
        email=usuario.email,
        # Denominador del progreso: escenarios únicos asignados al salón.
        total_interacciones=total_escenarios_salon,
        escenarios_completados=completados,
        promedio_puntuacion=promedio,
        mejor_puntuacion=mejor,
        total_intentos=intentos_total_global,
        tiempo_total_minutos=tiempo_min,
        interacciones=interacciones_payload,
    )


@router.get(
    "/{idsalon}/escenarios/{idescenario}/resoluciones",
    response_model=ResolucionesEscenario,
)
async def obtener_resoluciones_escenario(
    idsalon: UUID,
    idescenario: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Lista de resoluciones (interacciones) de los alumnos sobre un escenario.
    Solo el docente dueño del salón puede acceder.
    """
    await _verificar_salon_docente(db, idsalon, current_user)

    escenario_result = await db.execute(
        select(Escenario)
        .where(Escenario.idescenario == idescenario)
        .where(Escenario.idsalon == idsalon)
    )
    escenario = escenario_result.scalar_one_or_none()
    if escenario is None:
        raise HTTPException(
            status_code=404, detail="Escenario no encontrado en este salon"
        )

    interacciones_result = await db.execute(
        select(InteraccionEscenario, Usuario)
        .join(Alumno, InteraccionEscenario.idalumno == Alumno.idalumno)
        .join(Usuario, Alumno.idusuario == Usuario.idusuario)
        .where(InteraccionEscenario.idescenario == idescenario)
        .order_by(InteraccionEscenario.fechainicio.desc())
    )
    rows = interacciones_result.all()

    resoluciones = [
        ResolucionAlumno(
            idinteraccion=interaccion.idinteraccion,
            idalumno=interaccion.idalumno,
            alumno_nombre=usuario.nombre,
            alumno_apellidopaterno=usuario.apellidopaterno,
            alumno_apellidomaterno=usuario.apellidomaterno,
            fechainicio=interaccion.fechainicio,
            fechafin=interaccion.fechafin,
            tiempototal=interaccion.tiempototal,
            intentosrealizados=interaccion.intentosrealizados,
            puntuacion=interaccion.puntuacion,
            completado=interaccion.completado,
            datosinteraccion=interaccion.datosinteraccion,
        )
        for interaccion, usuario in rows
    ]

    return ResolucionesEscenario(
        idescenario=escenario.idescenario,
        escenario_nombre=escenario.nombre,
        escenario_descripcion=escenario.descripcion,
        escenario_dificultad=escenario.niveldificultad,
        resoluciones=resoluciones,
    )
