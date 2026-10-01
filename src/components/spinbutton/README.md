# Spinbutton

Campo numérico con botones −/+ y teclado propio. Implementa el
patrón [WAI-ARIA APG — Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/).

## Uso

```html
<link rel="stylesheet" href="../text-field/text-field.css" />
<link rel="stylesheet" href="spinbutton.css" />

<div class="c-field" data-field>
  <label class="c-field__label" for="peso">Peso</label>
  <input
    type="text"
    inputmode="decimal"
    class="c-field__control c-spinbutton__input"
    id="peso"
    name="peso"
    role="spinbutton"
    aria-valuenow="70"
    aria-valuemin="30"
    aria-valuemax="200"
    data-spinbutton
    data-step="0.5"
    data-step-large="5"
    data-format="{value} kg"
  />
</div>
```

```js
import { Spinbutton, initSpinbuttons } from './spinbutton.js';

const spinbutton = new Spinbutton(document.querySelector('[data-spinbutton]'));
spinbutton.value; // → number
spinbutton.value = 80; // acota a min/max y redondea al paso; no dispara el evento
spinbutton.stepUp(); // suma data-step; stepUp(3) suma 3 pasos de una vez
spinbutton.stepDown();
spinbutton.destroy(); // quita los botones −/+ y deja el input en su sitio
spinbutton.validate(); // → boolean; valida el texto escrito a mano

document
  .querySelector('[data-spinbutton]')
  .addEventListener('spinbutton:change', (event) => {
    console.log(event.detail.value);
  });

// O, para inicializar todos los [data-spinbutton] de la página:
initSpinbuttons();

// Formato propio, por encima de data-format:
new Spinbutton(input, { format: (value) => `${value} unidades` });
```

`Spinbutton` crea los botones −/+ con `tabindex="-1"` (APG: no son
paradas de Tab propias) y los envuelve junto al `<input>` dentro de un
`.c-spinbutton`, reemplazando al `<input>` en el `.c-field` donde
estaba. Un `mousedown` en los botones cancela su propio evento para
que el foco se quede siempre en el campo, nunca en el botón.

## Comportamiento

- **`↑`/`↓`** suman o restan `data-step` (por defecto, `1`).
- **RePág/AvPág** suman o restan `data-step-large` (por defecto,
  10 × `data-step`).
- **Inicio/Fin** van a `aria-valuemin`/`aria-valuemax`.
- El valor se acota a `aria-valuemin`/`aria-valuemax` y se redondea al
  número de decimales de `data-step` (evita que sumar pasos decimales
  varias veces acumule ruido de coma flotante, como `0.1 + 0.2`).
- El valor se muestra y se envía **con coma decimal**
  (`Intl.NumberFormat('es-ES', { useGrouping: false })`), coherente con
  el idioma de la página.
- **`aria-valuetext`** se fija siempre, con `data-format` (`{value}`
  como marcador de posición) o, si no hay, con el número formateado
  solo. La opción `format` de la clase tiene prioridad sobre
  `data-format` si se pasa.
- Los botones −/+ se deshabilitan al llegar al mínimo o al máximo.
- `spinbutton:change` (con `detail.value`) se dispara solo si el valor
  cambia de verdad — subir ya estando en el máximo no hace nada ni lo
  dispara.
- **Escritura a mano**: al salir del campo (`blur`), «2,5» y «2.5»
  valen igual. Un valor fuera de rango se acota a
  `aria-valuemin`/`aria-valuemax` y se reescribe, pero **sin**
  redondearlo al paso — a diferencia de las flechas, un valor escrito
  a mano no tiene por qué caer en un múltiplo exacto de `data-step`
  (con paso `0.5`, escribir «90,25» se queda en 90,25, no salta a
  90,5). Un texto que no es un número pinta el error «Introduce un
  número» (o `data-error-badinput`) con `setFieldError()`, deja el
  texto escrito tal cual para que se vea qué corregir, y no toca
  `aria-valuenow`. Corregirlo retira el error en cuanto vuelve a ser
  válido, sin tener que salir y volver a entrar en el campo. Un campo
  vacío con `required` usa el mensaje de obligatorio de
  `DEFAULT_MESSAGES` (o `data-error-required`); vacío sin `required`,
  no marca error y recupera el último valor conocido.
- No se valida hasta que el campo pierde el foco por primera vez («se
  toca»); desde entonces, también en cada tecla, solo para retirar el
  error en cuanto se corrige — mismo patrón que `TextField` (SPEC 04).

## Accesibilidad

- **`role="spinbutton"`** sobre `<input type="text" inputmode="decimal">`,
  no `<input type="number">`: así se controla `aria-valuetext`, se
  admite la coma decimal (algunos navegadores la rechazan en
  `type="number"`) y la rueda del ratón no cambia el valor sin
  querer.
- **`aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`**
  en el input.
- **Nombre accesible** por `<label for>`, como con cualquier campo de
  texto.
- **Los botones −/+ no son paradas de Tab**: `tabindex="-1"`, con
  `aria-label` propio («Disminuir»/«Aumentar») y deshabilitados de
  verdad en los extremos, no solo con una clase visual.
- **Objetivo táctil**: el input y los botones miden al menos 24×24px.
- **El error de escritura a mano no depende solo del color**: el
  mensaje lleva texto e icono propios (ver `.c-field__error`/
  `.c-field__error-icon` de `text-field.css`), enlazado con
  `aria-describedby`.
- **Sin JavaScript**: no hay botones −/+; el campo es un `<input>` de
  texto normal que se envía igual que cualquier otro.
- **Patrón de referencia**: [WAI-ARIA APG — Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/).

## Pruebas manuales recomendadas

- Con teclado: enfocar el campo y comprobar que `↑`/`↓` cambian el
  valor en `data-step`, RePág/AvPág en `data-step-large`, e
  Inicio/Fin van a `min`/`max`.
- Con el ratón, pulsar los botones −/+ varias veces seguidas y
  comprobar que el foco nunca sale del campo (ni visualmente ni para
  el lector).
- Con NVDA/VoiceOver, cambiar el valor y comprobar que se anuncia el
  texto con unidades («70 kg»), no solo el número.
- Comprobar que, al llegar al mínimo o al máximo, el botón
  correspondiente queda deshabilitado y deja de responder.
- Escribir un texto no numérico, salir del campo y comprobar que el
  lector anuncia el error al volver a él; corregirlo y comprobar que
  el error se retira sin tener que salir otra vez.
- Sin JavaScript, comprobar que el campo se puede escribir y enviar
  con un formulario normal.

## Dependencias

`spinbutton.js` importa [`src/utils/field-validation.js`](../../utils/field-validation.js)
(`setFieldError()`/`clearFieldError()`/`DEFAULT_MESSAGES`, para la
escritura a mano). `spinbutton.css` **enlaza**
[`../text-field/text-field.css`](../text-field/text-field.css) para
el aspecto de `.c-field`/`.c-field__label`/`.c-field__control` (el
input lo reutiliza) y el estilo del mensaje de error. Si copias solo
la carpeta `spinbutton/` a otro proyecto, copia también esa utilidad
y esa hoja de estilo. Los colores salen de `src/tokens/tokens.css`.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha de Spinbutton de la
guía. Nota: el PDF no está en el repositorio, así que esta lista
recoge los puntos que el SPEC 05 toma de la ficha.

**«Lo que te toca a ti»**:

- _`role="spinbutton"` con sus cuatro `aria-value*`_, al no existir un
  `<input>` nativo que dé exactamente este comportamiento (coma
  decimal, `aria-valuetext`, sin rueda de ratón accidental):
  implementado sobre `<input type="text" inputmode="decimal">`.
- _Botones −/+ que no interrumpan la tabulación_: `tabindex="-1"`,
  creados por JS, con su propio `aria-label`.
- _El valor no se anuncia solo como número cuando tiene unidades_:
  `aria-valuetext` con `data-format`.
- _No bloquear la escritura, validar al salir_: en vez de impedir
  teclas no numéricas (que confunde al lector y a quien pega texto),
  el valor se acota y se valida en `blur`, con el mismo mensaje de
  error que el resto del formulario (`setFieldError()`).

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `<input type="number">` en vez de `role="spinbutton"` sobre un
  campo de texto — rechaza la coma decimal en algunos navegadores y
  cambia de valor con la rueda del ratón sin que el usuario lo pida.
- Botones −/+ como paradas de Tab propias — APG los quiere fuera de
  la secuencia de tabulación.
- Bloquear las teclas no numéricas al escribir — confunde al lector y
  a quien pega texto; en vez de eso, el valor se acota y se valida al
  salir del campo.
- Redondear al paso un valor escrito a mano — forzaría «90,25» a
  «90,5» con paso `0,5`, cambiando lo que el usuario escribió sin que
  lo pidiera; solo se acota a `min`/`max`.
