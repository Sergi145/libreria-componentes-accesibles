import { describe, it, expect, beforeEach } from 'vitest';
import { Button, ToggleButton } from './button.js';

function createButton(label = 'Guardar') {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  document.body.appendChild(el);
  return el;
}

describe('Button', () => {
  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = createButton();
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Button(null)).toThrow();
  });

  it('es un <button> nativo, por lo que es enfocable por teclado sin JS', () => {
    expect(el.tagName).toBe('BUTTON');
    el.focus();
    expect(document.activeElement).toBe(el);
  });

  it('setLoading(true) marca aria-busy y aria-disabled sin quitar el foco', () => {
    const button = new Button(el);
    el.focus();

    button.setLoading(true, 'Guardando…');

    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.textContent).toBe('Guardando…');
    // Sigue siendo el elemento activo: aria-disabled no lo quita del
    // orden de tabulación como sí haría la propiedad `disabled`.
    expect(document.activeElement).toBe(el);
  });

  it('setLoading(false) restaura el texto y quita los atributos', () => {
    const button = new Button(el);
    button.setLoading(true, 'Guardando…');
    button.setLoading(false);

    expect(el.hasAttribute('aria-busy')).toBe(false);
    expect(el.hasAttribute('aria-disabled')).toBe(false);
    expect(el.textContent).toBe('Guardar');
  });
});

describe('ToggleButton', () => {
  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = createButton('Favorito');
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new ToggleButton(null)).toThrow();
  });

  it('si el HTML no trae aria-pressed, lo inicializa en "false"', () => {
    new ToggleButton(el);
    expect(el.getAttribute('aria-pressed')).toBe('false');
  });

  it('respeta un aria-pressed="true" ya presente en el HTML', () => {
    el.setAttribute('aria-pressed', 'true');
    const toggle = new ToggleButton(el);
    expect(toggle.pressed).toBe(true);
  });

  it('un clic alterna aria-pressed sin cambiar el texto del botón', () => {
    new ToggleButton(el);

    el.click();
    expect(el.getAttribute('aria-pressed')).toBe('true');
    expect(el.textContent).toBe('Favorito');

    el.click();
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.textContent).toBe('Favorito');
  });

  it('toggle() y el setter pressed cambian el estado sin necesidad de clic', () => {
    const toggle = new ToggleButton(el);

    toggle.toggle();
    expect(toggle.pressed).toBe(true);

    toggle.pressed = false;
    expect(el.getAttribute('aria-pressed')).toBe('false');
  });

  it('destroy() quita el listener de clic', () => {
    const toggle = new ToggleButton(el);
    toggle.destroy();

    el.click();
    expect(el.getAttribute('aria-pressed')).toBe('false');
  });
});
