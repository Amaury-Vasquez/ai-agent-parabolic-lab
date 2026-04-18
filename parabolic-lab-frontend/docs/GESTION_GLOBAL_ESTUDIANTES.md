# Gestión Global de Estudiantes - Documentación de Cambios

**Fecha:** 18 de abril de 2026  
**Autor:** Equipo de Desarrollo  
**Estado:** ✅ Implementado

---

## 📋 Resumen Ejecutivo

Se ha implementado la **página maestra de gestión global de estudiantes** para docentes. Esta vista proporciona un panel unificado para visualizar, filtrar y gestionar todos los estudiantes inscritos en los salones del docente, con capacidades avanzadas de ordenamiento y filtrado.

---

## 🎯 Características Implementadas

### 1. Página de Gestión Global de Estudiantes

**Ruta:** `/docente/estudiantes`

**Propósito:** Vista maestra unificada que muestra todos los estudiantes inscritos en los salones del docente.

**Características:**
- ✅ Header con título y contador de estudiantes
- ✅ Toolbar de filtros con múltiples opciones
- ✅ Tabla responsive con información detallada
- ✅ Estados de carga y vacío
- ✅ Integración con TanStack Query para SSR + prefetch

---

### 2. Sistema de Filtros y Ordenamiento

#### Filtros Disponibles:

**2.1 Filtro por Salón**
- Carga dinámica de salones del docente
- Select dropdown con opción "Todos los salones"
- Filtra la tabla en tiempo real

**2.2 Ordenamiento**
- **Alfabético:** Ordena por nombre del estudiante
- **Rendimiento/Promedio:** Ordena por promedio_puntuacion
- **Actividad/Interacciones:** Ordena por total_intentos
- **Salón:** Ordena alfabéticamente por nombre del salón

**2.3 Dirección de Ordenamiento**
- Botón toggle: **Ascendente ↑** / **Descendente ↓**
- Visual feedback con colores (`btn-primary` / `btn-ghost`)
- Actualiza resultados en tiempo real

---

### 3. Tabla de Estudiantes

#### Columnas:

| Columna | Contenido | Tipo |
|---------|-----------|------|
| **Estudiante** | Nombre completo + Correo electrónico | Texto |
| **Salón** | Nombre del salón del estudiante | Texto |
| **Rendimiento** | Barra de progreso + Promedio en % | Visual |
| **Actividad** | Badge con total de intentos | Badge |
| **Acciones** | Botón "Ver Expediente" | Botón |

#### Detalles de Columnas:

**Estudiante:**
- Formato: "Nombre Apellido" (bold)
- Debajo: Email en gris (opacity-60)

**Rendimiento:**
- Barra de progreso (progress-primary)
- Cálculo: (escenarios_completados / total_intentos) * 100
- Muestra promedio_puntuacion redondeado a 1 decimal

**Actividad:**
- Badge DaisyUI con clase `badge-primary badge-outline`
- Texto: "{total_intentos} intentos"

**Acciones:**
- Icono: Eye (lucide-react)
- Texto: "Ver Expediente"
- Navega a: `/docente/salon/{idsalon}/estudiantes/{idalumno}`

---

### 4. Estados de la Interfaz

#### Estado de Carga:
```
- Spinner centered: loading loading-spinner loading-lg
- Se muestra mientras cargan estudiantes y salones
```

#### Estado Vacío:
```
- Título: "Aún no tienes estudiantes inscritos"
- Mensaje: "¡Invita a tus alumnos a unirse a un salón!"
- Tarjeta: bg-base-200 con altura h-64
```

---

## 🏗️ Arquitectura y Patrones

### Estructura de Archivos

```
src/
├── app/
│   └── docente/
│       └── estudiantes/
│           └── page.tsx                 # Página SSR con prefetch
├── fetchers/
│   └── salones.ts                       # Actualizado: nuevo endpoint
├── queries/
│   └── useEstudiantesGlobales.ts        # Nuevo: hook de estudiantes
├── modules/
│   └── GestionEstudiantesGlobal/
│       └── index.tsx                    # Nuevo: módulo UI
└── constants/
    └── navLinks.tsx                     # Ya existía: ruta correcta
```

### Patrón SSR + React Query

**Flujo de Datos:**

1. **Server Component** (`page.tsx`):
   - Obtiene token de cookies
   - Prefetch de estudiantes globales
   - Prefetch de salones (para filtros)
   - Dehydrate + HydrationBoundary

2. **Client Component** (`GestionEstudiantesGlobal/index.tsx`):
   - `"use client"` para interactividad
   - useEstudiantesGlobales con opciones dinámicas
   - useMySalones para cargar salones
   - Actualiza queryKey al cambiar filtros

3. **Invalidación de Cache:**
   - Los cambios en filtros actualizam automáticamente la query
   - TanStack Query maneja refetch inteligentemente

---

## 📝 Cambios de Código Detallados

### 1. Actualización: `src/fetchers/salones.ts`

**Cambios realizados:**

```typescript
// Nuevo import
import { get, post, patch, del } from "@/services/api";

// Nueva query key
export const ESTUDIANTES_GLOBALES_QUERY_KEY = (
  sortBy?: string,
  order?: string,
  salonId?: string
) => ["docentes", "estudiantes-global", { sortBy, order, salonId }];

// Nueva interfaz
export interface EstudianteGlobal {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  idsalon: string;
  nombresalon: string;
  progreso_total: number;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
}

export interface EstudiantesGlobalesResponse {
  estudiantes: EstudianteGlobal[];
  total: number;
}

// Nueva función fetcher
export async function fetchEstudiantesGlobales(
  token: string,
  options?: {
    sort_by?: "nombre" | "promedio" | "interacciones" | "salon";
    order?: "asc" | "desc";
    idsalon?: string;
  }
): Promise<EstudianteGlobal[]>
```

**Descripción:**
- Agregado import de `del` (aunque no se usa en estudiantes globales, estaba faltando)
- Creada query key parametrizada con sort_by, order, idsalon
- Interfaz EstudianteGlobal con todos los datos necesarios
- Función fetcher que construye query string dinámicamente
- Usa endpoint: `/api/v1/docentes/me/estudiantes-global`

---

### 2. Creación: `src/queries/useEstudiantesGlobales.ts`

**Archivo Nuevo**

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchEstudiantesGlobales, ESTUDIANTES_GLOBALES_QUERY_KEY, EstudianteGlobal } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export interface UseEstudiantesGlobalesOptions {
  sort_by?: "nombre" | "promedio" | "interacciones" | "salon";
  order?: "asc" | "desc";
  idsalon?: string;
}

export function useEstudiantesGlobales(options?: UseEstudiantesGlobalesOptions) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<EstudianteGlobal[]>({
    queryKey: ESTUDIANTES_GLOBALES_QUERY_KEY(options?.sort_by, options?.order, options?.idsalon),
    queryFn: () => fetchEstudiantesGlobales(token, { ... }),
    enabled: !!token,
  });
}
```

**Descripción:**
- Hook "use client" para componentes interactivos
- Acepta opciones de filtros y ordenamiento
- Construcción automática de query key basada en opciones
- Refetch automático al cambiar opciones
- Solo se ejecuta si hay token disponible

---

### 3. Creación: `src/modules/GestionEstudiantesGlobal/index.tsx`

**Archivo Nuevo - Componente Principal**

**Característica:** `"use client"` - Componente interactivo

**Estados Internos:**
- `sortBy`: Criterio de ordenamiento (nombre, promedio, interacciones, salon)
- `order`: Dirección (asc, desc)
- `selectedSalonId`: ID del salón seleccionado (vacío = todos)

**Funciones Principales:**

1. `handleVerExpediente(estudiante)`:
   - Navega a `/docente/salon/{idsalon}/estudiantes/{idalumno}`
   - Usa useRouter de next/navigation

2. `calcularPorcentajeProgreso(completados, total)`:
   - Calcula porcentaje para barra de progreso
   - Retorna 0 si total es 0

3. `formatearFecha(fecha)`:
   - Formatea fechas en español
   - Retorna "Sin acceso" si es null

**Renderizado:**
- Header con contador
- Toolbar con 3 selects y botones de dirección
- Tabla responsiva con scroll horizontal en mobile
- Empty state motivador
- Loading state con spinner

---

### 4. Creación: `src/app/docente/estudiantes/page.tsx`

**Archivo Nuevo - Página SSR**

**Descripción:**
- Server component (sin "use client")
- Prefetch de estudiantes con sort_by="nombre", order="asc"
- Prefetch de salones para los filtros
- HydrationBoundary para hidratación automática
- Importa y renderiza GestionEstudiantesGlobal

---

## 🔌 Integración con Endpoints Backend

### Endpoint: `GET /api/v1/docentes/me/estudiantes-global`

**Parámetros Query:**
- `sort_by`: "nombre" | "promedio" | "interacciones" | "salon"
- `order`: "asc" | "desc"
- `idsalon`: string (UUID del salón, opcional)

**Response (200 OK):**
```json
{
  "estudiantes": [
    {
      "idalumno": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@ejemplo.com",
      "idsalon": "uuid",
      "nombresalon": "Física 101",
      "progreso_total": 75,
      "promedio_puntuacion": 85.5,
      "escenarios_completados": 6,
      "total_intentos": 8
    }
  ],
  "total": 1
}
```

**Errores Esperados:**
- `401 Unauthorized` - Token inválido o expirado
- `400 Bad Request` - Parámetros inválidos
- `404 Not Found` - Docente no encontrado

---

## 🎨 Estilos y Diseño

### Colores y Temas

- Usa `data-theme="winter"` (configurado globalmente)
- Colores semánticos de DaisyUI:
  - `bg-base-100`, `bg-base-200`, `bg-base-300`
  - `btn-primary`, `btn-ghost`
  - `badge-primary`, `badge-outline`
  - `progress-primary`

### Responsividad

- Desktop: Tabla completa visible
- Tablet (md): Layout de filtros 2 columnas
- Mobile: Layout de filtros 1 columna, tabla con scroll horizontal

### Componentes Utilizados

- **amvasdev-ui:** Button
- **lucide-react:** Eye
- **clsx:** Clases condicionales para botones de dirección
- **DaisyUI:** select, badge, progress, table, card, loading

---

## 🔐 Seguridad

- ✅ Token extraído de cookies (server-side)
- ✅ Validación de token en client (enabled: !!token)
- ✅ Sin exposición de datos sensibles
- ✅ URL construida dinámicamente sin hardcoding
- ✅ Query parameters sanitizados automáticamente

---

## ⚡ Rendimiento

- ✅ SSR prefetch elimina hydration mismatch
- ✅ TanStack Query maneja cache inteligentemente
- ✅ Refetch solo cuando cambian parámetros
- ✅ Skeleton loading durante prefetch
- ✅ Lazy loading de salones en dropdown

---

## 🧪 Testing Manual

```bash
# 1. Navegar a la página
http://localhost:3000/docente/estudiantes

# 2. Verificar carga de datos
- Debe mostrar lista de estudiantes
- Debe mostrar salones en dropdown

# 3. Probar filtros
- Seleccionar un salón → Lista se filtra
- Cambiar ordenamiento → Orden cambia
- Cambiar dirección → Orden se invierte

# 4. Probar navegación
- Clic en "Ver Expediente" → Navega a ruta individual

# 5. Verificar estado vacío
- Crear nuevo docente sin estudiantes
- Debe mostrar mensaje motivador

# 6. Verificar SSR
- F12 → Network → Cargar página
- Los datos deben estar en HTML inicial (no solo fetch)
```

---

## 📚 Documentación Relacionada

- [CLAUDE.md](../CLAUDE.md) - Guía de desarrollo del proyecto
- [CAMBIOS_BACKEND_REQUERIDOS.md](../CAMBIOS_BACKEND_REQUERIDOS.md) - Cambios anteriores backend
- [GESTIN_ESTUDIANTES_IMPLEMENTADO.md](../GESTIN_ESTUDIANTES_IMPLEMENTADO.md) - Gestión de estudiantes por salón

---

## ✅ Checklist de Implementación

- ✅ Crear fetcher `fetchEstudiantesGlobales`
- ✅ Crear query hook `useEstudiantesGlobales`
- ✅ Crear módulo UI `GestionEstudiantesGlobal`
- ✅ Crear página SSR `/docente/estudiantes`
- ✅ Verificar ruta en TEACHER_NAV_LINKS
- ✅ Implementar filtros (Salón, Ordenamiento, Dirección)
- ✅ Implementar tabla con columnas requeridas
- ✅ Implementar navegación a expediente individual
- ✅ Implementar estados de carga y vacío
- ✅ Implementar SSR + prefetch
- ✅ Documentar cambios

---

## 🚀 Próximos Pasos (Opcionales)

1. **Búsqueda en Tiempo Real:**
   - Agregar input de búsqueda
   - Filtrar por nombre o email

2. **Exportar Datos:**
   - Botón para exportar tabla a CSV
   - Botón para exportar a PDF

3. **Acciones Masivas:**
   - Checkboxes para seleccionar estudiantes
   - Botón para eliminar múltiples

4. **Paginación:**
   - Si hay muchos estudiantes, agregar paginación

5. **Gráficos:**
   - Widget de resumen (total estudiantes, promedio general, etc.)
   - Gráfico de distribución por salón

---

## 📞 Notas Técnicas

- **Query Invalidation:** No se implementó invalidación manual porque los filtros cambian la queryKey automáticamente
- **Cookies:** Se usa `react-cookie` con hook `useCookies` en componente client
- **Tipos:** Todos los tipos están en `src/fetchers/salones.ts` para compartir entre server y client
- **Endpoint Base:** Se asume que `NEXT_PUBLIC_API_URL` está configurada en `.env.local`

---

## 📝 Cambios Futuros a Documentar

Cada vez que se agregue funcionalidad a esta página, añadir una sección aquí con:
- Qué se cambió
- Por qué se cambió
- Archivos afectados
- Cambios de API (si aplica)

---

**Documento Versión:** 1.0  
**Última Actualización:** 18 de abril de 2026
