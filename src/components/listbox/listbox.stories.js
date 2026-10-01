import './listbox.css';
import { Listbox } from './listbox.js';

export default {
  title: 'Componentes/Listbox',
  tags: ['autodocs'],
};

const CHECK = `<svg class="c-listbox__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <g class="c-listbox__check-forbidden" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9" />
    <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke-linecap="round" />
  </g>
</svg>`;

function option({ id, value, text, selected = false, disabled = false }) {
  return `
    <li
      class="c-listbox__option"
      role="option"
      id="${id}"
      data-value="${value}"
      aria-selected="${selected}"
      ${disabled ? 'aria-disabled="true"' : ''}
    >
      ${text}
      ${CHECK}
    </li>`;
}

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento: un contador por render evita que los ids y los
// aria-labelledby de la copia de abajo choquen con los de la de arriba.
let instanceCount = 0;

function renderSimple() {
  const prefix = `simple-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-listbox__label" id="${prefix}-label">Destino</span>
    <ul class="c-listbox" id="${prefix}" role="listbox" aria-labelledby="${prefix}-label" data-listbox>
      ${option({ id: `${prefix}-mad`, value: 'mad', text: 'Madrid', selected: true })}
      ${option({ id: `${prefix}-bcn`, value: 'bcn', text: 'Barcelona' })}
      ${option({ id: `${prefix}-sev`, value: 'sev', text: 'Sevilla' })}
      ${option({ id: `${prefix}-val`, value: 'val', text: 'Valencia (sin plazas)', disabled: true })}
    </ul>
  `;
  new Listbox(wrapper.querySelector('[data-listbox]'));
  return wrapper;
}

function renderMultiple() {
  const prefix = `multiple-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-listbox__label" id="${prefix}-label">Etiquetas</span>
    <ul
      class="c-listbox"
      id="${prefix}"
      role="listbox"
      aria-labelledby="${prefix}-label"
      aria-multiselectable="true"
      data-listbox
      data-name="etiquetas"
    >
      ${option({ id: `${prefix}-urgente`, value: 'urgente', text: 'Urgente', selected: true })}
      ${option({ id: `${prefix}-revision`, value: 'revision', text: 'Revisión', selected: true })}
      ${option({ id: `${prefix}-archivado`, value: 'archivado', text: 'Archivado' })}
      ${option({ id: `${prefix}-borrador`, value: 'borrador', text: 'Borrador' })}
    </ul>
  `;
  new Listbox(wrapper.querySelector('[data-listbox]'));
  return wrapper;
}

function renderGroups() {
  const prefix = `grupos-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span class="c-listbox__label" id="${prefix}-label">Asiento</span>
    <ul class="c-listbox" id="${prefix}" role="listbox" aria-labelledby="${prefix}-label" data-listbox>
      <li class="c-listbox__group" role="presentation">
        <span class="c-listbox__group-label" id="${prefix}-economica-label">Clase económica</span>
        <ul class="c-listbox__group-options" role="group" aria-labelledby="${prefix}-economica-label">
          ${option({ id: `${prefix}-12a`, value: '12a', text: '12A — Pasillo', selected: true })}
          ${option({ id: `${prefix}-12b`, value: '12b', text: '12B — Centro' })}
        </ul>
      </li>
      <li class="c-listbox__group" role="presentation">
        <span class="c-listbox__group-label" id="${prefix}-primera-label">Primera clase</span>
        <ul class="c-listbox__group-options" role="group" aria-labelledby="${prefix}-primera-label">
          ${option({ id: `${prefix}-1a`, value: '1a', text: '1A — Ventana' })}
          ${option({ id: `${prefix}-1b`, value: '1b', text: '1B — Ocupado', disabled: true })}
        </ul>
      </li>
    </ul>
  `;
  new Listbox(wrapper.querySelector('[data-listbox]'));
  return wrapper;
}

export const SeleccionSimple = {
  name: 'Selección simple',
  render: renderSimple,
};

export const SeleccionMultiple = {
  name: 'Selección múltiple',
  render: renderMultiple,
};

export const Grupos = {
  name: 'Grupos de opciones',
  render: renderGroups,
};
