import httpx
import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient

from app.config import settings

STACK_AUTH_BASE = "https://api.stack-auth.com/api/v1"

_jwks_client = PyJWKClient(f"{STACK_AUTH_BASE}/projects/{settings.STACK_AUTH_PROJECT_ID}/.well-known/jwks.json")

_server_headers = {
    "x-stack-access-type": "server",
    "x-stack-project-id": settings.STACK_AUTH_PROJECT_ID,
    "x-stack-secret-server-key": settings.STACK_AUTH_SECRET_SERVER_KEY,
    "Content-Type": "application/json",
}


def verify_access_token(access_token: str) -> dict:
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(access_token)
        payload = jwt.decode(
            access_token,
            signing_key.key,
            algorithms=["ES256"],
            audience=settings.STACK_AUTH_PROJECT_ID,
        )
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso invalido o expirado",
        )


# Códigos de error de Stack Auth -> (status HTTP, mensaje claro en español)
_SIGN_UP_ERRORS: dict[str, tuple[int, str]] = {
    "USER_EMAIL_ALREADY_EXISTS": (
        status.HTTP_409_CONFLICT,
        "Ya existe una cuenta registrada con este correo electrónico",
    ),
    "PASSWORD_TOO_SHORT": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña es demasiado corta (mínimo 8 caracteres)",
    ),
    "PASSWORD_TOO_LONG": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña es demasiado larga",
    ),
    "PASSWORD_REQUIRES_DIGIT": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña debe incluir al menos un número",
    ),
    "PASSWORD_REQUIRES_LOWERCASE": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña debe incluir al menos una letra minúscula",
    ),
    "PASSWORD_REQUIRES_UPPERCASE": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña debe incluir al menos una letra mayúscula",
    ),
    "PASSWORD_REQUIRES_SPECIAL_CHAR": (
        status.HTTP_400_BAD_REQUEST,
        "La contraseña debe incluir al menos un carácter especial",
    ),
}


async def sign_up(email: str, password: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/password/sign-up",
            headers=_server_headers,
            json={"email": email, "password": password},
        )
    if response.status_code != 200:
        if response.status_code >= 500:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="El servicio de autenticación no está disponible. Intenta más tarde.",
            )
        body = response.json()
        code = body.get("code") if isinstance(body, dict) else None
        mapped = _SIGN_UP_ERRORS.get(code)
        if mapped:
            raise HTTPException(status_code=mapped[0], detail=mapped[1])
        # Respaldo: usar el mensaje de Stack Auth si lo hay.
        mensaje = body.get("error") if isinstance(body, dict) else None
        raise HTTPException(
            status_code=response.status_code,
            detail=mensaje or "No se pudo crear la cuenta. Verifica los datos e intenta de nuevo.",
        )
    return response.json()


async def sign_in(email: str, password: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/password/sign-in",
            headers=_server_headers,
            json={"email": email, "password": password},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )
    return response.json()


async def get_stack_user(user_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{STACK_AUTH_BASE}/users/{user_id}",
            headers=_server_headers,
        )
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en Stack Auth")
    return response.json()


async def update_stack_user(user_id: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{STACK_AUTH_BASE}/users/{user_id}",
            headers=_server_headers,
            json=data,
        )
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar usuario")
    return response.json()


async def refresh_session(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/sessions/current/refresh",
            headers={
                **_server_headers,
                "x-stack-refresh-token": refresh_token,
            },
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo renovar la sesión",
        )
    return response.json()


async def send_reset_password_code(email: str, callback_url: str) -> dict:
    """Solicita a Stack Auth que envíe un correo con un código de restablecimiento.

    Por seguridad, Stack Auth devuelve `{"success": "maybe, ..."}` sin revelar
    si el correo existe en el sistema.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/password/send-reset-code",
            headers=_server_headers,
            json={"email": email, "callback_url": callback_url},
        )
    if response.status_code != 200:
        detail = response.json() if response.status_code < 500 else "Error en Stack Auth"
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()


async def check_reset_password_code(code: str) -> dict:
    """Verifica que un código de restablecimiento es válido y no ha expirado."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/password/reset/check-code",
            headers=_server_headers,
            json={"code": code},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de restablecimiento inválido o expirado",
        )
    return response.json()


async def reset_password(code: str, password: str) -> dict:
    """Restablece la contraseña usando un código previamente enviado por correo."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STACK_AUTH_BASE}/auth/password/reset",
            headers=_server_headers,
            json={"code": code, "password": password},
        )
    if response.status_code != 200:
        detail = response.json() if response.status_code < 500 else "Error en Stack Auth"
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()


async def delete_stack_user(user_id: str) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.request(
            "DELETE",
            f"{STACK_AUTH_BASE}/users/{user_id}",
            headers=_server_headers,
            content="{}",
        )
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar usuario")
