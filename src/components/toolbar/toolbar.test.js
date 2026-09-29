import { describe, it, expect, beforeEach } from 'vitest';
import { Toolbar, initToolbars } from './toolbar.js';

function buildMarkup(orientation = 'horizontal') {
  const orientationAttr =
    orientation === 'vertical' ? 'aria-orientation="vertical"' : '';
  document.body.innerHTML = `
    <div class="c-toolbar" role="toolbar" aria-label="Formato de texto" data-toolbar ${orientationAttr}>
      <div class="c-toolbar__group" role="group" aria-label="Estilo de texto">
        <button type="button" class="c-toolbar__item" id="bold" aria-pressed="false">Negrita</button>
        <button type="button" class="c-toolbar__item" id="italic" aria-pressed="false">Cursiva</button>
      </div>
      <div class="c-toolbar__group" role="group" aria-label="Alineación">
        <button type="button" class="c-toolbar__item" id="left">Izquierda</button>
        <button type="button" class="c-toolbar__item" id="right">Derecha</button>
      </div>
    </div>
  `;
  return document.querySelector('[data-toolbar]');
}

function press(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('Toolbar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Toolbar(null)).toThrow();
  });

  it('deja exactamente un elemento con tabindex="0" al iniciar', () => {
    const el = buildMarkup();
    new Toolbar(el);
    const items = Array.from(el.querySelectorAll('.c-toolbar__item'));
    const withZero = items.filter(
      (item) => item.getAttribute('tabindex') === '0'
    );
    expect(withZero).toHaveLength(1);
  });

  it('orientación horizontal (por defecto): → mueve el foco cruzando subgrupos', () => {
    const el = buildMarkup();
    new Toolbar(el);
    const [bold, italic, left, right] = ['bold', 'italic', 'left', 'right'].map(
      (id) => document.getElementById(id)
    );

    bold.focus();
    press(bold, 'ArrowRight');
    expect(document.activeElement).toBe(italic);

    press(italic, 'ArrowRight');
    expect(document.activeElement).toBe(left);

    press(left, 'ArrowRight');
    expect(document.activeElement).toBe(right);

    press(right, 'ArrowRight');
    expect(document.activeElement).toBe(bold);
  });

  it('con aria-orientation="vertical", ↓/↑ mueven el foco en vez de →/←', () => {
    const el = buildMarkup('vertical');
    new Toolbar(el);
    const bold = document.getElementById('bold');
    const italic = document.getElementById('italic');

    bold.focus();
    press(bold, 'ArrowRight');
    expect(document.activeElement).toBe(bold);

    press(bold, 'ArrowDown');
    expect(document.activeElement).toBe(italic);
  });

  it('Home/End van al primer y último control de todo el toolbar', () => {
    const el = buildMarkup();
    new Toolbar(el);
    const bold = document.getElementById('bold');
    const right = document.getElementById('right');

    bold.focus();
    press(bold, 'End');
    expect(document.activeElement).toBe(right);

    press(right, 'Home');
    expect(document.activeElement).toBe(bold);
  });

  it('destroy() quita los listeners de teclado', () => {
    const el = buildMarkup();
    const toolbar = new Toolbar(el);
    toolbar.destroy();

    const bold = document.getElementById('bold');
    bold.focus();
    press(bold, 'ArrowRight');
    expect(document.activeElement).toBe(bold);
  });

  it('initToolbars inicializa todos los [data-toolbar] de un contenedor', () => {
    buildMarkup();
    const toolbars = initToolbars();
    expect(toolbars).toHaveLength(1);
    expect(toolbars[0]).toBeInstanceOf(Toolbar);
  });
});
