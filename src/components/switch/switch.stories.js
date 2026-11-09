import './switch.css';
import { initSwitch } from './switch.js';

export default {
  title: 'Componentes/Switch',
  tags: ['autodocs'],
};

function icons() {
  return `
    <svg class="c-switch__icon c-switch__icon--off" viewBox="0 0 24 24" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <svg class="c-switch__icon c-switch__icon--on" viewBox="0 0 24 24" focusable="false">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

function toggle({ label, checked = false, disabled = false }) {
  return `
    <button type="button" role="switch" class="c-switch"
      aria-checked="${checked}" ${disabled ? 'disabled' : ''}>
      <span class="c-switch__label">${label}</span>
      <span class="c-switch__control" aria-hidden="true">
        <span class="c-switch__track">
          <span class="c-switch__thumb">${icons()}</span>
        </span>
      </span>
    </button>
  `;
}

function render(options) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = toggle(options);
  initSwitch(wrapper);
  return wrapper;
}

export const Apagado = {
  render: () => render({ label: 'Modo oscuro' }),
};

export const Encendido = {
  render: () => render({ label: 'Notificaciones push', checked: true }),
};

export const Deshabilitado = {
  render: () =>
    render({
      label: 'Sincronización automática (requiere plan Pro)',
      disabled: true,
    }),
};
