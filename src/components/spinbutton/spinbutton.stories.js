import '../text-field/text-field.css';
import './spinbutton.css';
import { Spinbutton } from './spinbutton.js';

export default {
  title: 'Componentes/Spinbutton',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que el resto de formularios).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

export const Basico = {
  name: 'Básico (paso entero)',
  render: () => {
    const p = nextPrefix('basico');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}">Cantidad</label>
        <input
          type="text"
          inputmode="decimal"
          class="c-field__control c-spinbutton__input"
          id="${p}"
          name="cantidad"
          role="spinbutton"
          aria-valuenow="1"
          aria-valuemin="1"
          aria-valuemax="10"
          data-step="1"
        />
      </div>
    `;
    new Spinbutton(wrapper.querySelector('[role="spinbutton"]'));
    return wrapper;
  },
};

export const ConFormato = {
  name: 'Paso decimal con data-format',
  render: () => {
    const p = nextPrefix('formato');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}">Peso</label>
        <input
          type="text"
          inputmode="decimal"
          class="c-field__control c-spinbutton__input"
          id="${p}"
          name="peso"
          role="spinbutton"
          aria-valuenow="70"
          aria-valuemin="30"
          aria-valuemax="200"
          data-step="0.5"
          data-step-large="5"
          data-format="{value} kg"
        />
      </div>
    `;
    new Spinbutton(wrapper.querySelector('[role="spinbutton"]'));
    return wrapper;
  },
};

export const SinJs = {
  name: 'Sin JavaScript',
  render: () => {
    const p = nextPrefix('sin-js');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}">Cantidad</label>
        <input
          type="text"
          inputmode="decimal"
          class="c-field__control"
          id="${p}"
          name="cantidad"
          role="spinbutton"
          aria-valuenow="1"
          aria-valuemin="1"
          aria-valuemax="10"
        />
      </div>
    `;
    // A propósito, sin Spinbutton: sin botones −/+, el input sigue
    // siendo un campo de texto normal que se envía igual.
    return wrapper;
  },
};
