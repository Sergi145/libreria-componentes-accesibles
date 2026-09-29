import './navbar.css';
import '../skip-link/skip-link.css';
import './navbar.stories.css';
import { Navbar } from './navbar.js';

export default {
  title: 'Componentes/Navbar',
  tags: ['autodocs'],
};

// SVG autocontenido (data URI) solo para que la historia se vea sin
// depender de un archivo externo; en un proyecto real, src apuntaría al
// logo real (p. ej. "logo.svg").
const LOGO_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%234338ca'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-family='system-ui,sans-serif' font-size='13' font-weight='700' fill='%23fff'%3ELC%3C/text%3E%3C/svg%3E";

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que cada llamada a render() necesita ids
// nuevos (ver el mismo fix en accordion.stories.js).
let instanceCount = 0;

function render() {
  const uid = instanceCount++;
  const menuId = `navbar-demo-menu-${uid}`;
  const mainId = `navbar-demo-contenido-${uid}`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <a class="c-skip-link" href="#${mainId}">Saltar al contenido principal</a>

    <header>
      <nav class="c-navbar" aria-label="Principal" data-navbar>
        <a class="c-navbar__brand" href="/">
          <img src="${LOGO_SRC}" alt="Librería de componentes — Inicio" height="32" />
        </a>

        <button type="button" class="c-navbar__toggle" aria-controls="${menuId}" aria-expanded="false" aria-label="Menú">
          <svg class="c-navbar__toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="c-navbar__menu" id="${menuId}" hidden>
          <ul class="c-navbar__list">
            <li><a class="c-navbar__link" href="/" aria-current="page">Inicio</a></li>
            <li><a class="c-navbar__link" href="/servicios">Servicios</a></li>
            <li><a class="c-navbar__link" href="/contacto">Contacto</a></li>
          </ul>
        </div>
      </nav>
    </header>

    <main id="${mainId}" tabindex="-1" class="navbar-demo__main">
      <h1>Título de la página</h1>
      <p>Contenido principal de ejemplo.</p>
    </main>
  `;

  new Navbar(wrapper.querySelector('[data-navbar]'));
  return wrapper;
}

export const Default = { render };

export const Reflow320px = {
  name: 'Reflow a 320px (WCAG 1.4.10)',
  parameters: {
    viewport: {
      viewports: {
        reflow320: {
          name: 'Reflow 320px',
          styles: { width: '320px', height: '640px' },
          type: 'mobile',
        },
      },
      defaultViewport: 'reflow320',
    },
  },
  render,
};
