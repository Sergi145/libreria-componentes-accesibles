# Table

Tabla de datos semántica: `<table>` con `<caption>`, `<th scope="col">`
para las cabeceras de columna y `<th scope="row">` para la celda que
identifica cada fila. Envuelta en un contenedor con desplazamiento
horizontal enfocable, para cuando no cabe en el ancho disponible.
Ordenable por columna de forma opcional con `table.js`
(`SortableTable`), según el patrón APG de
[tabla ordenable](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).

## Uso

```html
<link rel="stylesheet" href="table.css" />

<section
  class="c-table__wrapper"
  tabindex="0"
  aria-labelledby="pedidos-caption"
>
  <table class="c-table c-table--striped c-table--hover">
    <caption id="pedidos-caption">
      Pedidos recientes
    </caption>
    <thead>
      <tr>
        <th scope="col">Pedido</th>
        <th scope="col">Cliente</th>
        <th scope="col" class="c-table__cell--numeric">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">#1024</th>
        <td>Marta Ruiz</td>
        <td class="c-table__cell--numeric">48,90&nbsp;€</td>
      </tr>
    </tbody>
  </table>
</section>
```

Variantes de la tabla, combinables: `c-table--striped` (filas
alternas) y `c-table--hover` (resalta la fila bajo el ratón).
`c-table__cell--numeric` alinea el contenido al final de línea
(derecha en español) y usa cifras tabulares, la convención habitual
para comparar números en columna.

## El `<caption>` es obligatorio

Es el **nombre accesible** de la tabla. Sin él, un lector de pantalla
solo anuncia «tabla con N filas y M columnas» al entrar, sin decir de
qué trata. Un `<h2>`/`<h3>` visual justo antes de la tabla no lo
sustituye: no queda asociado a ella en el árbol de accesibilidad, así
que al navegar tabla por tabla (con el rotor de VoiceOver, por
ejemplo) no se distinguirían unas de otras.

## El envoltorio con scroll

`.c-table__wrapper` es un `<section>` (no un `<div role="region">`:
con nombre accesible, `<section>` ya expone ese rol de forma nativa —
«mejor sin ARIA»), con `tabindex="0"` y `aria-labelledby` hacia el
mismo `<caption>`. Existe para que la tabla se pueda desplazar en
horizontal **con teclado** cuando no cabe en el ancho disponible
(WCAG 2.1.1): un contenedor con su propio scroll que no se puede
enfocar no es operable solo con teclado. `aria-labelledby` reutiliza
el id del `<caption>` para que el lector anuncie de qué trata la
región antes de entrar en la tabla, en vez de repetir el texto o
dejarla sin nombre (un `<section>`/`role="region"` sin nombre no es
válido según ARIA).

## Ordenable: `SortableTable`

```html
<table class="c-table" data-sortable>
  <caption>
    Pedidos recientes
  </caption>
  <thead>
    <tr>
      <th scope="col" data-sort="text">Cliente</th>
      <th scope="col" class="c-table__cell--numeric" data-sort="number">
        Importe
      </th>
      <th scope="col" data-sort="text">Fecha</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Marta Ruiz</td>
      <td class="c-table__cell--numeric" data-sort-value="48.90">
        48,90&nbsp;€
      </td>
      <td data-sort-value="2026-03-12">12/03/2026</td>
    </tr>
  </tbody>
</table>
```

```js
import { SortableTable, initSortableTables } from './table.js';

new SortableTable(document.querySelector('[data-sortable]'));
// O, para inicializar todas las [data-sortable] de la página:
initSortableTables();
```

Cada `<th data-sort="text">` o `<th data-sort="number">` recibe un
`<button type="button">` que envuelve su texto (Enter y Espacio
ordenan, de serie). Al activarlo:

1. Si esa columna no estaba ordenada, ordena **ascendente**. Si ya lo
   estaba, alterna a **descendente**. Cambiar a otra columna siempre
   vuelve a empezar en ascendente.
2. `aria-sort` (`"ascending"` / `"descending"`) se pone en el
   `<th>` correspondiente — nunca en el botón — y se quita de
   cualquier otra columna: solo una tiene el atributo a la vez.
3. El texto se compara con `Intl.Collator('es', { numeric: true })`
   (`data-sort="text"`), que ordena bien acentos, la eñe y números
   dentro del texto («Pedido 9» antes que «Pedido 10»); o como número
   con `Number(...)` (`data-sort="number"`).
4. Si el texto visible de la celda no sirve para ordenar (una fecha
   `dd/mm/aaaa`, un importe con «€»), añade `data-sort-value` con el
   valor real (una fecha ISO, un número con punto decimal y sin
   separador de miles).
5. El foco se queda en el botón de la cabecera: reordenar mueve las
   filas ya existentes, no las vuelve a crear.

`sorted` (`{ column, direction }` o `null`) refleja el estado actual;
`sort(columnIndex, direction)` ordena por código sin pasar por el
botón. Sin JavaScript, la tabla se lee y se recorre igual — ver la
historia «Sin JavaScript» —, solo faltan los botones de ordenar.

## Cuándo **no** usar una tabla

Una tabla es para datos tabulares reales, con relación entre
cabeceras y celdas. No la uses para maquetar un layout (columnas de
texto, tarjetas en rejilla): eso es trabajo de CSS (grid, flexbox), no
de marcado de tabla. Una tabla usada solo por su aspecto visual
confunde a quien navega con lector de pantalla, que oirá «tabla con
N columnas» donde no hay datos que comparar.

## Dependencias

`table.css` y `table.js` no dependen de ningún otro componente ni
utilidad. Los colores salen de `src/tokens/tokens.css`.

## Accesibilidad

- **`<caption>` obligatorio** como nombre accesible de la tabla (ver
  arriba).
- **`<th scope="col">`/`<th scope="row">`**, nunca `<td>` para las
  cabeceras: así el lector anuncia la cabecera de fila y de columna al
  moverse por las celdas.
- **Envoltorio enfocable**: `<section>` (no `<div role="region">`) con
  `tabindex="0"` y `aria-labelledby`, para el desplazamiento horizontal
  por teclado.
- **Alineación numérica** con `text-align: end` (no `right`): en un
  documento `dir="rtl"` los números se alinean al lado correcto.
- **`c-table--hover`** es solo una pista visual con el ratón: no
  sustituye a nada que dependa del teclado ni del foco.
- **Botones de ordenar reales** (`<button type="button">`), no
  `<div>`/`<span>` con `onclick`: Enter y Espacio funcionan sin más.
- **`aria-sort` en el `<th>`**, nunca en el botón: es la columna la
  que está ordenada. Solo una columna lo lleva a la vez; las demás se
  quedan sin el atributo (no se reparte `aria-sort="none"`).
- **El icono de ordenar es decorativo** (`aria-hidden="true"`): el
  estado lo comunica `aria-sort`, no el icono.

## Pruebas manuales recomendadas

- Recorrer la tabla con NVDA/VoiceOver: al entrar se anuncia el
  `<caption>`, y al moverse por celdas con las flechas del modo tabla
  se anuncian la cabecera de columna y la de fila correspondientes.
- En la historia «Ordenable», activar un botón de cabecera con Enter y
  con Espacio, y comprobar que el lector anuncia el nuevo estado de
  orden de esa columna al volver a enfocarla.
- En la historia «Desplazamiento horizontal», reducir la ventana (o
  probar a 320px), Tab hasta el envoltorio y comprobar que las flechas
  ←/→ desplazan la tabla.
- Comprobar en modo oscuro que los bordes, el resaltado de fila y el
  icono de ordenar siguen siendo legibles.

## Conformidad con la guía

Revisión frente a la ficha de Table de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el
SPEC 04 toma de la ficha.

**«Lo que te toca a ti»**:

- _`<caption>` con el nombre de la tabla_, no un encabezado suelto
  antes de ella.
- _`scope` en todas las cabeceras_: `col` en las de columna, `row` en
  las de fila.
- _Contenedor de scroll enfocable_ cuando la tabla no cabe en el
  ancho disponible.
- _`aria-sort` en la cabecera de columna_, no en el control que la
  activa.
- _Botón real para ordenar_, no un `<div>` con `onclick`.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Tabla usada para maquetar un layout en vez de datos tabulares.
- `<td>` en vez de `<th scope="row">` para la celda que identifica la
  fila.
- Scroll horizontal sin `tabindex="0"` en el contenedor: inoperable
  solo con teclado.
- Varias columnas con `aria-sort` a la vez, o `aria-sort="none"`
  repartido por las que no están ordenadas.
- Orden de texto por comparación simple (`<`/`>`) en vez de
  `Intl.Collator`: trataría mal acentos, la eñe y los números dentro
  del texto.
