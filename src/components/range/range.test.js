import { describe, it, expect, beforeEach } from 'vitest';
import { Range, initRanges } from './range.js';

function input(el, value) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Range', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('el estado inicial sale del HTML: el output y aria-valuetext ya reflejan el value al construir', () => {
    document.body.innerHTML = `
      <input type="range" id="volumen" min="0" max="100" value="40" data-format="{value} %" />
      <output for="volumen" id="volumen-output"></output>
    `;

    new Range(document.getElementById('volumen'));

    expect(document.getElementById('volumen-output').textContent).toBe('40 %');
    expect(
      document.getElementById('volumen').getAttribute('aria-valuetext')
    ).toBe('40 %');
  });

  it('el output sigue al valor tras un evento input', () => {
    document.body.innerHTML = `
      <input type="range" id="volumen" min="0" max="100" value="40" data-format="{value} %" />
      <output for="volumen" id="volumen-output"></output>
    `;
    new Range(document.getElementById('volumen'));

    input(document.getElementById('volumen'), '75');

    expect(document.getElementById('volumen-output').textContent).toBe('75 %');
  });

  it('aria-valuetext usa data-format', () => {
    document.body.innerHTML = `
      <input type="range" id="temperatura" min="10" max="30" value="21" data-format="{value} ºC" />
    `;
    const range = new Range(document.getElementById('temperatura'));

    expect(
      document.getElementById('temperatura').getAttribute('aria-valuetext')
    ).toBe('21 ºC');
    expect(range.value).toBe(21);
  });

  it('un format personalizado tiene prioridad sobre data-format', () => {
    document.body.innerHTML = `
      <input type="range" id="precio" min="0" max="100" value="50" data-format="{value} %" />
    `;
    new Range(document.getElementById('precio'), {
      format: (value) => `${value} €`,
    });

    expect(
      document.getElementById('precio').getAttribute('aria-valuetext')
    ).toBe('50 €');
  });

  it('sin data-format ni format, usa el valor tal cual', () => {
    document.body.innerHTML = `<input type="range" id="brillo" min="0" max="100" value="70" />`;
    new Range(document.getElementById('brillo'));

    expect(
      document.getElementById('brillo').getAttribute('aria-valuetext')
    ).toBe('70');
  });

  it('funciona sin un <output> asociado: solo escribe aria-valuetext', () => {
    document.body.innerHTML = `<input type="range" id="suelto" min="0" max="10" value="5" />`;

    expect(() => new Range(document.getElementById('suelto'))).not.toThrow();
    expect(
      document.getElementById('suelto').getAttribute('aria-valuetext')
    ).toBe('5');
  });

  it('el constructor lanza un error si no es un input[type="range"]', () => {
    document.body.innerHTML = `<input type="text" id="texto" />`;
    expect(() => new Range(document.getElementById('texto'))).toThrow();
  });

  it('destroy() quita el listener: el output deja de seguir al valor', () => {
    document.body.innerHTML = `
      <input type="range" id="volumen" min="0" max="100" value="40" data-format="{value} %" />
      <output for="volumen" id="volumen-output"></output>
    `;
    const range = new Range(document.getElementById('volumen'));
    range.destroy();

    input(document.getElementById('volumen'), '90');

    expect(document.getElementById('volumen-output').textContent).toBe('40 %');
  });
});

describe('initRanges', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inicializa todos los [data-range] de un contenedor', () => {
    document.body.innerHTML = `
      <input type="range" id="a" data-range min="0" max="10" value="1" />
      <input type="range" id="b" data-range min="0" max="10" value="2" />
    `;

    const ranges = initRanges();

    expect(ranges).toHaveLength(2);
    expect(ranges[0]).toBeInstanceOf(Range);
  });
});
