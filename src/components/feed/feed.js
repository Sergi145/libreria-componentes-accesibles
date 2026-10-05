/**
 * Componente: Feed (flujo de artículos)
 * Una <section> que el JS convierte en role="feed".
 * Implementa el patrón WAI-ARIA APG "Feed":
 * https://www.w3.org/WAI/ARIA/apg/patterns/feed/
 *
 * Teclado:
 *  - AvPág/RePág: siguiente/anterior artículo
 *  - Ctrl+Fin: salir del feed (foco al primer elemento enfocable después)
 *  - Ctrl+Inicio: salir del feed (foco al último elemento enfocable antes)
 *
 * Carga infinita (opcional):
 *  - Si loadMore callback: IntersectionObserver carga cuando se alcanza el final
 *  - aria-busy="true" durante carga, "false" cuando termina
 *  - Mensaje de error con botón Reintentar si la carga falla
 *  - Mensaje "No hay más artículos" cuando se alcanza el fin
 *
 * Decisiones no obvias:
 * - Cada estado (cargando, nuevos, error, fin) se anuncia con `announce()`
 *   de `src/utils/live-region.js`: el texto visible no lo lee el lector.
 * - El estado de carga es un único <p> que se actualiza, no se recrea. El
 *   botón Reintentar se conserva durante la carga (`aria-disabled`) para que
 *   el foco no caiga al <body> al pulsarlo.
 * - Si el foco estaba en el botón y la carga termina, pasa al primer
 *   artículo nuevo (o al último si no llegaron).
 * - <article> ya tiene role="article" implícito: no se añade `role`.
 * - tabindex="0" en cada artículo y ninguno en la sección: cada artículo es
 *   una parada de Tab (como en el ejemplo de APG) y la sección no se enfoca sola.
 * - Cada artículo se nombra con aria-labelledby (su encabezado) y se describe
 *   con aria-describedby (su primer párrafo). Si faltan ids, se generan y
 *   `destroy()` los quita.
 *
 * Uso:
 *   import { Feed, initFeeds } from './feed.js';
 *   new Feed(document.querySelector('[data-feed]'), {
 *     loadMore: async () => { ... } // opcional
 *   });
 */

import { announce, initLiveRegions } from '../../utils/live-region.js';

const MENSAJES = {
  cargando: 'Cargando más artículos…',
  error: 'No se pudieron cargar más artículos',
  fin: 'No hay más artículos',
};

const ATRIBUTOS_ARTICULO = [
  'tabindex',
  'aria-posinset',
  'aria-setsize',
  'aria-labelledby',
  'aria-describedby',
];

const SELECTOR_ENFOCABLE =
  'a[href], button, input, select, textarea, [tabindex], [role="button"]';

let contadorIds = 0;

export class Feed {
  /** @param {HTMLElement} el [data-feed] sobre <section> */
  constructor(el, { loadMore } = {}) {
    if (!el || (el.tagName !== 'SECTION' && !el.hasAttribute('data-feed'))) {
      throw new Error('Feed: se requiere un elemento <section>[data-feed].');
    }
    this.el = el;
    this.loadMore = loadMore;
    this._listeners = [];
    this._initialState = [];
    this._isLoading = false;
    this._isFinished = false;
    this._observer = null;
    this._statusEl = null;
    this._statusText = null;
    this._retryButton = null;
    this._idsGenerados = [];

    initLiveRegions();

    // Poner role="feed" y aria-busy
    el.setAttribute('role', 'feed');
    el.setAttribute('aria-busy', 'false');

    // Procesar artículos
    this._updateArticles();

    // Listeners de teclado
    const onKeydown = (event) => this._onKeydown(event);
    el.addEventListener('keydown', onKeydown);
    this._listeners.push({ target: el, listener: onKeydown, type: 'keydown' });

    // El enlace «Cargar más» vive fuera del feed (role="feed" solo admite artículos)
    this._moreLink = el.parentElement?.querySelector('[data-feed-more]');

    if (this.loadMore) {
      if (this._moreLink) this._moreLink.hidden = true;
      this._setupIntersectionObserver();
    }
  }

  _updateArticles() {
    const articles = Array.from(this.el.querySelectorAll('article'));
    const total = articles.length;

    articles.forEach((article, index) => {
      if (!this._initialState.some((s) => s.el === article)) {
        this._initialState.push({
          el: article,
          attrs: Object.fromEntries(
            ATRIBUTOS_ARTICULO.map((nombre) => [
              nombre,
              article.getAttribute(nombre),
            ])
          ),
        });
      }

      article.setAttribute('tabindex', '0');
      article.setAttribute('aria-posinset', String(index + 1));
      article.setAttribute('aria-setsize', String(total));
      this._nombrarArticulo(article);
    });
  }

  _nombrarArticulo(article) {
    const titulo = article.querySelector('h1, h2, h3, h4, h5, h6');
    if (titulo) {
      article.setAttribute(
        'aria-labelledby',
        this._asegurarId(titulo, 'feed-titulo')
      );
    }

    const resumen = article.querySelector('p');
    if (resumen) {
      article.setAttribute(
        'aria-describedby',
        this._asegurarId(resumen, 'feed-resumen')
      );
    }
  }

  _asegurarId(el, prefijo) {
    if (!el.id) {
      el.id = `${prefijo}-${++contadorIds}`;
      this._idsGenerados.push(el);
    }
    return el.id;
  }

  _setupIntersectionObserver() {
    // Verificar disponibilidad de IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const articles = Array.from(this.el.querySelectorAll('article'));
    if (articles.length === 0) return;

    const lastArticle = articles[articles.length - 1];

    this._observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this._isLoading && !this._isFinished) {
            this._load();
          }
        });
      },
      { rootMargin: '100px' }
    );

    this._observer.observe(lastArticle);
  }

  async _load() {
    if (this._isLoading || this._isFinished || !this.loadMore) return;

    this._isLoading = true;
    this.el.setAttribute('aria-busy', 'true');
    this._setStatus(MENSAJES.cargando, {
      retry: this._retryButton !== null,
      retryDisabled: true,
    });
    announce(MENSAJES.cargando);

    try {
      const newArticles = await this.loadMore();

      const articlesBefore = this._getArticles().length;
      const hadFocus =
        this._statusEl?.contains(document.activeElement) ?? false;

      if (!newArticles || newArticles.length === 0) {
        this._isFinished = true;
        this._setStatus(MENSAJES.fin);
        this._updateArticles();
        this._observer?.disconnect();
        announce(MENSAJES.fin);
      } else {
        newArticles.forEach((articleData) => {
          const article = document.createElement('article');
          const title = document.createElement('h3');
          title.textContent = articleData.title;
          const description = document.createElement('p');
          description.textContent = articleData.description;
          article.append(title, description);
          this.el.appendChild(article);
        });

        // Actualizar aria-posinset y aria-setsize
        this._updateArticles();
        this._setStatus(null);

        // Continuar observando el nuevo último artículo
        if (this._observer) {
          const articles = this._getArticles();
          this._observer.observe(articles[articles.length - 1]);
        }

        const n = newArticles.length;
        announce(n === 1 ? '1 artículo nuevo' : `${n} artículos nuevos`);
      }

      if (hadFocus) this._focusArticle(articlesBefore);
    } catch {
      this._setStatus(MENSAJES.error, { retry: true });
      announce(MENSAJES.error);
    } finally {
      this._isLoading = false;
      this.el.setAttribute('aria-busy', 'false');
    }
  }

  _focusArticle(index) {
    const articles = this._getArticles();
    (articles[index] ?? articles[articles.length - 1])?.focus();
  }

  // role="feed" solo admite artículos como hijos: el estado va justo después.
  _setStatus(text, { retry = false, retryDisabled = false } = {}) {
    if (!text) {
      this._statusEl?.remove();
      this._statusEl = null;
      this._statusText = null;
      this._retryButton = null;
      return;
    }

    if (!this._statusEl) {
      this._statusEl = document.createElement('p');
      this._statusEl.className = 'c-feed__status';
      this._statusText = document.createElement('span');
      this._statusEl.append(this._statusText);
      this.el.after(this._statusEl);
    }
    this._statusText.textContent = text;

    if (retry && !this._retryButton) {
      this._retryButton = document.createElement('button');
      this._retryButton.type = 'button';
      this._retryButton.textContent = 'Reintentar';
      this._retryButton.addEventListener('click', () => this._load());
      this._statusEl.append(this._retryButton);
    }
    if (!retry && this._retryButton) {
      this._retryButton.remove();
      this._retryButton = null;
    }
    if (this._retryButton) {
      this._retryButton.setAttribute('aria-disabled', String(retryDisabled));
    }
  }

  _getArticles() {
    return Array.from(this.el.querySelectorAll('article'));
  }

  // Primer (`despues`) o último (`antes`) elemento enfocable del documento fuera del feed.
  _elementoEnfocableFueraDelFeed(direccion) {
    const posicion =
      direccion === 'despues'
        ? Node.DOCUMENT_POSITION_FOLLOWING
        : Node.DOCUMENT_POSITION_PRECEDING;

    const candidatos = Array.from(
      document.querySelectorAll(SELECTOR_ENFOCABLE)
    ).filter(
      (el) =>
        el.tabIndex >= 0 &&
        !el.disabled &&
        !el.closest('[hidden]') &&
        !this.el.contains(el) &&
        !el.contains(this.el) &&
        this.el.compareDocumentPosition(el) & posicion
    );

    return direccion === 'despues'
      ? candidatos[0]
      : candidatos[candidatos.length - 1];
  }

  _onKeydown(event) {
    const { key } = event;
    const articles = this._getArticles();
    const currentArticle = document.activeElement;

    // PageDown: siguiente artículo
    if (key === 'PageDown') {
      event.preventDefault();
      const currentIndex = articles.indexOf(currentArticle);
      if (currentIndex !== -1 && currentIndex < articles.length - 1) {
        articles[currentIndex + 1].focus();
        // Si es el último artículo y hay loadMore, cargar más
        if (
          currentIndex + 1 === articles.length - 1 &&
          this.loadMore &&
          !this._isFinished
        ) {
          this._load();
        }
      }
      return;
    }

    // PageUp: artículo anterior
    if (key === 'PageUp') {
      event.preventDefault();
      const currentIndex = articles.indexOf(currentArticle);
      if (currentIndex > 0) {
        articles[currentIndex - 1].focus();
      }
      return;
    }

    // Ctrl+End: salir del feed (hacia adelante)
    if (key === 'End' && event.ctrlKey) {
      event.preventDefault();
      this._elementoEnfocableFueraDelFeed('despues')?.focus();
      return;
    }

    // Ctrl+Home: salir del feed (hacia atrás)
    if (key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      this._elementoEnfocableFueraDelFeed('antes')?.focus();
      return;
    }
  }

  destroy() {
    // Desconectar observer
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    // Quitar listeners
    this._listeners.forEach(({ target, listener, type }) => {
      target.removeEventListener(type, listener);
    });
    this._listeners = [];

    this._setStatus(null);
    if (this._moreLink) this._moreLink.hidden = false;

    // Quitar role="feed"
    this.el.removeAttribute('role');
    this.el.removeAttribute('aria-busy');

    this._initialState.forEach(({ el: article, attrs }) => {
      for (const [nombre, valor] of Object.entries(attrs)) {
        if (valor === null) article.removeAttribute(nombre);
        else article.setAttribute(nombre, valor);
      }
    });
    this._initialState = [];

    this._idsGenerados.forEach((el) => el.removeAttribute('id'));
    this._idsGenerados = [];
  }
}

/**
 * Inicializa todas las [data-feed] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @param {Object} [options] - opciones por defecto para todos los feeds
 * @returns {Feed[]}
 */
export function initFeeds(root = document, options = {}) {
  return Array.from(root.querySelectorAll('[data-feed]')).map(
    (el) => new Feed(el, options)
  );
}
