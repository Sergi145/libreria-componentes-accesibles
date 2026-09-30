import './toast.css';
import '../button/button.css';
import '../close-button/close-button.css';
import { Toast, showToast } from './toast.js';

export default {
  title: 'Componentes/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      // La región de toasts es `position: fixed`. En la página Docs las
      // historias van dentro de un contenedor con `transform`, y ahí
      // «fixed» se pega al contenedor en vez de a la ventana (el toast se
      // sale por un lado y tapa los botones). En un iframe, la ventana es
      // la de la historia y el toast se comporta como en una página real.
      story: { inline: false, iframeHeight: 380 },
    },
  },
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

const TEXTS = {
  info: 'Hay una versión nueva disponible.',
  success: 'Cambios guardados.',
  warning: 'Tu sesión caducará pronto.',
  danger: 'No se pudo guardar el documento.',
};

/**
 * Toast escrito en el HTML y ya visible, en el flujo de la página (no en
 * la región fija) para que se vea en la historia sin tapar el catálogo.
 */
function staticToast(variant) {
  const el = document.createElement('div');
  el.className = `c-toast c-toast--${variant}`;
  el.setAttribute('data-toast', '');
  el.setAttribute('data-toast-variant', variant);
  el.innerHTML = `
    <svg class="c-toast__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[variant]}</g>
    </svg>
    <p class="c-toast__body" data-toast-body>
      <span class="c-toast__sr-text">${PREFIXES[variant]}</span>
      ${TEXTS[variant]}
    </p>
    <button type="button" class="c-close-button c-toast__close"
      aria-label="Cerrar notificación" data-toast-close>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  `;
  new Toast(el);
  return el;
}

/**
 * Muestra un toast desde el botón `opener` con `after`: la región del
 * toast se crea justo después del botón, así que el siguiente Tab llega a
 * él, y se quita entera al cerrarlo. El foco NO se mueve solo.
 *
 * Solo hay un toast a la vez por historia: si ya hay uno visible, pulsar
 * otro botón no genera otro.
 */
function createOpener() {
  let current = null;
  return function openToast(opener, message, options) {
    if (current?.el.isConnected) return current;
    current = showToast(message, { ...options, after: opener });
    return current;
  };
}

export const Variantes = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '0.75rem';
    wrapper.style.maxInlineSize = '24rem';
    wrapper.append(
      ...['info', 'success', 'warning', 'danger'].map((v) => staticToast(v))
    );
    return wrapper;
  },
};

export const Dinamica = {
  name: 'Dinámica (showToast)',
  render: () => {
    const wrapper = document.createElement('div');
    // Rejilla adaptable: una columna a 320 px, varias en pantallas anchas.
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns =
      'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))';
    wrapper.style.gap = '0.75rem';

    const openToast = createOpener();
    const buttons = [
      ['info', 'Mostrar información'],
      ['success', 'Mostrar éxito'],
      ['warning', 'Mostrar aviso'],
      ['danger', 'Mostrar error'],
    ].map(([variant, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `c-button c-button--${variant === 'danger' ? 'danger' : 'secondary'}`;
      button.textContent = label;
      button.addEventListener('click', () =>
        openToast(button, TEXTS[variant], { variant })
      );
      return button;
    });

    wrapper.append(...buttons);
    return wrapper;
  },
};
