from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AdminRead(BaseModel):
    idadmin: UUID
    idusuario: UUID

    model_config = {"from_attributes": True}


class AdminOverview(BaseModel):
    idinstitucion: UUID
    nombre_institucion: str
    clavect: str | None = None
    total_docentes: int
    total_docentes_activos: int
    total_alumnos: int
    total_alumnos_activos: int
    total_salones: int
    total_salones_activos: int


class AdminUsuarioRow(BaseModel):
    idusuario: UUID
    authid: str
    nombre: str
    apellidopaterno: str
    apellidomaterno: str | None = None
    email: str
    tipousuario: str
    activo: bool | None = None
    fecharegistro: datetime | None = None
    ultimoacceso: datetime | None = None
    matricula: str | None = None
    gradoacademico: str | None = None


class AdminSalonRow(BaseModel):
    idsalon: UUID
    nombresalon: str
    codigoacceso: str
    activo: bool | None = None
    fechacreacion: datetime | None = None
    iddocente: UUID
    docente_nombre: str
    docente_apellidopaterno: str
    total_alumnos: int
    total_escenarios: int


class AdminAlumnoActividadRow(BaseModel):
    idalumno: UUID
    idusuario: UUID
    nombre: str
    apellidopaterno: str
    apellidomaterno: str | None = None
    email: str
    matricula: str
    activo: bool | None = None
    ultimoacceso: datetime | None = None
    total_salones: int
    total_interacciones: int
    escenarios_completados: int
    promedio_puntuacion: float | None = None
    tiempo_total_minutos: float
