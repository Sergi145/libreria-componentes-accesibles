/**
 * Componente: Table — ordenable
 * `SortableTable` convierte las cabeceras `<th data-sort="text|number">`
 * de una `<table data-sortable>` en botones de ordenar, según el
 * patrón APG de tabla ordenable
 * (https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/):
 * un `<button>` dentro de cada `<th>` y `aria-sort` en el propio `<th>`.
 *
 * Decisiones no obvias:
 * - El botón envuelve el texto que ya tenía el `<th>`: no hace falta
 *   escribirlo dos veces en el marcado.
 * - `aria-sort` vive en el `<th>`, no en el botón: es la cabecera de
 *   columna la que está ordenada, no el control que la activa. Solo
 *   una columna lo tiene a la vez; las demás se quedan sin el
 *   atributo (ninguna reparte `aria-sort="none"`).
 * - Activar una columna nueva ordena ascendente; reactivar la misma
 *   columna alterna a descendente. Cambiar a otra columna siempre
 *   vuelve a empezar en ascendente.
 * - El texto de cada celda se compara con `Intl.Collator('es', {
 *   numeric: true })`: ordena bien acentos, la eñe y números dentro
 *   del texto ("Pedido 9" antes que "Pedido 10"). Si el texto visible
 *   no sirve para ordenar (una fecha con formato dd/mm/aaaa, un
 *   importe con "€"), la celda puede dar el valor real con
 *   `data-sort-value` (una fecha ISO, un número sin separador de
 *   miles).
 * - Reordenar mueve las filas ya existentes (`tBodies[0].appendChild`
 *   en el nuevo orden); no las recrea, así que el foco y el estado de
 *   cualquier control dentro de una fila no se pierden.
 *
 * Uso:
 *   import { SortableTable, initSortableTables } from './table.js';
 *   const table = new SortableTable(document.querySelector('[data-sortable]'));
 *   table.sort(0, 'ascending');
 *   // O, para inicializar todas las [data-sortable] de la página:
 *   initSortableTables();
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {string} text
 * @returns {HTMLButtonElement}
 */
function createSortButton(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'c-table__sort';

  const label = document.createElement('span');
  label.className = 'c-table__sort-text';
  label.textContent = text;

  const icon = document.createElementNS(SVG_NS, 'svg');
  icon.setAttribute('class', 'c-table__sort-icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M12 5v14M5 12l7 7 7-7');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  icon.appendChild(path);

  button.append(label, icon);
  return button;
}

export class SortableTable {
  /** @param {HTMLTableElement} table [data-sortable] */
  constructor(table) {
    if (!table || table.tagName !== 'TABLE') {
      throw new Error('SortableTable: se requiere un elemento <table>.');
    }
    this.el = table;
    this._sorted = null;
    this._collator = new Intl.Collator('es', { numeric: true });
    this._listeners = [];

    const headerRow = table.tHead?.rows[0];
    this._headers = headerRow ? Array.from(headerRow.cells) : [];

    this._headers.forEach((th, columnIndex) => {
      if (!th.hasAttribute('data-sort')) return;

      const button = createSortButton(th.textContent.trim());
      th.textContent = '';
      th.classList.add('c-table__header--sortable');
      th.appendChild(button);

      const onClick = () => this._onHeaderClick(columnIndex);
      button.addEventListener('click', onClick);
      this._listeners.push({ button, onClick });
    });
  }

  /** @returns {{ column: number, direction: 'ascending' | 'descending' } | null} */
  get sorted() {
    return this._sorted;
  }

  /**
   * @param {number} columnIndex
   * @param {'ascending' | 'descending'} direction
   */
  sort(columnIndex, direction) {
    const th = this._headers[columnIndex];
    const type = th?.getAttribute('data-sort');
    if (!type) return;

    this._headers.forEach((header) => header.removeAttribute('aria-sort'));
    th.setAttribute('aria-sort', direction);
    this._sorted = { column: columnIndex, direction };

    const tbody = this.el.tBodies[0];
    if (!tbody) return;

    const factor = direction === 'ascending' ? 1 : -1;
    const rows = Array.from(tbody.rows).sort((a, b) => {
      const av = this._cellValue(a, columnIndex);
      const bv = this._cellValue(b, columnIndex);
      const result =
        type === 'number'
          ? Number(av) - Number(bv)
          : this._collator.compare(av, bv);
      return result * factor;
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  destroy() {
    this._listeners.forEach(({ button, onClick }) =>
      button.removeEventListener('click', onClick)
    );
  }

  /**
   * @param {HTMLTableRowElement} row
   * @param {number} columnIndex
   * @returns {string}
   */
  _cellValue(row, columnIndex) {
    const cell = row.cells[columnIndex];
    return (
      cell?.getAttribute('data-sort-value') ?? cell?.textContent.trim() ?? ''
    );
  }

  /** @param {number} columnIndex */
  _onHeaderClick(columnIndex) {
    const current = this._sorted;
    const direction =
      current?.column === columnIndex && current.direction === 'ascending'
        ? 'descending'
        : 'ascending';

    this.sort(columnIndex, direction);
    this._headers[columnIndex].querySelector('button').focus();
  }
}

/**
 * Inicializa todas las [data-sortable] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {SortableTable[]}
 */
export function initSortableTables(root = document) {
  return Array.from(root.querySelectorAll('[data-sortable]')).map(
    (table) => new SortableTable(table)
  );
}
