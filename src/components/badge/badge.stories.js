import './badge.css';
import '../button/button.css';

export default {
  title: 'Componentes/Badge',
  tags: ['autodocs'],
};

export const Variantes = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '0.5rem';
    wrapper.innerHTML = `
      <span class="c-badge">Nuevo</span>
      <span class="c-badge c-badge--neutral">Borrador</span>
      <span class="c-badge c-badge--success">Activo</span>
      <span class="c-badge c-badge--warning">Pendiente</span>
      <span class="c-badge c-badge--danger">Error</span>
      <span class="c-badge c-badge--info">Beta</span>
    `;
    return wrapper;
  },
};

export const EnBoton = {
  name: 'Contador en un botón',
  render: () => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--secondary';
    button.style.maxInlineSize = '100%';
    button.innerHTML = `
      Mensajes
      <span class="c-badge c-badge--danger">
        3
        <span class="c-badge__sr-text">mensajes sin leer</span>
      </span>
    `;
    return button;
  },
};

export const EnEncabezado = {
  name: 'Contador en un encabezado',
  render: () => {
    const heading = document.createElement('h2');
    heading.style.margin = '0';
    heading.style.fontFamily = 'var(--font-family-base)';
    heading.innerHTML = `
      Notificaciones
      <span class="c-badge c-badge--info">
        12
        <span class="c-badge__sr-text">sin leer</span>
      </span>
    `;
    return heading;
  },
};
