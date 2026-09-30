# Popover

Panel flotante de **solo texto** que se abre desde un botón. La APG no
define un patrón «popover»: con contenido de texto se comporta como un
[Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), y
así está implementado (reutiliza `Disclosure` y añade `dismissable`).

El marcado va siempre en el HTML: un envoltorio `.c-popover` con el
`<button>` y, **justo después**, el panel `hidden`.

> **Dependencias:** `popover.js` importa `../../utils/disclosure.js` y
> `../../utils/dismiss.js`. Si copias la carpeta a otro proyecto, copia
> también esas dos. `dist/popover/` es autónomo (Vite las empaqueta).

## Uso

```html
<link rel="stylesheet" href="popover.css" />

<div class="c-popover">
  <button
    type="button"
    class="c-popover__trigger"
    data-popover
    aria-expanded="false"
    aria-controls="popover-iban"
  >
    ¿Qué es el IBAN?
  </button>
  <div id="popover-iban" class="c-popover__panel" hidden>
    <p>Código de 24 caracteres que identifica tu cuenta bancaria.</p>
  </div>
</div>
```

```js
import { initPopovers } from './popover.js';

initPopovers();
```

O con la clase: `new Popover(button)`, con `open()`, `close({ returnFocus })`,
`toggle()`, `destroy()` y el getter `expanded`.

## Comportamiento

- **Enter / Espacio** (o clic): abre y cierra; alterna `aria-expanded` y
  `hidden`.
- **`Escape`**: lo cierra y devuelve el foco al botón (WCAG 1.4.13:
  descartable). Solo intercepta `Escape` mientras está abierto, y lo
  cancela para no cerrar un `<dialog>` que lo contenga.
- **Clic o foco fuera**: lo cierra sin mover el foco.

## Posición

Por defecto, debajo y alineado al inicio. Modificadores del panel:

| Clase                      | Posición  |
| -------------------------- | --------- |
| _(ninguno)_                | Abajo     |
| `.c-popover__panel--top`   | Arriba    |
| `.c-popover__panel--start` | Al inicio |
| `.c-popover__panel--end`   | Al final  |

Usan propiedades lógicas (respetan `dir="rtl"`). **No hay volteo
automático:** cerca de los bordes del viewport el panel puede salirse;
elige la posición que quepa.

## Accesibilidad

- **Solo texto.** No pongas enlaces, botones ni campos dentro. Si
  necesitas contenido interactivo, usa [`Modal`](../modal) o
  un botón que muestre u oculte contenido con `aria-expanded`
  (`src/utils/disclosure.js` o `<details>`).
- **El disparador es un `<button>`**, nunca un `<span>` o un icono sin foco.
- **Sin `aria-describedby`** en el disparador: el panel sigue al botón en
  el orden de lectura y se leería dos veces.
- Si el contenido es largo, considera un botón de mostrar/ocultar (Disclosure) o un Modal.

## Pruebas manuales recomendadas

- Tab hasta el botón; Enter y Espacio abren y cierran el panel.
- Con el panel abierto, `Escape` lo cierra y el foco sigue en el botón.
- Clic fuera: se cierra.
- Con NVDA/VoiceOver: se anuncia «contraído/expandido» y, al abrir, el
  siguiente elemento en la lectura es el texto del panel.
- Zoom al 200 % y `dir="rtl"`: el panel sigue visible y bien colocado.

## Conformidad con la guía

Ficha 14 de `guia-componentes-accesibles-aria-bootstrap5.pdf`.

**«Lo que te toca a ti»:**

- _`aria-expanded`, cierre con Esc y `container` cerca del disparador_:
  `aria-expanded` lo gestiona `Disclosure`; `Escape` cierra vía
  `dismissable`; el panel está en el HTML justo tras el botón (equivale
  a `container`).
- _Evitar `data-bs-trigger="hover"` solo_: no hay apertura por hover; se
  abre con teclado y ratón por igual.
- _Contenido largo o interactivo → collapse o modal_: advertido en
  «Accesibilidad»; fuera de alcance de este componente.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Popovers en `<span>` o iconos no enfocables: el disparador es siempre
  un `<button>`.
- Enlaces en un popover al final del `<body>`: el panel va junto al
  disparador y no admite controles.
