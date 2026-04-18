# Instrucciones para actualizar el repositorio

Guía rápida para traer los cambios locales del `backend` y `frontend` al repositorio remoto en GitHub.

> **Idea general:** clonar el repositorio nuevo en una carpeta limpia, crear una rama, reemplazar las carpetas `parabolic-lab-backend/` y `parabolic-lab-frontend/` con las que tienen en su máquina, y subir los cambios.

---

## ⚠️ Antes de empezar — IMPORTANTE

**Nunca subir archivos con credenciales.** Asegúrense de que estos archivos **NO** se incluyan al copiar:

- `.env` (en backend y frontend)
- `.mcp.json` (contiene tokens de API)
- `.venv/`, `node_modules/`, `.next/`, `__pycache__/` (carpetas pesadas que no deben estar en git)

El `.gitignore` del repositorio ya los excluye, pero es mejor revisar dos veces.

---

## Paso 1 — Clonar el repositorio nuevo

Abran una terminal en una carpeta **diferente** a donde tienen el código actual (por ejemplo, el escritorio o `~/Documents/temp`). Esto evita mezclar el código viejo con el nuevo.

```bash
# Vayan a una carpeta temporal
cd ~/Documents
mkdir temp-repo && cd temp-repo

# Clonen el repositorio (reemplacen la URL por la del repo real)
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
```

---

## Paso 2 — Crear una rama nueva

Siempre trabajar en una rama aparte, nunca directo en `main`.

```bash
# Crear y moverse a la rama nueva
git checkout -b actualizacion-backend-frontend

# Verificar que están en la rama correcta
git branch
```

El asterisco `*` debe aparecer junto al nombre de la rama nueva.

---

## Paso 3 — Reemplazar las carpetas `backend` y `frontend`

Aquí borran las carpetas que vienen en el repo clonado y las sustituyen por las que tienen en su computadora.

### 3.1 — Borrar las carpetas viejas del repo clonado

```bash
# Dentro de la carpeta del repo clonado
rm -rf parabolic-lab-backend
rm -rf parabolic-lab-frontend
```

### 3.2 — Copiar las carpetas locales

Reemplacen la ruta `/RUTA/A/SU/CODIGO/LOCAL` por la ruta real donde tienen su proyecto (por ejemplo: `~/Documents/IPN/TRABAJO_TERMINAL/ai-agent-parabolic-lab`).

```bash
# Copiar backend (excluyendo archivos sensibles y pesados)
rsync -av \
  --exclude='.env' \
  --exclude='.venv' \
  --exclude='__pycache__' \
  --exclude='.ruff_cache' \
  --exclude='.mcp.json' \
  --exclude='.git' \
  /RUTA/A/SU/CODIGO/LOCAL/parabolic-lab-backend/ ./parabolic-lab-backend/

# Copiar frontend (excluyendo archivos sensibles y pesados)
rsync -av \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.mcp.json' \
  --exclude='.git' \
  /RUTA/A/SU/CODIGO/LOCAL/parabolic-lab-frontend/ ./parabolic-lab-frontend/
```

> **Nota:** si no tienen `rsync`, pueden usar `cp -R` pero tendrán que borrar manualmente `.env`, `.venv`, `node_modules`, etc. después de copiar.

---

## Paso 4 — Revisar qué va a subirse

**Este paso es crítico.** Antes de hacer commit, verifiquen que NO haya archivos con credenciales.

```bash
# Ver todos los archivos que git detectó como modificados/nuevos
git status

# Confirmar que .env y .mcp.json NO aparecen en la lista
git status | grep -E "\.env|\.mcp\.json"
```

**El comando de arriba NO debe devolver nada.** Si aparece algún `.env` o `.mcp.json`, **detenerse y avisar** — el `.gitignore` no está funcionando.

---

## Paso 5 — Hacer commit y subir a GitHub

```bash
# Agregar todos los cambios
git add .

# Revisar una vez más lo que está en staging
git status

# Crear el commit
git commit -m "Actualizar backend y frontend con cambios locales"

# Subir la rama a GitHub
git push -u origin actualizacion-backend-frontend
```

---

## Paso 6 — Crear un Pull Request

Una vez que subieron sus cambios a **su propia rama** (paso anterior), crean el PR:

1. Abrir el repositorio en GitHub en el navegador.
2. GitHub mostrará un aviso: *"actualizacion-backend-frontend had recent pushes — Compare & pull request"*. Hacer clic en ese botón.
3. Revisar los archivos modificados en la pestaña **Files changed**.
4. Agregar un título y descripción del PR explicando qué cambió (backend, frontend, o ambos).
5. Hacer clic en **Create pull request**.

> **No hacer merge todavía.** Cada quien sube sus cambios a su rama y abre su PR. Yo (Amaury) reviso los dos PRs juntos y les aviso si todo está bien para hacer merge.

---

## Si algo sale mal

- **Si subieron un archivo con credenciales por error:** NO intenten arreglarlo con otro commit. Avisen inmediatamente y **roten las credenciales** (generen tokens/passwords nuevos) porque ya quedaron en el historial de git.
- **Si se equivocaron de rama:** pueden cambiar de rama con `git checkout nombre-rama` antes de hacer commit.
- **Si quieren descartar todo y empezar de cero:** borren la carpeta del repo clonado y vuelvan al Paso 1.

---

## Checklist final

- [ ] Clonaron el repo en una carpeta limpia
- [ ] Crearon una rama nueva (no están en `main`)
- [ ] Reemplazaron las carpetas `backend` y `frontend`
- [ ] `git status` NO muestra `.env` ni `.mcp.json`
- [ ] Hicieron commit con un mensaje descriptivo
- [ ] Subieron la rama con `git push`
- [ ] Abrieron un Pull Request en GitHub
