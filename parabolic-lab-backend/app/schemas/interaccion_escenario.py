from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class DisparoReporte(BaseModel):
    n: int
    angulo: float | None = None
    velocidad: float | None = None
    altura_canon: float | None = None
    distancia: float | None = None
    acierto: bool = False
    puntos: int = 0


class AnalisisReporte(BaseModel):
    angulo_alumno: float | None = None
    angulo_correcto: float | None = None
    velocidad_alumno: float | None = None
    velocidad_correcta: float | None = None
    alcance_alumno: float | None = None
    alcance_correcto: float | None = None
    altura_maxima_alumno: float | None = None
    tiempo_vuelo_alumno: float | None = None
    procedimiento: str | None = None
    notas: str | None = None


class IntentoComparativo(BaseModel):
    idinteraccion: UUID
    fechainicio: datetime | None = None
    puntuacion: float | None = None
    intentosrealizados: int | None = None
    completado: bool | None = None


class ReporteInteraccionRead(BaseModel):
    idinteraccion: UUID
    idescenario: UUID
    nombre_escenario: str
    descripcion: str | None = None
    niveldificultad: str
    fechainicio: datetime | None = None
    fechafin: datetime | None = None
    tiempototal: int | None = None
    intentosrealizados: int | None = None
    puntuacion: float | None = None
    disparos: list[DisparoReporte]
    analisis: AnalisisReporte
    comparativa: list[IntentoComparativo]


class InteraccionEscenarioRead(BaseModel):
    idinteraccion: UUID
    idescenario: UUID
    idalumno: UUID
    fechainicio: datetime | None = None
    fechamodificacion: datetime | None = None
    fechafin: datetime | None = None
    tiempototal: int | None = None
    intentosrealizados: int | None = None
    puntuacion: Decimal | None = None
    completado: bool | None = None
    datosinteraccion: dict[str, Any] | None = None
    escenario_nombre: str | None = None

    model_config = {"from_attributes": True}


class ProgresoAlumnoRead(BaseModel):
    total_escenarios: int
    escenarios_completados: int
    puntuacion_promedio: float | None
    mejor_puntuacion: float | None
    tiempo_total_minutos: float
    interacciones: list[InteraccionEscenarioRead]


class InteraccionEscenarioCreate(BaseModel):
    idescenario: UUID
    idalumno: UUID | None = None


class InteraccionEscenarioUpdate(BaseModel):
    fechafin: datetime | None = None
    tiempototal: int | None = None
    puntuacion: Decimal | None = None
    completado: bool | None = None
    datosinteraccion: dict[str, Any] | None = None
