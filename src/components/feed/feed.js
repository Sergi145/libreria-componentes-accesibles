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
 * Uso:
 *   import { Feed, initFeeds } from './feed.js';
 *   new Feed(document.querySelector('[data-feed]'), {
 *     loadMore: async () => { ... } // opcional
 *   });
 */

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

    // Poner role="feed" y aria-busy
    el.setAttribute('role', 'feed');
    el.setAttribute('aria-busy', 'false');
    el.setAttribute('tabindex', '0');

    // Procesar artículos
    this._updateArticles();

    // Listeners de teclado
    const onKeydown = (event) => this._onKeydown(event);
    el.addEventListener('keydown', onKeydown);
    this._listeners.push({ target: el, listener: onKeydown, type: 'keydown' });

    // El enlace «Cargar más» vive fuera del feed (role="feed" solo admite artículos)
    this._moreLink = el.parentElement?.querySelector('[data-feed-more]');
    this._statusEl = null;

    if (this.loadMore) {
      if (this._moreLink) this._moreLink.hidden = true;
      this._setupIntersectionObserver();
    }
  }

  _updateArticles() {
    const articles = Array.from(this.el.querySelectorAll('article'));
    const total = articles.length;

    articles.forEach((article, index) => {
      // Guardar estado inicial
      if (!this._initialState.some((s) => s.el === article)) {
        this._initialState.push({
          el: article,
          hadRole: article.hasAttribute('role'),
          hadTabindex: article.hasAttribute('tabindex'),
          hadAriaPosinset: article.hasAttribute('aria-posinset'),
          hadAriaSetsize: article.hasAttribute('aria-setsize'),
        });
      }

      // Agregar atributos ARIA
      article.setAttribute('role', 'article');
      article.setAttribute('tabindex', '-1');
      article.setAttribute('aria-posinset', String(index + 1));
      article.setAttribute('aria-setsize', String(total));
    });
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

    try {
      this._showStatus(this._createStatusElement('Cargando más artículos…'));

      const newArticles = await this.loadMore();

      this._showStatus(null);

      if (!newArticles || newArticles.length === 0) {
        // Fin de la carga
        this._isFinished = true;
        this._showStatus(this._createStatusElement('No hay más artículos'));

        // Actualizar aria-setsize en todos los artículos
        const allArticles = Array.from(this.el.querySelectorAll('article'));
        allArticles.forEach((article) => {
          article.setAttribute('aria-setsize', String(allArticles.length));
        });

        // Desconectar observer
        if (this._observer) {
          this._observer.disconnect();
        }
      } else {
        // Agregar nuevos artículos
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

        // Continuar observando el nuevo último artículo
        if (this._observer) {
          const lastArticle = Array.from(this.el.querySelectorAll('article'))[
            Array.from(this.el.querySelectorAll('article')).length - 1
          ];
          this._observer.observe(lastArticle);
        }
      }
    } catch (error) {
      // Error en la carga
      this._showStatus(
        this._createStatusElement('No se pudieron cargar más artículos', true)
      );

      // Anunciar error
      this._announce('No se pudieron cargar más artículos');
    } finally {
      this._isLoading = false;
      this.el.setAttribute('aria-busy', 'false');
    }
  }

  // role="feed" solo admite artículos como hijos: el estado va justo después.
  _showStatus(statusEl) {
    this._statusEl?.remove();
    this._statusEl = statusEl;
    if (statusEl) this.el.after(statusEl);
  }

  _createStatusElement(text, withRetry = false) {
    const p = document.createElement('p');
    p.className = 'c-feed__status';
    p.textContent = text;

    if (withRetry) {
      const button = document.createElement('button');
      button.textContent = 'Reintentar';
      button.onclick = () => {
        p.remove();
        this._load();
      };
      p.appendChild(button);
    }

    return p;
  }

  _announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  }

  _getArticles() {
    return Array.from(this.el.querySelectorAll('article'));
  }

  _getFocusableElementAfter() {
    const next = this.el.nextElementSibling;
    if (!next) return null;

    const focusable = next.querySelector(
      'button, a, input, [tabindex="0"], [role="button"]'
    );
    return focusable || next;
  }

  _getFocusableElementBefore() {
    const prev = this.el.previousElementSibling;
    if (!prev) return null;

    const focusables = Array.from(
      prev.querySelectorAll('button, a, input, [tabindex="0"], [role="button"]')
    );
    return focusables[focusables.length - 1] || prev;
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
      const next = this._getFocusableElementAfter();
      if (next) next.focus();
      return;
    }

    // Ctrl+Home: salir del feed (hacia atrás)
    if (key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      const prev = this._getFocusableElementBefore();
      if (prev) prev.focus();
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

    this._showStatus(null);
    if (this._moreLink) this._moreLink.hidden = false;

    // Quitar role="feed"
    this.el.removeAttribute('role');
    this.el.removeAttribute('aria-busy');
    this.el.removeAttribute('tabindex');

    // Restaurar artículos al estado inicial
    this._initialState.forEach(
      ({
        el: article,
        hadRole,
        hadTabindex,
        hadAriaPosinset,
        hadAriaSetsize,
      }) => {
        if (!hadRole) article.removeAttribute('role');
        if (!hadTabindex) article.removeAttribute('tabindex');
        if (!hadAriaPosinset) article.removeAttribute('aria-posinset');
        if (!hadAriaSetsize) article.removeAttribute('aria-setsize');
      }
    );
    this._initialState = [];
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
