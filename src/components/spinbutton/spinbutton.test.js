import { describe, it, expect, beforeEach } from 'vitest';
import { Spinbutton } from './spinbutton.js';

function buildSpinbutton({
  value = 5,
  min = 1,
  max = 10,
  step,
  stepLarge,
  format,
  required = false,
} = {}) {
  const stepAttr = step !== undefined ? ` data-step="${step}"` : '';
  const stepLargeAttr =
    stepLarge !== undefined ? ` data-step-large="${stepLarge}"` : '';
  const formatAttr = format !== undefined ? ` data-format="${format}"` : '';
  const requiredAttr = required ? ' required' : '';
  document.body.innerHTML = `
    <div class="c-field" data-field>
      <label class="c-field__label" for="cantidad">Cantidad</label>
      <input
        type="text"
        inputmode="decimal"
        id="cantidad"
        name="cantidad"
        role="spinbutton"
        aria-valuenow="${value}"
        aria-valuemin="${min}"
        aria-valuemax="${max}"
        data-spinbutton${stepAttr}${stepLargeAttr}${formatAttr}${requiredAttr}
      />
    </div>
  `;
  return document.getElementById('cantidad');
}

function press(input, key) {
  input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function type(input, text) {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function blur(input) {
  input.dispatchEvent(new Event('blur'));
}

function buttons() {
  return Array.from(document.querySelectorAll('.c-spinbutton__button'));
}

describe('Spinbutton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe el input', () => {
    expect(() => new Spinbutton(null)).toThrow();
  });

  it('el estado inicial sale del HTML', () => {
    const input = buildSpinbutton({ value: 5, min: 1, max: 10 });
    const spinbutton = new Spinbutton(input);

    expect(spinbutton.value).toBe(5);
    expect(input.getAttribute('aria-valuenow')).toBe('5');
    expect(input.value).toBe('5');
  });

  it('crea los botones −/+ con tabindex="-1" y nombre accesible', () => {
    const input = buildSpinbutton();
    new Spinbutton(input);

    const [decrement, increment] = buttons();
    expect(decrement.getAttribute('tabindex')).toBe('-1');
    expect(increment.getAttribute('tabindex')).toBe('-1');
    expect(decrement.getAttribute('aria-label')).toBe('Disminuir');
    expect(increment.getAttribute('aria-label')).toBe('Aumentar');
  });

  it('↑/↓ suman o restan data-step', () => {
    const input = buildSpinbutton({ value: 5, step: 2 });
    new Spinbutton(input);

    press(input, 'ArrowUp');
    expect(input.getAttribute('aria-valuenow')).toBe('7');

    press(input, 'ArrowDown');
    press(input, 'ArrowDown');
    expect(input.getAttribute('aria-valuenow')).toBe('3');
  });

  it('RePág/AvPág suman o restan data-step-large (10 × step por defecto)', () => {
    const input = buildSpinbutton({ value: 50, min: 0, max: 100 });
    new Spinbutton(input);

    press(input, 'PageUp');
    expect(input.getAttribute('aria-valuenow')).toBe('60');

    press(input, 'PageDown');
    press(input, 'PageDown');
    expect(input.getAttribute('aria-valuenow')).toBe('40');
  });

  it('Inicio/Fin van a min/max', () => {
    const input = buildSpinbutton({ value: 5, min: 1, max: 10 });
    new Spinbutton(input);

    press(input, 'End');
    expect(input.getAttribute('aria-valuenow')).toBe('10');

    press(input, 'Home');
    expect(input.getAttribute('aria-valuenow')).toBe('1');
  });

  it('el valor se acota en los extremos y no los sobrepasa', () => {
    const input = buildSpinbutton({ value: 9, min: 1, max: 10, step: 5 });
    new Spinbutton(input);

    press(input, 'ArrowUp');
    expect(input.getAttribute('aria-valuenow')).toBe('10');

    press(input, 'ArrowUp'); // ya en el máximo
    expect(input.getAttribute('aria-valuenow')).toBe('10');
  });

  it('los botones se deshabilitan en el mínimo y el máximo', () => {
    const input = buildSpinbutton({ value: 1, min: 1, max: 10 });
    new Spinbutton(input);
    const [decrement, increment] = buttons();

    expect(decrement.disabled).toBe(true);
    expect(increment.disabled).toBe(false);

    press(input, 'End');
    expect(decrement.disabled).toBe(false);
    expect(increment.disabled).toBe(true);
  });

  it('el foco se queda en el input tras pulsar los botones −/+', () => {
    const input = buildSpinbutton({ value: 5 });
    new Spinbutton(input);
    input.focus();
    const [, increment] = buttons();

    // El navegador da el foco al botón en mousedown, antes de click: el
    // listener de mousedown lo cancela con preventDefault().
    increment.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );
    increment.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-valuenow')).toBe('6');
  });

  it('el valor se muestra con coma decimal', () => {
    const input = buildSpinbutton({
      value: 5,
      min: 0,
      max: 10,
      step: 0.5,
    });
    new Spinbutton(input);

    press(input, 'ArrowUp');

    expect(input.getAttribute('aria-valuenow')).toBe('5.5');
    expect(input.value).toBe('5,5');
  });

  it('pasos decimales repetidos no acumulan ruido de coma flotante', () => {
    const input = buildSpinbutton({
      value: 0,
      min: 0,
      max: 1,
      step: 0.1,
    });
    new Spinbutton(input);

    press(input, 'ArrowUp');
    press(input, 'ArrowUp');
    press(input, 'ArrowUp');

    expect(input.getAttribute('aria-valuenow')).toBe('0.3');
    expect(input.value).toBe('0,3');
  });

  it('aria-valuetext usa data-format', () => {
    const input = buildSpinbutton({
      value: 70,
      min: 30,
      max: 200,
      format: '{value} kg',
    });
    new Spinbutton(input);

    expect(input.getAttribute('aria-valuetext')).toBe('70 kg');

    press(input, 'ArrowUp');
    expect(input.getAttribute('aria-valuetext')).toBe('71 kg');
  });

  it('aria-valuetext usa el número formateado si no hay data-format', () => {
    const input = buildSpinbutton({ value: 5, step: 0.5 });
    new Spinbutton(input);

    press(input, 'ArrowUp');

    expect(input.getAttribute('aria-valuetext')).toBe('5,5');
  });

  it('acepta una función format en las opciones, por encima de data-format', () => {
    const input = buildSpinbutton({ value: 5, format: '{value} kg' });
    new Spinbutton(input, { format: (value) => `${value} unidades` });

    expect(input.getAttribute('aria-valuetext')).toBe('5 unidades');
  });

  it('se dispara spinbutton:change al cambiar, pero no al quedarse en el límite', () => {
    const input = buildSpinbutton({ value: 10, min: 1, max: 10 });
    new Spinbutton(input);
    const events = [];
    input.addEventListener('spinbutton:change', (event) =>
      events.push(event.detail)
    );

    press(input, 'ArrowUp'); // ya en el máximo, no cambia
    expect(events).toHaveLength(0);

    press(input, 'ArrowDown');
    expect(events).toEqual([{ value: 9 }]);
  });

  it('get value()/set value(v): acota y redondea, sin disparar el evento', () => {
    const input = buildSpinbutton({ value: 5, min: 1, max: 10, step: 0.5 });
    const spinbutton = new Spinbutton(input);
    const events = [];
    input.addEventListener('spinbutton:change', (event) =>
      events.push(event.detail)
    );

    spinbutton.value = 99;

    expect(spinbutton.value).toBe(10);
    expect(input.getAttribute('aria-valuenow')).toBe('10');
    expect(events).toHaveLength(0);
  });

  it('stepUp(n)/stepDown(n) mueven n pasos de una vez', () => {
    const input = buildSpinbutton({ value: 1, min: 1, max: 10, step: 2 });
    const spinbutton = new Spinbutton(input);

    spinbutton.stepUp(3);
    expect(spinbutton.value).toBe(7);

    spinbutton.stepDown(2);
    expect(spinbutton.value).toBe(3);
  });

  it('destroy() quita los botones −/+ y deja el input en su sitio', () => {
    const input = buildSpinbutton();
    const field = document.querySelector('[data-field]');
    const spinbutton = new Spinbutton(input);

    spinbutton.destroy();

    expect(document.querySelectorAll('.c-spinbutton__button')).toHaveLength(0);
    expect(document.querySelector('.c-spinbutton')).toBeNull();
    expect(field.contains(input)).toBe(true);
  });

  it('destroy() deja de reaccionar a las flechas', () => {
    const input = buildSpinbutton({ value: 5 });
    const spinbutton = new Spinbutton(input);

    spinbutton.destroy();
    press(input, 'ArrowUp');

    expect(input.getAttribute('aria-valuenow')).toBe('5');
  });

  describe('escritura a mano', () => {
    it('«2,5» y «2.5» valen igual al salir del campo', () => {
      const input = buildSpinbutton({ value: 5, min: 0, max: 10, step: 0.1 });
      new Spinbutton(input);

      type(input, '2,5');
      blur(input);
      expect(input.getAttribute('aria-valuenow')).toBe('2.5');
      expect(input.value).toBe('2,5');

      type(input, '2.5');
      blur(input);
      expect(input.getAttribute('aria-valuenow')).toBe('2.5');
      expect(input.value).toBe('2,5');
    });

    it('un valor fuera de rango se acota y se reescribe', () => {
      const input = buildSpinbutton({ value: 5, min: 1, max: 10 });
      new Spinbutton(input);

      type(input, '999');
      blur(input);

      expect(input.getAttribute('aria-valuenow')).toBe('10');
      expect(input.value).toBe('10');
    });

    it('un valor dentro de rango que no es múltiplo del paso no se redondea al paso', () => {
      const input = buildSpinbutton({
        value: 70,
        min: 0,
        max: 200,
        step: 0.5,
      });
      new Spinbutton(input);

      type(input, '90,25');
      blur(input);

      expect(input.getAttribute('aria-valuenow')).toBe('90.25');
      expect(input.value).toBe('90,25');
    });

    it('un texto no numérico marca el error, deja el texto y no cambia aria-valuenow', () => {
      const input = buildSpinbutton({ value: 5 });
      new Spinbutton(input);

      type(input, 'abc');
      blur(input);

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.value).toBe('abc');
      expect(input.getAttribute('aria-valuenow')).toBe('5');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId).textContent).toBe(
        'Introduce un número'
      );
    });

    it('corregir el texto retira el error en cuanto vuelve a ser válido', () => {
      const input = buildSpinbutton({ value: 5, min: 0, max: 10 });
      new Spinbutton(input);

      type(input, 'abc');
      blur(input);
      expect(input.getAttribute('aria-invalid')).toBe('true');

      type(input, '7');

      expect(input.hasAttribute('aria-invalid')).toBe(false);
      expect(input.getAttribute('aria-valuenow')).toBe('7');
    });

    it('no revalida en cada tecla mientras el campo no se ha tocado (sin blur)', () => {
      const input = buildSpinbutton({ value: 5 });
      new Spinbutton(input);

      type(input, 'abc');

      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('campo vacío y required usa el mensaje de obligatorio por defecto', () => {
      const input = buildSpinbutton({ value: 5, required: true });
      new Spinbutton(input);

      type(input, '');
      blur(input);

      expect(input.getAttribute('aria-invalid')).toBe('true');
      const errorId = input.getAttribute('aria-describedby');
      expect(document.getElementById(errorId).textContent).toBe(
        'Este campo es obligatorio'
      );
    });

    it('usa data-error-required si existe, en vez del mensaje por defecto', () => {
      const input = buildSpinbutton({ value: 5, required: true });
      input.setAttribute('data-error-required', 'Indica una cantidad');
      new Spinbutton(input);

      type(input, '');
      blur(input);

      const errorId = input.getAttribute('aria-describedby');
      expect(document.getElementById(errorId).textContent).toBe(
        'Indica una cantidad'
      );
    });

    it('campo vacío sin required no marca error y restaura el valor conocido', () => {
      const input = buildSpinbutton({ value: 5 });
      new Spinbutton(input);

      type(input, '');
      blur(input);

      expect(input.hasAttribute('aria-invalid')).toBe(false);
      expect(input.getAttribute('aria-valuenow')).toBe('5');
      expect(input.value).toBe('5');
    });

    it('se dispara spinbutton:change al escribir un valor válido distinto', () => {
      const input = buildSpinbutton({ value: 5, min: 0, max: 10 });
      new Spinbutton(input);
      const events = [];
      input.addEventListener('spinbutton:change', (event) =>
        events.push(event.detail)
      );

      type(input, '7');
      blur(input);

      expect(events).toEqual([{ value: 7 }]);
    });

    it('validate() se puede llamar directamente y devuelve si el valor es válido', () => {
      const input = buildSpinbutton({ value: 5 });
      const spinbutton = new Spinbutton(input);

      type(input, '8');
      expect(spinbutton.validate()).toBe(true);

      type(input, 'xyz');
      expect(spinbutton.validate()).toBe(false);
    });
  });
});
