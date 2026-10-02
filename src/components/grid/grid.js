/**
 * Componente: Grid (tabla de datos navegable)
 * Una <table> que el JS convierte en role="grid".
 * Implementa el patrón WAI-ARIA APG "Grid":
 * https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 *
 * Teclado (solo lectura, sin selección):
 *  - ↓/↑: siguiente/anterior fila
 *  - ←/→: siguiente/anterior celda de la fila
 *  - Inicio/Fin: primera/última celda de la fila
 *  - Ctrl+Inicio: primera celda del grid
 *  - Ctrl+Fin: última celda del grid
 *  - RePág/AvPág: siguiente/anterior página (data-page-size filas)
 *
 * Sin JS, el marcado es una tabla semántica normal.
 * Con JS se agrega: role="grid", tabindex, navegación por teclado.
 *
 * Uso:
 *   import { Grid, initGrids } from './grid.js';
 *   new Grid(document.querySelector('[data-grid]'));
 */

export class Grid {
  /** @param {HTMLElement} el [data-grid] sobre <table> */
  constructor(el) {
    if (!el || el.tagName !== 'TABLE') {
      throw new Error('Grid: se requiere un elemento <table>[data-grid].');
    }
    this.el = el;
    this._listeners = [];
    this._initialState = [];

    // Poner role="grid"
    el.setAttribute('role', 'grid');

    // Obtener todas las celdas
    const allCells = this._getAllCells();

    // Guardar estado inicial para destroy()
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
      const button = cell.querySelector('button:only-child');
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
    this._initialState.forEach(({ el: cell, hadTabindex, hadRole }) => {
      if (!hadTabindex) cell.removeAttribute('tabindex');
      if (!hadRole) cell.removeAttribute('role');

      const link = cell.querySelector('a');
      const button = cell.querySelector('button');
      if (link) link.removeAttribute('tabindex');
      if (button) button.removeAttribute('tabindex');
    });
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
    const button = cell.querySelector('button:only-child');
    if (link) {
      link.focus();
    } else if (button) {
      button.focus();
    } else {
      cell.focus();
    }
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

    // ↓ siguiente fila, misma columna
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

    // ↑ anterior fila, misma columna
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

    // → siguiente celda de la fila (sin envoltura)
    if (key === 'ArrowRight') {
      event.preventDefault();
      if (cellIndexInRow < cellsInRow.length - 1) {
        this._focusCell(cellsInRow[cellIndexInRow + 1]);
      }
      return;
    }

    // ← anterior celda de la fila (sin envoltura)
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

    // PageDown: siguiente página (pageSize filas)
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

    // PageUp: página anterior (pageSize filas)
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
