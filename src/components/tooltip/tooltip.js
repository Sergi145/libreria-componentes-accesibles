/**
 * Componente: Tooltip
 * Implementa el patrón WAI-ARIA APG "Tooltip":
 * https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 * Información breve que aparece al enfocar o al pasar el ratón por un
 * disparador. Nunca recibe el foco y no debe contener elementos
 * enfocables. El marcado va en el HTML (no lo genera este módulo): un
 * envoltorio `.c-tooltip` con el disparador y, justo después,
 * `<span role="tooltip">`. El disparador enlaza con ese `<span>`
 * por `aria-describedby` (texto complementario) o por
 * `aria-labelledby` (el propio nombre accesible del disparador, para
 * un botón solo icono — ver «Sin doble lectura» más abajo).
 *
 * Comportamiento:
 *  - Al enfocar el disparador se muestra al momento; al perder el foco
 *    se oculta.
 *  - Al pasar el ratón se muestra tras `delay` ms (evita parpadeos al
 *    cruzar la página); el ratón puede moverse del disparador al propio
 *    tooltip sin que se oculte (WCAG 1.4.13: hoverable), porque el
 *    listener escucha en el envoltorio completo, no en el disparador.
 *  - Colocación automática: al mostrarse, si el lado pedido (abajo por
 *    defecto, o el modificador --top/--start/--end) queda cortado por
 *    el viewport o por un contenedor con overflow, prueba los demás
 *    (`placeFloating`). No recoloca al hacer scroll o redimensionar.
 *  - Escape lo oculta sin mover el foco (WCAG 1.4.13: descartable), vía
 *    la utilidad `dismissable` — solo mientras está visible, así Escape
 *    no interfiere con nada más el resto del tiempo.
 *  - Sin doble lectura: en vez del truco de la ficha (duplicar el
 *    texto en `aria-label` y quitar `aria-describedby` por JS si
 *    coincide con el del tooltip), un botón solo icono usa
 *    `aria-labelledby` apuntando directo al `<span role="tooltip">`:
 *    una sola fuente del texto, sin comparar cadenas en tiempo de
 *    ejecución.
 *  - Siempre presente en el árbol de accesibilidad: el <span
 *    role="tooltip"> NO usa `hidden`. Se oculta solo visualmente por
 *    CSS y se muestra con `data-visible`. Con `hidden` (display:none)
 *    que se quita en el mismo evento de foco, NVDA leía el disparador
 *    antes de que el navegador actualizase la descripción y no
 *    anunciaba el tooltip al tabular. Así la descripción (o el nombre,
 *    con aria-labelledby) ya existe cuando el disparador recibe el foco.
 *
 * Uso:
 *   import { Tooltip } from './tooltip.js';
 *   new Tooltip(document.querySelector('[data-tooltip]'));
 */

import { dismissable } from '../../utils/dismiss.js';
import { placeFloating } from '../../utils/placement.js';

const SIDE_CLASSES = ['top', 'start', 'end'];

export class Tooltip {
  /**
   * @param {HTMLElement} trigger
   * @param {{ delay?: number }} [options]
   */
  constructor(trigger, { delay = 300 } = {}) {
    if (!trigger) {
      throw new Error('Tooltip: se requiere un elemento disparador.');
    }
    this.trigger = trigger;
    this.delay = delay;

    this.wrapper = trigger.closest('.c-tooltip');
    if (!this.wrapper) {
      throw new Error(
        'Tooltip: el disparador debe estar dentro de un envoltorio .c-tooltip.'
      );
    }

    // Busca la burbuja dentro del envoltorio, no con
    // document.getElementById(): el trigger puede construirse antes de
    // insertar el envoltorio en el documento (p. ej. en las historias
    // de Storybook), y en ese momento el id todavía no es alcanzable
    // desde `document`. aria-describedby (texto complementario) o
    // aria-labelledby (nombre accesible del disparador, sin doble
    // lectura — ver la cabecera del archivo).
    const bubbleId =
      trigger.getAttribute('aria-describedby') ??
      trigger.getAttribute('aria-labelledby');
    this.bubble = Array.from(
      this.wrapper.querySelectorAll('[role="tooltip"]')
    ).find((el) => el.id === bubbleId);
    if (!this.bubble) {
      throw new Error(
        'Tooltip: el disparador necesita aria-describedby o aria-labelledby apuntando a un elemento role="tooltip" dentro del mismo .c-tooltip.'
      );
    }

    // Lado que el autor pidió con el modificador CSS (abajo por defecto):
    // es el preferido al colocar automáticamente.
    this._preferred =
      SIDE_CLASSES.find((side) =>
        this.bubble.classList.contains(`c-tooltip__bubble--${side}`)
      ) ?? 'bottom';

    this._visible = false;
    this._showTimer = null;
    this._dismissDestroy = null;

    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);

    this.wrapper.addEventListener('mouseenter', this._onMouseEnter);
    this.wrapper.addEventListener('mouseleave', this._onMouseLeave);
    this.trigger.addEventListener('focus', this._onFocus);
    this.trigger.addEventListener('blur', this._onBlur);
  }

  /** @returns {boolean} */
  get visible() {
    return this._visible;
  }

  show() {
    this._clearTimer();
    if (this._visible) return;
    this._visible = true;
    this.bubble.setAttribute('data-visible', '');
    this._place();
    this._dismissDestroy = dismissable(this.bubble, {
      trigger: this.trigger,
      // Solo Escape: el ratón y el foco ya los gestiona este propio
      // componente (hoverable, oculta al salir/perder el foco).
      outside: false,
      onDismiss: () => this.hide(),
    });
  }

  hide() {
    this._clearTimer();
    if (!this._visible) return;
    this._visible = false;
    this.bubble.removeAttribute('data-visible');
    this._dismissDestroy?.();
    this._dismissDestroy = null;
  }

  destroy() {
    this._clearTimer();
    this._dismissDestroy?.();
    this.wrapper.removeEventListener('mouseenter', this._onMouseEnter);
    this.wrapper.removeEventListener('mouseleave', this._onMouseLeave);
    this.trigger.removeEventListener('focus', this._onFocus);
    this.trigger.removeEventListener('blur', this._onBlur);
  }

  // Colocación automática: si el lado pedido queda cortado por el
  // viewport o por un contenedor con overflow, prueba los demás. Solo
  // cambia los modificadores de posición; el CSS sigue mandando.
  _place() {
    placeFloating(this.bubble, {
      preferred: this._preferred,
      apply: (side) => {
        SIDE_CLASSES.forEach((name) =>
          this.bubble.classList.toggle(
            `c-tooltip__bubble--${name}`,
            name === side
          )
        );
        this.bubble.setAttribute('data-placement', side);
      },
    });
  }

  _clearTimer() {
    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
  }

  _onMouseEnter() {
    this._clearTimer();
    this._showTimer = setTimeout(() => this.show(), this.delay);
  }

  _onMouseLeave() {
    this._clearTimer();
    // Si el disparador tiene el foco, lo sigue mostrando: solo perder
    // el foco (_onBlur) lo oculta en ese caso.
    if (document.activeElement !== this.trigger) this.hide();
  }

  _onFocus() {
    this.show();
  }

  _onBlur() {
    this.hide();
  }
}

/**
 * Inicializa todos los disparadores con [data-tooltip] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @param {{ delay?: number }} [options]
 * @returns {Tooltip[]}
 */
export function initTooltips(root = document, options = {}) {
  return Array.from(root.querySelectorAll('[data-tooltip]')).map(
    (trigger) => new Tooltip(trigger, options)
  );
}
