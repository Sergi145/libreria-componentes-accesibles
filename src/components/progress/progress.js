/**
 * Componente: Progress
 * Envoltorio JS opcional sobre el `<progress>` nativo. Sin patrón APG
 * propio: el elemento nativo ya expone rol `progressbar`, valor y máximo
 * a los lectores de pantalla ("no ARIA is better than bad ARIA"). El CSS
 * solo lo estila; este JS solo acota el valor y avisa al terminar.
 *
 * Decisiones no obvias:
 * - No se anuncia cada cambio de valor: un lector que repite «10 %, 20 %,
 *   30 %…» es ruido. Solo se anuncia `completeMessage` UNA vez al llegar a
 *   `max`, por la región viva de `live-region.js`. Si el valor baja de
 *   `max` y vuelve a llegar, se anuncia de nuevo.
 * - El anuncio de «Completado» se retrasa `COMPLETE_DELAY` ms tras llegar
 *   a `max`. Lectores como NVDA anuncian por su cuenta el último valor
 *   del `<progress>` («100 %») y ese habla puede pisar una región viva
 *   que se escribe en el mismo instante. Si el valor baja de `max` antes
 *   de que se cumpla el plazo, el anuncio se cancela.
 * - El constructor crea las regiones vivas (`initLiveRegions()`): una
 *   región creada justo al anunciar, en la misma página, suele no
 *   anunciarse la primera vez.
 * - Si el `<progress>` ya está completo al inicializarlo, no se anuncia
 *   nada: no es un cambio.
 * - Sin atributo `value` el progreso es indeterminado. Asignar `value`
 *   lo convierte en determinado.
 * - Un valor no numérico se ignora.
 *
 * Uso:
 *   import { Progress } from './progress.js';
 *   const progress = new Progress(document.querySelector('[data-progress]'), {
 *     completeMessage: 'Subida completada',
 *   });
 *   progress.value = 60;
 */

import { announce, initLiveRegions } from '../../utils/live-region.js';

/** Espera (ms) entre llegar a `max` y anunciar `completeMessage`. */
export const COMPLETE_DELAY = 1000;

export class Progress {
  /**
   * @param {HTMLProgressElement} el
   * @param {{ completeMessage?: string }} [options]
   */
  constructor(el, { completeMessage = 'Completado' } = {}) {
    if (!el || el.tagName !== 'PROGRESS') {
      throw new Error('Progress: se requiere un elemento <progress>.');
    }
    this.el = el;
    this.completeMessage = completeMessage;
    this._destroyed = false;
    this._timer = null;
    initLiveRegions();
    // Ya completo al empezar: no hay cambio que anunciar.
    this._announced = el.hasAttribute('value') && el.value >= el.max;
  }

  /** @returns {number} */
  get value() {
    return this.el.value;
  }

  /** Acota el valor entre 0 y `max`; anuncia al llegar a `max`. */
  set value(v) {
    const number = Number(v);
    if (!Number.isFinite(number)) return;

    const clamped = Math.min(Math.max(number, 0), this.el.max);
    this.el.value = clamped;

    if (clamped < this.el.max) {
      this._announced = false;
      this._clearTimer();
    } else if (!this._announced) {
      this._announced = true;
      if (!this._destroyed) {
        this._timer = setTimeout(() => {
          this._timer = null;
          announce(this.completeMessage, { politeness: 'polite' });
        }, COMPLETE_DELAY);
      }
    }
  }

  /** Deja de anunciar. El `<progress>` sigue funcionando. */
  destroy() {
    this._destroyed = true;
    this._clearTimer();
  }

  _clearTimer() {
    clearTimeout(this._timer);
    this._timer = null;
  }
}

/**
 * Inicializa todos los <progress> con [data-progress] dentro de un
 * contenedor. Lee `data-complete-message`.
 * @param {ParentNode} [root]
 * @returns {Progress[]}
 */
export function initProgress(root = document) {
  return Array.from(root.querySelectorAll('[data-progress]')).map((el) => {
    const completeMessage = el.getAttribute('data-complete-message');
    return new Progress(el, completeMessage ? { completeMessage } : {});
  });
}
