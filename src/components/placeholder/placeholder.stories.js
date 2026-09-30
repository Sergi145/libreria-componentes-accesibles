import './placeholder.css';
import '../button/button.css';
import { announce, initLiveRegions } from '../../utils/live-region.js';

export default {
  title: 'Componentes/Placeholder',
  tags: ['autodocs'],
};

const CARD = `
  <div class="c-placeholder-group" aria-busy="true">
    <div class="c-placeholder c-placeholder--media" aria-hidden="true"></div>
    <div class="c-placeholder c-placeholder--title" aria-hidden="true"></div>
    <div class="c-placeholder" aria-hidden="true"></div>
    <div class="c-placeholder c-placeholder--medium" aria-hidden="true"></div>
    <div class="c-placeholder c-placeholder--short" aria-hidden="true"></div>
  </div>
`;

const PROFILE = `
  <div class="c-placeholder-group" aria-busy="true">
    <div style="display: flex; align-items: center; gap: 1rem">
      <div class="c-placeholder c-placeholder--avatar" aria-hidden="true"></div>
      <div class="c-placeholder-group" style="flex: 1">
        <div class="c-placeholder c-placeholder--title" aria-hidden="true"></div>
        <div class="c-placeholder c-placeholder--short" aria-hidden="true"></div>
      </div>
    </div>
    <div class="c-placeholder" aria-hidden="true"></div>
    <div class="c-placeholder c-placeholder--medium" aria-hidden="true"></div>
  </div>
`;

export const Tarjeta = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = CARD;
    return wrapper;
  },
};

export const Perfil = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = PROFILE;
    return wrapper;
  },
};

export const Simulado = {
  name: 'Simulado (carga con aviso)',
  render: () => {
    // Las regiones vivas deben existir antes del primer aviso.
    initLiveRegions();
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.justifyItems = 'start';
    wrapper.style.gap = '0.75rem';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--primary';
    button.textContent = 'Cargar artículo';
    button.style.maxInlineSize = '100%';

    const area = document.createElement('div');
    area.style.inlineSize = '100%';
    let running = false;

    button.addEventListener('click', () => {
      if (running) return;
      running = true;
      button.setAttribute('aria-disabled', 'true');
      area.innerHTML = CARD;
      // aria-busy no avisa por sí solo: el aviso va por una región viva.
      announce('Cargando contenido…');

      setTimeout(() => {
        area.innerHTML = `
          <article>
            <h3 style="margin: 0 0 0.5rem">Artículo cargado</h3>
            <p style="margin: 0">Este es el contenido real que sustituye al esqueleto.</p>
          </article>
        `;
        announce('Contenido cargado');
        button.removeAttribute('aria-disabled');
        running = false;
      }, 3000);
    });

    wrapper.append(button, area);
    return wrapper;
  },
};
