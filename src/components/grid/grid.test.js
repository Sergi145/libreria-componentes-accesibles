import { describe, it, expect, beforeEach } from 'vitest';
import { Grid, initGrids } from './grid.js';

function buildMarkup() {
  document.body.innerHTML = `
    <table class="c-table c-grid" id="grid-test" data-grid data-page-size="3">
      <caption>Productos</caption>
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Precio</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Laptop</td>
          <td>$999</td>
        </tr>
        <tr>
          <td>Mouse</td>
          <td>$25</td>
        </tr>
      </tbody>
    </table>
  `;
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

describe('Grid', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error sin un elemento <table>[data-grid]', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Grid(document.querySelector('div'))).toThrow();
  });

  it('pone role="grid" en la tabla', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    expect($('[data-grid]').getAttribute('role')).toBe('grid');
  });

  it('pone role="gridcell" en todas las celdas', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cells = $$('[role="gridcell"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('primera celda tiene tabindex="0", resto tabindex="-1"', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cells = Array.from($$('[role="gridcell"]'));
    expect(cells[0].getAttribute('tabindex')).toBe('0');
    cells.slice(1).forEach((cell) => {
      expect(cell.getAttribute('tabindex')).toBe('-1');
    });
  });

  it('ArrowDown, ArrowUp, ArrowLeft, ArrowRight no lanzan error', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cell = document.querySelector('[role="gridcell"]');
    cell.focus();

    const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
    keys.forEach((key) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      expect(() => cell.dispatchEvent(event)).not.toThrow();
    });
  });

  it('Home y End no lanzan error', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cell = document.querySelector('[role="gridcell"]');
    cell.focus();

    const event1 = new KeyboardEvent('keydown', {
      key: 'Home',
      cancelable: true,
    });
    const event2 = new KeyboardEvent('keydown', {
      key: 'End',
      cancelable: true,
    });

    expect(() => cell.dispatchEvent(event1)).not.toThrow();
    expect(() => cell.dispatchEvent(event2)).not.toThrow();
  });

  it('Ctrl+Home y Ctrl+End no lanzan error', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cell = document.querySelector('[role="gridcell"]');
    cell.focus();

    const event1 = new KeyboardEvent('keydown', {
      key: 'Home',
      ctrlKey: true,
      cancelable: true,
    });
    const event2 = new KeyboardEvent('keydown', {
      key: 'End',
      ctrlKey: true,
      cancelable: true,
    });

    expect(() => cell.dispatchEvent(event1)).not.toThrow();
    expect(() => cell.dispatchEvent(event2)).not.toThrow();
  });

  it('PageUp y PageDown no lanzan error', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cell = document.querySelector('[role="gridcell"]');
    cell.focus();

    const event1 = new KeyboardEvent('keydown', {
      key: 'PageUp',
      cancelable: true,
    });
    const event2 = new KeyboardEvent('keydown', {
      key: 'PageDown',
      cancelable: true,
    });

    expect(() => cell.dispatchEvent(event1)).not.toThrow();
    expect(() => cell.dispatchEvent(event2)).not.toThrow();
  });

  it('click en celda no lanza error', () => {
    buildMarkup();
    new Grid($('[data-grid]'));

    const cell = document.querySelector('[role="gridcell"]');
    expect(() => cell.click()).not.toThrow();
  });

  it('destroy() quita role="grid" y atributos de navegación', () => {
    buildMarkup();
    const grid = new Grid($('[data-grid]'));
    grid.destroy();

    expect($('[data-grid]').hasAttribute('role')).toBe(false);
    expect($$('[role="gridcell"]')).toHaveLength(0);
  });

  it('initGrids inicializa cada [data-grid]', () => {
    document.body.innerHTML = `
      <table id="grid1" data-grid></table>
      <table id="grid2" data-grid></table>
    `;

    const grids = initGrids();

    expect(grids).toHaveLength(2);
    expect(grids[0]).toBeInstanceOf(Grid);
    expect(grids[1]).toBeInstanceOf(Grid);
  });
});
