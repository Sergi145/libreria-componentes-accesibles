# Switch

Interruptor de efecto inmediato (a diferencia de una casilla, que se
confirma con el envío de un formulario). Patrón de referencia:
[WAI-ARIA APG — Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/),
que recomienda partir de un `<input type="checkbox" role="switch">`
nativo: el teclado (Espacio) y el estado ya los da el checkbox; el rol
es lo único que cambia la semántica expuesta al lector de pantalla.
Solo CSS, sin JavaScript.

## Uso

```html
<link rel="stylesheet" href="switch.css" />

<label class="c-switch">
  <span class="c-switch__label">Modo oscuro</span>
  <span class="c-switch__control">
    <input type="checkbox" role="switch" class="c-switch__input" />
    <span class="c-switch__track" aria-hidden="true">
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
</label>
```

El `<input>` real queda oculto solo **visualmente** (`opacity: 0`),
nunca con `display: none` ni `visibility: hidden`: sigue en el flujo,
enfocable y ocupa exactamente el área del interruptor visible
(`.c-switch__track`). Ese `input` y ese `track` van como **hermanos**
dentro de `.c-switch__control` — un `<input>` no puede contener hijos,
así que el track no puede ir dentro de él; el CSS lee el estado del
input con selectores de hermano (`.c-switch__input:checked ~
.c-switch__track`), nunca al revés.

## ¿Switch o Checkbox?

- **Switch**: la acción tiene efecto **inmediato** («Modo oscuro»,
  «Notificaciones push») — cambia algo en cuanto se activa, sin
  esperar a enviar nada.
- **Checkbox**: la elección se **confirma con un envío** (un formulario,
  un paso de un asistente) — «Acepto los términos», casillas de un
  filtro que se aplican al pulsar «Buscar».

Ambos son un `<input type="checkbox">` nativo; la diferencia es de
significado (y de `role`), no de comportamiento de teclado.

## Dependencias

`switch.css` no depende de ningún otro componente. Los colores salen
de `src/tokens/tokens.css` (`--color-border` para el track apagado,
`--color-primary-500` para el encendido).

## Accesibilidad

- **`role="switch"` sobre un `<input type="checkbox">` nativo**: el
  teclado (Espacio), el foco y el estado marcado/no marcado ya los da
  el elemento; el rol es lo único añadido, tal y como recomienda la
  APG.
- **Nombre accesible por el `<label>`** que envuelve todo el
  interruptor: el texto visible es su nombre, sin `aria-label`
  adicional.
- **El estado no depende solo del color**: el tirador se desplaza (una
  pista de posición) y cambia de icono (aspa ↔ marca), no solo de
  color de fondo.
- **`forced-colors: active`**: el track y el tirador llevan un borde
  propio para seguir siendo visibles aunque el modo de alto contraste
  aplane los colores de fondo; la posición y el icono del tirador
  tampoco dependen del color.
- **Objetivo táctil**: el interruptor mide 2.75×1.5rem (44×24px), por
  encima del mínimo de 24×24px de WCAG 2.2 SC 2.5.8.
- **`prefers-reduced-motion: reduce`** desactiva la transición del
  tirador y del fondo del track.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, comprobar que cada interruptor se anuncia como
  «interruptor» (switch) con su nombre y su estado («activado»/
  «desactivado»), no como casilla.
- Con teclado: Tab hasta el interruptor y Espacio para alternarlo; en
  el deshabilitado, Tab lo salta.
- Activar el modo de alto contraste del sistema operativo (o emularlo
  con `forced-colors: active` en las herramientas de desarrollo) y
  comprobar que se distingue encendido de apagado.
- Comprobar en modo oscuro que el tirador y su icono siguen siendo
  legibles sobre el track.

## Conformidad con la guía

Revisión frente a la ficha de Switch de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _Partir de un checkbox nativo con `role="switch"`_, no de un
  `<div role="switch">` construido desde cero.
- _No transmitir el estado solo con el color_: posición del tirador +
  icono.
- _Distinguir Switch de Checkbox_ por el efecto (inmediato vs.
  confirmado con un envío), documentado más arriba.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `<div role="switch" tabindex="0">` con `aria-checked` gestionado a
  mano — se usa `<input type="checkbox" role="switch">` nativo.
- Estado solo por color — tirador desplazado + icono.
- Interruptor sin `<label>` asociado.
