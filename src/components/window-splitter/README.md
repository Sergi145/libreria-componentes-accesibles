# Window splitter

Separador arrastrable (y manejable con teclado) entre dos paneles.
Implementa el patrón [WAI-ARIA APG — Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/window-splitter/).

## Uso

```html
<link rel="stylesheet" href="window-splitter.css" />

<div class="c-splitter c-splitter--horizontal">
  <div class="c-splitter__pane" id="nav-principal">
    <h3>Navegación</h3>
    <p>Panel principal: su tamaño lo controla el separador.</p>
  </div>
  <div
    class="c-splitter__separator"
    role="separator"
    aria-controls="nav-principal"
    aria-label="Cambiar tamaño del panel de navegación"
    aria-orientation="vertical"
    data-splitter
  ></div>
  <div class="c-splitter__pane">
    <h3>Contenido</h3>
    <p>Panel secundario: ocupa el espacio que deja el principal.</p>
  </div>
</div>
```

```js
import { WindowSplitter, initWindowSplitters } from './window-splitter.js';

const splitter = new WindowSplitter(document.querySelector('[data-splitter]'));
splitter.value; // → number: porcentaje (0–100) del panel principal
splitter.value = 30; // acota a aria-valuemin/max; no dispara el evento
splitter.collapsed; // → boolean
splitter.collapse();
splitter.restore();
splitter.destroy();

document
  .querySelector('[data-splitter]')
  .addEventListener('splitter:change', (event) => {
    console.log(event.detail.value);
  });

// O, para inicializar todos los [data-splitter] de la página:
initWindowSplitters();
```

El valor es un **porcentaje del panel principal (0–100), no píxeles**:
no depende del tamaño de la ventana. `WindowSplitter` añade
`tabindex="0"` y los `aria-value*` al construirse — el `.html` de
referencia no los lleva a mano, porque sin JS no tiene sentido una
parada de tabulación que no hace nada. El valor se aplica con la
variable `--c-splitter-position` en `.c-splitter`: la misma regla
sirve para las dos variantes, porque `flex-basis` se mide en el eje
principal de `flex-direction` (ancho en `--horizontal`, alto en
`--vertical`), sin reglas aparte.

### Dos variantes

| Variante (clase del contenedor)        | Paneles     | `aria-orientation` del separador            | Teclas que lo mueven |
| -------------------------------------- | ----------- | ------------------------------------------- | -------------------- |
| `c-splitter--horizontal` (por defecto) | Lado a lado | `"vertical"` (línea divisoria vertical)     | `←`/`→`              |
| `c-splitter--vertical`                 | Apilados    | `"horizontal"` (línea divisoria horizontal) | `↑`/`↓`              |

`aria-orientation` describe la orientación del **separador** (la
línea divisoria), no la de los paneles — por eso la variante de
paneles lado a lado usa `"vertical"` y la apilada, `"horizontal"`.

## Comportamiento

- **`←`/`→`** (separador vertical) o **`↑`/`↓`** (horizontal) suman o
  restan `data-step` (por defecto, `5`).
- **Inicio/Fin** van a `aria-valuemin`/`aria-valuemax`.
- **Enter** colapsa el panel principal al mínimo; si ya está
  colapsado, restaura el valor que tenía justo antes de colapsar (no
  un valor fijo).
- El valor se acota a `aria-valuemin`/`aria-valuemax`.
- `splitter:change` (con `detail.value`) se dispara solo si el valor
  cambia de verdad.
- `aria-valuemin`/`aria-valuemax`/`aria-valuenow` se leen del HTML si
  ya están escritos (por si el autor quiere un rango o un valor
  inicial distinto); si no, se asumen `0`/`100`/`50` — el mismo 50 %
  que ya tienen los paneles por la variable CSS antes de que exista
  el JS.
- **Arrastrar con el ratón o el dedo** (`pointerdown`/`pointermove`/
  `pointerup`) mueve el separador: calcula el porcentaje sobre
  `getBoundingClientRect()` del contenedor, en el eje que corresponda
  a `aria-orientation` (X para `"vertical"`, Y para `"horizontal"`).
  `pointerdown` ya salta a esa posición y da el foco real al
  separador, igual que al activarlo con teclado.
  `setPointerCapture()` mantiene el arrastre aunque el puntero salga
  de la franja del separador; `pointerup`/`pointercancel` lo
  terminan.

## Accesibilidad

- **`role="separator"`** con `tabindex="0"` (puesto por JS) y
  `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`
  («30 %»).
- **`aria-controls`** apunta al panel principal; **`aria-label`**
  describe qué panel cambia de tamaño.
- **Zona de agarre** de `--target-size-min` (24×24px) con una línea
  fina centrada: toda la franja es interactiva (también al arrastrar),
  no solo la línea visible. `touch-action: none` evita que el
  navegador haga scroll de la página al arrastrar en pantallas
  táctiles.
- **Sin JavaScript**: el separador no es interactivo (sin `tabindex`
  ni `aria-value*`) y los paneles quedan al 50 %, el valor inicial de
  `--c-splitter-position`.
- **Patrón de referencia**: [WAI-ARIA APG — Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/window-splitter/).

## Pruebas manuales recomendadas

- Con teclado: enfocar el separador y comprobar, **mirando la
  pantalla** (no solo `aria-valuenow`), que las flechas de su
  orientación cambian el tamaño **visible** del panel principal en
  `data-step`, y que las de la otra orientación no hacen nada. Repetir
  en las dos variantes: un fallo de CSS puede dejar `aria-valuenow`
  cambiando sin que el panel se mueva, y eso no lo detecta ningún test
  automático que solo lea el atributo.
- Comprobar que Inicio/Fin llevan al mínimo/máximo, y que Enter
  colapsa y, pulsado otra vez, restaura la posición anterior (no
  siempre la misma).
- Arrastrar el separador con el ratón y comprobar que el panel
  principal sigue al puntero con fluidez, incluso si el puntero se
  mueve más rápido que la franja del separador.
- En una pantalla táctil (o emulándola), comprobar que arrastrar el
  separador no hace scroll de la página.
- Con NVDA/VoiceOver, comprobar que se anuncia el nombre
  (`aria-label`) y el porcentaje al moverse, tanto con teclado como
  arrastrando.
- Comprobar en modo oscuro que la línea del separador y su estado de
  foco siguen siendo visibles.

## Dependencias

`window-splitter.js` no importa ninguna utilidad de `src/utils/`.
`window-splitter.css` no depende de otro componente. Los colores
salen de `src/tokens/tokens.css`.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha de Window splitter
de la guía. Nota: el PDF no está en el repositorio, así que esta
lista recoge los puntos que el SPEC 05 toma de la ficha.

**«Lo que te toca a ti»**:

- _`role="separator"` interactivo, con teclado propio_, al no existir
  un elemento nativo equivalente: `tabindex="0"` y los cuatro
  `aria-value*`, añadidos por JS.
- _El valor es un porcentaje, no píxeles_: no depende del tamaño de
  la ventana ni hay que recalcularlo al redimensionarla.
- _La variante colapsable de APG_: `Enter` colapsa al mínimo y
  restaura la posición anterior, no un valor fijo.
- _El teclado y el arrastre llevan al mismo sitio_: tanto las flechas
  como `pointermove` pasan por el mismo acotado y el mismo evento
  (`splitter:change`); ninguno de los dos puede dejar el valor fuera
  de `aria-valuemin`/`aria-valuemax`.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `aria-valuenow` en píxeles — cambiaría solo al redimensionar la
  ventana, sin que el usuario haga nada.
- Separador sin `tabindex` — sin él, no se podría mover con teclado en
  absoluto, solo arrastrando con el ratón.
- Zona de agarre más fina que 24px — aquí la franja interactiva
  completa mide `--target-size-min`, aunque la línea visible sea más
  fina.
- Arrastre sin `setPointerCapture()` — sin él, mover el puntero más
  rápido que la franja del separador (o dejarlo fuera de ella)
  cortaría el arrastre a medias.
- Arrastrar sin `touch-action: none` — el navegador haría scroll de la
  página en vez de mover el separador en pantallas táctiles.
