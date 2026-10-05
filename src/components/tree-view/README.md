# Tree View (árbol expandible)

Lista anidada que puede plegarse y expandirse. Implementa el patrón
[WAI-ARIA APG — Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/):
`role="tree"`, `treeitem`, `group`, `aria-expanded`, selección simple o
múltiple, flechas, Inicio/Fin, `*` y typeahead.

> **Dependencias:** `tree-view.js` importa `../../utils/typeahead.js`. El
> roving tabindex lo hace el propio componente, no `utils/roving-tabindex.js`
> (ver «Teclado»). Si copias la carpeta a otro proyecto, copia también
> `typeahead.js`. `dist/tree-view/` es autónomo (Vite lo empaqueta).

## Uso

Sin JavaScript es una lista anidada normal, con todos los grupos visibles.

```html
<link rel="stylesheet" href="tree-view.css" />

<ul class="c-tree" id="proyecto" data-tree aria-labelledby="proyecto-titulo">
  <li data-value="src" data-expanded="true">
    <span class="c-tree__label">src/</span>
    <ul>
      <li data-value="button">
        <span class="c-tree__label">button.js</span>
      </li>
    </ul>
  </li>
  <li data-value="package">
    <span class="c-tree__label">package.json</span>
  </li>
</ul>
```

```js
import { initTrees } from './tree-view.js';

const [tree] = initTrees();

document.querySelector('#proyecto').addEventListener('tree:change', (event) => {
  console.log(event.detail.value);
});
```

Con la clase, `new Tree(ul)`. El constructor exige un `<ul>` con `id`
(lo usa para generar los ids de las etiquetas) y lanza un error si falta.

| Atributo / API                | Dónde                       | Efecto                                                                            |
| ----------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `data-tree`                   | `<ul>` raíz                 | Lo engancha `initTrees()`.                                                        |
| `id`                          | `<ul>` raíz                 | Obligatorio. Base de los ids `<id>-label-<n>`.                                    |
| `data-multiple`               | `<ul>` raíz                 | Selección múltiple: pone `aria-multiselectable="true"`.                           |
| `data-name`                   | `<ul>` raíz                 | Un `<input type="hidden" name="…">` por valor seleccionado, junto al árbol.       |
| `data-value`                  | `<li>` de cada nodo         | Valor del nodo. Sin él se usa el texto del `<li>`.                                |
| `data-expanded="true\|false"` | `<li>` de un nodo con hijos | Estado inicial de expansión; el JS lo traslada a `aria-expanded`.                 |
| `tree.value`                  | getter                      | Simple: `string \| null`. Múltiple: `string[]`.                                   |
| `tree.value = v`              | setter                      | Marca los nodos con ese valor. No dispara `tree:change`.                          |
| `tree.multiple`               | getter                      | `true` si el árbol es de selección múltiple.                                      |
| `tree.destroy()`              | método                      | Quita listeners, roles, ids y atributos añadidos; vuelve a ser una lista anidada. |

Evento: `tree:change` (burbujea) con `detail: { value }`. Se dispara al
cambiar la selección por teclado o clic, pero no al expandir o plegar.

> **Pendiente de implementación:** el spec 06 pide `expand()`/`collapse()`
> (hoy no existen en `tree-view.js`) y un icono de flecha y de marca en el
> marcado de referencia. Hoy el
> `.html` no incluye `.c-tree__toggle` ni `.c-tree__mark`, y el JS no los
> crea. Solo las historias los añaden a mano. Sin flecha, el ratón puede
> seleccionar pero no expandir ni plegar; el teclado sí.

## Teclado

El foco sigue el patrón APG. Una sola parada de Tab: el nodo seleccionado o,
si no hay, el primero.

| Tecla                       | Selección simple                                                                                                           | Selección múltiple (`data-multiple`)                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ↓ / ↑                       | Siguiente / anterior visible; la selección lo sigue.                                                                       | Mueve el foco; la selección no cambia.                               |
| Mayús + ↓ / ↑               | —                                                                                                                          | Mueve el foco y alterna el nodo al que llega.                        |
| →                           | En un nodo plegado, lo expande (el foco no se mueve). Si ya está expandido, va a su primer hijo. En una hoja no hace nada. | Igual.                                                               |
| ←                           | En un nodo expandido, lo pliega. Si no, va a su padre.                                                                     | Igual.                                                               |
| Inicio / Fin                | Primer / último visible.                                                                                                   | Igual.                                                               |
| Ctrl + Mayús + Inicio / Fin | —                                                                                                                          | Selecciona desde el nodo actual hasta el primero / último visible.   |
| `*`                         | Expande todos los hermanos del nodo actual.                                                                                | Igual.                                                               |
| Espacio                     | Selecciona el nodo.                                                                                                        | Alterna el nodo.                                                     |
| Ctrl + A                    | —                                                                                                                          | Selecciona todos los visibles; si ya lo estaban, deselecciona todos. |
| Una letra                   | Typeahead sobre el texto de la etiqueta de los nodos visibles.                                                             | Igual.                                                               |

Con ratón: clic selecciona (simple) o alterna (múltiple); Mayús + clic en
múltiple selecciona el rango visible desde el último nodo activado. Un clic
en `.c-tree__toggle` expande o pliega, pero ese botón no existe en el marcado
de referencia (ver «Pendiente»).

**Roving tabindex propio.** El componente no usa `rovingTabindex()` de
`utils/`: el árbol tiene reglas propias (expandir con →, plegar con ←, solo
nodos visibles) y, con las dos, cada flecha avanzaba dos nodos. El spec 06
pedía `rovingTabindex()` en Tree view; esta decisión se toma en el código.

## Selección y valor

- **Simple:** solo un nodo con `aria-selected="true"`. La selección sigue al
  foco (flechas, Inicio/Fin, typeahead, → y ← que cambian de nodo).
- **Múltiple:** cada nodo lleva `aria-selected="true|false"`. Seleccionar un
  padre **no** selecciona sus hijos (sin selección en cascada).
- `value` toma `data-value`; sin él, el texto completo del `<li>`. Como ese
  texto incluye el de los hijos, en nodos con hijos conviene poner siempre
  `data-value`.

## ARIA y estados

- `<ul>` → `role="tree"`; con `data-multiple`, `aria-multiselectable="true"`.
- `<ul>` anidado → `role="group"`. Cuando un grupo está plegado, lleva `hidden`.
- `<li>` → `role="treeitem"`, `aria-labelledby` apunta a su `.c-tree__label`
  (así el nombre del nodo no incluye el texto de sus hijos).
- Solo los nodos con hijos llevan `aria-expanded`. Las hojas no, porque se
  anunciarían como «contraído».
- Todos los nodos llevan `aria-selected`.
- El estado vive en atributos: `aria-expanded`, `aria-selected`, `hidden`
  y `tabindex`.

## Estilos

- La selección se marca con negrita y una barra inicial (`box-shadow`), sin
  depender solo del color.
- El foco usa el anillo `--color-focus-ring` con `:focus-visible` sobre la
  etiqueta.
- En `prefers-reduced-motion: reduce` no hay transición en la flecha.
- En `forced-colors: active` el nodo seleccionado lleva subrayado, y los nodos
  con hijos muestran un triángulo que apunta a la derecha si está plegado o
  hacia abajo si está expandido. Así se distinguen sin color ni sombras.

## Accesibilidad

- Estructura semántica: una lista anidada que el JS convierte en árbol, sin
  roles escritos en el HTML. Así sin JS se lee todo y no quedan `treeitem`
  que no responden.
- Una parada de Tab; el resto de nodos tienen `tabindex="-1"`.
- Los nodos de un grupo plegado no reciben foco con las flechas.

## Pruebas manuales

Pendientes; no se han ejecutado en esta versión.

- Con NVDA y con VoiceOver: se anuncia «árbol», «elemento de árbol», «nivel
  de expansión» (expandido / contraído) y «seleccionado / no seleccionado».
- Navegar con ↓ / ↑ / → / ← por un árbol de tres niveles y comprobar que se
  lee el nivel y el grupo.
- Con `forced-colors: active` (Alto contraste de Windows): el nodo
  seleccionado y los expandidos se distinguen.

## Conformidad con la guía

Referencia: el patrón [APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).
La guía `guia-componentes-accesibles-aria-bootstrap5.pdf` no está en el
repositorio, así que no se ha consultado.

- _`role="tree"`, `treeitem`, `group` y `aria-expanded`_: los pone el JS a
  partir del HTML.
- _Flechas, Inicio/Fin, `*` y typeahead_: implementados y probados en
  `tree-view.test.js`.
- _Selección simple y múltiple con el mismo teclado que Listbox_: implementado.
- _Icono de flecha y de marca con `aria-hidden`_: pendiente, ver arriba.
