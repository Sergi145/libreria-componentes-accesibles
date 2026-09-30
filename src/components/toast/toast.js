/**
 * Componente: Toast
 * Notificación breve y no modal, en una región fija de la esquina. No
 * tiene patrón APG propio: se apoya en las regiones vivas
 * (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) y
 * en el patrón "Alert" (https://www.w3.org/WAI/ARIA/apg/patterns/alert/).
 *
 * Decisiones no obvias:
 * - El toast visual NO es región viva (no lleva role): su texto se
 *   anuncia con `announce()` de `live-region.js`, con cortesía según la
 *   variante (`polite` en info/success, `assertive` en warning/danger).
 *   Así no se lee dos veces y la región ya existe cuando llega el texto.
 * - Mostrar un toast nunca mueve el foco: interrumpiría lo que el
 *   usuario estaba haciendo.
 * - Al cerrar un toast con el foco dentro, el foco vuelve a
 *   `returnFocus` o, si no se da, al elemento que lo tenía antes de
 *   entrar en el toast. La región está al final de <body>, así que no
 *   existe un «siguiente enfocable» al que ir (a diferencia de Alert).
 * - La ocultación automática es opt-in (`autohide`, WCAG 2.2.1 Tiempo
 *   ajustable): por defecto un toast no se oculta solo. El temporizador
 *   se pausa mientras el ratón esté encima o el foco dentro, y se
 *   reanuda con el tiempo que quedaba. Un toast con botón de acción
 *   (`[data-toast-action]`) nunca se oculta solo: no daría tiempo a
 *   usarlo.
 * - Por defecto la región va al final de <body>, así que el toast queda
 *   al final del orden de Tab. Con la opción `after` (el disparador),
 *   `showToast()` crea una región propia justo después de él: el
 *   siguiente Tab llega entonces al toast (la región es `position:
 *   fixed`, así que visualmente sigue en la esquina) y, al cerrarlo, el
 *   foco vuelve al disparador.
 * - Las regiones que crea `showToast()` (global o de `after`) se quitan
 *   del DOM cuando se cierra su último toast: no queda marcado huérfano.
 * - Esc cierra el toast solo si el foco está dentro de él (el listener
 *   está en el propio toast, no en `document`): así no choca con
 *   diálogos ni menús. Cancela el evento, como `dismissable()`.
 * - Un toast `position: fixed` puede tapar el elemento enfocado (WCAG
 *   2.2 SC 2.4.11). Mientras hay un toast visible, si el foco llega a un
 *   elemento cuya caja se solapa con la de la región, la región salta al
 *   borde opuesto (`data-toast-top` la sube arriba; al volver a
 *   solaparse, baja). Además tiene botón de cierre, Esc y `autohide`; el
 *   README pide comprobarlo a 320 px y al 400 % de zoom.
 * - La acción de `showToast()` cierra el toast tras ejecutarse.
 * - Los toasts creados por `showToast()` se quitan del DOM al cerrarse
 *   (`removeOnHide`); los escritos en el HTML solo se ocultan.
 *
 * Uso:
 *   import { showToast, initToasts } from './toast.js';
 *   showToast('Cambios guardados', { variant: 'success' });
 *   showToast('Archivo eliminado', {
 *     action: { label: 'Deshacer', onClick: () => restaurar() },
 *   });
 *   // Toasts escritos en el HTML (con [data-toast] y hidden):
 *   const [toast] = initToasts();
 *   toast.show();
 */

import { announce } from '../../utils/live-region.js';

// Refleja la tabla de alert.js (prefijo de texto oculto, cortesía del
// anuncio e icono por variante); el Toast no importa Alert para seguir
// siendo autónomo al copiar su carpeta.
const REGION_SELECTOR = '[data-toast-region], [data-toast-region-auto]';

/** ¿Se solapan dos cajas de `getBoundingClientRect()`? */
function overlaps(a, b) {
  return (
    a.width > 0 &&
    a.height > 0 &&
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

const VARIANTS = {
  info: {
    prefix: 'Información:',
    politeness: 'polite',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />',
  },
  success: {
    prefix: 'Correcto:',
    politeness: 'polite',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />',
  },
  warning: {
    prefix: 'Aviso:',
    politeness: 'assertive',
    icon: '<path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" />',
  },
  danger: {
    prefix: 'Error:',
    politeness: 'assertive',
    icon: '<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />',
  },
};

/**
 * Devuelve la región fija de toasts; la crea al final de <body> si no
 * existe o se desconectó del documento.
 * @returns {HTMLElement}
 */
function getRegion() {
  const existing = document.querySelector('[data-toast-region]');
  if (existing?.isConnected) return existing;

  const region = document.createElement('div');
  region.className = 'c-toast-region';
  region.setAttribute('data-toast-region', '');
  region.setAttribute('data-toast-region-auto', '');
  document.body.appendChild(region);
  return region;
}

/**
 * Crea una región propia justo después de `anchor`.
 * @param {HTMLElement} anchor
 * @returns {HTMLElement}
 */
function createRegionAfter(anchor) {
  const region = document.createElement('div');
  region.className = 'c-toast-region';
  region.setAttribute('data-toast-region-auto', '');
  anchor.after(region);
  return region;
}

export class Toast {
  /**
   * @param {HTMLElement} el
   * @param {{
   *   autohide?: boolean,
   *   delay?: number,
   *   returnFocus?: HTMLElement,
   *   removeOnHide?: boolean,
   * }} [options]
   */
  constructor(
    el,
    { autohide = false, delay = 5000, returnFocus, removeOnHide = false } = {}
  ) {
    if (!el) {
      throw new Error('Toast: se requiere el elemento del toast.');
    }
    this.el = el;
    this.autohide = autohide && !el.querySelector('[data-toast-action]');
    this.delay = delay;
    this.returnFocus = returnFocus;
    this.removeOnHide = removeOnHide;
    this._previousFocus = null;

    // Ocultación automática: tiempo que queda, temporizador y motivos
    // de pausa (ratón encima / foco dentro).
    this._remaining = delay;
    this._startedAt = 0;
    this._timer = null;
    this._hovered = false;
    this._focused = false;

    this._closeButton = el.querySelector('[data-toast-close]');
    this._onClose = () => this.hide();
    this._onFocusin = (event) => {
      const from = event.relatedTarget;
      if (from instanceof HTMLElement && !el.contains(from)) {
        this._previousFocus = from;
      }
      this._focused = true;
      this._pause();
    };
    this._onFocusout = (event) => {
      if (el.contains(event.relatedTarget)) return;
      this._focused = false;
      this._resume();
    };
    this._onMouseenter = () => {
      this._hovered = true;
      this._pause();
    };
    this._onMouseleave = () => {
      this._hovered = false;
      this._resume();
    };
    this._onKeydown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      this.hide();
    };
    this._onDocumentFocusin = (event) => this._avoidFocus(event.target);
    this._closeButton?.addEventListener('click', this._onClose);
    el.addEventListener('keydown', this._onKeydown);
    el.addEventListener('focusin', this._onFocusin);
    el.addEventListener('focusout', this._onFocusout);
    el.addEventListener('mouseenter', this._onMouseenter);
    el.addEventListener('mouseleave', this._onMouseleave);
  }

  /** @returns {boolean} */
  get visible() {
    return !this.el.hasAttribute('hidden');
  }

  /** Muestra el toast y anuncia su texto. No mueve el foco. */
  show() {
    if (this.visible) return;
    this.el.removeAttribute('hidden');
    announce(this._message(), { politeness: this._politeness() });
    this._remaining = this.delay;
    this._resume();
    document.addEventListener('focusin', this._onDocumentFocusin);
    this._avoidFocus(document.activeElement);
  }

  /** Oculta el toast; si tenía el foco dentro, lo devuelve. */
  hide() {
    const hadFocus = this.el.contains(document.activeElement);
    const target = hadFocus ? this._focusTarget() : null;
    const region = this.el.closest(REGION_SELECTOR);
    this._clearTimer();
    document.removeEventListener('focusin', this._onDocumentFocusin);
    this.el.setAttribute('hidden', '');
    if (this.removeOnHide) {
      this.destroy();
      this.el.remove();
      // Región creada por showToast() y ya vacía: se quita también.
      if (region?.hasAttribute('data-toast-region-auto')) {
        if (region.children.length === 0) region.remove();
      }
    }
    // Sin toasts visibles, la región vuelve a su posición por defecto.
    if (
      region?.isConnected &&
      !region.querySelector('[data-toast]:not([hidden])')
    ) {
      region.removeAttribute('data-toast-top');
    }
    target?.focus();
  }

  destroy() {
    this._clearTimer();
    document.removeEventListener('focusin', this._onDocumentFocusin);
    this._closeButton?.removeEventListener('click', this._onClose);
    this.el.removeEventListener('keydown', this._onKeydown);
    this.el.removeEventListener('focusin', this._onFocusin);
    this.el.removeEventListener('focusout', this._onFocusout);
    this.el.removeEventListener('mouseenter', this._onMouseenter);
    this.el.removeEventListener('mouseleave', this._onMouseleave);
  }

  /**
   * Si `target` (recién enfocado) queda bajo la región de toasts, la
   * región salta al borde opuesto para no taparlo (WCAG 2.2 SC 2.4.11).
   */
  _avoidFocus(target) {
    if (!(target instanceof HTMLElement) || target === document.body) return;
    if (!this.visible || this.el.contains(target)) return;
    const region = this.el.closest(REGION_SELECTOR);
    if (!region) return;
    if (
      overlaps(target.getBoundingClientRect(), region.getBoundingClientRect())
    ) {
      region.toggleAttribute('data-toast-top');
    }
  }

  _clearTimer() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  /** Arranca el temporizador si procede: autohide, visible y sin pausa. */
  _resume() {
    if (!this.autohide || !this.visible || this._hovered || this._focused) {
      return;
    }
    this._clearTimer();
    this._startedAt = Date.now();
    this._timer = setTimeout(() => this.hide(), Math.max(this._remaining, 0));
  }

  /** Detiene el temporizador y guarda el tiempo que quedaba. */
  _pause() {
    if (this._timer === null) return;
    this._clearTimer();
    this._remaining -= Date.now() - this._startedAt;
  }

  _message() {
    const body = this.el.querySelector('[data-toast-body]') ?? this.el;
    return body.textContent.replace(/\s+/g, ' ').trim();
  }

  _politeness() {
    const variant = this.el.getAttribute('data-toast-variant') ?? 'info';
    return (VARIANTS[variant] ?? VARIANTS.info).politeness;
  }

  /** @returns {HTMLElement | null} */
  _focusTarget() {
    for (const candidate of [this.returnFocus, this._previousFocus]) {
      if (candidate?.isConnected && !this.el.contains(candidate)) {
        return candidate;
      }
    }
    return null;
  }
}

/**
 * Crea un toast en la región fija, lo muestra y lo anuncia.
 * @param {string} message Texto plano (se inserta con textContent).
 * @param {{
 *   variant?: 'info' | 'success' | 'warning' | 'danger',
 *   autohide?: boolean,
 *   delay?: number,
 *   action?: { label: string, onClick?: () => void },
 *   after?: HTMLElement,
 * }} [options]
 * @returns {Toast}
 */
export function showToast(
  message,
  { variant = 'info', autohide = false, delay = 5000, action, after } = {}
) {
  const key = variant in VARIANTS ? variant : 'info';
  const { prefix, icon } = VARIANTS[key];

  const el = document.createElement('div');
  el.className = `c-toast c-toast--${key}`;
  el.setAttribute('data-toast', '');
  el.setAttribute('data-toast-variant', key);
  el.setAttribute('hidden', '');
  el.innerHTML = `
    <svg class="c-toast__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
    </svg>
    <p class="c-toast__body" data-toast-body>
      <span class="c-toast__sr-text"></span> <span class="c-toast__text"></span>
    </p>
    ${
      action
        ? '<button type="button" class="c-toast__action" data-toast-action></button>'
        : ''
    }
    <button type="button" class="c-close-button c-toast__close"
      aria-label="Cerrar notificación" data-toast-close>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  `;
  el.querySelector('.c-toast__sr-text').textContent = prefix;
  el.querySelector('.c-toast__text').textContent = message;

  (after ? createRegionAfter(after) : getRegion()).appendChild(el);
  const toast = new Toast(el, {
    autohide: autohide && !action,
    delay,
    returnFocus: after,
    removeOnHide: true,
  });

  if (action) {
    const button = el.querySelector('[data-toast-action]');
    button.textContent = action.label;
    button.addEventListener('click', () => {
      action.onClick?.();
      toast.hide();
    });
  }

  toast.show();
  return toast;
}

/**
 * Inicializa todos los toasts con [data-toast] dentro de un contenedor.
 * Lee `data-autohide` y `data-delay`. No los muestra: llama a `show()`.
 * @param {ParentNode} [root]
 * @returns {Toast[]}
 */
export function initToasts(root = document) {
  return Array.from(root.querySelectorAll('[data-toast]')).map((el) => {
    const delay = Number(el.getAttribute('data-delay'));
    return new Toast(el, {
      autohide: el.hasAttribute('data-autohide'),
      ...(delay > 0 && { delay }),
    });
  });
}
