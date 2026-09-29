# Offcanvas

Panel que entra desde un lateral de la pantalla (filtros, menú de
navegación, carrito…). Accesiblemente es un diálogo modal — salvo que
decidas dejar la página de fondo interactiva, lo que queda fuera del
alcance de este componente (ver «Lo que **no** hace este componente»)
— así que se apoya en el mismo `<dialog>.showModal()` que
[`Modal`](../modal): `Offcanvas extends Modal` y hereda gratis:

- **Atrapado de foco**: `Tab`/`Shift+Tab` no salen del panel.
- **Cierre con `Escape`**, con devolución del foco al disparador.
- **El resto de la página queda inerte** para la tecnología de
  asistencia mientras el panel está abierto.

Lo único que añade Offcanvas es la posición (pegada a un borde en vez
de centrada) y `destroy()`, que `Modal` no tiene.

## Uso

```html
<link rel="stylesheet" href="../close-button/close-button.css" />
<link rel="stylesheet" href="offcanvas.css" />

<button type="button" data-offcanvas-trigger="filtros" aria-controls="filtros">
  Abrir filtros
</button>

<dialog
  id="filtros"
  class="c-offcanvas c-offcanvas--start"
  tabindex="-1"
  aria-labelledby="filtros-title"
>
  <form method="dialog" class="c-offcanvas__content">
    <header class="c-offcanvas__header">
      <h2 id="filtros-title" class="c-offcanvas__title">Filtros</h2>
      <button type="submit" class="c-close-button" aria-label="Cerrar filtros">
        ×
      </button>
    </header>
    <div class="c-offcanvas__body">
      <p>…</p>
    </div>
  </form>
</dialog>
```

```js
import { initOffcanvas } from './offcanvas.js';

// Conecta automáticamente cada [data-offcanvas-trigger="ID"] con su
// <dialog id="ID">.
initOffcanvas();
```

O de forma manual con la clase `Offcanvas`:

```js
import { Offcanvas } from './offcanvas.js';

const panel = new Offcanvas(document.querySelector('#filtros'));
document
  .querySelector('[data-offcanvas-trigger]')
  .addEventListener('click', () => {
    panel.open();
  });
```

El botón de cerrar es un `<button type="submit">` dentro del
`<form method="dialog">`, igual que en Modal: el propio navegador
cierra el panel sin necesidad de JS.

## Posición

Cuatro modificadores, uno obligatorio en cada `<dialog>`:

| Clase                  | Borde                                                     |
| ---------------------- | --------------------------------------------------------- |
| `.c-offcanvas--start`  | Inicio (izquierda en `dir="ltr"`, derecha en `dir="rtl"`) |
| `.c-offcanvas--end`    | Fin (derecha en `dir="ltr"`, izquierda en `dir="rtl"`)    |
| `.c-offcanvas--top`    | Superior                                                  |
| `.c-offcanvas--bottom` | Inferior                                                  |

`--start`/`--end` usan propiedades lógicas (`inset-inline-start`,
`inset-inline-end`), así que un `dir="rtl"` en la página los invierte
automáticamente sin ningún cambio de clase.

## Variante responsive

Con la clase adicional `c-offcanvas--responsive`, a partir de `62em` de
ancho de viewport el panel deja de comportarse como un diálogo modal y
pasa a mostrarse como contenido normal, siempre visible, sin backdrop
ni trampa de foco — útil para un menú lateral que en escritorio quieres
ver siempre, y en móvil abrir bajo demanda.

```html
<button
  type="button"
  class="c-offcanvas__trigger"
  data-offcanvas-trigger="filtros"
  aria-controls="filtros"
>
  Abrir filtros
</button>

<dialog
  id="filtros"
  class="c-offcanvas c-offcanvas--start c-offcanvas--responsive"
  tabindex="-1"
  aria-labelledby="filtros-title"
>
  …
</dialog>
```

- **`.c-offcanvas__trigger`** en el botón disparador: se oculta a
  partir del mismo breakpoint (`62em`), porque en escritorio el panel
  ya está siempre visible y no hace falta abrirlo.
- **El breakpoint es fijo (`62em`)** y vive en dos sitios que deben
  coincidir: la media query de `offcanvas.css` y `RESPONSIVE_QUERY` en
  `offcanvas.js`. Si cambias uno, cambia el otro.
- **Si el panel estaba abierto y ensanchas la ventana** hasta cruzar el
  breakpoint, el JS lo cierra con `matchMedia()` — si no, se quedaría
  con el foco atrapado y el resto de la página inerte aunque
  visualmente ya no pareciera un diálogo modal.
- **Limitación conocida**: por encima del breakpoint, el `<dialog>`
  sigue existiendo en el DOM y sigue siendo un elemento `<dialog>` — un
  lector de pantalla que lo encuentre navegando por landmarks lo seguirá
  anunciando como «diálogo», aunque visualmente sea contenido normal,
  siempre visible y sin backdrop. Bootstrap tiene el mismo compromiso
  con `.offcanvas-lg` (una `<div role="dialog">` a la que deja de
  aplicarle los atributos de diálogo por JS, pero que sigue en el DOM
  con ese rol). Si tu caso de uso necesita que el contenido deje de
  anunciarse como diálogo en escritorio, no uses `--responsive`: pon el
  contenido directamente en la página y muestra el offcanvas modal solo
  en móvil con tu propia condición.

## Accesibilidad

- **`aria-labelledby`** en el `<dialog>` apunta al `<h2>` del título;
  obligatorio para que el lector de pantalla anuncie de qué trata el
  panel al abrirse.
- **`tabindex="-1"` en el propio `<dialog>`**: la ficha lo pide para
  poder enfocar el panel en sí. Con `<dialog>` nativo casi nunca hace
  falta (`showModal()` ya enfoca el botón de cerrar sin necesidad de
  `autofocus`, al ser el primer control focable), pero queda como red
  de seguridad si algún día un panel no tiene ningún control focable en
  el cuerpo.
- **`aria-controls`** en el disparador apunta al `id` del `<dialog>`
  que abre.
- **Nombre del botón de cerrar en español y específico**: usa
  `aria-label="Cerrar filtros"` (o el nombre del panel concreto), no un
  «Cerrar» genérico — ayuda quien navega por lector de pantalla saltando
  entre botones con el mismo nombre.
- **Enlaces de navegación dentro del panel**: envuélvelos en
  `<nav aria-label="…">` en vez de dejarlos sueltos en
  `.c-offcanvas__body`, igual que en cualquier otra parte de la página.
  Un offcanvas no cambia las reglas de landmarks del resto del sitio.
- **Patrón de referencia**: como Offcanvas es un diálogo modal, aplica
  el mismo patrón que Modal — [WAI-ARIA APG — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Pruebas manuales recomendadas

- Abrir el panel y comprobar que `Tab` no se escapa a la página de
  detrás (ver la nota sobre Storybook en el README de Modal si lo
  pruebas dentro de una historia).
- Cerrar con `Escape` y comprobar que el foco vuelve al botón que abrió
  el panel.
- Repetir con las cuatro posiciones: el contenido no se corta ni
  produce scroll horizontal en la página.
- Con NVDA/VoiceOver, confirmar que se anuncia el título del panel al
  abrirse.
- En la variante `--responsive`, comprobar en 320px que el disparador
  abre el panel, y en un ancho de escritorio (≥62em) que el contenido
  ya es visible sin pulsar nada y el disparador no se muestra.
- En la variante `--responsive`, abrir el panel en móvil y ensanchar la
  ventana hasta escritorio: el panel se cierra solo (sin foco atrapado
  ni backdrop) al cruzar el breakpoint.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 10 (Offcanvas) de la
guía.

**«Lo que te toca a ti»**:

- _Nombre del panel y del botón de cierre en español_: hecho;
  `aria-labelledby` en el panel y `aria-label="Cerrar filtros"` en el
  botón (no un «Cerrar» genérico).
- _`tabindex="-1"` para poder enfocar el panel_: la tabla de roles y
  propiedades de la ficha lo pide explícitamente. El `<dialog>` lo
  lleva (ver «Accesibilidad» más arriba).
- _Si el fondo sigue activo (`scroll`/`backdrop` no modal), comprobar
  que el foco y lo que anuncia el lector son coherentes_: no aplica —
  este componente solo implementa el modo modal (ver «Lo que no hace
  este componente»); el modo con la página de fondo activa queda fuera
  de su alcance.
- _Envolver los enlaces de navegación en `<nav aria-label>`_:
  documentado en «Accesibilidad» más arriba.
- _Equivalente a `.offcanvas-lg` (contenido normal por encima de un
  breakpoint)_: en Bootstrap esto lo da la clase gratis; aquí se
  implementa a mano con `.c-offcanvas--responsive` + `matchMedia()` en
  `offcanvas.js` (ver «Variante responsive» más arriba), con la misma
  limitación de que el `<dialog>` sigue anunciándose como diálogo.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Hamburguesa sin nombre accesible — el disparador de ejemplo usa texto
  visible («Abrir filtros»); si tu disparador es solo icono, dale
  `aria-label` (ver el componente `Button`).
- Panel que se cierra al perder el foco sin devolverlo a ningún sitio —
  no aplica: Offcanvas solo se cierra con Escape, el botón de cierre o
  el backdrop, nunca al perder el foco, y en los tres casos el foco
  vuelve al disparador (nativo de `<dialog>.showModal()`).

## Lo que **no** hace este componente

- **Modo no modal** (página de fondo activa mientras el panel está
  abierto). Fuera del alcance de este spec — ver `specs/02-overlays.md`.
- **Dejar de anunciarse como diálogo por encima del breakpoint
  responsive**: el `<dialog>` sigue en el DOM con su semántica nativa.
  Ver la limitación conocida en «Variante responsive» más arriba.
