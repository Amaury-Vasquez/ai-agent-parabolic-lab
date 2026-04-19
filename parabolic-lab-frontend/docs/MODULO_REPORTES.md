# Módulo de Reportes - Documentación Completa

## 📋 Descripción General

El Módulo de Reportes es una nueva funcionalidad que permite a los docentes generar y descargar reportes de desempeño académico en formato CSV y PDF. Los reportes incluyen:

- **Reportes Consolidados del Salón**: Resumen de desempeño de todos los estudiantes en un salón
- **Expedientes Individuales**: Reportes detallados de cada estudiante con detalles de intentos, parámetros físicos y estadísticas

### Parámetros Físicos Capturados
- Velocidad Inicial ($v_0$) en m/s
- Ángulo ($\theta$) en grados
- Resultado del impacto
- Tiempo total invertido en resolver

---

## 🔧 Cambios en Backend

### 1. **Nuevas Dependencias** (`requirements.txt`)

Se agregaron las siguientes librerías:
```
reportlab        # Para generación de PDFs
Pillow          # Para manejo de imágenes
python-dateutil # Para utilidades de fechas
```

### 2. **Nuevo Servicio** ([parabolic-lab-backend/app/services/reports.py](../parabolic-lab-backend/app/services/reports.py))

**Clase `ReportService`** con métodos principales:

#### `generate_salon_csv_report(db, salon_id) -> bytes`
Genera un CSV consolidado con:
- Información del salón (`salon.nombresalon`)
- Tabla de estudiantes con estadísticas agregadas
- Columnas: Nombre, Matrícula, Total Intentos, Completados, Promedio, Tiempo Promedio, Tasa Éxito
- ✅ Manejo de salones vacíos: "Sin datos registrados"

#### `generate_student_csv_report(db, alumno_id, salon_id) -> bytes`
Genera un CSV con el expediente de un estudiante:
- Información del estudiante
- Tabla detallada de cada intento
- Columnas: Escenario, Nivel, v₀, θ, Intentos, Completado, Puntuación, Tiempo, Fecha
- ✅ Validación de estudiante y relación con salón
- ✅ Manejo de estudiantes sin interacciones

#### `generate_salon_pdf_report(db, salon_id) -> bytes`
Genera un PDF profesional del salón:
- Encabezado con título "Reporte de Desempeño - Salón"
- Información del salón con timestamp
- Tabla de desempeño por estudiante
- ✅ Flag `has_data` para renderizado condicional

#### `generate_student_pdf_report(db, alumno_id, salon_id) -> bytes`
Genera un PDF del expediente del estudiante:
- Información del estudiante
- Tabla detallada de intentos con parámetros físicos (v₀, θ)
- Estadísticas finales (escenarios, completados, tasa éxito, puntuación, tiempo)
- ✅ Manejo de expedientes vacíos

**Correcciones Implementadas:**
- ✅ Cambio `salon.nombre` → `salon.nombresalon` (4 localizaciones)
- ✅ Validación de datos vacíos en todos los métodos
- ✅ Extracción correcta de datosinteraccion JSON

### 3. **Nuevo Router** ([parabolic-lab-backend/app/routes/reportes.py](../parabolic-lab-backend/app/routes/reportes.py))

**Endpoints implementados:**

```
GET /api/v1/reportes/salon/{salon_id}/csv
GET /api/v1/reportes/salon/{salon_id}/pdf
GET /api/v1/reportes/estudiante/{alumno_id}/salon/{salon_id}/csv
GET /api/v1/reportes/estudiante/{alumno_id}/salon/{salon_id}/pdf
```

**Características de seguridad:**
- Requiere autenticación con token `x-stack-access-token`
- Valida que el usuario sea docente
- Valida que el docente sea propietario del salón
- Retorna Stream con headers de descarga correctos
- ✅ Corrección de `salon.nombresalon` en Content-Disposition headers

**Headers de respuesta:**
```
Content-Type: text/csv o application/pdf
Content-Disposition: attachment; filename="..."
```

### 4. **Actualización de Main** ([parabolic-lab-backend/app/main.py](../parabolic-lab-backend/app/main.py))

Se agregó el import y registro del nuevo router:
```python
from app.routes import reportes
app.include_router(reportes.router, prefix=API_PREFIX)
```

---

## 🎨 Cambios en Frontend

### 1. **Nuevo Módulo** ([parabolic-lab-frontend/src/modules/Reportes/index.tsx](../src/modules/Reportes/index.tsx))

**Características:**
- Componente cliente con estado para selector de salón y estudiantes
- Selector dropdown con lista de salones del docente
- Dos secciones de descarga:
  1. **Reporte Consolidado**: Botones CSV/PDF para todo el salón
  2. **Expedientes**: Tabla con estudiantes y botones individuales

**State Management:**
- `selectedSalonId`: ID del salón seleccionado
- `estudiantes`: Lista de estudiantes del salón
- `loadingEstudiantes`: Estado de carga de lista
- `loadingReport`: Tracking de descargas en progreso

**Funciones:**
- `handleDownloadSalonReport()`: Descarga reporte del grupo
- `handleDownloadStudentReport()`: Descarga expediente individual
- Ambas funciones usan `downloadReport()` de `api.ts`

### 2. **Página Server-Side** ([parabolic-lab-frontend/src/app/docente/reportes/page.tsx](../src/app/docente/reportes/page.tsx))

**Arquitectura:**
- **Server Component**: Maneja prefetch de datos con React Query
- **HydrationBoundary**: Establece estado inicial (salones precargados)
- **Cliente Component (Reportes)**: Renderiza UI desde módulo

**Flujo de datos:**
```
Server (page.tsx)
  ├─ Lee token de cookies
  ├─ Prefetch salones con fetchMySalones()
  └─ Pasa HydrationBoundary a cliente

Cliente (Reportes)
  ├─ Hidrata con salones precargados
  ├─ Carga estudiantes al seleccionar salón
  └─ Maneja descargas de reportes
```

### 3. **Función de Descarga** ([parabolic-lab-frontend/src/services/api.ts](../src/services/api.ts))

**Nueva función:**
```typescript
export async function downloadReport(
  endpoint: string,
  token: string,
  filename: string
): Promise<void>
```

**Características:**
- Envía header `x-stack-access-token`
- Convierte respuesta a blob
- Crea URL temporal y descarga automática
- Limpia recursos después de descarga
- Manejo de errores con fallback

### 4. **Diseño Visual**

**Componentes utilizados:**
- `Button` de amvasdev-ui (variant="primary")
- DaisyUI card, table, select, spinner
- Icons de lucide-react (File, FileText)
- Tailwind CSS para responsive layout

**Estructura visual:**
```
Header (Título + Descripción)
  ↓
Selector Salón (Card + Select)
  ↓
[Si seleccionó salón]
  ├─ Reporte Consolidado (Card + 2 Botones)
  └─ Expedientes (Card + Tabla)
      └─ Cada fila: Estudiante + 2 botones descarga
```

**Tabla de Expedientes:**
- Clases: `table table-sm table-zebra` (DaisyUI)
- Columnas: Estudiante, Completados, Intentos, Promedio, Mejor, Tiempo, Acciones
- Botones individuales: CSV y PDF con loading spinners

---

## 📊 Modelos de Base de Datos Utilizados

### Relaciones Existentes

El módulo utiliza las siguientes entidades sin modificarlas:

**Alumno**
- `idalumno`: UUID (PK)
- `idusuario`: UUID (FK → Usuario)
- `matricula`: String
- Relación: `interacciones` → InteraccionEscenario

**Salon**
- `idsalon`: UUID (PK)
- `iddocente`: UUID (FK → Docente)
- `nombre`: String
- Relación: `alumnos` → AlumnoEnSalon
- Relación: `escenarios` → Escenario

**InteraccionEscenario**
- `idinteraccion`: UUID (PK)
- `idalumno`: UUID (FK)
- `idescenario`: UUID (FK)
- `intentosrealizados`: Integer
- `puntuacion`: Numeric
- `tiempototal`: Integer (segundos)
- `completado`: Boolean
- `datosinteraccion`: JSONB (contiene v₀, θ, etc.)
- `fechafin`: DateTime

**Escenario**
- `idescenario`: UUID (PK)
- `idsalon`: UUID (FK)
- `nombre`: String
- `niveldificultad`: String
- `configuracionescenario`: JSONB

### Campos JSONB Esperados

En `InteraccionEscenario.datosinteraccion`:
```json
{
  "velocidadInicial": 15.5,
  "angulo": 45,
  "otrosParametros": "..."
}
```

---

## 🔐 Seguridad y Autenticación

### Validaciones Implementadas

1. **Token Requerido**
   - Todos los endpoints requieren `x-stack-access-token`
   - Token se valida en `get_current_user` dependency

2. **Verificación de Rol**
   - Solo docentes pueden acceder
   - Se valida `current_user.docente` != None

3. **Autorización de Recursos**
   - Docente solo puede ver sus propios salones
   - Query: `Salon.iddocente == current_user.docente.iddocente`

4. **Manejo de Errores**
   - 401: Unauthorized (token inválido)
   - 403: Forbidden (no es docente)
   - 404: Not Found (salón no existe)

---

## 🚀 Uso desde el Frontend

### Acceder a la Página

```
/docente/reportes
```

### Flujo de Usuario

1. Navegar a `/docente/reportes`
2. Seleccionar un salón del dropdown
3. Se carga automáticamente la tabla de estudiantes
4. Descargar reportes consolidados (CSV/PDF)
5. O descargar expedientes individuales (CSV/PDF)

### Ejemplos de Llamadas a API

**Descargar CSV del Salón:**
```typescript
await downloadReport(
  `/reportes/salon/sala-uuid/csv`,
  token,
  'reporte_salon.csv'
);
```

**Descargar PDF del Estudiante:**
```typescript
await downloadReport(
  `/reportes/estudiante/alumno-uuid/salon/salon-uuid/pdf`,
  token,
  'expediente_juan_perez.pdf'
);
```

---

## 📈 Métricas y Estadísticas

### Disponibles en CSV (Salón)
- Total de intentos por estudiante
- Escenarios completados
- Puntuación promedio
- Tiempo promedio invertido
- Tasa de éxito (%)

### Disponibles en PDF (Estudiante)
- Total escenarios trabajados
- Escenarios completados
- Tasa de éxito
- Puntuación total acumulada
- Tiempo total invertido (horas, minutos, segundos)
- Detalles por intento:
  - Velocidad inicial
  - Ángulo de disparo
  - Número de intentos
  - Estado de completado
  - Fecha de realización

---

## 🧪 Pruebas Recomendadas

### Backend

1. **Test de Autenticación**
   - Sin token → Error 401
   - Token inválido → Error 401

2. **Test de Autorización**
   - Usuario alumno → Error 403
   - Usuario docente de otro salón → Error 404

3. **Test de Generación**
   - CSV válido con datos correctos
   - PDF válido con tablas formateadas
   - Manejo de estudiantes sin interacciones

### Frontend

1. **Selector de Salón**
   - Se cargan salones correctamente
   - Cambio de selección carga estudiantes

2. **Descargas**
   - CSV descarga correctamente
   - PDF descarga correctamente
   - Filenames incluyen nombres sin espacios

3. **Estados de Carga**
   - Spinner se muestra durante descarga
   - Botones se deshabilitan durante descarga

---

## 📝 Consideraciones de Rendimiento

### Optimizaciones Realizadas

1. **Índices de Base de Datos**
   - Existen índices en campos de búsqueda:
     - `idx_interaccion_escenario`
     - `idx_interaccion_alumno`
     - `idx_interaccion_fecha`

2. **Queries Eficientes**
   - Uso de `selectinload` para cargar relaciones
   - Evita N+1 queries

3. **Generación de Reportes**
   - Streams de respuesta (no carga todo en memoria)
   - Buffers de IO para CSV y PDF

### Limitaciones Conocidas

- Reportes muy grandes (1000+ estudiantes) pueden ser lentos
- PDFs con muchas páginas pueden tardar más

---

## 🔄 Integración Futura

### Mejoras Posibles

1. **Exportación a Excel**
   - Usar openpyxl para XLSX
   - Múltiples hojas por salón

2. **Gráficos en PDF**
   - Usando reportlab.graphics
   - Histogramas de puntuaciones

3. **Email de Reportes**
   - Enviar reportes vía email
   - Programación automática

4. **Dashboard de Estadísticas**
   - Visualización en tiempo real
   - Comparativas entre salones

---

## 📦 Estructura de Archivos

### Backend
```
app/
├── services/
│   ├── __init__.py
│   └── reports.py          [NUEVO]
├── routes/
│   └── reportes.py         [NUEVO]
└── main.py                 [MODIFICADO]
```

### Frontend
```
src/
├── app/docente/reportes/
│   ├── page.tsx           [NUEVO]
│   └── reportes.module.css [NUEVO]
└── services/
    └── api.ts             [MODIFICADO]
```

### Documentación
```
docs/
└── MODULO_REPORTES.md     [ESTE ARCHIVO]
```

---

## ✅ Checklist de Implementación

- [x] Crear servicio de generación de reportes (CSV y PDF)
- [x] Crear router de reportes con endpoints
- [x] Registrar router en main.py
- [x] Actualizar requirements.txt con dependencias
- [x] Crear página de reportes en frontend
- [x] Crear estilos CSS responsivos
- [x] Implementar función de descarga de blobs
- [x] Manejar autenticación correctamente
- [x] Validar autorizaciones de docente/salón
- [x] Crear documentación completa

---

## 📞 Soporte

Para reportar issues o sugerencias sobre el módulo de reportes, contacta al equipo de desarrollo.

**Fecha de Implementación:** 2024
**Versión:** 1.0.0
