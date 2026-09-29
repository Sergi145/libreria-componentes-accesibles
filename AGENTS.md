# AGENTS.md

Guía para agentes de IA (y personas) que trabajan en este repositorio.
El `README.md` raíz describe la librería para quien la usa; este archivo
recoge lo que hace falta saber para **modificarla** sin romper sus
convenciones.

## Qué es este proyecto

Librería de componentes de UI accesibles (WCAG 2.2 AA) en **HTML, CSS y
JavaScript nativos**, sin framework ni dependencias de ejecución. Cada
componente sigue el patrón correspondiente de la
[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) y es autocontenido:
su carpeta se puede copiar tal cual a otro proyecto.

- Idioma del proyecto: **español** (comentarios, README, specs, nombres
  de tests e historias). Los identificadores de código van en inglés.
- Node ≥ 18, módulos ES (`"type": "module"`).

## Comandos

```bash
npm install
npm run dev          # Storybook en http://localhost:6006 (con addon a11y)
npm run test         # Vitest (jsdom) — tests de comportamiento
npm run test:e2e     # Playwright + axe-core sobre Storybook (lo levanta solo)
npm run lint         # ESLint
npm run lint:css     # Stylelint
npm run lint:html    # html-validate (incluye reglas de accesibilidad)
npm run check        # lint + lint:css + test — ejecútalo antes de dar algo por terminado
npm run build        # dist/<componente>/<componente>.{js,css,html}
npm run format       # Prettier
```

La primera vez que se ejecutan los e2e hace falta `npx playwright install`.

## Estructura

```
src/
├─ tokens/tokens.css      # design tokens (color, espaciado, foco, tamaño táctil…)
├─ styles/base.css        # reset opcional; los componentes no dependen de él
├─ utils/                 # lógica compartida, cada una con su .test.js
│  ├─ roving-tabindex.js  # rovingTabindex(): flechas dentro de un grupo
│  ├─ dismiss.js          # dismissable(): cierre por Esc y clic/foco fuera
│  └─ placement.js        # placeFloating(): lado donde un flotante no se corta
└─ components/<nombre>/
   ├─ <nombre>.html       # marcado de referencia (funciona sin JS)
   ├─ <nombre>.css
   ├─ <nombre>.js         # opcional: solo si el componente necesita JS
   ├─ <nombre>.stories.js # historias de Storybook
   ├─ <nombre>.test.js    # obligatorio si existe <nombre>.js
   └─ README.md           # uso, API, teclado, ARIA y notas de accesibilidad
e2e/accessibility.spec.js # auditoría axe de cada historia + tests de teclado
specs/                    # specs numerados (NN-slug.md) que guían el trabajo
scripts/                  # build por componente y copia de assets a dist/
```

## Convenciones de código

### JavaScript

- Cada componente con JS exporta una **clase** (`new Disclosure(trigger)`)
  y una función **`init<Nombre>s(root = document)`** que instancia todas
  las coincidencias de un selector `data-*` (p. ej. `[data-disclosure]`).
- El constructor lanza un `Error` con mensaje en español si no recibe el
  elemento requerido. Las clases exponen `destroy()` para quitar listeners.
- El estado inicial se lee del HTML (`aria-expanded`, `hidden`…); el JS
  no debe exigir atributos que el marcado de referencia no traiga.
- Cabecera de archivo con JSDoc: nombre del componente, patrón APG con
  enlace, decisiones no obvias y un ejemplo de uso.
- Reutiliza `src/utils/` y los componentes existentes (Offcanvas extiende
  `Modal`; Dropdown y Popover usan `Disclosure` + `dismissable`) en vez
  de duplicar lógica. Importa siempre con rutas relativas.
- Ningún `.js` de componente importa su propio `.css` (los estilos se
  enlazan aparte con `<link>`); las historias sí lo importan.
- Prettier: comillas simples, `trailingComma: es5`, 80 columnas.

### CSS

- Clases BEM con prefijo `c-`: `.c-bloque`, `.c-bloque__elemento`,
  `.c-bloque--modificador`.
- Usa siempre tokens `var(--...)` de `src/tokens/tokens.css`; no
  introduzcas colores ni medidas sueltas si existe un token.
- Foco visible con `:focus-visible` y
  `outline: var(--focus-ring-width) solid var(--color-focus-ring)`.
- Objetivo táctil mínimo `var(--target-size-min)` (24×24 px).
- Toda animación tiene alternativa bajo `prefers-reduced-motion: reduce`.

### HTML y accesibilidad

- Elemento semántico nativo antes que ARIA (`<button>`, `<dialog>`,
  `<nav>`, `<details>`…). «No ARIA is better than bad ARIA».
- Mejora progresiva: el `.html` de referencia debe ser usable sin JS.
- Revisa la **checklist de accesibilidad** del `README.md` raíz al crear
  o cambiar un componente, y documenta el resultado en su `README.md`.

### Tests

- Vitest + jsdom. Cada test construye su marcado con
  `document.body.innerHTML = ...` y lo limpia en `beforeEach`.
- Cubre roles/atributos ARIA, teclado y gestión del foco; los nombres de
  `describe`/`it` van en español.
- Las historias generan **ids únicos por render** (contador) porque la
  página Docs de Storybook renderiza cada historia más de una vez.

## Al añadir o cambiar un componente

1. Crea/actualiza los archivos de su carpeta siguiendo la estructura de
   arriba (los componentes «solo CSS» no llevan `.js` ni `.test.js`).
2. Añade sus historias a `e2e/accessibility.spec.js` (id de historia
   `componentes-<nombre>--<historia>`).
3. Añade o actualiza su fila en la tabla «Componentes disponibles» y, si
   cambia, el árbol de «Estructura» del `README.md` raíz.
4. Si depende de `src/utils/` o de otro componente, indícalo en su
   `README.md` (quien copie la carpeta necesita saberlo).
5. Ejecuta `npm run check` (y `npm run test:e2e` si tocaste marcado o
   estilos) y comprueba que pasa.

## Flujo de specs

- El trabajo se organiza en specs numerados en `specs/NN-slug.md`
  (Alcance, Modelo de datos, Plan, Criterios de aceptación, Decisiones,
  Riesgos). Cada spec se implementa en una rama `spec-NN-slug`
  (ver `specs/.spec-config.yml`).
- Respeta el **Alcance** y la sección «Fuera de alcance» del spec activo;
  no adelantes trabajo de specs futuros. Si hace falta desviarse, anótalo
  en «Decisiones» del spec.
- Marca los criterios de aceptación cumplidos en el propio spec.
- La guía de referencia de comportamiento es
  `guia-componentes-accesibles-aria-bootstrap5.pdf` (no está en el repo):
  se usa para roles, estados y teclado, **no** como fuente de marcado.
  No se añade Bootstrap ni ninguna otra dependencia de ejecución.

## Git

- Mensajes de commit en inglés con prefijo convencional: `feat:`,
  `fix:`, `style:`, `docs:`, `test:`, `refactor:`.
- No subas `dist/`, `playwright-report/` ni `test-results/` (están en
  `.gitignore`).

## Entorno

- `.claude/settings.json` incluye un hook que formatea con Prettier cada
  archivo escrito o editado por el agente.
- El desarrollo se hace en Windows; los scripts de `scripts/` usan
  `node:path` para no depender del separador de rutas.
