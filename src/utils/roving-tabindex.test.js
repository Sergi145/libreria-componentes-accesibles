import { describe, it, expect, beforeEach } from 'vitest';
import { rovingTabindex } from './roving-tabindex.js';

function buildItems(count, extraAttrsByIndex = {}) {
  const buttons = Array.from({ length: count }, (_, i) => {
    const attrs = extraAttrsByIndex[i] ?? '';
    return `<button class="item" id="i${i}" ${attrs}>Item ${i}</button>`;
  }).join('');

  document.body.innerHTML = `<div id="container">${buttons}</div>`;
  return document.getElementById('container');
}

function press(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('rovingTabindex', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('con un solo elemento, ese elemento queda con tabindex="0"', () => {
    container = buildItems(1);
    rovingTabindex(container, '.item');

    expect(document.getElementById('i0').getAttribute('tabindex')).toBe('0');
  });

  it('activa el primer elemento con tabindex="0" al iniciar, sin robar el foco', () => {
    container = buildItems(3);
    rovingTabindex(container, '.item');

    const [i0, i1, i2] = ['i0', 'i1', 'i2'].map((id) =>
      document.getElementById(id)
    );
    expect(i0.getAttribute('tabindex')).toBe('0');
    expect(i1.getAttribute('tabindex')).toBe('-1');
    expect(i2.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).not.toBe(i0);
  });

  it('respeta un tabindex="0" ya presente en el HTML como elemento inicial', () => {
    container = buildItems(3, { 1: 'tabindex="0"' });
    rovingTabindex(container, '.item');

    expect(document.getElementById('i0').getAttribute('tabindex')).toBe('-1');
    expect(document.getElementById('i1').getAttribute('tabindex')).toBe('0');
    expect(document.getElementById('i2').getAttribute('tabindex')).toBe('-1');
  });

  it('orientación horizontal: ArrowRight/ArrowLeft mueven el foco, con envoltura', () => {
    container = buildItems(3);
    rovingTabindex(container, '.item', { orientation: 'horizontal' });
    const [i0, i1, i2] = ['i0', 'i1', 'i2'].map((id) =>
      document.getElementById(id)
    );

    i0.focus();
    press(i0, 'ArrowRight');
    expect(document.activeElement).toBe(i1);
    expect(i1.getAttribute('tabindex')).toBe('0');
    expect(i0.getAttribute('tabindex')).toBe('-1');

    press(i1, 'ArrowRight');
    expect(document.activeElement).toBe(i2);

    press(i2, 'ArrowRight');
    expect(document.activeElement).toBe(i0);

    press(i0, 'ArrowLeft');
    expect(document.activeElement).toBe(i2);
  });

  it('orientación vertical: ArrowUp/ArrowDown mueven el foco; ArrowRight/ArrowLeft no hacen nada', () => {
    container = buildItems(2);
    rovingTabindex(container, '.item', { orientation: 'vertical' });
    const [i0, i1] = ['i0', 'i1'].map((id) => document.getElementById(id));

    i0.focus();
    press(i0, 'ArrowRight');
    expect(document.activeElement).toBe(i0);

    press(i0, 'ArrowDown');
    expect(document.activeElement).toBe(i1);

    press(i1, 'ArrowUp');
    expect(document.activeElement).toBe(i0);
  });

  it('sin envoltura (loop: false), las flechas se detienen en los extremos', () => {
    container = buildItems(3);
    rovingTabindex(container, '.item', { loop: false });
    const [i0, , i2] = ['i0', 'i1', 'i2'].map((id) =>
      document.getElementById(id)
    );

    i0.focus();
    press(i0, 'ArrowLeft');
    expect(document.activeElement).toBe(i0);

    i2.focus();
    press(i2, 'ArrowRight');
    expect(document.activeElement).toBe(i2);
  });

  it('Home y End mueven el foco al primer y último elemento', () => {
    container = buildItems(4);
    rovingTabindex(container, '.item');
    const [i0, , , i3] = ['i0', 'i1', 'i2', 'i3'].map((id) =>
      document.getElementById(id)
    );

    i0.focus();
    press(i0, 'End');
    expect(document.activeElement).toBe(i3);

    press(i3, 'Home');
    expect(document.activeElement).toBe(i0);
  });

  it('se salta los elementos disabled y los ocultos al mover el foco', () => {
    container = buildItems(4, { 1: 'disabled', 2: 'hidden' });
    rovingTabindex(container, '.item');
    const [i0, , , i3] = ['i0', 'i1', 'i2', 'i3'].map((id) =>
      document.getElementById(id)
    );

    // El elemento inicial activo no puede ser uno deshabilitado u oculto.
    expect(i0.getAttribute('tabindex')).toBe('0');

    i0.focus();
    press(i0, 'ArrowRight');
    expect(document.activeElement).toBe(i3);

    press(i3, 'ArrowLeft');
    expect(document.activeElement).toBe(i0);
  });

  it('el clic en un elemento lo convierte en el activo (tabindex="0")', () => {
    container = buildItems(3);
    rovingTabindex(container, '.item');
    const [i0, i1] = ['i0', 'i1'].map((id) => document.getElementById(id));

    i1.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(i1.getAttribute('tabindex')).toBe('0');
    expect(i0.getAttribute('tabindex')).toBe('-1');
  });

  it('destroy() quita los listeners: las flechas dejan de mover el foco', () => {
    container = buildItems(2);
    const destroy = rovingTabindex(container, '.item');
    const [i0, i1] = ['i0', 'i1'].map((id) => document.getElementById(id));

    destroy();

    i0.focus();
    press(i0, 'ArrowRight');
    expect(document.activeElement).toBe(i0);
    expect(i1.getAttribute('tabindex')).toBe('-1');
  });
});
