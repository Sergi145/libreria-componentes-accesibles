import '../button/button.css';
import '../close-button/close-button.css';
import './offcanvas.css';
import { Offcanvas } from './offcanvas.js';

export default {
  title: 'Componentes/Offcanvas',
  tags: ['autodocs'],
};

function render(position, { responsive = false } = {}) {
  const id = `story-offcanvas-${position}`;
  const dialogClass = responsive
    ? `c-offcanvas c-offcanvas--${position} c-offcanvas--responsive`
    : `c-offcanvas c-offcanvas--${position}`;
  const triggerClass = responsive
    ? 'c-button c-button--primary c-offcanvas__trigger'
    : 'c-button c-button--primary';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button type="button" class="${triggerClass}" data-offcanvas-trigger="${id}" aria-controls="${id}">
      Abrir filtros
    </button>

    <dialog id="${id}" class="${dialogClass}" tabindex="-1" aria-labelledby="${id}-title">
      <form method="dialog" class="c-offcanvas__content">
        <header class="c-offcanvas__header">
          <h2 id="${id}-title" class="c-offcanvas__title">Filtros</h2>
          <button type="submit" class="c-close-button" aria-label="Cerrar filtros">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="c-offcanvas__body">
          <p>Contenido del panel: formulario de filtros, navegación…</p>
          <p><label><input type="checkbox" /> Solo disponibles</label></p>
          <p><label><input type="checkbox" /> Con descuento</label></p>
        </div>
      </form>
    </dialog>
  `;

  const dialogEl = wrapper.querySelector('dialog');
  const panel = new Offcanvas(dialogEl);
  wrapper
    .querySelector('[data-offcanvas-trigger]')
    .addEventListener('click', () => panel.open());

  return wrapper;
}

export const Start = { render: () => render('start') };
export const End = { render: () => render('end') };
export const Top = { render: () => render('top') };
export const Bottom = { render: () => render('bottom') };

const MOBILE_VIEWPORT = {
  viewports: {
    reflow320: {
      name: 'Reflow 320px',
      styles: { width: '320px', height: '640px' },
      type: 'mobile',
    },
  },
  defaultViewport: 'reflow320',
};

const DESKTOP_VIEWPORT = {
  viewports: {
    escritorio: {
      name: 'Escritorio 1280px',
      styles: { width: '1280px', height: '800px' },
      type: 'desktop',
    },
  },
  defaultViewport: 'escritorio',
};

export const ResponsiveMovil = {
  name: 'Responsive / móvil (320px)',
  parameters: { viewport: MOBILE_VIEWPORT },
  render: () => render('start', { responsive: true }),
};

export const ResponsiveEscritorio = {
  name: 'Responsive / escritorio (1280px)',
  parameters: { viewport: DESKTOP_VIEWPORT },
  render: () => render('start', { responsive: true }),
};
