/**
 * Componente: Modal
 *
 * Se apoya en <dialog>.showModal(), que en los navegadores modernos ya
 * resuelve gratis:
 *  - Atrapar el foco (Tab) dentro del diálogo.
 *  - Cerrar con la tecla Escape.
 *  - Devolver el foco al elemento que abrió el diálogo al cerrarlo.
 *  - Ocultar el resto de la página a la tecnología de asistencia
 *    (el árbol de accesibilidad fuera del <dialog> queda inerte).
 *
 * Este módulo solo añade:
 *  - La conexión entre el botón que abre el modal y el <dialog>.
 *  - Cierre al hacer clic en el backdrop.
 *
 * Cerrar con los botones "Cancelar"/"Confirmar" no necesita JS: al ser
 * <button type="submit"> dentro de <form method="dialog">, el propio
 * navegador cierra el diálogo y expone el `value` del botón pulsado en
 * `dialog.returnValue`.
 *
 * Uso:
 *   import { Modal } from './modal.js';
 *   const modal = new Modal(document.querySelector('#ejemplo-modal'));
 *   document.querySelector('[data-modal-trigger]')
 *     .addEventListener('click', () => modal.open());
 */

export class Modal {
  /** @param {HTMLDialogElement} dialogEl */
  constructor(dialogEl) {
    if (!dialogEl || dialogEl.tagName !== 'DIALOG') {
      throw new Error('Modal: se requiere un elemento <dialog>.');
    }
    this.dialog = dialogEl;
    this._onBackdropClick = this._onBackdropClick.bind(this);
    this.dialog.addEventListener('click', this._onBackdropClick);
  }

  open() {
    if (typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();
    } else {
      // Fallback para navegadores sin soporte de <dialog> (muy pocos):
      // pierde el atrapado de foco nativo, así que en ese caso conviene
      // usar un polyfill (p. ej. dialog-polyfill) en vez de confiar solo
      // en esta rama.
      this.dialog.setAttribute('open', '');
    }
  }

  /** @param {string} [returnValue] */
  close(returnValue) {
    if (typeof this.dialog.close === 'function') {
      this.dialog.close(returnValue);
    } else {
      this.dialog.removeAttribute('open');
    }
  }

  /** @param {MouseEvent} event */
  _onBackdropClick(event) {
    // El <dialog> no tiene padding propio (ver modal.css), así que si el
    // target del clic es el propio <dialog> y no un descendiente, el
    // clic fue en el backdrop.
    if (event.target === this.dialog) {
      this.close('dismiss');
    }
  }
}

/**
 * Conecta cada [data-modal-trigger="ID"] con el <dialog id="ID"> que
 * abre, y devuelve las instancias creadas indexadas por id.
 * @param {ParentNode} [root]
 * @returns {Map<string, Modal>}
 */
export function initModals(root = document) {
  const modals = new Map();

  root.querySelectorAll('dialog.c-modal').forEach((dialogEl) => {
    modals.set(dialogEl.id, new Modal(dialogEl));
  });

  root.querySelectorAll('[data-modal-trigger]').forEach((trigger) => {
    const modal = modals.get(trigger.getAttribute('data-modal-trigger'));
    if (modal) trigger.addEventListener('click', () => modal.open());
  });

  return modals;
}
