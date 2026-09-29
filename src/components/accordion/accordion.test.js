import { describe, it, expect, beforeEach } from 'vitest';
import { Accordion } from './accordion.js';

function buildMarkup() {
  document.body.innerHTML = `
    <div data-accordion>
      <h3><button class="c-accordion__trigger" id="t1" aria-expanded="true" aria-controls="p1">Uno</button></h3>
      <section class="c-accordion__panel" id="p1" aria-labelledby="t1"><p>Contenido 1</p></section>

      <h3><button class="c-accordion__trigger" id="t2" aria-expanded="false" aria-controls="p2">Dos</button></h3>
      <section class="c-accordion__panel" id="p2" aria-labelledby="t2" hidden><p>Contenido 2</p></section>

      <h3><button class="c-accordion__trigger" id="t3" aria-expanded="false" aria-controls="p3">Tres</button></h3>
      <section class="c-accordion__panel" id="p3" aria-labelledby="t3" hidden><p>Contenido 3</p></section>
    </div>
  `;
  return document.querySelector('[data-accordion]');
}

describe('Accordion', () => {
  let container;

  beforeEach(() => {
    container = buildMarkup();
  });

  it('alterna aria-expanded y el atributo hidden del panel al hacer clic', () => {
    new Accordion(container);
    const t1 = document.getElementById('t1');
    const p1 = document.getElementById('p1');

    expect(p1.hasAttribute('hidden')).toBe(false);
    t1.click();
    expect(t1.getAttribute('aria-expanded')).toBe('false');
    expect(p1.hasAttribute('hidden')).toBe(true);

    t1.click();
    expect(t1.getAttribute('aria-expanded')).toBe('true');
    expect(p1.hasAttribute('hidden')).toBe(false);
  });

  it('con allowMultiple: false, abrir un panel cierra los demás', () => {
    new Accordion(container, { allowMultiple: false });
    const t1 = document.getElementById('t1');
    const t2 = document.getElementById('t2');
    const p1 = document.getElementById('p1');
    const p2 = document.getElementById('p2');

    t2.click();

    expect(t2.getAttribute('aria-expanded')).toBe('true');
    expect(p2.hasAttribute('hidden')).toBe(false);
    expect(t1.getAttribute('aria-expanded')).toBe('false');
    expect(p1.hasAttribute('hidden')).toBe(true);
  });

  it('ArrowDown/ArrowUp mueven el foco entre triggers, con envoltura', () => {
    new Accordion(container);
    const [t1, t2, t3] = ['t1', 't2', 't3'].map((id) =>
      document.getElementById(id)
    );

    t1.focus();
    t1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(document.activeElement).toBe(t2);

    t3.focus();
    t3.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(document.activeElement).toBe(t1);

    t1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(document.activeElement).toBe(t3);
  });

  it('Home y End mueven el foco al primer y último trigger', () => {
    new Accordion(container);
    const [t1, , t3] = ['t1', 't2', 't3'].map((id) =>
      document.getElementById(id)
    );

    t1.focus();
    t1.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true })
    );
    expect(document.activeElement).toBe(t3);

    t3.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );
    expect(document.activeElement).toBe(t1);
  });
});
