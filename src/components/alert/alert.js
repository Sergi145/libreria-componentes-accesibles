/**
 * Componente: Alert
 * Mensaje breve dentro del flujo de la página. Patrón APG: "Alert"
 * (https://www.w3.org/WAI/ARIA/apg/patterns/alert/). El `role` depende
 * de la variante: `alert` (asertivo) en `warning` y `danger`, `status`
 * (cortés) en `info` y `success`.
 *
 * Decisiones no obvias:
 * - Un `role` presente en el marcado al cargar la página no se anuncia
 *   (el lector solo anuncia cambios en una región ya existente). Para
 *   avisar de algo que ocurre después de cargar, usa `showAlert()`.
 * - `showAlert()` inserta la alerta con su `role` pero VACÍA, y escribe
 *   el texto en el siguiente tick: un `role` insertado a la vez que su
 *   contenido no se anuncia de forma fiable. No usa `announce()` (se
 *   leería dos veces).
 * - `showAlert()` solo deja una alerta a la vez por contenedor: si ya
 *   hay una visible creada por `showAlert()`, una nueva llamada no
 *   inserta ni anuncia nada y devuelve la existente. Evita apilar la
 *   misma alerta si se dispara varias veces. Al descartarla (o quitarla
 *   del DOM) se puede mostrar otra.
 * - Al descartar una alerta con su botón, el botón desaparece con ella:
 *   si el foco se quedara ahí caería en <body>. Se devuelve a
 *   `returnFocus`, o al elemento de `data-alert-return="ID"`, o al
 *   siguiente elemento enfocable tras la alerta (y, si no hay ninguno,
 *   al anterior).
 * - Un `dismiss()` programático solo mueve el foco si estaba dentro de la
 *   alerta; el clic en el botón lo mueve siempre (Safari y Firefox en Mac
 *   no enfocan un botón al hacer clic en él).
 *
 * Uso:
 *   import { Alert } from './alert.js';
 *   new Alert(document.querySelector('[data-alert]'), {
 *     returnFocus: document.getElementById('campo'),
 *   });
 *
 *   import { showAlert } from './alert.js';
 *   showAlert(document.getElementById('avisos'), 'No se pudo guardar', {
 *     variant: 'danger',
 *     dismissible: true,
 *   });
 */

const VARIANTS = {
  info: {
    prefix: 'Información:',
    role: 'status',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />',
  },
  success: {
    prefix: 'Correcto:',
    role: 'status',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />',
  },
  warning: {
    prefix: 'Aviso:',
    role: 'alert',
    icon: '<path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" />',
  },
  danger: {
    prefix: 'Error:',
    role: 'alert',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />',
  },
};

/** Última alerta de `showAlert()` por contenedor (Alert o elemento). */
const shown = new WeakMap();

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Enfocables visibles del documento, en orden del DOM. jsdom no calcula
 * layout, así que "visible" es: sin `hidden` propio ni en un ancestro.
 * @returns {HTMLElement[]}
 */
function focusables() {
  return Array.from(document.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[hidden]')
  );
}

export class Alert {
  /**
   * @param {HTMLElement} el
   * @param {{ returnFocus?: HTMLElement }} [options]
   */
  constructor(el, { returnFocus } = {}) {
    if (!el) {
      throw new Error('Alert: se requiere el elemento de la alerta.');
    }
    this.el = el;
    this.returnFocus = returnFocus;
    this._closeButton = el.querySelector('[data-alert-close]');
    this._onClose = () => this._remove(true);
    this._closeButton?.addEventListener('click', this._onClose);
  }

  /** Quita la alerta del DOM. Solo mueve el foco si estaba dentro de ella. */
  dismiss() {
    this._remove(this.el.contains(document.activeElement));
  }

  destroy() {
    this._closeButton?.removeEventListener('click', this._onClose);
  }

  _remove(moveFocus) {
    const target = moveFocus ? this._focusTarget() : null;
    this.destroy();
    this.el.remove();
    target?.focus();
  }

  /** @returns {HTMLElement | null} */
  _focusTarget() {
    if (this.returnFocus?.isConnected) return this.returnFocus;

    const id = this.el.getAttribute('data-alert-return');
    const byId = id ? document.getElementById(id) : null;
    if (byId) return byId;

    const outside = focusables().filter((el) => !this.el.contains(el));
    const following = outside.find(
      (el) =>
        this.el.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    return following ?? outside[outside.length - 1] ?? null;
  }
}

/**
 * Inserta una alerta en `container` con el `role` de su variante. El
 * texto se escribe en el siguiente tick, con la región ya en el DOM.
 * @param {HTMLElement} container
 * @param {string} message Texto plano (se inserta con textContent).
 * @param {{
 *   variant?: 'info' | 'success' | 'warning' | 'danger',
 *   dismissible?: boolean,
 * }} [options]
 * @returns {Alert | HTMLElement} `Alert` si es descartable; si no, el
 *   elemento insertado.
 */
export function showAlert(
  container,
  message,
  { variant = 'info', dismissible = false } = {}
) {
  if (!container) {
    throw new Error('showAlert: se requiere el contenedor de la alerta.');
  }

  const previous = shown.get(container);
  const previousEl = previous instanceof Alert ? previous.el : previous;
  if (previousEl?.isConnected && container.contains(previousEl)) {
    return previous;
  }

  const key = variant in VARIANTS ? variant : 'info';
  const { prefix, role, icon } = VARIANTS[key];

  const el = document.createElement('div');
  el.className = `c-alert c-alert--${key}`;
  el.setAttribute('role', role);
  el.innerHTML = `
    <svg class="c-alert__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
    </svg>
    <p class="c-alert__body"></p>
  `;
  const body = el.querySelector('.c-alert__body');

  if (dismissible) {
    el.setAttribute('data-alert', '');
    el.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="c-close-button c-alert__close"
        aria-label="Cerrar alerta" data-alert-close>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>`
    );
  }

  container.appendChild(el);
  setTimeout(() => {
    const srText = document.createElement('span');
    srText.className = 'c-alert__sr-text';
    srText.textContent = prefix;
    body.append(srText, ` ${message}`);
  }, 0);
  const result = dismissible ? new Alert(el) : el;
  shown.set(container, result);
  return result;
}

/**
 * Inicializa todas las alertas con [data-alert] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Alert[]}
 */
export function initAlerts(root = document) {
  return Array.from(root.querySelectorAll('[data-alert]')).map(
    (el) => new Alert(el)
  );
}
