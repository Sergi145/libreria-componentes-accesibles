import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Carousel, initCarousels } from './carousel.js';
import referenceHtml from './carousel.html?raw';

function build({ selected = 0, total = 3 } = {}) {
  const tabs = Array.from({ length: total }, (_, i) => {
    const on = i === selected;
    return `<button type="button" role="tab" id="t${i}" aria-label="Diapositiva ${i + 1}"
      aria-selected="${on}" aria-controls="s${i}" tabindex="${on ? 0 : -1}"></button>`;
  }).join('');
  const slides = Array.from(
    { length: total },
    (_, i) => `<div id="s${i}" data-carousel-slide>Contenido ${i + 1}</div>`
  ).join('');
  document.body.innerHTML = `
    <section id="c" data-carousel aria-roledescription="carrusel" aria-label="Destacados">
      <div data-carousel-controls hidden>
        <button type="button" id="rot" data-carousel-rotation hidden>Rotación</button>
        <button type="button" id="prev" data-carousel-prev>Anterior</button>
        <button type="button" id="next" data-carousel-next>Siguiente</button>
        <div role="tablist" aria-label="Diapositivas" data-carousel-tablist>${tabs}</div>
      </div>
      <div data-carousel-slides>${slides}</div>
    </section>
  `;
  return document.getElementById('c');
}

const visibleSlides = () =>
  Array.from(document.querySelectorAll('[data-carousel-slide]'))
    .filter((s) => !s.hasAttribute('hidden'))
    .map((s) => s.id);

const tab = (i) => document.getElementById(`t${i}`);

function press(el, key) {
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  );
}

describe('Carousel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Carousel(null)).toThrow();
  });

  describe('estado inicial', () => {
    it('muestra los controles (quita hidden) pero deja oculto el de rotación', () => {
      const el = build();
      new Carousel(el);
      expect(
        el.querySelector('[data-carousel-controls]').hasAttribute('hidden')
      ).toBe(false);
      expect(
        el.querySelector('[data-carousel-rotation]').hasAttribute('hidden')
      ).toBe(true);
    });

    it('solo la primera diapositiva es visible', () => {
      new Carousel(build());
      expect(visibleSlides()).toEqual(['s0']);
    });

    it('respeta el aria-selected="true" del HTML', () => {
      const carousel = new Carousel(build({ selected: 2 }));
      expect(carousel.index).toBe(2);
      expect(visibleSlides()).toEqual(['s2']);
    });

    it('exactamente una pestaña tiene tabindex="0" y aria-selected="true"', () => {
      new Carousel(build());
      const tabs = document.querySelectorAll('[role="tab"]');
      expect(
        Array.from(tabs).filter((t) => t.getAttribute('tabindex') === '0')
      ).toHaveLength(1);
      expect(
        Array.from(tabs).filter(
          (t) => t.getAttribute('aria-selected') === 'true'
        )
      ).toHaveLength(1);
      expect(tab(0).getAttribute('aria-selected')).toBe('true');
    });

    it('rellena role, aria-roledescription y aria-label si faltan', () => {
      new Carousel(build());
      const slide = document.getElementById('s1');
      expect(slide.getAttribute('role')).toBe('tabpanel');
      expect(slide.getAttribute('aria-roledescription')).toBe('diapositiva');
      expect(slide.getAttribute('aria-label')).toBe('2 de 3');
    });

    it('no pisa los atributos que ya trae el HTML', () => {
      const el = build();
      document.getElementById('s0').setAttribute('aria-label', 'Personalizada');
      new Carousel(el);
      expect(document.getElementById('s0').getAttribute('aria-label')).toBe(
        'Personalizada'
      );
    });

    it('el contenedor de diapositivas lleva aria-live="polite"', () => {
      new Carousel(build());
      expect(
        document
          .querySelector('[data-carousel-slides]')
          .getAttribute('aria-live')
      ).toBe('polite');
    });
  });

  describe('Anterior / Siguiente', () => {
    it('Siguiente avanza y Anterior retrocede', () => {
      const carousel = new Carousel(build());
      document.getElementById('next').click();
      expect(carousel.index).toBe(1);
      expect(visibleSlides()).toEqual(['s1']);
      document.getElementById('prev').click();
      expect(carousel.index).toBe(0);
    });

    it('Siguiente en la última da la vuelta a la primera', () => {
      const carousel = new Carousel(build({ selected: 2 }));
      document.getElementById('next').click();
      expect(carousel.index).toBe(0);
      expect(visibleSlides()).toEqual(['s0']);
    });

    it('Anterior en la primera va a la última', () => {
      const carousel = new Carousel(build());
      document.getElementById('prev').click();
      expect(carousel.index).toBe(2);
    });

    it('no mueve el foco del botón pulsado', () => {
      new Carousel(build());
      const next = document.getElementById('next');
      next.focus();
      next.click();
      expect(document.activeElement).toBe(next);
    });

    it('actualiza aria-selected y el tabindex de las pestañas', () => {
      new Carousel(build());
      document.getElementById('next').click();
      expect(tab(1).getAttribute('aria-selected')).toBe('true');
      expect(tab(1).getAttribute('tabindex')).toBe('0');
      expect(tab(0).getAttribute('aria-selected')).toBe('false');
      expect(tab(0).getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('goTo()', () => {
    it('muestra la diapositiva indicada', () => {
      const carousel = new Carousel(build());
      carousel.goTo(2);
      expect(carousel.index).toBe(2);
      expect(visibleSlides()).toEqual(['s2']);
    });

    it('da la vuelta si el índice se sale del rango', () => {
      const carousel = new Carousel(build());
      carousel.goTo(3);
      expect(carousel.index).toBe(0);
      carousel.goTo(-1);
      expect(carousel.index).toBe(2);
    });
  });

  describe('selector de diapositivas (pestañas)', () => {
    it('→ mueve el foco y muestra la diapositiva siguiente (activación automática)', () => {
      const carousel = new Carousel(build());
      tab(0).focus();
      press(tab(0), 'ArrowRight');
      expect(document.activeElement).toBe(tab(1));
      expect(carousel.index).toBe(1);
      expect(tab(1).getAttribute('aria-selected')).toBe('true');
      expect(visibleSlides()).toEqual(['s1']);
    });

    it('← desde la primera da la vuelta a la última', () => {
      const carousel = new Carousel(build());
      tab(0).focus();
      press(tab(0), 'ArrowLeft');
      expect(document.activeElement).toBe(tab(2));
      expect(carousel.index).toBe(2);
    });

    it('Inicio y Fin van a la primera y a la última', () => {
      const carousel = new Carousel(build({ selected: 1 }));
      tab(1).focus();
      press(tab(1), 'End');
      expect(carousel.index).toBe(2);
      press(tab(2), 'Home');
      expect(carousel.index).toBe(0);
    });

    it('un clic en una pestaña muestra su diapositiva', () => {
      const carousel = new Carousel(build());
      tab(2).click();
      expect(carousel.index).toBe(2);
      expect(visibleSlides()).toEqual(['s2']);
    });

    it('Siguiente y luego → continúa desde la diapositiva actual', () => {
      const carousel = new Carousel(build());
      document.getElementById('next').click();
      tab(1).focus();
      press(tab(1), 'ArrowRight');
      expect(carousel.index).toBe(2);
    });
  });

  it('destroy() quita los listeners de Anterior/Siguiente y del selector', () => {
    const carousel = new Carousel(build());
    carousel.destroy();
    document.getElementById('next').click();
    expect(carousel.index).toBe(0);
    tab(0).focus();
    press(tab(0), 'ArrowRight');
    expect(carousel.index).toBe(0);
  });

  it('initCarousels() inicializa los [data-carousel] y lee data-interval', () => {
    const el = build();
    el.setAttribute('data-interval', '3000');
    const [carousel] = initCarousels();
    expect(carousel).toBeInstanceOf(Carousel);
    expect(carousel.interval).toBe(3000);
  });

  it('el intervalo por defecto es 5000 ms', () => {
    expect(new Carousel(build()).interval).toBe(5000);
  });

  describe('rotación automática', () => {
    const live = () =>
      document
        .querySelector('[data-carousel-slides]')
        .getAttribute('aria-live');
    const rotation = () => document.getElementById('rot');
    let matches;

    function auto(options = {}) {
      const el = build();
      el.setAttribute('data-autoplay', '');
      return new Carousel(el, options);
    }

    beforeEach(() => {
      vi.useFakeTimers();
      matches = false;
      window.matchMedia = vi.fn(() => ({ matches }));
    });

    afterEach(() => {
      vi.useRealTimers();
      delete window.matchMedia;
    });

    it('sin data-autoplay no rota y el botón sigue oculto', () => {
      const carousel = new Carousel(build());
      vi.advanceTimersByTime(60000);
      expect(carousel.index).toBe(0);
      expect(carousel.playing).toBe(false);
      expect(rotation().hasAttribute('hidden')).toBe(true);
    });

    it('con data-autoplay muestra el botón y cambia a los 5000 ms', () => {
      const carousel = auto();
      expect(rotation().hasAttribute('hidden')).toBe(false);
      vi.advanceTimersByTime(4999);
      expect(carousel.index).toBe(0);
      vi.advanceTimersByTime(1);
      expect(carousel.index).toBe(1);
    });

    it('respeta el intervalo indicado y da la vuelta al final', () => {
      const carousel = auto({ interval: 1000 });
      vi.advanceTimersByTime(3000);
      expect(carousel.index).toBe(0);
    });

    it('initCarousels() lee data-interval junto a data-autoplay', () => {
      const el = build();
      el.setAttribute('data-autoplay', '');
      el.setAttribute('data-interval', '2000');
      const [carousel] = initCarousels();
      vi.advanceTimersByTime(2000);
      expect(carousel.index).toBe(1);
    });

    it('mientras rota, aria-live es "off"', () => {
      auto();
      expect(live()).toBe('off');
    });

    it('el botón empieza como «Detener rotación automática»', () => {
      auto();
      expect(rotation().getAttribute('aria-label')).toBe(
        'Detener rotación automática'
      );
      expect(rotation().getAttribute('data-playing')).toBe('true');
    });

    describe('pausa con el botón (permanente)', () => {
      it('detiene la rotación, cambia el nombre del botón y pone aria-live "polite"', () => {
        const carousel = auto();
        rotation().click();
        expect(carousel.playing).toBe(false);
        expect(rotation().getAttribute('aria-label')).toBe(
          'Iniciar rotación automática'
        );
        expect(rotation().getAttribute('data-playing')).toBe('false');
        expect(live()).toBe('polite');
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
      });

      it('no se reanuda sola al salir el foco ni el ratón', () => {
        const carousel = auto();
        const el = document.getElementById('c');
        rotation().click();
        el.dispatchEvent(new MouseEvent('mouseenter'));
        el.dispatchEvent(new MouseEvent('mouseleave'));
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        el.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
        );
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
      });

      it('pulsar de nuevo la reanuda, aunque el foco siga dentro', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        rotation().click();
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        rotation().click();
        expect(carousel.playing).toBe(true);
        expect(rotation().getAttribute('aria-label')).toBe(
          'Detener rotación automática'
        );
        expect(live()).toBe('off');
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });
    });

    describe('pausa temporal', () => {
      it('con el foco dentro deja de rotar y aria-live pasa a "polite"', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(live()).toBe('polite');
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
        expect(carousel.playing).toBe(true);
      });

      it('al salir el foco se reanuda', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        el.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
        );
        expect(live()).toBe('off');
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });

      it('el foco que pasa de un control a otro no reanuda la rotación', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        el.dispatchEvent(
          new FocusEvent('focusout', {
            bubbles: true,
            relatedTarget: document.getElementById('next'),
          })
        );
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
      });

      it('el ratón encima detiene y al salir reanuda', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        el.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
        el.dispatchEvent(new MouseEvent('mouseleave'));
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });

      it('con ratón y foco a la vez espera a que terminen los dos', () => {
        const carousel = auto({ interval: 1000 });
        const el = document.getElementById('c');
        el.dispatchEvent(new MouseEvent('mouseenter'));
        el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseleave'));
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
        el.dispatchEvent(
          new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
        );
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });

      it('la pausa temporal no cambia el nombre del botón', () => {
        auto();
        document
          .getElementById('c')
          .dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(rotation().getAttribute('aria-label')).toBe(
          'Detener rotación automática'
        );
      });
    });

    describe('prefers-reduced-motion: reduce', () => {
      it('no arranca sola aunque tenga data-autoplay', () => {
        matches = true;
        const carousel = auto({ interval: 1000 });
        vi.advanceTimersByTime(60000);
        expect(carousel.index).toBe(0);
        expect(carousel.playing).toBe(false);
        expect(live()).toBe('polite');
      });

      it('el botón se muestra como «Iniciar rotación automática»', () => {
        matches = true;
        auto();
        expect(rotation().hasAttribute('hidden')).toBe(false);
        expect(rotation().getAttribute('aria-label')).toBe(
          'Iniciar rotación automática'
        );
      });

      it('el usuario puede iniciarla con el botón', () => {
        matches = true;
        const carousel = auto({ interval: 1000 });
        rotation().click();
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });
    });

    describe('play() / pause() / destroy()', () => {
      it('pause() y play() controlan la rotación por código', () => {
        const carousel = auto({ interval: 1000 });
        carousel.pause();
        vi.advanceTimersByTime(5000);
        expect(carousel.index).toBe(0);
        carousel.play();
        vi.advanceTimersByTime(1000);
        expect(carousel.index).toBe(1);
      });

      it('play() y pause() no hacen nada sin data-autoplay', () => {
        const carousel = new Carousel(build(), { interval: 1000 });
        carousel.play();
        vi.advanceTimersByTime(5000);
        expect(carousel.index).toBe(0);
        expect(carousel.playing).toBe(false);
      });

      it('destroy() cancela el temporizador y los listeners', () => {
        const carousel = auto({ interval: 1000 });
        carousel.destroy();
        vi.advanceTimersByTime(5000);
        expect(carousel.index).toBe(0);
        rotation().click();
        expect(carousel.playing).toBe(true);
      });

      it('un carrusel de una sola diapositiva no arranca temporizador', () => {
        const el = build({ total: 1 });
        el.setAttribute('data-autoplay', '');
        const carousel = new Carousel(el, { interval: 1000 });
        vi.advanceTimersByTime(5000);
        expect(carousel.index).toBe(0);
        expect(live()).toBe('polite');
      });
    });
  });

  describe('marcado de referencia', () => {
    beforeEach(() => {
      document.body.innerHTML = referenceHtml;
    });

    it('es una <section> con aria-roledescription="carrusel" y nombre', () => {
      const section = document.querySelector('[data-carousel]');
      expect(section.tagName).toBe('SECTION');
      expect(section.getAttribute('aria-roledescription')).toBe('carrusel');
      expect(section.getAttribute('aria-label')).toBeTruthy();
    });

    it('sin JS los controles están hidden y todas las diapositivas visibles', () => {
      expect(
        document
          .querySelector('[data-carousel-controls]')
          .hasAttribute('hidden')
      ).toBe(true);
      const slides = document.querySelectorAll('[data-carousel-slide]');
      expect(slides.length).toBeGreaterThan(1);
      slides.forEach((s) => expect(s.hasAttribute('hidden')).toBe(false));
    });

    it('el botón de rotación es el primero en el DOM y está oculto', () => {
      const buttons = document.querySelectorAll(
        '[data-carousel-controls] button'
      );
      expect(buttons[0].hasAttribute('data-carousel-rotation')).toBe(true);
      expect(buttons[0].hasAttribute('hidden')).toBe(true);
      expect(buttons[1].hasAttribute('data-carousel-prev')).toBe(true);
      expect(buttons[2].hasAttribute('data-carousel-next')).toBe(true);
    });

    it('el selector es un tablist con nombre, tras Anterior/Siguiente', () => {
      const tablist = document.querySelector('[role="tablist"]');
      expect(tablist.getAttribute('aria-label')).toBe('Diapositivas');
      const next = document.querySelector('[data-carousel-next]');
      expect(
        next.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('cada pestaña tiene aria-label "Diapositiva N" y controla una diapositiva existente', () => {
      const tabs = document.querySelectorAll('[role="tab"]');
      tabs.forEach((t, i) => {
        expect(t.getAttribute('aria-label')).toBe(`Diapositiva ${i + 1}`);
        expect(
          document.getElementById(t.getAttribute('aria-controls'))
        ).not.toBeNull();
      });
    });

    it('cada diapositiva es role="tabpanel" con roledescription y "N de M"', () => {
      const slides = document.querySelectorAll('[data-carousel-slide]');
      slides.forEach((s, i) => {
        expect(s.getAttribute('role')).toBe('tabpanel');
        expect(s.getAttribute('aria-roledescription')).toBe('diapositiva');
        expect(s.getAttribute('aria-label')).toBe(
          `${i + 1} de ${slides.length}`
        );
      });
    });

    it('cada diapositiva lleva una imagen con alt descriptivo y dimensiones', () => {
      const slides = document.querySelectorAll('[data-carousel-slide]');
      slides.forEach((slide) => {
        const img = slide.querySelector('img.c-carousel__media');
        expect(img).not.toBeNull();
        expect(img.getAttribute('alt').length).toBeGreaterThan(10);
        expect(img.getAttribute('width')).toBeTruthy();
        expect(img.getAttribute('height')).toBeTruthy();
        expect(img.getAttribute('src')).toMatch(/^img\/slide-\d\.svg$/);
      });
    });

    it('el texto de la diapositiva va en el pie, no en el alt', () => {
      const slide = document.querySelector('[data-carousel-slide]');
      const title = slide.querySelector('.c-carousel__title').textContent;
      const alt = slide.querySelector('img').getAttribute('alt');
      expect(alt).not.toContain(title);
    });

    it('el marcado de referencia funciona con Carousel', () => {
      const [carousel] = initCarousels();
      expect(visibleSlides()).toHaveLength(1);
      carousel.next();
      expect(carousel.index).toBe(1);
    });
  });
});
