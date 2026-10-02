import { describe, it, expect, beforeEach } from 'vitest';
import {
  MENU_ITEM_SELECTOR,
  isMenuItemEnabled,
  getMenuItems,
  focusMenuItem,
  toggleMenuItem,
  findMenuItemByChar,
} from './menu.js';

function buildMarkup() {
  document.body.innerHTML = `
    <ul id="menu" role="menu">
      <li role="none"><button type="button" role="menuitem">Editar</button></li>
      <li role="none"><button type="button" role="menuitem">Duplicar</button></li>
      <li role="none"><button type="button" role="menuitem" disabled>Archivar</button></li>
      <li role="none"><button type="button" role="menuitem">Eliminar</button></li>
    </ul>
  `;
}

function buildCheckMarkup() {
  document.body.innerHTML = `
    <ul id="menu" role="menu">
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

describe('menu.js', () => {
  describe('MENU_ITEM_SELECTOR', () => {
    beforeEach(buildMarkup);

    it('selecciona todos los elementos menuitem*', () => {
      const items = document.querySelectorAll(MENU_ITEM_SELECTOR);
      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => {
        const role = item.getAttribute('role');
        expect(role).toMatch(/^menuitem/);
      });
    });
  });

  describe('isMenuItemEnabled', () => {
    beforeEach(buildMarkup);

    it('devuelve true para elementos no deshabilitados', () => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(isMenuItemEnabled(items[0])).toBe(true);
      expect(isMenuItemEnabled(items[1])).toBe(true);
      expect(isMenuItemEnabled(items[3])).toBe(true);
    });

    it('devuelve false para elementos disabled', () => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(isMenuItemEnabled(items[2])).toBe(false);
    });

    it('devuelve false para elementos con aria-disabled="true"', () => {
      const button = document.createElement('button');
      button.setAttribute('role', 'menuitem');
      button.setAttribute('aria-disabled', 'true');
      expect(isMenuItemEnabled(button)).toBe(false);
    });
  });

  describe('getMenuItems', () => {
    beforeEach(buildMarkup);

    it('devuelve solo los elementos habilitados en orden del DOM', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      expect(items).toHaveLength(3);
      expect(items[0].textContent).toBe('Editar');
      expect(items[1].textContent).toBe('Duplicar');
      expect(items[2].textContent).toBe('Eliminar');
    });

    it('salta los deshabilitados', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);
      const texts = items.map((i) => i.textContent);

      expect(texts).not.toContain('Archivar');
    });
  });

  describe('focusMenuItem', () => {
    beforeEach(buildMarkup);

    it('pone tabindex "0" en el item y "-1" en los demás', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      focusMenuItem(menu, items[1]);

      items.forEach((item, i) => {
        expect(item.getAttribute('tabindex')).toBe(i === 1 ? '0' : '-1');
      });
    });

    it('enfoca el elemento', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      focusMenuItem(menu, items[0]);

      expect(document.activeElement).toBe(items[0]);
    });
  });

  describe('toggleMenuItem', () => {
    describe('menuitemcheckbox', () => {
      beforeEach(buildCheckMarkup);

      it('alterna aria-checked sin devolver false', () => {
        const menu = $('#menu');
        const check = document.querySelector('[role="menuitemcheckbox"]');

        const result1 = toggleMenuItem(check, menu);
        expect(check.getAttribute('aria-checked')).toBe('true');
        expect(result1).toBe(true);

        const result2 = toggleMenuItem(check, menu);
        expect(check.getAttribute('aria-checked')).toBe('false');
        expect(result2).toBe(true);
      });
    });

    describe('menuitemradio', () => {
      beforeEach(buildCheckMarkup);

      it('marca uno de su grupo y desmarca el resto', () => {
        const menu = $('#menu');
        const r1 = $('#r1');
        const r2 = $('#r2');

        toggleMenuItem(r2, menu);

        expect(r2.getAttribute('aria-checked')).toBe('true');
        expect(r1.getAttribute('aria-checked')).toBe('false');
      });

      it('devuelve true', () => {
        const menu = $('#menu');
        const r2 = $('#r2');

        const result = toggleMenuItem(r2, menu);

        expect(result).toBe(true);
      });
    });

    describe('menuitem de acción', () => {
      beforeEach(buildMarkup);

      it('devuelve false', () => {
        const menu = $('#menu');
        const item = getMenuItems(menu)[0];

        const result = toggleMenuItem(item, menu);

        expect(result).toBe(false);
      });
    });
  });

  describe('findMenuItemByChar', () => {
    beforeEach(buildMarkup);

    it('enfoca el siguiente elemento cuyo texto empieza por esa letra', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      const found = findMenuItemByChar('e', items, items[1]);

      expect(found.textContent).toBe('Eliminar');
    });

    it('da la vuelta al final y no distingue mayúsculas', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      const found = findMenuItemByChar('E', items, items[3]);

      expect(found.textContent).toBe('Editar');
    });

    it('devuelve null sin coincidencias', () => {
      const menu = $('#menu');
      const items = getMenuItems(menu);

      const found = findMenuItemByChar('z', items, items[0]);

      expect(found).toBe(null);
    });
  });
});
