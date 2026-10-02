import { describe, it, expect } from 'vitest';
import { getSortValue, compareSortValues } from './sort.js';

function buildCell(textContent, dataSortValue = null) {
  const cell = document.createElement('td');
  cell.textContent = textContent;
  if (dataSortValue !== null) {
    cell.setAttribute('data-sort-value', dataSortValue);
  }
  return cell;
}

describe('sort.js', () => {
  describe('getSortValue', () => {
    it('devuelve data-sort-value si existe', () => {
      const cell = buildCell('9', '9');
      expect(getSortValue(cell)).toBe('9');
    });

    it('devuelve el texto trimmed si no hay data-sort-value', () => {
      const cell = buildCell('  Ávila  ');
      expect(getSortValue(cell)).toBe('Ávila');
    });

    it('data-sort-value tiene prioridad sobre el texto', () => {
      const cell = buildCell('Texto visible', 'valor-oculto');
      expect(getSortValue(cell)).toBe('valor-oculto');
    });

    it('devuelve cadena vacía si la celda es null', () => {
      expect(getSortValue(null)).toBe('');
    });

    it('devuelve cadena vacía si la celda está vacía', () => {
      const cell = buildCell('');
      expect(getSortValue(cell)).toBe('');
    });
  });

  describe('compareSortValues', () => {
    describe('type: "number"', () => {
      it('10 va después de 9', () => {
        const result = compareSortValues('9', '10', 'number');
        expect(result).toBeLessThan(0);
      });

      it('2 va antes de 10', () => {
        const result = compareSortValues('10', '2', 'number');
        expect(result).toBeGreaterThan(0);
      });

      it('números iguales devuelven 0', () => {
        const result = compareSortValues('5', '5', 'number');
        expect(result).toBe(0);
      });
    });

    describe('type: "text"', () => {
      it('Ávila va antes de Burgos', () => {
        const result = compareSortValues('Ávila', 'Burgos', 'text');
        expect(result).toBeLessThan(0);
      });

      it('usa Intl.Collator: Producto 2 antes de Producto 9 y Producto 10', () => {
        expect(
          compareSortValues('Producto 2', 'Producto 9', 'text')
        ).toBeLessThan(0);
        expect(
          compareSortValues('Producto 9', 'Producto 10', 'text')
        ).toBeLessThan(0);
      });

      it('textos iguales devuelven 0', () => {
        const result = compareSortValues('Mismo', 'Mismo', 'text');
        expect(result).toBe(0);
      });
    });
  });
});
