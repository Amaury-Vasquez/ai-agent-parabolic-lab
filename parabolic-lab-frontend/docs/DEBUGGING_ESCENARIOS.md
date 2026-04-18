# Diagnóstico y Correcciones - Error de Actualización de Escenarios

## Problemas Identificados y Solucionados ✅

### 1. **Mejora del Manejo de Errores en `api.ts`** ✅

**Problema:** El error `Failed to fetch` era genérico y no proporcionaba contexto sobre qué falló realmente.

**Solución Implementada:**
- Validación de `API_URL` para detectar si la variable de entorno no está configurada
- Captura de excepciones de fetch para diferenciar entre errores de conexión y errores HTTP
- Extracción del cuerpo completo de respuesta (JSON o texto) para errores
- Logging detallado en consola con status, statusText y detalle de error
- Mejor presentación del error al usuario

**Archivo:** `src/services/api.ts`

---

### 2. **Verificación de `NEXT_PUBLIC_API_URL`** ✅

**Estado:** ✅ Correctamente configurada en `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

### 3. **Sanitización de Datos Antes de Enviarlos** ✅

**Problema:** El problema de datetime (offset-naive vs offset-aware) en FastAPI ocurría porque:
- El modelo `Scenario` contiene campos de fecha (`fechacreacion`, `fechamodificacion`)
- Aunque no se envíaban explícitamente, podían estar siendo incluidos accidentalmente

**Solución Implementada:**
- Creada `src/utils/sanitizeData.ts` con funciones para limpiar datos:
  - `sanitizeData()` - Elimina campos de fecha y valores undefined/null
  - `serializeForAPI()` - Serializa datos y detecta campos de fecha con warnings
- Actualizado `src/fetchers/escenarios.ts`:
  - `createEscenario()` ahora sanitiza los datos
  - `updateEscenario()` ahora sanitiza los datos

**Archivo afectado:** 
- `src/utils/sanitizeData.ts` (nuevo)
- `src/fetchers/escenarios.ts`

---

### 4. **Mejora del Manejo de Errores en ScenarioEditor** ✅

**Problema:** Los mensajes de error al guardar eran genéricos y no ayudaban a diagnosticar el problema.

**Solución Implementada:**
- Mejora del bloque `catch` en `handleSubmit` con mensajes específicos según el tipo de error:
  - Errores de conexión: "No se puede conectar al servidor..."
  - Errores 500: "Error del servidor... Revisa la consola del backend"
  - Errores 401/403: "No tienes permisos..."
  - Errores 404: "El escenario no fue encontrado"
  - Otros errores: Muestra el mensaje completo del servidor

**Archivo:** `src/modules/ScenarioEditor/index.tsx`

---

## Verificación de CORS y Headers ✅

**Estado Actual:**
- ✅ Header `x-stack-access-token` se envía correctamente en todas las peticiones
- ✅ Header `Content-Type: application/json` se envía automáticamente
- ✅ El método PATCH está siendo usado correctamente

**Nota sobre Preflight:** 
El header `x-stack-access-token` es un header personalizado, lo que **requiere un preflight request (OPTIONS)**. 

**Si aún ves error de CORS en el navegador:**
El backend (FastAPI) DEBE responder a peticiones OPTIONS con estos headers de respuesta:
```
Access-Control-Allow-Origin: http://localhost:3000  # o *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, x-stack-access-token
Access-Control-Allow-Credentials: true  # si usas cookies
```

---

## Investigación del Error 500 del Backend ⚠️

El error `500 Internal Server Error` por conflicto datetime en FastAPI ocurre cuando:

1. **Campos de fecha en formato incorrecto:** FastAPI espera que los datetimes offset-aware lleguen en ISO format con timezone
2. **Serialización JSON:** Las fechas JavaScript se serializan como strings ISO, pero el backend podría esperar un formato diferente

**Recomendaciones para el Backend (FastAPI):**

```python
# En tu modelo de Pydantic
from datetime import datetime
from typing import Optional

class EscenarioUpdate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    # ... otros campos ...
    
    class Config:
        # Esto ayuda con la serialización de fechas
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# En tu ruta PATCH
@app.patch("/escenarios/{idescenario}")
async def update_escenario(
    idescenario: str,
    data: EscenarioUpdate,
    request: Request,
):
    # No incluyas fechamodificacion en el modelo de actualización
    # El backend debe manejar esa fecha automáticamente
    # ...
```

---

## Pasos Para Debugging

Si aún tienes problemas después de estas correcciones, sigue estos pasos:

### 1. **Verifica la consola del navegador (DevTools)**
   - F12 → Pestaña "Console"
   - Busca mensajes de error detallados (ahora deberían ser más descriptivos)

### 2. **Verifica la consola del servidor Node.js**
   - Terminal donde ejecutas `npm run dev`
   - Los logs mejorados de `api.ts` deberían aparecer aquí

### 3. **Verifica la consola del backend (FastAPI)**
   - Terminal donde ejecutas el servidor FastAPI
   - Un error 500 debería mostrar el stack trace completo

### 4. **Usa el Network Inspector**
   - DevTools → Pestaña "Network"
   - Filtra por la petición PATCH al `/escenarios/...`
   - Haz clic en la petición y revisa:
     - **Headers** (enviados): Verifica que `x-stack-access-token` está presente
     - **Response** (recibida): Lee el error exacto del servidor

### 5. **Test con cURL** (opcional)
   ```bash
   curl -X PATCH http://localhost:8000/api/v1/escenarios/{id} \
     -H "Content-Type: application/json" \
     -H "x-stack-access-token: tu-token-aqui" \
     -d '{"nombre":"test"}'
   ```

---

## Checklist Final ✅

- [x] Error handling mejorado en api.ts
- [x] API_URL verificada (http://localhost:8000/api/v1)
- [x] Utilidad de sanitización de datos creada
- [x] updateEscenario y createEscenario usan sanitización
- [x] Mensajes de error mejorados en ScenarioEditor
- [x] Headers CORS verificados
- [x] Análisis del problema de datetime (offset-naive vs offset-aware)

---

## Próximos Pasos

1. **Reinicia el servidor de desarrollo:** `npm run dev`
2. **Intenta actualizar un escenario** y revisa los mensajes de error mejorados
3. **Revisa el stack trace completo del error 500** en la consola del backend
4. **Si persiste el error de datetime:** implementa las recomendaciones de FastAPI listadas arriba
