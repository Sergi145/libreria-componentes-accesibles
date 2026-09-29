# SPEC 02 — Overlays

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-29
> **Objetivo:** Crear la utilidad compartida de cierre (Esc y clic fuera) y los componentes superpuestos de la guía (Offcanvas, Dropdown de navegación, Menu Button, Popover y Tooltip), y añadir al Modal la variante alertdialog.

## Por qué existe este spec

Es el segundo de los 5 specs en los que se reparte `guia-componentes-accesibles-aria-bootstrap5.pdf` (ver la tabla del SPEC 01).
Cubre las fichas 08 (Dropdown), 09 (Modal), 10 (Offcanvas), 14 (Popover) y 15 (Tooltip).

Todos estos componentes comparten dos problemas: cerrarse con Esc o al hacer clic fuera, y devolver el foco a un sitio lógico.
Los diálogos (Modal, Offcanvas) se apoyan en `<dialog>.showModal()`, que ya resuelve la trampa de foco, Esc, `inert` y la devolución del foco.
Los flotantes no modales (menú, popover, tooltip) no usan la Popover API nativa: el cierre lo gestiona nuestro JS con una utilidad común.

## Alcance

**Dentro:**

- Utilidad `src/utils/dismiss.js` con sus tests: avisa del cierre por Esc y por clic o foco fuera de un panel.
- **Modal** (ficha 09): variante alertdialog sobre el mismo `<dialog>` y la misma clase `Modal`, sin cambiar su API. Revisión contra la ficha y apartado «Conformidad con la guía».
- **Offcanvas** (ficha 10): `<dialog>` abierto con `showModal()`, cuya clase extiende `Modal`. Posiciones inicio, fin, arriba y abajo, y variante responsive.
- **Dropdown de navegación** (ficha 08, caso a): lista de enlaces sin roles de menú, sobre `Disclosure` + `dismiss`.
- **Menu Button** (ficha 08, caso b): `role="menu"`/`menuitem`/`none`, flechas con `rovingTabindex`, Inicio/Fin, Esc, Tab, ↑ en el botón abre al final, typeahead, `menuitemcheckbox`/`menuitemradio` y botón partido.
- **Popover** (ficha 14): solo contenido de texto, con comportamiento de disclosure, colocado junto al disparador en el DOM.
- **Tooltip** (ficha 15): retardo al mostrar con ratón, hoverable (WCAG 1.4.13), Esc sin mover el foco, envoltorio enfocable para botones deshabilitados y sin doble lectura cuando el texto coincide con el `aria-label`.
- Posicionamiento de los flotantes solo con CSS: envoltorio `position: relative` y cuatro posiciones fijas por clase modificadora.
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Todos los componentes de los specs 03–05.
- Popover con contenido interactivo (diálogo no modal). El README de Popover remite a Modal o Disclosure.
- Offcanvas no modal (página de fondo activa, `show()` en lugar de `showModal()`).
- Dropdowns dentro de la Navbar. `navbar/` no se modifica en este spec.
- Flechas ↑/↓ entre los enlaces del Dropdown de navegación.
- Volteo automático de Popover, Dropdown y Menu Button (anchor positioning, Floating UI). Solo el Tooltip se coloca solo, con `src/utils/placement.js`, sin dependencias (cambio posterior a la aprobación, pedido por el usuario).
- Popover API nativa (`popover` / `popovertarget`).
- Menús anidados (submenús) y Menubar → SPEC 05.
- Trampa de foco propia: `<dialog>` la resuelve.
- Añadir Bootstrap o cualquier dependencia de ejecución.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/dismiss.js
// Llama a onDismiss(reason) cuando procede cerrar `panel`. Devuelve destroy().
// Esc: si hay que cerrar, hace preventDefault() + stopPropagation()
// para que un <dialog> contenedor no se cierre también.
export function dismissable(panel, {
  trigger,             // elemento que abre el panel; un clic en él no cuenta como «fuera»
  onDismiss,           // (reason: 'escape' | 'outside') => void
  escape = true,       // escucha Esc en document
  outside = true,      // pointerdown o focusin fuera de panel y trigger
} = {}) { /* … */ return destroy; }

// src/components/modal/modal.js (se amplía, la API no cambia)
// Con role="alertdialog" en el <dialog>: el clic en el backdrop NO cierra.
export class Modal { constructor(dialogEl); open(); close(returnValue); get isAlert(); }

// src/components/offcanvas/offcanvas.js
export class Offcanvas extends Modal { constructor(dialogEl); destroy(); }
export function initOffcanvas(root = document); // [data-offcanvas-trigger="ID"] → <dialog id="ID">

// src/components/dropdown/dropdown.js  (caso a: navegación)
export class Dropdown { constructor(trigger); get expanded(); open(); close({ returnFocus = false } = {}); toggle(); destroy(); }
export function initDropdowns(root = document); // [data-dropdown]

// src/components/menu-button/menu-button.js  (caso b: acciones)
export class MenuButton {
  constructor(button);
  get expanded();
  open({ focus = 'first' /* | 'last' */ } = {});
  close({ returnFocus = true } = {});
  destroy();
}
export function initMenuButtons(root = document); // [data-menu-button]

// src/components/popover/popover.js
export class Popover { constructor(trigger); get expanded(); open(); close({ returnFocus = false } = {}); toggle(); destroy(); }
export function initPopovers(root = document); // [data-popover]

// src/components/tooltip/tooltip.js
export class Tooltip { constructor(trigger, { delay = 300 } = {}); get visible(); show(); hide(); destroy(); }
export function initTooltips(root = document, options = {}); // [data-tooltip]
```

Convenciones (las mismas que en el SPEC 01):

- Clases CSS con prefijo `c-` y BEM: `c-offcanvas--start`, `c-menu-button__menu`, `c-tooltip__bubble`…
- Posición de los flotantes con modificadores: `--top`, `--bottom` (por defecto), `--start`, `--end`. Propiedades lógicas (`inset-inline-start`) para respetar `dir="rtl"`.
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en los atributos ARIA (`aria-expanded`, `aria-checked`) y en `hidden`, sin copia en variables.
- El marcado del tooltip y del popover está en el HTML (no se genera por JS) y va justo después de su disparador.
- Todos los textos por defecto están en español (`aria-label="Cerrar"`, «Más opciones de…»).
- Estilos solo con los tokens de `src/tokens/tokens.css`. Si faltan tokens (sombra, `z-index`, duración), se añaden en el paso que los necesite.
- Breakpoint del Offcanvas responsive: `62em`, el mismo valor en el CSS y en el `matchMedia` del JS.

Estructura de carpetas resultante:

```
src/utils/
├─ roving-tabindex.js
├─ dismiss.js
└─ dismiss.test.js
src/components/
├─ modal/           (se modifica)
├─ offcanvas/       html, css, js, stories, test, README   — importa Modal
├─ dropdown/        html, css, js, stories, test, README   — importa Disclosure + dismiss
├─ menu-button/     html, css, js, stories, test, README   — importa rovingTabindex + dismiss
├─ popover/         html, css, js, stories, test, README   — importa Disclosure + dismiss
└─ tooltip/         html, css, js, stories, test, README   — importa dismiss
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos del `README.md` raíz.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad dismiss.**
   Crear `src/utils/dismiss.js` y `dismiss.test.js`.
   Tests: Esc llama a `onDismiss('escape')` y cancela el evento, un `pointerdown` fuera llama a `onDismiss('outside')`, un clic en el `trigger` o dentro del panel no llama, el foco que sale a otro elemento llama a `onDismiss('outside')`, `escape: false` y `outside: false` desactivan cada caso, y `destroy()` quita los listeners.
2. **Modal: variante alertdialog.**
   Con `role="alertdialog"` en el `<dialog>`, `_onBackdropClick` no cierra.
   Añadir el getter `isAlert`.
   Nueva historia `AlertDialog` con `aria-describedby` al texto y `autofocus` en el botón de cerrar (×): es el primer elemento del DOM y su `value` es `"cancel"`, la misma acción menos destructiva que pide la ficha.
   Tests nuevos del alertdialog; los existentes pasan sin cambiar sus aserciones.
   README: variante alertdialog, foco inicial en diálogos largos (título con `tabindex="-1"` y `autofocus`), modales anidados y apartado «Conformidad con la guía».
3. **Offcanvas: base.**
   Crear `src/components/offcanvas/` con `<dialog class="c-offcanvas c-offcanvas--start" tabindex="-1" aria-labelledby>` y botón de cierre `aria-label="Cerrar filtros"`.
   `Offcanvas` extiende `Modal`.
   El disparador lleva `aria-controls`.
   Modificadores `--start`, `--end`, `--top` y `--bottom` con propiedades lógicas.
   Animación de entrada desactivada con `prefers-reduced-motion`.
   El README indica envolver los enlaces de navegación en `<nav aria-label>`.
4. **Offcanvas: variante responsive.**
   Modificador `c-offcanvas--responsive`: a partir de `62em` se muestra como contenido normal y su disparador se oculta.
   Si el panel está abierto al cruzar el breakpoint, el JS lo cierra (`matchMedia`).
   Historia a 320 px y a escritorio.
5. **Tooltip.**
   Crear `src/components/tooltip/`: envoltorio `.c-tooltip`, disparador con `aria-describedby` y `<span role="tooltip" hidden>`.
   Al enfocar se muestra al momento; con el ratón, tras `delay` ms.
   El ratón puede pasar del disparador al tooltip sin que se cierre.
   Se oculta al perder el foco o al salir el ratón del envoltorio.
   Esc lo oculta sin mover el foco (vía `dismissable` con `outside: false`).
   Si el texto del tooltip coincide con el `aria-label` del disparador, el JS quita `aria-describedby`.
   Variante con `<span tabindex="0">` alrededor de un botón deshabilitado.
   Tests con temporizadores falsos de Vitest.
6. **Popover.**
   Crear `src/components/popover/`: envoltorio `.c-popover`, `<button>` con `aria-expanded` + `aria-controls` y panel `hidden` justo después.
   `popover.js` importa `Disclosure` y añade `dismissable`: Esc cierra y devuelve el foco al botón, y el clic fuera cierra sin moverlo.
   El README advierte de no poner controles dentro y remite a Modal o Disclosure.
7. **Dropdown de navegación.**
   Crear `src/components/dropdown/`: `<button aria-expanded aria-controls>` + `<ul>` de enlaces, con `aria-current="page"` en el activo y sin roles de menú.
   `dropdown.js` importa `Disclosure` y añade `dismissable`: Esc cierra y devuelve el foco al botón, y el clic o el foco fuera cierran.
   El README explica cuándo usar Dropdown y cuándo Menu Button.
8. **Menu Button: base.**
   Crear `src/components/menu-button/`: botón con `aria-haspopup="menu"`, `aria-expanded` y `aria-controls`, y `<ul role="menu" aria-labelledby>` con `<li role="none">` y `role="menuitem"` en `<button>`.
   Flechas, Inicio/Fin y envoltura con `rovingTabindex(menu, '[role^="menuitem"]', { orientation: 'vertical' })`.
   Enter, Espacio y ↓ en el botón abren y enfocan el primero; ↑ abre y enfoca el último.
   Esc cierra y devuelve el foco al botón.
   Tab cierra y deja que el foco siga su orden.
   Activar un `menuitem` cierra y devuelve el foco al botón.
9. **Menu Button: typeahead.**
   Una tecla imprimible enfoca el siguiente elemento cuyo texto empieza por esa letra, dando la vuelta al final.
   Sin búfer de varias letras.
10. **Menu Button: casillas y radios.**
    `menuitemcheckbox` alterna `aria-checked` sin cerrar el menú.
    `menuitemradio` dentro de un `role="group"` con nombre marca uno y desmarca los demás del grupo, sin cerrar.
    Estilo del indicador marcado con CSS a partir de `aria-checked`.
11. **Menu Button: botón partido.**
    Variante `.c-menu-button--split`: botón de acción principal + botón de flecha con `aria-label="Más opciones de <acción>"`.
    `MenuButton` se engancha al botón de flecha.
    Historia propia.
12. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js`.
    Añadir tests e2e de teclado para Offcanvas (Esc + devolución del foco), Menu Button (↓, flechas, Esc) y Tooltip (Esc sin mover el foco).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `dismiss.js` en «Estructura» y en el párrafo de `src/utils/`.

## Criterios de aceptación

- [ ] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [ ] `npm run lint:html` termina sin errores.
- [ ] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [ ] `npm run build` genera `dist/<componente>/` con `.js`, `.css` y `.html` para `offcanvas`, `dropdown`, `menu-button`, `popover` y `tooltip`, además de los 12 componentes existentes.
- [ ] Ningún `.js` de `dist/` contiene `import` de rutas relativas: `dismiss`, `rovingTabindex`, `Disclosure` y `Modal` quedan empaquetados dentro.
- [ ] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía». El README de Modal también lo tiene.
- [ ] `dismissable`: tras `destroy()`, ni Esc ni un clic fuera llaman a `onDismiss`.
- [ ] Alertdialog: un clic en el backdrop no lo cierra, Esc sí, y al abrir el foco está en el botón de cerrar (×).
- [ ] Alertdialog: el `<dialog>` tiene `role="alertdialog"`, `aria-labelledby` y `aria-describedby` apuntando a elementos que existen.
- [ ] Los tests existentes de Modal siguen pasando sin modificar sus aserciones.
- [ ] Offcanvas: al abrir, Tab y Mayús+Tab no sacan el foco del panel. Esc lo cierra y el foco vuelve al disparador.
- [ ] Offcanvas responsive: a 1280 px de ancho el contenido es visible sin pulsar nada y el disparador no se muestra. A 320 px el disparador abre el panel y el documento no tiene scroll horizontal.
- [ ] Menu Button: Enter y ↓ en el botón abren el menú con `aria-expanded="true"` y el foco en el primer `menuitem`. ↑ abre con el foco en el último.
- [ ] Menu Button: ↓/↑ recorren los elementos con envoltura, Inicio/Fin van al primero y al último y se saltan los deshabilitados.
- [ ] Menu Button: Esc cierra el menú y el foco vuelve al botón. Tab cierra el menú y el foco pasa al siguiente elemento de la página.
- [ ] Menu Button: con el foco en «Duplicar», pulsar «e» enfoca «Eliminar».
- [ ] Menu Button: activar un `menuitemcheckbox` alterna `aria-checked` y el menú sigue abierto. En un grupo de `menuitemradio`, exactamente uno tiene `aria-checked="true"`.
- [ ] Botón partido: el botón de flecha tiene un nombre accesible que empieza por «Más opciones de».
- [ ] Menu Button dentro de un Modal abierto: Esc cierra el menú y el Modal sigue abierto.
- [ ] Dropdown de navegación: no contiene ningún `role="menu"` ni `role="menuitem"`. Esc cierra y devuelve el foco al botón. Un clic fuera lo cierra.
- [ ] Popover: Enter alterna `aria-expanded`. Esc lo cierra con el foco en el disparador. En el DOM, el panel es el siguiente hermano del disparador.
- [ ] Tooltip: al enfocar el disparador el tooltip es visible sin esperar. Con el ratón aparece a los 300 ms, no antes.
- [ ] Tooltip: mover el ratón del disparador al tooltip no lo oculta. Esc lo oculta y `document.activeElement` sigue siendo el disparador.
- [ ] Tooltip: ningún tooltip contiene elementos enfocables y ninguno se engancha a un elemento no enfocable (salvo el envoltorio `tabindex="0"` de la variante deshabilitada).
- [ ] Tooltip en un botón cuyo `aria-label` coincide con el texto: el botón no tiene `aria-describedby`.
- [ ] Ningún componente del spec usa texto en inglés en `aria-label` ni en texto oculto.
- [ ] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible`.
- [ ] Todas las animaciones nuevas se desactivan con `prefers-reduced-motion: reduce`.

## Decisiones

- **Sí:** alertdialog como variante del Modal, activada por `role="alertdialog"` en el HTML. Reutiliza todo y no cambia la API.
- **No:** componente `alert-dialog/` propio. Duplicaría casi toda la lógica del Modal.
- **Sí:** el alertdialog no se cierra con clic en el backdrop. Pide una respuesta explícita; Esc sigue cerrándolo para no crear una trampa de teclado.
- **Sí:** foco inicial del alertdialog en el botón de cerrar (×), no en «Cancelar». Preferencia explícita del usuario: es el primer elemento del DOM, y sigue cumpliendo «la acción menos destructiva» de la ficha porque su `value` también es `"cancel"`. Solo afecta al alertdialog; el Modal por defecto (con `autofocus` en «Confirmar») es código de un spec anterior y queda fuera de este cambio.
- **No:** `autofocus` en «Cancelar» para el alertdialog, pese a que así lo describía la primera versión de este spec. Se corrige tras la revisión del usuario.
- **Sí:** Offcanvas sobre `<dialog>` + `showModal()`, con `Offcanvas extends Modal`. Trampa de foco, Esc, `inert` y devolución del foco nativos.
- **No:** Offcanvas sobre `<div>` con trampa de foco propia. Más código y más riesgo que la solución nativa.
- **No:** Offcanvas autocontenido sin importar Modal. Duplicaría el cierre por backdrop; Vite empaqueta Modal en `dist/offcanvas/`.
- **Sí:** `tabindex="-1"` en el `<dialog>` de Modal y de Offcanvas (las dos variantes de alertdialog incluidas). Lo pide explícitamente la tabla de roles y propiedades de las fichas 09 y 10. Con `<dialog>` nativo casi nunca hace falta en la práctica (`showModal()` ya enfoca el primer control focable sin `autofocus`), pero es la red de seguridad para un diálogo sin ningún control focable en el cuerpo, y coincide con la recomendación general de la APG de que el contenedor de un rol `dialog` sea focable. Se aplica también a Modal (no solo a Offcanvas) porque comparten el mismo `<dialog>` y esta spec ya toca `modal.js`/`modal.html`/`modal.stories.js` en el paso 2.
- **Sí:** Offcanvas con cuatro posiciones y variante responsive. **No:** variante no modal, por los riesgos de foco que la propia ficha señala.
- **No:** Popover API nativa. Se prefiere JS propio para controlar `aria-expanded`, el foco y el comportamiento en todos los navegadores.
- **Sí:** utilidad `src/utils/dismiss.js` compartida por Dropdown, Menu Button, Popover y Tooltip. Mismo criterio que `rovingTabindex` en el SPEC 01: se crea en el spec que la usa por primera vez.
- **Sí:** `dismissable` cancela Esc cuando cierra algo. Evita que un `<dialog>` contenedor se cierre a la vez (WCAG 1.4.13 y comportamiento esperado de la APG).
- **Sí:** posicionamiento solo con CSS y envoltorio relativo, con cuatro posiciones fijas. Sin dependencias.
- **No:** CSS anchor positioning. Soporte aún desigual entre navegadores.
- **No:** Floating UI. Rompe la regla de «sin dependencias» por componente.
- **Sí:** Dropdown (navegación) y Menu Button (acciones) como dos carpetas distintas. Son dos patrones APG distintos y la guía insiste en no confundirlos.
- **Sí:** Dropdown y Popover reutilizan `Disclosure`. **No:** reimplementar `aria-expanded` + `hidden`.
- **No:** flechas ↑/↓ en el Dropdown de navegación. El patrón disclosure se recorre con Tab; las flechas crean expectativas de menú.
- **Sí:** Menu Button reutiliza `rovingTabindex` para flechas, Inicio/Fin y deshabilitados. Son comportamientos ya probados en el SPEC 01.
- **No:** lógica de foco propia en Menu Button (todos los `menuitem` con `tabindex="-1"` y el foco movido a mano). Duplicaría `rovingTabindex`.
- **Sí:** Menu Button completo: ↑ abre al final, typeahead de una letra, `menuitemcheckbox`/`menuitemradio` y botón partido.
- **No:** typeahead con búfer de varias letras. La ficha solo pide una letra.
- **No:** dropdowns dentro de la Navbar en este spec. `navbar/` no se toca.
- **Sí:** Popover solo de texto, con comportamiento de disclosure. **No:** variante interactiva (diálogo no modal); para eso está Modal.
- **No:** `aria-describedby` en el disparador del Popover. El contenido sigue al botón en el orden de lectura y se leería dos veces.
- **Sí:** marcado de Tooltip y Popover escrito en el HTML junto al disparador, no generado al final del `<body>`. Conserva el orden de lectura y de Tab, y funciona sin JS.
- **Sí:** Tooltip con retardo de 300 ms solo con ratón, hoverable, Esc sin mover el foco, envoltorio para deshabilitados y sin doble lectura.

## Riesgos

| Riesgo                                                                                                                                | Mitigación                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Esc en un menú o tooltip dentro de un `<dialog>` cierra también el diálogo                                                            | `dismissable` hace `preventDefault()` + `stopPropagation()` cuando cierra. Lo cubre un test e2e (Menu Button dentro de Modal).  |
| jsdom implementa `<dialog>` de forma parcial (`showModal()`, `inert`, trampa de foco)                                                 | Los tests unitarios comprueban atributos y llamadas. La trampa de foco y la devolución del foco se verifican en Playwright.     |
| Un `<dialog>` cerrado mostrado como contenido normal (Offcanvas responsive) sigue exponiendo el rol `dialog`                          | La historia de escritorio pasa por axe. El README documenta el comportamiento y la prueba manual con lector de pantalla.        |
| Sin volteo automático, un flotante puede salirse del viewport cerca de los bordes                                                     | Cuatro posiciones por clase para que el autor elija. El README lo advierte. El volteo queda fuera de alcance.                   |
| El envoltorio `<span tabindex="0">` del tooltip en deshabilitados puede ser marcado por axe o `html-validate`                         | La historia entra en la auditoría. Si falla, se ajusta el marcado (p. ej. `role="group"` con nombre) antes de cerrar el paso 5. |
| `menuitemradio` y `rovingTabindex` dependen de que los `role="group"` no queden `hidden`                                              | Test unitario con un grupo de radios dentro del menú abierto.                                                                   |
| Offcanvas, Dropdown, Popover y Menu Button dependen de `modal/`, `disclosure/` o `src/utils/`: copiar solo su carpeta rompe el import | Cada README lo indica. `dist/` es autónomo porque Vite empaqueta las dependencias (criterio de aceptación).                     |
| Las herramientas automáticas solo detectan una parte de los problemas                                                                 | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist del README raíz).                             |

## Lo que **no** entra en este spec

- Feedback y contenido: Alert, Toast, Progress, Carousel, Card/Badge/Scrollspy → SPEC 03.
- Formularios y tablas → SPEC 04.
- Combobox, Listbox, Menu/Menubar, submenús, Tree, Grid, Feed, Spinbutton, Window splitter → SPEC 05.
- Popover interactivo (diálogo no modal) y Offcanvas no modal.
- Dropdowns dentro de la Navbar.
- Flechas en el Dropdown de navegación.
- Volteo automático de flotantes, Popover API nativa y trampa de foco propia.
- Bootstrap o cualquier otra dependencia de ejecución.

Cada uno de ellos, si llega, va en su propio spec.
