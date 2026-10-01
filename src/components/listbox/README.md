# Listbox

Lista de opciones seleccionables, simple o múltiple. Implementa el
patrón [WAI-ARIA APG — Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).

## Uso

```html
<link rel="stylesheet" href="listbox.css" />

<span class="c-listbox__label" id="destino-label">Destino</span>
<ul
  class="c-listbox"
  id="destino"
  role="listbox"
  aria-labelledby="destino-label"
  data-listbox
>
  <li
    class="c-listbox__option"
    role="option"
    data-value="mad"
    aria-selected="true"
  >
    Madrid
    <svg
      class="c-listbox__check"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </li>
  <li
    class="c-listbox__option"
    role="option"
    data-value="bcn"
    aria-selected="false"
  >
    Barcelona
    <svg
      class="c-listbox__check"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </li>
</ul>
```

El icono (`.c-listbox__check`) va siempre en el marcado de cada
opción, con sus **dos formas** ya dentro — el visto bueno y el
símbolo de prohibido —: el CSS solo cambia cuál de las dos se ve
(`aria-selected` o `aria-disabled`), nunca las crea ni las destruye
JavaScript. Es la pista que distingue la opción seleccionada o
deshabilitada sin depender del color.

Una opción no disponible lleva `aria-disabled="true"` (nunca el
atributo `disabled`, que no existe en un `<li>`) y muestra el símbolo
de prohibido en vez del visto bueno, aunque no esté seleccionada:

```html
<li
  class="c-listbox__option"
  role="option"
  data-value="val"
  aria-selected="false"
  aria-disabled="true"
>
  Valencia (sin plazas)
  <svg
    class="c-listbox__check"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M5 13l4 4L19 7"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <g
      class="c-listbox__check-forbidden"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke-linecap="round" />
    </g>
  </svg>
</li>
```

### Selección múltiple

`aria-multiselectable="true"` en el contenedor; cualquier número de
opciones puede llevar `aria-selected="true"` de partida. `data-name`
es opcional: con él, `listbox.js` mantiene un `<input type="hidden">`
por valor seleccionado, con ese `name`, junto al listbox:

```html
<ul
  class="c-listbox"
  id="etiquetas"
  role="listbox"
  aria-labelledby="etiquetas-label"
  aria-multiselectable="true"
  data-listbox
  data-name="etiquetas"
>
  <li
    class="c-listbox__option"
    role="option"
    data-value="urgente"
    aria-selected="true"
  >
    Urgente …
  </li>
  <li
    class="c-listbox__option"
    role="option"
    data-value="revision"
    aria-selected="true"
  >
    Revisión …
  </li>
</ul>
```

### Grupos de opciones

Cada grupo es un `<li role="presentation">` (fuera del árbol de
accesibilidad: solo agrupa visualmente) con su etiqueta visible y un
`<ul role="group" aria-labelledby>` anidado — válido en HTML porque un
`<ul>` puede ir dentro de un `<li>`:

```html
<li class="c-listbox__group" role="presentation">
  <span class="c-listbox__group-label" id="asiento-economica-label">
    Clase económica
  </span>
  <ul
    class="c-listbox__group-options"
    role="group"
    aria-labelledby="asiento-economica-label"
  >
    <li
      class="c-listbox__option"
      role="option"
      data-value="12a"
      aria-selected="true"
    >
      12A — Pasillo …
    </li>
  </ul>
</li>
```

`aria-labelledby` del grupo apunta siempre a esa etiqueta visible, no a
un `aria-label` repetido a mano.

## JavaScript: `Listbox`

```js
import { Listbox, initListboxes } from './listbox.js';

const listbox = new Listbox(document.querySelector('[data-listbox]'));
listbox.value; // → string | null (simple) o string[] (múltiple)
listbox.value = 'bcn'; // o ['urgente', 'revision'] en múltiple
// set value nunca dispara 'listbox:change'

document
  .querySelector('[data-listbox]')
  .addEventListener('listbox:change', (event) => {
    console.log(event.detail.value);
  });

// O, para inicializar todos los listbox de la página:
initListboxes();
```

El modo (`listbox.multiple`) sale de `aria-multiselectable` en el
propio HTML. El estado inicial también sale del HTML: en simple, la
opción con `aria-selected="true"` recibe el foco inicial (`Tab` entra
en ella) o, si no hay ninguna, la primera; en múltiple, se respetan
todas las que ya estén marcadas. El evento `listbox:change` (con
`detail.value`) se dispara con cada cambio real de selección, pero
nunca al construir el componente ni al repetir una selección que no
cambia nada — igual que el `change` de un `<select>` nativo.

Las opciones `aria-disabled="true"` quedan fuera del selector que
reciben [`rovingTabindex()`](../../utils/roving-tabindex.js) y
[`createTypeahead()`](../../utils/typeahead.js), así que ni el teclado
ni el clic las alcanzan, en ningún modo.

### Teclado y ratón

| Tecla / acción                 | Selección simple                                 | Selección múltiple                                                                                                                 |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `↑`/`↓`/`Home`/`End`           | Mueven el foco **y** seleccionan (sin envoltura) | Solo mueven el foco                                                                                                                |
| Escribir una letra (typeahead) | Mueve el foco y selecciona                       | Solo mueve el foco                                                                                                                 |
| Clic                           | Selecciona (sustituye la anterior)               | Alterna la opción, sin tocar las demás                                                                                             |
| Espacio                        | —                                                | Alterna la opción activa, sin moverse (si hay una búsqueda de typeahead en marcha, el espacio se trata como parte de esa búsqueda) |
| Mayús+`↑`/`↓`                  | —                                                | Mueve el foco **y** alterna la opción de destino                                                                                   |
| Mayús+clic                     | —                                                | Selecciona el rango desde la última opción activada (sin Mayús) hasta la clicada                                                   |
| Ctrl+Mayús+Inicio/Fin          | —                                                | Selecciona desde la opción activa hasta el principio/final de la lista                                                             |
| Ctrl+A                         | —                                                | Selecciona todas o, si ya estaban todas, ninguna                                                                                   |

### `data-name`: inputs ocultos para el formulario

Con `data-name="<nombre>"` en el contenedor, `listbox.js` mantiene un
`<input type="hidden" name="<nombre>">` por valor seleccionado (uno en
simple, cero o varios en múltiple), como hermano del propio `<ul>`. Se
reconstruyen en cada cambio de selección, así que nunca queda un input
de más tras deseleccionar algo. `destroy()` los quita.

## ¿Cuándo NO necesitas un listbox?

Si las opciones no necesitan typeahead, grupos ni un aspecto distinto
al de un `<select>` nativo, usa `<select>` (o `<select multiple>`,
o casillas/radios nativos para selección múltiple/simple): ya tienen
rol, estado y teclado sin ARIA ni JavaScript propios.

## Accesibilidad

- **`role="listbox"` + `aria-labelledby`** en el contenedor, apuntando
  al `<span>` visible que lo nombra.
- **`role="option"`** en cada opción, con `aria-selected` reflejando si
  está elegida.
- **`role="group"` + `aria-labelledby`** para agrupar opciones
  relacionadas, con la etiqueta del grupo como elemento visible aparte
  (no un `aria-label` repetido).
- **`aria-disabled="true"`** en las opciones no disponibles — no el
  atributo `disabled`, que no es válido en un `<li>`.
- **La opción seleccionada o deshabilitada no depende solo del
  color**: lleva además su icono propio (`aria-hidden="true"`): el
  visto bueno o el símbolo de prohibido.
- **Objetivo táctil**: cada opción mide al menos 24×24px
  (`--target-size-min`).
- **Foco real, no `aria-activedescendant`**: `rovingTabindex()` mueve
  el `tabindex` y el foco del DOM entre las opciones; los lectores de
  pantalla lo siguen mejor que una referencia por `aria-activedescendant`.
- **Sin JavaScript**: el rol, el nombre y el estado de cada opción se
  leen igual, pero no hay flechas que muevan el foco ni clic ni teclado
  que cambien la selección.
- **Patrón de referencia**: [WAI-ARIA APG — Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/).

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, recorrer la lista con `↑`/`↓`/`Home`/`End`: debe
  anunciarse el nombre de la lista al entrar, y cada opción con su
  estado de selección al moverse (en múltiple, que el estado no cambia
  solo por moverse).
- Comprobar que escribir una letra (p. ej. «s» en el ejemplo de
  destinos) mueve el foco a la primera opción que empieza por ella, y
  que repetirla recorre las que coinciden.
- En el ejemplo de selección múltiple, comprobar con el lector que
  Espacio, Mayús+flecha y Ctrl+A anuncian el nuevo estado de cada
  opción afectada, no solo un cambio de foco silencioso.
- Sin JavaScript, recorrer la lista en modo de navegación del lector:
  debe anunciarse como lista de N opciones, incluida la seleccionada y
  cuál está deshabilitada.
- Comprobar en modo oscuro y con `forced-colors: active` que la opción
  seleccionada sigue siendo identificable sin depender del color.

## Dependencias

`listbox.js` importa
[`src/utils/roving-tabindex.js`](../../utils/roving-tabindex.js) y
[`src/utils/typeahead.js`](../../utils/typeahead.js): si copias solo la
carpeta `listbox/` a otro proyecto, copia también esas dos utilidades,
o el import se rompe. `listbox.css` no depende de otro componente. Los
colores salen de `src/tokens/tokens.css`.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha de Listbox de la
guía. Nota: el PDF no está en el repositorio, así que esta lista recoge
los puntos que el SPEC 05 toma de la ficha.

**«Lo que te toca a ti»**:

- _Rol, nombre y teclado completos, al no haber un elemento nativo
  equivalente_ cuando hacen falta typeahead, grupos o un aspecto propio:
  implementado con `role="listbox"`/`role="option"`/`role="group"`,
  `rovingTabindex()` y `createTypeahead()`. Documentado en «¿Cuándo NO
  necesitas un listbox?» el caso contrario (usa `<select>`).
- _Foco gestionado con cuidado_: foco DOM real (roving tabindex), nunca
  `aria-activedescendant`, para que los lectores de pantalla lo sigan
  de forma fiable.
- _El modelo de selección múltiple recomendado_ (flechas solo mueven el
  foco, Espacio alterna): implementado tal cual, en vez del modelo
  alternativo en el que las flechas también seleccionan.
- _Opciones no disponibles marcadas y fuera de la navegación_:
  `aria-disabled="true"` (no `disabled`, inválido en un `<li>`) y
  excluidas del selector que reciben `rovingTabindex()` y
  `createTypeahead()`.
- _El estado no depende solo del color_: la opción seleccionada o
  deshabilitada lleva además su icono propio `aria-hidden="true"` (el
  visto bueno o el símbolo de prohibido).

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `aria-activedescendant` sobre un `role="listbox"` con selección
  múltiple — complica el modelo de foco sin necesidad; aquí el foco es
  siempre real.
- Flechas que también seleccionan en modo múltiple — se saltaría el
  modelo recomendado por APG y dejaría sin forma de recorrer la lista
  sin alterar la selección.
- `aria-label` repetido a mano en cada grupo en vez de
  `aria-labelledby` hacia una etiqueta visible — aquí el grupo siempre
  se nombra desde su `<span>` visible.
- Opción deshabilitada que sigue recibiendo el foco con las flechas o
  el clic — aquí queda fuera del selector desde el primer paso, no
  solo con un `aria-disabled` decorativo.
