import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Escenario(Base):
    __tablename__ = "escenario"
    __table_args__ = (
        CheckConstraint(
            "niveldificultad IN ('principiante', 'intermedio', 'avanzado', 'experto')",
            name="escenario_niveldificultad_check",
        ),
        CheckConstraint(
            "tipoescenario IN ("
            "'simulacion', 'caso_estudio', 'problema', 'proyecto', "
            "'laboratorio', 'juego', 'debate', 'investigacion')",
            name="escenario_tipoescenario_check",
        ),
        CheckConstraint("tiempolimite > 0", name="escenario_tiempolimite_check"),
        CheckConstraint("intentospermitidos > 0", name="escenario_intentospermitidos_check"),
        Index("idx_escenario_salon", "idsalon"),
        Index("idx_escenario_docente", "iddocente"),
        Index("idx_escenario_tipo", "tipoescenario"),
        Index("idx_escenario_nivel", "niveldificultad"),
        Index("idx_escenario_activo", "activo"),
        Index("idx_escenario_configuracion", "configuracionescenario", postgresql_using="gin"),
    )

    idescenario: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid()
    )
    # NULL = escenario de biblioteca (sin asignar a un salón). Las copias
    # asignadas a salones siempre tienen idsalon.
    idsalon: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("salon.idsalon", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    # Docente dueño del escenario; permite resolver permisos y la biblioteca
    # aunque el escenario no esté asignado a ningún salón.
    iddocente: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("docente.iddocente", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    niveldificultad: Mapped[str] = mapped_column(String, nullable=False)
    tipoescenario: Mapped[str] = mapped_column(String, nullable=False)
    objetivosaprendizaje: Mapped[str | None] = mapped_column(Text)
    instrucciones: Mapped[str | None] = mapped_column(Text)
    tiempolimite: Mapped[int | None] = mapped_column(Integer)
    intentospermitidos: Mapped[int | None] = mapped_column(Integer, server_default="1")
    configuracionescenario: Mapped[dict | None] = mapped_column(JSONB, server_default="'{}'::jsonb")
    fechacreacion: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    fechamodificacion: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    activo: Mapped[bool | None] = mapped_column(Boolean, server_default="true")
    idescenario_origen: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("escenario.idescenario", ondelete="SET NULL"),
        nullable=True,
    )

    salon: Mapped["Salon | None"] = relationship(back_populates="escenarios")  # noqa: F821
    docente: Mapped["Docente | None"] = relationship(back_populates="escenarios")  # noqa: F821
    actividades: Mapped[list["EscenarioEnActividad"]] = relationship(back_populates="escenario")  # noqa: F821
    interacciones: Mapped[list["InteraccionEscenario"]] = relationship(back_populates="escenario")  # noqa: F821
