# Grid (tabla de datos navegable)

Tabla de datos de **solo lectura** que el JS convierte en `role="grid"`,
con navegación por celdas con el teclado y columnas ordenables. Sigue el
patrón [WAI-ARIA APG — Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
La guía PDF `guia-componentes-accesibles-aria-bootstrap5.pdf` no está en
el repositorio; la referencia para roles, estados y teclado es el APG.

Sin JavaScript es una `<table>` de datos normal, con `<caption>` y
`<th scope>`. Las celdas editables y las celdas con varios controles
quedan fuera de este componente.

> **Dependencias:** `grid.js` importa `../../utils/sort.js` y `grid.css`
> importa `../table/table.css`. Si copias la carpeta a otro proyecto,
> copia también esos dos archivos. `dist/grid/` es autónomo (Vite las
> empaqueta).

## Uso

```html
<link rel="stylesheet" href="grid.css" />

<table class="c-table c-grid" data-grid data-page-size="5">
  <caption>
    Productos disponibles
  </caption>
  <thead>
    <tr>
      <th scope="col" data-sort="text">Nombre</th>
      <th scope="col" data-sort="number">Precio</th>
      <th scope="col">Acción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Laptop</td>
      <td>$999</td>
      <td>
        <a href="#laptop" aria-label="Ver detalles Laptop">Ver detalles</a>
      </td>
    </tr>
  </tbody>
</table>
```

```js
import { initGrids } from './grid.js';

initGrids();
```

O con la clase: `new Grid(table)`. El constructor lanza un error si no
recibe un `<table>` con `data-grid`. `destroy()` quita el `role`, las
`tabindex` y los botones de ordenación que añadió el JS.

- `data-page-size` en la tabla: filas que saltan RePág y AvPág. Por
  defecto, 5.
- `data-sort="text"` o `data-sort="number"` en un `<th>`: lo hace
  ordenable.

## Teclado

| Tecla                  | Acción                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| ↓ / ↑                  | Celda de la fila siguiente / anterior, en la misma columna. Sin envoltura. |
| ← / →                  | Celda anterior / siguiente de la fila. Sin envoltura.                      |
| Inicio / Fin           | Primera / última celda de la fila.                                         |
| Ctrl+Inicio / Ctrl+Fin | Primera / última celda del grid.                                           |
| RePág / AvPág          | Sube / baja `data-page-size` filas, sin pasar de la primera ni la última.  |
| Enter / Espacio        | En el botón de una cabecera ordenable: ordena (ver «Ordenación»).          |

Las cabeceras forman parte de la navegación: la primera fila es una fila
más del grid.

## Ordenación

- Cada cabecera con `data-sort` recibe un `<button type="button">` con su
  texto. Ese botón lleva `tabindex="-1"`.
- Clic o Enter/Espacio sobre el botón ordenan: la primera vez
  ascendente, la segunda descendente.
- Solo una cabecera tiene `aria-sort` a la vez; `aria-sort` vive en el
  `<th>`.
- Tras ordenar, el foco sigue en el botón de la cabecera.
- `data-sort="number"` compara como número; `data-sort="text"` compara
  con `Intl.Collator('es', { numeric: true })`, a través de
  `compareSortValues()` de `utils/sort.js`.
- Al ordenar se dispara `grid:sort` en la tabla, con `detail: { column,
direction }`.

## Estados y ARIA

- La tabla lleva `role="grid"`; cada `<td>` y `<th>`, `role="gridcell"`.
- Hay una sola parada de tabulación: la celda activa tiene `tabindex="0"`
  (o su único enlace o botón) y el resto, `tabindex="-1"`.
- Una celda con un único enlace o botón da el foco a ese elemento, no al
  `<td>`.
- Las cabeceras ordenables tienen `aria-sort="ascending"` o
  `"descending"` cuando están activas.

## Limitaciones conocidas

Estas notas salen de leer el código; no se han comprobado en un
navegador:

- **Ordenar con el teclado:** al moverse con las flechas, el foco de una
  cabecera cae en su `<th>`, no en el botón de ordenación. Enter sobre el
  `<th>` no ordena, así que hoy la ordenación por teclado no funciona
  desde la navegación de celdas.
- **Varias paradas de tabulación:** en una celda con un único enlace, el
  enlace conserva `tabindex="0"` aunque la celda no esté activa, así que
  varias celdas pueden ser paradas de Tab a la vez.
- **Indicador visual de orden:** Grid no pinta ningún icono para
  `aria-sort`. Solo lo expresa en ARIA. `SortableTable` sí muestra un
  icono (`table.css`).
- **`data-sort-value`:** Grid compara el texto de la celda y no lee
  `data-sort-value`.
- **Celda activa fuera de vista:** no hay `scrollIntoView`. En pantallas
  estrechas la celda activa puede quedar fuera del área visible.

## Pruebas manuales

Pendientes; no hay resultados registrados.

- [ ] Con NVDA: se anuncia «tabla» con sus filas y columnas, y al moverse
      se lee la celda, la cabecera y el estado de `aria-sort`.
- [ ] Con VoiceOver (Safari): las mismas comprobaciones que con NVDA.
- [ ] Flechas, Inicio/Fin, Ctrl+Inicio/Ctrl+Fin y RePág/AvPág mueven el
      foco y no dan la vuelta en los bordes.
- [ ] Tab entra una sola vez en el grid, también en la historia «Con
      enlaces».
- [ ] Ordenar con clic y con Enter; la segunda pulsación invierte el
      orden.

## Conformidad con la guía

Referencia: APG Grid. La ficha de la guía PDF no está en el repositorio.

- `role="grid"`, `gridcell` y `aria-sort`: implementados.
- Flechas sin envoltura, Inicio/Fin y Ctrl+Inicio/Ctrl+Fin: implementados.
- Una sola parada de tabulación: **no cumplido** en la historia «Con
  enlaces» (ver «Limitaciones conocidas»).
- Foco en el botón de la cabecera al ordenar: implementado, pero no es
  alcanzable con las flechas (ver «Limitaciones conocidas»).
- El grid es de solo lectura: no se usa `aria-readonly`, porque las celdas
  no son editables.
