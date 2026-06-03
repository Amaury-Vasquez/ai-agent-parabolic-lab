from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

from app.routes import (
    actividades_alumno,
    actividades_interactivas,
    admins,
    alumnos,
    alumnos_en_salon,
    auth,
    docentes,
    escenarios,
    escenarios_en_actividad,
    instituciones,
    interacciones_escenario,
    reportes,
    salones,
    usuarios,
)

app = FastAPI(
    title="Parabolic Lab API",
    description="API para la plataforma educativa de tiro parabolico",
    version="0.1.0",
)

CORS_ORIGINS = [
    "http://localhost:3000",
    "https://parabolic-lab-frontend.vercel.app",
    "https://paraboliclab.app",
    "https://www.paraboliclab.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Etiquetas legibles para los campos más comunes en validación de entrada.
_FIELD_LABELS = {
    "email": "correo electrónico",
    "email_institucion": "correo de la institución",
    "password": "contraseña",
    "nombre": "nombre",
    "nombre_institucion": "nombre de la institución",
    "apellidopaterno": "apellido paterno",
    "apellidomaterno": "apellido materno",
    "idinstitucion": "institución",
    "tipousuario": "tipo de usuario",
    "matricula": "matrícula",
    "gradoacademico": "grado académico",
    "telefono": "teléfono",
    "codigopostal": "código postal",
}


def _mensaje_validacion(error: dict) -> str:
    tipo = error.get("type", "")
    if "missing" in tipo:
        return "Este campo es obligatorio"
    if "email" in tipo:
        return "El correo no tiene un formato válido"
    if "uuid" in tipo:
        return "El valor seleccionado no es válido"
    if "too_short" in tipo or "min_length" in tipo:
        return "El valor es demasiado corto"
    if "too_long" in tipo or "max_length" in tipo:
        return "El valor es demasiado largo"
    if any(t in tipo for t in ("int", "float", "number")):
        return "Debe ser un número válido"
    return error.get("msg", "Valor inválido")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Devuelve errores de validación con un mensaje claro por campo.

    Mantiene la forma {"detail": [{"loc", "msg", "type"}]} para no romper
    clientes existentes, pero traduce los mensajes a español y añade
    `field_errors` (campo -> mensaje) para mapear errores en el formulario.
    """
    detail = []
    field_errors: dict[str, str] = {}
    for error in exc.errors():
        loc = [str(part) for part in error.get("loc", [])]
        campo = loc[-1] if loc else ""
        mensaje = _mensaje_validacion(error)
        detail.append({"loc": loc, "msg": mensaje, "type": error.get("type", "")})
        if campo and campo != "body":
            etiqueta = _FIELD_LABELS.get(campo, campo)
            field_errors[campo] = mensaje
            # Sobrescribe el msg con una versión que nombra el campo.
            detail[-1]["msg"] = f"{etiqueta.capitalize()}: {mensaje}"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail, "field_errors": field_errors},
    )


API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(instituciones.router, prefix=API_PREFIX)
app.include_router(usuarios.router, prefix=API_PREFIX)
app.include_router(alumnos.router, prefix=API_PREFIX)
app.include_router(admins.router, prefix=API_PREFIX)
app.include_router(docentes.router, prefix=API_PREFIX)
app.include_router(salones.router, prefix=API_PREFIX)
app.include_router(alumnos_en_salon.router, prefix=API_PREFIX)
app.include_router(escenarios.router, prefix=API_PREFIX)
app.include_router(actividades_interactivas.router, prefix=API_PREFIX)
app.include_router(actividades_alumno.router, prefix=API_PREFIX)
app.include_router(interacciones_escenario.router, prefix=API_PREFIX)
app.include_router(escenarios_en_actividad.router, prefix=API_PREFIX)
app.include_router(reportes.router, prefix=API_PREFIX)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "StackAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "x-stack-access-token",
        }
    }
    for path in schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"StackAuth": []}]
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "parabolic-lab-backend"}
