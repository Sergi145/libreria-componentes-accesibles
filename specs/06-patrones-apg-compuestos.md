# SPEC 06 — Patrones APG compuestos

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03, SPEC 04, SPEC 05
> **Fecha:** 2026-10-01
> **Objetivo:** Crear las utilidades compartidas de menú y de ordenación y los componentes Menubar, Tree view, Grid y Feed según sus patrones APG.

## Por qué existe este spec

Es la segunda mitad de los patrones avanzados de la guía, tal como se repartieron en el SPEC 05 (ver su tabla «Por qué existe este spec» y la del SPEC 01).
Agrupa los widgets compuestos: un único punto de tabulación da acceso a muchos elementos, y el teclado decide cómo se recorren (en barra y menús, en árbol, en dos dimensiones o por artículos).

Dos componentes ya existentes tienen lógica que aquí se necesita otra vez:

- `MenuButton` (SPEC 02) ya sabe activar `menuitem`, `menuitemcheckbox` y `menuitemradio`. Menubar la necesita igual.
- `SortableTable` (SPEC 04) ya sabe comparar celdas con `Intl.Collator`. Grid la necesita igual.

En los dos casos la lógica se extrae a `src/utils/` (ya hay dos usuarios) sin cambiar la API ni los tests del componente original.

## Alcance

**Dentro:**

- Utilidad `src/utils/menu.js` con sus tests, extraída de `menu-button.js`: selector de elementos de menú, filtro de habilitados, foco con `tabindex`, activación de casillas y radios, y búsqueda de una letra. `MenuButton` pasa a usarla sin cambiar su API, su comportamiento ni sus tests.
- Utilidad `src/utils/sort.js` con sus tests, extraída de `table.js`: valor de ordenación de una celda (`data-sort-value` o texto) y comparación `text`/`number`. `SortableTable` pasa a usarla sin cambiar su API ni sus tests.
- **Menubar** (`menubar/`): `role="menubar"` horizontal con roving tabindex. Cada elemento de la barra es una acción o abre un menú (`aria-haspopup="menu"`). Los menús llevan `menuitem`, `menuitemcheckbox` y `menuitemradio` (con `role="group"`), sin submenús anidados. Typeahead con `createTypeahead()` en la barra y en los menús.
- **Tree view** (`tree-view/`): lista anidada `<ul>`/`<li>` que el JS convierte en `role="tree"`/`treeitem`/`group`. Expandir y plegar, roving tabindex sobre los nodos visibles, typeahead, `*` para expandir los hermanos. Selección simple (la selección sigue al foco) y múltiple (`aria-multiselectable="true"`), como Listbox. Evento `tree:change`, getter `value` e `<input type="hidden">` por valor si lleva `data-name`.
- **Grid** (`grid/`): `<table>` de datos que el JS convierte en `role="grid"` de solo lectura con navegación por celdas (flechas, Inicio/Fin, Ctrl+Inicio/Fin, RePág/AvPág). Una celda con un único enlace o botón da el foco a ese elemento. Columnas ordenables con `aria-sort`.
- **Feed** (`feed/`): `role="feed"` con `<article>` enfocables, `aria-posinset`/`aria-setsize`, RePág/AvPág entre artículos y Ctrl+Inicio/Ctrl+Fin para salir. Carga por scroll infinito con un callback `loadMore()`, `aria-busy` durante la carga, mensaje y botón «Reintentar» si falla, y texto final «No hay más artículos». Sin JS, un enlace «Cargar más».
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Migrar `MenuButton` a `typeahead.js`. Sigue con su búsqueda de una sola letra (ver «Decisiones»).
- Menubar con submenús anidados, con enlaces de navegación (`<a role="menuitem">`) o vertical (`aria-orientation="vertical"`).
- Menú contextual (clic derecho) y atajos de teclado globales (`aria-keyshortcuts`).
- Tree view con carga perezosa de hijos, arrastrar y soltar, selección en cascada (padre → hijos, casilla tri-estado) o edición de nombres.
- Grid editable (Enter/F2 para editar, Escape para cancelar), celdas con varios controles, layout grid (rejilla de maquetación), selección de filas o celdas, columnas fijas, redimensionado, filtrado, paginación y `treegrid`.
- Utilidad de navegación 2D compartida: la navegación de Grid vive en `grid.js`.
- Feed con datos desde una URL (`fetch`) o con virtualización (quitar artículos del DOM).
- Generador de ids: los ids van escritos en el marcado o se derivan del `id` existente.
- Añadir Bootstrap o cualquier dependencia de ejecución.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/menu.js (extraída de menu-button.js)
export const MENU_ITEM_SELECTOR; // '[role^="menuitem"]'
export function isMenuItemEnabled(item);        // ni disabled ni aria-disabled="true"
export function getMenuItems(menu);             // habilitados, en orden del DOM
export function focusMenuItem(menu, item);      // tabindex "0" en item, "-1" en el resto, y foco
export function toggleMenuItem(item, menu);
// → true si era casilla (alterna aria-checked) o radio (marca uno de su role="group");
//   false si es un menuitem de acción (quien llama decide si cierra).
export function findMenuItemByChar(char, items, current); // búsqueda de una letra sin búfer (la de MenuButton)

// src/utils/sort.js (extraída de table.js)
export function getSortValue(cell);             // data-sort-value o texto recortado
export function compareSortValues(a, b, type);  // type: 'text' (Intl.Collator('es', { numeric: true })) | 'number'

// src/components/menubar/menubar.js
export class Menubar {
  constructor(el);          // el = [data-menubar] con role="menubar"
  get openMenu();           // el <ul role="menu"> abierto o null
  open(barItem, { focus = 'first' } = {}); // focus: 'first' | 'last'
  close({ returnFocus = true } = {});
  destroy();
}
export function initMenubars(root = document);
// Sin evento propio, como MenuButton: el autor escucha `click` en los elementos.

// src/components/tree-view/tree-view.js
export class Tree {
  constructor(el);          // el = [data-tree] sobre <ul> con id; data-multiple → aria-multiselectable
  get multiple();
  get value();              // simple: string | null; múltiple: string[]. De data-value o, si no, del texto del nodo.
  set value(v);             // marca los nodos; no dispara el evento
  expand(item); collapse(item);
  destroy();                // quita listeners, roles y atributos añadidos: vuelve a ser una lista anidada
}
export function initTrees(root = document);
// Evento: 'tree:change' (bubbles) con detail { value }.

// src/components/grid/grid.js
export class Grid {
  constructor(table);       // table = [data-grid]; lee data-page-size (5)
  get activeCell();         // <td>/<th> con la parada de tabulación
  focusCell(rowIndex, colIndex);
  sort(columnIndex, direction); // direction: 'ascending' | 'descending'
  get sorted();             // { column, direction } | null
  destroy();
}
export function initGrids(root = document);

// src/components/feed/feed.js
export class Feed {
  constructor(el, { loadMore } = {});
  // el = [data-feed]. loadMore(page) → Promise<HTMLElement[]> con <article> nuevos;
  // [] significa que no hay más. Sin loadMore el feed es estático (solo teclado).
  get busy();               // aria-busy === 'true'
  get done();               // true tras recibir []
  load();                   // carga el siguiente lote (lo llama el scroll o «Reintentar»)
  destroy();
}
export function initFeeds(root = document); // feeds estáticos; con carga se usa new Feed(el, { loadMore })
```

Convenciones (las mismas que en los SPEC 01 a 05):

- Clases CSS con prefijo `c-` y BEM: `c-menubar`, `c-menubar__item`, `c-menubar__menu`, `c-tree`, `c-tree__label`, `c-tree__toggle`, `c-grid`, `c-feed`, `c-feed__status`…
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en atributos (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-sort`, `aria-busy`, `tabindex`, `hidden`), sin copia en variables.
- Ids: escritos en el marcado. Cuando el JS los necesita, los deriva del `id` del componente: `<id>-label-<n>` en Tree. Sin `id`, el constructor de `Tree` lanza un error.
- Nodo u opción seleccionada: `aria-selected="true"` más un icono de marca `aria-hidden="true"`, no solo color. Nodo con hijos: icono de flecha `aria-hidden="true"` que gira con `aria-expanded`.
- Textos por defecto en español: «Cargando más artículos…», «No se pudieron cargar más artículos», «Reintentar», «No hay más artículos», «Cargar más», «Ordenar por <columna>».
- Objetivo táctil ≥ 24×24 px en elementos de menú, nodos del árbol, celdas interactivas y botones.
- Estilos solo con los tokens de `src/tokens/tokens.css`. Si faltan tokens, se añaden en el paso que los necesite.

Estructura de carpetas resultante:

```
src/utils/
├─ menu.js         + menu.test.js
└─ sort.js         + sort.test.js
src/components/
├─ menu-button/    (cambia menu-button.js para usar utils/menu; sus tests no cambian)
├─ table/          (cambia table.js para usar utils/sort; sus tests no cambian)
├─ menubar/        html, css, js, stories, test, README   — menu, rovingTabindex, typeahead, dismiss
├─ tree-view/      html, css, js, stories, test, README   — rovingTabindex, typeahead
├─ grid/           html, css, js, stories, test, README   — enlaza table.css; sort
└─ feed/           html, css, js, stories, test, README   — enlaza spinner.css; live-region
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos de `AGENTS.md`.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad menu.**
   Crear `src/utils/menu.js` y `menu.test.js` moviendo de `menu-button.js` el selector, `isEnabled`, el foco con `tabindex`, la activación de casillas y radios y la búsqueda de una letra.
   `MenuButton` las importa; su API y `menu-button.test.js` no cambian.
   Tests: `getMenuItems()` salta deshabilitados; `toggleMenuItem()` alterna una casilla, marca un único radio de su grupo y devuelve `false` en una acción; `findMenuItemByChar()` busca desde el actual y da la vuelta.
2. **Utilidad sort.**
   Crear `src/utils/sort.js` y `sort.test.js` moviendo de `table.js` la lectura de `data-sort-value` y la comparación.
   `SortableTable` las importa; su API y `table.test.js` no cambian.
   Tests: `10` después de `9` en `number`, «Ávila» antes de «Burgos» en `text`, y `data-sort-value` tiene prioridad sobre el texto.
3. **Menubar: marcado y estilos.**
   Crear `src/components/menubar/` con `<ul role="menubar" aria-label>` y `<li role="none">` con `<button type="button" role="menuitem">`.
   Los que abren menú llevan `aria-haspopup="menu" aria-expanded="false" aria-controls` y un `<ul role="menu" aria-labelledby hidden>` con elementos de acción, un grupo de casillas y un grupo de radios (`role="group" aria-label`).
   Marca de `aria-checked="true"` con icono, no solo color. Historias con ids únicos por render.
4. **Menubar: barra.**
   Crear `menubar.js` con `Menubar`.
   `rovingTabindex()` horizontal con envoltura sobre los elementos de la barra; Tab entra una sola vez.
   ↓, Enter y Espacio abren el menú y enfocan su primer elemento; ↑ abre y enfoca el último. Clic abre o cierra.
   Un elemento de la barra sin menú se activa con Enter, Espacio o clic.
   Typeahead en la barra con `createTypeahead()`.
   Tests: una sola parada de tabulación, ←/→ con envoltura, ↓ abre con el foco en el primer elemento y `aria-expanded="true"`, y el typeahead enfoca el elemento correcto.
5. **Menubar: menús.**
   Dentro de un menú: ↑/↓ con envoltura e Inicio/Fin (`rovingTabindex()` vertical); typeahead con `createTypeahead()`.
   → cierra el menú y abre el del siguiente elemento de la barra (enfocando su primer elemento, o el propio elemento si no tiene menú); ← lo mismo hacia atrás.
   Activar un `menuitem` cierra y devuelve el foco a su elemento de la barra; casillas y radios usan `toggleMenuItem()` y no cierran.
   Escape cierra y devuelve el foco al elemento de la barra (`dismissable()`, que cancela el evento). Tab cierra y deja seguir el foco. Clic o foco fuera cierra.
   Tests: → pasa al siguiente menú abierto, Escape devuelve el foco, solo un menú abierto a la vez, casilla alterna sin cerrar, radio marca uno solo, y Tab cierra.
6. **Tree view: marcado, estilos y roles.**
   Crear `src/components/tree-view/` con `<ul class="c-tree" id data-tree aria-labelledby>` y `<li data-value>` con `<span class="c-tree__label">`; los nodos con hijos llevan `data-expanded="true|false"` y un `<ul>` anidado.
   Sin JS se lee como una lista anidada completa.
   Crear `tree-view.js` con `Tree`: pone `role="tree"`, `role="treeitem"` en cada `<li>`, `role="group"` en cada `<ul>` anidado, `aria-expanded` (desde `data-expanded`) con `hidden` en el grupo plegado, `aria-labelledby` hacia su etiqueta (id `<id>-label-<n>`) y el icono de flecha.
   `destroy()` lo deshace.
   Tests: roles y `aria-expanded` desde el HTML, el nombre del nodo no incluye el texto de sus hijos, y `destroy()` deja la lista original.
7. **Tree view: teclado y selección simple.**
   `rovingTabindex()` vertical sin envoltura sobre los nodos visibles; Tab entra en el nodo seleccionado o, si no hay, en el primero.
   ↓/↑ siguiente y anterior visible; → expande un nodo plegado o va a su primer hijo si ya está expandido; ← pliega un nodo expandido o va a su padre; Inicio/Fin primero y último visible; `*` expande los hermanos del nodo actual.
   Plegar un nodo que contiene el foco lo lleva al nodo plegado.
   La selección sigue al foco; clic selecciona y clic en la flecha expande o pliega. Typeahead con `createTypeahead()` sobre el texto de la etiqueta.
   Tests: cada tecla, los nodos de un grupo plegado no reciben foco, `*` expande, solo un nodo con `aria-selected="true"`, typeahead y evento `tree:change`.
8. **Tree view: selección múltiple y formulario.**
   Con `data-multiple` (→ `aria-multiselectable="true"`), mismo modelo que Listbox: las flechas solo mueven el foco; Espacio alterna; Mayús+↑/↓ mueve y alterna; Ctrl+Mayús+Inicio/Fin seleccionan hasta el extremo visible; Ctrl+A selecciona todos los visibles o, si ya estaban, ninguno.
   Clic alterna y Mayús+clic selecciona el rango visible desde el último nodo activado. Los no seleccionados llevan `aria-selected="false"`. Seleccionar un padre no selecciona sus hijos.
   Con `data-name`, un `<input type="hidden" name>` por valor seleccionado junto al árbol.
   Tests: Espacio alterna, Ctrl+A, rango con Mayús, `value` devuelve un array, sin cascada, y los inputs ocultos siguen a la selección.
9. **Grid: marcado, estilos y navegación.**
   Crear `src/components/grid/` con una `<table class="c-table c-grid" data-grid>` con `<caption>`, `<th scope>` y celdas con texto, un enlace o un botón. El CSS enlaza `table.css` y añade el anillo de foco de celda.
   Sin JS es una tabla de datos normal.
   Crear `grid.js` con `Grid`: pone `role="grid"` y una sola parada de tabulación; la celda activa tiene `tabindex="0"` o, si contiene un único enlace o botón, ese elemento; el resto, `tabindex="-1"`.
   ←/→/↑/↓ sin envoltura; Inicio/Fin primera y última celda de la fila; Ctrl+Inicio/Ctrl+Fin primera y última del grid; RePág/AvPág mueven `data-page-size` filas (5). Las cabeceras forman parte de la navegación.
   Tests: una sola parada de tabulación, cada tecla, sin envoltura en los bordes, y el foco va al botón cuando la celda lo contiene.
10. **Grid: ordenación.**
    Las cabeceras con `data-sort="text|number"` reciben un `<button type="button" tabindex="-1">` con su texto, que es el elemento enfocable de esa celda.
    Enter o Espacio (de serie en el botón) y clic ordenan con `compareSortValues()`: primera vez ascendente, segunda descendente. Solo una cabecera tiene `aria-sort`.
    Tras ordenar, el foco sigue en el botón de la cabecera.
    Tests: `aria-sort` alterna, cambiar de columna lo quita de la anterior, orden numérico, y el foco sigue en la cabecera.
11. **Feed: marcado, estilos y teclado.**
    Crear `src/components/feed/` con `<section class="c-feed" data-feed aria-labelledby>` y `<article aria-labelledby aria-describedby>` con título y resumen, más `<a class="c-feed__more" data-feed-more href>Cargar más</a>`.
    Crear `feed.js` con `Feed`: pone `role="feed"`, `aria-busy="false"`, `tabindex="0"` y `aria-posinset`/`aria-setsize` en cada artículo (`-1` mientras no se conoce el total).
    AvPág/RePág enfocan el artículo siguiente y anterior; Ctrl+Fin enfoca el primer elemento enfocable tras el feed y Ctrl+Inicio el anterior al feed.
    Sin `loadMore`, el enlace «Cargar más» se queda y `aria-setsize` es el número de artículos.
    Tests: `aria-posinset` correlativo, AvPág/RePág, salida con Ctrl+Fin/Ctrl+Inicio, y feed estático con `aria-setsize` final.
12. **Feed: carga, error y fin.**
    Con `loadMore`, el enlace «Cargar más» se oculta y un `IntersectionObserver` sobre el último artículo llama a `load()`; AvPág en el último artículo también.
    Durante la carga: `aria-busy="true"` y estado visible «Cargando más artículos…» con `c-spinner`. Los artículos nuevos se añaden al final con su `aria-posinset` sin mover el foco; luego `aria-busy="false"`.
    Si la promesa falla: `<p class="c-feed__status">` con «No se pudieron cargar más artículos» y un botón «Reintentar» que llama a `load()`, anunciado con `announce()`.
    Si devuelve `[]`: texto «No hay más artículos», `aria-setsize` final en todos los artículos y el observador se desconecta.
    No se lanzan dos cargas a la vez. La historia simula `loadMore` con un retardo y una variante que falla.
    Tests (con `IntersectionObserver` simulado): `aria-busy` durante la carga, el foco no cambia, error con «Reintentar» que vuelve a cargar, fin con `aria-setsize` final, y una sola carga simultánea.
13. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js` (ids `componentes-<nombre>--<historia>`).
    Añadir tests e2e de teclado: Menubar (↓ abre, → pasa al siguiente menú, Escape devuelve el foco), Tree view (→ expande, ↓ entra en el hijo, Espacio alterna en el múltiple), Grid (flechas mueven la celda, Enter en una cabecera ordena) y Feed (AvPág pasa al siguiente artículo y el scroll carga más).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `menu.js` y `sort.js` en «Estructura» y en el párrafo de `src/utils/`, y actualizar las notas de `menu-button/` y `table/` en sus README.

## Criterios de aceptación

- [ ] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [ ] `npm run lint:html` termina sin errores.
- [ ] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [ ] `npm run build` genera `dist/<componente>/` con `.js`, `.css` y `.html` para `menubar`, `tree-view`, `grid` y `feed`, además de los 35 existentes.
- [ ] Ningún `.js` de `dist/` contiene `import` de rutas relativas: `menu`, `sort` y las demás utilidades quedan empaquetadas dentro.
- [ ] `menu-button.test.js` y `table.test.js` pasan sin modificar ninguna línea, y `menu-button.js` y `table.js` importan de `src/utils/menu.js` y `src/utils/sort.js`.
- [ ] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía».
- [ ] Menubar: Tab entra una sola vez; ←/→ recorren la barra con envoltura; ↓ abre el menú con `aria-expanded="true"` y el foco en su primer elemento.
- [ ] Menubar: con un menú abierto, → cierra ese menú y abre el siguiente; nunca hay dos menús sin `hidden` a la vez.
- [ ] Menubar: Escape cierra el menú y `document.activeElement` es su elemento de la barra; un `<dialog>` contenedor no se cierra.
- [ ] Menubar: activar un `menuitemcheckbox` alterna `aria-checked` sin cerrar; activar un `menuitemradio` deja uno solo con `aria-checked="true"` en su grupo.
- [ ] Menubar: escribir «gu» en menos de 500 ms enfoca el primer elemento que empieza por «gu».
- [ ] Tree view: sin JS, el `.html` es una lista anidada sin atributos `role`; con JS tiene `role="tree"`, `treeitem` y `group`.
- [ ] Tree view: el nombre accesible de un nodo con hijos es solo el texto de su etiqueta.
- [ ] Tree view: → en un nodo plegado pone `aria-expanded="true"` y muestra el grupo; ← en un hijo enfoca su padre; ningún nodo dentro de un grupo plegado recibe el foco con las flechas.
- [ ] Tree view simple: ↓ mueve el foco y la selección; solo un nodo tiene `aria-selected="true"`; se dispara `tree:change`.
- [ ] Tree view múltiple: tiene `aria-multiselectable="true"`; ↓ no cambia la selección; Espacio alterna; seleccionar un padre no selecciona sus hijos; `value` devuelve un array.
- [ ] Tree view con `data-name`: hay un `<input type="hidden">` con ese `name` por cada valor seleccionado, y ninguno más.
- [ ] Grid: tiene `role="grid"` y una sola parada de tabulación; las flechas mueven el foco de celda sin envoltura; Ctrl+Fin enfoca la última celda.
- [ ] Grid: en una celda con un único botón o enlace, el foco está en ese elemento y no en el `<td>`.
- [ ] Grid: Enter en una cabecera ordenable pone `aria-sort="ascending"`, una segunda vez `"descending"`, y el foco sigue en esa cabecera; solo una cabecera tiene `aria-sort`.
- [ ] Grid: sin JS es una `<table>` con `<caption>` y sin `role="grid"`.
- [ ] Feed: tiene `role="feed"`; cada `<article>` es enfocable, tiene nombre accesible y `aria-posinset` correlativo desde 1.
- [ ] Feed: AvPág/RePág mueven el foco entre artículos; Ctrl+Fin enfoca el primer elemento enfocable posterior al feed.
- [ ] Feed: durante la carga `aria-busy="true"`; tras ella `aria-busy="false"`, los artículos nuevos están al final y `document.activeElement` no ha cambiado.
- [ ] Feed: si `loadMore()` falla se ve «No se pudieron cargar más artículos» con un botón «Reintentar», se llama a `announce()`, y pulsar «Reintentar» vuelve a llamar a `loadMore()`.
- [ ] Feed: si `loadMore()` devuelve `[]` se ve «No hay más artículos» y todos los artículos tienen el mismo `aria-setsize`, igual al total.
- [ ] Feed: sin JS se ve el enlace «Cargar más» con `href`.
- [ ] Ningún componente del spec usa texto en inglés en `aria-label`, mensajes, anuncios ni texto oculto.
- [ ] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible`.
- [ ] Todas las transiciones nuevas (flecha del árbol, apertura de menú) se desactivan con `prefers-reduced-motion: reduce`.
- [ ] El elemento seleccionado, marcado o expandido se distingue sin depender del color y también con `forced-colors: active`.
- [ ] Los tests existentes de los SPEC 01 a 05 siguen pasando sin modificar sus aserciones.

## Decisiones

- **Sí:** un único SPEC 06 con los cuatro componentes, como prevén las tablas de los SPEC 01 y 05. **No:** partirlo en 06 y 07; el plan queda en 13 pasos, del tamaño del SPEC 05.
- **Sí:** Menubar en `menubar/`, extrayendo la lógica de menú común de `menu-button/` sin cambiar la API ni los tests de `MenuButton` (decisión ya tomada en el SPEC 05).
- **Sí:** la lógica extraída va a `src/utils/menu.js` con sus tests. **No:** `menu-button/menu-core.js`; con dos usuarios es lógica compartida y su sitio es `src/utils/`.
- **Sí:** `menu.js` solo recoge la lógica de los elementos (habilitados, foco, casillas/radios, búsqueda de una letra). Abrir y cerrar el popup sigue en cada componente: en la barra, cambiar de menú con ←/→ tiene reglas que MenuButton no necesita.
- **Sí:** Menubar con acciones, casillas y radios (ejemplo «editor» de APG). **No:** menubar de navegación con enlaces; para navegación el proyecto usa `Dropdown` (Disclosure), y un `role="menu"` con enlaces cambia el modo de lectura sin aportar nada.
- **Sí:** cada elemento de la barra abre un menú sin submenús anidados (submenús de un nivel, SPEC 05).
- **Sí:** Menubar usa `createTypeahead()`. **No:** migrar `MenuButton` a la misma utilidad; cambiaría su comportamiento («pa» ya no salta a la segunda «a») y sus tests. Los dos menús se comportan distinto a propósito hasta que un spec decida migrarlo.
- **No:** copiar la búsqueda de una letra en Menubar. APG la desaconseja en menús largos.
- **Sí:** Menubar sin evento propio, como MenuButton: el autor escucha `click` en los elementos. Coherencia entre los dos menús.
- **Sí:** Menubar necesita JS, como MenuButton. Sin JS los menús quedan `hidden`; el README recomienda acciones visibles como alternativa si la página debe funcionar sin JS.
- **Sí:** Tree view con selección simple y múltiple con el mismo teclado que Listbox (SPEC 05). Quien conoce uno conoce el otro.
- **No:** selección en cascada ni casilla tri-estado. Es otra variante de APG y añade un estado mixto; el estado mixto ya existe en Checkbox (SPEC 04).
- **Sí:** el `.html` del árbol es una lista anidada y el JS añade los roles. Sin JS se lee todo; con roles escritos se verían `treeitem` que no responden y nodos plegados ocultos.
- **No:** ARIA escrito en el HTML del árbol, como en Listbox. En Listbox una lista plana sin JS sigue siendo legible; un árbol plegado sin JS esconde contenido.
- **Sí:** el estado inicial de expansión sale de `data-expanded` en el HTML, y el JS lo traslada a `aria-expanded`. Respeta «estado inicial desde el HTML» sin escribir ARIA que solo vale con JS.
- **Sí:** `aria-labelledby` en cada `treeitem` hacia su etiqueta. Sin él, el nombre calculado de un nodo con hijos puede incluir el texto de todos sus descendientes.
- **No:** `aria-level`, `aria-setsize` ni `aria-posinset` en el árbol. Los navegadores los calculan de la estructura `<ul>`/`<li>` anidada.
- **Sí:** Tree view comunica su valor como Listbox: `tree:change`, `value` y, con `data-name`, inputs ocultos.
- **Sí:** roving tabindex (`rovingTabindex()`) en Menubar, Tree view y Grid, como se decidió en el SPEC 05. **No:** `aria-activedescendant`.
- **Sí:** Grid de datos de solo lectura con celdas que contienen como mucho un enlace o un botón. **No:** grid editable ni celdas con varios controles; necesitan un modo de interacción (Enter/F2, Escape) con su propio estado.
- **No:** layout grid. No lo pide ningún componente y duplicaría la navegación 2D.
- **Sí:** la navegación 2D vive en `grid.js`. **No:** una utilidad `grid-navigation.js`; solo hay un usuario, y las utilidades se crean cuando hay dos.
- **Sí:** Grid parte de una `<table>` que el JS convierte en `role="grid"`. Sin JS es una tabla de datos, que es lo que el lector espera; reutiliza `table.css`.
- **Sí:** Grid ordenable con `aria-sort` y un botón por cabecera ordenable que es el elemento enfocable de esa celda. Reutiliza la regla «un único control por celda» y el patrón de SortableTable.
- **Sí:** la comparación se extrae a `src/utils/sort.js`. Ya hay dos usuarios (SortableTable y Grid).
- **Sí:** RePág/AvPág en el grid mueven 5 filas (`data-page-size`). APG deja el número al autor; 5 cabe en la historia y se puede probar.
- **Sí:** Feed con scroll infinito y callback `loadMore(page)` que devuelve `<article>` ya construidos. El componente no sabe de dónde salen los datos.
- **No:** `fetch` a una URL ni plantillas de artículo. Añaden formato de respuesta y errores de red que no son del patrón Feed.
- **Sí:** `loadMore` se pasa al constructor; `initFeeds()` solo crea feeds estáticos. Un atributo `data-*` no puede llevar una función.
- **Sí:** si la carga falla, mensaje visible, botón «Reintentar» y `announce()`. **No:** reintento silencioso; el usuario de lector no sabría que falló.
- **Sí:** el fin se marca con `[]`, texto «No hay más artículos» y `aria-setsize` final. Mientras el total no se conoce, `aria-setsize="-1"`, como indica ARIA.
- **Sí:** sin JS, enlace «Cargar más» con `href` (paginación del servidor). Con `loadMore`, el JS lo oculta.
- **Sí:** el estado de carga reutiliza el CSS de `c-spinner` (SPEC 03), igual que Alert y Toast enlazan `close-button.css`.
- **Sí:** cada `<article>` del feed tiene `tabindex="0"`, como en el ejemplo de APG, para que cada artículo sea una parada al recorrer con Tab además de con AvPág/RePág.
- **Sí:** `Menubar`, `Tree`, `Grid` y `Feed` siguen la convención de las clases del proyecto: constructor con el elemento, `destroy()` y una función `init…`.

## Riesgos

| Riesgo                                                                                                                | Mitigación                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extraer `menu.js` o `sort.js` cambia sin querer el comportamiento de MenuButton o SortableTable                       | Sus tests no se tocan y deben pasar tras el paso 1 y el 2; los tests e2e de Menu Button y Table siguen en la suite.                                     |
| `rovingTabindex()` sobre los `treeitem` anidados recibe el `keydown` de un nodo hijo también en sus ancestros         | Un solo listener en el `role="tree"`; el nodo se obtiene con `event.target.closest('[role="treeitem"]')`. Lo cubre un test con tres niveles.            |
| El anillo de foco de un `treeitem` rodea también a sus hijos                                                          | El anillo se dibuja en `.c-tree__label` con `[role="treeitem"]:focus-visible > .c-tree__label`. Se revisa en la historia.                               |
| `html-validate` marca `role="menuitem"` sobre `<button>` o `role="none"` en `<li>`                                    | Es marcado válido según ARIA in HTML; si la regla salta, se ajusta en `.htmlvalidate.json` solo para ese caso y se anota en «Decisiones».               |
| Dos menús abiertos a la vez al pasar con →/← o con clics rápidos                                                      | `open()` cierra siempre el menú abierto antes de abrir otro. Lo cubren un test y un criterio de aceptación.                                             |
| NVDA en modo exploración intercepta RePág/AvPág en el feed                                                            | `role="feed"` hace que NVDA y JAWS pasen a modo foco dentro del feed. Prueba manual con NVDA y VoiceOver; el README lo documenta.                       |
| Añadir artículos mientras el lector está leyendo mueve su posición                                                    | Los artículos se añaden solo al final, con `aria-busy="true"` durante la inserción, y el foco nunca se mueve.                                           |
| jsdom no implementa `IntersectionObserver` ni layout                                                                  | Los tests de Vitest lo simulan; el scroll que carga más se verifica en Playwright.                                                                      |
| Un grid con muchas columnas desborda a 320 px                                                                         | Se reutiliza el envoltorio con scroll de Table; el `scrollIntoView({ block: 'nearest', inline: 'nearest' })` mantiene visible la celda activa.          |
| Ordenar el grid reordena las filas y la celda activa puede quedar fuera de la vista                                   | El foco se queda en la cabecera ordenada; las filas no tienen `tabindex="0"` tras ordenar. Lo cubre un test.                                            |
| Los componentes dependen de `src/utils/` y de otros componentes: copiar solo su carpeta rompe el import o los estilos | Cada README lo indica. `dist/` es autónomo porque Vite empaqueta las utilidades (criterio de aceptación). Grid enlaza `table.css` y Feed `spinner.css`. |
| Las herramientas automáticas solo detectan una parte de los problemas                                                 | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist de `AGENTS.md`).                                                      |

## Lo que **no** entra en este spec

- Migrar MenuButton a la utilidad de typeahead.
- Menubar con submenús anidados, de navegación o vertical; menú contextual y atajos globales.
- Tree view con carga perezosa, arrastrar y soltar, selección en cascada o edición.
- Grid editable, con varios controles por celda, layout grid, selección, columnas fijas, redimensionado, filtrado, paginación o `treegrid`.
- Utilidad de navegación 2D compartida.
- Feed con `fetch` propio o virtualización.
- Generador de ids.
- Bootstrap o cualquier otra dependencia de ejecución.

Cada uno de ellos, si llega, va en su propio spec.
