# Text field

Campo de formulario: `<input>` (`text`, `email`, `tel`, `url`,
`password`), `<textarea>` y `<select>` nativos, cada uno envuelto en
`.c-field` junto a su `<label>`, una ayuda opcional y un mensaje de
error opcional. Sin patrón APG propio: son controles nativos, así que
el nombre accesible, el foco y el envío del formulario ya los da el
navegador.

## Uso

```html
<link rel="stylesheet" href="text-field.css" />

<div class="c-field" data-field>
  <label class="c-field__label" for="nombre">
    Nombre <span class="c-field__required">(obligatorio)</span>
  </label>
  <input
    class="c-field__control"
    type="text"
    id="nombre"
    name="nombre"
    autocomplete="name"
    required
    aria-describedby="nombre-hint"
  />
  <p class="c-field__hint" id="nombre-hint">
    Como aparece en tu documento de identidad.
  </p>
</div>
```

Cada campo sigue la misma estructura:

- `.c-field`, con el atributo `data-field` (lo usa
  `src/utils/field-validation.js` para saber dónde insertar el mensaje
  de error si no hay un `[data-field-error]` explícito).
- `.c-field__label`, siempre con `for` apuntando al `id` del control.
- `.c-field__control` en el `<input>`, `<textarea>` o `<select>`.
- `.c-field__hint` opcional, con `id="<control>-hint"`, enlazada desde
  el control con `aria-describedby`.
- `.c-field__error` opcional, con `id="<control>-error"`. Cuando el
  campo es inválido, el control lleva `aria-invalid="true"` y su
  `aria-describedby` incluye también `<control>-error`.

Un control `required` indica «(obligatorio)» en el propio texto de la
etiqueta (`.c-field__required`), no solo con un asterisco o con color.

## Estado inválido sin JavaScript

El ejemplo de correo de la historia «Inválido» escribe
`aria-invalid="true"` y el mensaje a mano, para mostrar el estilo sin
depender de JavaScript. En la práctica, ese estado lo gestiona
`text-field.js` (validación con la Constraint Validation nativa) y
`setFieldError()`/`clearFieldError()` de
`src/utils/field-validation.js`, que crean y enlazan el mensaje.

## Validación por campo: `TextField`

```js
import { TextField, initTextFields } from './text-field.js';

new TextField(document.querySelector('[data-field]'));
// O, para inicializar todos los [data-field] de la página:
initTextFields();
```

El campo no muestra error hasta que se «toca»: la primera vez que
pierde el foco (`blur`), se valida con la Constraint Validation nativa
(`checkValidity()`). A partir de ahí, también valida en cada `input`,
solo para poder retirar el error en cuanto se corrige. Escribir en un
campo válido que nunca se ha tocado no introduce ningún error.

El mensaje sale de `data-error-<clave>` en el control o, si no existe,
de un texto por defecto en español (nunca de `validationMessage`, que
depende del idioma del navegador):

| Clave de `ValidityState`           | Atributo                                                   |
| ---------------------------------- | ---------------------------------------------------------- |
| `valueMissing`                     | `data-error-required`                                      |
| `typeMismatch`                     | `data-error-type-mismatch`                                 |
| `patternMismatch`                  | `data-error-pattern`                                       |
| `tooShort` / `tooLong`             | `data-error-too-short` / `data-error-too-long`             |
| `rangeUnderflow` / `rangeOverflow` | `data-error-range-underflow` / `data-error-range-overflow` |
| `stepMismatch`                     | `data-error-step-mismatch`                                 |
| `badInput`                         | `data-error-bad-input`                                     |

```html
<input
  type="email"
  id="correo"
  required
  data-error-type-mismatch="Introduce un correo electrónico válido"
/>
```

`field.validate()` se puede llamar en cualquier momento (no solo tras
el blur) y devuelve `true`/`false`; lo usa `FormValidation` al enviar
el formulario. `field.invalid` refleja el `aria-invalid` actual.
`field.destroy()` quita los listeners de `blur` e `input`.

## Resumen de errores del formulario: `FormValidation`

```html
<form data-validate>
  <div class="c-field" data-field>…</div>
  <button type="submit">Enviar</button>
</form>
```

```js
import { FormValidation, initForms } from './text-field.js';

new FormValidation(document.querySelector('form'));
// O, para inicializar todos los [data-validate] de la página:
initForms();
```

Al construirse, pone `novalidate` en el `<form>` (sin JS, el navegador
sigue validando por su cuenta). Al enviarlo:

1. Valida todos los campos de `[data-field]`, los grupos
   `[data-radio-group][data-required]` (ver el componente Radio group)
   y las casillas `required` que no estén dentro de un `[data-field]`
   (ver el componente Checkbox).
2. Si hay errores, cancela el envío (`preventDefault()`), pinta un
   resumen («Hay 2 errores en el formulario») con un enlace por campo
   inválido (`href="#<id>"`) y le da el foco al resumen
   (`tabindex="-1"`). Cada enlace enfoca su control (en un grupo, el
   primer radio); un clic también hace `preventDefault()` para no
   depender de la navegación por ancla del navegador.
3. Si no hay errores, no cancela el envío y el resumen queda `hidden`.

El resumen no usa una región viva: el cambio de foco ya hace que el
lector lo anuncie, y `announce()` además sería doble lectura. Por la
misma razón, no lleva `role="alert"`.

Por defecto el resumen se crea al final del primer elemento del
formulario (`insertBefore` al principio); para elegir dónde va,
escribe tú mismo `<div data-error-summary></div>` en el marcado y
`FormValidation` lo reutiliza.

## Dependencias

`text-field.css` no depende de ningún otro componente. Los colores
salen de `src/tokens/tokens.css` (`--color-feedback-danger` para el
borde inválido, el icono de error y el borde del resumen).

## Accesibilidad

- **Elemento nativo antes que ARIA**: `<input>`, `<textarea>` y
  `<select>` ya tienen su rol, su estado y su participación en el
  formulario; no se añade ningún `role`.
- **Nombre accesible por `<label for>`**, nunca por `placeholder`
  (desaparece al escribir y muchos lectores no lo anuncian como
  nombre).
- **Lo obligatorio se dice con texto**, no solo con un asterisco o con
  color: «(obligatorio)» en la propia etiqueta.
- **Ayuda y error enlazados con `aria-describedby`**, sin pisarse entre
  sí: los dos ids pueden convivir en el mismo control.
- **El error no depende solo del color**: el borde cambia, pero el
  mensaje lleva además texto y un icono `aria-hidden="true"`.
- **Contraste**: el borde inválido y el icono de error usan
  `--color-feedback-danger` (≥ 3:1); el texto del mensaje usa
  `--color-text` (≥ 4.5:1).
- **Objetivo táctil**: cada control mide al menos 2.75rem de alto
  (44px), por encima del mínimo de 24×24px de WCAG 2.2 SC 2.5.8.
- **Sin validar antes de tiempo**: `TextField` no muestra error hasta
  que el campo pierde el foco por primera vez (WCAG 3.3.1), y actualiza
  o retira el error mientras se escribe solo si ya estaba tocado.
- **Resumen de errores enfocable** (WCAG 3.3.1 y 2.4.3): al fallar el
  envío, el foco va al resumen y cada enlace lleva a su campo, en el
  orden en que aparecen en el formulario.
- **El resumen no depende de una región viva**: el cambio de foco ya lo
  anuncia; añadir `announce()` sería doble lectura.

## Pruebas manuales recomendadas

- Recorrer cada campo con NVDA/VoiceOver y comprobar que se anuncian la
  etiqueta, «obligatorio» cuando aplica, la ayuda y, en el ejemplo de
  correo, el mensaje de error.
- Enviar la historia «Formulario con resumen de errores» vacía y
  comprobar con el lector que, al caer el foco en el resumen, se
  anuncia «Hay 2 errores en el formulario» seguido de la lista de
  enlaces, y que activar un enlace lleva el foco (y la lectura) al
  campo correspondiente.
- Aumentar el zoom al 400 % y comprobar que la etiqueta, la ayuda y el
  error se reajustan sin solaparse ni cortarse.
- Comprobar en modo oscuro que el borde inválido, el icono de error y
  el borde del resumen siguen siendo legibles.

## Conformidad con la guía

Revisión frente a la ficha de campos de texto y validación de la guía.
Nota: el PDF no está en el repositorio, así que esta lista recoge los
puntos que el SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _Etiqueta explícita con `<label for>`_: en todos los campos, nunca
  solo `placeholder`.
- _Lo obligatorio no solo con un asterisco_: texto «(obligatorio)» en
  la etiqueta.
- _Ayuda y error enlazados sin perder el otro_: `aria-describedby`
  admite varios ids a la vez.
- _No validar en cada tecla_: `TextField` espera al primer `blur`.
- _Resumen de errores enfocable con enlaces a cada campo_: es el
  trabajo de `FormValidation`.
- _Mensajes propios, no los del navegador_: `resolveMessage()` nunca
  usa `validationMessage`, que sale en el idioma del navegador.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `placeholder` como única etiqueta — todos los campos llevan
  `<label for>`.
- Error comunicado solo por color — el mensaje lleva texto e icono.
- Estado inválido sin enlazar con el control — `aria-describedby`
  incluye el id del mensaje de error.
- Validar en cada pulsación de tecla — solo revalida mientras el campo
  ya estaba tocado e inválido.
- Enviar un formulario inválido sin avisar dónde está el problema — el
  resumen enfocable con enlaces cubre justo eso.
