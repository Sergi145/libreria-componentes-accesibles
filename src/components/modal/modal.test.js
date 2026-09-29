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
});
