/**
 * Componente: Offcanvas
 *
 * Panel que entra desde un lateral de la pantalla. Accesiblemente es un
 * diálogo modal (salvo que se abra en modo no modal — fuera del
 * alcance de este spec, ver el README), así que reutiliza toda la
 * lógica de Modal sobre <dialog>.showModal(): atrapado de foco, cierre
 * con Escape, devolución del foco al disparador y el resto de la
 * página queda inerte para la tecnología de asistencia.
 *
 * Esta clase añade destroy(), que Modal no tiene, y el modo
 * responsive: con la clase `c-offcanvas--responsive` en el <dialog>,
 * al cruzar el breakpoint hacia el ancho de escritorio (`62em`, el
 * mismo valor que offcanvas.css) el panel pasa a mostrarse como
 * contenido normal por CSS; si en ese momento estaba abierto, este
 * módulo lo cierra con matchMedia() para no dejarlo "atascado" en modo
 * modal (con foco atrapado y backdrop) al ensanchar la ventana.
 *
 * Uso:
 *   import { Offcanvas } from './offcanvas.js';
 *   const panel = new Offcanvas(document.querySelector('#filtros'));
 *   document.querySelector('[data-offcanvas-trigger]')
 *     .addEventListener('click', () => panel.open());
 */

import { Modal } from '../modal/modal.js';

// Debe coincidir con el breakpoint de `.c-offcanvas--responsive` en
// offcanvas.css.
const RESPONSIVE_QUERY = '(width >= 62em)';

export class Offcanvas extends Modal {
  /** @param {HTMLDialogElement} dialogEl */
  constructor(dialogEl) {
    super(dialogEl);
    this._mediaQuery = null;

    if (
      this.dialog.classList.contains('c-offcanvas--responsive') &&
      typeof matchMedia === 'function'
    ) {
      this._mediaQuery = matchMedia(RESPONSIVE_QUERY);
      this._onBreakpointChange = this._onBreakpointChange.bind(this);
      this._mediaQuery.addEventListener('change', this._onBreakpointChange);
    }
  }

  destroy() {
    this.dialog.removeEventListener('click', this._onBackdropClick);
    this._mediaQuery?.removeEventListener('change', this._onBreakpointChange);
  }

  /** @param {MediaQueryListEvent} event */
  _onBreakpointChange(event) {
    // event.matches === true: la ventana acaba de cruzar hacia el
    // ancho de escritorio, donde el panel ya se ve como contenido
    // normal por CSS. Si estaba abierto como modal, lo cerramos.
    if (event.matches) this.close('responsive');
  }
}

/**
 * Conecta cada [data-offcanvas-trigger="ID"] con el <dialog id="ID">
 * que abre, y devuelve las instancias creadas indexadas por id.
 * @param {ParentNode} [root]
 * @returns {Map<string, Offcanvas>}
 */
export function initOffcanvas(root = document) {
  const panels = new Map();

  root.querySelectorAll('dialog.c-offcanvas').forEach((dialogEl) => {
    panels.set(dialogEl.id, new Offcanvas(dialogEl));
  });

  root.querySelectorAll('[data-offcanvas-trigger]').forEach((trigger) => {
    const panel = panels.get(trigger.getAttribute('data-offcanvas-trigger'));
    if (panel) trigger.addEventListener('click', () => panel.open());
  });

  return panels;
}
