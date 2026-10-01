# AGENTS.md

Instrucciones para agentes de IA que trabajan en este repositorio.

**Lee primero el `README.md` raíz**: ahí están el stack, la estructura,
los comandos y las convenciones de los componentes. Este archivo solo
recoge lo que no está allí.

## Reglas de trabajo

- Idioma: **español** en comentarios, README, specs y nombres de tests e
  historias. Los identificadores de código van en inglés.
- No añadas Bootstrap ni ninguna otra dependencia de ejecución.
- Reutiliza `src/utils/` y los componentes existentes (p. ej. Offcanvas
  extiende `Modal`; Dropdown y Popover usan `Disclosure` (utils) + `dismissable`)
  en vez de duplicar lógica. Importa siempre con rutas relativas.
- Cabecera JSDoc en cada `.js` de componente: nombre, patrón APG con
  enlace, decisiones no obvias y un ejemplo de uso.
- Antes de dar algo por terminado, ejecuta `npm run check` (y
  `npm run test:e2e` si tocaste marcado o estilos).

## Añadir un componente

1. Crea `src/components/<nombre>/` con los archivos de la
   [estructura](README.md#estructura) (los componentes solo CSS no
   llevan `.js` ni `.test.js`).
2. Añade sus historias a la auditoría de `e2e/accessibility.spec.js`.
3. Añade su fila a [Componentes disponibles](README.md#componentes-disponibles)
   y, si depende de `src/utils/` o de otro componente, indícalo en su
   `README.md`.
4. Pasa `npm run check` y `npm run test:e2e`.

## Checklist de accesibilidad para nuevos componentes

Al añadir un componente, revisa (y documenta en su `README.md`):

1. **Elemento semántico correcto** antes que ARIA (`<button>` en vez de
   `<div role="button">`, etc. — "no ARIA is better than bad ARIA").
2. **Patrón WAI-ARIA APG** correspondiente, si existe uno.
3. **Teclado**: todo lo que se puede hacer con ratón, se puede hacer con
   teclado; orden de tabulación lógico; sin trampas de foco no
   intencionadas.
4. **Foco visible** (`:focus-visible`) con el token `--color-focus-ring`.
5. **Contraste** ≥ 4.5:1 (texto normal) / 3:1 (texto grande, iconos,
   bordes de controles) — verificado con los tokens de color.
6. **`prefers-reduced-motion`**: cualquier animación tiene su
   alternativa reducida.
7. **Objetivo táctil** ≥ 24×24px (WCAG 2.2 SC 2.5.8).
8. **Nombre accesible**: `aria-label`/`aria-labelledby` cuando el texto
   visible no es suficiente (iconos solos, por ejemplo).
9. Tests en `*.test.js` (comportamiento/ARIA) + historia en
   `*.stories.js` (se audita automáticamente con axe en Storybook).
10. Prueba manual con **NVDA** o **VoiceOver** antes de dar el
    componente por terminado — las herramientas automáticas solo
    detectan una parte de los problemas reales.

## Tests e historias

- Vitest + jsdom: cada test construye su marcado con
  `document.body.innerHTML = ...` y lo limpia en `beforeEach`. Cubre
  roles/atributos ARIA, teclado y gestión del foco.
- Las historias generan **ids únicos por render** (con un contador),
  porque la página Docs de Storybook renderiza cada historia más de una
  vez en el mismo documento.
- Los ids de historia en `e2e/accessibility.spec.js` siguen el formato
  `componentes-<nombre>--<historia>`.

## Flujo de specs

- El trabajo se organiza en specs numerados en `specs/NN-slug.md`
  (Alcance, Modelo de datos, Plan, Criterios de aceptación, Decisiones,
  Riesgos). Cada spec se implementa en una rama `spec-NN-slug`
  (ver `specs/.spec-config.yml`).
- Respeta el **Alcance** y la sección «Fuera de alcance» del spec activo;
  no adelantes trabajo de specs futuros. Si hace falta desviarse, anótalo
  en «Decisiones» del spec.
- Marca en el propio spec los criterios de aceptación que se cumplen.
- La guía `guia-componentes-accesibles-aria-bootstrap5.pdf` (no está en
  el repo) se usa como referencia de roles, estados y teclado, **no**
  como fuente de marcado.

## Git

- Mensajes de commit en inglés con prefijo convencional: `feat:`,
  `fix:`, `style:`, `docs:`.

## Entorno

- `.claude/settings.json` incluye un hook que formatea con Prettier cada
  archivo escrito o editado por el agente.
- El desarrollo se hace en Windows; los scripts de `scripts/` usan
  `node:path` para no depender del separador de rutas.
