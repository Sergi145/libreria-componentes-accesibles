import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Offcanvas, initOffcanvas } from './offcanvas.js';

function buildMarkup() {
  document.body.innerHTML = `
    <button type="button" data-offcanvas-trigger="o1" aria-controls="o1">Abrir filtros</button>
    <dialog id="o1" class="c-offcanvas c-offcanvas--start" aria-labelledby="o1-title">
      <form method="dialog" class="c-offcanvas__content">
        <h2 id="o1-title">Filtros</h2>
        <button type="submit" value="dismiss">Cerrar</button>
      </form>
    </dialog>
  `;
}

function buildResponsiveMarkup() {
  document.body.innerHTML = `
    <button type="button" data-offcanvas-trigger="r1" aria-controls="r1">Abrir filtros</button>
    <dialog id="r1" class="c-offcanvas c-offcanvas--start c-offcanvas--responsive" aria-labelledby="r1-title">
      <form method="dialog" class="c-offcanvas__content">
        <h2 id="r1-title">Filtros</h2>
        <button type="submit" value="dismiss">Cerrar</button>
      </form>
    </dialog>
  `;
}

// jsdom no implementa matchMedia: lo simulamos con un objeto mínimo que
// guarda el listener de "change" y permite dispararlo a mano desde el
// test con trigger(matches).
function mockMatchMedia() {
  const listeners = new Set();
  const mql = {
    matches: false,
    media: '',
    addEventListener: (type, listener) => {
      if (type === 'change') listeners.add(listener);
    },
    removeEventListener: (type, listener) => {
      if (type === 'change') listeners.delete(listener);
    },
  };
  const matchMediaFn = vi.fn((query) => {
    mql.media = query;
    return mql;
  });
  vi.stubGlobal('matchMedia', matchMediaFn);
  return {
    matchMediaFn,
    trigger(matches) {
      mql.matches = matches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

describe('Offcanvas', () => {
  beforeEach(() => {
    buildMarkup();
  });

  it('extiende Modal: open()/close() funcionan igual', () => {
    const dialog = document.getElementById('o1');
    const panel = new Offcanvas(dialog);

    panel.open();
    expect(dialog.open).toBe(true);

    panel.close();
    expect(dialog.open).toBe(false);
  });

  it('un clic sobre el backdrop lo cierra, igual que en Modal', () => {
    const dialog = document.getElementById('o1');
    const panel = new Offcanvas(dialog);
    panel.open();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(false);
  });

  it('un clic dentro del contenido NO lo cierra', () => {
    const dialog = document.getElementById('o1');
    const title = document.getElementById('o1-title');
    const panel = new Offcanvas(dialog);
    panel.open();

    title.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(true);
  });

  it('destroy() quita el listener del backdrop: un clic ya no lo cierra', () => {
    const dialog = document.getElementById('o1');
    const panel = new Offcanvas(dialog);
    panel.open();
    panel.destroy();

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(true);
  });

  it('initOffcanvas conecta el trigger con el panel correspondiente', () => {
    initOffcanvas();
    const dialog = document.getElementById('o1');
    const trigger = document.querySelector('[data-offcanvas-trigger="o1"]');

    expect(dialog.open).toBe(false);
    trigger.click();
    expect(dialog.open).toBe(true);
  });

  describe('variante responsive', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sin la clase --responsive, no llama a matchMedia', () => {
      const { matchMediaFn } = mockMatchMedia();
      new Offcanvas(document.getElementById('o1'));

      expect(matchMediaFn).not.toHaveBeenCalled();
    });

    it('con la clase --responsive, engancha un listener de matchMedia con el breakpoint de 62em', () => {
      buildResponsiveMarkup();
      const { matchMediaFn } = mockMatchMedia();

      new Offcanvas(document.getElementById('r1'));

      expect(matchMediaFn).toHaveBeenCalledWith('(width >= 62em)');
    });

    it('si la media query pasa a coincidir y el panel estaba abierto, lo cierra', () => {
      buildResponsiveMarkup();
      const { trigger } = mockMatchMedia();
      const dialog = document.getElementById('r1');
      const panel = new Offcanvas(dialog);
      panel.open();

      trigger(true);

      expect(dialog.open).toBe(false);
    });

    it('si la media query no coincide, no lo toca', () => {
      buildResponsiveMarkup();
      const { trigger } = mockMatchMedia();
      const dialog = document.getElementById('r1');
      const panel = new Offcanvas(dialog);
      panel.open();

      trigger(false);

      expect(dialog.open).toBe(true);
    });

    it('destroy() quita el listener de matchMedia', () => {
      buildResponsiveMarkup();
      const { trigger } = mockMatchMedia();
      const dialog = document.getElementById('r1');
      const panel = new Offcanvas(dialog);
      panel.open();
      panel.destroy();

      trigger(true);

      expect(dialog.open).toBe(true);
    });
  });
});
