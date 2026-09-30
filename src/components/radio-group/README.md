# Radio group

Grupo de botones de opción excluyentes. Patrón de referencia:
[WAI-ARIA APG — Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).
`<fieldset role="radiogroup" aria-labelledby>` con `<legend>` e
`<input type="radio">` nativos, todos con el mismo `name`. Flechas,
Tab y la propia selección son del navegador; no se añade roving
tabindex propio.

## Uso

```html
<link rel="stylesheet" href="radio-group.css" />

<fieldset
  class="c-radio-group"
  id="tema"
  role="radiogroup"
  aria-labelledby="tema-legend"
>
  <legend class="c-radio-group__legend" id="tema-legend">
    Tema de la interfaz
  </legend>
  <div class="c-radio">
    <input
      class="c-radio__input"
      type="radio"
      id="tema-claro"
      name="tema"
      value="claro"
      checked
    />
    <label class="c-radio__label" for="tema-claro">Claro</label>
  </div>
  <div class="c-radio">
    <input
      class="c-radio__input"
      type="radio"
      id="tema-oscuro"
      name="tema"
      value="oscuro"
    />
    <label class="c-radio__label" for="tema-oscuro">Oscuro</label>
  </div>
</fieldset>
```

El rol `radiogroup` explícito (en vez del `group` implícito de
`<fieldset>`) es el que admite `aria-invalid`; `aria-labelledby`
refuerza el nombre accesible del `<legend>` para lectores que no lo
asocian solos al cambiar el rol por defecto.

## Grupo obligatorio: `RadioGroup`

```js
import { RadioGroup, initRadioGroups } from './radio-group.js';

const group = new RadioGroup(document.querySelector('[data-radio-group]'));
group.validate(); // → boolean

// O, para inicializar todos los grupos de la página:
initRadioGroups();
```

```html
<fieldset
  class="c-radio-group"
  id="preferencia"
  role="radiogroup"
  aria-labelledby="preferencia-legend"
  data-radio-group
  data-required
>
  <legend class="c-radio-group__legend" id="preferencia-legend">
    Preferencia de contacto
    <span class="c-radio-group__required">(obligatorio)</span>
  </legend>
  …
</fieldset>
```

`RadioGroup.validate()` solo hace algo si el `<fieldset>` es
`data-required`; si no, siempre devuelve `true`. Exige que haya un
radio marcado y pinta o quita el mensaje **sobre el propio
`<fieldset>`** (es el grupo el que es obligatorio, no una opción
concreta) con `setFieldError()`/`clearFieldError()` de
`src/utils/field-validation.js`. El mensaje sale de
`data-error-required` en el `<fieldset>` o, si no existe, del texto
por defecto («Este campo es obligatorio»).

Una vez marcado inválido, elegir cualquier radio retira el error al
momento (listener de `change` en el propio `<fieldset>`), igual que
`TextField` lo hace al escribir un valor válido.

Como el control validado es el `<fieldset>` completo (no un `<input>`
dentro de un `<label>`, a diferencia de Checkbox), el mensaje se puede
insertar de forma segura como su siguiente hermano en el DOM: no hace
falta declarar un `[data-field-error]` aparte.

`FormValidation` (de [`../text-field/text-field.js`](../text-field))
reconoce cualquier `[data-radio-group][data-required]` dentro de un
`<form data-validate>` y lo valida igual al enviar el formulario, sin
depender de que `RadioGroup` esté inicializado por su cuenta — ver
«Resumen de errores del formulario» en el README de Text field.

## Dependencias

`radio-group.css` no depende de otro componente para el grupo en sí.
El mensaje de error del grupo obligatorio reutiliza las clases
`.c-field__error`/`.c-field__error-icon` de
[`../text-field/text-field.css`](../text-field): si copias solo la
carpeta `radio-group/` a otro proyecto y usas grupos obligatorios,
copia también ese archivo (o enlázalo aparte), igual que Alert y Toast
reutilizan `close-button.css`. `radio-group.js` no importa nada salvo
`src/utils/field-validation.js`. Los colores salen de
`src/tokens/tokens.css`.

## Accesibilidad

- **Elemento nativo antes que ARIA**: `<input type="radio">` ya tiene
  su rol, su estado y el teclado (flechas mueven y seleccionan, Tab
  entra y sale del grupo una sola vez).
- **`role="radiogroup"` explícito** en el `<fieldset>`, con
  `aria-labelledby` hacia el `<legend>`.
- **Nombre accesible por `<label for>`** en cada opción, como hermano
  del control, no envolviéndolo.
- **Lo obligatorio se dice con texto**, no solo con un asterisco o con
  color: «(obligatorio)» en el propio `<legend>`.
- **El error no depende solo del color**: el `<fieldset>` inválido
  lleva un borde real (no solo un cambio de tono), y el mensaje lleva
  además texto e icono `aria-hidden="true"`.
- **Objetivo táctil**: cada radio mide `--target-size-min` (24×24px,
  WCAG 2.2 SC 2.5.8).

## Pruebas manuales recomendadas

- Recorrer el grupo con NVDA/VoiceOver: al entrar con Tab se anuncia el
  nombre del `<legend>`, cuántas opciones hay y la seleccionada; las
  flechas cambian la opción sin salir del grupo.
- En la historia «Obligatorio», pulsar «Validar» sin elegir nada y
  comprobar que el lector anuncia el mensaje al volver al grupo, y que
  elegir una opción lo retira sin tener que pulsar «Validar» otra vez.
- Comprobar en modo oscuro que el borde inválido y el icono de error
  siguen siendo legibles.

## Conformidad con la guía

Revisión frente a la ficha de Radio group de la guía. Nota: el PDF no
está en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _Elemento nativo, no `role="radio"` sobre un `<div>`_: el rol, el
  estado y el teclado ya los da `<input type="radio">`.
- _`<fieldset>`/`<legend>` para el nombre del grupo_, no un `<div>`
  con `aria-label` suelto.
- _No reimplementar el teclado_: flechas, Tab y selección son del
  navegador; añadir roving tabindex propio duplicaría lo que ya
  funciona.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="radio"` propio sobre elementos no nativos — se usa
  `<input type="radio">`.
- Radios con `name` distinto dentro del mismo grupo — dejarían de
  comportarse como un grupo excluyente.
- `<div>` en vez de `<fieldset>`/`<legend>` para agrupar y nombrar.
