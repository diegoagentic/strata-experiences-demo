# Security · strata-experiences-demo

Este repo hereda la defensa activa establecida en `expert-catalog` (que
fue infectado dos veces con un payload obfuscado en jun 23 y jul 14 · 2026).
Ver el histórico completo en:
`strata-projects/config-evolution/expert-catalog/SECURITY.md`.

## Payload signature

Se agrega al final de archivos `.mjs`, `.cjs`, `.js`, `.ts` de config/build.
Empieza con:

```
global.o='5-2-234-du';
var _$_aeb0=(function(d,n){var g=d.length;...})("i%abiec_eli__dedme...",5050678);
```

Contiene un IIFE con `Tmx('sorcpf...')` decoder + `rEf(4950)` entry point.

## Detección

```bash
node scripts/scan-security.mjs
```

O manualmente:
```bash
grep -rE "_\$_aeb0|global\.o='5-2-234-du'|Tmx\('sorcpf|rEf\(4950\)" \
  src/ scripts/ postcss.config.* \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist
```

## Defensas activas

### 1. `scripts/scan-security.mjs`
Node scanner sin dependencias. Recorre el repo (excluye
node_modules/.git/dist), reporta hits, exit 1 si encuentra.

### 2. `.githooks/pre-commit`
Script bash que corre grep del pattern en archivos staged y aborta
commit si detecta.

**Activación una-vez-por-clone**:
```bash
git config core.hooksPath .githooks
```

### 3. Build guard en `package.json`
El script `build` prependa `node scripts/scan-security.mjs`. Vercel
detecta y falla en <5s si aparece el payload · no espera 45min al
timeout.

## Regla estricta antes de `git commit`

Si `git status` muestra Modified inesperados en:
- `postcss.config.*`
- Cualquier `.mjs`/`.cjs` en `scripts/`
- `packages/strata-ds/` (postcss, build-tokens, scripts, api ts)

**Revisar el diff completo antes de `git add`**. Nunca hacer `git add -A`
o `git add .` sin verificar.

## Vector de infección · desconocido

`node_modules` y otros repos Strata (a la fecha de este archivo) están
limpios · no es supply-chain vía NPM. Hipótesis abiertas:
- Extensión de editor con filesystem access.
- Script postinstall de tool global.
- Actor humano con acceso directo al repo.

Si `scan-security.mjs` reporta hits, seguir el procedure de limpieza
documentado en `expert-catalog/SECURITY.md` (checkout desde el último
commit limpio · `git checkout <sha> -- <file>`).
