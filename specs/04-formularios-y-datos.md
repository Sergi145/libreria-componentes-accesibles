# SPEC 04 — Formularios y datos

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-30
> **Objetivo:** Crear la utilidad compartida de errores de campo y los componentes de formularios y datos de la guía (campos de texto con validación, Checkbox mixto, Radio group, Switch, Range y Table ordenable).

## Por qué existe este spec

Es el cuarto de los 5 specs en los que se reparte `guia-componentes-accesibles-aria-bootstrap5.pdf` (ver la tabla del SPEC 01).
Cubre las fichas de campos de texto y validación, Checkbox (estado mixto), Radio group, Switch, Range y Table.

Un formulario accesible falla casi siempre por lo mismo: el error no está enlazado con su campo, solo se comunica con color, o al enviar el foco se queda donde estaba.
Por eso la lógica de errores va en una utilidad común, que comparten los campos de texto y los grupos de casillas y radios.

La regla del spec es «mejor sin ARIA»: los controles son los nativos (`<input>`, `<select>`, `<textarea>`, `<table>`) y el JS solo añade lo que el navegador no da.

## Alcance

**Dentro:**

- Utilidad `src/utils/field-validation.js` con sus tests: `setFieldError()` y `clearFieldError()`, que ponen `aria-invalid`, crean o actualizan el mensaje `<campo>-error` y lo enlazan en `aria-describedby` sin pisar la ayuda.
- **Campos de texto** (`text-field/`): `<input>` de tipo `text`, `email`, `tel`, `url` y `password`, `<textarea>` y `<select>` nativo, cada uno con `<label>`, ayuda opcional, mensaje de error y `autocomplete` correcto. Estados `disabled` y `readonly`.
- **Validación**: Constraint Validation nativa (`required`, `pattern`, `minlength`, `type`…) con `checkValidity()`. Errores al salir del campo (tras «tocarlo») y al enviar el formulario, con resumen de errores enfocable y enlaces a cada campo.
- **Checkbox** (`checkbox/`): casilla nativa individual y grupo con estado mixto (`input.indeterminate`) en el que una casilla «Seleccionar todo» controla a las demás.
- **Radio group** (`radio-group/`): `<fieldset>` con `<legend>` y radios nativos, con validación de grupo obligatorio.
- **Switch** (`switch/`): solo CSS, sobre `<input type="checkbox" role="switch">`.
- **Range** (`range/`): `<input type="range">` nativo con `<label>` y valor visible en `<output>`, con JS opcional para el texto del valor.
- **Table** (`table/`): `<table>` semántica con `<caption>`, cabeceras con `scope` y envoltorio con scroll horizontal accesible; variante ordenable por columna con botones en las cabeceras y `aria-sort`.
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Todos los componentes del spec 05, incluidos `Spinbutton`, Combobox y Listbox: un campo numérico con botones +/− y un `select` personalizado van allí.
- Mostrar u ocultar la contraseña, contador de caracteres, máscaras de entrada y autocompletado propio.
- Validación por reglas propias en JS (funciones por campo) y validación asíncrona o de servidor. `setFieldError()` es pública, así que el autor puede pintar un error del servidor por su cuenta.
- Validación en cada pulsación de tecla.
- Range con dos tiradores (rango mínimo–máximo), marcas de graduación (`<datalist>`) y patrón `role="slider"` propio.
- Table con selección de filas, filtrado, paginación, columnas fijas, cabecera pegajosa (`sticky`), redimensionado y patrón Grid (SPEC 05).
- Ordenación de tablas en el servidor o de tablas con celdas combinadas (`colspan`/`rowspan`).
- Selector de fecha, subida de archivos, autocompletar y `input type="color"`.
- Generador de ids: cada campo lleva su `id` escrito en el marcado.
- Añadir Bootstrap o cualquier dependencia de ejecución.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/field-validation.js
// `control` es un <input>, <select>, <textarea> o un <fieldset role="radiogroup">, siempre con `id`.
// El mensaje es <p id="<id>-error" class="c-field__error"> y se coloca en el elemento
// [data-field-error="<id>"] si existe o, si no, al final del [data-field] que contiene el control.
export function setFieldError(control, message);
// → aria-invalid="true", crea/actualiza el mensaje y añade su id a aria-describedby.
export function clearFieldError(control);
// → quita aria-invalid, elimina el mensaje y quita su id de aria-describedby (conserva los demás ids).
export const DEFAULT_MESSAGES; // textos en español por clave de ValidityState

// src/components/text-field/text-field.js
export class TextField {
  constructor(el);                 // el = [data-field] con un solo control dentro
  get control(); get invalid();
  validate();                      // → boolean; pinta o quita el error
  destroy();
}
export class FormValidation {
  constructor(form);               // form = [data-validate]; pone novalidate al construirse
  validate();                      // → boolean; al fallar rellena el resumen y le da el foco
  destroy();
}
export function initTextFields(root = document);   // [data-field]
export function initForms(root = document);        // [data-validate]

// src/components/checkbox/checkbox.js
export class CheckboxGroup {
  constructor(group);              // group = [data-checkbox-group] con un [data-checkbox-parent] y n hijos
  get state();                     // 'checked' | 'unchecked' | 'mixed'
  destroy();
}
export function initCheckboxGroups(root = document);

// src/components/radio-group/radio-group.js
export class RadioGroup {
  constructor(fieldset);           // fieldset = [data-radio-group]
  validate();                      // → boolean; usa setFieldError() sobre el fieldset
  destroy();
}
export function initRadioGroups(root = document);

// src/components/range/range.js
export class Range {
  constructor(input, { format } = {}); // format(value) => string para el <output> y aria-valuetext
  get value();
  destroy();
}
export function initRanges(root = document);       // [data-range]; lee data-format="{value} %"

// src/components/table/table.js
export class SortableTable {
  constructor(table);              // table = [data-sortable]
  sort(columnIndex, direction);    // direction: 'ascending' | 'descending'
  get sorted();                    // { column, direction } | null
  destroy();
}
export function initSortableTables(root = document);
```

Convenciones (las mismas que en los SPEC 01 a 03):

- Clases CSS con prefijo `c-` y BEM: `c-field`, `c-field__error`, `c-error-summary`, `c-switch`, `c-table--striped`…
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en atributos (`aria-invalid`, `aria-sort`, `indeterminate`, `hidden`), sin copia en variables.
- Marcado de un campo: `<div class="c-field" data-field>` con `<label for>`, control, ayuda `<p id="<id>-hint">` y el control con `aria-describedby="<id>-hint"`. La ayuda no es opcional a nivel de enlace: si existe, va en `aria-describedby`.
- Mensajes de error en español, tomados de `data-error-<clave>` en el control (`data-error-required`, `data-error-type-mismatch`, `data-error-pattern`…) o, si no existe, de `DEFAULT_MESSAGES`. Nunca de `validationMessage`, que depende del idioma del navegador y no del de la página.
- El error se comunica con texto e icono `aria-hidden="true"`, no solo con color. Color de error: `--color-feedback-danger`.
- Sin JavaScript, el formulario usa la validación nativa del navegador (los atributos `required`, `pattern`… siguen ahí). El JS pone `novalidate` para sustituirla por la suya.
- Textos por defecto en español: «Este campo es obligatorio», «Introduce un correo electrónico válido», «Hay N errores en el formulario», «Ordenar por <columna>».
- Controles nativos con `accent-color` o `appearance` solo cuando hace falta (Switch); objetivo táctil ≥ 24×24 px.
- Estilos solo con los tokens de `src/tokens/tokens.css`. Si faltan tokens (fondo del error, borde del campo inválido), se añaden en el paso que los necesite.

Estructura de carpetas resultante:

```
src/utils/
├─ field-validation.js
└─ field-validation.test.js
src/components/
├─ text-field/    html, css, js, stories, test, README   — importa field-validation
├─ checkbox/      html, css, js, stories, test, README   — importa field-validation
├─ radio-group/   html, css, js, stories, test, README   — importa field-validation
├─ switch/        html, css, stories, README             — solo CSS
├─ range/         html, css, js, stories, test, README
└─ table/         html, css, js, stories, test, README
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos del `README.md` raíz.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad field-validation.**
   Crear `src/utils/field-validation.js` y `field-validation.test.js`.
   Tests: `setFieldError()` pone `aria-invalid="true"`, crea `<campo>-error` con el texto y lo añade a `aria-describedby` sin quitar el id de la ayuda; llamarla dos veces actualiza el mismo mensaje sin duplicarlo; `clearFieldError()` deja `aria-describedby` solo con la ayuda, o sin atributo si no había otro id; el mensaje va al `[data-field-error]` si existe; y un control sin `id` lanza un error.
2. **Campos de texto: marcado y estilos.**
   Crear `src/components/text-field/` con `<label for>`, ayuda enlazada y controles `input`, `textarea` y `select`.
   Tipos `text`, `email`, `tel`, `url` y `password` con `autocomplete`, `inputmode` donde ayude y `required` señalado en el texto de la etiqueta («(obligatorio)»), no solo con asterisco.
   Estados `disabled`, `readonly` e inválido (`[aria-invalid="true"]`, con borde y texto de error, no solo color).
   Añadir los tokens de error que falten con contraste ≥ 4.5:1 (texto) y 3:1 (borde).
   Historias con ids únicos por render. Sin JS todavía.
3. **Campos de texto: validación por campo.**
   Crear `text-field.js` con `TextField`.
   El campo se marca como «tocado» al perder el foco; desde entonces valida en `blur` y, si ya es inválido, en `input` para retirar el error en cuanto se corrige.
   Los mensajes salen de `data-error-<clave>` o de `DEFAULT_MESSAGES`.
   El error no se anuncia por una región viva: se enlaza con `aria-describedby` y el lector lo lee al volver al campo.
   Tests: `required` vacío tras `blur` marca `aria-invalid`; un valor válido lo retira; sin tocar el campo no hay error; `type="email"` mal escrito da el mensaje de `typeMismatch`; y un `data-error-required` propio sustituye al de por defecto.
4. **Formulario: resumen de errores.**
   Añadir `FormValidation` a `text-field.js` y el estilo `c-error-summary`.
   Con `[data-validate]` el JS pone `novalidate`.
   Al enviar con errores: `preventDefault()`, validación de todos los campos (los de `TextField`, los de `RadioGroup` y las casillas obligatorias), resumen visible con «Hay N errores en el formulario» y una lista de enlaces `href="#<id>"`, y foco al resumen (`tabindex="-1"`).
   Cada enlace enfoca su control; en un grupo, el primero del grupo.
   Con el formulario válido, envía sin interferir y el resumen queda `hidden`.
   Tests: el foco acaba en el resumen, cada enlace enfoca su campo, el resumen se vacía cuando todo es válido y el envío válido no se cancela.
5. **Checkbox.**
   Crear `src/components/checkbox/`: `<input type="checkbox">` nativo dentro de su `<label>`, con `accent-color` y tamaño ≥ 24 px, y variante obligatoria (por ejemplo «Acepto los términos») que valida con `setFieldError()`.
   Sin JS para la casilla simple.
6. **Checkbox: estado mixto.**
   Crear `checkbox.js` con `CheckboxGroup`.
   Dentro de un `<fieldset>` con `<legend>`, la casilla padre `[data-checkbox-parent]` refleja el estado de las hijas: todas marcadas → `checked`; ninguna → sin marcar; algunas → `indeterminate = true` y `checked = false`.
   Activar el padre marca o desmarca todas las hijas, y con estado mixto lo deja todo marcado.
   El padre lleva `aria-controls` con los ids de las hijas.
   No se escribe `aria-checked` a mano: el navegador expone el estado mixto.
   Tests: los tres estados según las hijas, activar el padre en estado mixto marca todas, desmarcar una hija tras «todas» pasa a mixto, y el estado inicial sale del HTML.
7. **Radio group.**
   Crear `src/components/radio-group/`: `<fieldset role="radiogroup" aria-labelledby>` con `<legend>` y `<input type="radio">` con el mismo `name`.
   Flechas, Tab y selección son del navegador; no se añade roving tabindex.
   `RadioGroup.validate()` exige uno marcado si el grupo es obligatorio (`data-required`) y usa `setFieldError()` sobre el `fieldset`.
   Tests: sin selección devuelve `false` y marca `aria-invalid` en el `fieldset`, elegir uno retira el error, y un grupo no obligatorio siempre valida.
8. **Switch.**
   Crear `src/components/switch/`: `<label class="c-switch"><input type="checkbox" role="switch" class="c-switch__input">` con texto visible.
   Aspecto de interruptor con CSS a partir de `:checked`, con la posición del tirador y un icono o texto que también indique el estado, no solo el color.
   Estados `disabled` y `:focus-visible` sobre el interruptor.
   `forced-colors: active` mantiene el estado visible. Transición desactivada con `prefers-reduced-motion`.
   El README explica cuándo usar Switch (efecto inmediato) y cuándo Checkbox (se confirma con un envío).
9. **Range.**
   Crear `src/components/range/`: `<label for>` + `<input type="range" min max step>` + `<output for>`, estilado con `::-webkit-slider-thumb`, `::-moz-range-thumb` y sus pistas.
   `Range` actualiza el `<output>` y `aria-valuetext` con `format(value)` (por ejemplo «40 %»); el `<output>` lleva `aria-live="off"` para que arrastrar no hable a cada paso.
   El tirador mide ≥ 24 px.
   Tests: el `<output>` sigue al valor, `aria-valuetext` usa `data-format`, y el estado inicial sale del HTML.
10. **Table: estática.**
    Crear `src/components/table/`: `<table class="c-table">` con `<caption>`, `<thead>`/`<tbody>`, `<th scope="col">` y `<th scope="row">`, dentro de `<div class="c-table__wrapper" role="region" tabindex="0" aria-labelledby>` con `overflow-x: auto`.
    Variantes `--striped` y `--hover`, y alineación numérica a la derecha.
    Sin JS. El README explica cuándo no usar una tabla (maquetación) y por qué el `<caption>` es obligatorio.
11. **Table: ordenable.**
    Crear `table.js` con `SortableTable`.
    Las columnas con `data-sort="text|number"` en su `<th>` reciben un `<button>` con su texto; el `<th>` lleva `aria-sort`.
    Activar una columna la ordena de forma ascendente; volver a activarla, descendente. Solo una columna tiene `aria-sort` a la vez, y las demás no llevan el atributo.
    Comparación de texto con `Intl.Collator('es', { numeric: true })`, y valores `data-sort-value` en la celda si el texto no basta.
    Los botones son un `<button type="button">` real: Enter y Espacio de serie.
    Sin JS la tabla se lee igual, sin botones.
    Tests: primera activación ascendente, segunda descendente, cambiar de columna quita `aria-sort` de la anterior, orden numérico frente a orden de texto (`10` después de `9`), y el foco permanece en el botón tras ordenar.
12. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js`.
    Añadir tests e2e de teclado para el formulario (enviar vacío lleva el foco al resumen y un enlace enfoca su campo), Radio group (flechas cambian la selección), Switch (Espacio alterna), Checkbox mixto (activar el padre marca todas) y Table (Enter en una cabecera ordena y mantiene el foco).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `field-validation.js` en «Estructura» y en el párrafo de `src/utils/`.

## Criterios de aceptación

- [x] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [x] `npm run lint:html` termina sin errores.
- [x] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [x] `npm run build` genera `dist/<componente>/` para los 6 componentes de este spec, además de los 25 existentes. `text-field`, `checkbox`, `radio-group`, `range` y `table` tienen `.js`, `.css` y `.html`; `switch` tiene `.css` y `.html`.
- [x] Ningún `.js` de `dist/` contiene `import` de rutas relativas: `field-validation` queda empaquetado dentro.
- [x] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía».
- [x] Todo control de formulario de las historias tiene un `<label>` asociado o, en un grupo, un `<legend>`. Ninguno usa `placeholder` como única etiqueta.
- [x] `setFieldError(input, 'X')`: el control tiene `aria-invalid="true"`, existe `#<id>-error` con el texto «X» y su id está en `aria-describedby`. `clearFieldError()` deja `aria-describedby` con solo el id de la ayuda.
- [x] Llamar dos veces a `setFieldError()` sobre el mismo control deja un único `#<id>-error`.
- [x] Un campo `required` sin tocar no muestra error. Tras salir de él vacío, muestra «Este campo es obligatorio» y `aria-invalid="true"`. Al escribir un valor válido, el error desaparece.
- [x] Un `type="email"` con un valor sin arroba muestra un mensaje en español, aunque el navegador esté en otro idioma. Ningún mensaje procede de `validationMessage`.
- [x] Los mensajes de error tienen texto y un icono `aria-hidden="true"`, y su contraste con el fondo es ≥ 4.5:1 en tema claro y oscuro.
- [x] Un formulario con `data-validate` tiene `novalidate`. Sin JS no lo tiene y el navegador valida por su cuenta.
- [x] Enviar el formulario con errores no lo envía, muestra «Hay N errores en el formulario» con N igual al número de controles inválidos, y `document.activeElement` es el resumen.
- [x] Cada enlace del resumen enfoca su control. En un grupo de radios enfoca el primer radio.
- [x] Enviar el formulario válido no cancela el envío y deja el resumen `hidden`.
- [x] Checkbox mixto: con algunas hijas marcadas, el padre tiene `indeterminate === true` y `checked === false`. Con todas, `checked === true` e `indeterminate === false`. Con ninguna, ambos `false`.
- [x] Checkbox mixto: activar el padre en estado mixto deja todas las hijas marcadas, y activarlo con todas marcadas las deja todas sin marcar.
- [x] Checkbox mixto: el padre tiene `aria-controls` con los ids de todas las hijas y no tiene `aria-checked`.
- [x] Radio group: es un `<fieldset>` con `<legend>` y con `role="radiogroup"`. Tab entra en el grupo una sola vez y ↑/↓/←/→ cambian la selección.
- [x] Radio group obligatorio sin selección: `validate()` devuelve `false` y el `fieldset` tiene `aria-invalid="true"` y un mensaje enlazado en `aria-describedby`.
- [x] Switch: es un `<input type="checkbox">` con `role="switch"`, y Espacio alterna `checked`. Su estado se distingue sin depender del color y también con `forced-colors: active`.
- [x] Range: es un `<input type="range">` con `<label>`. El `<output>` refleja el valor y tiene `aria-live="off"`. `aria-valuetext` usa el formato dado.
- [x] Table: tiene un `<caption>`, todas las cabeceras son `<th>` con `scope`, y el envoltorio con scroll tiene `tabindex="0"`, nombre accesible y rol `region` (vía `<section>`, ver «Decisiones»).
- [x] Table ordenable: activar una cabecera pone `aria-sort="ascending"` en ella, y una segunda activación `aria-sort="descending"`. Solo una cabecera tiene `aria-sort` a la vez.
- [x] Table ordenable: el orden numérico coloca `10` después de `9` y el foco sigue en el botón de la cabecera tras ordenar.
- [x] Table ordenable: los botones de cabecera son `<button type="button">` y Enter y Espacio ordenan.
- [x] Ningún componente del spec usa texto en inglés en `aria-label`, mensajes de error, `<caption>` de ejemplo ni texto oculto.
- [x] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible`.
- [x] Todas las transiciones nuevas se desactivan con `prefers-reduced-motion: reduce`.
- [x] Los tests existentes de los SPEC 01 a 03 siguen pasando sin modificar sus aserciones.

## Decisiones

- **Sí:** Constraint Validation nativa (`required`, `pattern`, `type`…) con `checkValidity()`. El navegador ya conoce las reglas, y sin JS el formulario sigue validando.
- **No:** validación con reglas propias en JS. Duplica lo que el navegador hace y obliga a mantener dos sistemas.
- **No:** solo estilos con `:user-invalid`. Sin JS no hay enlace por `aria-describedby`, ni resumen, ni gestión del foco.
- **Sí:** mensajes propios en español (`data-error-<clave>` y `DEFAULT_MESSAGES`), nunca `validationMessage`. El texto nativo depende del idioma del navegador y puede aparecer en inglés en una página en español.
- **Sí:** validar al salir del campo (tras «tocarlo») y al enviar, con resumen de errores. Cubre los criterios 3.3.1 y 3.3.3 de WCAG y evita el error prematuro mientras el usuario aún escribe.
- **No:** validar en cada pulsación de tecla. Ruidoso con lector de pantalla y molesto al escribir. Solo se revalida en `input` cuando el campo ya era inválido, para que el error desaparezca al corregirlo.
- **No:** solo al enviar y sin resumen. Obliga a buscar los errores en la página.
- **Sí:** el resumen de errores recibe el foco al enviar y enlaza a cada campo. Es la forma de que teclado y lector de pantalla lleguen al problema sin recorrer el formulario.
- **No:** anunciar los errores por una región viva (`announce()`). El foco al resumen ya los lee, y el error del campo se lee con `aria-describedby` al volver a él. Anunciarlos a la vez sería doble lectura.
- **Sí:** utilidad `src/utils/field-validation.js` compartida por campos de texto, casillas y radios. Mismo criterio que `rovingTabindex`, `dismiss` y `live-region`: se crea en el spec que la usa por primera vez.
- **Sí:** ids escritos en el marcado, y el id del error derivado del control (`<id>-error`). Mantiene la decisión del SPEC 03 de no tener generador de ids, y el error se puede localizar y enlazar de forma previsible.
- **No:** generador de ids. Adelantaría una utilidad que los specs anteriores descartaron, para un problema que el marcado ya resuelve.
- **Sí:** el campo obligatorio se indica en el texto de la etiqueta, no solo con un asterisco o con color.
- **Sí:** `select` nativo dentro del componente de campo. **No:** select personalizado, contador de caracteres ni mostrar contraseña. Cada uno arrastra estado, foco y anuncios propios y merece decisiones aparte (el select personalizado es un Combobox o un Listbox del SPEC 05).
- **Sí:** `<input type="checkbox">` con `indeterminate` para el estado mixto, con `aria-controls` en el padre. El navegador expone el estado mixto sin `aria-checked="mixed"` escrito a mano.
- **No:** `role="checkbox"` propio sobre un `<div>`. Reimplementa teclado, formulario y foco, y va en contra de «mejor sin ARIA».
- **Sí:** el estado inicial del `CheckboxGroup` sale del HTML. **No:** guardarlo en el JS.
- **Sí:** `<fieldset>` + `<legend>` con radios nativos, sin roving tabindex. Tab entra una sola vez y las flechas cambian la selección, todo de serie.
- **Sí:** `role="radiogroup"` explícito en el `<fieldset>`. `aria-invalid` no está admitido en el rol `group` del `fieldset`, pero sí en `radiogroup`. Es una decisión a comprobar con axe y `html-validate` (ver «Riesgos»).
- **No:** radios con `role="radio"` y roving tabindex propios. El navegador ya implementa el patrón.
- **Sí:** Switch sobre `<input type="checkbox" role="switch">`. Espacio, foco, formulario y estado son nativos, y solo el aspecto es CSS. Sigue el patrón APG Switch.
- **No:** `<button role="switch" aria-checked>`. Requiere JS para alternar el estado y no participa en el formulario.
- **Sí:** el estado del Switch no depende del color: posición del tirador más icono o texto, y visible en `forced-colors`.
- **Sí:** Range con `<input type="range">` nativo, `<label>` y `<output>` con `aria-live="off"`. El `<output>` es una región `status` implícita; sin `aria-live="off"` hablaría a cada paso del tirador. El lector ya lee el valor con `aria-valuetext`.
- **No:** slider ARIA propio (`role="slider"`) ni doble tirador. Requiere reimplementar teclado y foco, y los rangos con dos inputs tienen fallos de accesibilidad conocidos. Si hace falta, va en su propio spec.
- **No:** Spinbutton en este spec. Es un patrón APG distinto y está en el SPEC 05.
- **Sí:** Table con `<caption>`, `scope` y envoltorio con `tabindex="0"` y nombre. Un contenedor con scroll sin foco por teclado no es accesible (`scrollable-region-focusable` de axe).
- **Cambio durante la implementación:** el envoltorio es un `<section aria-labelledby>`, no un `<div role="region">` como decía este párrafo y el paso 10 del plan. `html-validate` (regla `prefer-native-element`) rechaza `role="region"` en un `<div>` cuando existe el elemento nativo equivalente: con nombre accesible, `<section>` ya expone ese rol por sí solo. Mismo resultado en el árbol de accesibilidad (confirmado por axe, cero violaciones), menos ARIA.
- **Sí:** Table ordenable con `<button>` dentro del `<th>` y `aria-sort` en el `<th>`, según el patrón APG de tabla ordenable. Es una tabla de datos, no un Grid.
- **No:** selección de filas, filtrado ni paginación de la tabla. La selección arrastra el checkbox mixto en la cabecera y roza el patrón Grid del SPEC 05.
- **No:** anunciar la ordenación con `announce()`. `aria-sort` y el botón con nombre visible bastan según el patrón, y anunciarla además sería doble lectura. Se comprueba a mano (ver «Riesgos»).
- **Sí:** orden de texto con `Intl.Collator('es', { numeric: true })`. Trata bien tildes, la eñe y los números dentro del texto.
- **Sí:** `CheckboxGroup`, `RadioGroup`, `TextField`, `FormValidation`, `Range` y `SortableTable` siguen la convención de las clases del proyecto: constructor con el elemento, `destroy()` y una función `init…`.

## Riesgos

| Riesgo                                                                                                 | Mitigación                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-invalid` en un `<fieldset role="radiogroup">` puede ser marcado por axe o `html-validate`        | La historia entra en la auditoría. Si falla, se pasa `aria-invalid` a cada radio y el mensaje se enlaza desde el `<legend>` antes de cerrar el paso 7.                            |
| Un lector de pantalla no anuncia el error al escribir y el usuario no se entera hasta volver al campo  | El resumen de errores con foco cubre el envío. El README lo documenta y lo prueba con NVDA y VoiceOver; anunciar cada error por una región viva queda descartado (doble lectura). |
| Los mensajes de error se rompen si se cambia el orden de `aria-describedby` o se pisa a mano           | `setFieldError()` y `clearFieldError()` solo añaden o quitan su propio id y conservan los demás. Lo cubren tests.                                                                 |
| `indeterminate` es solo una propiedad de JS: se pierde al recargar sin JS o al restaurar el formulario | Estado inicial de las hijas desde el HTML; el `CheckboxGroup` recalcula el padre al construirse. Se documenta en el README.                                                       |
| `<input type="range">` se estila de forma distinta en Chromium/WebKit y en Firefox                     | Se estilan los dos motores. La historia se revisa en los navegadores de Playwright.                                                                                               |
| El `<output>` de Range se lee a cada paso en algunos lectores pese a `aria-live="off"`                 | Prueba manual con NVDA y VoiceOver; el README documenta el comportamiento y `aria-valuetext` como vía principal.                                                                  |
| Un lector no anuncia el cambio de orden tras activar la cabecera (no hay región viva)                  | Se prueba a mano con NVDA y VoiceOver. Si no se anuncia, se replantea con `announce()` en un cambio posterior, anotándolo en «Decisiones».                                        |
| Un Switch con solo `:checked` y `appearance: none` desaparece en modo de alto contraste                | Historia y prueba con `forced-colors: active` (emulada en Playwright). El estado se dibuja con un borde o un icono y no solo con `background-color`.                              |
| jsdom no valida como un navegador (`checkValidity()` y `ValidityState` parciales)                      | Los tests comprueban atributos y textos con controles reales de jsdom, y el flujo de envío se verifica en Playwright.                                                             |
| Table con muchas columnas desborda a 320 px                                                            | Envoltorio con scroll horizontal, enfocable por teclado y con nombre. La historia se revisa a 320 px sin scroll horizontal en la página.                                          |
| Los componentes dependen de `src/utils/field-validation.js`: copiar solo su carpeta rompe el import    | Cada README lo indica. `dist/` es autónomo porque Vite empaqueta la utilidad (criterio de aceptación).                                                                            |
| Las herramientas automáticas solo detectan una parte de los problemas                                  | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist del README raíz).                                                                               |

## Lo que **no** entra en este spec

- Combobox, Listbox, Menu/Menubar, Tree, Grid, Feed, Spinbutton, Window splitter → SPEC 05.
- Mostrar u ocultar contraseña, contador de caracteres, máscaras y autocompletado propio.
- Validación por reglas propias, asíncrona o de servidor.
- Validación en cada pulsación de tecla.
- Range con doble tirador, graduaciones y `role="slider"` propio.
- Table con selección de filas, filtros, paginación, cabecera pegajosa, celdas combinadas y patrón Grid.
- Selector de fecha, subida de archivos y `input type="color"`.
- Generador de ids.
- Bootstrap o cualquier otra dependencia de ejecución.

Cada uno de ellos, si llega, va en su propio spec.
