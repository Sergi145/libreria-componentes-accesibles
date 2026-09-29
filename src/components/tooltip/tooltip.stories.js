import '../button/button.css';
import './tooltip.css';
import { Tooltip } from './tooltip.js';

export default {
  title: 'Componentes/Tooltip',
  tags: ['autodocs'],
};

function renderTextoComplementario() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-tooltip">
      <button type="button" class="c-button c-button--primary" aria-describedby="story-tooltip-guardar">
        Guardar
      </button>
      <span role="tooltip" id="story-tooltip-guardar" class="c-tooltip__bubble">
        Atajo: Ctrl + S
      </span>
    </span>
  `;

  new Tooltip(wrapper.querySelector('button'));

  return wrapper;
}

function renderSoloIcono() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-tooltip">
      <button type="button" class="c-button c-button--secondary" aria-labelledby="story-tooltip-copiar">
        <svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="9" y="9" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
      <span role="tooltip" id="story-tooltip-copiar" class="c-tooltip__bubble c-tooltip__bubble--top">
        Copiar enlace
      </span>
    </span>
  `;

  // aria-labelledby apunta directo al <span role="tooltip">: el propio
  // texto del tooltip es el nombre accesible del botón, sin duplicarlo
  // en aria-label (ver tooltip.js y tooltip.test.js).
  new Tooltip(wrapper.querySelector('button'));

  return wrapper;
}

function renderElementoDeshabilitado() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-tooltip">
      <span tabindex="0" aria-describedby="story-tooltip-continuar">
        <button type="button" class="c-button c-button--primary" disabled>
          Continuar
        </button>
      </span>
      <span role="tooltip" id="story-tooltip-continuar" class="c-tooltip__bubble">
        Completa el formulario para continuar
      </span>
    </span>
  `;

  new Tooltip(wrapper.querySelector('[tabindex="0"]'));

  return wrapper;
}

export const TextoComplementario = { render: renderTextoComplementario };
export const SoloIcono = { render: renderSoloIcono };
export const ElementoDeshabilitado = { render: renderElementoDeshabilitado };

// El tooltip pedido debajo no cabe en el contenedor (recorta con
// overflow): se coloca solo arriba.
function renderColocacionAutomatica() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="story-tooltip-caja" style="overflow: hidden; block-size: 7rem; inline-size: 20rem; border: 1px dashed currentcolor; display: flex; align-items: flex-end; justify-content: center; padding: 0.5rem">
      <span class="c-tooltip">
        <button type="button" class="c-button c-button--primary" aria-describedby="story-tooltip-auto">
          Guardar
        </button>
        <span role="tooltip" id="story-tooltip-auto" class="c-tooltip__bubble">
          No cabe abajo: se coloca arriba
        </span>
      </span>
    </div>
  `;

  new Tooltip(wrapper.querySelector('button'));

  return wrapper;
}

export const ColocacionAutomatica = { render: renderColocacionAutomatica };
