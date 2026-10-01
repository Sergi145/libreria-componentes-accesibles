import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Combobox, SelectCombobox } from './combobox.js';

function option(id, value, text) {
  return `<li class="c-listbox__option" role="option" id="${id}" data-value="${value}" aria-selected="false">${text}</li>`;
}

function buildCombobox({ strict = false } = {}) {
  const strictAttr = strict ? ' data-strict' : '';
  document.body.innerHTML = `
    <div class="c-combobox">
      <label for="destino" id="destino-label">Destino</label>
      <input
        type="text"
        id="destino"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
        aria-controls="destino-listbox"
        data-combobox${strictAttr}
      />
      <ul role="listbox" id="destino-listbox" aria-labelledby="destino-label" hidden>
        ${option('destino-opt-1', 'mad', 'Madrid')}
        ${option('destino-opt-2', 'avi', 'Ávila')}
        ${option('destino-opt-3', 'bcn', 'Barcelona')}
        ${option('destino-opt-4', 'bur', 'Burgos')}
      </ul>
      <p class="c-combobox__empty" hidden>Sin resultados</p>
    </div>
    <button type="button" id="fuera">Fuera</button>
  `;
  return document.getElementById('destino');
}

function type(input, text) {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function press(input, key, modifiers = {}) {
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers })
  );
}

function click(el) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('Combobox (editable)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe el input', () => {
    expect(() => new Combobox(null)).toThrow();
  });

  it('lanza un error si aria-controls no apunta a una lista existente', () => {
    document.body.innerHTML = `<input role="combobox" aria-controls="no-existe" data-combobox />`;
    const input = document.querySelector('input');
    expect(() => new Combobox(input)).toThrow();
  });

  it('encuentra el popup aunque se construya antes de insertar el envoltorio en el documento', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input role="combobox" aria-controls="suelto-listbox" data-combobox />
      <ul role="listbox" id="suelto-listbox" hidden>
        ${option('suelto-opt-1', 'mad', 'Madrid')}
      </ul>
    `;
    const input = wrapper.querySelector('input');

    expect(() => new Combobox(input)).not.toThrow();
  });

  it('escribir filtra por "contiene" sin tildes ni mayúsculas y abre el popup', () => {
    const input = buildCombobox();
    new Combobox(input);
    const popup = document.getElementById('destino-listbox');

    type(input, 'avila');

    expect(popup.hidden).toBe(false);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const visible = Array.from(
      popup.querySelectorAll('[role="option"]')
    ).filter((o) => !o.hidden);
    expect(visible.map((o) => o.textContent)).toEqual(['Ávila']);
  });

  it('con el campo vacío se ven todas las opciones', () => {
    const input = buildCombobox();
    new Combobox(input);

    type(input, 'mad');
    type(input, '');

    const popup = document.getElementById('destino-listbox');
    const visible = Array.from(
      popup.querySelectorAll('[role="option"]')
    ).filter((o) => !o.hidden);
    expect(visible).toHaveLength(4);
  });

  it('↓ con el popup cerrado lo abre y activa la primera opción', () => {
    const input = buildCombobox();
    new Combobox(input);
    input.focus();

    press(input, 'ArrowDown');

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBe('destino-opt-1');
    expect(document.activeElement).toBe(input);
  });

  it('↑ con el popup cerrado lo abre y activa la última opción', () => {
    const input = buildCombobox();
    new Combobox(input);

    press(input, 'ArrowUp');

    expect(input.getAttribute('aria-activedescendant')).toBe('destino-opt-4');
  });

  it('Alt+↓ abre el popup sin activar ninguna opción', () => {
    const input = buildCombobox();
    new Combobox(input);

    press(input, 'ArrowDown', { altKey: true });

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('con el popup abierto, ↓/↑ mueven la opción activa con envoltura', () => {
    const input = buildCombobox();
    new Combobox(input);

    press(input, 'ArrowDown'); // destino-opt-1
    press(input, 'ArrowDown'); // destino-opt-2
    press(input, 'ArrowDown'); // destino-opt-3
    press(input, 'ArrowDown'); // destino-opt-4
    press(input, 'ArrowDown'); // da la vuelta a destino-opt-1

    expect(input.getAttribute('aria-activedescendant')).toBe('destino-opt-1');

    press(input, 'ArrowUp'); // da la vuelta hacia atrás

    expect(input.getAttribute('aria-activedescendant')).toBe('destino-opt-4');
  });

  it('la opción activa lleva aria-selected="true" y las demás "false"', () => {
    const input = buildCombobox();
    new Combobox(input);

    press(input, 'ArrowDown');

    const options = Array.from(
      document.querySelectorAll('#destino-listbox [role="option"]')
    );
    expect(
      options.filter((o) => o.getAttribute('aria-selected') === 'true')
    ).toHaveLength(1);
    expect(
      document.getElementById('destino-opt-1').getAttribute('aria-selected')
    ).toBe('true');
  });

  it('←/→/Inicio/Fin quitan aria-activedescendant sin cerrar el popup', () => {
    const input = buildCombobox();
    new Combobox(input);
    press(input, 'ArrowDown');
    expect(input.hasAttribute('aria-activedescendant')).toBe(true);

    press(input, 'ArrowLeft');

    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter acepta la opción activa, cierra el popup y el foco sigue en el input', () => {
    const input = buildCombobox();
    new Combobox(input);

    press(input, 'ArrowDown'); // activa Madrid
    press(input, 'Enter');

    expect(input.value).toBe('Madrid');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('destino-listbox').hidden).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it('Escape cierra el popup si está abierto, sin vaciar el campo', () => {
    const input = buildCombobox();
    new Combobox(input);
    type(input, 'mad');
    expect(input.getAttribute('aria-expanded')).toBe('true');

    press(input, 'Escape');

    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.value).toBe('mad');
  });

  it('un segundo Escape, con el popup ya cerrado, vacía el campo', () => {
    const input = buildCombobox();
    new Combobox(input);
    type(input, 'mad');

    press(input, 'Escape'); // cierra
    press(input, 'Escape'); // vacía

    expect(input.value).toBe('');
  });

  it('clic en una opción la acepta y devuelve el foco al input', () => {
    const input = buildCombobox();
    new Combobox(input);
    press(input, 'ArrowDown');

    click(document.getElementById('destino-opt-3'));

    expect(input.value).toBe('Barcelona');
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('un clic fuera cierra el popup', () => {
    const input = buildCombobox();
    new Combobox(input);
    press(input, 'ArrowDown');
    expect(input.getAttribute('aria-expanded')).toBe('true');

    document
      .getElementById('fuera')
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('se dispara combobox:change al aceptar una opción, pero no al escribir', () => {
    const input = buildCombobox();
    new Combobox(input);
    const events = [];
    input.addEventListener('combobox:change', (event) =>
      events.push(event.detail)
    );

    type(input, 'mad');
    expect(events).toHaveLength(0);

    press(input, 'ArrowDown');
    press(input, 'Enter');

    expect(events).toEqual([{ value: 'Madrid' }]);
  });

  it('el foco del DOM nunca sale del input durante toda la navegación', () => {
    const input = buildCombobox();
    new Combobox(input);
    input.focus();

    type(input, 'a');
    press(input, 'ArrowDown');
    press(input, 'ArrowDown');
    press(input, 'ArrowLeft');
    press(input, 'ArrowDown');

    expect(document.activeElement).toBe(input);
  });

  it('destroy() quita los listeners: las teclas dejan de abrir el popup', () => {
    const input = buildCombobox();
    const combobox = new Combobox(input);

    combobox.destroy();
    press(input, 'ArrowDown');

    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  describe('0 resultados', () => {
    it('con 0 resultados, el popup se queda oculto, aria-expanded en "false" y el mensaje visible', () => {
      const input = buildCombobox();
      new Combobox(input);

      type(input, 'xyz');

      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(document.getElementById('destino-listbox').hidden).toBe(true);
      const empty = document.querySelector('.c-combobox__empty');
      expect(empty.hidden).toBe(false);
      expect(empty.textContent).toBe('Sin resultados');
    });

    it('al volver a haber resultados, el mensaje se oculta y el popup se muestra', () => {
      const input = buildCombobox();
      new Combobox(input);

      type(input, 'xyz');
      type(input, 'mad');

      expect(input.getAttribute('aria-expanded')).toBe('true');
      expect(document.getElementById('destino-listbox').hidden).toBe(false);
      expect(document.querySelector('.c-combobox__empty').hidden).toBe(true);
    });
  });

  describe('anuncio del recuento (announce)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('tras escribir varias letras seguidas, solo hay un anuncio tras la pausa', () => {
      const input = buildCombobox();
      new Combobox(input);
      const region = () =>
        document.querySelector('[data-live-region="polite"]');

      type(input, 'm');
      vi.advanceTimersByTime(100);
      type(input, 'ma');
      vi.advanceTimersByTime(100);
      type(input, 'mad');

      expect(region()).toBeNull();

      // announce() escribe el texto en un setTimeout propio (0 ms) anidado
      // dentro de este de 500 ms: hay que pasar también ese instante, no
      // solo alcanzarlo, para que el anidado llegue a ejecutarse.
      vi.advanceTimersByTime(501);

      expect(region().textContent).toBe('1 resultado');
    });

    it('anuncia "Sin resultados" o "N resultados" según el recuento', () => {
      const input = buildCombobox();
      new Combobox(input);
      const region = () =>
        document.querySelector('[data-live-region="polite"]');

      type(input, 'a'); // Madrid, Ávila y Barcelona: 3 resultados
      vi.advanceTimersByTime(501);
      expect(region().textContent).toBe('3 resultados');

      type(input, 'xyz');
      vi.advanceTimersByTime(501);
      expect(region().textContent).toBe('Sin resultados');
    });

    it('cerrar el combobox cancela un anuncio pendiente', () => {
      const input = buildCombobox();
      const combobox = new Combobox(input);
      const region = () =>
        document.querySelector('[data-live-region="polite"]');

      type(input, 'm');
      combobox.close();
      vi.advanceTimersByTime(501);

      expect(region()?.textContent ?? '').toBe('');
    });

    it('al aceptar una opción, anuncia el valor elegido con el nombre del campo', () => {
      const input = buildCombobox();
      new Combobox(input);
      const region = () =>
        document.querySelector('[data-live-region="polite"]');

      press(input, 'ArrowDown'); // abre y activa Madrid
      press(input, 'Enter');
      vi.advanceTimersByTime(0);

      expect(region().textContent).toBe('Destino: Madrid, seleccionado');
    });
  });

  describe('data-strict', () => {
    it('perder el foco con un texto que no coincide con ninguna opción marca el error', () => {
      const input = buildCombobox({ strict: true });
      new Combobox(input);

      type(input, 'no existe');
      input.dispatchEvent(new Event('blur'));

      expect(input.getAttribute('aria-invalid')).toBe('true');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId).textContent).toBe(
        'Elige una opción de la lista'
      );
    });

    it('usa data-error-strict si existe, en vez del mensaje por defecto', () => {
      const input = buildCombobox({ strict: true });
      input.setAttribute('data-error-strict', 'Elige un destino válido');
      new Combobox(input);

      type(input, 'no existe');
      input.dispatchEvent(new Event('blur'));

      const errorId = input.getAttribute('aria-describedby');
      expect(document.getElementById(errorId).textContent).toBe(
        'Elige un destino válido'
      );
    });

    it('un texto que sí coincide (sin tildes ni mayúsculas) no marca error', () => {
      const input = buildCombobox({ strict: true });
      new Combobox(input);

      type(input, 'AVILA');
      input.dispatchEvent(new Event('blur'));

      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('elegir una opción retira el error al momento', () => {
      const input = buildCombobox({ strict: true });
      new Combobox(input);

      type(input, 'no existe');
      input.dispatchEvent(new Event('blur'));
      expect(input.getAttribute('aria-invalid')).toBe('true');

      type(input, 'mad');
      press(input, 'ArrowDown');
      press(input, 'Enter');

      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('sin data-strict, un texto que no coincide no marca error', () => {
      const input = buildCombobox();
      new Combobox(input);

      type(input, 'no existe');
      input.dispatchEvent(new Event('blur'));

      expect(input.hasAttribute('aria-invalid')).toBe(false);
    });
  });
});

function buildSelect({ required = false } = {}) {
  const requiredAttr = required ? ' required' : '';
  document.body.innerHTML = `
    <div class="c-combobox">
      <label for="asiento">Asiento</label>
      <select id="asiento" name="asiento" data-combobox${requiredAttr}>
        <optgroup label="Clase económica">
          <option value="12a">12A — Pasillo</option>
          <option value="12b" selected>12B — Centro</option>
        </optgroup>
        <optgroup label="Primera clase">
          <option value="1a">1A — Ventana</option>
          <option value="1b" disabled>1B — Ocupado</option>
        </optgroup>
      </select>
    </div>
    <button type="button" id="fuera">Fuera</button>
  `;
  return document.getElementById('asiento');
}

describe('SelectCombobox (solo-selección)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe el select', () => {
    expect(() => new SelectCombobox(null)).toThrow();
  });

  it('lanza un error si el select no tiene id', () => {
    document.body.innerHTML = `<select data-combobox><option>Uno</option></select>`;
    expect(
      () => new SelectCombobox(document.querySelector('select'))
    ).toThrow();
  });

  it('encuentra la label aunque se construya antes de insertar el envoltorio en el documento', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <label for="suelto">Suelto</label>
      <select id="suelto" data-combobox><option value="a">A</option></select>
    `;
    const select = wrapper.querySelector('select');
    expect(() => new SelectCombobox(select)).not.toThrow();
    expect(
      wrapper.querySelector('[role="combobox"]').getAttribute('aria-labelledby')
    ).toBe('suelto-label');
  });

  it('oculta el select y crea un div role="combobox" delante, con el texto de la opción elegida', () => {
    const select = buildSelect();
    new SelectCombobox(select);

    expect(select.hidden).toBe(true);
    const trigger = document.querySelector('[role="combobox"]');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent.trim()).toBe('12B — Centro');
  });

  it('a la label le pone un id (<id>-label) si no lo tenía, y aria-labelledby apunta a ella', () => {
    const select = buildSelect();
    new SelectCombobox(select);

    const label = document.querySelector('label');
    expect(label.id).toBe('asiento-label');
    expect(
      document
        .querySelector('[role="combobox"]')
        .getAttribute('aria-labelledby')
    ).toBe('asiento-label');
  });

  it('hacer clic en la label enfoca el combobox', () => {
    const select = buildSelect();
    new SelectCombobox(select);

    document
      .querySelector('label')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.activeElement).toBe(
      document.querySelector('[role="combobox"]')
    );
  });

  it('un <optgroup> se convierte en role="group" con las opciones anidadas', () => {
    const select = buildSelect();
    new SelectCombobox(select);

    const groups = document.querySelectorAll('[role="group"]');
    expect(groups).toHaveLength(2);
    expect(groups[0].previousElementSibling.textContent).toBe(
      'Clase económica'
    );
    expect(groups[0].querySelectorAll('[role="option"]')).toHaveLength(2);
  });

  it('una opción disabled del select lleva aria-disabled="true" en su <li>', () => {
    const select = buildSelect();
    new SelectCombobox(select);

    const options = document.querySelectorAll('[role="option"]');
    const ocupado = Array.from(options).find((o) =>
      o.textContent.includes('Ocupado')
    );
    expect(ocupado.getAttribute('aria-disabled')).toBe('true');
  });

  it('↓ con el combobox cerrado lo abre y activa la opción ya elegida', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    trigger.focus();

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const activeId = trigger.getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '12B — Centro'
    );
  });

  it('Alt+↓ abre sin activar ninguna opción', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
      })
    );

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('Inicio/Fin, cerrado, abren activando la primera/última opción', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true })
    );
    let activeId = trigger.getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '1A — Ventana'
    ); // 1B está deshabilitada

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    );
    activeId = trigger.getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '12A — Pasillo'
    );
  });

  it('una tecla imprimible, con el combobox cerrado, abre y busca con typeahead', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: '1', bubbles: true })
    );

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const activeId = trigger.getAttribute('aria-activedescendant');
    // La opción elegida es "12B" (navegables: 12A, 12B, 1A — 1B está
    // deshabilitada); buscar "1" desde ahí encuentra "1A", la siguiente.
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '1A — Ventana'
    );
  });

  it('con el combobox abierto, ↓/↑ mueven sin envoltura (se detienen en los extremos)', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    ); // 12A

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    let activeId = trigger.getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '12A — Pasillo'
    );

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true })
    ); // 1A (1B deshabilitada)
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    activeId = trigger.getAttribute('aria-activedescendant');
    expect(document.getElementById(activeId).textContent.trim()).toBe(
      '1A — Ventana'
    );
  });

  it('Enter elige la opción activa, cierra y actualiza el select (value, change y combobox:change)', () => {
    const select = buildSelect();
    const combobox = new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');

    const changeEvents = [];
    select.addEventListener('change', () => changeEvents.push(select.value));
    const comboboxEvents = [];
    trigger.addEventListener('combobox:change', (event) =>
      comboboxEvents.push(event.detail)
    );

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    ); // activa 12A
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );

    expect(select.value).toBe('12a');
    expect(combobox.value).toBe('12a');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent.trim()).toBe('12A — Pasillo');
    expect(changeEvents).toEqual(['12a']);
    expect(comboboxEvents).toEqual([{ value: '12a' }]);
  });

  it('al elegir una opción, anuncia el valor elegido con el nombre del campo', () => {
    vi.useFakeTimers();
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    const region = () => document.querySelector('[data-live-region="polite"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    ); // activa 12A
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    vi.advanceTimersByTime(0);

    expect(region().textContent).toBe('Asiento: 12A — Pasillo, seleccionado');
    vi.useRealTimers();
  });

  it('elegir de nuevo la opción ya elegida no repite el anuncio', () => {
    vi.useFakeTimers();
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    const region = () => document.querySelector('[data-live-region="polite"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    ); // abre y activa 12B, la ya elegida
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    vi.advanceTimersByTime(0);

    expect(region()).toBeNull();
    vi.useRealTimers();
  });

  it('Escape cierra sin cambiar el valor', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');

    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
    ); // activa 12A
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    expect(select.value).toBe('12b');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent.trim()).toBe('12B — Centro');
  });

  it('clic en una opción la elige y cierra', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    const option1a = Array.from(
      document.querySelectorAll('[role="option"]')
    ).find((o) => o.textContent.includes('1A'));
    option1a.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(select.value).toBe('1a');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('clic en una opción deshabilitada no hace nada', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    const option1b = Array.from(
      document.querySelectorAll('[role="option"]')
    ).find((o) => o.textContent.includes('1B'));
    option1b.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(select.value).toBe('12b');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('un clic fuera cierra sin cambiar el valor', () => {
    const select = buildSelect();
    new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    document
      .getElementById('fuera')
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(select.value).toBe('12b');
  });

  it('set value selecciona por valor y actualiza el texto del disparador, sin disparar el evento', () => {
    const select = buildSelect();
    const combobox = new SelectCombobox(select);
    const trigger = document.querySelector('[role="combobox"]');
    const events = [];
    trigger.addEventListener('combobox:change', (event) =>
      events.push(event.detail)
    );

    combobox.value = '1a';

    expect(select.value).toBe('1a');
    expect(trigger.textContent.trim()).toBe('1A — Ventana');
    expect(events).toHaveLength(0);
  });

  it('required en el select se refleja como aria-required en el disparador', () => {
    const select = buildSelect({ required: true });
    new SelectCombobox(select);

    expect(
      document.querySelector('[role="combobox"]').getAttribute('aria-required')
    ).toBe('true');
  });

  it('con hidden (no disabled), el valor elegido se envía igual con el formulario', () => {
    document.body.innerHTML = `
      <form id="form-asiento">
        <div class="c-combobox">
          <label for="asiento">Asiento</label>
          <select id="asiento" name="asiento" data-combobox>
            <option value="12a">12A</option>
            <option value="12b" selected>12B</option>
          </select>
        </div>
      </form>
    `;
    const select = document.getElementById('asiento');
    new SelectCombobox(select);

    const form = document.getElementById('form-asiento');
    const data = new FormData(form);

    expect(select.hidden).toBe(true);
    expect(select.disabled).toBe(false);
    expect(data.get('asiento')).toBe('12b');
  });

  it('destroy() quita el combobox creado y vuelve a mostrar el select', () => {
    const select = buildSelect();
    const combobox = new SelectCombobox(select);

    combobox.destroy();

    expect(select.hidden).toBe(false);
    expect(document.querySelector('[role="combobox"]')).toBeNull();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });
});
