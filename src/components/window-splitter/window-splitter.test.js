import { describe, it, expect, beforeEach } from 'vitest';
import { WindowSplitter } from './window-splitter.js';

function buildSplitter({
  orientation = 'vertical',
  value,
  min,
  max,
  step,
} = {}) {
  const valueAttr = value !== undefined ? ` aria-valuenow="${value}"` : '';
  const minAttr = min !== undefined ? ` aria-valuemin="${min}"` : '';
  const maxAttr = max !== undefined ? ` aria-valuemax="${max}"` : '';
  const stepAttr = step !== undefined ? ` data-step="${step}"` : '';
  document.body.innerHTML = `
    <div class="c-splitter c-splitter--horizontal">
      <div class="c-splitter__pane" id="principal"></div>
      <div
        class="c-splitter__separator"
        role="separator"
        aria-controls="principal"
        aria-label="Cambiar tamaño"
        aria-orientation="${orientation}"
        data-splitter${valueAttr}${minAttr}${maxAttr}${stepAttr}
      ></div>
      <div class="c-splitter__pane"></div>
    </div>
  `;
  return document.querySelector('[data-splitter]');
}

function press(separator, key) {
  separator.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('WindowSplitter', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe el separador', () => {
    expect(() => new WindowSplitter(null)).toThrow();
  });

  it('lanza un error si no está dentro de un .c-splitter', () => {
    document.body.innerHTML = `
      <div id="principal"></div>
      <div role="separator" aria-controls="principal" data-splitter></div>
    `;
    expect(
      () => new WindowSplitter(document.querySelector('[data-splitter]'))
    ).toThrow();
  });

  it('lanza un error si aria-controls no apunta a un panel existente', () => {
    document.body.innerHTML = `
      <div class="c-splitter">
        <div role="separator" aria-controls="no-existe" data-splitter></div>
      </div>
    `;
    expect(
      () => new WindowSplitter(document.querySelector('[data-splitter]'))
    ).toThrow();
  });

  it('añade tabindex="0" y aria-value* por defecto (0/100/50) si no estaban en el HTML', () => {
    const separator = buildSplitter();
    new WindowSplitter(separator);

    expect(separator.getAttribute('tabindex')).toBe('0');
    expect(separator.getAttribute('aria-valuemin')).toBe('0');
    expect(separator.getAttribute('aria-valuemax')).toBe('100');
    expect(separator.getAttribute('aria-valuenow')).toBe('50');
    expect(separator.getAttribute('aria-valuetext')).toBe('50 %');
  });

  it('respeta aria-valuenow/min/max ya escritos en el HTML', () => {
    const separator = buildSplitter({ value: 30, min: 10, max: 90 });
    new WindowSplitter(separator);

    expect(separator.getAttribute('aria-valuemin')).toBe('10');
    expect(separator.getAttribute('aria-valuemax')).toBe('90');
    expect(separator.getAttribute('aria-valuenow')).toBe('30');
  });

  it('aria-valuetext redondea a 2 decimales; aria-valuenow conserva la precisión', () => {
    const separator = buildSplitter({ value: 50, min: 0, max: 100 });
    new WindowSplitter(separator);
    const container = document.querySelector('.c-splitter');
    container.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 300,
      height: 0,
    });

    separator.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 100, bubbles: true })
    );

    expect(separator.getAttribute('aria-valuenow')).toBe('33.33333333333333');
    expect(separator.getAttribute('aria-valuetext')).toBe('33.33 %');
  });

  it('--c-splitter-position en el contenedor está sincronizado con aria-valuenow', () => {
    const separator = buildSplitter({ value: 50 });
    new WindowSplitter(separator);
    const container = document.querySelector('.c-splitter');

    expect(container.style.getPropertyValue('--c-splitter-position')).toBe(
      '50%'
    );

    press(separator, 'ArrowRight');

    expect(separator.getAttribute('aria-valuenow')).toBe('55');
    expect(container.style.getPropertyValue('--c-splitter-position')).toBe(
      '55%'
    );
  });

  it('separador vertical (paneles lado a lado): ←/→ mueven data-step', () => {
    const separator = buildSplitter({
      orientation: 'vertical',
      value: 50,
      step: 5,
    });
    new WindowSplitter(separator);

    press(separator, 'ArrowRight');
    expect(separator.getAttribute('aria-valuenow')).toBe('55');

    press(separator, 'ArrowLeft');
    press(separator, 'ArrowLeft');
    expect(separator.getAttribute('aria-valuenow')).toBe('45');
  });

  it('separador horizontal (paneles apilados): ↑/↓ mueven data-step', () => {
    const separator = buildSplitter({
      orientation: 'horizontal',
      value: 50,
      step: 5,
    });
    new WindowSplitter(separator);

    press(separator, 'ArrowDown');
    expect(separator.getAttribute('aria-valuenow')).toBe('55');

    press(separator, 'ArrowUp');
    press(separator, 'ArrowUp');
    expect(separator.getAttribute('aria-valuenow')).toBe('45');
  });

  it('las flechas de la otra orientación no hacen nada', () => {
    const separator = buildSplitter({ orientation: 'vertical', value: 50 });
    new WindowSplitter(separator);

    press(separator, 'ArrowUp');
    press(separator, 'ArrowDown');

    expect(separator.getAttribute('aria-valuenow')).toBe('50');
  });

  it('Inicio/Fin van a aria-valuemin/aria-valuemax', () => {
    const separator = buildSplitter({ value: 50, min: 10, max: 90 });
    new WindowSplitter(separator);

    press(separator, 'End');
    expect(separator.getAttribute('aria-valuenow')).toBe('90');

    press(separator, 'Home');
    expect(separator.getAttribute('aria-valuenow')).toBe('10');
  });

  it('el valor se acota en los extremos y no los sobrepasa', () => {
    const separator = buildSplitter({
      value: 95,
      min: 0,
      max: 100,
      step: 10,
    });
    new WindowSplitter(separator);

    press(separator, 'ArrowRight');
    expect(separator.getAttribute('aria-valuenow')).toBe('100');

    press(separator, 'ArrowRight'); // ya en el máximo
    expect(separator.getAttribute('aria-valuenow')).toBe('100');
  });

  it('Enter colapsa al mínimo y, si ya está colapsado, restaura el valor anterior', () => {
    const separator = buildSplitter({ value: 40, min: 0, max: 100 });
    const splitter = new WindowSplitter(separator);

    press(separator, 'Enter');
    expect(separator.getAttribute('aria-valuenow')).toBe('0');
    expect(splitter.collapsed).toBe(true);

    press(separator, 'Enter');
    expect(separator.getAttribute('aria-valuenow')).toBe('40');
    expect(splitter.collapsed).toBe(false);
  });

  it('collapse()/restore() hacen lo mismo que Enter', () => {
    const separator = buildSplitter({ value: 40, min: 0, max: 100 });
    const splitter = new WindowSplitter(separator);

    splitter.collapse();
    expect(splitter.value).toBe(0);

    splitter.restore();
    expect(splitter.value).toBe(40);
  });

  it('colapsar cuando ya está en el mínimo no hace nada', () => {
    const separator = buildSplitter({ value: 0, min: 0, max: 100 });
    const splitter = new WindowSplitter(separator);
    const events = [];
    separator.addEventListener('splitter:change', (event) =>
      events.push(event.detail)
    );

    splitter.collapse();

    expect(events).toHaveLength(0);
  });

  it('se dispara splitter:change al cambiar, pero no al quedarse en el límite', () => {
    const separator = buildSplitter({ value: 100, min: 0, max: 100 });
    new WindowSplitter(separator);
    const events = [];
    separator.addEventListener('splitter:change', (event) =>
      events.push(event.detail)
    );

    press(separator, 'ArrowRight'); // ya en el máximo, no cambia
    expect(events).toHaveLength(0);

    press(separator, 'ArrowLeft');
    expect(events).toEqual([{ value: 95 }]);
  });

  it('get value()/set value(v): acota y sincroniza, sin disparar el evento', () => {
    const separator = buildSplitter({ value: 50, min: 0, max: 100 });
    const splitter = new WindowSplitter(separator);
    const events = [];
    separator.addEventListener('splitter:change', (event) =>
      events.push(event.detail)
    );

    splitter.value = 999;

    expect(splitter.value).toBe(100);
    expect(separator.getAttribute('aria-valuenow')).toBe('100');
    expect(events).toHaveLength(0);
  });

  it('destroy() deja de reaccionar a las teclas', () => {
    const separator = buildSplitter({ value: 50 });
    const splitter = new WindowSplitter(separator);

    splitter.destroy();
    press(separator, 'ArrowRight');

    expect(separator.getAttribute('aria-valuenow')).toBe('50');
  });

  describe('arrastre (pointer events)', () => {
    function pointerEvent(
      type,
      { clientX = 0, clientY = 0, pointerId = 1 } = {}
    ) {
      const event = new MouseEvent(type, {
        clientX,
        clientY,
        bubbles: true,
        cancelable: true,
      });
      // jsdom no implementa PointerEvent: un MouseEvent con estas
      // propiedades añadidas a mano es suficiente para lo que lee
      // window-splitter.js (clientX/clientY/pointerId).
      event.pointerId = pointerId;
      return event;
    }

    function mockRect(container, rect) {
      container.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        ...rect,
      });
    }

    it('pointerdown calcula el porcentaje sobre el contenedor y da el foco al separador', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 60 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('30');
      expect(document.activeElement).toBe(separator);
    });

    it('pointermove mientras se arrastra actualiza el valor', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 60 }));
      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 140 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('70');
    });

    it('pointermove sin un pointerdown antes no hace nada', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 150 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('50');
    });

    it('pointerup termina el arrastre: un pointermove posterior ya no actualiza el valor', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 60 }));
      separator.dispatchEvent(pointerEvent('pointerup', { clientX: 60 }));
      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 190 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('30');
    });

    it('pointercancel también termina el arrastre', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 60 }));
      separator.dispatchEvent(pointerEvent('pointercancel', { clientX: 60 }));
      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 190 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('30');
    });

    it('el valor se acota durante el arrastre si el puntero sale del contenedor', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: -50 }));
      expect(separator.getAttribute('aria-valuenow')).toBe('0');

      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 500 }));
      expect(separator.getAttribute('aria-valuenow')).toBe('100');
    });

    it('en el separador horizontal, el arrastre usa el eje Y', () => {
      const separator = buildSplitter({
        orientation: 'horizontal',
        value: 50,
        min: 0,
        max: 100,
      });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { top: 0, height: 200 });

      separator.dispatchEvent(pointerEvent('pointerdown', { clientY: 150 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('75');
    });

    it('se dispara splitter:change al arrastrar, pero no si el valor no cambia', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });
      const events = [];
      separator.addEventListener('splitter:change', (event) =>
        events.push(event.detail)
      );

      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 })); // 50 %, sin cambio
      expect(events).toHaveLength(0);

      separator.dispatchEvent(pointerEvent('pointermove', { clientX: 140 })); // 70 %
      expect(events).toEqual([{ value: 70 }]);
    });

    it('destroy() deja de reaccionar al arrastre', () => {
      const separator = buildSplitter({ value: 50, min: 0, max: 100 });
      const splitter = new WindowSplitter(separator);
      const container = document.querySelector('.c-splitter');
      mockRect(container, { left: 0, width: 200 });

      splitter.destroy();
      separator.dispatchEvent(pointerEvent('pointerdown', { clientX: 150 }));

      expect(separator.getAttribute('aria-valuenow')).toBe('50');
    });
  });
});
