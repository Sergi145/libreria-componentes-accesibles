/**
 * Componente: Carousel
 * Implementa el patrón WAI-ARIA APG "Carousel (Slide Show or Image
 * Rotator)", variante con pestañas para elegir diapositiva:
 * https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
 *
 * Estructura (ver carousel.html): una <section aria-roledescription=
 * "carrusel"> con una barra de controles y el contenedor de diapositivas.
 * Orden en el DOM: botón de rotación (oculto si no hay rotación
 * automática), Anterior / Siguiente y el selector `role="tablist"`, y
 * después las diapositivas (`role="tabpanel"`,
 * `aria-roledescription="diapositiva"`, `aria-label="N de M"`).
 *
 * Decisiones no obvias:
 * - Mejora progresiva: sin JS los controles están `hidden` y todas las
 *   diapositivas se ven apiladas. El JS quita `hidden` de los controles y
 *   oculta las diapositivas inactivas.
 * - El selector usa `rovingTabindex` con activación automática (enfocar
 *   una pestaña muestra su diapositiva), como Tabs. No reutiliza la clase
 *   `Tabs`: Anterior/Siguiente y la rotación necesitan un único estado.
 * - Anterior/Siguiente dan la vuelta en los extremos y NO mueven el foco.
 * - Rotación automática (WCAG 2.2.2 Pausar, detener, ocultar): solo con
 *   `data-autoplay`. El botón de rotación es el primer control del DOM.
 *   Hay dos tipos de pausa:
 *     · temporal: el ratón encima o el foco dentro del carrusel; se
 *       reanuda al salir.
 *     · permanente: el botón «Detener rotación automática»; no se reanuda
 *       solo, hace falta pulsar «Iniciar rotación automática».
 *   Pulsar «Iniciar» con el foco o el ratón dentro anula las pausas
 *   temporales: si no, el botón parecería no hacer nada.
 * - `aria-live` del contenedor: "off" mientras rota (que cada cambio no
 *   se anuncie encima de lo que el usuario lee) y "polite" cuando no rota
 *   (por cualquier motivo), para anunciar los cambios manuales.
 * - Con `prefers-reduced-motion: reduce` la rotación no arranca sola: el
 *   carrusel empieza detenido y el usuario puede iniciarla con el botón.
 *
 * Uso:
 *   import { Carousel } from './carousel.js';
 *   new Carousel(document.querySelector('[data-carousel]'));
 *   // Con rotación automática: añade data-autoplay al elemento, y
 *   // data-interval="3000" para cambiar los 5000 ms por defecto.
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';

const TAB_SELECTOR = '[role="tab"]';
const LABEL_STOP = 'Detener rotación automática';
const LABEL_START = 'Iniciar rotación automática';

export class Carousel {
  /**
   * @param {HTMLElement} el Elemento raíz con [data-carousel].
   * @param {{ interval?: number }} [options] `interval` (ms) entre
   *   diapositivas con rotación automática.
   */
  constructor(el, { interval = 5000 } = {}) {
    if (!el) {
      throw new Error('Carousel: se requiere el elemento del carrusel.');
    }
    this.el = el;
    this.interval = interval;

    this._controls = el.querySelector('[data-carousel-controls]');
    this._prev = el.querySelector('[data-carousel-prev]');
    this._next = el.querySelector('[data-carousel-next]');
    this._rotation = el.querySelector('[data-carousel-rotation]');
    this._tablist = el.querySelector('[data-carousel-tablist]');
    this._slidesBox = el.querySelector('[data-carousel-slides]');
    this.slides = Array.from(el.querySelectorAll('[data-carousel-slide]'));
    this.tabs = this._tablist
      ? Array.from(this._tablist.querySelectorAll(TAB_SELECTOR))
      : [];

    this._index = 0;

    // Rotación automática.
    this._autoplay = el.hasAttribute('data-autoplay') && !!this._rotation;
    this._timer = null;
    this._userPaused = false; // pausa permanente (botón)
    this._hovered = false; // pausa temporal: ratón encima
    this._focused = false; // pausa temporal: foco dentro

    this._decorateSlides();
    if (this._slidesBox && !this._slidesBox.hasAttribute('aria-live')) {
      this._slidesBox.setAttribute('aria-live', 'polite');
    }

    this._onPrev = () => this.prev();
    this._onNext = () => this.next();
    this._onFocusChange = (tab) => this._show(this.tabs.indexOf(tab));
    this._onRotationClick = () => (this.playing ? this.pause() : this.play());
    this._onMouseenter = () => {
      this._hovered = true;
      this._sync();
    };
    this._onMouseleave = () => {
      this._hovered = false;
      this._sync();
    };
    this._onFocusin = () => {
      this._focused = true;
      this._sync();
    };
    this._onFocusout = (event) => {
      if (el.contains(event.relatedTarget)) return;
      this._focused = false;
      this._sync();
    };

    this._prev?.addEventListener('click', this._onPrev);
    this._next?.addEventListener('click', this._onNext);
    this._destroyRoving = this._tablist
      ? rovingTabindex(this._tablist, TAB_SELECTOR, {
          onFocusChange: this._onFocusChange,
        })
      : () => {};

    // Estado inicial: respeta un aria-selected="true" ya presente en el
    // HTML; si no hay ninguno, la primera diapositiva.
    const selected = this.tabs.findIndex(
      (tab) => tab.getAttribute('aria-selected') === 'true'
    );
    this._show(selected === -1 ? 0 : selected);

    if (this._autoplay) {
      this._rotation.removeAttribute('hidden');
      this._rotation.addEventListener('click', this._onRotationClick);
      el.addEventListener('mouseenter', this._onMouseenter);
      el.addEventListener('mouseleave', this._onMouseleave);
      el.addEventListener('focusin', this._onFocusin);
      el.addEventListener('focusout', this._onFocusout);
      // Movimiento reducido: no arranca sola.
      this._userPaused =
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
        false;
    }
    this._sync();

    // Los controles solo tienen sentido con JS: se muestran ahora.
    this._controls?.removeAttribute('hidden');
  }

  /** @returns {number} Índice de la diapositiva visible. */
  get index() {
    return this._index;
  }

  /**
   * ¿La rotación automática está activada (no detenida con el botón)?
   * Es `true` aunque esté en pausa temporal por foco o ratón.
   * @returns {boolean}
   */
  get playing() {
    return this._autoplay && !this._userPaused;
  }

  /**
   * Muestra la diapositiva `index` (da la vuelta si se sale del rango).
   * @param {number} index
   */
  goTo(index) {
    const count = this.slides.length;
    if (count === 0) return;
    this._show(((index % count) + count) % count);
  }

  next() {
    this.goTo(this._index + 1);
  }

  prev() {
    this.goTo(this._index - 1);
  }

  /**
   * Inicia la rotación automática. Anula las pausas temporales: se ha
   * pedido de forma explícita.
   */
  play() {
    if (!this._autoplay) return;
    this._userPaused = false;
    this._hovered = false;
    this._focused = false;
    this._sync();
  }

  /** Detiene la rotación de forma permanente hasta llamar a `play()`. */
  pause() {
    if (!this._autoplay) return;
    this._userPaused = true;
    this._sync();
  }

  destroy() {
    this._clearTimer();
    this._prev?.removeEventListener('click', this._onPrev);
    this._next?.removeEventListener('click', this._onNext);
    this._rotation?.removeEventListener('click', this._onRotationClick);
    this.el.removeEventListener('mouseenter', this._onMouseenter);
    this.el.removeEventListener('mouseleave', this._onMouseleave);
    this.el.removeEventListener('focusin', this._onFocusin);
    this.el.removeEventListener('focusout', this._onFocusout);
    this._destroyRoving();
  }

  /** Rellena role, aria-roledescription y aria-label si el HTML no los trae. */
  _decorateSlides() {
    const total = this.slides.length;
    this.slides.forEach((slide, i) => {
      if (!slide.hasAttribute('role')) slide.setAttribute('role', 'tabpanel');
      if (!slide.hasAttribute('aria-roledescription')) {
        slide.setAttribute('aria-roledescription', 'diapositiva');
      }
      if (!slide.hasAttribute('aria-label')) {
        slide.setAttribute('aria-label', `${i + 1} de ${total}`);
      }
    });
  }

  _show(index) {
    if (index < 0 || index >= this.slides.length) return;
    this._index = index;
    this.slides.forEach((slide, i) => {
      slide.toggleAttribute('hidden', i !== index);
    });
    this.tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
    });
  }

  _clearTimer() {
    clearInterval(this._timer);
    this._timer = null;
  }

  /**
   * Alinea el temporizador, el aria-live y el botón de rotación con el
   * estado: gira solo si está activada y sin pausa temporal.
   */
  _sync() {
    const rotating =
      this.playing &&
      !this._hovered &&
      !this._focused &&
      this.slides.length > 1;

    if (rotating && this._timer === null) {
      this._timer = setInterval(() => this.next(), this.interval);
    } else if (!rotating) {
      this._clearTimer();
    }

    if (this._slidesBox && this._autoplay) {
      this._slidesBox.setAttribute('aria-live', rotating ? 'off' : 'polite');
    }
    if (this._autoplay) {
      this._rotation.setAttribute(
        'aria-label',
        this.playing ? LABEL_STOP : LABEL_START
      );
      this._rotation.setAttribute('data-playing', String(this.playing));
    }
  }
}

/**
 * Inicializa todos los carruseles con [data-carousel] dentro de un
 * contenedor. Lee `data-interval` y `data-autoplay`.
 * @param {ParentNode} [root]
 * @returns {Carousel[]}
 */
export function initCarousels(root = document) {
  return Array.from(root.querySelectorAll('[data-carousel]')).map((el) => {
    const interval = Number(el.getAttribute('data-interval'));
    return new Carousel(el, interval > 0 ? { interval } : {});
  });
}
