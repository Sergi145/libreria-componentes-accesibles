import './alert.css';
import '../button/button.css';
import '../close-button/close-button.css';
import { Alert, showAlert } from './alert.js';

export default {
  title: 'Componentes/Alert',
  tags: ['autodocs'],
};

const ICONS = {
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />',
  success: '<circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />',
  warning: '<path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" />',
  danger: '<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />',
};

const PREFIXES = {
  info: 'Información:',
  success: 'Correcto:',
  warning: 'Aviso:',
  danger: 'Error:',
};

const ROLES = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

const TEXTS = {
  info: 'Tu sesión caducará en 10 minutos.',
  success: 'Los cambios se han guardado.',
  warning: 'Quedan pocas unidades de este producto.',
  danger: 'No se pudo enviar el formulario.',
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan nuevos en cada
// render() con un contador.
let instanceCount = 0;

function alertMarkup(variant, { dismissible = false, returnId = '' } = {}) {
  return `
    <div class="c-alert c-alert--${variant}" role="${ROLES[variant]}"
      ${dismissible ? 'data-alert' : ''}
      ${returnId ? `data-alert-return="${returnId}"` : ''}>
      <svg class="c-alert__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[variant]}</g>
      </svg>
      <p class="c-alert__body">
        <span class="c-alert__sr-text">${PREFIXES[variant]}</span>
        ${TEXTS[variant]}
      </p>
      ${
        dismissible
          ? `<button type="button" class="c-close-button c-alert__close"
              aria-label="Cerrar alerta" data-alert-close>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>`
          : ''
      }
    </div>
  `;
}

export const Variantes = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '0.75rem';
    wrapper.innerHTML = ['info', 'success', 'warning', 'danger']
      .map((variant) => alertMarkup(variant))
      .join('');
    return wrapper;
  },
};

export const Descartable = {
  render: () => {
    const fieldId = `alert-campo-${instanceCount++}`;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '0.75rem';
    wrapper.innerHTML = `
      ${alertMarkup('danger', { dismissible: true, returnId: fieldId })}
      <div>
        <label for="${fieldId}">Correo electrónico</label>
        <input id="${fieldId}" type="email" />
      </div>
    `;
    new Alert(wrapper.querySelector('[data-alert]'));
    return wrapper;
  },
};

export const Dinamica = {
  name: 'Dinámica (showAlert)',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '0.75rem';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--danger';
    button.textContent = 'Mostrar error';
    // Ancho del contenido en pantallas grandes, sin salirse en pequeñas.
    button.style.justifySelf = 'start';
    button.style.maxInlineSize = '100%';

    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '0.75rem';

    button.addEventListener('click', () => {
      const alert = showAlert(container, 'No se pudo guardar el documento.', {
        variant: 'danger',
        dismissible: true,
      });
      // Al cerrarla, el foco vuelve al botón que la abrió; mientras está
      // abierta, se lleva al botón de cierre para poder descartarla ya.
      alert.returnFocus = button;
      alert.el.querySelector('[data-alert-close]').focus();
    });

    wrapper.append(button, container);
    return wrapper;
  },
};
