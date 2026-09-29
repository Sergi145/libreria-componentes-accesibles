import { describe, it, expect, beforeEach } from 'vitest';
import { MenuButton, initMenuButtons } from './menu-button.js';

function buildMarkup() {
  document.body.innerHTML = `
    <div class="c-menu-button">
      <button type="button" id="btn" data-menu-button aria-haspopup="menu"
        aria-expanded="false" aria-controls="menu">Acciones</button>
      <ul id="menu" role="menu" aria-labelledby="btn" hidden>
        <li role="none"><button type="button" role="menuitem">Editar</button></li>
        <li role="none"><button type="button" role="menuitem">Duplicar</button></li>
        <li role="none"><button type="button" role="menuitem" disabled>Archivar</button></li>
        <li role="none"><button type="button" role="menuitem">Eliminar</button></li>
      </ul>
    </div>
    <button type="button" id="otro">Otro</button>
  `;
}

function buildCheckMarkup() {
  document.body.innerHTML = `
    <button type="button" id="btn" data-menu-button aria-haspopup="menu"
      aria-expanded="false" aria-controls="menu">Vista</button>
    <ul id="menu" role="menu" aria-labelledby="btn" hidden>
      <li role="none"><button type="button" role="menuitemcheckbox" aria-checked="false">Barra</button></li>
      <li role="none">
        <ul role="group" aria-label="Ordenar por">
          <li role="none"><button type="button" id="r1" role="menuitemradio" aria-checked="true">Nombre</button></li>
          <li role="none"><button type="button" id="r2" role="menuitemradio" aria-checked="false">Fecha</button></li>
        </ul>
      </li>
    </ul>
  `;
}

const $ = (sel) => document.querySelector(sel);
const items = () => Array.from(document.querySelectorAll('[role="menuitem"]'));

function key(target, k, init = {}) {
  const event = new KeyboardEvent('keydown', {
    key: k,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe('MenuButton', () => {
  beforeEach(buildMarkup);

  it('lanza un error sin botón o sin menú enlazado', () => {
    expect(() => new MenuButton(null)).toThrow();
    $('#btn').setAttribute('aria-controls', 'nada');
    expect(() => new MenuButton($('#btn'))).toThrow();
  });

  it('empieza cerrado', () => {
    const mb = new MenuButton($('#btn'));
    expect(mb.expanded).toBe(false);
    expect($('#menu').hidden).toBe(true);
  });

  it('un clic (Enter/Espacio) abre y enfoca el primer elemento', () => {
    const mb = new MenuButton($('#btn'));

    $('#btn').click();

    expect(mb.expanded).toBe(true);
    expect($('#btn').getAttribute('aria-expanded')).toBe('true');
    expect($('#menu').hidden).toBe(false);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('↓ en el botón abre y enfoca el primero', () => {
    new MenuButton($('#btn'));
    const event = key($('#btn'), 'ArrowDown');

    expect(event.defaultPrevented).toBe(true);
    expect($('#btn').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(items()[0]);
  });

  it('↑ en el botón abre y enfoca el último', () => {
    new MenuButton($('#btn'));
    key($('#btn'), 'ArrowUp');

    expect(document.activeElement).toBe(items()[3]);
  });

  it('↓/↑ recorren con envoltura y saltan los deshabilitados', () => {
    new MenuButton($('#btn'));
    $('#btn').click();

    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.textContent).toBe('Duplicar');
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.textContent).toBe('Eliminar');
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.textContent).toBe('Editar');
    key(document.activeElement, 'ArrowUp');
    expect(document.activeElement.textContent).toBe('Eliminar');
  });

  it('Inicio y Fin van al primero y al último', () => {
    new MenuButton($('#btn'));
    $('#btn').click();

    key(document.activeElement, 'End');
    expect(document.activeElement.textContent).toBe('Eliminar');
    key(document.activeElement, 'Home');
    expect(document.activeElement.textContent).toBe('Editar');
  });

  it('Escape cierra, devuelve el foco al botón y cancela el evento', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    const event = key(document.activeElement, 'Escape');

    expect(mb.expanded).toBe(false);
    expect($('#menu').hidden).toBe(true);
    expect(document.activeElement).toBe($('#btn'));
    expect(event.defaultPrevented).toBe(true);
  });

  it('Tab cierra sin cancelar el evento ni forzar el foco', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    const event = key(document.activeElement, 'Tab');

    expect(mb.expanded).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).not.toBe($('#btn'));
  });

  it('activar un menuitem cierra y devuelve el foco al botón', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    items()[1].click();

    expect(mb.expanded).toBe(false);
    expect(document.activeElement).toBe($('#btn'));
  });

  it('un elemento deshabilitado no cierra el menú', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    items()[2].click();

    expect(mb.expanded).toBe(true);
  });

  it('un pointerdown fuera cierra sin mover el foco', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();
    $('#otro').dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(mb.expanded).toBe(false);
    expect(document.activeElement).not.toBe($('#btn'));
  });

  it('typeahead: «e» desde Duplicar enfoca Eliminar', () => {
    new MenuButton($('#btn'));
    $('#btn').click();
    items()[1].focus();

    key(items()[1], 'e');

    expect(document.activeElement.textContent).toBe('Eliminar');
  });

  it('typeahead da la vuelta al final y no distingue mayúsculas', () => {
    new MenuButton($('#btn'));
    $('#btn').click();
    items()[3].focus();

    key(items()[3], 'E');

    expect(document.activeElement.textContent).toBe('Editar');
  });

  it('typeahead sin coincidencias no mueve el foco', () => {
    new MenuButton($('#btn'));
    $('#btn').click();
    const first = document.activeElement;

    key(first, 'z');

    expect(document.activeElement).toBe(first);
  });

  it('Espacio y Ctrl+letra no disparan typeahead', () => {
    new MenuButton($('#btn'));
    $('#btn').click();
    items()[1].focus();

    key(items()[1], ' ');
    key(items()[1], 'e', { ctrlKey: true });

    expect(document.activeElement.textContent).toBe('Duplicar');
  });

  it('destroy() quita los listeners', () => {
    const mb = new MenuButton($('#btn'));
    mb.destroy();

    $('#btn').click();

    expect(mb.expanded).toBe(false);
  });

  it('initMenuButtons inicializa cada [data-menu-button]', () => {
    expect(initMenuButtons()).toHaveLength(1);
  });
});

describe('MenuButton: casillas y radios', () => {
  beforeEach(buildCheckMarkup);

  it('menuitemcheckbox alterna aria-checked sin cerrar el menú', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();
    const check = $('[role="menuitemcheckbox"]');

    check.click();
    expect(check.getAttribute('aria-checked')).toBe('true');
    check.click();
    expect(check.getAttribute('aria-checked')).toBe('false');
    expect(mb.expanded).toBe(true);
  });

  it('menuitemradio marca uno y desmarca el resto del grupo, sin cerrar', () => {
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    $('#r2').click();

    expect($('#r2').getAttribute('aria-checked')).toBe('true');
    expect($('#r1').getAttribute('aria-checked')).toBe('false');
    expect(
      document.querySelectorAll('[role="menuitemradio"][aria-checked="true"]')
    ).toHaveLength(1);
    expect(mb.expanded).toBe(true);
  });

  it('las flechas recorren también los elementos dentro del grupo', () => {
    new MenuButton($('#btn'));
    $('#btn').click();

    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.id).toBe('r1');
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.id).toBe('r2');
  });
});

describe('MenuButton: dentro de un <dialog>', () => {
  it('Escape cierra el menú y cancela el evento (para no cerrar el diálogo)', () => {
    document.body.innerHTML = `
      <dialog open>
        <button type="button" id="btn" data-menu-button aria-haspopup="menu"
          aria-expanded="false" aria-controls="menu">Acciones</button>
        <ul id="menu" role="menu" aria-labelledby="btn" hidden>
          <li role="none"><button type="button" role="menuitem">Editar</button></li>
        </ul>
      </dialog>
    `;
    const mb = new MenuButton($('#btn'));
    $('#btn').click();

    const event = key(document.activeElement, 'Escape');

    expect(mb.expanded).toBe(false);
    // Al cancelar Escape, el navegador no dispara el `cancel` del
    // <dialog>: el diálogo sigue abierto (se verifica en Playwright).
    expect(event.defaultPrevented).toBe(true);
  });
});
