---
name: backend-dev
description: Backend development guidelines for the ParabolicLab project. Use when creating, editing, or reviewing any file inside the parabolic-lab-backend/ directory. Apply when building routes, services, models, schemas, dependencies, or migrations.
user-invocable: false
---

# Backend Development Guidelines

These rules apply to all work inside the `parabolic-lab-backend/` directory.

## Core Principles

- **Single Responsibility**: Every function, class, and module does exactly one thing. A route handler delegates, a service orchestrates, a model maps to the database.
- **Modularity**: Each domain entity has its own model, schema(s), service, and route file. Adding a feature should not require modifying unrelated files.
- **Thin Routes**: Route handlers validate input, call the service layer, and return a response. No business logic, no raw SQL, no multi-step orchestration in routes.
- **Explicit over implicit**: Prefer explicit function signatures, typed returns, and named dependencies over magic or convention.

## Directory Structure

```
parabolic-lab-backend/app/
├── main.py              # FastAPI app factory + router registration
├── config.py            # Pydantic Settings (env vars)
├── database.py          # Async engine + sessionmaker
├── dependencies.py      # FastAPI Depends (get_db, get_current_user)
├── auth/                # Authentication module (Stack Auth client)
│   └── stack_auth.py
├── models/              # SQLAlchemy ORM models (one file per table)
├── schemas/             # Pydantic request/response DTOs (one file per entity)
├── services/            # Business logic layer (one file per domain)
├── routes/              # FastAPI route handlers (one file per resource)
└── utils/               # Pure utility functions (reusable logic)
```

## Models (`/models`)

One file per database table. Each file contains exactly one SQLAlchemy model class.

```python
# models/salon.py
from sqlalchemy import Column, String, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Salon(Base):
    __tablename__ = "salon"

    idsalon = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    nombresalon = Column(String, nullable=False)
    codigoacceso = Column(String, nullable=False)
    activo = Column(Boolean, server_default="true")
    iddocente = Column(UUID(as_uuid=True), ForeignKey("docente.iddocente", onupdate="CASCADE"))

    docente = relationship("Docente", back_populates="salones")
```

**Rules:**
- Column names are lowercase Spanish, matching the database exactly.
- All PKs are `UUID` with `server_default=func.gen_random_uuid()`.
- Timestamps use `server_default=func.now()`.
- Define relationships in the model, not in routes or services.
- Never put business logic in models.

## Schemas (`/schemas`)

One file per entity. Each file may contain multiple schema variants for different operations.

**Naming convention — schema variants:**

| Suffix | Purpose | Used in |
|--------|---------|---------|
| `Create` | Request body for creating a resource | `POST` route |
| `Update` | Request body for updating (all fields optional) | `PATCH` route |
| `Read` | Response body returned to the client | All responses |

```python
# schemas/salon.py
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SalonCreate(BaseModel):
    nombresalon: str
    codigoacceso: str
    iddocente: UUID
    idinstitucion: UUID


class SalonUpdate(BaseModel):
    nombresalon: str | None = None
    activo: bool | None = None


class SalonRead(BaseModel):
    idsalon: UUID
    nombresalon: str
    codigoacceso: str
    activo: bool
    iddocente: UUID
    idinstitucion: UUID
    fechacreacion: datetime

    model_config = {"from_attributes": True}
```

**Rules:**
- Only `Read` schemas need `from_attributes = True` (ORM conversion).
- `Update` schemas have all fields optional (`| None = None`).
- Use `EmailStr` for email fields.
- Use `UUID` from stdlib, `Decimal` for scores, `datetime` for timestamps.
- JSONB fields typed as `dict[str, Any]`.
- Never duplicate types that already exist in `/models` or `/types` — import them.

## Services (`/services`)

**The service layer is the core of the application.** One file per domain. Each service function encapsulates a single unit of business logic.

Services receive a `db: AsyncSession` and return model instances or raise exceptions. They never touch HTTP concepts (status codes, Request, Response).

```python
# services/salon.py
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.salon import Salon
from app.schemas.salon import SalonCreate, SalonUpdate


async def list_salones(db: AsyncSession) -> list[Salon]:
    result = await db.execute(select(Salon))
    return list(result.scalars().all())


async def get_salon(db: AsyncSession, salon_id: UUID) -> Salon | None:
    return await db.get(Salon, salon_id)


async def create_salon(db: AsyncSession, data: SalonCreate) -> Salon:
    salon = Salon(**data.model_dump())
    db.add(salon)
    await db.commit()
    await db.refresh(salon)
    return salon


async def update_salon(db: AsyncSession, salon: Salon, data: SalonUpdate) -> Salon:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(salon, field, value)
    await db.commit()
    await db.refresh(salon)
    return salon


async def delete_salon(db: AsyncSession, salon: Salon) -> None:
    await db.delete(salon)
    await db.commit()
```

**Rules:**
- Functions are `async` and receive `AsyncSession` as first argument.
- Each function does one thing: list, get, create, update, or delete.
- Return model instances (not dicts, not schemas).
- Return `None` for not-found cases — let the route decide the HTTP response.
- Use `data.model_dump(exclude_unset=True)` for partial updates.
- Commit and refresh inside the service function that owns the transaction.
- For multi-step operations (e.g., register user + create role), group them in a single service function with a single commit at the end. Use `db.flush()` for intermediate steps that need generated IDs.
- Never import `HTTPException` or any FastAPI type in services.

## Routes (`/routes`)

One file per resource. Route handlers are thin — they validate, delegate to a service, and return.

```python
# routes/salones.py
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.usuario import Usuario
from app.schemas.salon import SalonCreate, SalonRead, SalonUpdate
from app.services import salon as salon_service

router = APIRouter(prefix="/salones", tags=["salones"])


@router.get("/", response_model=list[SalonRead])
async def list_salones(
    db: AsyncSession = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    return await salon_service.list_salones(db)


@router.get("/{salon_id}", response_model=SalonRead)
async def get_salon(
    salon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    salon = await salon_service.get_salon(db, salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    return salon


@router.post("/", response_model=SalonRead, status_code=201)
async def create_salon(
    data: SalonCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    return await salon_service.create_salon(db, data)


@router.patch("/{salon_id}", response_model=SalonRead)
async def update_salon(
    salon_id: UUID,
    data: SalonUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    salon = await salon_service.get_salon(db, salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    return await salon_service.update_salon(db, salon, data)


@router.delete("/{salon_id}", status_code=204)
async def delete_salon(
    salon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    salon = await salon_service.get_salon(db, salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    await salon_service.delete_salon(db, salon)
```

**Rules:**
- Import the service module, not individual functions: `from app.services import salon as salon_service`.
- `HTTPException` is the only exception type raised in routes. Services do not raise HTTP exceptions.
- Use `response_model` to control serialization — never manually call `.model_dump()` in the return.
- Prefix unused dependencies with `_` (e.g., `_current_user` when only needed for auth gating).
- Use `status_code=201` for POST, `status_code=204` for DELETE.
- One router per file, registered in `main.py`.

## Dependencies (`/dependencies`)

Shared FastAPI `Depends` functions. Keep them minimal — they provide infrastructure (DB session, authenticated user), not business logic.

```python
# dependencies.py
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.stack_auth import verify_access_token
from app.database import async_session
from app.models.usuario import Usuario


async def get_db():
    async with async_session() as session:
        yield session


async def get_current_user(
    token: str = Header(..., alias="x-stack-access-token"),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    auth_id = payload.get("sub")
    result = await db.execute(select(Usuario).where(Usuario.authid == auth_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
```

**Rules:**
- `get_db` yields an `AsyncSession` — routes and services use it.
- `get_current_user` returns a `Usuario` model instance.
- Auth header is `x-stack-access-token` (Stack Auth convention).
- New dependencies go here only if they are truly cross-cutting (used by many routes). Route-specific logic goes in services.

## Auth Module (`/auth`)

Contains the Stack Auth API client. All external calls to Stack Auth live here.

**Rules:**
- Functions are standalone (not class methods) — `sign_up`, `sign_in`, `verify_access_token`, etc.
- Uses `httpx` for async HTTP calls to Stack Auth API.
- JWT verification uses ES256 with JWKS from Stack Auth.
- Never import database models here — this module only talks to the external auth service.

## Utils (`/utils`)

Pure utility functions with no side effects and no dependencies on FastAPI, SQLAlchemy, or the database.

```python
# utils/string.py
def normalize_code(code: str) -> str:
    return code.strip().upper()
```

**Rules:**
- No imports from `app.models`, `app.database`, `app.routes`, or `app.services`.
- If it uses `AsyncSession` or any ORM type, it belongs in `/services`, not `/utils`.

## Migrations (Alembic)

Database schema changes are managed with Alembic (async mode).

```bash
uv run alembic revision --autogenerate -m "add column X to table Y"
uv run alembic upgrade head
uv run alembic downgrade -1
```

**Rules:**
- Always auto-generate first, then review the generated migration before applying.
- Migration messages should describe the change, not the ticket: `"add email to usuario"`, not `"TT-42"`.
- Never manually edit `alembic_version` in the database.
- The `neon_auth.users_sync` table and its FK are managed by Neon, not Alembic — do not create migrations for them.

## Error Handling

| Layer | Raises | Catches |
|-------|--------|---------|
| Routes | `HTTPException` | Nothing (let FastAPI handle) |
| Services | `ValueError`, domain exceptions | DB exceptions for rollback |
| Auth | `HTTPException` (401 only) | External API errors |

- Never catch generic `Exception` unless re-raising or logging.
- Use specific status codes: 400 (bad input), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (validation — FastAPI auto).
- Error detail messages should be in Spanish to match the frontend.

## Coding Style

- **Formatter/Linter**: ruff (line-length 120, Python 3.11+ target).
- **Type hints**: All function signatures must have parameter and return type annotations.
- **Async**: All database and HTTP operations are `async/await`.
- **Imports**: Use absolute imports from the `app` package: `from app.models.salon import Salon`.
- **Naming**: snake_case for functions and variables. PascalCase for classes. SCREAMING_SNAKE_CASE for constants.
- **Spanish column names**: Match the database exactly (`idsalon`, `nombresalon`, `tipousuario`). Do not translate to English.

## Decision Checklist

Before writing code, ask:

1. **Does this touch the database?** → It belongs in `/services` (business logic) or `/models` (schema definition). Never in routes.
2. **Does this validate or shape a request/response?** → `/schemas`.
3. **Does this talk to an external API?** → `/auth` (for Stack Auth) or a new module under `/services` for other APIs.
4. **Is this a pure function with no side effects?** → `/utils`.
5. **Is this a cross-cutting concern (auth, DB session)?** → `/dependencies`.
6. **Is this a new endpoint?** → Create or update the route file, create the service functions, add schemas as needed. Register the router in `main.py`.
7. **Does this change the database schema?** → Create an Alembic migration after modifying the model.
