import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { normalizeText, createTypeahead } from './typeahead.js';

function items(...names) {
  return names.map((text) => ({ textContent: text }));
}

describe('normalizeText', () => {
  it('quita tildes, pasa a minúsculas y recorta espacios', () => {
    expect(normalizeText('Ávila')).toBe('avila');
    expect(normalizeText('MÁLAGA')).toBe('malaga');
    expect(normalizeText('  Castellón  ')).toBe(
      'castellón'.normalize('NFD').replace(/[̀-ͯ]/g, '')
    );
  });
});

describe('createTypeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('«ma» tecleado seguido encuentra la primera opción que empieza por «ma»', () => {
    const typeahead = createTypeahead();
    const list = items('Alicante', 'Burgos', 'Málaga', 'Valencia');

    const afterM = typeahead.search('m', list, -1);
    expect(afterM).toBe(2);

    vi.advanceTimersByTime(100);
    const afterMa = typeahead.search('a', list, afterM);
    expect(afterMa).toBe(2);
  });

  it('tras 500 ms sin teclas el búfer se vacía y empieza una búsqueda nueva', () => {
    const typeahead = createTypeahead();
    const list = items('Alicante', 'Burgos');

    expect(typeahead.search('m', list, -1)).toBe(-1);

    vi.advanceTimersByTime(501);

    expect(typeahead.search('a', list, -1)).toBe(0);
  });

  it('repetir la misma letra («aaa») recorre las opciones que empiezan por ella', () => {
    const typeahead = createTypeahead();
    const list = items('Alicante', 'Avila', 'Burgos');

    const first = typeahead.search('a', list, -1);
    expect(first).toBe(0);

    vi.advanceTimersByTime(100);
    const second = typeahead.search('a', list, first);
    expect(second).toBe(1);

    vi.advanceTimersByTime(100);
    const third = typeahead.search('a', list, second);
    expect(third).toBe(0);
  });

  it('la búsqueda empieza después de la opción actual y da la vuelta', () => {
    const typeahead = createTypeahead();
    const list = items('Ana', 'Ada');

    expect(typeahead.search('a', list, 0)).toBe(1);

    const wrap = createTypeahead();
    expect(wrap.search('a', list, 1)).toBe(0);
  });

  it('las tildes y las mayúsculas no cuentan al buscar', () => {
    const typeahead = createTypeahead();
    const list = items('Ávila', 'Burgos');

    expect(typeahead.search('A', list, -1)).toBe(0);
  });

  it('sin coincidencia devuelve -1', () => {
    const typeahead = createTypeahead();
    const list = items('Burgos', 'Valencia');

    expect(typeahead.search('z', list, -1)).toBe(-1);
    expect(typeahead.search('a', [], -1)).toBe(-1);
  });

  it('reset() vacía el búfer: la siguiente tecla empieza una búsqueda nueva', () => {
    const typeahead = createTypeahead();
    const list = items('Madrid', 'Alicante');

    typeahead.search('m', list, -1);
    typeahead.reset();

    expect(typeahead.search('a', list, -1)).toBe(1);
  });

  it('ignora teclas que no son un solo carácter imprimible', () => {
    const typeahead = createTypeahead();
    const list = items('Alicante', 'Burgos');

    expect(typeahead.search('ArrowDown', list, -1)).toBe(-1);
    expect(typeahead.search('', list, -1)).toBe(-1);
  });
});
