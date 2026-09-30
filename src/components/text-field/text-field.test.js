import { describe, it, expect, beforeEach } from 'vitest';
import { TextField, initTextFields, FormValidation } from './text-field.js';

function input(el, value) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function submit(form) {
  const event = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

function click(el) {
  el.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true })
  );
}

describe('TextField', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('un campo required vacío no muestra error mientras no se toca', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    const field = new TextField(document.querySelector('[data-field]'));

    expect(field.invalid).toBe(false);
    expect(document.getElementById('nombre-error')).toBeNull();
  });

  it('required vacío tras el blur marca aria-invalid y pinta el mensaje por defecto', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('nombre');

    control.focus();
    control.blur();

    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('nombre-error').textContent).toBe(
      'Este campo es obligatorio'
    );
  });

  it('un valor válido tras estar tocado retira el error al escribir', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('nombre');

    control.focus();
    control.blur();
    expect(control.getAttribute('aria-invalid')).toBe('true');

    input(control, 'Ana');

    expect(control.hasAttribute('aria-invalid')).toBe(false);
    expect(document.getElementById('nombre-error')).toBeNull();
  });

  it('escribir en un campo válido y aún no tocado no introduce un error', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('nombre');

    input(control, 'A');
    input(control, '');

    expect(control.hasAttribute('aria-invalid')).toBe(false);
  });

  it('type="email" con un valor mal escrito da el mensaje de typeMismatch por defecto', () => {
    document.body.innerHTML = `
      <div data-field><input id="correo" type="email" /></div>
    `;
    new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('correo');

    input(control, 'ana#ejemplo.com');
    control.focus();
    control.blur();

    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('correo-error').textContent).toBe(
      'El valor no tiene el formato esperado'
    );
  });

  it('data-error-required propio sustituye al mensaje por defecto', () => {
    document.body.innerHTML = `
      <div data-field>
        <input id="nombre" required data-error-required="Escribe tu nombre" />
      </div>
    `;
    new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('nombre');

    control.focus();
    control.blur();

    expect(document.getElementById('nombre-error').textContent).toBe(
      'Escribe tu nombre'
    );
  });

  it('validate() se puede llamar sin esperar al blur y devuelve el resultado', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    const field = new TextField(document.querySelector('[data-field]'));

    expect(field.validate()).toBe(false);
    expect(field.invalid).toBe(true);
  });

  it('el constructor lanza un error si no hay un control dentro', () => {
    document.body.innerHTML = `<div data-field></div>`;
    expect(
      () => new TextField(document.querySelector('[data-field]'))
    ).toThrow();
  });

  it('destroy() quita los listeners: el blur deja de validar', () => {
    document.body.innerHTML = `
      <div data-field><input id="nombre" required /></div>
    `;
    const field = new TextField(document.querySelector('[data-field]'));
    const control = document.getElementById('nombre');
    field.destroy();

    control.focus();
    control.blur();

    expect(control.hasAttribute('aria-invalid')).toBe(false);
  });
});

describe('initTextFields', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inicializa todos los [data-field] de un contenedor', () => {
    document.body.innerHTML = `
      <div data-field><input id="a" /></div>
      <div data-field><input id="b" /></div>
    `;

    const fields = initTextFields();

    expect(fields).toHaveLength(2);
    expect(fields[0]).toBeInstanceOf(TextField);
  });
});

describe('FormValidation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('pone novalidate en el formulario al construirse', () => {
    document.body.innerHTML = `<form data-validate></form>`;
    new FormValidation(document.querySelector('form'));

    expect(document.querySelector('form').hasAttribute('novalidate')).toBe(
      true
    );
  });

  it('el constructor lanza un error si no es un <form>', () => {
    document.body.innerHTML = `<div data-validate></div>`;
    expect(
      () => new FormValidation(document.querySelector('[data-validate]'))
    ).toThrow();
  });

  it('enviar con un campo inválido cancela el envío y lleva el foco al resumen', () => {
    document.body.innerHTML = `
      <form data-validate>
        <label for="nombre">Nombre</label>
        <div data-field><input id="nombre" required /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');

    const event = submit(form);

    expect(event.defaultPrevented).toBe(true);
    const summary = document.querySelector('[data-error-summary]');
    expect(summary.hidden).toBe(false);
    expect(summary.textContent).toContain('Hay 1 error en el formulario');
    expect(document.activeElement).toBe(summary);
  });

  it('con varios campos inválidos, el resumen cuenta en plural y enlaza a cada uno', () => {
    document.body.innerHTML = `
      <form data-validate>
        <label for="nombre">Nombre</label>
        <div data-field><input id="nombre" required /></div>
        <label for="correo">Correo electrónico</label>
        <div data-field><input id="correo" type="email" required /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');

    submit(form);

    const summary = document.querySelector('[data-error-summary]');
    expect(summary.textContent).toContain('Hay 2 errores en el formulario');
    const links = summary.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('#nombre');
    expect(links[1].getAttribute('href')).toBe('#correo');
  });

  it('cada enlace del resumen enfoca su control', () => {
    document.body.innerHTML = `
      <form data-validate>
        <label for="nombre">Nombre</label>
        <div data-field><input id="nombre" required /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');
    submit(form);

    const link = document.querySelector('[data-error-summary] a');
    click(link);

    expect(document.activeElement).toBe(document.getElementById('nombre'));
  });

  it('un grupo de radios obligatorio sin selección enlaza al primer radio', () => {
    document.body.innerHTML = `
      <form data-validate>
        <fieldset data-radio-group data-required id="preferencia">
          <legend>Preferencia de contacto</legend>
          <label
            ><input type="radio" name="contacto" id="contacto-email" />
            Correo</label
          >
          <label
            ><input type="radio" name="contacto" id="contacto-tel" />
            Teléfono</label
          >
        </fieldset>
        <button type="submit">Enviar</button>
      </form>
    `;
    const form = document.querySelector('form');
    const validation = new FormValidation(form);

    const event = submit(form);

    expect(event.defaultPrevented).toBe(true);
    const fieldset = document.getElementById('preferencia');
    expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    const link = document.querySelector('[data-error-summary] a');
    expect(link.getAttribute('href')).toBe('#contacto-email');

    click(link);
    expect(document.activeElement).toBe(
      document.getElementById('contacto-email')
    );

    document.getElementById('contacto-tel').checked = true;
    expect(validation.validate()).toBe(true);
    expect(fieldset.hasAttribute('aria-invalid')).toBe(false);
  });

  it('una casilla obligatoria suelta (fuera de un [data-field]) se valida igual que un campo', () => {
    document.body.innerHTML = `
      <form data-validate>
        <label for="terminos">Acepto los términos</label>
        <input type="checkbox" id="terminos" required />
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');

    submit(form);

    const checkbox = document.getElementById('terminos');
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    const link = document.querySelector('[data-error-summary] a');
    expect(link.getAttribute('href')).toBe('#terminos');
  });

  it('con el formulario válido no cancela el envío y el resumen queda hidden', () => {
    document.body.innerHTML = `
      <form data-validate>
        <div data-field><input id="nombre" required value="Ana" /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');

    const event = submit(form);

    expect(event.defaultPrevented).toBe(false);
    expect(document.querySelector('[data-error-summary]').hidden).toBe(true);
  });

  it('el resumen se vacía en el siguiente envío si ya todo es válido', () => {
    document.body.innerHTML = `
      <form data-validate>
        <div data-field><input id="nombre" required /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');

    submit(form);
    expect(document.querySelector('[data-error-summary]').hidden).toBe(false);

    input(document.getElementById('nombre'), 'Ana');
    const event = submit(form);

    expect(event.defaultPrevented).toBe(false);
    const summary = document.querySelector('[data-error-summary]');
    expect(summary.hidden).toBe(true);
    expect(summary.querySelectorAll('a')).toHaveLength(0);
  });

  it('destroy() quita el listener de envío', () => {
    document.body.innerHTML = `
      <form data-validate>
        <div data-field><input id="nombre" required /></div>
        <button type="submit">Enviar</button>
      </form>
    `;
    const validation = new FormValidation(document.querySelector('form'));
    const form = document.querySelector('form');
    validation.destroy();

    const event = submit(form);

    expect(event.defaultPrevented).toBe(false);
  });
});
