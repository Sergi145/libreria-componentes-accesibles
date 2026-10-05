import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Feed, initFeeds } from './feed.js';

function buildMarkup() {
  document.body.innerHTML = `
    <div class="c-feed">
    <h2 id="feed-title">Noticias</h2>
    <section id="feed-test" data-feed aria-labelledby="feed-title">
      <article>
        <h3>Artículo 1</h3>
        <p>Resumen 1</p>
      </article>
      <article>
        <h3>Artículo 2</h3>
        <p>Resumen 2</p>
      </article>
      <article>
        <h3>Artículo 3</h3>
        <p>Resumen 3</p>
      </article>
    </section>
    <a class="c-feed__more" data-feed-more href="#">Cargar más</a>
    </div>
  `;
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

describe('Feed', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error sin un elemento <section>[data-feed]', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Feed(document.querySelector('div'))).toThrow();
  });

  it('pone role="feed" en la sección', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    expect($('[data-feed]').getAttribute('role')).toBe('feed');
  });

  it('pone aria-busy="false" inicialmente', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    expect($('[data-feed]').getAttribute('aria-busy')).toBe('false');
  });

  it('no pone tabindex en la sección y sí tabindex="0" en cada artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    expect($('[data-feed]').hasAttribute('tabindex')).toBe(false);
    $$('article').forEach((article) => {
      expect(article.getAttribute('tabindex')).toBe('0');
    });
  });

  it('no añade role a los artículos: <article> ya es article', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = $$('article');
    expect(articles.length).toBe(3);
    articles.forEach((article) => {
      expect(article.hasAttribute('role')).toBe(false);
    });
  });

  it('nombra cada artículo con aria-labelledby apuntando a su título', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    $$('article').forEach((article, index) => {
      const titulo = document.getElementById(
        article.getAttribute('aria-labelledby')
      );
      expect(titulo.tagName).toBe('H3');
      expect(titulo.textContent).toBe(`Artículo ${index + 1}`);
    });
  });

  it('describe cada artículo con aria-describedby apuntando a su resumen', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    $$('article').forEach((article, index) => {
      const resumen = document.getElementById(
        article.getAttribute('aria-describedby')
      );
      expect(resumen.tagName).toBe('P');
      expect(resumen.textContent).toBe(`Resumen ${index + 1}`);
    });
  });

  it('conserva el id que ya tenga el título', () => {
    buildMarkup();
    $('article h3').id = 'mi-titulo';
    new Feed($('[data-feed]'));

    expect($('article').getAttribute('aria-labelledby')).toBe('mi-titulo');
    expect($('article h3').id).toBe('mi-titulo');
  });

  it('nombra también los artículos cargados con loadMore', async () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'), {
      loadMore: vi
        .fn()
        .mockResolvedValue([{ title: 'Nuevo', description: 'd' }]),
    });

    await feed._load();

    const nuevo = $$('article')[3];
    const titulo = document.getElementById(
      nuevo.getAttribute('aria-labelledby')
    );
    expect(titulo.textContent).toBe('Nuevo');
    expect(nuevo.hasAttribute('aria-describedby')).toBe(true);
  });

  it('pone aria-posinset correlativo en cada artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = Array.from($$('article'));
    articles.forEach((article, index) => {
      expect(article.getAttribute('aria-posinset')).toBe(String(index + 1));
    });
  });

  it('pone aria-setsize con el total de artículos', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = $$('article');
    articles.forEach((article) => {
      expect(article.getAttribute('aria-setsize')).toBe('3');
    });
  });

  it('PageDown mueve el foco al siguiente artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = Array.from($$('article'));
    articles[0].focus();

    const event = new KeyboardEvent('keydown', {
      key: 'PageDown',
      cancelable: true,
    });
    $('[data-feed]').dispatchEvent(event);

    expect(document.activeElement).toBe(articles[1]);
  });

  it('PageUp mueve el foco al artículo anterior', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = Array.from($$('article'));
    articles[1].focus();

    const event = new KeyboardEvent('keydown', {
      key: 'PageUp',
      cancelable: true,
    });
    $('[data-feed]').dispatchEvent(event);

    expect(document.activeElement).toBe(articles[0]);
  });

  function pulsarCtrl(elemento, key) {
    elemento.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  it('Ctrl+Fin lleva el foco al primer elemento enfocable tras el feed', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articulos = $$('article');
    articulos[1].focus();
    pulsarCtrl(articulos[1], 'End');

    expect(document.activeElement).toBe($('[data-feed-more]'));
  });

  it('Ctrl+Inicio lleva el foco al último elemento enfocable antes del feed', () => {
    document.body.innerHTML = `
      <button id="antes">Antes</button>
      <section data-feed><article><h3>A</h3><p>R</p></article></section>
    `;
    new Feed($('[data-feed]'));

    const articulo = $('article');
    articulo.focus();
    pulsarCtrl(articulo, 'Home');

    expect(document.activeElement.id).toBe('antes');
  });

  it('con loadMore, Ctrl+Fin salta el enlace oculto y va al siguiente enfocable', () => {
    document.body.innerHTML = `
      <section data-feed><article><h3>A</h3><p>R</p></article></section>
      <a data-feed-more href="#" id="mas">Cargar más</a>
      <button id="despues">Después</button>
    `;
    new Feed($('[data-feed]'), { loadMore: vi.fn() });

    const articulo = $('article');
    articulo.focus();
    pulsarCtrl(articulo, 'End');

    expect(document.activeElement.id).toBe('despues');
  });

  it('Ctrl+Fin no mueve el foco si no hay nada enfocable después', () => {
    document.body.innerHTML = `
      <button id="antes">Antes</button>
      <section data-feed><article><h3>A</h3><p>R</p></article></section>
    `;
    new Feed($('[data-feed]'));

    const articulo = $('article');
    articulo.focus();
    pulsarCtrl(articulo, 'End');

    expect(document.activeElement).toBe(articulo);
  });

  it('destroy() quita role="feed" y atributos ARIA', () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'));
    feed.destroy();

    expect($('[data-feed]').hasAttribute('role')).toBe(false);
    expect($('[data-feed]').hasAttribute('aria-busy')).toBe(false);
    expect($('[data-feed]').hasAttribute('tabindex')).toBe(false);
    $$('article').forEach((article) => {
      expect(article.hasAttribute('aria-labelledby')).toBe(false);
      expect(article.hasAttribute('aria-describedby')).toBe(false);
      expect(article.hasAttribute('aria-posinset')).toBe(false);
    });
    expect($('article h3').hasAttribute('id')).toBe(false);
    expect($('article p').hasAttribute('id')).toBe(false);
  });

  it('initFeeds inicializa cada [data-feed]', () => {
    document.body.innerHTML = `
      <section id="feed1" data-feed></section>
      <section id="feed2" data-feed></section>
    `;

    const feeds = initFeeds();

    expect(feeds).toHaveLength(2);
    expect(feeds[0]).toBeInstanceOf(Feed);
    expect(feeds[1]).toBeInstanceOf(Feed);
  });

  it('Feed sin loadMore es estático', () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'));

    expect(feed.loadMore).toBeUndefined();
  });

  it('sin loadMore el enlace «Cargar más» sigue visible', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    expect($('[data-feed-more]').hidden).toBe(false);
  });

  it('con loadMore oculta el enlace y destroy() lo restaura', () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'), { loadMore: vi.fn() });
    expect($('[data-feed-more]').hidden).toBe(true);

    feed.destroy();
    expect($('[data-feed-more]').hidden).toBe(false);
  });

  it('los mensajes de estado se colocan fuera de role="feed"', async () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'), {
      loadMore: vi.fn().mockRejectedValue(new Error('fallo')),
    });

    await feed._load();

    expect($('[role="feed"] .c-feed__status')).toBeNull();
    expect($('[role="feed"]').nextElementSibling.className).toBe(
      'c-feed__status'
    );
    expect(
      Array.from($('[role="feed"]').children).every(
        (child) => child.tagName === 'ARTICLE'
      )
    ).toBe(true);
  });

  it('anuncia con live-region el error de carga', async () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'), {
      loadMore: vi.fn().mockRejectedValue(new Error('fallo')),
    });

    await feed._load();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect($('[data-live-region="polite"]').textContent).toBe(
      'No se pudieron cargar más artículos'
    );
  });

  it('anuncia el número de artículos nuevos', async () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'), {
      loadMore: vi.fn().mockResolvedValue([
        { title: 'Nuevo 1', description: 'd' },
        { title: 'Nuevo 2', description: 'd' },
      ]),
    });

    await feed._load();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect($('[data-live-region="polite"]').textContent).toBe(
      '2 artículos nuevos'
    );
  });

  it('Reintentar mantiene el foco en el botón durante la carga y lo lleva al primer artículo nuevo', async () => {
    buildMarkup();
    let resolveRetry;
    const loadMore = vi
      .fn()
      .mockRejectedValueOnce(new Error('fallo'))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRetry = resolve;
          })
      );
    const feed = new Feed($('[data-feed]'), { loadMore });

    await feed._load();
    const retry = $('.c-feed__status button');
    retry.focus();
    retry.click();

    expect(loadMore).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(retry);
    expect(retry.getAttribute('aria-disabled')).toBe('true');

    resolveRetry([{ title: 'Nuevo', description: 'd' }]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect($('.c-feed__status')).toBeNull();
    expect(document.activeElement.tagName).toBe('ARTICLE');
    expect(document.activeElement.textContent).toContain('Nuevo');
  });

  it('Feed con loadMore almacena la función', async () => {
    buildMarkup();
    const mockLoadMore = vi.fn().mockResolvedValue([]);
    const feed = new Feed($('[data-feed]'), { loadMore: mockLoadMore });

    expect(feed.loadMore).toBe(mockLoadMore);
  });
});
