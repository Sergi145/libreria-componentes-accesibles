/**
 * Componente: Grid (tabla de datos navegable y ordenable)
 * Una <table> que el JS convierte en role="grid".
 * Implementa el patrón WAI-ARIA APG "Grid":
 * https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 *
 * Teclado:
 *  - ↓/↑: siguiente/anterior fila
 *  - ←/→: siguiente/anterior celda (sin envoltura)
 *  - Inicio/Fin: primera/última celda de la fila
 *  - Ctrl+Inicio/Ctrl+Fin: primera/última celda del grid
 *  - RePág/AvPág: siguiente/anterior página (data-page-size filas)
 *  - En cabeceras ordenables: Enter/Space ordena (ascendente/descendente)
 *
 * Ordenación:
 *  - Cabeceras con data-sort="text|number" son ordenables
 *  - Clic o Enter/Space ordena; primera vez ascendente, segunda descendente
 *  - Solo una cabecera tiene aria-sort a la vez
 *  - El foco sigue en el botón de la cabecera tras ordenar
 *
 * Uso:
 *   import { Grid, initGrids } from './grid.js';
 *   new Grid(document.querySelector('[data-grid]'));
 */

import { compareSortValues } from '../../utils/sort.js';

export class Grid {
  /** @param {HTMLElement} el [data-grid] sobre <table> */
  constructor(el) {
    if (!el || el.tagName !== 'TABLE') {
      throw new Error('Grid: se requiere un elemento <table>[data-grid].');
    }
    this.el = el;
    this._listeners = [];
    this._initialState = [];
    this._sortColumn = null; // { header, direction }

    // Poner role="grid"
    el.setAttribute('role', 'grid');

    // Procesar cabeceras ordenables
    const headers = Array.from(el.querySelectorAll('th[data-sort]'));
    headers.forEach((header) => {
      // Crear botón dentro del th
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'c-grid__sort-button';
      button.textContent = header.textContent;
      button.tabIndex = -1;

      // Guardar estado inicial
      this._initialState.push({
        el: header,
        hadDataSort: true,
        originalContent: header.innerHTML,
      });

      // Reemplazar contenido del th con el botón
      header.innerHTML = '';
      header.appendChild(button);

      // Listener para clicks y Enter/Space
      const onClick = (event) => {
        if (
          event.type === 'keydown' &&
          event.key !== 'Enter' &&
          event.key !== ' '
        ) {
          return;
        }
        event.preventDefault();
        this._sortBy(header);
      };
      button.addEventListener('click', onClick);
      button.addEventListener('keydown', onClick);
      this._listeners.push({
        target: button,
        listener: onClick,
        type: 'click',
      });
      this._listeners.push({
        target: button,
        listener: onClick,
        type: 'keydown',
      });
    });

    // Obtener todas las celdas
    const allCells = this._getAllCells();

    // Guardar estado inicial de celdas
    allCells.forEach((cell) => {
      this._initialState.push({
        el: cell,
        hadTabindex: cell.hasAttribute('tabindex'),
        hadRole: cell.hasAttribute('role'),
      });
    });

    // Agregar role="gridcell" y tabindex a todas las celdas
    allCells.forEach((cell, index) => {
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', String(index === 0 ? 0 : -1));

      // Si la celda contiene un único enlace o botón, poner el foco ahí
      const link = cell.querySelector('a:only-child');
      const button = cell.querySelector(
        'button:only-child:not(.c-grid__sort-button)'
      );
      if (link) {
        link.setAttribute('tabindex', '0');
        cell.setAttribute('tabindex', '-1');
      } else if (button) {
        button.setAttribute('tabindex', '0');
        cell.setAttribute('tabindex', '-1');
      }
    });

    // Listener de teclado
    const onKeydown = (event) => this._onKeydown(event);
    el.addEventListener('keydown', onKeydown);
    this._listeners.push({ target: el, listener: onKeydown, type: 'keydown' });

    // Listener de click
    const onClick = (event) => this._onClick(event);
    el.addEventListener('click', onClick);
    this._listeners.push({ target: el, listener: onClick, type: 'click' });

    // Foco inicial
    const firstCell = allCells[0];
    if (firstCell) {
      this._focusCell(firstCell);
    }
  }

  destroy() {
    // Quitar listeners
    this._listeners.forEach(({ target, listener, type }) => {
      target.removeEventListener(type, listener);
    });
    this._listeners = [];

    // Quitar role="grid"
    this.el.removeAttribute('role');

    // Restaurar estado inicial
    this._initialState.forEach(
      ({ el: element, hadTabindex, hadRole, hadDataSort, originalContent }) => {
        // Todos los elementos: quitar role="gridcell"
        element.removeAttribute('role');
        if (!hadTabindex) element.removeAttribute('tabindex');

        if (element.tagName === 'TH' && hadDataSort) {
          // Restaurar contenido original del th ordenable
          element.innerHTML = originalContent;
          element.removeAttribute('aria-sort');
        } else if (element.tagName === 'TD') {
          // Quitar tabindex de links y buttons dentro de celdas de datos
          const link = element.querySelector('a');
          const button = element.querySelector(
            'button:not(.c-grid__sort-button)'
          );
          if (link) link.removeAttribute('tabindex');
          if (button) button.removeAttribute('tabindex');
        }
      }
    );
    this._initialState = [];
  }

  _getAllCells() {
    const cells = [];
    const rows = Array.from(this.el.querySelectorAll('tr'));
    rows.forEach((row) => {
      const rowCells = Array.from(row.querySelectorAll('td, th'));
      cells.push(...rowCells);
    });
    return cells;
  }

  _getCellsInRow(cell) {
    const row = cell.closest('tr');
    return row ? Array.from(row.querySelectorAll('td, th')) : [];
  }

  _getRowIndex(cell) {
    const rows = Array.from(this.el.querySelectorAll('tr'));
    const row = cell.closest('tr');
    return rows.indexOf(row);
  }

  _getRows() {
    return Array.from(this.el.querySelectorAll('tr'));
  }

  _focusCell(cell) {
    const allCells = this._getAllCells();
    allCells.forEach((c) => c.setAttribute('tabindex', '-1'));
    cell.setAttribute('tabindex', '0');

    const link = cell.querySelector('a:only-child');
    const button = cell.querySelector(
      'button:only-child:not(.c-grid__sort-button)'
    );
    if (link) {
      link.focus();
    } else if (button) {
      button.focus();
    } else {
      cell.focus();
    }
  }

  _sortBy(header) {
    const sortType = header.getAttribute('data-sort');
    const columnIndex = Array.from(header.parentElement.children).indexOf(
      header
    );
    const tbody = this.el.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Determinar dirección
    let direction = 'asc';
    if (this._sortColumn?.header === header) {
      direction = this._sortColumn.direction === 'asc' ? 'desc' : 'asc';
    }

    // Actualizar aria-sort
    Array.from(this.el.querySelectorAll('[aria-sort]')).forEach((h) => {
      h.removeAttribute('aria-sort');
    });
    header.setAttribute(
      'aria-sort',
      direction === 'asc' ? 'ascending' : 'descending'
    );

    // Ordenar filas
    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[columnIndex];
      const cellB = rowB.children[columnIndex];
      const valueA = cellA.textContent.trim();
      const valueB = cellB.textContent.trim();

      let result = compareSortValues(valueA, valueB, sortType);
      return direction === 'asc' ? result : -result;
    });

    // Reordenar filas en el DOM
    rows.forEach((row) => {
      tbody.appendChild(row);
    });

    // Mantener registro del ordenamiento actual
    this._sortColumn = { header, direction };

    // Mantener foco en el botón de la cabecera
    const button = header.querySelector('.c-grid__sort-button');
    if (button) {
      button.focus();
    }

    // Disparar evento de cambio
    this.el.dispatchEvent(
      new CustomEvent('grid:sort', {
        bubbles: true,
        detail: { column: columnIndex, direction },
      })
    );
  }

  _onKeydown(event) {
    const { key } = event;
    const currentCell = event.target.closest('[role="gridcell"]');
    if (!currentCell) return;

    const allCells = this._getAllCells();
    const cellsInRow = this._getCellsInRow(currentCell);
    const cellIndexInRow = cellsInRow.indexOf(currentCell);
    const rowIndex = this._getRowIndex(currentCell);
    const rows = this._getRows();
    const pageSize = parseInt(
      this.el.getAttribute('data-page-size') || '5',
      10
    );

    // ↓ siguiente fila
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (rowIndex < rows.length - 1) {
        const nextRow = rows[rowIndex + 1];
        const nextCells = Array.from(nextRow.querySelectorAll('td, th'));
        if (nextCells[cellIndexInRow]) {
          this._focusCell(nextCells[cellIndexInRow]);
        }
      }
      return;
    }

    // ↑ anterior fila
    if (key === 'ArrowUp') {
      event.preventDefault();
      if (rowIndex > 0) {
        const prevRow = rows[rowIndex - 1];
        const prevCells = Array.from(prevRow.querySelectorAll('td, th'));
        if (prevCells[cellIndexInRow]) {
          this._focusCell(prevCells[cellIndexInRow]);
        }
      }
      return;
    }

    // → siguiente celda
    if (key === 'ArrowRight') {
      event.preventDefault();
      if (cellIndexInRow < cellsInRow.length - 1) {
        this._focusCell(cellsInRow[cellIndexInRow + 1]);
      }
      return;
    }

    // ← anterior celda
    if (key === 'ArrowLeft') {
      event.preventDefault();
      if (cellIndexInRow > 0) {
        this._focusCell(cellsInRow[cellIndexInRow - 1]);
      }
      return;
    }

    // Home: primera celda de la fila
    if (key === 'Home' && !event.ctrlKey) {
      event.preventDefault();
      if (cellsInRow.length > 0) {
        this._focusCell(cellsInRow[0]);
      }
      return;
    }

    // End: última celda de la fila
    if (key === 'End' && !event.ctrlKey) {
      event.preventDefault();
      if (cellsInRow.length > 0) {
        this._focusCell(cellsInRow[cellsInRow.length - 1]);
      }
      return;
    }

    // Ctrl+Home: primera celda del grid
    if (key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      if (allCells.length > 0) {
        this._focusCell(allCells[0]);
      }
      return;
    }

    // Ctrl+End: última celda del grid
    if (key === 'End' && event.ctrlKey) {
      event.preventDefault();
      if (allCells.length > 0) {
        this._focusCell(allCells[allCells.length - 1]);
      }
      return;
    }

    // PageDown
    if (key === 'PageDown') {
      event.preventDefault();
      const targetRowIndex = Math.min(rowIndex + pageSize, rows.length - 1);
      const targetRow = rows[targetRowIndex];
      const targetCells = Array.from(targetRow.querySelectorAll('td, th'));
      if (targetCells[cellIndexInRow]) {
        this._focusCell(targetCells[cellIndexInRow]);
      }
      return;
    }

    // PageUp
    if (key === 'PageUp') {
      event.preventDefault();
      const targetRowIndex = Math.max(rowIndex - pageSize, 0);
      const targetRow = rows[targetRowIndex];
      const targetCells = Array.from(targetRow.querySelectorAll('td, th'));
      if (targetCells[cellIndexInRow]) {
        this._focusCell(targetCells[cellIndexInRow]);
      }
      return;
    }
  }

  _onClick(event) {
    const cell = event.target.closest('[role="gridcell"]');
    if (cell) {
      this._focusCell(cell);
    }
  }
}

/**
 * Inicializa todas las [data-grid] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Grid[]}
 */
export function initGrids(root = document) {
  return Array.from(root.querySelectorAll('[data-grid]')).map(
    (el) => new Grid(el)
  );
}
