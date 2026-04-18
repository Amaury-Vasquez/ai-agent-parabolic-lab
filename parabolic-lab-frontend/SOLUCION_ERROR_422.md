# Solución Error 422 - idsalon Inválido

## Problema
Al intentar crear un escenario desde la biblioteca, se enviaba `"biblioteca"` (string) como valor de `idsalon` en lugar de un UUID válido, causando error `422 - Input should be a valid UUID`.

## Root Cause
En `ScenarioEditor/index.tsx`, línea ~147:
```typescript
const salonId = classroomId || "biblioteca";  // ❌ "biblioteca" NO es un UUID
await crearEscenario({
  idsalon: salonId,
  ...datos,
});
```

El flujo era:
1. Se crea escenario desde `/docente/biblioteca/nuevo`
2. `NuevoEscenario.tsx` llama `<ScenarioEditor />` sin pasar `classroomId`
3. `classroomId` es `undefined`
4. Se usa fallback `"biblioteca"` como UUID (INVÁLIDO)
5. Backend rechaza con 422

## Soluciones Implementadas ✅

### 1. **Crear validador de UUID** (`src/utils/uuid.ts`)
```typescript
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
```

### 2. **Hacer `idsalon` opcional en fetcher** (`src/fetchers/escenarios.ts`)
```typescript
export async function createEscenario(
  token: string,
  data: {
    idsalon?: string;  // ✅ Ahora es opcional
    nombre: string;
    // ... otros campos
  }
): Promise<Scenario> {
  const sanitizedData = sanitizeData(data);
  return post<Scenario>("/escenarios/", sanitizedData, { token });
}
```

### 3. **Validar UUID antes de enviar** (`src/modules/ScenarioEditor/index.tsx`)
```typescript
const createData = {
  ...datos,
  // ✅ Solo incluir idsalon si es un UUID válido
  ...(isValidUUID(classroomId) && { idsalon: classroomId }),
};

await crearEscenario(createData);
```

### 4. **Actualizar tipos de mutación** (`src/queries/useCreateEscenario.ts`)
```typescript
mutationFn: (
  data: Omit<Parameters<typeof createEscenario>[1], "idsalon"> & {
    idsalon?: string;  // ✅ Ahora es opcional en el tipo
  }
) => createEscenario(token, data),
```

### 5. **Mejorar mensajes de error**
Agregado manejo específico para error 422:
```typescript
} else if (error.message.includes("422")) {
  errorMessage = "Los datos enviados son inválidos. Verifica que todos los campos requeridos sean correctos.";
}
```

## Flujo Después de las Correcciones

### Crear escenario desde la biblioteca:
```
/docente/biblioteca/nuevo
  → NuevoEscenario.tsx (sin classroomId)
  → ScenarioEditor: classroomId = undefined
  → handleSubmit: isValidUUID(undefined) = false
  → createData = { nombre, descripcion, ... } (sin idsalon)
  → Server recibe escenario sin idsalon ✅
```

### Crear escenario desde un salón (futuro):
```
/docente/salon/[classroomId]/escenarios/nuevo
  → ScenarioEditor: classroomId = "550e8400-e29b-41d4-a716-446655440000"
  → handleSubmit: isValidUUID(classroomId) = true
  → createData = { nombre, ..., idsalon: "550e8400..." }
  → Server recibe escenario con idsalon válido ✅
```

## Cambios por Archivo

| Archivo | Cambio |
|---------|--------|
| `src/utils/uuid.ts` | NUEVO - Validador UUID |
| `src/fetchers/escenarios.ts` | `idsalon?: string` (era obligatorio) |
| `src/modules/ScenarioEditor/index.tsx` | Import `isValidUUID`, lógica condicional de idsalon |
| `src/queries/useCreateEscenario.ts` | Actualizar tipos para idsalon opcional |
| `src/services/api.ts` | Manejo mejorado de errores 422 |

## Testing

Para verificar que funciona:

1. Ir a `/docente/biblioteca/nuevo`
2. Llenar el formulario de nuevo escenario
3. Hacer clic en "Guardar"
4. Debe crear el escenario sin incluir `idsalon` en la petición
5. Revisar en DevTools (F12) → Network → POST `/escenarios/`
   - Request body **NO debe contener** `idsalon`

## Nota Importante

El backend debe estar configurado para:
- ✅ Aceptar peticiones POST sin el campo `idsalon`
- ✅ Manejar escenarios sin salón asignado (almacenar como NULL o vacío)
- ✅ Responder con éxito (200/201) cuando `idsalon` no está presente
