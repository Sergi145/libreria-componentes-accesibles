import { describe, it, expect, beforeEach } from 'vitest';
import { Button } from './button.js';

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
