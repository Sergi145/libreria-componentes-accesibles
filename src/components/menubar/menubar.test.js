import { describe, it, expect, beforeEach } from 'vitest';
import { Menubar, initMenubars } from './menubar.js';

function buildMarkup() {
  document.body.innerHTML = `
    <ul role="menubar" aria-label="Edición" data-menubar>
      <li role="none">
        <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-archivo">
          Archivo
        </button>
        <ul id="menu-archivo" role="menu" aria-labelledby="menu-archivo-btn" hidden>
          <li role="none"><button type="button" role="menuitem">Nuevo</button></li>
          <li role="none"><button type="button" role="menuitem">Abrir</button></li>
          <li role="none"><button type="button" role="menuitem">Guardar</button></li>
        </ul>
      </li>
      <li role="none">
        <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-editar">
          Editar
        </button>
        <ul id="menu-editar" role="menu" aria-labelledby="menu-editar-btn" hidden>
          <li role="none"><button type="button" role="menuitem">Deshacer</button></li>
          <li role="none"><button type="button" role="menuitem">Rehacer</button></li>
          <li role="none"><button type="button" role="menuitem">Cortar</button></li>
        </ul>
      </li>
      <li role="none">
        <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-vista">
          Vista
        </button>
        <ul id="menu-vista" role="menu" aria-labelledby="menu-vista-btn" hidden>
          <li role="none"><button type="button" role="menuitemcheckbox" aria-checked="true">Barra</button></li>
          <li role="none">
            <ul role="group" aria-label="Zoom">
              <li role="none"><button type="button" role="menuitemradio" aria-checked="true">100%</button></li>
              <li role="none"><button type="button" role="menuitemradio" aria-checked="false">Ajustado</button></li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  `;
}

const $ = (sel) => document.querySelector(sel);
const barItems = () =>
  Array.from(
    document.querySelectorAll('[role="menubar"] > li > [role="menuitem"]')
  );

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

describe('Menubar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error sin un elemento [role="menubar"]', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Menubar(document.querySelector('div'))).toThrow();
  });

  it('Tab entra una sola vez en roving tabindex', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));

    const items = barItems();
    const hasTabindex0 = items.filter(
      (item) => item.getAttribute('tabindex') === '0'
    );
    expect(hasTabindex0).toHaveLength(1);
  });

  it('←/→ recorren los elementos de la barra con envoltura', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const items = barItems();
    items[0].focus();

    key(items[0], 'ArrowRight');
    expect(document.activeElement).toBe(items[1]);

    key(items[1], 'ArrowRight');
    expect(document.activeElement).toBe(items[2]);

    key(items[2], 'ArrowRight');
    expect(document.activeElement).toBe(items[0]);

    key(items[0], 'ArrowLeft');
    expect(document.activeElement).toBe(items[2]);
  });

  it('↓ abre el menú con aria-expanded="true" y enfoca el primer elemento', () => {
    buildMarkup();
    const menubar = new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];
    archivoBtn.focus();

    key(archivoBtn, 'ArrowDown');

    expect(archivoBtn.getAttribute('aria-expanded')).toBe('true');
    const menuItems = Array.from(
      $('#menu-archivo').querySelectorAll('[role="menuitem"]')
    );
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it('↑ abre el menú y enfoca el último elemento', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];
    archivoBtn.focus();

    key(archivoBtn, 'ArrowUp');

    const menuItems = Array.from(
      $('#menu-archivo').querySelectorAll('[role="menuitem"]')
    );
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);
  });

  it('Enter abre el menú', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];
    archivoBtn.focus();

    key(archivoBtn, 'Enter');

    expect(archivoBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('Espacio abre el menú', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];
    archivoBtn.focus();

    key(archivoBtn, ' ');

    expect(archivoBtn.getAttribute('aria-expanded')).toBe('true');
  });

  it('typeahead en la barra enfoca el elemento correcto', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const items = barItems();
    items[0].focus();

    key(items[0], 'e');

    expect(document.activeElement).toBe(items[1]); // Editar empieza con E
  });

  it('un clic en un botón abre o cierra el menú', () => {
    buildMarkup();
    const menubar = new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];

    archivoBtn.click();
    expect($('#menu-archivo').hidden).toBe(false);

    archivoBtn.click();
    expect($('#menu-archivo').hidden).toBe(true);
  });

  it('solo un menú abierto a la vez', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const items = barItems();

    items[0].click();
    expect($('#menu-archivo').hidden).toBe(false);
    expect($('#menu-editar').hidden).toBe(true);

    items[1].click();
    expect($('#menu-archivo').hidden).toBe(true);
    expect($('#menu-editar').hidden).toBe(false);
  });

  it('Inicio y Fin dentro de un menú no salen de él', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    barItems()[0].click();
    const menuItems = Array.from(
      $('#menu-archivo').querySelectorAll('[role="menuitem"]')
    );

    menuItems[0].focus();
    key(menuItems[0], 'End');
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);

    key(menuItems[menuItems.length - 1], 'Home');
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it('Enter en un elemento de la barra sin menú no cancela su activación', () => {
    document.body.innerHTML = `
      <ul role="menubar" aria-label="Acciones">
        <li role="none"><button type="button" role="menuitem">Ayuda</button></li>
      </ul>`;
    new Menubar($('[role="menubar"]'));

    const event = key(barItems()[0], 'Enter');

    expect(event.defaultPrevented).toBe(false);
  });

  it('Escape cierra el menú y devuelve el foco a su elemento de la barra', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    const archivoBtn = barItems()[0];
    archivoBtn.click();

    key($('#menu-archivo [role="menuitem"]'), 'Escape');

    expect($('#menu-archivo').hidden).toBe(true);
    expect(document.activeElement).toBe(archivoBtn);
  });

  it('Tab cierra el menú', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    barItems()[0].click();

    key($('#menu-archivo [role="menuitem"]'), 'Tab');

    expect($('#menu-archivo').hidden).toBe(true);
  });

  it('una casilla alterna aria-checked sin cerrar el menú', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    barItems()[2].click();
    const casilla = $('#menu-vista [role="menuitemcheckbox"]');

    casilla.click();

    expect(casilla.getAttribute('aria-checked')).toBe('false');
    expect($('#menu-vista').hidden).toBe(false);
  });

  it('un radio deja uno solo marcado en su grupo y no cierra el menú', () => {
    buildMarkup();
    new Menubar($('[role="menubar"]'));
    barItems()[2].click();
    const radios = Array.from(
      $('#menu-vista').querySelectorAll('[role="menuitemradio"]')
    );

    radios[1].click();

    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
    ]);
    expect($('#menu-vista').hidden).toBe(false);
  });

  it('→ desde un menú enfoca el siguiente elemento de la barra aunque no tenga menú', () => {
    document.body.innerHTML = `
      <ul role="menubar" aria-label="Acciones">
        <li role="none">
          <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" aria-controls="menu-a">Archivo</button>
          <ul id="menu-a" role="menu" hidden>
            <li role="none"><button type="button" role="menuitem">Nuevo</button></li>
          </ul>
        </li>
        <li role="none"><button type="button" role="menuitem" id="ayuda">Ayuda</button></li>
      </ul>`;
    new Menubar($('[role="menubar"]'));
    barItems()[0].click();

    key($('#menu-a [role="menuitem"]'), 'ArrowRight');

    expect(document.activeElement).toBe($('#ayuda'));
  });

  it('destroy() quita los listeners', () => {
    buildMarkup();
    const menubar = new Menubar($('[role="menubar"]'));
    menubar.destroy();

    const archivoBtn = barItems()[0];
    archivoBtn.click();

    expect($('#menu-archivo').hidden).toBe(true);
  });

  it('initMenubars inicializa cada [role="menubar"]', () => {
    buildMarkup();
    const menubars = initMenubars();

    expect(menubars).toHaveLength(1);
    expect(menubars[0]).toBeInstanceOf(Menubar);
  });
});
