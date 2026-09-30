import { describe, it, expect, beforeEach } from 'vitest';
import { RadioGroup, initRadioGroups } from './radio-group.js';

function fieldset({ required = false, checked = null } = {}) {
  document.body.innerHTML = `
    <fieldset id="preferencia" role="radiogroup" data-radio-group ${required ? 'data-required' : ''}>
      <legend>Preferencia de contacto</legend>
      <input type="radio" id="contacto-email" name="contacto" value="email" ${checked === 'email' ? 'checked' : ''} />
      <input type="radio" id="contacto-tel" name="contacto" value="tel" ${checked === 'tel' ? 'checked' : ''} />
    </fieldset>
  `;
  return document.getElementById('preferencia');
}

describe('RadioGroup', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('un grupo no obligatorio siempre valida, con o sin selección', () => {
    const group = new RadioGroup(fieldset({ required: false }));

    expect(group.validate()).toBe(true);
    expect(
      document.getElementById('preferencia').hasAttribute('aria-invalid')
    ).toBe(false);
  });

  it('un grupo obligatorio sin selección no valida y marca aria-invalid en el fieldset', () => {
    const group = new RadioGroup(fieldset({ required: true }));

    expect(group.validate()).toBe(false);
    const el = document.getElementById('preferencia');
    expect(el.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('preferencia-error').textContent).toBe(
      'Este campo es obligatorio'
    );
  });

  it('un grupo obligatorio con una opción ya marcada valida', () => {
    const group = new RadioGroup(
      fieldset({ required: true, checked: 'email' })
    );

    expect(group.validate()).toBe(true);
    expect(
      document.getElementById('preferencia').hasAttribute('aria-invalid')
    ).toBe(false);
  });

  it('elegir una opción retira el error al momento', () => {
    const group = new RadioGroup(fieldset({ required: true }));
    group.validate();
    expect(group.invalid).toBe(true);

    document.getElementById('contacto-tel').click();

    expect(group.invalid).toBe(false);
    expect(
      document.getElementById('preferencia').hasAttribute('aria-invalid')
    ).toBe(false);
    expect(document.getElementById('preferencia-error')).toBeNull();
  });

  it('data-error-required propio sustituye al mensaje por defecto', () => {
    const el = fieldset({ required: true });
    el.setAttribute(
      'data-error-required',
      'Elige cómo prefieres que te contactemos'
    );
    const group = new RadioGroup(el);

    group.validate();

    expect(document.getElementById('preferencia-error').textContent).toBe(
      'Elige cómo prefieres que te contactemos'
    );
  });

  it('el constructor lanza un error si no es un <fieldset>', () => {
    document.body.innerHTML = `<div data-radio-group></div>`;
    expect(
      () => new RadioGroup(document.querySelector('[data-radio-group]'))
    ).toThrow();
  });

  it('destroy() quita el listener: elegir una opción ya no retira el error', () => {
    const group = new RadioGroup(fieldset({ required: true }));
    group.validate();
    group.destroy();

    document.getElementById('contacto-tel').click();

    expect(
      document.getElementById('preferencia').getAttribute('aria-invalid')
    ).toBe('true');
  });
});

describe('initRadioGroups', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inicializa todos los [data-radio-group] de un contenedor', () => {
    document.body.innerHTML = `
      <fieldset id="a" data-radio-group>
        <legend>A</legend>
        <input type="radio" name="a" id="a1" />
      </fieldset>
      <fieldset id="b" data-radio-group>
        <legend>B</legend>
        <input type="radio" name="b" id="b1" />
      </fieldset>
    `;

    const groups = initRadioGroups();

    expect(groups).toHaveLength(2);
    expect(groups[0]).toBeInstanceOf(RadioGroup);
  });
});
