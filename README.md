# Librería de componentes accesibles

![Licencia](https://img.shields.io/badge/licencia-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![WCAG](https://img.shields.io/badge/WCAG-2.2%20AA-informational)

Componentes de UI construidos con **HTML, CSS y JavaScript nativos**
(sin framework). Cada componente vive en su propia carpeta, es
independiente del resto y se puede copiar o importar por separado.

## Por qué este stack

- **Sin framework de UI**: los componentes son solo HTML semántico +
  CSS + JS con módulos ES. Nada que aprender para usarlos, ni lock-in.
- **Mejora progresiva**: cada componente funciona (aunque de forma más
  básica) sin JavaScript; el JS añade interacción, gestión de foco y
  estado ARIA dinámico.
- **Basado en patrones WAI-ARIA APG**: cada componente sigue el patrón
  correspondiente de la [Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).
- **Vite** compila cada componente como un punto de entrada
  independiente (`dist/<componente>/<componente>.js` + `.css`).
- **Storybook** documenta y sirve de catálogo visual, con el addon de
  accesibilidad (axe-core) auditando cada historia en vivo.
- **Vitest** para tests de comportamiento (teclado, ARIA, foco) y
  **Playwright + axe-core** para auditoría de accesibilidad end-to-end.

## Estructura

```
src/
├─ tokens/tokens.css        # design tokens: color, tipografía, espaciado, foco…
├─ styles/base.css          # reset mínimo opcional (no requerido por los componentes)
└─ components/
   ├─ button/
   │  ├─ button.html        # marcado de referencia
   │  ├─ button.css
   │  ├─ button.js
   │  ├─ button.stories.js  # historias de Storybook
   │  ├─ button.test.js     # tests de comportamiento (Vitest)
   │  └─ README.md          # uso + notas de accesibilidad
   ├─ accordion/
   └─ modal/
e2e/
└─ accessibility.spec.js    # auditoría axe-core sobre Storybook (Playwright)
```

Cada componente es autocontenido: sus tres archivos (`.html`, `.css`,
`.js`) se pueden copiar tal cual a otro proyecto. La única dependencia
compartida opcional son los tokens de `src/tokens/tokens.css` (colores,
espaciado, anillo de foco…); si prefieres no compartirlos, sustituye las
variables `var(--...)` de cada `.css` por valores fijos.

## Empezar

```bash
npm install

# Catálogo de componentes con Storybook (con auditoría de accesibilidad)
npm run dev

# Tests de comportamiento
npm run test
npm run test:watch

# Auditoría de accesibilidad end-to-end (requiere Storybook corriendo,
# o Playwright lo levanta solo la primera vez)
npx playwright install   # una sola vez, descarga los navegadores
npm run test:e2e

# Lint
npm run lint       # JS
npm run lint:css   # CSS
npm run lint:html  # HTML (incluye reglas de accesibilidad)

# Compilar la librería (dist/<componente>/<componente>.{js,css})
npm run build
```

## Uso rápido

Cada componente se apoya en HTML semántico; el CSS lo da estilo y el JS
(opcional) añade comportamiento dinámico. Ejemplo con `Button`:

```html
<link rel="stylesheet" href="src/tokens/tokens.css" />
<link rel="stylesheet" href="src/components/button/button.css" />

<button type="button" class="c-button c-button--primary">
  Guardar cambios
</button>

<script type="module">
  import { Button } from './src/components/button/button.js';

  // Opcional: solo si necesitas un estado de "cargando" accesible
  const instance = new Button(document.querySelector('.c-button'));
  instance.setLoading(true, 'Guardando…');
</script>
```

Consulta el `README.md` de cada componente (enlazado en la tabla de abajo)
para ver sus variantes, atributos ARIA y notas de accesibilidad.

### Usar un componente en otro proyecto

No hace falta instalar la librería entera: cada componente es autocontenido
y se puede copiar tal cual.

1. Copia la carpeta del componente, por ejemplo `src/components/button/`
   (solo necesitas `button.html`, `button.css` y, si usas el estado de
   carga, `button.js`).
2. Copia también `src/tokens/tokens.css` (o sustituye las variables
   `var(--...)` del `.css` copiado por valores fijos si no quieres esa
   dependencia compartida).
3. Importa el CSS y, si aplica, el JS como módulo ES en tu proyecto.

## Componentes disponibles

| Componente | Patrón APG | Notas clave |
|---|---|---|
| [`Button`](src/components/button) | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | `<button>` nativo; estado de carga accesible opcional |
| [`Accordion`](src/components/accordion) | [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | Navegación por flechas/Home/End entre cabeceras |
| [`Modal`](src/components/modal) | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Sobre `<dialog>` nativo: foco atrapado y Escape gratis |

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
