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
