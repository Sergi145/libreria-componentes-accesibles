import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Feed, initFeeds } from './feed.js';

function buildMarkup() {
  document.body.innerHTML = `
    <section class="c-feed" id="feed-test" data-feed aria-labelledby="feed-title">
      <h2 id="feed-title">Noticias</h2>
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
      <a class="c-feed__more" data-feed-more href="#">Cargar más</a>
    </section>
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

  it('pone tabindex="0" en el feed', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    expect($('[data-feed]').getAttribute('tabindex')).toBe('0');
  });

  it('pone role="article" en cada artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = $$('[role="article"]');
    expect(articles.length).toBe(3);
  });

  it('pone aria-posinset correlativo en cada artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = Array.from($$('[role="article"]'));
    articles.forEach((article, index) => {
      expect(article.getAttribute('aria-posinset')).toBe(String(index + 1));
    });
  });

  it('pone aria-setsize con el total de artículos', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = $$('[role="article"]');
    articles.forEach((article) => {
      expect(article.getAttribute('aria-setsize')).toBe('3');
    });
  });

  it('PageDown mueve el foco al siguiente artículo', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const articles = Array.from($$('[role="article"]'));
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

    const articles = Array.from($$('[role="article"]'));
    articles[1].focus();

    const event = new KeyboardEvent('keydown', {
      key: 'PageUp',
      cancelable: true,
    });
    $('[data-feed]').dispatchEvent(event);

    expect(document.activeElement).toBe(articles[0]);
  });

  it('Ctrl+End y Ctrl+Home no lanzan error', () => {
    buildMarkup();
    new Feed($('[data-feed]'));

    const feed = $('[data-feed]');
    feed.focus();

    const event1 = new KeyboardEvent('keydown', {
      key: 'End',
      ctrlKey: true,
      cancelable: true,
    });
    const event2 = new KeyboardEvent('keydown', {
      key: 'Home',
      ctrlKey: true,
      cancelable: true,
    });

    expect(() => feed.dispatchEvent(event1)).not.toThrow();
    expect(() => feed.dispatchEvent(event2)).not.toThrow();
  });

  it('destroy() quita role="feed" y atributos ARIA', () => {
    buildMarkup();
    const feed = new Feed($('[data-feed]'));
    feed.destroy();

    expect($('[data-feed]').hasAttribute('role')).toBe(false);
    expect($('[data-feed]').hasAttribute('aria-busy')).toBe(false);
    expect($('[data-feed]').hasAttribute('tabindex')).toBe(false);
    expect($$('[role="article"]')).toHaveLength(0);
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

  it('Feed con loadMore almacena la función', async () => {
    buildMarkup();
    const mockLoadMore = vi.fn().mockResolvedValue([]);
    const feed = new Feed($('[data-feed]'), { loadMore: mockLoadMore });

    expect(feed.loadMore).toBe(mockLoadMore);
  });
});
