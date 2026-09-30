import './scrollspy.css';
import './scrollspy.stories.css';
import { Scrollspy } from './scrollspy.js';

export default {
  title: 'Componentes/Scrollspy',
  tags: ['autodocs'],
  parameters: {
    docs: {
      // La historia necesita hacer scroll de verdad: en la página Docs se
      // renderiza en un iframe propio, para que el IntersectionObserver
      // observe el scroll de la historia y no el de la página de Docs.
      story: { inline: false, iframeHeight: 420 },
    },
  },
};

const SECTIONS = [
  {
    id: 'introduccion',
    title: 'Introducción',
    text: 'Una tabla de contenidos que sigue tu lectura. Desplázate para ver cómo cambia el enlace resaltado.',
  },
  {
    id: 'uso',
    title: 'Uso',
    text: 'El enlace de la sección visible lleva aria-current="true". Nunca se mueve el foco.',
  },
  {
    id: 'accesibilidad',
    title: 'Accesibilidad',
    text: 'El lector de pantalla no anuncia los cambios: es contexto, no una notificación.',
  },
  {
    id: 'pruebas',
    title: 'Pruebas',
    text: 'Se prueba con un IntersectionObserver de mentira, porque jsdom no lo implementa.',
  },
];

// La página "Docs" de Storybook puede renderizar cada historia más de una
// vez en el mismo documento, así que los ids de sección se generan nuevos
// en cada render() con un contador (los href="#id" deben apuntar a ellos).
let instanceCount = 0;

export const Basica = {
  name: 'Básica',
  render: () => {
    const prefix = `spy-${instanceCount++}-`;
    const wrapper = document.createElement('div');
    wrapper.className = 'scrollspy-demo';
    wrapper.innerHTML = `
      <div class="scrollspy-demo__nav">
        <nav class="c-scrollspy" aria-label="En esta página" data-scrollspy>
          <ul class="c-scrollspy__list">
            ${SECTIONS.map(
              (s) =>
                `<li><a class="c-scrollspy__link" href="#${prefix}${s.id}">${s.title}</a></li>`
            ).join('')}
          </ul>
        </nav>
      </div>
      <div>
        ${SECTIONS.map(
          (s) => `
            <section class="scrollspy-demo__section" id="${prefix}${s.id}">
              <h2>${s.title}</h2>
              <p>${s.text}</p>
            </section>`
        ).join('')}
      </div>
    `;
    return wrapper;
  },
  // Scrollspy busca las secciones con getElementById: hay que inicializarlo
  // cuando el marcado ya está en el documento, es decir, en play().
  play: ({ canvasElement }) => {
    const nav = canvasElement.querySelector('[data-scrollspy]');
    new Scrollspy(nav);

    // Solo para Storybook: dentro de su interfaz, un enlace "#sección" de
    // una historia navega la ventana SUPERIOR a iframe.html?...#sección
    // (sales de la interfaz y no se ve el scroll). Se hace el scroll a
    // mano. En una página real esto no hace falta: el enlace nativo ya
    // desplaza a la sección (con Enter o con clic) y respeta scroll-margin.
    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      const section = link && document.getElementById(link.hash.slice(1));
      if (!section) return;
      event.preventDefault();
      section.scrollIntoView();
    });
  },
};
