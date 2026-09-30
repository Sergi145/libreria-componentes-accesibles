import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Scrollspy, initScrollspies } from './scrollspy.js';
import referenceHtml from './scrollspy.html?raw';

/**
 * jsdom no implementa IntersectionObserver: se sustituye por un doble que
 * guarda el callback y los elementos observados, y permite disparar
 * entradas a mano.
 */
let observers;

class FakeIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.targets = new Set();
    this.disconnected = false;
    observers.push(this);
  }

  observe(el) {
    this.targets.add(el);
  }

  disconnect() {
    this.disconnected = true;
    this.targets.clear();
  }

  trigger(...changes) {
    if (this.disconnected) return;
    this.callback(
      changes.map(([el, isIntersecting]) => ({ target: el, isIntersecting }))
    );
  }
}

function build() {
  document.body.innerHTML = `
    <button id="fuera">Fuera</button>
    <nav id="nav" data-scrollspy aria-label="En esta página">
      <ul>
        <li><a id="l-a" href="#a">A</a></li>
        <li><a id="l-b" href="#b">B</a></li>
        <li><a id="l-c" href="#c">C</a></li>
        <li><a id="l-x" href="#no-existe">X</a></li>
        <li><a id="l-web" href="https://example.com">Web</a></li>
      </ul>
    </nav>
    <section id="a">A</section>
    <section id="b">B</section>
    <section id="c">C</section>
  `;
  return document.getElementById('nav');
}

const sec = (id) => document.getElementById(id);
const current = () =>
  Array.from(document.querySelectorAll('[aria-current]')).map((a) => a.id);

describe('Scrollspy', () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Scrollspy(null)).toThrow();
  });

  it('observa las secciones de los enlaces internos y nada más', () => {
    new Scrollspy(build());
    const [observer] = observers;
    expect(Array.from(observer.targets)).toEqual([
      sec('a'),
      sec('b'),
      sec('c'),
    ]);
  });

  it('usa por defecto una banda fina al 20 % desde arriba (rootMargin)', () => {
    new Scrollspy(build());
    expect(observers[0].options.rootMargin).toBe('-20% 0px -79% 0px');
  });

  it('observa respecto al documento del <nav> (necesario dentro de un iframe)', () => {
    const nav = build();
    new Scrollspy(nav);
    expect(observers[0].options.root).toBe(document);
  });

  it('acepta un contenedor con scroll propio como root', () => {
    const nav = build();
    const panel = document.createElement('div');
    new Scrollspy(nav, { root: panel });
    expect(observers[0].options.root).toBe(panel);
  });

  it('si el navegador no admite un Document como root, reintenta sin root', () => {
    class Picky extends FakeIntersectionObserver {
      constructor(callback, options) {
        if (options.root) throw new TypeError('root debe ser un Element');
        super(callback, options);
      }
    }
    vi.stubGlobal('IntersectionObserver', Picky);
    const spy = new Scrollspy(build());
    expect(observers).toHaveLength(1);
    expect(observers[0].options.root).toBeUndefined();
    observers[0].trigger([sec('a'), true]);
    expect(spy.active).toBe(document.getElementById('l-a'));
  });

  it('acepta otro rootMargin', () => {
    new Scrollspy(build(), { rootMargin: '-80px 0px -50% 0px' });
    expect(observers[0].options.rootMargin).toBe('-80px 0px -50% 0px');
  });

  it('al principio no hay ningún enlace activo', () => {
    const spy = new Scrollspy(build());
    expect(current()).toEqual([]);
    expect(spy.active).toBeNull();
  });

  it('marca con aria-current="true" el enlace de la sección visible', () => {
    const spy = new Scrollspy(build());
    observers[0].trigger([sec('b'), true]);
    expect(current()).toEqual(['l-b']);
    expect(document.getElementById('l-b').getAttribute('aria-current')).toBe(
      'true'
    );
    expect(spy.active).toBe(document.getElementById('l-b'));
  });

  it('si hay varias secciones visibles, gana la primera del orden de enlaces', () => {
    new Scrollspy(build());
    observers[0].trigger([sec('c'), true], [sec('b'), true]);
    expect(current()).toEqual(['l-b']);
  });

  it('al pasar de una sección a otra, solo hay un aria-current', () => {
    new Scrollspy(build());
    const [observer] = observers;
    observer.trigger([sec('a'), true]);
    expect(current()).toEqual(['l-a']);
    observer.trigger([sec('a'), false], [sec('b'), true]);
    expect(current()).toEqual(['l-b']);
    observer.trigger([sec('b'), false], [sec('c'), true]);
    expect(current()).toEqual(['l-c']);
    expect(current()).toHaveLength(1);
  });

  it('si al salir una sección la anterior sigue visible, vuelve a ella', () => {
    new Scrollspy(build());
    const [observer] = observers;
    observer.trigger([sec('a'), true], [sec('b'), true]);
    observer.trigger([sec('a'), false]);
    expect(current()).toEqual(['l-b']);
  });

  it('entre dos secciones (ninguna visible) conserva el último activo', () => {
    new Scrollspy(build());
    const [observer] = observers;
    observer.trigger([sec('b'), true]);
    observer.trigger([sec('b'), false]);
    expect(current()).toEqual(['l-b']);
  });

  it('no mueve el foco', () => {
    new Scrollspy(build());
    const fuera = document.getElementById('fuera');
    fuera.focus();
    observers[0].trigger([sec('a'), true]);
    observers[0].trigger([sec('a'), false], [sec('c'), true]);
    expect(document.activeElement).toBe(fuera);
  });

  it('no anuncia nada: sin aria-live ni regiones vivas', () => {
    new Scrollspy(build());
    observers[0].trigger([sec('a'), true]);
    expect(document.querySelector('[aria-live]')).toBeNull();
    expect(
      document.querySelector('[role="status"], [role="alert"]')
    ).toBeNull();
    expect(document.querySelector('[data-live-region]')).toBeNull();
  });

  it('destroy() desconecta el observador y no vuelve a actualizar', () => {
    const spy = new Scrollspy(build());
    observers[0].trigger([sec('a'), true]);
    spy.destroy();
    expect(observers[0].disconnected).toBe(true);
    observers[0].trigger([sec('a'), false], [sec('c'), true]);
    expect(current()).toEqual(['l-a']);
  });

  it('sin IntersectionObserver no falla y no marca nada', () => {
    vi.unstubAllGlobals();
    // jsdom no lo implementa: el constructor debe limitarse a no hacer nada.
    const spy = new Scrollspy(build());
    expect(current()).toEqual([]);
    expect(spy.active).toBeNull();
    expect(() => spy.destroy()).not.toThrow();
  });

  it('initScrollspies() inicializa los [data-scrollspy]', () => {
    build();
    const spies = initScrollspies();
    expect(spies).toHaveLength(1);
    expect(spies[0]).toBeInstanceOf(Scrollspy);
  });

  describe('marcado de referencia', () => {
    beforeEach(() => {
      document.body.innerHTML = referenceHtml;
    });

    it('es un <nav> con nombre y con data-scrollspy', () => {
      const nav = document.querySelector('nav');
      expect(nav.getAttribute('aria-label')).toBe('En esta página');
      expect(nav.hasAttribute('data-scrollspy')).toBe(true);
    });

    it('cada enlace apunta a una sección que existe', () => {
      const links = document.querySelectorAll('nav a');
      expect(links.length).toBeGreaterThan(1);
      links.forEach((link) => {
        const id = link.getAttribute('href').slice(1);
        expect(document.getElementById(id)).not.toBeNull();
      });
    });

    it('no trae ningún aria-current de serie', () => {
      expect(document.querySelector('[aria-current]')).toBeNull();
    });

    it('funciona con Scrollspy', () => {
      const [spy] = initScrollspies();
      const first = document.getElementById('introduccion');
      observers[0].trigger([first, true]);
      expect(spy.active.getAttribute('href')).toBe('#introduccion');
    });
  });
});
