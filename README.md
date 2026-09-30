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
├─ utils/
│  ├─ roving-tabindex.js    # tabindex="0"/"-1" + flechas de un grupo (usa Toolbar, Tabs, Menu Button)
│  ├─ roving-tabindex.test.js
│  ├─ dismiss.js            # cierre por Esc y clic/foco fuera (usa Dropdown, Menu Button, Popover, Tooltip)
│  ├─ dismiss.test.js
│  ├─ disclosure.js         # botón aria-expanded + hidden (usa Navbar, Dropdown, Popover)
│  ├─ disclosure.test.js
│  ├─ live-region.js        # regiones vivas persistentes + announce() (usa Toast, Progress)
│  ├─ live-region.test.js
│  ├─ placement.js          # elige el lado donde un flotante no se corta (usa Tooltip)
│  ├─ placement.test.js
│  ├─ field-validation.js   # setFieldError()/clearFieldError() (usa Text field, Checkbox, Radio group)
│  └─ field-validation.test.js
└─ components/
   ├─ button/
   │  ├─ button.html        # marcado de referencia
   │  ├─ button.css
   │  ├─ button.js
   │  ├─ button.stories.js  # historias de Storybook
   │  ├─ button.test.js     # tests de comportamiento (Vitest)
   │  └─ README.md          # uso + notas de accesibilidad
   ├─ accordion/
   ├─ modal/
   ├─ close-button/         # solo CSS: sin .js ni .test.js
   ├─ toolbar/
   ├─ tabs/
   ├─ breadcrumb/           # solo CSS
   ├─ navbar/
   ├─ skip-link/            # solo CSS
   ├─ pagination/           # solo CSS
   ├─ list-group/           # solo CSS
   ├─ offcanvas/            # extiende Modal
   ├─ dropdown/             # navegación: utils/disclosure + dismiss
   ├─ menu-button/          # acciones: role="menu"
   ├─ popover/              # solo texto: utils/disclosure + dismiss
   ├─ tooltip/
   ├─ alert/                # mensajes en línea: role por variante; showAlert()
   ├─ toast/                # notificaciones: showToast(); usa utils/live-region
   ├─ progress/             # <progress> nativo; anuncia al completar (utils/live-region)
   ├─ spinner/              # solo CSS
   ├─ placeholder/          # solo CSS
   ├─ carousel/             # APG Carousel con pestañas; rotación automática opcional
   ├─ card/                 # solo CSS; variante con toda la tarjeta clicable
   ├─ badge/                # solo CSS
   ├─ scrollspy/            # aria-current con IntersectionObserver
   ├─ text-field/           # input/textarea/select + validación nativa + resumen de errores
   ├─ checkbox/             # casilla + estado mixto (Seleccionar todo)
   ├─ radio-group/          # fieldset role="radiogroup" + validación de grupo
   ├─ switch/               # solo CSS; input checkbox con role="switch"
   ├─ range/                # input range + output sincronizado
   └─ table/                # tabla semántica + ordenable por columna
e2e/
└─ accessibility.spec.js    # auditoría axe-core + tests de teclado sobre Storybook (Playwright)
```

Cada componente es autocontenido: sus archivos (`.html`, `.css` y,
cuando lo necesita, `.js`) se pueden copiar tal cual a otro proyecto.
Los componentes marcados «solo CSS» no tienen `.js` ni `.test.js`: su
`.html` de referencia ya es accesible y navegable sin JavaScript. La
única dependencia compartida opcional son los tokens de
`src/tokens/tokens.css` (colores, espaciado, anillo de foco…); si
prefieres no compartirlos, sustituye las variables `var(--...)` de cada
`.css` por valores fijos.

`src/utils/` reúne la lógica que comparten varios componentes en vez de
duplicarla:

- `rovingTabindex()` (`Toolbar`, `Tabs`, `Menu Button` y `Carousel`): mover el
  foco con flechas dentro de un grupo.
- `dismissable()` (`Dropdown`, `Menu Button`, `Popover` y `Tooltip`): cerrar con
  Esc y con clic o foco fuera.
- `placeFloating()` (`Tooltip`): colocarse donde no se corte.
- `Disclosure` (`Navbar`, `Dropdown` y `Popover`): `aria-expanded` + `hidden`.
- `announce()` e `initLiveRegions()` (`Toast` y `Progress`): dos regiones vivas
  persistentes (`role="status"` y `role="alert"`) para avisar a los lectores
  de pantalla sin mover el foco. Se crean por adelantado: una región creada
  justo al anunciar suele no leerse la primera vez.
- `setFieldError()`/`clearFieldError()` (`Text field`, `Checkbox` y
  `Radio group`): pintan o quitan el mensaje de error de un control y lo
  enlazan con `aria-describedby`, sin pisar la ayuda que ya tuviera.

Vite las empaqueta dentro del `.js` de cada componente que las usa, así que el
resultado en `dist/` sigue siendo autónomo — pero si copias la carpeta de uno
de esos componentes a otro proyecto, copia también la utilidad que importe
(`src/utils/roving-tabindex.js`, `dismiss.js`, `placement.js`,
`disclosure.js`, `live-region.js` o `field-validation.js`), o el import se
rompe. `Offcanvas` depende además de `modal/`; `Alert` y `Toast` enlazan el
CSS de `close-button/` para su botón de cierre; `Checkbox` y `Radio group`
enlazan el CSS de `text-field/` para el estilo del mensaje de error.

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

# Lint JS + lint CSS + tests, todo de una vez
npm run check

# Formatear con Prettier
npm run format

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

| Componente                                    | Patrón APG                                                                 | Notas clave                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`Button`](src/components/button)             | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                 | `<button>` nativo; `ToggleButton` con `aria-pressed`; estado de carga         |
| [`Accordion`](src/components/accordion)       | [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)           | Navegación por flechas/Home/End entre cabeceras                               |
| [`Modal`](src/components/modal)               | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)   | Sobre `<dialog>` nativo: foco atrapado y Escape gratis                        |
| [`Close button`](src/components/close-button) | —                                                                          | Solo CSS; icono decorativo + `aria-label`                                     |
| [`Toolbar`](src/components/toolbar)           | [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)               | Roving tabindex propio; subgrupos con `role="group"`                          |
| [`Tabs`](src/components/tabs)                 | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)                     | `tablist`/`tab`/`tabpanel`; activación automática o manual                    |
| [`Breadcrumb`](src/components/breadcrumb)     | [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)         | Solo CSS; separadores por `::before`, nunca como texto                        |
| [`Navbar`](src/components/navbar)             | Landmarks + Disclosure                                                     | Reutiliza `Disclosure` (utils) para el menú móvil; incluye el skip link       |
| [`Skip link`](src/components/skip-link)       | —                                                                          | Solo CSS; oculto hasta recibir el foco                                        |
| [`Pagination`](src/components/pagination)     | Landmarks + [Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/)         | Solo CSS; deshabilitados sin `href`; actual con `aria-current="page"`         |
| [`List group`](src/components/list-group)     | [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) / Tabs / Link | Solo CSS; 3 variantes (lista, enlaces, botones); combinable con `Tabs`        |
| [`Offcanvas`](src/components/offcanvas)       | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)   | Extiende `Modal`; 4 posiciones y variante responsive (`62em`)                 |
| [`Dropdown`](src/components/dropdown)         | [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)         | Lista de enlaces de navegación; sin roles de menú; Esc y clic fuera           |
| [`Menu Button`](src/components/menu-button)   | [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)       | `role="menu"` de acciones; typeahead, casillas, radios y botón partido        |
| [`Popover`](src/components/popover)           | [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)         | Solo texto; panel junto al disparador; Esc devuelve el foco                   |
| [`Tooltip`](src/components/tooltip)           | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)               | Retardo con ratón, hoverable, Esc sin mover el foco                           |
| [`Alert`](src/components/alert)               | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)                   | `role` por variante; descartable con foco devuelto; `showAlert()`             |
| [`Toast`](src/components/toast)               | [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) + regiones vivas  | `showToast()`; no mueve el foco; autohide con pausa; Esc lo cierra            |
| [`Progress`](src/components/progress)         | —                                                                          | `<progress>` nativo; indeterminado; anuncia «Completado» una vez              |
| [`Spinner`](src/components/spinner)           | —                                                                          | Solo CSS; `role="status"` con texto oculto; pulso con movimiento reducido     |
| [`Placeholder`](src/components/placeholder)   | —                                                                          | Solo CSS; bloques `aria-hidden` y contenedor `aria-busy`                      |
| [`Carousel`](src/components/carousel)         | [Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)             | Con pestañas; imágenes con `alt`; rotación opcional con Play/Pausa            |
| [`Card`](src/components/card)                 | —                                                                          | Solo CSS; variante con toda la tarjeta clicable (un solo enlace)              |
| [`Badge`](src/components/badge)               | —                                                                          | Solo CSS; texto oculto que da contexto a los números                          |
| [`Scrollspy`](src/components/scrollspy)       | Landmarks + `aria-current`                                                 | `IntersectionObserver`; nunca mueve el foco ni anuncia                        |
| [`Text field`](src/components/text-field)     | —                                                                          | `input`/`textarea`/`select`; validación nativa; resumen de errores enfocable  |
| [`Checkbox`](src/components/checkbox)         | [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)             | Estado mixto (`indeterminate`) con «Seleccionar todo»                         |
| [`Radio group`](src/components/radio-group)   | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)             | `fieldset role="radiogroup"`; validación de grupo obligatorio                 |
| [`Switch`](src/components/switch)             | [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)                 | Solo CSS; `input checkbox role="switch"`; estado por posición e icono         |
| [`Range`](src/components/range)               | —                                                                          | `input type="range"` + `output` sincronizado; `aria-valuetext`                |
| [`Table`](src/components/table)               | [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/)                   | `caption` obligatorio; envoltorio con scroll enfocable; ordenable por columna |

## Convenciones de los componentes

- **API de JS**: cada componente con JS exporta una clase
  (`new Disclosure(trigger)`) y una función `init<Nombre>s(root = document)`
  que instancia todos los elementos marcados con su atributo `data-*`
  (p. ej. `[data-disclosure]`). Las clases tienen `destroy()` para quitar
  sus listeners, y el constructor lanza un error si no recibe el elemento.
- **Estado inicial desde el HTML**: el JS lee `aria-expanded`, `hidden`,
  etc. del marcado; no hace falta configurarlo por código.
- **CSS**: clases BEM con prefijo `c-` (`.c-bloque`,
  `.c-bloque__elemento`, `.c-bloque--modificador`) y valores tomados
  siempre de los tokens `var(--...)`.
- **Estilos aparte**: ningún `.js` importa su `.css`; enlaza el CSS con
  `<link>`.
- **Mejora progresiva**: el `.html` de referencia es usable sin JS.

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

## Añadir un componente

1. Crea `src/components/<nombre>/` con los archivos de la
   [estructura](#estructura) (los componentes solo CSS no llevan `.js`
   ni `.test.js`).
2. Añade sus historias a la auditoría de `e2e/accessibility.spec.js`.
3. Añade su fila a [Componentes disponibles](#componentes-disponibles)
   y, si depende de `src/utils/` o de otro componente, indícalo en su
   `README.md`.
4. Pasa `npm run check` y `npm run test:e2e`.
