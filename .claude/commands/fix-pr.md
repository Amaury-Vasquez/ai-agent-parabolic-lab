---
description: Hace checkout del branch del PR, aplica correcciones para cumplir backend-dev, frontend-dev y los CLAUDE.md, commitea y pushea
argument-hint: <branch-name>
---

Eres un implementador automatizado para este repo. A diferencia de `/review-pr` (que sólo comenta), tu trabajo aquí es **modificar el código** del PR para que cumpla con las guías de:

- `.claude/skills/backend-dev.md`
- `.claude/skills/frontend-dev.md`
- `parabolic-lab-backend/CLAUDE.md`
- `parabolic-lab-frontend/CLAUDE.md`

Luego haces commit y push al mismo branch del PR. **Nunca** mergeas, nunca force-pusheas, nunca tocas otro branch.

# Paso 0 — Verificar working tree limpio

Antes de tocar nada, corre:

```bash
git status --porcelain
```

Si la salida no es vacía, detente y dile al usuario: "Tu working tree tiene cambios sin commitear. Stashealos o commitealos antes de correr `/fix-pr` para no perder trabajo." No procedas.

Guarda el branch actual:

```bash
git rev-parse --abbrev-ref HEAD
```

Lo necesitarás al final para regresar.

# Paso 1 — Validar argumento y localizar el PR

Si `$1` está vacío, detente y pídele al usuario el branch name. No continúes sin él.

```bash
gh pr list --head "$1" --state open --json number,title,headRefName,headRepositoryOwner,headRepository,author,url --jq '.[0]'
```

- Si la salida es `null` o vacía: reporta "No encontré un PR abierto con head `$1`." y detente.
- Si `gh` falla por auth: pide al usuario `gh auth status` y detente.
- Si el PR está cerrado o merged: detente. No tiene sentido fixearlo.

Guarda:
- `PR_NUMBER`, `PR_TITLE`, `PR_URL`, `BRANCH_NAME` (campo `headRefName`), `AUTHOR_LOGIN`

Anuncia: "Voy a fixear PR #`$PR_NUMBER` — «`$PR_TITLE`» de @`$AUTHOR_LOGIN`. Branch: `$BRANCH_NAME`."

# Paso 2 — Confirmación explícita del usuario

Esta operación **modifica código y pushea commits al PR de otra persona**. Antes de continuar, pídele confirmación al usuario:

> "Voy a hacer checkout de `$BRANCH_NAME`, aplicar correcciones automáticas para cumplir las guías, commitear y pushear al mismo branch. ¿Continúo? (sí/no)"

Si la respuesta no es afirmativa explícita, detente.

# Paso 3 — Checkout del branch del PR

```bash
gh pr checkout "$PR_NUMBER"
```

Esto crea/cambia al branch local con tracking correcto del fork si aplica. Verifica:

```bash
git rev-parse --abbrev-ref HEAD
```

Debe coincidir con `$BRANCH_NAME`. Si no, aborta.

# Paso 4 — Cargar las guías completas

Lee con la tool Read (no greps parciales — necesitas todo el contenido):

- `.claude/skills/backend-dev.md`
- `.claude/skills/frontend-dev.md`
- `parabolic-lab-backend/CLAUDE.md`
- `parabolic-lab-frontend/CLAUDE.md`

Reglas clave que más se violan (ten estas en mente al editar):

**Backend (skill + CLAUDE.md):**
- Thin routes: validación + llamada al service + return. Nada de lógica ni SQL crudo en rutas.
- Service layer es el core. Un archivo por dominio.
- **Nunca** importar `HTTPException` ni tipos de FastAPI en services.
- Schemas: variantes `Create`, `Update` (todos los campos `| None = None`), `Read` (con `from_attributes = True`).
- Usa `response_model` para serialización — nunca `.model_dump()` manual en el return.
- `data.model_dump(exclude_unset=True)` para updates parciales.
- Mensajes de error en español.
- `from app.services import X as X_service` (importar módulo completo).
- `status_code=201` para POST, `status_code=204` para DELETE.
- Prefix `_` para deps no usadas (`_current_user`).
- Todo el código va dentro de `parabolic-lab-backend/app/`.
- Nombres de columnas/atributos en español, lowercase (matching DB schema).

**Frontend (skill + CLAUDE.md):**
- Directorios permitidos: `app/`, `modules/`, `components/`, `hooks/`, `queries/`, `mutations/`, `utils/`, `constants/`, `contexts/`, `providers/`, `layouts/`, `models/`, `types/`, `fetchers/`, `services/`. (Nota: el skill original prohíbe `fetchers/` pero el CLAUDE.md del frontend lo usa para SSR-safe fetchers — **honra el CLAUDE.md** porque es más reciente).
- amvasdev-ui first: usa `Button`, `Input`, etc. nunca `<button className="btn">`.
- **Nunca** uses `text-base-content`.
- **Nunca** `min-h-screen` ni gradientes en módulos.
- Sin colores hardcoded — sólo tokens DaisyUI semánticos.
- Constantes en `SCREAMING_SNAKE_CASE` en `src/constants/`.
- Import order: external → relative → `@/` (A-Z dentro de cada grupo, sin líneas en blanco entre grupos).
- Páginas (`page.tsx`): server components delgadas, sólo prefetch + render del módulo.
- No especificar props con valor default (omitir `size="md"`).
- Encoding UTF-8 estricto: nunca el caracter `�` (U+FFFD). Si lo encuentras en código tocado por el PR, repáralo a la letra acentuada correcta.
- Conditional rendering: ternario con `null` explícito, no `&&`.
- Componentes: arrow function `const X = () => (...)`. Sólo páginas usan `export default function`.
- Placeholders de inputs son ejemplos (`"Juan"`), no instrucciones (`"Ingresa tu nombre"`).

# Paso 5 — Listar archivos del PR

```bash
gh pr diff "$PR_NUMBER" --name-only
```

**Restricción crítica de scope:** sólo puedes editar archivos que aparezcan en esta lista. No reformatees ni "limpies" archivos que el PR no tocó — eso ensuciaría el diff y mezclaría cambios fuera del scope del autor.

Clasifica los archivos:
- `parabolic-lab-backend/...` → reglas backend
- `parabolic-lab-frontend/...` → reglas frontend
- Otros (raíz, `.claude/`, `*.md`) → sólo arregla si hay algo claramente roto (encoding, archivos basura). En la duda, no los toques.

# Paso 6 — Identificar violaciones (delegar a Explore agent)

Delega a un Explore agent (subagent_type=Explore) para no cargar todo el diff en el contexto principal. El agent NO edita; sólo identifica. Pásale:

- `PR_NUMBER`
- Las rutas absolutas de los 4 documentos de guías
- La lista de archivos cambiados
- Las reglas clave del Paso 4 (cópialas verbatim)
- Instrucción de leer cada archivo cambiado y reportar violaciones con: `file:line`, regla violada (cita textual), y propuesta concreta de fix (código antes → código después).

Pídele formato estructurado para que puedas iterar archivo por archivo en el Paso 7. No toleres reportes vagos.

# Paso 7 — Aplicar fixes

Para cada archivo con violaciones:

1. Lee el archivo completo con Read.
2. Aplica los fixes con Edit (o Write si la reestructuración es grande, pero prefiere Edit).
3. **No cambies comportamiento** — sólo conformancia con las guías. Si un fix requiere cambiar lógica de negocio (ej. mover lógica de la ruta al service), hazlo sólo si es mecánico y obvio. Si es ambiguo, **déjalo y anótalo** para el comentario final.
4. **No agregues archivos nuevos** salvo que la guía lo exija (ej. mover lógica de una ruta a un service nuevo). Si lo haces, sigue exactamente la convención de naming del skill.
5. **No toques imports/formato de archivos que no estén en la lista del Paso 5.**

Categorías de fix esperadas (no exhaustivo):
- Reordenar imports (external → relative → `@/`, A-Z dentro de cada grupo).
- Reemplazar `<button className="btn">` por `<Button>` de amvasdev-ui.
- Quitar `text-base-content`, `min-h-screen` en módulos, props con valor default.
- Convertir `&&` a ternarios con `null`.
- Renombrar constantes a `SCREAMING_SNAKE_CASE` y moverlas a `src/constants/` si están inline (sólo si el archivo está en el diff).
- Mover validación/lógica de rutas backend al service correspondiente (sólo si es trivial).
- Agregar `response_model`, quitar `.model_dump()` manuales.
- Cambiar `status_code` faltantes en POST/DELETE.
- Reparar caracteres `�` a UTF-8 correcto.

# Paso 8 — Verificar que no rompiste nada

Corre los linters/formatters que existen en cada subproyecto, **sólo si el PR tocó archivos de ese subproyecto**:

**Backend** (si hay archivos backend en el diff):
```bash
cd parabolic-lab-backend && uv run ruff check app/ && uv run ruff format --check app/
```

**Frontend** (si hay archivos frontend en el diff):
```bash
cd parabolic-lab-frontend && npm run lint
```

Si ruff/eslint reporta errores nuevos introducidos por tus ediciones, corrígelos antes de commitear. Si los errores ya existían antes (en código que el PR no tocó), déjalos — no es tu scope.

No corras tests ni builds completos — toma demasiado y no es el objetivo de este comando. Si el usuario quiere verificación más profunda, que la pida explícitamente.

# Paso 9 — Commit y push

```bash
git diff --stat
```

Si no hay cambios (PR ya cumplía las guías), salta al Paso 10 y reporta "PR ya cumple con las guías, no hubo nada que arreglar." No crees commit vacío.

Si hay cambios, stagealos selectivamente (sólo archivos del diff del PR — verifica con `git status` que no hay sorpresas):

```bash
git add <archivos modificados, uno por uno>
```

Commit con HEREDOC y co-author:

```bash
git commit -m "$(cat <<'EOF'
chore: apply backend-dev/frontend-dev guidelines

Automated fixes against .claude/skills/{backend,frontend}-dev.md and
the CLAUDE.md files. No behavior changes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Push **sin force**:

```bash
git push
```

Si el branch viene de un fork y el push falla por permisos, detente y dile al usuario: "El branch `$BRANCH_NAME` viene de un fork de @`$AUTHOR_LOGIN` y no tengo permisos para pushear. Los cambios quedaron commiteados localmente — pídele al autor que jale del remote o aplica un patch manual." No intentes workarounds.

# Paso 10 — Comentar en el PR

Postea un comentario corto (no un review) explicando qué cambiaste:

```bash
cat > /tmp/pr-fix-$PR_NUMBER.md <<'EOF'
# Fixes automáticos aplicados

Hola <NOMBRE>, apliqué correcciones automáticas al branch para cumplir con `.claude/skills/backend-dev.md`, `.claude/skills/frontend-dev.md` y los `CLAUDE.md` de cada subproyecto. Sin cambios de comportamiento.

## Cambios aplicados

- <bullet 1: ej. "Reordené imports en 4 archivos frontend">
- <bullet 2: ej. "Reemplacé 3 `<button className=\"btn\">` por `<Button>` de amvasdev-ui">
- <bullet 3: ...>

## Cosas que NO toqué (requieren decisión humana)

- <bullet por cada violación que dejaste sin fixear, con razón>

Revisa el commit y avísame si algo está mal.
EOF

gh pr comment "$PR_NUMBER" --body-file "/tmp/pr-fix-$PR_NUMBER.md"
```

Si no hubo cambios (PR limpio), no postees comentario. Reporta sólo al usuario.

# Paso 11 — Regresar al branch original

```bash
git checkout <BRANCH_ORIGINAL_DEL_PASO_0>
```

# Paso 12 — Reportar al usuario

- PR número y URL.
- Conteo de archivos modificados y líneas (`git show --stat HEAD` del commit en el branch del PR — usa `git log -1 --stat <branch>`).
- Lista corta de qué se arregló.
- Lista corta de qué se dejó sin arreglar y por qué.

# Cosas a NO hacer

- **No** force-pushes, **no** rebases, **no** amends al branch del PR.
- **No** mergeas el PR.
- **No** edites archivos fuera del diff del PR.
- **No** cambies comportamiento (lógica, queries, rutas, schemas de DB) — sólo conformancia con guías.
- **No** corras `git add -A` ni `git add .` — staging selectivo siempre.
- **No** cierres ni reabras el PR, **no** apruebes ni request-changes.
- **No** instales dependencias nuevas ni cambies `package.json` / `pyproject.toml`.
- **No** flaggees ni "fixees" violaciones que no estén documentadas en las 4 guías.
