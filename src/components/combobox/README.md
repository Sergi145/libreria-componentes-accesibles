# Combobox

Dos variantes del patrón [WAI-ARIA APG — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/),
cada una con su clase: **editable** (`Combobox`, valor libre con lista
"list" filtrada) y **solo-selección** (`SelectCombobox`, mejora un
`<select>` existente sin permitir texto libre). Este README cubre
primero el editable y, más abajo, el solo-selección.

## Combobox editable

Campo de texto con una lista emergente filtrada de sugerencias.

### Uso

```html
<link rel="stylesheet" href="../listbox/listbox.css" />
<link rel="stylesheet" href="combobox.css" />

<div class="c-combobox">
  <label class="c-combobox__label" for="destino" id="destino-label">
    Destino
  </label>
  <input
    type="text"
    class="c-combobox__input"
    id="destino"
    name="destino"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded="false"
    aria-controls="destino-listbox"
    autocomplete="off"
    data-combobox
  />
  <ul
    class="c-listbox c-combobox__popup"
    id="destino-listbox"
    role="listbox"
    aria-labelledby="destino-label"
    hidden
  >
    <li
      class="c-listbox__option"
      role="option"
      id="destino-opt-1"
      data-value="mad"
      aria-selected="false"
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
    <!-- … más opciones, cada una con su id escrito a mano … -->
  </ul>
  <p class="c-combobox__empty" hidden>Sin resultados</p>
</div>
```

`.c-combobox__empty` es opcional: si no está, el componente sigue
funcionando (solo no habrá mensaje visible con 0 resultados). Si lo
incluyes, `combobox.js` lo encuentra por estructura
(`input.closest('.c-combobox')`), no por `id`.

```js
import { Combobox, initComboboxes } from './combobox.js';

const combobox = new Combobox(document.querySelector('[data-combobox]'));
combobox.value; // → string: el texto del input
combobox.expanded; // → boolean
combobox.open();
combobox.close();

document
  .querySelector('[data-combobox]')
  .addEventListener('combobox:change', (event) => {
    console.log(event.detail.value);
  });

// O, para inicializar todos los combobox editables de la página:
initComboboxes();
```

Las opciones del popup **ya están en el HTML**, cada una con su `id`
escrito a mano: `combobox.js` solo les pone o les quita `hidden` al
filtrar, nunca las crea ni las destruye. El `<ul>` reutiliza las clases
`.c-listbox`/`.c-listbox__option` de [`../listbox/listbox.css`](../listbox/listbox.css)
(incluido el icono de marca), con `.c-combobox__popup` encima para su
posición respecto al input.

### Comportamiento

- **Escribir** filtra las opciones por «contiene», sin tildes ni
  mayúsculas (`normalizeText()`), y abre el popup. Con el campo vacío
  se ven todas.
- **El foco del DOM nunca sale del `<input>`**: la opción activa se
  marca con `aria-activedescendant` y `aria-selected="true"`, no
  moviendo el foco real.
- **Con el popup cerrado**: `↓` lo abre y activa la primera opción
  visible; `↑` lo abre y activa la última; `Alt+↓` lo abre sin activar
  ninguna.
- **Con el popup abierto**: `↓`/`↑` mueven la opción activa con
  envoltura (de la última vuelve a la primera y viceversa).
  `←`/`→`/`Home`/`End` quitan `aria-activedescendant` sin cerrar el
  popup (el usuario sigue moviendo el cursor de texto).
- **Enter** acepta la opción activa: pone su texto en el input, cierra
  el popup y dispara `combobox:change`.
- **Escape** cierra el popup si está abierto; si ya estaba cerrado,
  vacía el campo. Ambos casos cancelan el evento (como `dismissable()`
  en Menu Button) para que no cierre además un `<dialog>` que
  contuviera el combobox.
- **Clic en una opción** la acepta igual que Enter y devuelve el foco
  al input. **Clic o foco fuera** cierra el popup (`dismissable()`,
  activo solo mientras está abierto, igual que en Dropdown).
- `combobox:change` (con `detail.value`) se dispara solo al **aceptar**
  una opción (Enter o clic), no en cada tecla — cada pulsación ya se
  puede observar con el evento nativo `input` del propio campo.
- **Aceptar una opción la anuncia** con `announce()`: «`<nombre del
campo>`: `<opción>`, seleccionado» (o solo «`<opción>`, seleccionado»
  si el `<input>` no tiene `<label for>`). El cambio de texto del
  propio input no siempre basta para que un lector de pantalla lo
  anuncie de forma fiable sobre `role="combobox"`.
- **Con 0 resultados**, el popup se queda oculto y `aria-expanded` en
  `"false"` (no tiene sentido expandir una lista vacía); en su lugar se
  muestra `.c-combobox__empty` con «Sin resultados».
- **Tras 500 ms sin escribir**, `announce()` dice cuántos resultados
  hay («Sin resultados», «1 resultado» o «N resultados»): escribir
  varias letras seguidas solo dispara un anuncio, el de la última
  pausa — no uno por tecla.
- **La lista se coloca con `placeFloating()`**: abajo por defecto y,
  si no cabe en el viewport o en un contenedor con scroll, arriba.
- **Con `data-strict`**, perder el foco con un texto que no coincide
  con ninguna opción (sin tildes ni mayúsculas) pinta un error con
  `setFieldError()` — el mensaje de `data-error-strict` en el input, o
  «Elige una opción de la lista» por defecto. Elegir una opción válida
  lo retira al momento.

### ¿Cuándo NO necesitas este combobox?

Si solo necesitas elegir una opción existente (no texto libre) y no te
hace falta filtrar mientras escribes, usa el combobox **solo-selección**
de más abajo, o un `<select>` nativo si tampoco te hace falta un
aspecto propio.

### Accesibilidad

- **`role="combobox"` + `aria-autocomplete="list"` + `aria-expanded` +
  `aria-controls`** en el `<input>`, apuntando al `<ul role="listbox">`
  del popup.
- **`aria-activedescendant`**, no foco real, para la opción activa: el
  usuario sigue pudiendo escribir en cualquier momento.
- **Las opciones existen siempre en el DOM**: el filtrado solo les pone
  `hidden`, nunca las recrea — así `aria-activedescendant` apunta
  siempre a un `id` estable (VoiceOver no lee de forma fiable una
  opción que se vuelve a crear con el mismo `id`).
- **Nombre accesible** del input por `<label for>`, como con cualquier
  campo de texto.
- **Objetivo táctil**: el input y cada opción miden al menos 24×24px.
- **Sin JavaScript**: el popup queda oculto para siempre; el `<input
name>` se comporta como un campo de texto libre y envía lo escrito
  igual que cualquier otro campo.
- **El error de `data-strict` no depende solo del color**: el borde
  rojo del input se acompaña de texto y de un icono propios (ver
  `.c-field__error`/`.c-field__error-icon` de `text-field.css`).
- **Patrón de referencia**: [WAI-ARIA APG — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### Pruebas manuales recomendadas

- Con NVDA/VoiceOver, escribir en el campo y comprobar que se anuncia
  cada opción activa al moverse con las flechas, sin que el foco
  parezca "saltar" fuera del campo.
- Comprobar que, tras una pausa al escribir, el lector anuncia cuántos
  resultados hay, y que teclear varias letras seguidas no produce un
  anuncio por cada una.
- Comprobar que `Escape` cierra el popup sin vaciar el campo, y que un
  segundo `Escape` sí lo vacía.
- Comprobar que un clic fuera del combobox cierra el popup sin mover
  el foco del documento.
- En la historia «Modo estricto», comprobar que salir del campo con un
  texto inválido anuncia el error al volver a él, y que elegir una
  opción lo retira sin tener que salir y volver a entrar.
- Reducir la ventana del navegador hasta que el combobox quede cerca
  del borde inferior y comprobar que el popup se coloca arriba en vez
  de quedar cortado.
- Comprobar en modo oscuro y con `forced-colors: active` que el popup
  se distingue del fondo de la página.

## Combobox solo-selección

Mejora un `<select>` nativo con el aspecto y el teclado de un
combobox, sin permitir texto libre. Útil cuando el `<select>` nativo
no basta visualmente (por ejemplo, para que las opciones compartan
estilo con el resto de la librería) pero no hace falta escribir.

### Uso

```html
<link rel="stylesheet" href="../listbox/listbox.css" />
<link rel="stylesheet" href="combobox.css" />

<div class="c-combobox">
  <label for="asiento">Asiento</label>
  <select id="asiento" name="asiento" data-combobox>
    <optgroup label="Clase económica">
      <option value="12a">12A — Pasillo</option>
      <option value="12b" selected>12B — Centro</option>
    </optgroup>
    <optgroup label="Primera clase">
      <option value="1a">1A — Ventana</option>
      <option value="1b" disabled>1B — Ocupado</option>
    </optgroup>
  </select>
</div>
```

```js
import { SelectCombobox, initComboboxes } from './combobox.js';

const combobox = new SelectCombobox(
  document.querySelector('select[data-combobox]')
);
combobox.value; // → string: el value de la opción elegida
combobox.value = '1a'; // selecciona por valor; no dispara 'combobox:change'
combobox.destroy(); // quita el combobox creado y vuelve a mostrar el <select>

// O, para inicializar todos los combobox (editables y solo-selección) de la página:
initComboboxes();
```

El `<select>` solo necesita `id` (y, si quieres, un `<label for>` que
apunte a él — `SelectCombobox` le añade un `id` propio si no lo
tenía). `SelectCombobox` lee sus `<option>`/`<optgroup>`, oculta el
`<select>` (`hidden`, nunca `disabled`: sigue enviándose con el
formulario) y crea delante un `<div role="combobox" tabindex="0">`
con el texto de la opción elegida y su propio `<ul role="listbox">` —
reutiliza las clases `.c-listbox`/`.c-listbox__option` de
[`../listbox/listbox.css`](../listbox/listbox.css), igual que el
popup del editable. Cada `<optgroup>` se convierte en
`role="presentation"` + `role="group"` anidado, como los grupos de
Listbox; cada `<option disabled>`, en `aria-disabled="true"`.

### Comportamiento

| Tecla / acción                  | Cerrado                                               | Abierto                                                                                        |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `↓`/`↑`/Enter/Espacio           | Abren, activando la opción ya elegida                 | `↓`/`↑` mueven la opción activa, **sin envoltura**                                             |
| `Alt+↓`                         | Abre sin activar ninguna opción                       | —                                                                                              |
| Inicio/Fin                      | Abren activando la primera/última opción              | Mueven a la primera/última                                                                     |
| RePág/AvPág                     | —                                                     | Mueven 10 opciones, sin envoltura                                                              |
| Una letra (typeahead)           | Abre y activa la primera coincidencia tras la elegida | Mueve a la primera coincidencia tras la activa                                                 |
| Enter / Espacio / Tab / `Alt+↑` | —                                                     | Eligen la opción activa y cierran (`Tab` no cancela su propio evento: el foco sigue tabulando) |
| Escape                          | —                                                     | Cierra **sin** cambiar el valor                                                                |
| Clic en una opción              | —                                                     | La elige y cierra                                                                              |
| Clic o foco fuera               | —                                                     | Cierra sin cambiar el valor (`dismissable()`, igual que en Dropdown)                           |

El texto del disparador (lo que se ve) solo cambia al **elegir** una
opción, nunca al recorrerla con las flechas: lo activo (lo que se
vería al elegir ahora, marcado con `aria-activedescendant` y la clase
`.is-active`) y lo elegido (`aria-selected`, el `value` real del
`<select>`) son dos cosas distintas, igual que en un `<select>` nativo.
Elegir una opción dispara `change` en el `<select>` oculto y
`combobox:change` (con `detail.value`) en el disparador, y la anuncia
con `announce()` («`<nombre del campo>`: `<opción>`, seleccionado», o
solo «`<opción>`, seleccionado» sin `<label>`) — nada de esto si la
opción elegida ya era la actual.

### ¿Cuándo NO necesitas este combobox?

Si el `<select>` nativo ya tiene el aspecto que necesitas, no lo
mejores: ya tiene rol, estado y teclado sin ARIA ni JavaScript propios,
y funciona en más situaciones (por ejemplo, el selector nativo de
algunos móviles).

### Accesibilidad

- **`role="combobox"` + `tabindex="0"` + `aria-haspopup="listbox"` +
  `aria-expanded` + `aria-controls`** en el `<div>` creado, apuntando
  al `<ul role="listbox">` del popup.
- **Nombre accesible** desde la `<label for>` original del `<select>`,
  vía `aria-labelledby`; un clic en esa etiqueta enfoca el nuevo
  combobox, no el `<select>` oculto.
- **`required` en el `<select>`** se refleja como `aria-required="true"`
  en el disparador — un `<select required>` oculto con `hidden` no se
  puede validar de forma nativa (ver «Riesgos» del spec).
- **El `<select>` oculto sigue siendo el valor real del formulario**:
  `hidden`, nunca `disabled`, con su mismo `name`.
- **Objetivo táctil**: el disparador y cada opción miden al menos
  24×24px.
- **Sin JavaScript**: el `<select>` funciona exactamente igual que
  cualquier otro.
- **Patrón de referencia**: [WAI-ARIA APG — Combobox, ejemplo "Select Only"](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### Pruebas manuales recomendadas

- Con NVDA/VoiceOver, comprobar que se anuncia el nombre desde la
  `<label>`, el valor elegido y, al navegar con flechas, cada opción
  activa — y que las deshabilitadas se anuncian como tales y se
  saltan.
- Comprobar que `Tab` desde el combobox abierto elige la opción activa
  y continúa al siguiente control de la página, sin quedarse atascado.
- Comprobar que `destroy()` deja el `<select>` exactamente como estaba
  antes (visible, con el mismo valor), sin rastro del combobox creado.

## Dependencias

`combobox.js` importa [`src/utils/dismiss.js`](../../utils/dismiss.js),
[`src/utils/placement.js`](../../utils/placement.js) y
`createTypeahead`/`normalizeText` de
[`src/utils/typeahead.js`](../../utils/typeahead.js) (lo usan las dos
clases); el editable además importa
[`src/utils/live-region.js`](../../utils/live-region.js) y
[`src/utils/field-validation.js`](../../utils/field-validation.js)
(solo para `data-strict`). `combobox.css` **enlaza**
[`../listbox/listbox.css`](../listbox/listbox.css) para el aspecto de
las opciones del popup en ambas clases, y (solo si usas `data-strict`)
[`../text-field/text-field.css`](../text-field/text-field.css) para el
estilo del mensaje de error. Si copias solo la carpeta `combobox/` a
otro proyecto, copia también esas utilidades y hojas de estilo que
uses. Los colores salen de `src/tokens/tokens.css`.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha de Combobox de la
guía. Nota: el PDF no está en el repositorio, así que esta lista
recoge los puntos que el SPEC 05 toma de la ficha.

**«Lo que te toca a ti»**:

- _Gestionar `aria-expanded`, `aria-activedescendant` y el filtrado_,
  al no existir un `<input>` nativo con lista emergente propia:
  implementado en `combobox.js`, con las opciones siempre en el HTML
  (nunca recreadas) para que `aria-activedescendant` apunte a un `id`
  estable.
- _El foco nunca sale del campo de texto_: la opción activa se marca
  con `aria-activedescendant`, no moviendo el foco real — a diferencia
  de Listbox, que sí puede mover el foco porque no hay nada que
  seguir escribiendo.
- _Anunciar los resultados sin saturar al usuario_: recuento con
  `announce()` tras una pausa de 500 ms, no uno por tecla.
- _No expandir una lista sin nada que mostrar_: con 0 resultados el
  popup se queda oculto y `aria-expanded="false"`; el mensaje de «Sin
  resultados» es un elemento aparte, no una opción deshabilitada
  dentro del propio listbox.
- _Restringir a una opción válida es opcional, no el comportamiento
  por defecto_: el valor es libre salvo que se añada `data-strict`.
- _Mejorar progresivamente un `<select>` real_ (solo-selección), en vez
  de construir el combobox desde cero con `<div>`: sin JS funciona
  igual que cualquier `<select>`, y con JS ese mismo elemento (oculto,
  nunca `disabled`) sigue siendo el valor del formulario.
- _Distinguir lo activo de lo elegido_ (solo-selección): recorrer las
  opciones con el teclado no cambia el valor ni el texto del
  disparador hasta que se elige de verdad, igual que en un `<select>`
  nativo.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Mover el foco real a la opción al navegar con las flechas — rompería
  la posibilidad de seguir escribiendo en el editable; en el
  solo-selección, además, perdería la referencia a la `<label>` por
  `aria-labelledby` del propio disparador.
- Recrear las opciones del popup en cada tecla — en vez de eso, solo
  se les pone o quita `hidden` (editable) o se crean una sola vez al
  construir (solo-selección).
- Anunciar el recuento de resultados en cada pulsación — satura al
  usuario de lector de pantalla; aquí se anuncia tras una pausa.
- Un segundo `Escape` que no hace nada — aquí vacía el campo, en vez
  de quedarse sin ninguna acción útil una vez cerrado el popup.
- Deshabilitar el `<select>` original (`disabled`) en vez de ocultarlo
  (`hidden`) — un control deshabilitado no se envía con el formulario;
  uno oculto, sí.
