import { describe, it, expect, beforeEach } from 'vitest';
import { Switch, initSwitch } from './switch.js';

function buildMarkup(ariaChecked = 'false', extra = '') {
  document.body.innerHTML = `
    <button type="button" role="switch" class="c-switch"
      aria-checked="${ariaChecked}" ${extra}>
      <span class="c-switch__label">Modo oscuro</span>
    </button>
  `;
  return document.querySelector('button');
}

describe('Switch', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Switch(null)).toThrow();
  });

  it('respeta el aria-checked inicial', () => {
    const el = buildMarkup('true');
    const sw = new Switch(el);
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(sw.checked).toBe(true);
  });

  it('inicializa aria-checked="false" si falta', () => {
    document.body.innerHTML = '<button role="switch">X</button>';
    const el = document.querySelector('button');
    new Switch(el);
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('alterna aria-checked entre true y false con cada clic', () => {
    const el = buildMarkup();
    new Switch(el);

    el.click();
    expect(el.getAttribute('aria-checked')).toBe('true');

    el.click();
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('emite change con el nuevo estado', () => {
    const el = buildMarkup();
    new Switch(el);
    const estados = [];
    el.addEventListener('change', (e) => estados.push(e.detail.checked));

    el.click();
    el.click();

    expect(estados).toEqual([true, false]);
  });

  it('no alterna si está deshabilitado', () => {
    const el = buildMarkup('false', 'disabled');
    new Switch(el);
    el.click();
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('destroy() deja de reaccionar', () => {
    const el = buildMarkup();
    const sw = new Switch(el);
    sw.destroy();
    el.click();
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('initSwitch instancia todos los interruptores', () => {
    buildMarkup();
    expect(initSwitch()).toHaveLength(1);
  });
});
