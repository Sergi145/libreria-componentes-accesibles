# SPEC 01 — Base compartida, acciones y navegación

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-09-29
> **Objetivo:** Crear la utilidad compartida de roving tabindex y los componentes de acción y navegación de la guía (disclosure, toolbar, tabs, breadcrumb, navbar, skip-link, pagination, list-group, close-button), y completar Button y Accordion según sus fichas.

## Por qué existe este spec

La guía `guia-componentes-accesibles-aria-bootstrap5.pdf` describe 25 fichas de componentes de Bootstrap 5.3 y 9 patrones APG sin equivalente en Bootstrap.
Son unos 30 componentes y no caben en un solo spec.
Se reparten en 5 specs por grupo temático:

| Spec | Grupo | Componentes |
| --- | --- | --- |
| **01 (este)** | Base + acciones y navegación | roving tabindex, Button (toggle), Close button, Toolbar, Disclosure, Accordion (revisión), Tabs, Breadcrumb, Navbar, Skip link, Pagination, List group |
| 02 | Overlays | Modal (alertdialog), Offcanvas, Dropdown/Menu button, Popover, Tooltip |
| 03 | Feedback y contenido | Alert, Toast, Progress/Spinner/Placeholder, Carousel, Card/Badge/Scrollspy |
| 04 | Formularios y datos | Campos de texto + validación, Checkbox (mixto), Radio group, Switch, Range, Table |
| 05 | Patrones APG avanzados | Combobox, Listbox, Menu/Menubar, Tree view, Grid, Feed, Spinbutton, Window splitter |

El proyecto es HTML/CSS/JS nativo sin framework.
La guía se usa **como referencia de comportamiento** (roles, estados ARIA, teclado, errores frecuentes), no como fuente de marcado.
No se añade Bootstrap: donde la guía dice «lo que ya hace Bootstrap», nuestro JS lo implementa.

## Alcance

**Dentro:**

- Utilidad `src/utils/roving-tabindex.js` con sus tests, basada en la función `rovingTabindex()` del capítulo 1 de la guía.
- **Button** (ficha 04): nueva clase `ToggleButton` con `aria-pressed`, estilos del estado pulsado, variante de enlace deshabilitado y documentación del botón solo-icono.
- **Close button** (ficha 25, parte de botón de cierre): componente solo CSS.
- **Toolbar** (ficha 05): `role="toolbar"` con roving tabindex y subgrupos `role="group"` con nombre.
- **Disclosure** (ficha 07): botón con `aria-expanded` + `aria-controls` que muestra u oculta contenido.
- **Accordion** (ficha 01): revisión contra la ficha y ajustes si falta algo.
- **Tabs** (ficha 11): `tablist`/`tab`/`tabpanel`, orientación horizontal y vertical, activación automática por defecto y manual opcional.
- **Breadcrumb** (ficha 03): componente solo CSS.
- **Skip link** (capítulo 2 y ficha 12): componente solo CSS.
- **Navbar** (ficha 12): landmark `<nav>` con nombre, `aria-current="page"` y botón hamburguesa que reutiliza `Disclosure`.
- **Pagination** (ficha 13): componente solo CSS.
- **List group** (ficha 23): variantes de lista, de enlaces y de botones, solo CSS.
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Todos los componentes de los specs 02–05 (ver la tabla anterior).
- Utilidades que solo necesitan esos specs: trampa de foco, anunciador de regiones vivas y generador de ids. Cada una se crea en el spec que la usa por primera vez.
- Variante de List group como pestañas con JS propio. Se documenta cómo combinar su CSS con `Tabs`.
- Dropdowns dentro de la Navbar (van con Dropdown en el spec 02).
- Paginación dinámica por AJAX (anuncio del cambio y foco en los resultados).
- Carga diferida de paneles de Tabs.
- Añadir Bootstrap como dependencia.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/roving-tabindex.js
// Devuelve una función que elimina los listeners.
export function rovingTabindex(container, selector, {
  orientation = 'horizontal', // 'horizontal' | 'vertical' | 'both'
  loop = true,                // envoltura al llegar al final
  onFocusChange,              // (el) => void, opcional (lo usa Tabs para la activación automática)
} = {}) { /* … */ return destroy; }

// src/components/button/button.js (se añade, Button no cambia)
export class ToggleButton { constructor(el); get pressed(); set pressed(v); toggle(); destroy(); }
export function initToggleButtons(root = document); // [data-toggle-button]

// src/components/toolbar/toolbar.js
export class Toolbar { constructor(el); destroy(); }  // orientación leída de aria-orientation
export function initToolbars(root = document);        // [data-toolbar]

// src/components/disclosure/disclosure.js
export class Disclosure { constructor(trigger); get expanded(); open(); close(); toggle(); destroy(); }
export function initDisclosures(root = document);     // [data-disclosure]

// src/components/tabs/tabs.js
export class Tabs {
  constructor(el, { activation = 'automatic' /* | 'manual' */ } = {});
  select(tabOrIndex); destroy();
}
export function initTabs(root = document, options = {}); // [data-tabs]

// src/components/navbar/navbar.js
export class Navbar { constructor(el); destroy(); } // usa Disclosure en .c-navbar__toggle
export function initNavbars(root = document);       // [data-navbar]
```

Convenciones (las mismas que Button, Accordion y Modal):

- Clases CSS con prefijo `c-` y BEM: `c-tabs__tab`, `c-toolbar__group`…
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en los atributos ARIA (`aria-expanded`, `aria-selected`, `aria-pressed`) y en `hidden`, sin copia en variables.
- Todos los textos por defecto están en español (`aria-label="Cerrar"`, «Saltar al contenido principal», «Anterior», «Siguiente»).
- Estilos solo con los tokens de `src/tokens/tokens.css`.
- Si faltan tokens, se añaden a `tokens.css` en el paso que los necesite.

Estructura de carpetas resultante:

```
src/utils/
├─ roving-tabindex.js
└─ roving-tabindex.test.js
src/components/
├─ button/          (se modifica)
├─ accordion/       (se revisa)
├─ close-button/    html, css, stories, README               — solo CSS
├─ toolbar/         html, css, js, stories, test, README
├─ disclosure/      html, css, js, stories, test, README
├─ tabs/            html, css, js, stories, test, README
├─ breadcrumb/      html, css, stories, README               — solo CSS
├─ skip-link/       html, css, stories, README               — solo CSS
├─ navbar/          html, css, js, stories, test, README
├─ pagination/      html, css, stories, README               — solo CSS
└─ list-group/      html, css, stories, README               — solo CSS
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos del `README.md` raíz.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad roving tabindex.**
   Crear `src/utils/roving-tabindex.js` y `roving-tabindex.test.js`.
   Tests: un solo elemento con `tabindex="0"`, flechas según orientación, Home/End, envoltura, se saltan los `disabled` y los ocultos, el clic actualiza el elemento activo y `destroy()` quita los listeners.
2. **Button: ToggleButton.**
   Añadir `ToggleButton` e `initToggleButtons` a `button.js` sin cambiar `Button`.
   CSS del estado `[aria-pressed="true"]` y de `a.c-button[aria-disabled="true"]` (sin `href`).
   Ampliar `button.html`, `button.stories.js` (historias `Toggle`, `SoloIcono` y `EnlaceDeshabilitado`), `button.test.js` y el README.
3. **Close button.**
   Crear `src/components/close-button/`: `<button type="button" class="c-close-button" aria-label="Cerrar">` con SVG `aria-hidden="true"` y objetivo ≥ 24×24 px.
   Historia y README.
4. **Toolbar.**
   Crear `src/components/toolbar/` con `role="toolbar"` + `aria-label`, subgrupos `role="group"` + `aria-label` y la variante vertical con `aria-orientation`.
   El JS usa `rovingTabindex`.
   El README explica que dos botones sueltos no necesitan toolbar: basta un `role="group"`.
   Tests de teclado.
5. **Disclosure.**
   Crear `src/components/disclosure/`.
   Alterna `aria-expanded` y `hidden` del elemento de `aria-controls`.
   El README documenta `<details>/<summary>` como alternativa sin JS.
   Tests: clic, Enter/Espacio (nativos del `<button>`) y estado inicial leído del HTML.
6. **Accordion: revisión.**
   Comparar `src/components/accordion/` con la ficha 01.
   Añadir solo lo que falte.
   Añadir al README el apartado «Conformidad con la guía».
   Los tests actuales siguen pasando sin cambios.
7. **Tabs.**
   Crear `src/components/tabs/`: `role="tablist"` + nombre, `role="tab"` en `<button>`, `role="tabpanel"` + `aria-labelledby` + `tabindex="0"`.
   Admite `aria-orientation="vertical"`.
   Con activación automática, el foco selecciona la pestaña.
   Con activación manual, la seleccionan Enter/Espacio.
   Tests de ambos modos y de las dos orientaciones.
   El README distingue pestañas de navegación entre páginas (`<nav>` + `aria-current`, sin roles de pestaña).
8. **Breadcrumb.**
   Crear `src/components/breadcrumb/`: `<nav aria-label="Ruta de navegación">` + `<ol>`, separadores con `::before` y `aria-current="page"` en el último elemento.
9. **Skip link.**
   Crear `src/components/skip-link/`: enlace visualmente oculto que aparece al recibir el foco y apunta a `<main id="contenido" tabindex="-1">`.
10. **Navbar.**
    Crear `src/components/navbar/`: `<nav aria-label="Principal">`, logotipo con `alt` que indica el destino, enlace activo con `aria-current="page"` y botón hamburguesa con `aria-label="Menú"`.
    `navbar.js` importa `Disclosure` de `../disclosure/disclosure.js`.
    En ancho de escritorio el menú se muestra siempre.
    La historia incluye el skip link y reflow a 320 px.
11. **Pagination.**
    Crear `src/components/pagination/`: `<nav aria-label="Paginación de resultados">`, `aria-current="page"`, `aria-label="Página N"` en los números.
    Flechas con `aria-hidden` + texto `.visually-hidden` («Anterior» / «Siguiente»).
    Los deshabilitados no tienen `href` y llevan `aria-disabled="true"`.
12. **List group.**
    Crear `src/components/list-group/` con tres variantes: lista `<ul>`, enlaces dentro de `<nav>` con `aria-current="true"` en el activo y botones.
    Contadores con texto `.visually-hidden`.
    El README muestra cómo usarlo como pestañas verticales con `Tabs`.
13. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js`.
    Añadir tests e2e de teclado para Toolbar (flechas), Tabs (flechas + activación) y Disclosure (Enter).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `src/utils/` en «Estructura».

## Criterios de aceptación

- [ ] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [ ] `npm run lint:html` termina sin errores.
- [ ] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [ ] `npm run build` genera `dist/<componente>/` para los 11 componentes de este spec más los 3 existentes. Los de JS tienen `.js`, `.css` y `.html`; los de solo CSS tienen `.css` y `.html`.
- [ ] Ningún `.js` de `dist/` contiene `import` de rutas relativas: las utilidades y `Disclosure` quedan empaquetadas dentro.
- [ ] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía».
- [ ] `rovingTabindex`: en cualquier momento, exactamente un elemento del grupo tiene `tabindex="0"`.
- [ ] Toolbar: Tab entra y sale en una sola parada. ←/→ (↑/↓ en vertical) mueven el foco con envoltura. Home/End van al primero y al último.
- [ ] ToggleButton: un clic alterna `aria-pressed` entre `"true"` y `"false"` sin cambiar el texto del botón.
- [ ] Enlace-botón deshabilitado: no tiene `href` y no recibe foco con Tab.
- [ ] Disclosure: Enter y Espacio alternan `aria-expanded`. El contenido cerrado tiene `hidden` y no es alcanzable con Tab.
- [ ] Tabs automáticas: → mueve el foco y selecciona la siguiente pestaña, con `aria-selected="true"` y su panel visible.
- [ ] Tabs manuales: → mueve el foco sin cambiar `aria-selected`. Enter selecciona la pestaña.
- [ ] Tabs: desde la pestaña activa, Tab lleva el foco a su panel.
- [ ] Navbar: en un viewport de 320 px, el botón «Menú» alterna `aria-expanded` y muestra u oculta los enlaces. El documento no tiene scroll horizontal.
- [ ] Skip link: es el primer elemento enfocable de su historia, es visible al recibir el foco y al activarlo el foco pasa a `<main>`.
- [ ] Breadcrumb: los separadores no aparecen como texto en el DOM.
- [ ] Pagination y Breadcrumb: la página actual lleva `aria-current="page"`.
- [ ] Ningún componente del spec usa texto en inglés en `aria-label` ni en texto oculto.
- [ ] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible`.
- [ ] Los tests existentes de Button, Accordion y Modal siguen pasando sin modificar sus aserciones.

## Decisiones

- **Sí:** HTML/CSS/JS nativo, con la guía como referencia de comportamiento. Mantiene la filosofía del README (sin lock-in, cada componente copiable).
- **No:** añadir Bootstrap 5.3. Rompería la independencia de los componentes y el sistema de tokens.
- **Sí:** repartir la guía en 5 specs por grupo, empezando por base + navegación. Un spec único tendría más de 100 pasos y no sería verificable.
- **No:** un spec por componente. Demasiado proceso repetido para componentes pequeños.
- **Sí:** los patrones del capítulo 4 (Combobox, Tree…) en el último spec (05). Son los más complejos y se benefician de tener las utilidades ya probadas.
- **Sí:** utilidades en `src/utils/`, importadas desde los componentes. Vite las empaqueta en cada `.js` de `dist/`, así que el resultado compilado sigue siendo independiente.
- **No:** copiar las utilidades en cada componente. Duplicaría el código y los bugs.
- **Sí:** crear cada utilidad en el spec que la usa por primera vez. Este spec solo necesita `rovingTabindex`.
- **Sí:** completar Button y Accordion según su ficha sin romper su API. `ToggleButton` es una clase nueva, no un modo de `Button`.
- **Sí:** Modal se revisa en el spec 02, junto con los demás overlays.
- **Sí:** componentes solo CSS sin `.js` ni `.test.js`. `copy-assets.mjs` ya copia su `.css` y `.html` a `dist/` (`cpSync` crea la carpeta), y axe valida su marcado a través de la historia.
- **Sí:** nombres de carpeta del patrón APG en inglés (`disclosure`, `toolbar`, `tabs`…). Es coherente con `button`, `accordion` y `modal`.
- **No:** nombres de Bootstrap (`collapse`, `button-group`). Atan la librería a un vocabulario de framework que no usamos.
- **Sí:** Toolbar y grupo de botones en una sola carpeta `toolbar/`. El grupo es solo `role="group"` + nombre y la guía los trata en la misma ficha.
- **Sí:** Tabs con activación automática por defecto y `{ activation: 'manual' }` opcional, como recomienda la guía para paneles que tardan en cargar.
- **Sí:** Navbar reutiliza `Disclosure`, y el skip link es un componente propio reutilizable en cualquier página.
- **No:** Navbar autocontenido. Duplicaría la lógica de disclosure.
- **Sí:** List group solo CSS (lista, enlaces, botones). Para pestañas verticales se combina con `Tabs`.
- **No:** JS propio de pestañas en List group. Duplicaría Tabs.
- **Sí:** los 6 archivos por componente con JS, más su historia en la auditoría axe e2e y su fila en el README raíz.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| jsdom no calcula layout (`offsetParent` siempre `null`), así que el filtro de visibles de `rovingTabindex` de la guía fallaría en Vitest | Filtrar por `hidden`/`disabled` y `closest('[hidden]')` en lugar de `offsetParent`. Lo cubre un test de la utilidad. |
| La entrada de Vite `src/components/*/*.js` no incluye `src/utils/`, y un import roto no se detectaría hasta el build | El criterio de aceptación de `dist/` sin imports relativos lo comprueba. |
| Los componentes solo CSS no tienen tests unitarios, así que un marcado incorrecto solo se detecta con axe | Todos entran en `e2e/accessibility.spec.js`. `npm run lint:html` valida su `.html`. |
| Navbar depende de `disclosure/`: copiar solo la carpeta `navbar/` rompe el import en `src` | El README de Navbar lo indica. El build de `dist/navbar/` es autónomo porque Vite empaqueta Disclosure. |
| Las herramientas automáticas solo detectan una parte de los problemas | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist del README raíz). |

## Lo que **no** entra en este spec

- Overlays: Modal (alertdialog), Offcanvas, Dropdown, Popover, Tooltip → SPEC 02.
- Feedback y contenido: Alert, Toast, Progress, Carousel, Card/Badge/Scrollspy → SPEC 03.
- Formularios y tablas → SPEC 04.
- Combobox, Listbox, Menu/Menubar, Tree, Grid, Feed, Spinbutton, Window splitter → SPEC 05.
- Trampa de foco, anunciador de regiones vivas y generador de ids.
- Paginación por AJAX, carga diferida de pestañas y dropdowns en la navbar.
- Bootstrap como dependencia.

Cada uno de ellos, si llega, va en su propio spec.
