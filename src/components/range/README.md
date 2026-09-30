# Range

Selector de un valor numérico con un solo tirador. Sin patrón APG
propio: el patrón «Slider» de la APG es para deslizadores construidos
a mano (`role="slider"`); aquí se usa el `<input type="range">`
nativo, que ya resuelve el teclado (flechas, Av Pág/Re Pág,
Inicio/Fin), el rol y el valor.

## Uso

```html
<link rel="stylesheet" href="range.css" />

<div class="c-range">
  <label class="c-range__label" for="volumen">Volumen</label>
  <div class="c-range__control">
    <input
      class="c-range__input"
      type="range"
      id="volumen"
      name="volumen"
      min="0"
      max="100"
      step="1"
      value="40"
      data-range
      data-format="{value} %"
    />
    <output class="c-range__output" for="volumen" aria-live="off">40 %</output>
  </div>
</div>
```

```js
import { Range, initRanges } from './range.js';

new Range(document.querySelector('[data-range]'));
// O con una función de formato propia:
new Range(input, { format: (value) => `${value} €` });
// O, para inicializar todos los [data-range] de la página:
initRanges();
```

`Range` mantiene sincronizado el `<output for>` con el valor del
`input` y escribe `aria-valuetext` con el mismo texto formateado, para
que el lector anuncie «40 %» en vez de solo «40». El formato sale de
`data-format` (con `{value}` como marcador de posición) o de la opción
`format`, que tiene prioridad si se pasa. Sin ninguno de los dos, usa
el valor tal cual. El estado inicial se pinta en el constructor a
partir del `value` que ya trae el HTML.

## Por qué el `<output>` lleva `aria-live="off"`

Un `<output>` tiene un rol implícito `status` (región viva cortés).
Sin `aria-live="off"`, arrastrar el tirador anunciaría cada valor
intermedio («38 %, 39 %, 40 %…»), que es ruido. Con
`aria-live="off"`, el valor se sigue anunciando, pero por
`aria-valuetext` del propio `input`, al ritmo que decide el lector de
pantalla (normalmente, solo cuando el usuario se detiene), no en cada
píxel de arrastre.

## Dependencias

`range.css` y `range.js` no dependen de ningún otro componente ni
utilidad. Los colores salen de `src/tokens/tokens.css`.

## Accesibilidad

- **Elemento nativo antes que ARIA**: `<input type="range">` ya tiene
  su rol, su teclado y su valor; no se añade ningún `role`.
- **Nombre accesible por `<label for>`**.
- **`aria-valuetext`** sustituye el valor numérico plano por el texto
  formateado («40 %», «21 ºC»), para que el lector anuncie lo mismo
  que se ve en el `<output>`.
- **Sin anuncios repetidos al arrastrar**: `aria-live="off"` en el
  `<output>` (ver arriba).
- **Objetivo táctil**: el tirador mide `--target-size-min` (24×24px,
  WCAG 2.2 SC 2.5.8), aunque la pista visual sea más fina.
- **Mejora progresiva**: sin JavaScript, el `<input type="range">`
  sigue siendo utilizable por completo con teclado y ratón; solo el
  `<output>` deja de actualizarse (ver la historia «Sin JS»).

## Pruebas manuales recomendadas

- Con teclado: enfocar el tirador y comprobar que ←/→ cambian el valor
  en `step`, Av Pág/Re Pág en saltos mayores, e Inicio/Fin van a `min`
  y `max`.
- Con NVDA/VoiceOver, mover el tirador con las flechas y comprobar que
  se anuncia el texto formateado («40 %»), no solo el número.
- Arrastrar el tirador con el ratón mientras el lector está activo y
  comprobar que no anuncia cada valor intermedio.
- Comprobar en modo oscuro que la pista, el tirador y el `<output>`
  siguen siendo legibles.

## Conformidad con la guía

Revisión frente a la ficha de Range de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _Elemento nativo, no `role="slider"` sobre un `<div>`_: el rol, el
  teclado y el valor ya los da `<input type="range">`.
- _El valor no se anuncia solo como número_: `aria-valuetext` da el
  texto con unidades.
- _Sin ruido al arrastrar_: `aria-live="off"` en el `<output>`.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `<div role="slider">` construido a mano — se usa el nativo.
- `<output>` sin `aria-live="off"`, que anunciaría cada valor
  intermedio al arrastrar.
- Tirador estilado por debajo de 24×24px.
