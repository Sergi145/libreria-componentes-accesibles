import { describe, it, expect, beforeEach } from 'vitest';
import { Listbox } from './listbox.js';

function option({ value, text, selected = false, disabled = false }) {
  const valueAttr = value !== undefined ? ` data-value="${value}"` : '';
  const selectedAttr = ` aria-selected="${selected}"`;
  const disabledAttr = disabled ? ' aria-disabled="true"' : '';
  return `<li class="c-listbox__option" role="option"${valueAttr}${selectedAttr}${disabledAttr}>${text}</li>`;
}

function buildListbox(optionsHtml, { multiple = false, name } = {}) {
  const multiAttr = multiple ? ' aria-multiselectable="true"' : '';
  const nameAttr = name ? ` data-name="${name}"` : '';
  document.body.innerHTML = `
    <span class="c-listbox__label" id="destino-label">Destino</span>
    <ul class="c-listbox" id="destino" role="listbox" aria-labelledby="destino-label"${multiAttr}${nameAttr} data-listbox>
      ${optionsHtml.join('')}
    </ul>
  `;
  return document.getElementById('destino');
}

function press(el, key, modifiers = {}) {
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers })
  );
}

function click(el, modifiers = {}) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, ...modifiers }));
}

describe('Listbox (selección simple)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe el elemento', () => {
    expect(() => new Listbox(null)).toThrow();
  });

  it('el estado inicial sale del HTML: la opción aria-selected="true" recibe tabindex="0"', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid' }),
      option({ value: 'bcn', text: 'Barcelona', selected: true }),
      option({ value: 'sev', text: 'Sevilla' }),
    ]);
    new Listbox(el);

    const [mad, bcn, sev] = el.querySelectorAll('.c-listbox__option');
    expect(bcn.getAttribute('aria-selected')).toBe('true');
    expect(bcn.getAttribute('tabindex')).toBe('0');
    expect(mad.getAttribute('tabindex')).toBe('-1');
    expect(sev.getAttribute('tabindex')).toBe('-1');
  });

  it('sin ninguna opción aria-selected="true", selecciona la primera', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid' }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    new Listbox(el);

    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');
    expect(mad.getAttribute('aria-selected')).toBe('true');
    expect(mad.getAttribute('tabindex')).toBe('0');
    expect(bcn.getAttribute('aria-selected')).toBe('false');
  });

  it('↓ mueve el foco y la selección juntos; solo una opción queda seleccionada', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
      option({ value: 'sev', text: 'Sevilla' }),
    ]);
    new Listbox(el);
    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');

    mad.focus();
    press(mad, 'ArrowDown');

    expect(document.activeElement).toBe(bcn);
    expect(bcn.getAttribute('aria-selected')).toBe('true');
    expect(mad.getAttribute('aria-selected')).toBe('false');
    expect(el.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
  });

  it('sin envoltura: ArrowUp en la primera opción se queda en ella', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    new Listbox(el);
    const [mad] = el.querySelectorAll('.c-listbox__option');

    mad.focus();
    press(mad, 'ArrowUp');

    expect(document.activeElement).toBe(mad);
    expect(mad.getAttribute('aria-selected')).toBe('true');
  });

  it('Fin mueve el foco y la selección a la última opción', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
      option({ value: 'sev', text: 'Sevilla' }),
    ]);
    new Listbox(el);
    const [mad, , sev] = el.querySelectorAll('.c-listbox__option');

    mad.focus();
    press(mad, 'End');

    expect(document.activeElement).toBe(sev);
    expect(sev.getAttribute('aria-selected')).toBe('true');
  });

  it('las opciones aria-disabled="true" no reciben el foco con las flechas', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona', disabled: true }),
      option({ value: 'sev', text: 'Sevilla' }),
    ]);
    new Listbox(el);
    const [mad, bcn, sev] = el.querySelectorAll('.c-listbox__option');

    mad.focus();
    press(mad, 'ArrowDown');

    expect(document.activeElement).toBe(sev);
    expect(bcn.hasAttribute('tabindex')).toBe(false);
    expect(bcn.getAttribute('aria-selected')).toBe('false');
  });

  it('clic en una opción deshabilitada no la selecciona', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona', disabled: true }),
    ]);
    new Listbox(el);
    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');

    click(bcn);

    expect(bcn.getAttribute('aria-selected')).toBe('false');
    expect(mad.getAttribute('aria-selected')).toBe('true');
  });

  it('clic en una opción la selecciona y le da el foco real', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    new Listbox(el);
    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');

    click(bcn);

    expect(document.activeElement).toBe(bcn);
    expect(bcn.getAttribute('aria-selected')).toBe('true');
    expect(mad.getAttribute('aria-selected')).toBe('false');
  });

  it('el typeahead enfoca y selecciona la primera opción que empieza por la letra', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
      option({ value: 'sev', text: 'Sevilla' }),
    ]);
    new Listbox(el);
    const [mad, bcn, sev] = el.querySelectorAll('.c-listbox__option');

    mad.focus();
    press(mad, 's');

    expect(document.activeElement).toBe(sev);
    expect(sev.getAttribute('aria-selected')).toBe('true');
    expect(mad.getAttribute('aria-selected')).toBe('false');
    expect(bcn.getAttribute('aria-selected')).toBe('false');
  });

  it('se dispara listbox:change con el value al cambiar la selección, pero no al construir', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    const events = [];
    el.addEventListener('listbox:change', (event) => events.push(event.detail));

    new Listbox(el);
    expect(events).toHaveLength(0);

    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');
    mad.focus();
    press(mad, 'ArrowDown');

    expect(events).toEqual([{ value: 'bcn' }]);
    expect(bcn).toBeTruthy();
  });

  it('no dispara listbox:change si se vuelve a seleccionar la opción ya seleccionada', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    new Listbox(el);
    const [mad] = el.querySelectorAll('.c-listbox__option');

    const events = [];
    el.addEventListener('listbox:change', (event) => events.push(event.detail));

    click(mad);

    expect(events).toHaveLength(0);
  });

  it('value: usa data-value o, si no hay, el texto de la opción', () => {
    const el = buildListbox([
      `<li class="c-listbox__option" role="option" aria-selected="true">Sin data-value</li>`,
    ]);
    const listbox = new Listbox(el);

    expect(listbox.value).toBe('Sin data-value');
  });

  it('set value selecciona la opción indicada sin disparar el evento', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    const listbox = new Listbox(el);
    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');

    const events = [];
    el.addEventListener('listbox:change', (event) => events.push(event.detail));

    listbox.value = 'bcn';

    expect(listbox.value).toBe('bcn');
    expect(bcn.getAttribute('aria-selected')).toBe('true');
    expect(mad.getAttribute('aria-selected')).toBe('false');
    expect(events).toHaveLength(0);
  });

  it('destroy() quita los listeners: las flechas y el clic dejan de cambiar la selección', () => {
    const el = buildListbox([
      option({ value: 'mad', text: 'Madrid', selected: true }),
      option({ value: 'bcn', text: 'Barcelona' }),
    ]);
    const listbox = new Listbox(el);
    const [mad, bcn] = el.querySelectorAll('.c-listbox__option');

    listbox.destroy();
    mad.focus();
    press(mad, 'ArrowDown');
    click(bcn);

    expect(mad.getAttribute('aria-selected')).toBe('true');
    expect(bcn.getAttribute('aria-selected')).toBe('false');
  });
});

describe('Listbox (selección múltiple)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('tiene aria-multiselectable="true" y get multiple devuelve true', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);

    expect(el.getAttribute('aria-multiselectable')).toBe('true');
    expect(listbox.multiple).toBe(true);
  });

  it('respeta el estado inicial del HTML: varias opciones pueden estar ya seleccionadas', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión', selected: true }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);

    expect(listbox.value).toEqual(['urgente', 'revision']);
  });

  it('↓ solo mueve el foco: no cambia la selección', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
      ],
      { multiple: true }
    );
    new Listbox(el);
    const [urgente, revision] = el.querySelectorAll('.c-listbox__option');

    urgente.focus();
    press(urgente, 'ArrowDown');

    expect(document.activeElement).toBe(revision);
    expect(revision.getAttribute('aria-selected')).toBe('false');
    expect(urgente.getAttribute('aria-selected')).toBe('true');
  });

  it('Espacio alterna la opción activa sin moverse', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente' }),
        option({ value: 'revision', text: 'Revisión' }),
      ],
      { multiple: true }
    );
    new Listbox(el);
    const [urgente] = el.querySelectorAll('.c-listbox__option');

    urgente.focus();
    press(urgente, ' ');
    expect(urgente.getAttribute('aria-selected')).toBe('true');

    press(urgente, ' ');
    expect(urgente.getAttribute('aria-selected')).toBe('false');
  });

  it('Mayús+↓ mueve el foco y alterna la opción de destino', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true }
    );
    new Listbox(el);
    const [urgente, revision] = el.querySelectorAll('.c-listbox__option');

    urgente.focus();
    press(urgente, 'ArrowDown', { shiftKey: true });

    expect(document.activeElement).toBe(revision);
    expect(revision.getAttribute('aria-selected')).toBe('true');
    expect(urgente.getAttribute('aria-selected')).toBe('true');
  });

  it('Ctrl+A selecciona todas; repetirlo con todas seleccionadas las deja todas sin seleccionar', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);
    const [urgente] = el.querySelectorAll('.c-listbox__option');

    press(urgente, 'a', { ctrlKey: true });
    expect(listbox.value).toEqual(['urgente', 'revision', 'archivado']);

    press(urgente, 'a', { ctrlKey: true });
    expect(listbox.value).toEqual([]);
  });

  it('Ctrl+Mayús+Fin selecciona desde la opción activa hasta la última', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente' }),
        option({ value: 'revision', text: 'Revisión', selected: true }),
        option({ value: 'archivado', text: 'Archivado' }),
        option({ value: 'borrador', text: 'Borrador' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);
    const [, revision] = el.querySelectorAll('.c-listbox__option');

    revision.focus();
    press(revision, 'End', { ctrlKey: true, shiftKey: true });

    expect(listbox.value).toEqual(['revision', 'archivado', 'borrador']);
    expect(document.activeElement.textContent).toBe('Borrador');
  });

  it('clic alterna la opción sin afectar a las demás', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);
    const [urgente, revision] = el.querySelectorAll('.c-listbox__option');

    click(revision);

    expect(listbox.value).toEqual(['urgente', 'revision']);
    expect(document.activeElement).toBe(revision);
    expect(urgente.getAttribute('aria-selected')).toBe('true');
  });

  it('Mayús+clic selecciona el rango desde la última opción activada', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente' }),
        option({ value: 'revision', text: 'Revisión' }),
        option({ value: 'archivado', text: 'Archivado' }),
        option({ value: 'borrador', text: 'Borrador' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);
    const [urgente, revision, archivado, borrador] =
      el.querySelectorAll('.c-listbox__option');

    click(urgente);
    click(borrador, { shiftKey: true });

    expect(listbox.value).toEqual([
      'urgente',
      'revision',
      'archivado',
      'borrador',
    ]);
    expect(urgente.getAttribute('aria-selected')).toBe('true');
    expect(revision.getAttribute('aria-selected')).toBe('true');
    expect(archivado.getAttribute('aria-selected')).toBe('true');
    expect(borrador.getAttribute('aria-selected')).toBe('true');
  });

  it('las opciones deshabilitadas se saltan y no se alternan con Espacio ni clic', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión', disabled: true }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true }
    );
    new Listbox(el);
    const [urgente, revision, archivado] =
      el.querySelectorAll('.c-listbox__option');

    urgente.focus();
    press(urgente, 'ArrowDown');
    expect(document.activeElement).toBe(archivado);

    click(revision);
    expect(revision.getAttribute('aria-selected')).toBe('false');
  });

  it('value devuelve un array con los valores seleccionados', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión', selected: true }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true }
    );
    const listbox = new Listbox(el);

    expect(listbox.value).toEqual(['urgente', 'revision']);
  });

  it('con data-name hay un input oculto por valor seleccionado, y ninguno más', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión', selected: true }),
        option({ value: 'archivado', text: 'Archivado' }),
      ],
      { multiple: true, name: 'etiquetas' }
    );
    new Listbox(el);

    let inputs = document.querySelectorAll(
      'input[type="hidden"][name="etiquetas"]'
    );
    expect(inputs).toHaveLength(2);
    expect(Array.from(inputs).map((i) => i.value)).toEqual([
      'urgente',
      'revision',
    ]);

    const [urgente] = el.querySelectorAll('.c-listbox__option');
    click(urgente); // la deselecciona

    inputs = document.querySelectorAll(
      'input[type="hidden"][name="etiquetas"]'
    );
    expect(inputs).toHaveLength(1);
    expect(inputs[0].value).toBe('revision');
  });

  it('destroy() quita también los inputs ocultos de data-name', () => {
    const el = buildListbox(
      [option({ value: 'urgente', text: 'Urgente', selected: true })],
      { multiple: true, name: 'etiquetas' }
    );
    const listbox = new Listbox(el);

    expect(
      document.querySelectorAll('input[type="hidden"][name="etiquetas"]')
    ).toHaveLength(1);

    listbox.destroy();

    expect(
      document.querySelectorAll('input[type="hidden"][name="etiquetas"]')
    ).toHaveLength(0);
  });

  it('se dispara listbox:change con el array de valores, pero no al construir', () => {
    const el = buildListbox(
      [
        option({ value: 'urgente', text: 'Urgente', selected: true }),
        option({ value: 'revision', text: 'Revisión' }),
      ],
      { multiple: true }
    );
    const events = [];
    el.addEventListener('listbox:change', (event) => events.push(event.detail));

    new Listbox(el);
    expect(events).toHaveLength(0);

    const [, revision] = el.querySelectorAll('.c-listbox__option');
    click(revision);

    expect(events).toEqual([{ value: ['urgente', 'revision'] }]);
  });
});
