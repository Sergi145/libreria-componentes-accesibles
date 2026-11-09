# Switch

Interruptor de efecto inmediato (a diferencia de una casilla, que se
confirma con el envío de un formulario). Patrón de referencia:
[WAI-ARIA APG — Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).
Es un `<button role="switch" aria-checked="true|false">`: el botón
nativo aporta foco y activación con Enter/Espacio, y `switch.js` alterna
`aria-checked` entre `"true"` y `"false"` en cada clic.

## Uso

```html
<link rel="stylesheet" href="switch.css" />

<button type="button" role="switch" class="c-switch" aria-checked="false">
  <span class="c-switch__label">Modo oscuro</span>
  <span class="c-switch__control" aria-hidden="true">
    <span class="c-switch__track">
      <span class="c-switch__thumb">
        <svg
          class="c-switch__icon c-switch__icon--off"
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <svg
          class="c-switch__icon c-switch__icon--on"
          viewBox="0 0 24 24"
          focusable="false"
        >
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </span>
  </span>
</button>
```

```js
import { initSwitch } from './switch.js';
initSwitch(); // o: new Switch(document.querySelector('.c-switch'))
```

El estado inicial se declara con `aria-checked="true|false"`. Es la
única fuente de verdad: el CSS lee `[aria-checked="true"]`. Tras cada
cambio el botón emite un evento `change` (burbujea) con
`event.detail.checked`.

## ¿Switch o Checkbox?

- **Switch**: la acción tiene efecto **inmediato** («Modo oscuro»,
  «Notificaciones push») — cambia algo en cuanto se activa, sin
  esperar a enviar nada.
- **Checkbox**: la elección se **confirma con un envío** (un formulario,
  un paso de un asistente) — «Acepto los términos», casillas de un
  filtro que se aplican al pulsar «Buscar».

## Dependencias

`switch.js` no depende de ningún otro componente ni de `src/utils/`.
Los colores salen de `src/tokens/tokens.css` (`--color-border` para el
track apagado, `--color-primary-500` para el encendido).

## Accesibilidad

- **`<button role="switch" aria-checked>`**: elemento nativo
  enfocable; Enter y Espacio generan un clic que alterna el estado.
- **Nombre accesible por el contenido del botón** (`.c-switch__label`);
  el interruptor visual es `aria-hidden`, así que no se lee dos veces.
- **El estado no depende solo del color**: el tirador se desplaza (una
  pista de posición) y cambia de icono (aspa ↔ marca), no solo de
  color de fondo.
- **`forced-colors: active`**: el track y el tirador llevan un borde
  propio para seguir siendo visibles aunque el modo de alto contraste
  aplane los colores de fondo.
- **Foco visible**: `:focus-visible` dibuja el anillo
  `--color-focus-ring` alrededor del track.
- **Objetivo táctil**: el interruptor mide 2.75×1.5rem (44×24px), por
  encima del mínimo de 24×24px de WCAG 2.2 SC 2.5.8.
- **`prefers-reduced-motion: reduce`** desactiva la transición del
  tirador y del fondo del track.
- **Deshabilitado**: el atributo `disabled` del botón lo saca del orden
  de tabulación y bloquea el clic.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, comprobar que cada interruptor se anuncia como
  «interruptor» (switch) con su nombre y su estado («activado»/
  «desactivado»), y que el estado cambia al activarlo.
- Con teclado: Tab hasta el interruptor y Espacio/Enter para
  alternarlo; en el deshabilitado, Tab lo salta.
- Activar el modo de alto contraste del sistema operativo (o emularlo
  con `forced-colors: active` en las herramientas de desarrollo) y
  comprobar que se distingue encendido de apagado.
- Comprobar en modo oscuro que el tirador y su icono siguen siendo
  legibles sobre el track.

## Conformidad con la guía

Revisión frente a la ficha de Switch de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

- _No transmitir el estado solo con el color_: posición del tirador +
  icono.
- _Distinguir Switch de Checkbox_ por el efecto (inmediato vs.
  confirmado con un envío), documentado más arriba.
- _Estado expuesto con `aria-checked`_ y actualizado dinámicamente.
- Interruptor siempre con nombre accesible (texto del botón).
