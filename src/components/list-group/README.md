# List group

Contenedor visual para una lista de elementos relacionados. Sin patrón
APG propio: la semántica correcta depende de qué contiene la lista —
[Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/),
[Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) o
[Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/), según el uso.
Este componente cubre tres variantes, todas solo CSS.

## Uso

```html
<link rel="stylesheet" href="list-group.css" />
```

### Lista informativa

Sin interacción: `<ul>` + `<li>`, semántica de lista nativa.

```html
<ul class="c-list-group">
  <li class="c-list-group__item">Factura #2026-014</li>
  <li class="c-list-group__item">Factura #2026-013</li>
</ul>
```

### Enlaces de navegación

`<nav>` con nombre propio + `<a>` por elemento. El activo lleva
`aria-current="true"` y conserva su `href`.

```html
<nav aria-label="Carpetas de correo">
  <div class="c-list-group">
    <a
      class="c-list-group__item c-list-group__item--action"
      href="/bandeja"
      aria-current="true"
    >
      Bandeja de entrada
      <span class="c-list-group__badge"
        >14<span class="c-list-group__sr-text"> mensajes sin leer</span></span
      >
    </a>
    <a class="c-list-group__item c-list-group__item--action" href="/enviados"
      >Enviados</a
    >
    <!-- Deshabilitado: sin href, con aria-disabled="true" -->
    <a
      class="c-list-group__item c-list-group__item--action"
      aria-disabled="true"
      >Archivados</a
    >
  </div>
</nav>
```

### Botones de acción

`<button>` nativo por acción. El deshabilitado usa el atributo
`disabled` nativo.

```html
<div class="c-list-group">
  <button type="button" class="c-list-group__item c-list-group__item--action">
    Duplicar informe
  </button>
  <button
    type="button"
    class="c-list-group__item c-list-group__item--action"
    disabled
  >
    Eliminar informe
  </button>
</div>
```

## Combinarlo con Tabs para pestañas verticales

`List group` no trae su propia lógica de pestañas — reutiliza
`Tabs`, que ya implementa el patrón completo (roving tabindex,
`aria-selected`, activación automática/manual). Combina las clases
visuales de `List group` con los roles y el `data-tabs` de `Tabs`:

```html
<link rel="stylesheet" href="list-group.css" />
<link rel="stylesheet" href="../tabs/tabs.css" />

<div class="c-tabs c-tabs--vertical">
  <div
    class="c-list-group"
    role="tablist"
    aria-label="Ajustes de la cuenta"
    aria-orientation="vertical"
    data-tabs
  >
    <button
      type="button"
      class="c-list-group__item c-list-group__item--action"
      role="tab"
      id="tab-cuenta"
      aria-selected="true"
      aria-controls="panel-cuenta"
    >
      Cuenta
    </button>
    <button
      type="button"
      class="c-list-group__item c-list-group__item--action"
      role="tab"
      id="tab-privacidad"
      aria-selected="false"
      aria-controls="panel-privacidad"
      tabindex="-1"
    >
      Privacidad
    </button>
  </div>

  <div
    class="c-tabs__panel"
    id="panel-cuenta"
    role="tabpanel"
    aria-labelledby="tab-cuenta"
    tabindex="0"
  >
    <p>Nombre, correo electrónico y contraseña.</p>
  </div>
  <div
    class="c-tabs__panel"
    id="panel-privacidad"
    role="tabpanel"
    aria-labelledby="tab-privacidad"
    tabindex="0"
    hidden
  >
    <p>Quién puede ver tu perfil público.</p>
  </div>
</div>
```

```js
import { Tabs } from '../tabs/tabs.js';

new Tabs(document.querySelector('[data-tabs]'));
```

El `role="tablist"` y `aria-orientation="vertical"` van en el mismo
elemento que lleva `.c-list-group` y `data-tabs`: `tabs.js` selecciona
por `[role="tab"]`, no por clase, así que no hace falta ninguna clase
de `Tabs` en la lista de botones — solo sus roles y atributos ARIA. Los
paneles sí usan `.c-tabs__panel` de `Tabs`, porque el diseño de panel
no es responsabilidad de `List group`. Ver la historia «Como pestañas
verticales» en Storybook para un ejemplo completo.

## Accesibilidad

- **Elegir la semántica correcta primero**: `<ul>` si es solo
  informativa, `<nav>` + `<a>` si navega a otro recurso, `<button>` si
  ejecuta una acción en la misma página. Ninguna variante usa
  `<div onclick>`.
- **`aria-current="true"`** en el enlace activo: a diferencia de
  `Breadcrumb` y `Pagination` (que usan `aria-current="page"`), aquí
  el valor es `"true"` porque las carpetas de una lista no son
  necesariamente "páginas" — puede ser cualquier elemento
  seleccionado de un conjunto. El enlace **conserva su `href`**.
- **Contadores con texto oculto**: el número del badge (`"14"`) va
  seguido de `.c-list-group__sr-text` (`" mensajes sin leer"`), oculto
  con la técnica `.visually-hidden` de la guía (`clip`, no
  `display:none`), para que un lector de pantalla no anuncie solo un
  número sin contexto.
- **Deshabilitado según el elemento**: los enlaces deshabilitados son
  `<a>` **sin `href`** + `aria-disabled="true"` (mismo criterio que
  `Pagination`); los botones deshabilitados usan el atributo
  `disabled` nativo, que ya los saca del árbol de accesibilidad
  interactivo sin ayuda extra.
- **Objetivo táctil**: cada elemento interactivo mide al menos
  `24×24px` (`--target-size-min`).
- **Elemento activo sin depender solo del color**: además de
  `--color-primary-500`/`--color-primary-600`, lleva negrita y un
  indicador lateral (WCAG 1.4.1).
- **Foco visible hacia dentro**: el contenedor recorta las esquinas
  redondeadas con `overflow: hidden`, así que el anillo de foco de los
  elementos del borde usa `outline-offset` negativo para no cortarse.

## Pruebas manuales recomendadas

- Navegar con `Tab`: cada enlace/botón habilitado es una parada; los
  deshabilitados no lo son.
- Con NVDA/VoiceOver, comprobar que el badge se anuncia con su
  contexto completo ("14 mensajes sin leer"), no solo "14".
- En la variante de pestañas verticales: `Tab` entra una sola vez en
  el grupo; `↑`/`↓` mueven el foco entre pestañas y cambian el panel
  visible (activación automática, comportamiento heredado de `Tabs`).

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 23 (List group) de
la guía.

**«Lo que te toca a ti»** (lo que el marcado de referencia de la ficha
no resuelve solo):

- _Elegir el elemento adecuado (lista, enlaces, botones, pestañas)_:
  el componente ofrece las tres primeras variantes ya resueltas en
  `list-group.html`, y el README documenta cómo llegar a la cuarta
  (pestañas) combinándolo con `Tabs` en vez de duplicar su lógica.
- _`aria-current` en el activo y texto oculto para badges numéricos_:
  implementado en la variante de enlaces (`aria-current="true"` y
  `.c-list-group__sr-text`).

**«Errores frecuentes»** (comprobado que no se comete aquí):

- `<div class="list-group-item" onclick>` clicable sin ser botón ni
  enlace — las tres variantes usan siempre `<li>` (no interactivo),
  `<a>` (navegación) o `<button>` (acción); ninguna usa `<div>` con
  manejador de clic.

**Decisión deliberada, documentada en el spec de este componente**: no
se implementa lógica de pestañas propia dentro de `List group` — se
reutiliza `Tabs` tal cual (ver «Combinarlo con Tabs» arriba), para no
duplicar su roving tabindex ni su gestión de `aria-selected`.
