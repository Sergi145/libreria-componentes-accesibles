import { describe, it, expect, beforeEach } from 'vitest';
import { Modal, initModals } from './modal.js';

function buildMarkup() {
  document.body.innerHTML = `
    <button type="button" data-modal-trigger="m1">Abrir</button>
    <dialog id="m1" class="c-modal" aria-labelledby="m1-title">
      <form method="dialog" class="c-modal__content">
        <h2 id="m1-title">Título</h2>
        <button type="submit" value="cancel">Cancelar</button>
      </form>
    </dialog>
  `;
}

function buildAlertMarkup() {
  document.body.innerHTML = `
    <button type="button" data-modal-trigger="a1">Eliminar cuenta</button>
    <dialog
      id="a1"
      class="c-modal"
      role="alertdialog"
      aria-labelledby="a1-title"
      aria-describedby="a1-desc"
    >
      <form method="dialog" class="c-modal__content">
        <h2 id="a1-title">¿Eliminar la cuenta?</h2>
        <p id="a1-desc">No se puede deshacer.</p>
        <button type="submit" value="cancel" autofocus>Cancelar</button>
        <button type="submit" value="confirm">Eliminar</button>
      </form>
    </dialog>
  `;
}

describe('Modal', () => {
  beforeEach(() => {
    buildMarkup();
  });

  it('lanza un error si el elemento no es un <dialog>', () => {
    const div = document.createElement('div');
    expect(() => new Modal(div)).toThrow();
  });

  it('open() deja el diálogo marcado como abierto (jsdom soporta <dialog>)', () => {
    const dialog = document.getElementById('m1');
    const modal = new Modal(dialog);

    modal.open();

    expect(dialog.open).toBe(true);
  });

  it('close() cierra el diálogo', () => {
    const dialog = document.getElementById('m1');
    const modal = new Modal(dialog);

    modal.open();
    modal.close();

    expect(dialog.open).toBe(false);
  });

  it('un clic sobre el propio <dialog> (backdrop) lo cierra', () => {
    const dialog = document.getElementById('m1');
    const modal = new Modal(dialog);
    modal.open();

    // Al despachar el evento directamente sobre el <dialog> (y no sobre
    // un descendiente), event.target es el propio <dialog>: así se
    // distingue un clic en el backdrop de uno dentro del contenido.
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(false);
  });

  it('un clic dentro del contenido NO cierra el modal', () => {
    const dialog = document.getElementById('m1');
    const title = document.getElementById('m1-title');
    const modal = new Modal(dialog);
    modal.open();

    title.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(true);
  });

  it('initModals conecta el trigger con el diálogo correspondiente', () => {
    initModals();
    const dialog = document.getElementById('m1');
    const trigger = document.querySelector('[data-modal-trigger="m1"]');

    expect(dialog.open).toBe(false);
    trigger.click();
    expect(dialog.open).toBe(true);
  });

  describe('focus trap', () => {
    it('con showModal también cicla: Tab en el último vuelve al primero', () => {
      const dialog = document.getElementById('m1');
      dialog.insertAdjacentHTML(
        'beforeend',
        '<button type="button" id="extra">Extra</button>'
      );
      new Modal(dialog).open();
      const extra = document.getElementById('extra');
      extra.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      extra.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(dialog.querySelector('button'));
    });
  });

  describe('fallback sin showModal (focus trap propio)', () => {
    function openFallback() {
      document.body.innerHTML = `
        <button type="button" id="trigger">Abrir</button>
        <dialog id="f1" class="c-modal" aria-labelledby="f1-title">
          <h2 id="f1-title">Título</h2>
          <button type="button" id="b1">Uno</button>
          <button type="button" id="b2">Dos</button>
        </dialog>
      `;
      const dialog = document.getElementById('f1');
      dialog.showModal = undefined;
      const trigger = document.getElementById('trigger');
      trigger.focus();
      const modal = new Modal(dialog);
      modal.open();
      return { dialog, modal, trigger };
    }

    const tab = (el, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      return event;
    };

    it('al abrir, el foco pasa al primer control', () => {
      openFallback();
      expect(document.activeElement.id).toBe('b1');
    });

    it('Tab en el último control vuelve al primero', () => {
      openFallback();
      const b2 = document.getElementById('b2');
      b2.focus();

      const event = tab(b2);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement.id).toBe('b1');
    });

    it('Shift+Tab en el primer control salta al último', () => {
      openFallback();
      const b1 = document.getElementById('b1');

      const event = tab(b1, true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement.id).toBe('b2');
    });

    it('Tab en un control que no es el último no se intercepta', () => {
      openFallback();
      const event = tab(document.getElementById('b1'));
      expect(event.defaultPrevented).toBe(false);
    });

    it('close() devuelve el foco al disparador y quita el trap', () => {
      const { dialog, modal, trigger } = openFallback();

      modal.close();

      expect(dialog.hasAttribute('open')).toBe(false);
      expect(document.activeElement).toBe(trigger);
      const b2 = document.getElementById('b2');
      b2.focus();
      expect(tab(b2).defaultPrevented).toBe(false);
    });
  });

  describe('variante alertdialog', () => {
    it('isAlert es true solo cuando el <dialog> tiene role="alertdialog"', () => {
      const dialog = document.getElementById('m1');
      const modal = new Modal(dialog);

      expect(modal.isAlert).toBe(false);

      dialog.setAttribute('role', 'alertdialog');
      expect(modal.isAlert).toBe(true);
    });

    it('un clic sobre el backdrop NO cierra un alertdialog', () => {
      buildAlertMarkup();
      const dialog = document.getElementById('a1');
      const modal = new Modal(dialog);
      modal.open();

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(dialog.open).toBe(true);
    });

    it('un clic dentro del contenido de un alertdialog tampoco lo cierra', () => {
      buildAlertMarkup();
      const dialog = document.getElementById('a1');
      const title = document.getElementById('a1-title');
      const modal = new Modal(dialog);
      modal.open();

      title.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(dialog.open).toBe(true);
    });

    it('close() sigue cerrando un alertdialog (p. ej. al confirmar la acción)', () => {
      buildAlertMarkup();
      const dialog = document.getElementById('a1');
      const modal = new Modal(dialog);
      modal.open();

      modal.close('confirm');

      expect(dialog.open).toBe(false);
    });
  });
});
