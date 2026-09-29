import './button.css';
import { Button, ToggleButton } from './button.js';

export default {
  title: 'Componentes/Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'base', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Guardar cambios',
    variant: 'primary',
    size: 'base',
    disabled: false,
  },
};

function render({ label, variant, size, disabled }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `c-button c-button--${variant}`;
  if (size !== 'base') button.classList.add(`c-button--${size}`);
  button.textContent = label;
  if (disabled) button.disabled = true;
  return button;
}

export const Primary = { render };

export const Secondary = { render, args: { variant: 'secondary' } };

export const Danger = {
  render,
  args: { variant: 'danger', label: 'Eliminar cuenta' },
};

export const Deshabilitado = { render, args: { disabled: true } };

export const CargandoEstado = {
  name: 'Estado de carga (interactivo)',
  render: (args) => {
    const button = render(args);
    button.textContent = 'Enviar formulario';
    const instance = new Button(button);
    button.addEventListener('click', () => {
      instance.setLoading(true);
      setTimeout(() => instance.setLoading(false), 1500);
    });
    return button;
  },
};

export const Toggle = {
  name: 'ToggleButton (aria-pressed)',
  render: () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--secondary';
    button.setAttribute('aria-pressed', 'false');
    button.textContent = 'Favorito';
    new ToggleButton(button);
    return button;
  },
};

export const SoloIcono = {
  name: 'Botón solo icono',
  render: () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--secondary';
    button.setAttribute('aria-label', 'Buscar');
    button.innerHTML = `
      <svg class="c-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M20 20l-3.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
    return button;
  },
};

export const EnlaceDeshabilitado = {
  name: 'Enlace-botón deshabilitado',
  render: () => {
    const link = document.createElement('a');
    link.className = 'c-button c-button--secondary';
    link.setAttribute('role', 'button');
    link.setAttribute('aria-disabled', 'true');
    link.textContent = 'Editar (no disponible)';
    return link;
  },
};
