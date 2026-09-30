import './checkbox.css';
import '../text-field/text-field.css';
import { initCheckboxGroups } from './checkbox.js';

export default {
  title: 'Componentes/Checkbox',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que Text field).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

export const Basicas = {
  name: 'Básicas',
  render: () => {
    const p = nextPrefix('basicas');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-checkbox">
        <input class="c-checkbox__input" type="checkbox" id="${p}-novedades" name="novedades" />
        <label class="c-checkbox__label" for="${p}-novedades">
          Recibir novedades por correo
        </label>
      </div>

      <div class="c-checkbox">
        <input class="c-checkbox__input" type="checkbox" id="${p}-recordar" name="recordar" checked />
        <label class="c-checkbox__label" for="${p}-recordar">Recordar mi sesión</label>
      </div>
    `;
    return wrapper;
  },
};

export const Deshabilitada = {
  render: () => {
    const p = nextPrefix('deshabilitada');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-checkbox">
        <input class="c-checkbox__input" type="checkbox" id="${p}-plan" name="plan" checked disabled />
        <label class="c-checkbox__label" for="${p}-plan">
          Facturación anual (incluida en tu plan)
        </label>
      </div>
    `;
    return wrapper;
  },
};

export const Obligatoria = {
  name: 'Obligatoria, con error (aria-invalid)',
  render: () => {
    const p = nextPrefix('obligatoria');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-checkbox">
        <input
          class="c-checkbox__input"
          type="checkbox"
          id="${p}-terminos"
          name="terminos"
          required
          aria-invalid="true"
          aria-describedby="${p}-terminos-error"
        />
        <label class="c-checkbox__label" for="${p}-terminos">
          Acepto los términos y condiciones
          <span class="c-checkbox__required">(obligatorio)</span>
        </label>
      </div>
      <div data-field-error="${p}-terminos">
        <p class="c-field__error" id="${p}-terminos-error">
          <svg class="c-field__error-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Este campo es obligatorio
        </p>
      </div>
    `;
    return wrapper;
  },
};

export const EstadoMixto = {
  name: 'Estado mixto (Seleccionar todo)',
  render: () => {
    const p = nextPrefix('mixto');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <fieldset class="c-checkbox-group" data-checkbox-group>
        <legend class="c-checkbox-group__legend">Notificaciones</legend>

        <div class="c-checkbox">
          <input class="c-checkbox__input" type="checkbox" id="${p}-todas" data-checkbox-parent />
          <label class="c-checkbox__label" for="${p}-todas"><strong>Seleccionar todo</strong></label>
        </div>

        <div class="c-checkbox-group__children">
          <div class="c-checkbox">
            <input class="c-checkbox__input" type="checkbox" id="${p}-pedidos" checked />
            <label class="c-checkbox__label" for="${p}-pedidos">Estado de mis pedidos</label>
          </div>
          <div class="c-checkbox">
            <input class="c-checkbox__input" type="checkbox" id="${p}-envios" />
            <label class="c-checkbox__label" for="${p}-envios">Actualizaciones de envío</label>
          </div>
          <div class="c-checkbox">
            <input class="c-checkbox__input" type="checkbox" id="${p}-ofertas" />
            <label class="c-checkbox__label" for="${p}-ofertas">Ofertas y promociones</label>
          </div>
        </div>
      </fieldset>
    `;
    initCheckboxGroups(wrapper);
    return wrapper;
  },
};
