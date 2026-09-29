import './button.css';
import { Button } from './button.js';

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
