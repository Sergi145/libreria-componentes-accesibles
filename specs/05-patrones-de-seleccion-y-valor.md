# SPEC 05 — Patrones APG de selección y valor

> **Estado:** Borrador
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 04
> **Fecha:** 2026-10-01
> **Objetivo:** Crear la utilidad compartida de typeahead y los componentes Listbox, Combobox, Spinbutton y Window splitter según sus patrones APG.

## Por qué existe este spec

La tabla del SPEC 01 reservaba un único SPEC 05 para los ocho patrones avanzados de la guía (Combobox, Listbox, Menu/Menubar, Tree view, Grid, Feed, Spinbutton y Window splitter).
Son los patrones más complejos de la guía y, juntos, darían un plan de unos 20 pasos difícil de verificar.
Por eso se parten en dos specs:

| Spec | Nombre                            | Componentes                                    |
| ---- | --------------------------------- | ---------------------------------------------- |
| 05   | Patrones APG de selección y valor | Listbox, Combobox, Spinbutton, Window splitter |
| 06   | Patrones APG compuestos           | Menubar, Tree view, Grid, Feed                 |

Este spec agrupa los controles que eligen o ajustan un valor.
Comparten dos problemas: encontrar una opción con el teclado (typeahead) y comunicar el valor elegido sin depender de la vista.
Combobox, además, es el «select personalizado» que el SPEC 04 dejó fuera.

## Alcance

**Dentro:**

- Utilidad `src/utils/typeahead.js` con sus tests: búfer de teclas con caducidad, búsqueda circular desde la opción actual y normalización de texto (sin tildes ni mayúsculas).
- **Listbox** (`listbox/`): `role="listbox"` con roving tabindex. Selección simple (la selección sigue al foco) y múltiple (`aria-multiselectable="true"`). Grupos de opciones con `role="group"`. Typeahead. Evento `listbox:change`, getter `value` e `<input type="hidden">` por valor si lleva `data-name`.
- **Combobox editable** (`combobox/`): `<input role="combobox" aria-autocomplete="list">` con lista emergente filtrada por «contiene», `aria-activedescendant`, texto «Sin resultados» visible y recuento anunciado con `announce()`. Valor libre por defecto; `data-strict` lo restringe a las opciones y valida con `setFieldError()`.
- **Combobox solo-selección** (`combobox/`): el JS mejora un `<select>` nativo, lo oculta y construye el combobox con su lista. El `<select>` oculto sigue siendo el valor del formulario.
- **Spinbutton** (`spinbutton/`): `<input type="text" inputmode="decimal" role="spinbutton">` con `aria-valuenow/min/max/valuetext`, flechas, RePág/AvPág, Inicio/Fin y botones −/+ con `tabindex="-1"` creados por el JS. Escritura a mano con coma decimal, acotado al salir y error con `setFieldError()` si el texto no es un número.
- **Window splitter** (`window-splitter/`): `role="separator"` enfocable entre dos paneles, orientación horizontal y vertical, valor en porcentaje del panel principal, flechas, Inicio/Fin, Enter para colapsar y restaurar, y arrastre con Pointer Events.
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Menubar, Tree view, Grid y Feed → SPEC 06. Decisión ya tomada para Menubar: carpeta `menubar/` nueva, extrayendo la lógica de menú común de `menu-button/` sin cambiar la API ni los tests de `MenuButton`, con submenús de un nivel.
- Migrar `Menu Button` a la utilidad `typeahead.js`. Sigue con su búsqueda de una sola letra; se revisa en el SPEC 06.
- Listbox reordenable (mover opciones o pasarlas entre dos listas).
- Combobox con autocompletado en línea (`aria-autocomplete="both"`), con popup de tipo `grid` o `dialog`, multiselección (chips) u opciones creadas por JS, array de datos o fuente asíncrona.
- Integración de Combobox y Spinbutton en el resumen de errores de `FormValidation` (SPEC 04).
- Spinbutton con formato de miles, moneda o unidades que cambien con el valor; repetición al mantener pulsado el botón −/+.
- Window splitter con más de dos paneles, splitters anidados o persistencia de la posición entre sesiones.
- Generador de ids: los ids van escritos en el marcado o se derivan del `id` existente.
- Añadir Bootstrap o cualquier dependencia de ejecución.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/typeahead.js
export function normalizeText(text);
// → minúsculas, sin diacríticos (NFD) y recortado: «Ávila» → «avila».
export function createTypeahead({ timeout = 500, getText = (el) => el.textContent } = {});
// → { search(key, items, currentIndex) → índice | -1, reset() }
// Acumula teclas imprimibles durante `timeout` ms. Busca desde currentIndex + 1 con envoltura.
// Repetir la misma letra («aaa») recorre las opciones que empiezan por ella.

// src/components/listbox/listbox.js
export class Listbox {
  constructor(el);         // el = [data-listbox] con role="listbox"; modo según aria-multiselectable
  get multiple();
  get value();             // simple: string | null; múltiple: string[]. De data-value o, si no, del texto.
  set value(v);            // marca las opciones; no dispara el evento
  destroy();
}
export function initListboxes(root = document);
// Evento: 'listbox:change' (bubbles) con detail { value }.

// src/components/combobox/combobox.js
export class Combobox {          // editable: [data-combobox] sobre <input>
  constructor(input);
  get value(); get expanded();
  open(); close(); destroy();
}
export class SelectCombobox {    // solo-selección: [data-combobox] sobre <select>
  constructor(select);           // oculta el <select> y crea el combobox; destroy() lo restaura
  get value(); set value(v); get expanded();
  open(); close(); destroy();
}
export function initComboboxes(root = document); // elige la clase por la etiqueta del elemento
// Evento: 'combobox:change' (bubbles) con detail { value }.

// src/components/spinbutton/spinbutton.js
export class Spinbutton {
  constructor(input, { format } = {}); // format(value) => string para aria-valuetext
  get value(); set value(v);           // acota a min/max y redondea al paso
  stepUp(n = 1); stepDown(n = 1);
  validate();                          // → boolean; usa setFieldError()/clearFieldError()
  destroy();                           // quita los botones −/+ que creó
}
export function initSpinbuttons(root = document);
// [data-spinbutton]; lee aria-valuemin/max/now, data-step (1), data-step-large (10 × step) y data-format="{value} kg".
// Evento: 'spinbutton:change' (bubbles) con detail { value }.

// src/components/window-splitter/window-splitter.js
export class WindowSplitter {
  constructor(separator);   // separator = [data-splitter] con role="separator" y aria-controls del panel principal
  get value();              // porcentaje 0–100 del panel principal
  set value(v);             // acota a aria-valuemin/max
  get collapsed();
  collapse(); restore(); destroy();
}
export function initWindowSplitters(root = document);
// Lee aria-valuenow/min/max, aria-orientation y data-step (5).
// Evento: 'splitter:change' (bubbles) con detail { value }.
```

Convenciones (las mismas que en los SPEC 01 a 04):

- Clases CSS con prefijo `c-` y BEM: `c-listbox`, `c-listbox__option`, `c-combobox__popup`, `c-combobox__empty`, `c-spinbutton__button`, `c-splitter__pane`…
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en atributos (`aria-selected`, `aria-expanded`, `aria-activedescendant`, `aria-valuenow`, `hidden`), sin copia en variables.
- Ids: escritos en el marcado. Cuando el JS crea elementos, deriva sus ids del `id` del elemento original: `<id>-combobox`, `<id>-listbox`, `<id>-opt-<n>`, `<id>-label`. Sin `id`, el constructor lanza un error.
- Opción activa o seleccionada: `aria-selected="true"` más un icono de marca `aria-hidden="true"`, no solo color.
- Textos por defecto en español: «Sin resultados», «1 resultado», «N resultados», «Disminuir», «Aumentar», «Introduce un número».
- Objetivo táctil ≥ 24×24 px en opciones, botones −/+ y separador.
- Estilos solo con los tokens de `src/tokens/tokens.css`. Si faltan tokens, se añaden en el paso que los necesite.

Estructura de carpetas resultante:

```
src/utils/
├─ typeahead.js
└─ typeahead.test.js
src/components/
├─ listbox/          html, css, js, stories, test, README   — rovingTabindex + typeahead
├─ combobox/         html, css, js, stories, test, README   — enlaza listbox.css; typeahead, dismiss, placement, live-region, field-validation
├─ spinbutton/       html, css, js, stories, test, README   — field-validation
└─ window-splitter/  html, css, js, stories, test, README
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos del `README.md` raíz.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad typeahead.**
   Crear `src/utils/typeahead.js` y `typeahead.test.js`.
   Tests (con temporizadores falsos): «ma» tecleado seguido encuentra la primera opción que empieza por «ma» (incluida «Málaga»); tras 500 ms el búfer se vacía; «a» repetida recorre las opciones que empiezan por «a»; la búsqueda empieza después de la opción actual y da la vuelta; las tildes y mayúsculas no cuentan; sin coincidencia devuelve `-1`.
2. **Listbox: marcado y estilos.**
   Crear `src/components/listbox/` con `<ul role="listbox" aria-labelledby>` y `<li role="option">`, variante con `role="group"` + `aria-labelledby` por grupo, y variante múltiple.
   Opción seleccionada con `aria-selected="true"`, fondo e icono de marca; deshabilitada con `aria-disabled="true"`.
   Sin JS todavía: la lista se lee pero no se selecciona (ver «Decisiones»).
   Historias con ids únicos por render.
3. **Listbox: selección simple.**
   Crear `listbox.js` con `Listbox`.
   `rovingTabindex()` vertical y sin envoltura; Tab entra en la opción seleccionada o, si no hay, en la primera.
   ↑/↓/Inicio/Fin mueven el foco y la selección; las opciones deshabilitadas se saltan.
   Clic selecciona. Typeahead con `createTypeahead()`.
   Tests: la selección sigue al foco, solo una opción tiene `aria-selected="true"`, el estado inicial sale del HTML, el typeahead enfoca y selecciona, y se dispara `listbox:change`.
4. **Listbox: selección múltiple y formulario.**
   Con `aria-multiselectable="true"`: ↑/↓ solo mueven el foco; Espacio alterna; Mayús+↑/↓ mueve y alterna; Ctrl+Mayús+Inicio/Fin seleccionan hasta el extremo; Ctrl+A selecciona todo o, si ya estaba todo, nada.
   Clic alterna y Mayús+clic selecciona el rango desde la última opción activada.
   Las no seleccionadas llevan `aria-selected="false"`.
   Con `data-name`, el JS mantiene un `<input type="hidden" name>` por valor seleccionado junto al listbox.
   Tests: Espacio alterna, Ctrl+A, rango con Mayús, `value` devuelve un array, y los inputs ocultos siguen a la selección.
5. **Combobox editable: estructura y teclado.**
   Crear `src/components/combobox/` con `<label for>`, `<input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls>` y `<ul role="listbox" hidden>` con opciones de `id` escrito. El CSS enlaza `listbox.css` para las opciones.
   Crear `combobox.js` con `Combobox`.
   Escribir filtra por «contiene» con `normalizeText()` y abre. ↓ abre y activa la primera; ↑ la última; Alt+↓ abre sin activar. Con la lista abierta, ↑/↓ mueven `aria-activedescendant` con envoltura y la opción activa lleva `aria-selected="true"`.
   Enter acepta la opción activa y cierra; Escape cierra y, con la lista ya cerrada, vacía el campo. ←/→/Inicio/Fin mueven el cursor y quitan `aria-activedescendant`.
   Clic en una opción la acepta y devuelve el foco al input. Clic o foco fuera cierra (`dismissable()`).
   Tests: el foco DOM nunca sale del input, filtro sin tildes («avila» encuentra «Ávila»), Enter acepta, doble Escape vacía y `aria-expanded` sigue al estado.
6. **Combobox editable: anuncios, posición y modo estricto.**
   Con 0 resultados: lista `hidden`, `aria-expanded="false"` y `<p class="c-combobox__empty">Sin resultados</p>` visible.
   Tras 500 ms sin escribir, `announce()` con «Sin resultados», «1 resultado» o «N resultados».
   La lista se coloca con `placeFloating()` (abajo y, si no cabe, arriba).
   Con `data-strict`, salir del campo con un texto que no coincide con ninguna opción llama a `setFieldError()` con `data-error-strict` o «Elige una opción de la lista»; elegir una opción lo retira.
   Tests (temporizadores falsos): un solo anuncio tras varias teclas seguidas, texto de 0 resultados, y error en modo estricto con `aria-invalid` en el input.
7. **Combobox solo-selección.**
   Añadir `SelectCombobox`: lee el `<select data-combobox>`, le pone `hidden` y crea delante un `<div role="combobox" tabindex="0" aria-haspopup="listbox" aria-labelledby>` con el texto de la opción elegida y su `<ul role="listbox">`.
   La `<label for>` recibe `id` (`<id>-label`) si no lo tenía, y hacer clic en ella enfoca el combobox.
   Cerrado: ↓/↑/Enter/Espacio abren; Alt+↓ abre sin mover; Inicio/Fin abren en la primera o la última; una tecla imprimible abre y busca con typeahead.
   Abierto: ↑/↓/Inicio/Fin/RePág/AvPág (10 opciones) mueven; Enter, Espacio, Alt+↑ y Tab eligen y cierran; Escape cierra sin cambiar.
   Elegir actualiza el `<select>` oculto y dispara `change` en él y `combobox:change`. `destroy()` quita el combobox y muestra el `<select>`.
   Tests: el valor del `<select>` sigue a la elección, Escape no cambia el valor, typeahead con la lista cerrada, `<optgroup>` se convierte en `role="group"`, y `destroy()` deja el `<select>` visible.
8. **Spinbutton: marcado, estilos y teclado.**
   Crear `src/components/spinbutton/` con `<div class="c-field" data-field>`, `<label for>` y `<input type="text" inputmode="decimal" role="spinbutton" aria-valuenow aria-valuemin aria-valuemax name>`.
   Crear `spinbutton.js` con `Spinbutton`: inserta los botones `<button type="button" tabindex="-1" aria-label="Disminuir/Aumentar">` y los deshabilita en el mínimo y el máximo.
   ↑/↓ suman o restan `data-step`; RePág/AvPág, `data-step-large`; Inicio/Fin van a min/max.
   El valor se muestra con coma decimal (`Intl.NumberFormat('es-ES', { useGrouping: false })`) y `aria-valuetext` usa `data-format`.
   Sin JS es un campo de texto que se envía igual.
   Tests: cada tecla, acotado en los extremos, botones deshabilitados en min/max, el foco sigue en el input tras pulsar −/+, y `aria-valuetext` con formato.
9. **Spinbutton: escritura a mano.**
   Al salir del campo: «2,5» y «2.5» valen 2,5; un valor fuera de rango se acota y se reescribe; un texto no numérico llama a `setFieldError()` con «Introduce un número» y no cambia `aria-valuenow`.
   Corregirlo retira el error. Campo vacío y `required` usa el mensaje de obligatorio de `DEFAULT_MESSAGES`.
   Tests: coma y punto, acotado, error de texto no numérico y su retirada.
10. **Window splitter: marcado, estilos y teclado.**
    Crear `src/components/window-splitter/` con `<div class="c-splitter c-splitter--horizontal">`, panel principal con `id`, `<div role="separator" aria-controls aria-label aria-orientation>` y panel secundario.
    Variante apilada con `c-splitter--vertical` y `aria-orientation="horizontal"`.
    El tamaño se aplica con la propiedad `--c-splitter-position` en el contenedor; sin JS los paneles quedan al 50 %.
    Crear `window-splitter.js` con `WindowSplitter`: añade `tabindex="0"`, `aria-valuenow/min/max` y `aria-valuetext` («30 %»).
    ←/→ (separador vertical) o ↑/↓ (horizontal) mueven `data-step`; Inicio/Fin van a min/max; Enter colapsa al mínimo y, si ya está colapsado, restaura la posición anterior.
    Tests: cada tecla, acotado, colapsar y restaurar, `aria-valuenow` sincronizado con `--c-splitter-position` y evento `splitter:change`.
11. **Window splitter: arrastre.**
    `pointerdown` con `setPointerCapture()`, `pointermove` calcula el porcentaje sobre el contenedor y `pointerup` termina. El separador recibe el foco al empezar a arrastrar.
    Cursor `col-resize`/`row-resize`, zona de agarre ≥ 24 px y `touch-action: none`.
    Tests en jsdom de la conversión píxeles → porcentaje con `getBoundingClientRect` simulado; el arrastre real se prueba en Playwright.
12. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js` (ids `componentes-<nombre>--<historia>`).
    Añadir tests e2e de teclado: Listbox (↓ mueve la selección, Espacio alterna en el múltiple), Combobox editable (escribir filtra y Enter acepta), Combobox solo-selección (Enter abre, ↓ y Enter eligen y el `<select>` cambia), Spinbutton (↑ suma y Fin va al máximo), Window splitter (→ cambia `aria-valuenow`, Enter colapsa, y arrastre con el ratón).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `typeahead.js` en «Estructura» y en el párrafo de `src/utils/`.
    Actualizar la fila 05 de la tabla del SPEC 01 y añadir la del 06, según la tabla de «Por qué existe este spec».

## Criterios de aceptación

- [ ] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [ ] `npm run lint:html` termina sin errores.
- [ ] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [ ] `npm run build` genera `dist/<componente>/` con `.js`, `.css` y `.html` para `listbox`, `combobox`, `spinbutton` y `window-splitter`, además de los 31 existentes.
- [ ] Ningún `.js` de `dist/` contiene `import` de rutas relativas: `typeahead` y las demás utilidades quedan empaquetadas dentro.
- [ ] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía».
- [ ] `typeahead`: «ma» tecleado en menos de 500 ms encuentra la primera opción que empieza por «ma»; tras 500 ms sin teclas, la siguiente tecla empieza una búsqueda nueva; `normalizeText('Ávila')` devuelve `'avila'`.
- [ ] Listbox simple: Tab entra una sola vez, en la opción seleccionada; ↓ mueve el foco y la selección; solo una opción tiene `aria-selected="true"`.
- [ ] Listbox múltiple: tiene `aria-multiselectable="true"`; ↓ no cambia la selección; Espacio alterna `aria-selected`; Ctrl+A selecciona todas; `value` devuelve un array.
- [ ] Listbox con `data-name`: hay un `<input type="hidden">` con ese `name` por cada valor seleccionado, y ninguno más.
- [ ] Listbox: las opciones con `aria-disabled="true"` no reciben el foco con las flechas ni se seleccionan con clic.
- [ ] Combobox editable: `document.activeElement` es el input durante toda la navegación por la lista, y `aria-activedescendant` apunta al `id` de la opción activa.
- [ ] Combobox editable: escribir «avila» muestra la opción «Ávila»; con 0 resultados el texto «Sin resultados» es visible y `aria-expanded="false"`.
- [ ] Combobox editable: tras escribir varias letras seguidas se hace una sola llamada a `announce()` con el recuento.
- [ ] Combobox editable: Enter acepta la opción activa; Escape cierra; un segundo Escape vacía el campo.
- [ ] Combobox con `data-strict`: salir con un texto que no es una opción deja `aria-invalid="true"` y un mensaje enlazado en `aria-describedby`.
- [ ] Combobox solo-selección: el `<select>` original tiene `hidden` y su `value` coincide con la opción elegida; enviar el formulario incluye ese valor.
- [ ] Combobox solo-selección: el combobox tiene nombre accesible desde la `<label>` original, y hacer clic en ella le da el foco.
- [ ] Combobox solo-selección: Escape cierra la lista sin cambiar el valor; Tab con la lista abierta elige la opción activa.
- [ ] Combobox solo-selección: `destroy()` deja el `<select>` visible y elimina el combobox creado.
- [ ] Spinbutton: el input tiene `role="spinbutton"`, `aria-valuenow`, `aria-valuemin` y `aria-valuemax`; ↑/↓, RePág/AvPág e Inicio/Fin cambian `aria-valuenow` según el paso.
- [ ] Spinbutton: los botones −/+ tienen `tabindex="-1"` y nombre accesible, están deshabilitados en el extremo correspondiente y pulsarlos no saca el foco del input.
- [ ] Spinbutton: escribir «2,5» y salir deja `aria-valuenow="2.5"`; escribir «abc» y salir muestra «Introduce un número» con `aria-invalid="true"` y no cambia `aria-valuenow`.
- [ ] Spinbutton: sin JS no hay botones −/+ en la página y el campo se envía con su valor.
- [ ] Window splitter: el separador tiene `tabindex="0"`, `aria-valuenow` entre `aria-valuemin` y `aria-valuemax`, `aria-controls` del panel principal y nombre accesible.
- [ ] Window splitter: las flechas de su orientación cambian `aria-valuenow` en `data-step`, y el panel principal cambia de tamaño a la vez.
- [ ] Window splitter: Enter lleva `aria-valuenow` al mínimo y un segundo Enter restaura el valor anterior.
- [ ] Window splitter: arrastrar el separador con el ratón en Playwright cambia `aria-valuenow`.
- [ ] Ningún componente del spec usa texto en inglés en `aria-label`, mensajes, anuncios ni texto oculto.
- [ ] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible` (o, en el combobox, sobre la opción activa).
- [ ] Todas las transiciones nuevas se desactivan con `prefers-reduced-motion: reduce`.
- [ ] La opción seleccionada o activa se distingue sin depender del color y también con `forced-colors: active`.
- [ ] Los tests existentes de los SPEC 01 a 04 siguen pasando sin modificar sus aserciones.

## Decisiones

- **Sí:** partir los patrones avanzados en SPEC 05 (selección y valor) y SPEC 06 (compuestos). Desviación de la tabla del SPEC 01, que preveía un único spec: ocho patrones complejos darían un plan de unos 20 pasos difícil de verificar.
- **No:** un único SPEC 05. **No:** tres specs. Dos mantienen el tamaño de los SPEC 03 y 04.
- **Sí:** roving tabindex (`rovingTabindex()`) en Listbox, y en Tree y Grid en el SPEC 06. Reutiliza la utilidad y el foco DOM real tiene mejor soporte en lectores que `aria-activedescendant`.
- **Sí:** `aria-activedescendant` solo en Combobox. El foco DOM debe quedarse en el input para poder seguir escribiendo.
- **No:** `aria-activedescendant` en todos los componentes. No reutiliza `rovingTabindex` y VoiceOver lo sigue peor.
- **Sí:** Combobox comparte con Listbox solo el CSS `c-listbox` y la utilidad de typeahead; su JS es propio.
- **No:** un modo `activedescendant` dentro de la clase `Listbox`. Complicaría Listbox para un único uso.
- **Sí:** utilidad `src/utils/typeahead.js` con búfer de 500 ms, como recomienda APG. Se crea en el spec que la usa por primera vez, igual que las demás utilidades.
- **No:** migrar `Menu Button` a la nueva utilidad en este spec. Cambiaría su comportamiento («pa» ya no salta a la segunda «a») y sus tests; se revisa con Menubar en el SPEC 06.
- **No:** una sola letra sin búfer copiada en cada componente. Es lo que APG desaconseja en listas largas y duplica código.
- **Sí:** Listbox con selección simple y múltiple y con grupos. **No:** Listbox reordenable; es el ejemplo más grande de APG y no lo pide ningún otro componente.
- **Sí:** en el Listbox múltiple, las flechas mueven solo el foco y Espacio alterna (modelo recomendado de APG). Así se puede recorrer la lista sin perder la selección.
- **Sí:** Listbox escrito con ARIA en el HTML. Sin JS la lista se lee pero no se selecciona; el README recomienda `<select>` o casillas nativas cuando basten.
- **Sí:** Listbox comunica su valor con el evento `listbox:change`, el getter `value` y, con `data-name`, inputs ocultos para el formulario.
- **Sí:** las opciones deshabilitadas se saltan con las flechas, como en Menu Button. APG permite las dos cosas; saltarlas es lo que ya hace `rovingTabindex`.
- **Sí:** Combobox solo-selección y editable con lista filtrada. **No:** autocompletado en línea ni popup `grid`/`dialog`; cada uno añade estado y teclado propios.
- **Sí:** el solo-selección mejora un `<select>` nativo. Sin JS funciona el `<select>`, y con JS el `<select>` oculto sigue siendo el valor del formulario. Esto concreta la respuesta «input hidden con name»: el `<select>` original hace ese papel sin duplicar el `name`.
- **Sí:** el editable parte de un `<input name>` que, sin JS, es un campo de texto libre y envía lo escrito.
- **Sí:** opciones solo desde el HTML. **No:** array en JS ni fuente asíncrona; añaden estados de carga y error que merecen su propio spec.
- **Sí:** filtro por «contiene» sin tildes ni mayúsculas. Encuentra «Castellón» al escribir «castell» o «llon», y escribir sin tildes es lo habitual.
- **Sí:** valor libre por defecto y `data-strict` para restringirlo, con error vía `setFieldError()`. Reutiliza la utilidad del SPEC 04.
- **Sí:** «Sin resultados» visible y recuento anunciado con `announce()` tras 500 ms sin escribir. Sin recuento, el usuario de lector no sabe cuántas opciones quedan; el retardo evita un anuncio por tecla.
- **No:** solo `aria-expanded` y `aria-activedescendant`, como el ejemplo APG. Más silencioso, pero deja al usuario sin el recuento.
- **Sí:** la lista emergente se coloca con `placeFloating()` y se cierra al hacer clic fuera con `dismissable()`, igual que Tooltip y Dropdown.
- **Sí:** Spinbutton sobre `<input type="text" inputmode="decimal" role="spinbutton">`. Controla `aria-valuetext`, la coma decimal y la rueda del ratón, que `type="number"` no permite.
- **No:** `<input type="number">`. Rechaza la coma en algunos navegadores y cambia el valor con la rueda sin querer.
- **Sí:** los botones −/+ los crea el JS con `tabindex="-1"`. Sin JS no hay botones muertos, y con JS no añaden paradas de tabulación (APG).
- **Sí:** el valor escrito se acota al salir y un texto no numérico da error con `setFieldError()`. **No:** bloquear teclas no numéricas; confunde al lector y a quien pega texto.
- **Sí:** el input muestra y envía el valor con coma decimal (`es-ES`, sin separador de miles). Coherente con el idioma de la página (ver «Riesgos»).
- **Sí:** Window splitter con valor en porcentaje del panel principal (0–100), como APG. No depende del tamaño de la ventana.
- **No:** píxeles en `aria-valuenow`. Cambia al redimensionar la ventana sin que el usuario haga nada.
- **Sí:** paso de flecha `data-step` (5 por defecto), sin modificador Mayús. Un único paso es más fácil de documentar y de probar.
- **Sí:** Enter colapsa al mínimo y restaura la posición anterior (variante colapsable de APG).
- **Sí:** el `.html` del splitter no lleva `tabindex` ni `aria-value*`: los añade el JS. Sin JS no hay una parada de tabulación que no hace nada.
- **No:** persistir la posición del splitter en `localStorage`. Introduce persistencia y versionado de clave; si hace falta, va en su propio spec.
- **Sí:** Menubar (SPEC 06) en una carpeta `menubar/` nueva, extrayendo la lógica de menú común de `menu-button/` sin cambiar la API de `MenuButton`, con submenús de un nivel. Se anota aquí porque se decidió al definir este spec.
- **Sí:** `Listbox`, `Combobox`, `SelectCombobox`, `Spinbutton` y `WindowSplitter` siguen la convención de las clases del proyecto: constructor con el elemento, `destroy()` y una función `init…`.

## Riesgos

| Riesgo                                                                                                                       | Mitigación                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VoiceOver (Safari) no lee la opción referenciada por `aria-activedescendant` si su `id` cambia o la opción se vuelve a crear | Las opciones del combobox existen en el DOM desde el principio y el filtro solo les pone `hidden`; nunca se recrean. Prueba manual con VoiceOver y NVDA.                      |
| Un `<select required>` oculto con `hidden` impide el envío nativo («control inválido no enfocable») sin decir dónde          | El README lo documenta; el ejemplo con `required` va dentro de un formulario `data-validate`. Si axe o Playwright lo detectan, se pasa `required` al combobox en el paso 7.   |
| `role="combobox"` sobre un `<div>` puede ser marcado por `html-validate`                                                     | El `<div>` lo crea el JS, así que no está en ningún `.html` lintado; axe lo audita en la historia.                                                                            |
| El servidor espera punto decimal y recibe «2,5» del Spinbutton                                                               | Se documenta en el README; el autor lo normaliza o usa `spinbutton:change` con el número. Si se convierte en un problema, se añade un input oculto con el valor en otro spec. |
| El typeahead captura Espacio en el Listbox múltiple mientras hay un búfer activo                                             | Como en APG: con el búfer activo, Espacio forma parte de la búsqueda; sin búfer, alterna. Lo cubre un test.                                                                   |
| El Escape del combobox cierra también un `<dialog>` contenedor                                                               | `dismissable()` cancela el evento (como en Menu Button); el segundo Escape (vaciar) también se cancela. Lo cubre un test.                                                     |
| jsdom no calcula layout ni implementa `setPointerCapture`                                                                    | Los tests de Vitest simulan `getBoundingClientRect`; el arrastre y la posición de la lista se verifican en Playwright.                                                        |
| La lista del combobox desborda el viewport a 320 px                                                                          | `placeFloating()` elige el lado y la lista tiene `max-height` con scroll; la opción activa se mantiene visible con `scrollIntoView({ block: 'nearest' })`.                    |
| Los componentes dependen de `src/utils/`: copiar solo su carpeta rompe el import                                             | Cada README lo indica. `dist/` es autónomo porque Vite empaqueta las utilidades (criterio de aceptación). Combobox además enlaza `listbox.css`.                               |
| Las herramientas automáticas solo detectan una parte de los problemas                                                        | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist del README raíz).                                                                           |

## Lo que **no** entra en este spec

- Menubar, Tree view, Grid y Feed → SPEC 06.
- Migrar Menu Button a la utilidad de typeahead.
- Listbox reordenable.
- Combobox con autocompletado en línea, popup `grid` o `dialog`, multiselección, opciones por JS o fuente asíncrona.
- Integración de Combobox y Spinbutton en el resumen de errores de `FormValidation`.
- Spinbutton con miles, moneda, unidades variables o repetición al mantener pulsado.
- Window splitter con más de dos paneles, anidado o con posición persistente.
- Generador de ids.
- Bootstrap o cualquier otra dependencia de ejecución.

Cada uno de ellos, si llega, va en su propio spec.
