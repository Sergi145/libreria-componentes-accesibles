import { describe, it, expect, beforeEach } from 'vitest';
import { SortableTable, initSortableTables } from './table.js';

function table() {
  document.body.innerHTML = `
    <table data-sortable>
      <caption>Productos</caption>
      <thead>
        <tr>
          <th data-sort="text" id="th-nombre">Nombre</th>
          <th data-sort="number" id="th-stock">Stock</th>
          <th id="th-nota">Nota</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Producto 9</td>
          <td data-sort-value="9">9</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Producto 10</td>
          <td data-sort-value="2">2</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Producto 2</td>
          <td data-sort-value="10">10</td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  `;
  return document.querySelector('[data-sortable]');
}

function rowLabels() {
  return Array.from(document.querySelectorAll('tbody tr td:first-child')).map(
    (cell) => cell.textContent
  );
}

describe('SortableTable', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('convierte cada th[data-sort] en un botón y deja th sin data-sort intacto', () => {
    new SortableTable(table());

    expect(
      document.getElementById('th-nombre').querySelector('button')
    ).not.toBeNull();
    expect(
      document.getElementById('th-stock').querySelector('button')
    ).not.toBeNull();
    expect(
      document.getElementById('th-nota').querySelector('button')
    ).toBeNull();
    expect(
      document.getElementById('th-nombre').querySelector('button').textContent
    ).toContain('Nombre');
  });

  it('la primera activación ordena ascendente', () => {
    const sortable = new SortableTable(table());

    document.getElementById('th-nombre').querySelector('button').click();

    expect(sortable.sorted).toEqual({ column: 0, direction: 'ascending' });
    expect(document.getElementById('th-nombre').getAttribute('aria-sort')).toBe(
      'ascending'
    );
    expect(rowLabels()).toEqual(['Producto 2', 'Producto 9', 'Producto 10']);
  });

  it('la segunda activación de la misma columna ordena descendente', () => {
    new SortableTable(table());
    const button = document.getElementById('th-nombre').querySelector('button');

    button.click();
    button.click();

    expect(document.getElementById('th-nombre').getAttribute('aria-sort')).toBe(
      'descending'
    );
    expect(rowLabels()).toEqual(['Producto 10', 'Producto 9', 'Producto 2']);
  });

  it('cambiar de columna quita aria-sort de la anterior y ordena la nueva ascendente', () => {
    new SortableTable(table());

    document.getElementById('th-nombre').querySelector('button').click();
    document.getElementById('th-stock').querySelector('button').click();

    expect(document.getElementById('th-nombre').hasAttribute('aria-sort')).toBe(
      false
    );
    expect(document.getElementById('th-stock').getAttribute('aria-sort')).toBe(
      'ascending'
    );
    // data-sort-value: 9, 2, 10 → ascendente: 2, 9, 10
    expect(rowLabels()).toEqual(['Producto 10', 'Producto 9', 'Producto 2']);
  });

  it('orden numérico: 10 va después de 9, no antes por comparación de texto', () => {
    new SortableTable(table());

    document.getElementById('th-stock').querySelector('button').click();

    const values = Array.from(
      document.querySelectorAll('tbody tr td:nth-child(2)')
    ).map((cell) => cell.textContent);
    expect(values).toEqual(['2', '9', '10']);
  });

  it('orden de texto: usa Intl.Collator, "Producto 10" va después de "Producto 9"', () => {
    new SortableTable(table());

    document.getElementById('th-nombre').querySelector('button').click();

    expect(rowLabels()).toEqual(['Producto 2', 'Producto 9', 'Producto 10']);
  });

  it('el foco permanece en el botón de la cabecera tras ordenar', () => {
    new SortableTable(table());
    const button = document.getElementById('th-nombre').querySelector('button');

    button.focus();
    button.click();

    expect(document.activeElement).toBe(button);
  });

  it('los botones son <button type="button">: Enter y Espacio ordenan sin enviar nada', () => {
    new SortableTable(table());
    const button = document.getElementById('th-nombre').querySelector('button');

    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('sort() se puede llamar directamente con una columna y una dirección', () => {
    const sortable = new SortableTable(table());

    sortable.sort(0, 'descending');

    expect(rowLabels()).toEqual(['Producto 10', 'Producto 9', 'Producto 2']);
    expect(sortable.sorted).toEqual({ column: 0, direction: 'descending' });
  });

  it('sort() sobre una columna sin data-sort no hace nada', () => {
    const sortable = new SortableTable(table());

    sortable.sort(2, 'ascending');

    expect(sortable.sorted).toBeNull();
  });

  it('el constructor lanza un error si no es un <table>', () => {
    document.body.innerHTML = `<div data-sortable></div>`;
    expect(
      () => new SortableTable(document.querySelector('[data-sortable]'))
    ).toThrow();
  });

  it('destroy() quita los listeners: los botones dejan de ordenar', () => {
    const sortable = new SortableTable(table());
    const button = document.getElementById('th-nombre').querySelector('button');
    sortable.destroy();

    button.click();

    expect(sortable.sorted).toBeNull();
  });
});

describe('initSortableTables', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inicializa todas las [data-sortable] de un contenedor', () => {
    document.body.innerHTML = `
      <table data-sortable><thead><tr><th data-sort="text">A</th></tr></thead><tbody></tbody></table>
      <table data-sortable><thead><tr><th data-sort="text">B</th></tr></thead><tbody></tbody></table>
    `;

    const tables = initSortableTables();

    expect(tables).toHaveLength(2);
    expect(tables[0]).toBeInstanceOf(SortableTable);
  });
});
