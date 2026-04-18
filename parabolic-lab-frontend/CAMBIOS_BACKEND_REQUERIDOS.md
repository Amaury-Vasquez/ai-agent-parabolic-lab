# Cambios Requeridos en Backend - Gestión de Estudiantes

## 1. Corrección Error 405 - Endpoint PATCH para Salones

### Endpoint: `PATCH /salones/{idsalon}`

**Propósito:** Actualizar información del salón (nombre y descripción)

**Autenticación:** Requerida (header: `x-stack-access-token`)

**Validación:** El docente debe ser el propietario del salón

**Request Body:**
```json
{
  "nombresalon": "string"
}
```

**Response (200 OK):**
```json
{
  "idsalon": "string",
  "nombresalon": "string",
  "codigoacceso": "string",
  "activo": boolean,
  "escenarios": ["string"],
  "num_estudiantes": number
}
```

**Errores:**
- `401 Unauthorized` - Token inválido o no proporcionado
- `403 Forbidden` - El usuario no es propietario del salón
- `404 Not Found` - El salón no existe
- `422 Unprocessable Entity` - Datos inválidos

**Nota:** Este endpoint ya está configurado en el frontend para usar PATCH correctamente.

---

## 2. Nueva Funcionalidad: Gestión de Estudiantes

### 2.1 Obtener Lista de Estudiantes del Salón

**Endpoint:** `GET /salones/{idsalon}/estudiantes`

**Autenticación:** Requerida (header: `x-stack-access-token`)

**Validación:** El docente debe ser el propietario del salón

**Query Parameters:** Ninguno (por ahora)

**Response (200 OK):**
```json
[
  {
    "idalumno": "string (UUID)",
    "nombre": "string",
    "apellido": "string",
    "correo": "string",
    "ultimo_acceso": "string (ISO 8601 datetime) | null",
    "escenarios_completados": number,
    "total_escenarios": number
  }
]
```

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No es propietario del salón
- `404 Not Found` - El salón no existe

---

### 2.2 Agregar Estudiante a Salón

**Endpoint:** `POST /salones/{idsalon}/agregar-estudiante`

**Autenticación:** Requerida

**Validación:**
- El docente debe ser propietario del salón
- El correo debe existir en el sistema (usuario registrado)
- El estudiante no debe estar ya en el salón
- El campo debe venir como `correo`, no `correoalumno`

**Request Body:**
```json
{
  "correo": "estudiante@ejemplo.com"
}
```

**Response (201 Created):**
```json
{
  "idalumno": "string (UUID)",
  "nombre": "string",
  "apellido": "string",
  "correo": "string",
  "ultimo_acceso": null,
  "escenarios_completados": 0,
  "total_escenarios": 0
}
```

**Errores:**
- `400 Bad Request` - Correo inválido o no existe usuario con ese correo
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No es propietario del salón
- `404 Not Found` - El salón no existe
- `409 Conflict` - El estudiante ya está en el salón

---

### 2.3 Dar de Baja Estudiante

**Endpoint:** `DELETE /salones/{idsalon}/estudiantes/{idalumno}`

**Autenticación:** Requerida

**Validación:**
- El docente debe ser propietario del salón
- La relación entre estudiante y salón debe existir

**Response (204 No Content)**
Sin cuerpo de respuesta

**Errores:**
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - No es propietario del salón
- `404 Not Found` - El salón o estudiante no existe

---

## 3. Cambios en Base de Datos (si aplica)

### Tabla: `alumno_en_salon`
Asegúrate que existe y tiene estos campos:
- `idalumno` (UUID, FK a usuarios)
- `idsalon` (UUID, FK a salones)
- `fecha_unido` (TIMESTAMP, por defecto NOW())
- PRIMARY KEY(idalumno, idsalon)

### Tabla: `usuarios`
Para el endpoint de obtener estudiantes, se necesita información de:
- `idalumno` (UUID)
- `nombre` (string)
- `apellido` (string)
- `correo` (string)

### Vista o Query: Escenarios Completados
Se recomienda crear una vista o subquery que calcule:
- Total de escenarios en el salón
- Escenarios completados por cada alumno

Ejemplo:
```sql
SELECT 
  aes.idalumno,
  COUNT(DISTINCT es.idescenario) as total_escenarios,
  COUNT(DISTINCT CASE WHEN ape.estado = 'completado' THEN es.idescenario END) as escenarios_completados
FROM alumno_en_salon aes
JOIN escenarios es ON es.idsalon = aes.idsalon
LEFT JOIN alumno_progreso_escenario ape ON ape.idalumno = aes.idalumno AND ape.idescenario = es.idescenario
GROUP BY aes.idalumno
```

---

## 4. Consideraciones de Seguridad

1. **Verificación de Propiedad:** Todos los endpoints deben verificar que el usuario autenticado es el propietario del salón antes de realizar cualquier operación.

2. **Validación de Entrada:**
   - Correos deben ser validados antes de buscar
   - IDs deben ser UUIDs válidos

3. **Manejo de Errores:** Retorna mensajes de error claros pero sin exponer detalles internos

4. **Rate Limiting:** Considera implementar rate limiting en endpoints de mutación

---

## 5. Integración Frontend-Backend

El frontend espera los endpoints en los siguientes valores:
- `API_URL + "/salones/{idsalon}"` con método PATCH
- `API_URL + "/salones/{idsalon}/estudiantes"` con método GET
- `API_URL + "/salones/{idsalon}/agregar-estudiante"` con método POST
- `API_URL + "/salones/{idsalon}/estudiantes/{idalumno}"` con método DELETE

Asegúrate que `API_URL` esté configurada en `NEXT_PUBLIC_API_URL` en el frontend.

---

## 6. Testing Recomendado

```bash
# 1. Obtener estudiantes del salón
curl -X GET "http://localhost:8000/salones/123/estudiantes" \
  -H "x-stack-access-token: token"

# 2. Agregar estudiante
curl -X POST "http://localhost:8000/salones/123/agregar-estudiante" \
  -H "x-stack-access-token: token" \
  -H "Content-Type: application/json" \
  -d '{"correo": "estudiante@ejemplo.com"}'

# 3. Dar de baja estudiante
curl -X DELETE "http://localhost:8000/salones/123/estudiantes/456" \
  -H "x-stack-access-token: token"

# 4. Actualizar nombre del salón
curl -X PATCH "http://localhost:8000/salones/123" \
  -H "x-stack-access-token: token" \
  -H "Content-Type: application/json" \
  -d '{"nombresalon": "Nuevo Nombre"}'
```
