import './spinner.css';
import '../button/button.css';
import { announce, initLiveRegions } from '../../utils/live-region.js';

export default {
  title: 'Componentes/Spinner',
  tags: ['autodocs'],
};

function spinnerMarkup(text, modifier = '') {
  return `
    <div class="c-spinner${modifier}" role="status">
      <span class="c-spinner__circle" aria-hidden="true"></span>
      <span class="c-spinner__sr-text">${text}</span>
    </div>
  `;
}

export const Tamanos = {
  name: 'Tamaños',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '1.5rem';
    wrapper.innerHTML = [
      spinnerMarkup('Cargando (pequeño)…', ' c-spinner--sm'),
      spinnerMarkup('Cargando…'),
      spinnerMarkup('Cargando (grande)…', ' c-spinner--lg'),
    ].join('');
    return wrapper;
  },
};

export const Dinamico = {
  name: 'Dinámico (insertado por JS)',
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
    button.textContent = 'Cargar datos';
    button.style.maxInlineSize = '100%';

    const area = document.createElement('div');
    let running = false;

    button.addEventListener('click', () => {
      if (running) return;
      running = true;
      button.setAttribute('aria-disabled', 'true');

      // Un role="status" insertado a la vez que su texto no se anuncia de
      // forma fiable: primero el contenedor vacío…
      area.innerHTML = `
        <div class="c-spinner" role="status">
          <span class="c-spinner__circle" aria-hidden="true"></span>
          <span class="c-spinner__sr-text"></span>
        </div>
      `;
      // …y el texto en el siguiente tick, con la región ya en el DOM.
      setTimeout(() => {
        area.querySelector('.c-spinner__sr-text').textContent = 'Cargando…';
      }, 0);

      setTimeout(() => {
        area.textContent = 'Datos cargados.';
        // El spinner (y su role="status") desaparece: sin este aviso, el
        // usuario de lector no sabría que la carga ha terminado.
        announce('Datos cargados');
        button.removeAttribute('aria-disabled');
        running = false;
      }, 3000);
    });

    wrapper.append(button, area);
    return wrapper;
  },
};
