# Checkbox

Casilla de verificación individual: `<input type="checkbox">` nativo
junto a su `<label for>`. Patrón de referencia:
[WAI-ARIA APG — Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/),
incluida su variante de estado mixto. El elemento nativo ya tiene el
rol, el estado marcado/no marcado y Espacio como tecla; no se añade
ningún ARIA propio. El estado mixto (`indeterminate`) para un grupo
«Seleccionar todo» lo añade `CheckboxGroup` (`checkbox.js`) — ver
«Grupo con estado mixto» más abajo.

## Uso

```html
<link rel="stylesheet" href="checkbox.css" />

<div class="c-checkbox">
  <input
    class="c-checkbox__input"
    type="checkbox"
    id="novedades"
    name="novedades"
  />
  <label class="c-checkbox__label" for="novedades">
    Recibir novedades por correo
  </label>
</div>
```

`input` y `label` van como **hermanos** (`label for`, no el `label`
envolviendo el `input`). Es a propósito: si el input estuviera dentro
del `<label>`, cualquier texto insertado junto a él —como un mensaje
de error— pasaría a formar parte del nombre accesible de la casilla.

## Casilla obligatoria

Una casilla `required` (p. ej. «Acepto los términos») no lleva JS
propio: la valida `FormValidation`, de
[`../text-field/text-field.js`](../text-field), dentro de un
`<form data-validate>` — ver «Resumen de errores del formulario» en el
README de Text field. `FormValidation` reconoce cualquier
`input[type="checkbox"][required]` que no esté dentro de un
`[data-field]`.

Como el `input` y el `label` son hermanos y no hay un `[data-field]`
que los envuelva, declara tú mismo dónde va el mensaje con
`data-field-error="<id>"` **fuera** del `<label>`:

```html
<div>
  <div class="c-checkbox">
    <input
      class="c-checkbox__input"
      type="checkbox"
      id="terminos"
      name="terminos"
      required
    />
    <label class="c-checkbox__label" for="terminos">
      Acepto los términos y condiciones
      <span class="c-checkbox__required">(obligatorio)</span>
    </label>
  </div>
  <div data-field-error="terminos"></div>
</div>
```

Sin ese `data-field-error`, `setFieldError()` insertaría el mensaje
justo después del `input` (su respaldo por defecto), es decir, **entre
el input y su label** — rompiendo la asociación visual y arriesgando
que el mensaje quede fuera de lugar. Con `data-field-error`, el
mensaje aparece donde tú decidas, siempre fuera del `<label>`.

La historia «Obligatoria» muestra el resultado ya inválido
(`aria-invalid="true"` escrito a mano), para ver el estilo sin
depender de un envío real.

## Grupo con estado mixto: `CheckboxGroup`

```html
<fieldset class="c-checkbox-group" data-checkbox-group>
  <legend class="c-checkbox-group__legend">Notificaciones</legend>

  <div class="c-checkbox">
    <input
      class="c-checkbox__input"
      type="checkbox"
      id="todas-notificaciones"
      data-checkbox-parent
    />
    <label class="c-checkbox__label" for="todas-notificaciones">
      <strong>Seleccionar todo</strong>
    </label>
  </div>

  <div class="c-checkbox-group__children">
    <div class="c-checkbox">
      <input
        class="c-checkbox__input"
        type="checkbox"
        id="notif-pedidos"
        checked
      />
      <label class="c-checkbox__label" for="notif-pedidos"
        >Estado de mis pedidos</label
      >
    </div>
    <div class="c-checkbox">
      <input class="c-checkbox__input" type="checkbox" id="notif-envios" />
      <label class="c-checkbox__label" for="notif-envios"
        >Actualizaciones de envío</label
      >
    </div>
  </div>
</fieldset>
```

```js
import { CheckboxGroup, initCheckboxGroups } from './checkbox.js';

new CheckboxGroup(document.querySelector('[data-checkbox-group]'));
// O, para inicializar todos los grupos de la página:
initCheckboxGroups();
```

`[data-checkbox-parent]` marca la casilla «Seleccionar todo» dentro de
un `<fieldset data-checkbox-group>` con `<legend>`. Cualquier otro
`<input type="checkbox">` del grupo cuenta como hija; no llevan ningún
atributo especial.

- Todas las hijas marcadas → el padre queda marcado (`checked`).
- Ninguna marcada → el padre queda sin marcar.
- Algunas marcadas → el padre queda en estado mixto: `checked = false`
  e `indeterminate = true`. **No** se escribe `aria-checked="mixed"` a
  mano; los navegadores ya exponen `indeterminate` como estado mixto en
  el árbol de accesibilidad.
- Activar el padre (clic o Espacio) marca o desmarca todas las hijas a
  la vez, con el mismo valor que quedó su `checked` (en estado mixto,
  el navegador lo deja en `true`, así que activar el padre en estado
  mixto **marca** todas las hijas, no las desmarca).
- Desmarcar una hija cuando estaban todas marcadas devuelve el padre al
  estado mixto.

El padre lleva `aria-controls` con los ids de las hijas, calculado por
`CheckboxGroup` al construirse.

`indeterminate` es una propiedad de JS, no un atributo HTML: no
sobrevive a una recarga sin este script. El estado inicial se calcula
en el constructor a partir de qué hijas están `checked` en el HTML, así
que basta con marcar las correctas en el marcado (ver la historia
«Estado mixto»); sin JavaScript, las casillas funcionan como casillas
sueltas, sin sincronizarse entre sí.

## Dependencias

`checkbox.css` no depende de otro componente para la casilla en sí.
El mensaje de error de la variante obligatoria reutiliza las clases
`.c-field__error`/`.c-field__error-icon` de
[`../text-field/text-field.css`](../text-field): si copias solo la
carpeta `checkbox/` a otro proyecto y usas casillas obligatorias, copia
también ese archivo (o enlázalo aparte), igual que Alert y Toast
reutilizan `close-button.css`. Los colores salen de
`src/tokens/tokens.css`.

## Accesibilidad

- **Elemento nativo antes que ARIA**: `<input type="checkbox">` ya
  tiene su rol, su estado y Espacio como tecla.
- **Nombre accesible por `<label for>`**, como hermano del control, no
  envolviéndolo (ver «Uso»).
- **Lo obligatorio se dice con texto**, no solo con un asterisco o con
  color: «(obligatorio)» en la propia etiqueta.
- **El error no depende solo del color**: además del contorno rojo en
  la casilla, el mensaje lleva texto e icono `aria-hidden="true"`.
- **Objetivo táctil**: la casilla mide `--target-size-min` (24×24px,
  WCAG 2.2 SC 2.5.8); el `<label>` amplía el área clicable sin
  necesidad de agrandar el propio `<input>`.
- **Contraste**: el contorno inválido y el icono de error usan
  `--color-feedback-danger` (≥ 3:1); el texto usa `--color-text`
  (≥ 4.5:1).
- **Estado mixto sin ARIA propio**: `CheckboxGroup` usa la propiedad
  `indeterminate` del `<input>`, que los navegadores ya traducen al
  estado «mixed» del árbol de accesibilidad; no se escribe
  `aria-checked` a mano.
- **`aria-controls`** en el padre, con los ids de las hijas, para que
  la relación «Seleccionar todo → sus casillas» quede expuesta también
  a quien navegue por landmarks/relaciones ARIA.

## Pruebas manuales recomendadas

- Recorrer cada casilla con NVDA/VoiceOver y comprobar que el nombre
  anunciado es el texto del `<label>`, incluido «(obligatorio)» cuando
  aplica.
- Con teclado: Tab hasta la casilla y Espacio para alternarla; en la
  deshabilitada, Tab la salta.
- En «Estado mixto», comprobar con NVDA/VoiceOver que activar
  «Seleccionar todo» cuando está en estado mixto se anuncia como
  «marcado» (no como «mixto» ni como «sin marcar»), y que desmarcar una
  hija tras marcarlas todas se anuncia como «mixto» en el padre.
- Comprobar en modo oscuro que el contorno inválido y el icono de
  error siguen siendo legibles.

## Conformidad con la guía

Revisión frente a la ficha de Checkbox de la guía. Nota: el PDF no
está en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _Elemento nativo, no `role="checkbox"` sobre un `<div>`_: el rol, el
  estado y el teclado ya los da `<input type="checkbox">`.
- _Nombre accesible explícito_: `<label for>`, nunca solo un icono o
  color.
- _Lo obligatorio no solo con un asterisco_: texto «(obligatorio)» en
  la etiqueta.
- _Estado mixto expuesto de forma nativa_: `indeterminate`, no
  `aria-checked="mixed"` escrito a mano.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="checkbox"` propio sobre un elemento no nativo — se usa
  `<input type="checkbox">`.
- Casilla sin `<label>` asociado, con solo texto suelto al lado.
- Objetivo táctil menor de 24×24px.
- Estado mixto simulado solo con CSS o con `aria-checked="mixed"` sin
  tocar `indeterminate` — el lector no lo anunciaría como mixto.
