/**
 * Componente: Scrollspy
 * Marca en una tabla de contenidos la sección que se está leyendo. Sin
 * patrón APG propio: es un <nav> de enlaces internos cuyo enlace activo
 * lleva `aria-current="true"` (WAI-ARIA 1.2, valor de `aria-current`).
 *
 * Decisiones no obvias:
 * - Usa `IntersectionObserver`, no el evento `scroll`: sin listeners
 *   síncronos en cada desplazamiento y sin calcular posiciones a mano.
 * - Nunca mueve el foco ni anuncia nada: es una indicación visual y
 *   semántica del contexto, no una notificación. No hay `aria-live`.
 * - El enlace activo es el de la PRIMERA sección visible en el orden de
 *   los enlaces. «Visible» es «cualquier parte dentro de la zona
 *   observada», y esa zona es una BANDA fina, una línea de referencia al
 *   20 % desde arriba (`rootMargin = '-20% 0px -79% 0px'`): solo la
 *   sección que cruza esa línea es la actual. Una zona más ancha (p. ej.
 *   el 40 % superior) fallaba al pulsar un enlace: con `scroll-margin`
 *   asoma una franja de la sección anterior dentro de la zona y, al ganar
 *   la primera, se quedaba resaltada la sección equivocada.
 * - El observador usa como `root` el documento del propio <nav>. Sin
 *   `root`, dentro de un <iframe> el viewport de referencia es el de la
 *   ventana SUPERIOR y la línea del 20 % puede caer fuera del iframe (no
 *   se activaría ningún enlace). Los navegadores que no admiten un
 *   Document como `root` usan el valor por defecto.
 * - La última sección tiene que ser lo bastante alta (o tener espacio
 *   debajo) para que su parte superior llegue a la línea de referencia; si
 *   la página se acaba antes, su enlace nunca se activa.
 * - Si ninguna sección está en la zona (entre dos secciones), se conserva
 *   el último enlace activo: la tabla de contenidos no se queda en blanco.
 * - Solo hay un `aria-current="true"` a la vez.
 * - Sin `IntersectionObserver` (navegadores muy antiguos) no hace nada:
 *   los enlaces siguen funcionando, solo que sin resaltado.
 *
 * Uso:
 *   import { Scrollspy } from './scrollspy.js';
 *   new Scrollspy(document.querySelector('[data-scrollspy]'));
 *   // o con otra zona de observación:
 *   new Scrollspy(nav, { rootMargin: '-80px 0px -50% 0px' });
 *   // o dentro de un contenedor con scroll propio:
 *   new Scrollspy(nav, { root: document.querySelector('.panel') });
 */

export class Scrollspy {
  /**
   * @param {HTMLElement} nav Elemento <nav> con enlaces `href="#id"`.
   * @param {{ rootMargin?: string, root?: Element | Document }} [options]
   *   `root`: contenedor con scroll propio; por defecto, el documento del
   *   `<nav>`.
   */
  constructor(nav, { rootMargin = '-20% 0px -79% 0px', root } = {}) {
    if (!nav) {
      throw new Error('Scrollspy: se requiere el elemento <nav>.');
    }
    this.nav = nav;
    this.rootMargin = rootMargin;

    // Solo los enlaces cuyo destino existe, en el orden de la lista.
    this._items = Array.from(nav.querySelectorAll('a[href^="#"]'))
      .map((link) => ({
        link,
        section: document.getElementById(
          decodeURIComponent(link.getAttribute('href').slice(1))
        ),
      }))
      .filter((item) => item.section);

    this._visible = new Set();
    this._observer = null;

    if (typeof IntersectionObserver === 'undefined') return;

    const onIntersect = (entries) => this._onIntersect(entries);
    const base = { rootMargin, threshold: 0 };
    try {
      this._observer = new IntersectionObserver(onIntersect, {
        ...base,
        root: root ?? nav.ownerDocument,
      });
    } catch {
      // Navegadores que no admiten un Document como root.
      this._observer = new IntersectionObserver(onIntersect, base);
    }
    this._items.forEach(({ section }) => this._observer.observe(section));
  }

  /** @returns {HTMLAnchorElement | null} Enlace con aria-current="true". */
  get active() {
    return (
      this._items.find(
        ({ link }) => link.getAttribute('aria-current') === 'true'
      )?.link ?? null
    );
  }

  destroy() {
    this._observer?.disconnect();
    this._observer = null;
    this._visible.clear();
  }

  _onIntersect(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) this._visible.add(entry.target);
      else this._visible.delete(entry.target);
    }
    const first = this._items.find(({ section }) => this._visible.has(section));
    // Entre dos secciones no hay ninguna visible: se conserva la anterior.
    if (first) this._setActive(first.link);
  }

  _setActive(active) {
    for (const { link } of this._items) {
      if (link === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }
}

/**
 * Inicializa todos los <nav> con [data-scrollspy] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Scrollspy[]}
 */
export function initScrollspies(root = document) {
  return Array.from(root.querySelectorAll('[data-scrollspy]')).map(
    (nav) => new Scrollspy(nav)
  );
}
