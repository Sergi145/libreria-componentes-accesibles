import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Progress, initProgress, COMPLETE_DELAY } from './progress.js';
import referenceHtml from './progress.html?raw';

const polite = () => document.querySelector('[data-live-region="polite"]');

function build({ value = 0, max = 100 } = {}) {
  document.body.innerHTML = `
    <label for="p">Subida</label>
    <progress id="p" max="${max}" value="${value}"></progress>
  `;
  return document.getElementById('p');
}

describe('Progress', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Progress(null)).toThrow();
  });

  it('lanza un error si el elemento no es un <progress>', () => {
    document.body.innerHTML = '<div id="x"></div>';
    expect(() => new Progress(document.getElementById('x'))).toThrow();
  });

  it('value lee el valor del <progress>', () => {
    const progress = new Progress(build({ value: 40 }));
    expect(progress.value).toBe(40);
  });

  it('asignar value actualiza el <progress>', () => {
    const el = build();
    const progress = new Progress(el);
    progress.value = 35;
    expect(el.value).toBe(35);
    expect(el.getAttribute('value')).toBe('35');
  });

  it('un valor mayor que max deja value === max', () => {
    const el = build({ max: 100 });
    const progress = new Progress(el);
    progress.value = 250;
    expect(progress.value).toBe(100);
  });

  it('un valor negativo deja value === 0', () => {
    const progress = new Progress(build({ value: 50 }));
    progress.value = -10;
    expect(progress.value).toBe(0);
  });

  it('un valor no numérico se ignora', () => {
    const progress = new Progress(build({ value: 50 }));
    progress.value = 'abc';
    progress.value = NaN;
    expect(progress.value).toBe(50);
  });

  it('respeta un max personalizado', () => {
    const progress = new Progress(build({ max: 5 }));
    progress.value = 9;
    expect(progress.value).toBe(5);
  });

  describe('indeterminado', () => {
    it('sin atributo value sigue siendo indeterminado', () => {
      document.body.innerHTML = '<progress id="p" max="100"></progress>';
      const el = document.getElementById('p');
      new Progress(el);
      expect(el.hasAttribute('value')).toBe(false);
    });

    it('asignar value lo convierte en determinado', () => {
      document.body.innerHTML = '<progress id="p" max="100"></progress>';
      const el = document.getElementById('p');
      new Progress(el).value = 20;
      expect(el.getAttribute('value')).toBe('20');
    });
  });

  describe('anuncio al completar', () => {
    it('anuncia «Completado» al llegar a max', () => {
      const progress = new Progress(build());
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('Completado');
    });

    it('usa el completeMessage personalizado', () => {
      const progress = new Progress(build(), {
        completeMessage: 'Subida completada',
      });
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('Subida completada');
    });

    it('crea las regiones vivas al construirse, antes de anunciar nada', () => {
      new Progress(build());
      expect(polite()).not.toBeNull();
      expect(polite().textContent).toBe('');
    });

    it('espera COMPLETE_DELAY ms antes de anunciar', () => {
      const progress = new Progress(build());
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY - 1);
      expect(polite().textContent).toBe('');
      vi.advanceTimersByTime(2);
      expect(polite().textContent).toBe('Completado');
    });

    it('si el valor baja de max durante la espera, no anuncia', () => {
      const progress = new Progress(build());
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY - 100);
      progress.value = 50;
      vi.advanceTimersByTime(COMPLETE_DELAY);
      expect(polite().textContent).toBe('');
    });

    it('destroy() durante la espera cancela el anuncio', () => {
      const progress = new Progress(build());
      progress.value = 100;
      progress.destroy();
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('');
    });

    it('no anuncia los valores intermedios', () => {
      const progress = new Progress(build());
      progress.value = 10;
      progress.value = 50;
      progress.value = 99;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('');
    });

    it('un valor mayor que max también anuncia (acotado a max)', () => {
      const progress = new Progress(build());
      progress.value = 500;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('Completado');
    });

    it('asignar max dos veces lo anuncia una sola vez', () => {
      const progress = new Progress(build());
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      polite().textContent = '';
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('');
    });

    it('si baja de max y vuelve a llegar, se anuncia de nuevo', () => {
      const progress = new Progress(build());
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      progress.value = 40;
      polite().textContent = '';
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('Completado');
    });

    it('si ya está completo al inicializar, no anuncia nada', () => {
      const progress = new Progress(build({ value: 100 }));
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('');
    });

    it('tras destroy() ya no anuncia', () => {
      const progress = new Progress(build());
      progress.destroy();
      progress.value = 100;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('');
    });
  });

  describe('initProgress()', () => {
    it('inicializa los [data-progress]', () => {
      document.body.innerHTML = `
        <progress data-progress max="10"></progress>
        <progress data-progress max="10"></progress>
        <progress max="10"></progress>
      `;
      expect(initProgress()).toHaveLength(2);
    });

    it('lee data-complete-message', () => {
      document.body.innerHTML =
        '<progress data-progress data-complete-message="Listo" max="10"></progress>';
      const [progress] = initProgress();
      progress.value = 10;
      vi.advanceTimersByTime(COMPLETE_DELAY + 1);
      expect(polite().textContent).toBe('Listo');
    });
  });

  describe('marcado de referencia', () => {
    beforeEach(() => {
      document.body.innerHTML = referenceHtml;
    });

    it('cada <progress> tiene nombre accesible por <label for>', () => {
      const bars = document.querySelectorAll('progress');
      expect(bars.length).toBeGreaterThan(0);
      for (const bar of bars) {
        const label = document.querySelector(`label[for="${bar.id}"]`);
        expect(label).not.toBeNull();
        expect(label.textContent.trim()).not.toBe('');
      }
    });

    it('la variante indeterminada no tiene atributo value', () => {
      const bar = document.getElementById('cargando');
      expect(bar.hasAttribute('value')).toBe(false);
    });

    it('no usa role ni aria-value* (el <progress> ya es nativo)', () => {
      expect(document.querySelector('[role="progressbar"]')).toBeNull();
      expect(document.querySelector('[aria-valuenow]')).toBeNull();
    });
  });
});
