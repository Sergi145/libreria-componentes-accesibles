import '../listbox/listbox.css';
import '../text-field/text-field.css';
import './combobox.css';
import { Combobox, SelectCombobox } from './combobox.js';

export default {
  title: 'Componentes/Combobox',
  tags: ['autodocs'],
};

const CHECK = `<svg class="c-listbox__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <g class="c-listbox__check-forbidden" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9" />
    <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke-linecap="round" />
  </g>
</svg>`;

const DESTINOS = ['Madrid', 'Ávila', 'Barcelona', 'Burgos', 'Málaga', 'Murcia'];
const PAISES = ['España', 'Portugal', 'Francia'];

function option(id, text) {
  return `
    <li class="c-listbox__option" role="option" id="${id}" data-value="${text.toLowerCase()}" aria-selected="false">
      ${text}
      ${CHECK}
    </li>`;
}

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento: un contador por render evita que los ids
// choquen entre la copia de arriba y la de la lista de más abajo.
let instanceCount = 0;

function render({ label, items, strict = false }) {
  const prefix = `combobox-${instanceCount++}`;
  const wrapper = document.createElement('div');
  // Espacio para que el popup, con position:absolute, no quede cortado
  // por el borde del canvas de Storybook.
  wrapper.style.paddingBlockEnd = '14rem';
  wrapper.innerHTML = `
    <div class="c-combobox">
      <label class="c-combobox__label" for="${prefix}" id="${prefix}-label">${label}</label>
      <input
        type="text"
        class="c-combobox__input"
        id="${prefix}"
        name="${prefix}"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
        aria-controls="${prefix}-listbox"
        autocomplete="off"
        data-combobox
        ${strict ? 'data-strict' : ''}
      />
      <ul class="c-listbox c-combobox__popup" id="${prefix}-listbox" role="listbox" aria-labelledby="${prefix}-label" hidden>
        ${items.map((text, i) => option(`${prefix}-opt-${i}`, text)).join('')}
      </ul>
      <p class="c-combobox__empty" hidden>Sin resultados</p>
    </div>
  `;

  new Combobox(wrapper.querySelector('[data-combobox]'));
  return wrapper;
}

export const Editable = {
  render: () => render({ label: 'Destino', items: DESTINOS }),
};

export const ModoEstricto = {
  name: 'Modo estricto (data-strict)',
  render: () =>
    render({
      label: 'País (elige uno de la lista)',
      items: PAISES,
      strict: true,
    }),
};

function renderSoloSeleccion() {
  const prefix = `asiento-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.style.paddingBlockEnd = '14rem';
  wrapper.innerHTML = `
    <div class="c-combobox">
      <label for="${prefix}">Asiento</label>
      <select id="${prefix}" name="${prefix}" data-combobox>
        <optgroup label="Clase económica">
          <option value="12a">12A — Pasillo</option>
          <option value="12b" selected>12B — Centro</option>
        </optgroup>
        <optgroup label="Primera clase">
          <option value="1a">1A — Ventana</option>
          <option value="1b" disabled>1B — Ocupado</option>
        </optgroup>
      </select>
    </div>
  `;

  new SelectCombobox(wrapper.querySelector('[data-combobox]'));
  return wrapper;
}

export const SoloSeleccion = {
  name: 'Solo-selección (sobre un select)',
  render: renderSoloSeleccion,
};
