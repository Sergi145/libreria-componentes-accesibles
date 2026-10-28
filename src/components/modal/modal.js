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
 *  - Cierre al hacer clic en el backdrop (salvo en la variante
 *    alertdialog, ver más abajo).
 *  - Un atrapado de foco estricto (Tab / Shift+Tab ciclan dentro del
 *    diálogo). El nativo deja que Tab salga a la interfaz del
 *    navegador (barra de direcciones, pestañas) antes de volver al
 *    diálogo; aquí el foco nunca sale.
 *  - En el fallback sin showModal(), además, el foco inicial y su
 *    devolución al cerrar.
 *
 * Variante alertdialog: un <dialog role="alertdialog"> es un modal que
 * interrumpe para pedir una respuesta (confirmaciones destructivas). El
 * fondo debe ser realmente inerte, así que el clic en el backdrop NO lo
 * cierra; Escape sigue cerrándolo para no atrapar al usuario de
 * teclado. El HTML añade el rol; esta clase no cambia de API.
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

// Elementos que pueden recibir foco con Tab (tabindex negativo excluido).
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex^="-"])';

export class Modal {
  /** @param {HTMLDialogElement} dialogEl */
  constructor(dialogEl) {
    if (!dialogEl || dialogEl.tagName !== 'DIALOG') {
      throw new Error('Modal: se requiere un elemento <dialog>.');
    }
    this.dialog = dialogEl;
    this._onBackdropClick = this._onBackdropClick.bind(this);
    this.dialog.addEventListener('click', this._onBackdropClick);
    this._onTrapKeydown = this._onTrapKeydown.bind(this);
    this.dialog.addEventListener('keydown', this._onTrapKeydown);
    this._returnFocusTo = null;
  }

  open() {
    if (typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();
    } else {
      // Fallback para navegadores sin soporte de <dialog> (muy pocos):
      // no hay atrapado de foco ni inertización nativos, así que se
      // atrapa Tab a mano. El fondo sigue sin ser inerte para lectores
      // de pantalla: para eso conviene un polyfill (p. ej.
      // dialog-polyfill).
      this._returnFocusTo = document.activeElement;
      this.dialog.setAttribute('open', '');
      (this._focusables()[0] ?? this.dialog).focus();
    }
  }

  /** @param {string} [returnValue] */
  close(returnValue) {
    if (typeof this.dialog.close === 'function') {
      this.dialog.close(returnValue);
    } else {
      this.dialog.removeAttribute('open');
      this._returnFocusTo?.focus?.();
      this._returnFocusTo = null;
    }
  }

  /** @returns {boolean} */
  get isAlert() {
    return this.dialog.getAttribute('role') === 'alertdialog';
  }

  /** @returns {HTMLElement[]} */
  _focusables() {
    return [...this.dialog.querySelectorAll(FOCUSABLE)];
  }

  /**
   * Tab en el último control vuelve al primero y Shift+Tab en el
   * primero salta al último. Solo actúa con el diálogo abierto.
   * @param {KeyboardEvent} event
   */
  _onTrapKeydown(event) {
    if (event.key !== 'Tab' || !this.dialog.open) return;
    const items = this._focusables();
    if (items.length === 0) {
      event.preventDefault();
      this.dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === this.dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** @param {MouseEvent} event */
  _onBackdropClick(event) {
    // Un alertdialog no se cierra al clicar el backdrop: pide una
    // respuesta explícita (ver la nota de la cabecera del archivo).
    if (this.isAlert) return;
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
