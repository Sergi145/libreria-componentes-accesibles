import { describe, it, expect, beforeEach } from 'vitest';
import { Dropdown, initDropdowns } from './dropdown.js';

function buildMarkup() {
  document.body.innerHTML = `
    <div class="c-dropdown">
      <button type="button" data-dropdown aria-expanded="false" aria-controls="d1">
        Productos
      </button>
      <ul id="d1" hidden>
        <li><a href="#a" aria-current="page">Software</a></li>
        <li><a href="#b">Hardware</a></li>
      </ul>
    </div>
    <button type="button" id="otro">Otro</button>
  `;
}

function keydown(key) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  );
}

describe('Dropdown', () => {
  beforeEach(buildMarkup);

  it('lanza un error si no recibe disparador', () => {
    expect(() => new Dropdown(null)).toThrow();
  });

  it('no usa roles de menú', () => {
    expect(document.querySelector('[role="menu"], [role^="menuitem"]')).toBe(
      null
    );
  });

  it('un clic alterna aria-expanded y hidden', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);

    trigger.click();
    expect(dropdown.expanded).toBe(true);
    expect(document.getElementById('d1').hidden).toBe(false);

    trigger.click();
    expect(dropdown.expanded).toBe(false);
    expect(document.getElementById('d1').hidden).toBe(true);
  });

  it('Escape lo cierra y devuelve el foco al botón', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);
    document.querySelector('#d1 a').focus();
    dropdown.open();
    document.querySelector('#d1 a').focus();

    keydown('Escape');

    expect(dropdown.expanded).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('un pointerdown fuera lo cierra', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);
    trigger.click();

    document
      .getElementById('otro')
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(dropdown.expanded).toBe(false);
  });

  it('el foco que sale de la lista lo cierra sin mover el foco', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const otro = document.getElementById('otro');
    const dropdown = new Dropdown(trigger);
    trigger.click();

    otro.focus();

    expect(dropdown.expanded).toBe(false);
    expect(document.activeElement).toBe(otro);
  });

  it('el foco que se mueve entre los enlaces no lo cierra', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);
    trigger.click();

    document.querySelector('#d1 a').focus();
    document.querySelectorAll('#d1 a')[1].focus();

    expect(dropdown.expanded).toBe(true);
  });

  it('las flechas no hacen nada (se recorre con Tab)', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);
    trigger.click();
    const first = document.querySelector('#d1 a');
    first.focus();

    first.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );

    expect(dropdown.expanded).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('destroy() quita los listeners', () => {
    const trigger = document.querySelector('[data-dropdown]');
    const dropdown = new Dropdown(trigger);
    dropdown.open();

    dropdown.destroy();
    keydown('Escape');
    expect(dropdown.expanded).toBe(true);

    trigger.click();
    expect(dropdown.expanded).toBe(true);
  });

  it('initDropdowns inicializa cada [data-dropdown]', () => {
    expect(initDropdowns()).toHaveLength(1);
  });
});
