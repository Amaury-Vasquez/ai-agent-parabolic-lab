---
description: Crea un branch (si hace falta), commitea, pushea y abre un PR contra main; resuelve conflictos con main si los hay
argument-hint: "[descripción corta o tipo/branch-name] (opcional)"
---

Automatizas el flujo de "abrir PR" para este repo: asegurar un branch de feature, commitear los cambios pendientes, pushear y abrir un PR contra `main`. Si el branch quedó en conflicto con `main`, lo resuelves mergeando `main` hacia el branch.

`$ARGUMENTS` es opcional: una descripción corta del cambio o un nombre de branch sugerido (ej. `fix/login-redirect`). Úsalo como pista para el nombre del branch y el título del PR. Si está vacío, infiérelos del diff.

# Reglas duras (nunca las rompas)

- **Nunca** pushees a `main` ni a la rama por defecto. Los PR siempre salen de un branch de feature.
- **Nunca** uses `--force`, `--force-with-lease`, `rebase` ni `commit --amend` sobre algo ya pusheado.
- **Nunca** mergeas el PR ni lo cierras. Solo lo abres.
- El base del PR es **`main`**.
- Footer de commits: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Footer del cuerpo del PR: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

# Paso 0 — Leer el estado actual

```bash
git branch --show-current
git status --short
git log --oneline origin/main..HEAD 2>/dev/null
```

Determina:
- `CURRENT_BRANCH` — branch actual.
- ¿Hay cambios sin commitear? (salida de `git status --short` no vacía)
- ¿Hay commits adelante de `origin/main`? (salida de `git log` no vacía)

Si **no hay** cambios sin commitear **ni** commits adelante de `main`, detente: "No hay nada que abrir como PR — el working tree está limpio y no hay commits por delante de `main`."

# Paso 1 — Asegurar un branch de feature

Si `CURRENT_BRANCH` es `main` (o la rama por defecto):

1. Elige un nombre de branch: usa `$ARGUMENTS` si trae uno con prefijo válido (`feat/`, `fix/`, `chore/`, `refactor/`, `docs/`); si no, genera uno en kebab-case a partir del diff (ej. `fix/simulator-mobile-layout`). Prefijo según la naturaleza del cambio.
2. Trae el último `main` y crea el branch **conservando los cambios del working tree**:

```bash
git fetch origin main -q
git checkout -b <NUEVO_BRANCH>
```

(`git checkout -b` preserva los cambios sin commitear, así que no se pierde trabajo.)

Si ya estás en un branch de feature, **quédate en él** — no crees uno nuevo. Anuncia: "Usaré el branch `<branch>`."

Guarda `BRANCH` = branch final.

# Paso 2 — Commitear los cambios pendientes

Si `git status --short` tiene cambios:

1. Revisa rápido qué cambió (`git status --short` y, si ayuda, `git diff --stat`) para no incluir archivos sorpresa (logs, artefactos, `.env`). Si ves algo que claramente no debe ir, detente y avísale al usuario antes de stagear.
2. Stagea todo lo relevante:

```bash
git add -A
```

3. Commitea con un mensaje estilo Conventional Commits inferido del diff (en inglés el subject, cuerpo opcional en español o inglés). Usa HEREDOC con el footer de co-autor:

```bash
git commit -m "$(cat <<'EOF'
<tipo>: <resumen corto en imperativo>

<cuerpo opcional explicando el porqué>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

Si no había cambios sin commitear pero sí commits por delante de `main`, salta este paso (ya está todo commiteado).

# Paso 3 — (Opcional) Verificación rápida

Si el diff toca el frontend (`parabolic-lab-frontend/`), corre el build para no abrir un PR roto:

```bash
cd parabolic-lab-frontend && npm run build
```

Nota: `npm run lint` en este repo falla por un problema preexistente de config de ESLint (circular structure) — no lo uses como señal de fallo; confía en el `build`. Si el build falla por algo que introdujiste, arréglalo antes de continuar. Si el usuario pidió explícitamente saltar la verificación, sáltala.

# Paso 4 — Push

```bash
git push -u origin "$BRANCH"
```

# Paso 5 — Abrir el PR

Primero revisa si ya existe un PR abierto para el branch:

```bash
gh pr list --head "$BRANCH" --state open --json number,url --jq '.[0]'
```

- Si ya existe: no crees otro. Guarda su número y URL y salta al Paso 6.
- Si no existe, créalo contra `main`. Título estilo Conventional Commits (coincide con el commit principal). Cuerpo estructurado en español con secciones **Resumen**, **Cambios**, **Verificación**, terminando con el footer. Usa HEREDOC:

```bash
gh pr create --base main --head "$BRANCH" \
  --title "<tipo>: <resumen>" \
  --body "$(cat <<'EOF'
## Resumen

<qué resuelve este PR y por qué>

## Cambios

- <bullet 1>
- <bullet 2>

## Verificación

- <build/tests/capturas según aplique>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Si `gh` falla por auth, detente y pide al usuario `gh auth status`.

# Paso 6 — Revisar conflictos con main y resolverlos

Espera un momento y consulta el estado de merge:

```bash
gh pr view "$PR_NUMBER" --json mergeable,mergeStateStatus -q '.mergeable + " / " + .mergeStateStatus'
```

- Si es `MERGEABLE` (aunque `mergeStateStatus` sea `BLOCKED` por reglas de branch protection o revisiones requeridas): no hay conflictos. Termina.
- Si es `CONFLICTING` / `DIRTY`: resuelve mergeando `main` hacia el branch (nunca al revés, nunca rebase):

```bash
git fetch origin main -q
git merge origin/main --no-edit
git diff --name-only --diff-filter=U
```

Para cada archivo en conflicto:
1. Léelo con Read.
2. Resuélvelo respetando la **intención del branch** (lo que este PR busca lograr) y conservando lo que `main` agregó cuando no choque. Borra todos los marcadores `<<<<<<<`, `=======`, `>>>>>>>`.
3. Verifica con grep que no queden marcadores en `parabolic-lab-frontend/src` ni en el resto del árbol tocado.

Luego stagea, completa el merge, re-verifica el build si tocó frontend, y pushea:

```bash
git add -A
git commit --no-edit
git push
```

Vuelve a consultar el estado de merge para confirmar que ya es `MERGEABLE`.

# Paso 7 — Reportar al usuario

- URL y número del PR.
- Branch usado.
- Estado de merge (`MERGEABLE` / si quedó `BLOCKED` por revisiones, dilo).
- Una línea de qué incluye el PR.

# Cosas a NO hacer

- No pushear a `main`, no force-push, no rebase, no amend de commits ya pusheados.
- No mergear ni cerrar el PR.
- No `git add -A` a ciegas si ves archivos sospechosos (logs, `.env`, artefactos) — pregunta primero.
- No abrir un segundo PR si ya hay uno abierto para el branch.
