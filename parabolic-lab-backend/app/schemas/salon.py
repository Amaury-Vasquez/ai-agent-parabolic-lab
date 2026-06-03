from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class SalonCreate(BaseModel):
    nombresalon: str = Field(..., min_length=1, max_length=100)


class SalonUpdate(BaseModel):
    """Schema para actualizar el nombre de un salón (PATCH endpoint)."""

    nombresalon: str = Field(..., min_length=1, max_length=100)


class SalonUpdateFull(BaseModel):
    """Schema para actualización completa de un salón (PUT endpoint)."""

    nombresalon: str | None = Field(None, min_length=1, max_length=100)
    activo: bool | None = None


class SalonRead(BaseModel):
    idsalon: UUID
    iddocente: UUID
    idinstitucion: UUID
    codigoacceso: str
    nombresalon: str
    fechacreacion: datetime | None = None
    fechamodificacion: datetime | None = None
    activo: bool | None = None

    model_config = {"from_attributes": True}


class EscenarioEnSalon(BaseModel):
    idescenario: UUID
    nombre: str
    idescenario_origen: UUID | None = None
    model_config = {"from_attributes": True}


class SalonWithDetails(BaseModel):
    idsalon: UUID
    nombresalon: str
    codigoacceso: str
    activo: bool | None = None
    escenarios: list[EscenarioEnSalon] = []
    num_estudiantes: int = 0


class SalonProgresoAlumno(BaseModel):
    """Estadísticas de progreso de un alumno en un salón."""

    idalumno: UUID
    nombre: str
    apellidopaterno: str
    apellidomaterno: str | None = None
    total_interacciones: int
    promedio_puntuacion: Decimal | None = None
    mejor_puntuacion: Decimal | None = None
    total_intentos: int
    escenarios_completados: int
    tiempo_total_minutos: float

    model_config = {"from_attributes": True}


class EstudianteEnSalon(BaseModel):
    """Información de un estudiante en un salón con progreso."""

    idalumno: UUID
    nombre: str
    apellidopaterno: str
    apellidomaterno: str | None = None
    email: str
    ultimo_acceso: datetime | None = None
    escenarios_completados: int
    total_escenarios: int

    model_config = {"from_attributes": True}


class AgregarEstudianteRequest(BaseModel):
    """Solicitud para agregar un estudiante a un salón."""

    correo: str = Field(..., min_length=5, max_length=100)


class AgregarEstudianteResponse(BaseModel):
    """Respuesta al agregar un estudiante a un salón."""

    mensaje: str
    idalumno: UUID
    nombre: str
    email: str


class InteraccionConEscenario(BaseModel):
    """Interacción de un alumno enriquecida con datos del escenario."""

    idinteraccion: UUID
    idescenario: UUID
    escenario_nombre: str
    escenario_dificultad: str
    fechainicio: datetime | None = None
    fechafin: datetime | None = None
    tiempototal: int | None = None
    intentosrealizados: int | None = None
    puntuacion: Decimal | None = None
    completado: bool | None = None
    datosinteraccion: dict[str, Any] | None = None


class DesempenoAlumnoEnSalon(BaseModel):
    """Detalle del desempeño de un alumno en un salón."""

    idalumno: UUID
    nombre: str
    apellidopaterno: str
    apellidomaterno: str | None = None
    email: str
    total_interacciones: int
    escenarios_completados: int
    promedio_puntuacion: Decimal | None = None
    mejor_puntuacion: Decimal | None = None
    total_intentos: int
    tiempo_total_minutos: float
    interacciones: list[InteraccionConEscenario] = []


class ResolucionAlumno(BaseModel):
    """Resolución individual de un alumno sobre un escenario."""

    idinteraccion: UUID
    idalumno: UUID
    alumno_nombre: str
    alumno_apellidopaterno: str
    alumno_apellidomaterno: str | None = None
    fechainicio: datetime | None = None
    fechafin: datetime | None = None
    tiempototal: int | None = None
    intentosrealizados: int | None = None
    puntuacion: Decimal | None = None
    completado: bool | None = None
    datosinteraccion: dict[str, Any] | None = None


class ResolucionesEscenario(BaseModel):
    """Conjunto de resoluciones de un escenario en un salón."""

    idescenario: UUID
    escenario_nombre: str
    escenario_descripcion: str | None = None
    escenario_dificultad: str
    resoluciones: list[ResolucionAlumno] = []
