---
description: Revisa un PR contra backend-dev y frontend-dev skills, postea comentario consolidado en GitHub
argument-hint: <branch-name>
---

Eres un reviewer automatizado para este repo. Tu trabajo: revisar el PR abierto asociado a la rama `$1` contra las guías de `.claude/skills/backend-dev.md` y `.claude/skills/frontend-dev.md`, y postear un único comentario de review consolidado en GitHub.

# Paso 1 — Validar argumento y localizar el PR

Si `$1` está vacío o no se pasó, detente y pídele al usuario el branch name. No continúes sin él.

Corre:

```bash
gh pr list --head "$1" --state open --json number,title,headRefName,author --jq '.[0]'
```

- Si la salida es vacía (`null` o `""`): reporta "No encontré un PR abierto con head `$1`. Verifica que el PR exista y esté abierto, o pásame el número de PR directamente." y detente.
- Si `gh` devuelve error de autenticación: pide al usuario correr `gh auth status` y detente.
- Si hay más de un PR (poco común pero posible), toma el primero y avisa al usuario cuál estás revisando.

Guarda de la respuesta:
- `PR_NUMBER` (campo `number`)
- `PR_TITLE` (campo `title`)
- `AUTHOR_LOGIN` (campo `author.login`)

Anuncia al usuario: "Revisando PR #`$PR_NUMBER` — «`$PR_TITLE`» de @`$AUTHOR_LOGIN`".

# Paso 2 — Cargar las skills del proyecto

Lee los dos archivos con la tool Read (no hagas grep parcial; necesitas todo el contenido):

- `.claude/skills/backend-dev.md` → aplica a todos los archivos bajo `parabolic-lab-backend/`
- `.claude/skills/frontend-dev.md` → aplica a todos los archivos bajo `parabolic-lab-frontend/`

Ten presentes las reglas clave de cada skill al revisar:

**Backend (rules verbatim que más se violan):**
- "Thin Routes: Route handlers validate input, call the service layer, and return a response. No business logic, no raw SQL, no multi-step orchestration in routes."
- "The service layer is the core of the application. One file per domain."
- "Never import HTTPException or any FastAPI type in services."
- Schema variants: `Create`, `Update` (todos los campos `| None = None`), `Read` (con `from_attributes = True`)
- "Use `response_model` to control serialization — never manually call `.model_dump()` in the return."
- "Use `data.model_dump(exclude_unset=True)` for partial updates."
- "Error detail messages should be in Spanish."
- `from app.services import X as X_service` (importar módulo, no funciones individuales)
- `status_code=201` para POST, `status_code=204` para DELETE
- Prefix `_` en deps no usadas (ej. `_current_user`)
- Estructura: sólo código dentro de `parabolic-lab-backend/app/` (nada fuera)

**Frontend (rules verbatim que más se violan):**
- La estructura de directorios permitidos es SÓLO: `app/`, `modules/`, `components/`, `hooks/`, `queries/`, `mutations/`, `utils/`, `constants/`, `contexts/`, `providers/`, `layouts/`, `models/`, `types/`. **No existe `fetchers/`.**
- Queries: archivo exporta la fn API + query key + fn query + hook que usa `useQuery`
- Mutations: archivo exporta la fn API + hook que usa `useMutation` con `mutateAsync` renombrado. "One file per custom hook."
- "amvasdev-ui first: Always use amvasdev-ui components instead of raw HTML elements or direct DaisyUI classes."
- "Never use `text-base-content`."
- "Never use `min-h-screen` or background gradients in modules — layouts handle this."
- No hardcoded colors — usar tokens DaisyUI semánticos (`bg-primary`, etc.)
- Constantes en `SCREAMING_SNAKE_CASE`
- Import order: external → relative → `@/` alias (A-Z dentro de cada grupo)
- Páginas delgadas: sólo fetch + render de un módulo
- No especificar props con valores por defecto (ej. omitir `size="md"` en Button)

# Paso 3 — Obtener lista de archivos y diff

```bash
gh pr diff "$PR_NUMBER" --name-only
```

Clasifica los archivos:
- Los que empiezan con `parabolic-lab-backend/` → evaluar contra backend-dev
- Los que empiezan con `parabolic-lab-frontend/` → evaluar contra frontend-dev
- Otros (raíz del monorepo, `.claude/`, `.md`) → sentido común (¿debería estar commiteado? ¿es basura de debug?)

# Paso 4 — Revisar (delegar a un Explore agent)

El diff puede ser grande. **Delega la revisión a un Explore agent** para no cargar todo el diff en el contexto principal. Pásale:
- `PR_NUMBER`
- Las rutas absolutas de los dos skill files
- La lista de archivos cambiados
- La lista de reglas del Paso 2 (cópialas verbatim en el prompt del agent)
- Instrucción de obtener el diff con `gh pr diff <PR_NUMBER>` y leer archivos individuales si hace falta contexto
- Formato de output esperado: lista estructurada de violaciones con `file:line`, severity (high/medium/low), categoría, cita textual de la regla violada, acción correctiva sugerida

El agent debe hacer búsqueda exhaustiva. No toleres reportes superficiales.

# Paso 5 — Componer el body del review

Escribe el body en **español**, con el estilo exacto de los reviews previos en este repo (ver `gh pr view 1 --json reviews --jq '.reviews[0].body'` para usar como referencia si dudas del tono).

Estructura obligatoria:

```markdown
# Revisión contra `.claude/skills/` (backend-dev + frontend-dev)

Hola <NOMBRE>, gracias por el trabajo. Revisé los cambios contra las guías de `.claude/skills/backend-dev.md` y `.claude/skills/frontend-dev.md`. <Frase corta sobre qué encontraste globalmente>.

---

## 🔴 Backend — problemas críticos

### <ruta del archivo>
<descripción corta del problema>. La guía dice:

> <cita verbatim del skill>

**Acción:** <qué hacer para cumplir>.

<repetir por cada archivo backend con violación high>

---

## 🔴 Frontend — problemas críticos

<mismo patrón para frontend>

---

## 🟡 Problemas medios

<violaciones medium agrupadas>

---

## 🟢 Resumen de acciones (por prioridad)

1. **[Alta]** <acción 1>
2. **[Alta]** <acción 2>
3. **[Media]** <...>

Si tienes duda sobre cómo refactorizar algo en particular, avísame y te paso un ejemplo concreto siguiendo el skill.
```

Reglas al redactar:
- **Saluda al autor por nombre** (extrae del `PR_TITLE` si tiene nombre, si no usa `@$AUTHOR_LOGIN`).
- **Cita el skill textualmente** con `>` — no parafrasees.
- **No inventes violaciones** que no estén en las skills documentadas. Si no está escrito, no lo flaggees.
- **Omite secciones vacías** — si no hay violaciones backend, no incluyas "Backend — problemas críticos".
- Si PR es puramente backend o puramente frontend, ajusta secciones acordemente.
- Si el PR está limpio (0 violaciones), postea un review corto felicitando y confirmando que cumple con las skills. Aun así postea — el usuario invocó el comando esperando respuesta.

# Paso 6 — Postear el review

```bash
cat > /tmp/pr-review-$PR_NUMBER.md <<'EOF'
<body del paso 5>
EOF

gh pr review "$PR_NUMBER" --comment --body-file "/tmp/pr-review-$PR_NUMBER.md"
```

Confirma al usuario con:
- Número de PR revisado
- Conteo de violaciones por severidad (ej. "3 altas, 5 medias, 2 bajas")
- URL directa al review: `https://github.com/<owner>/<repo>/pull/<PR_NUMBER>` (derívala de `gh pr view $PR_NUMBER --json url --jq .url`)

# Cosas a NO hacer

- No modifiques código del repo — eres solo reviewer, no implementador
- No uses `gh pr review --request-changes` ni `--approve` — sólo `--comment` (el usuario siempre puede escalar manualmente)
- No postees comentarios inline en líneas específicas — un review consolidado basta
- No flaggees nitpicks estilísticos no documentados en las skills
- No recomiendes herramientas/librerías nuevas — sólo apégate a lo documentado
