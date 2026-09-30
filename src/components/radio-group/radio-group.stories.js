import './radio-group.css';
import '../text-field/text-field.css';
import '../button/button.css';
import { initRadioGroups } from './radio-group.js';

export default {
  title: 'Componentes/Radio group',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que Text field y Checkbox).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

export const Basico = {
  name: 'Grupo simple',
  render: () => {
    const p = nextPrefix('basico');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <fieldset class="c-radio-group" id="${p}-tema" role="radiogroup" aria-labelledby="${p}-tema-legend">
        <legend class="c-radio-group__legend" id="${p}-tema-legend">Tema de la interfaz</legend>
        <div class="c-radio">
          <input class="c-radio__input" type="radio" id="${p}-claro" name="${p}-tema" value="claro" checked />
          <label class="c-radio__label" for="${p}-claro">Claro</label>
        </div>
        <div class="c-radio">
          <input class="c-radio__input" type="radio" id="${p}-oscuro" name="${p}-tema" value="oscuro" />
          <label class="c-radio__label" for="${p}-oscuro">Oscuro</label>
        </div>
        <div class="c-radio">
          <input class="c-radio__input" type="radio" id="${p}-sistema" name="${p}-tema" value="sistema" />
          <label class="c-radio__label" for="${p}-sistema">Igual que el sistema</label>
        </div>
      </fieldset>
    `;
    return wrapper;
  },
};

export const Obligatorio = {
  name: 'Obligatorio, con validación en vivo',
  render: () => {
    const p = nextPrefix('obligatorio');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <fieldset class="c-radio-group" id="${p}-preferencia" role="radiogroup"
        aria-labelledby="${p}-preferencia-legend" data-radio-group data-required>
        <legend class="c-radio-group__legend" id="${p}-preferencia-legend">
          Preferencia de contacto <span class="c-radio-group__required">(obligatorio)</span>
        </legend>
        <div class="c-radio">
          <input class="c-radio__input" type="radio" id="${p}-email" name="${p}-contacto" value="email" />
          <label class="c-radio__label" for="${p}-email">Correo electrónico</label>
        </div>
        <div class="c-radio">
          <input class="c-radio__input" type="radio" id="${p}-tel" name="${p}-contacto" value="tel" />
          <label class="c-radio__label" for="${p}-tel">Teléfono</label>
        </div>
      </fieldset>
      <button type="button" class="c-button c-button--secondary">Validar</button>
    `;

    const [group] = initRadioGroups(wrapper);
    wrapper
      .querySelector('button')
      .addEventListener('click', () => group.validate());

    return wrapper;
  },
};
