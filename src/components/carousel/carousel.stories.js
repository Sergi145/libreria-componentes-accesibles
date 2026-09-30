import './carousel.css';
import { Carousel } from './carousel.js';
import slide1 from './img/slide-1.svg';
import slide2 from './img/slide-2.svg';
import slide3 from './img/slide-3.svg';

export default {
  title: 'Componentes/Carousel',
  tags: ['autodocs'],
};

const SLIDES = [
  {
    title: 'Bienvenida',
    text: 'Descubre los componentes accesibles de la librería.',
    src: slide1,
    alt: 'Ilustración de montañas violetas bajo un cielo al amanecer, con un sol naranja',
  },
  {
    title: 'Teclado primero',
    text: 'Todo se puede hacer sin ratón y con foco siempre visible.',
    src: slide2,
    alt: 'Ilustración de un teclado verde con la tecla Tab resaltada en amarillo',
  },
  {
    title: 'Lectores de pantalla',
    text: 'Probados con NVDA y VoiceOver además de axe-core.',
    src: slide3,
    alt: 'Ilustración de un altavoz rosa que emite ondas de sonido',
  },
];

const ICON_PREV =
  '<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />';
const ICON_NEXT =
  '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />';
const ICON_PAUSE =
  '<path d="M9 6v12M15 6v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />';
const ICON_PLAY = '<path d="M8 5v14l11-7z" fill="currentColor" />';

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids (aria-controls) se generan
// nuevos en cada render() con un contador.
let instanceCount = 0;

function markup({ autoplay = false } = {}) {
  const id = `carrusel-demo-${instanceCount++}`;
  const tabs = SLIDES.map(
    (_, i) => `
      <button type="button" class="c-carousel__tab" role="tab"
        id="${id}-tab-${i}" aria-label="Diapositiva ${i + 1}"
        aria-selected="${i === 0}" aria-controls="${id}-slide-${i}"
        ${i === 0 ? '' : 'tabindex="-1"'}>
        <span class="c-carousel__dot" aria-hidden="true"></span>
      </button>`
  ).join('');
  const slides = SLIDES.map(
    (slide, i) => `
      <div class="c-carousel__slide" role="tabpanel" id="${id}-slide-${i}"
        aria-roledescription="diapositiva" aria-label="${i + 1} de ${SLIDES.length}"
        data-carousel-slide>
        <img class="c-carousel__media" src="${slide.src}" alt="${slide.alt}"
          width="640" height="360" />
        <div class="c-carousel__caption">
          <h3 class="c-carousel__title">${slide.title}</h3>
          <p>${slide.text}</p>
        </div>
      </div>`
  ).join('');

  const wrapper = document.createElement('div');
  wrapper.style.maxInlineSize = '36rem';
  wrapper.innerHTML = `
    <section class="c-carousel" aria-roledescription="carrusel"
      aria-label="Destacados" data-carousel
      ${autoplay ? 'data-autoplay data-interval="4000"' : ''}>
      <div class="c-carousel__controls" data-carousel-controls hidden>
        <button type="button" class="c-carousel__button c-carousel__rotation"
          aria-label="Detener rotación automática" data-carousel-rotation hidden>
          <svg class="c-carousel__icon c-carousel__icon--pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PAUSE}</svg>
          <svg class="c-carousel__icon c-carousel__icon--play" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PLAY}</svg>
        </button>
        <button type="button" class="c-carousel__button"
          aria-label="Diapositiva anterior" data-carousel-prev>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PREV}</svg>
        </button>
        <button type="button" class="c-carousel__button"
          aria-label="Diapositiva siguiente" data-carousel-next>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_NEXT}</svg>
        </button>
        <div class="c-carousel__tabs" role="tablist" aria-label="Diapositivas"
          data-carousel-tablist>${tabs}</div>
      </div>
      <div class="c-carousel__slides" aria-live="polite" data-carousel-slides>${slides}</div>
    </section>
  `;
  return wrapper;
}

export const Basica = {
  name: 'Básica',
  render: () => {
    const wrapper = markup();
    new Carousel(wrapper.querySelector('[data-carousel]'));
    return wrapper;
  },
};

export const Automatico = {
  name: 'Automático (con Play/Pausa)',
  render: () => {
    const wrapper = markup({ autoplay: true });
    new Carousel(wrapper.querySelector('[data-carousel]'), { interval: 4000 });
    return wrapper;
  },
};
