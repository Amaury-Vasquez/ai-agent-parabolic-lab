"""escenarios de biblioteca sin salon + iddocente

Los escenarios originales (no copias) ahora viven en la biblioteca del
docente sin estar asignados a un salón (idsalon NULL). La nueva columna
iddocente identifica al dueño del escenario para permisos y listados.

Revision ID: 7e4d2a9c5b18
Revises: 1b83f8218153
Create Date: 2026-06-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7e4d2a9c5b18'
down_revision: Union[str, Sequence[str], None] = '1b83f8218153'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('escenario', sa.Column('iddocente', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_escenario_docente',
        'escenario',
        'docente',
        ['iddocente'],
        ['iddocente'],
        onupdate='CASCADE',
        ondelete='CASCADE',
    )
    op.create_index('idx_escenario_docente', 'escenario', ['iddocente'])
    op.alter_column('escenario', 'idsalon', existing_type=sa.UUID(), nullable=True)

    # Backfill: el dueño del escenario es el docente del salón donde vive.
    op.execute(
        """
        UPDATE escenario e
        SET iddocente = s.iddocente
        FROM salon s
        WHERE e.idsalon = s.idsalon
        """
    )
    # Los originales (no copias) pasan a la biblioteca: se quitan del salón
    # al que fueron asignados automáticamente al crearse.
    op.execute("UPDATE escenario SET idsalon = NULL WHERE idescenario_origen IS NULL")


def downgrade() -> None:
    # Reasignar los escenarios de biblioteca a algún salón del docente
    # (idsalon vuelve a ser NOT NULL); los que no tengan salón se eliminan.
    op.execute(
        """
        UPDATE escenario e
        SET idsalon = (
            SELECT s.idsalon FROM salon s
            WHERE s.iddocente = e.iddocente
            ORDER BY s.fechacreacion
            LIMIT 1
        )
        WHERE e.idsalon IS NULL
        """
    )
    op.execute("DELETE FROM escenario WHERE idsalon IS NULL")
    op.alter_column('escenario', 'idsalon', existing_type=sa.UUID(), nullable=False)
    op.drop_index('idx_escenario_docente', table_name='escenario')
    op.drop_constraint('fk_escenario_docente', 'escenario', type_='foreignkey')
    op.drop_column('escenario', 'iddocente')
