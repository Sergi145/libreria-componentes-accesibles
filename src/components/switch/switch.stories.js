import './switch.css';

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
    <label class="c-switch">
      <span class="c-switch__label">${label}</span>
      <span class="c-switch__control">
        <input type="checkbox" role="switch" class="c-switch__input"
          ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
        <span class="c-switch__track" aria-hidden="true">
          <span class="c-switch__thumb">${icons()}</span>
        </span>
      </span>
    </label>
  `;
}

export const Apagado = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = toggle({ label: 'Modo oscuro' });
    return wrapper;
  },
};

export const Encendido = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = toggle({
      label: 'Notificaciones push',
      checked: true,
    });
    return wrapper;
  },
};

export const Deshabilitado = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = toggle({
      label: 'Sincronización automática (requiere plan Pro)',
      disabled: true,
    });
    return wrapper;
  },
};
