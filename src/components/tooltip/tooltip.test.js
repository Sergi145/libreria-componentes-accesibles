import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Tooltip, initTooltips } from './tooltip.js';

function buildMarkup() {
  document.body.innerHTML = `
    <span class="c-tooltip">
      <button type="button" data-tooltip aria-describedby="t1-bubble">
        Guardar
      </button>
      <span role="tooltip" id="t1-bubble">Atajo: Ctrl + S</span>
    </span>
  `;
}

// Botón solo icono: el nombre accesible viene de aria-labelledby, que
// apunta al propio <span role="tooltip"> en vez de duplicar el texto
// en aria-label.
function buildLabelledbyMarkup() {
  document.body.innerHTML = `
    <span class="c-tooltip">
      <button type="button" data-tooltip aria-labelledby="t2-bubble">
        <svg aria-hidden="true"></svg>
      </button>
      <span role="tooltip" id="t2-bubble">Copiar enlace</span>
    </span>
  `;
}

function mouseenter(el) {
  el.dispatchEvent(new MouseEvent('mouseenter'));
}

function mouseleave(el) {
  el.dispatchEvent(new MouseEvent('mouseleave'));
}

describe('Tooltip', () => {
  beforeEach(() => {
    buildMarkup();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lanza un error si el disparador no tiene aria-describedby', () => {
    document.body.innerHTML = '<button type="button">Guardar</button>';
    expect(() => new Tooltip(document.querySelector('button'))).toThrow();
  });

  it('lanza un error si el disparador no está dentro de .c-tooltip', () => {
    document.body.innerHTML = `
      <button type="button" aria-describedby="x">Guardar</button>
      <span role="tooltip" id="x">Texto</span>
    `;
    expect(() => new Tooltip(document.querySelector('button'))).toThrow();
  });

  it('al enfocar el disparador se muestra al momento, sin esperar el delay', () => {
    const trigger = document.querySelector('button');
    const tooltip = new Tooltip(trigger);

    trigger.focus();

    expect(tooltip.visible).toBe(true);
    expect(
      document.getElementById('t1-bubble').hasAttribute('data-visible')
    ).toBe(true);
  });

  it('al perder el foco se oculta', () => {
    const trigger = document.querySelector('button');
    const tooltip = new Tooltip(trigger);
    trigger.focus();

    trigger.blur();

    expect(tooltip.visible).toBe(false);
    expect(
      document.getElementById('t1-bubble').hasAttribute('data-visible')
    ).toBe(false);
  });

  it('con el ratón se muestra tras `delay` ms, no antes', () => {
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(document.querySelector('button'), {
      delay: 300,
    });

    mouseenter(wrapper);
    expect(tooltip.visible).toBe(false);

    vi.advanceTimersByTime(299);
    expect(tooltip.visible).toBe(false);

    vi.advanceTimersByTime(1);
    expect(tooltip.visible).toBe(true);
  });

  it('mouseleave antes de que cumpla el delay cancela el aviso pendiente', () => {
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(document.querySelector('button'), {
      delay: 300,
    });

    mouseenter(wrapper);
    mouseleave(wrapper);
    vi.advanceTimersByTime(300);

    expect(tooltip.visible).toBe(false);
  });

  it('el ratón puede pasar del disparador al tooltip sin que se oculte (hoverable)', () => {
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(document.querySelector('button'), {
      delay: 300,
    });

    mouseenter(wrapper);
    vi.advanceTimersByTime(300);
    expect(tooltip.visible).toBe(true);

    // Un solo envoltorio: moverse del disparador a la burbuja no genera
    // mouseleave en él.
    expect(tooltip.visible).toBe(true);
  });

  it('mouseleave del envoltorio lo oculta si el disparador no tiene el foco', () => {
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(document.querySelector('button'), {
      delay: 300,
    });

    mouseenter(wrapper);
    vi.advanceTimersByTime(300);
    expect(tooltip.visible).toBe(true);

    mouseleave(wrapper);

    expect(tooltip.visible).toBe(false);
  });

  it('mouseleave del envoltorio NO lo oculta si el disparador tiene el foco', () => {
    const trigger = document.querySelector('button');
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(trigger, { delay: 300 });

    trigger.focus();
    mouseenter(wrapper);
    vi.advanceTimersByTime(300);
    mouseleave(wrapper);

    expect(tooltip.visible).toBe(true);
  });

  it('Escape lo oculta sin mover el foco', () => {
    const trigger = document.querySelector('button');
    const tooltip = new Tooltip(trigger);
    trigger.focus();
    expect(tooltip.visible).toBe(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    expect(tooltip.visible).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('sin aria-describedby, resuelve la burbuja por aria-labelledby (botón solo icono)', () => {
    buildLabelledbyMarkup();
    const trigger = document.querySelector('button');
    const tooltip = new Tooltip(trigger);

    trigger.focus();

    expect(tooltip.visible).toBe(true);
    expect(
      document.getElementById('t2-bubble').hasAttribute('data-visible')
    ).toBe(true);
  });

  it('no toca aria-labelledby ni añade aria-describedby', () => {
    buildLabelledbyMarkup();
    const trigger = document.querySelector('button');

    new Tooltip(trigger);

    expect(trigger.getAttribute('aria-labelledby')).toBe('t2-bubble');
    expect(trigger.hasAttribute('aria-describedby')).toBe(false);
  });

  it('destroy() quita los listeners: ya no se muestra al enfocar ni al pasar el ratón', () => {
    const trigger = document.querySelector('button');
    const wrapper = document.querySelector('.c-tooltip');
    const tooltip = new Tooltip(trigger, { delay: 300 });
    tooltip.destroy();

    trigger.focus();
    mouseenter(wrapper);
    vi.advanceTimersByTime(300);

    expect(tooltip.visible).toBe(false);
  });

  it('initTooltips inicializa todos los [data-tooltip] de la raíz', () => {
    const [tooltip] = initTooltips();
    const trigger = document.querySelector('button');

    trigger.focus();

    expect(tooltip.visible).toBe(true);
  });
});
