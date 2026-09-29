import './tabs.css';
import { Tabs } from './tabs.js';

export default {
  title: 'Componentes/Tabs',
  tags: ['autodocs'],
};

const ITEMS = [
  {
    id: 'datos',
    label: 'Datos personales',
    content: 'Formulario con nombre, apellidos y correo de contacto.',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    content: 'Cambio de contraseña y verificación en dos pasos.',
  },
  {
    id: 'notificaciones',
    label: 'Notificaciones',
    content: 'Preferencias de correo y notificaciones push.',
  },
];

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que cada llamada a render() necesita un
// prefijo de id nuevo (ver el mismo fix en accordion.stories.js).
let instanceCount = 0;

function tabButton({ tabId, panelId, label, selected }) {
  return `
    <button type="button" class="c-tabs__tab" id="${tabId}" role="tab"
      aria-selected="${selected}" aria-controls="${panelId}">
      ${label}
    </button>`;
}

function tabPanel({ tabId, panelId, content, selected }) {
  return `
  <div class="c-tabs__panel" id="${panelId}" role="tabpanel"
    aria-labelledby="${tabId}" tabindex="0" ${selected ? '' : 'hidden'}>
    <p>${content}</p>
  </div>`;
}

// Construye el marcado como una plantilla HTML indentada (como
// accordion.stories.js) en vez de con createElement/append: así el
// panel "Show code" de Storybook, que serializa el DOM ya renderizado,
// muestra el mismo espaciado en vez de todo en una sola línea.
function render({ orientation = 'horizontal', activation = 'automatic' } = {}) {
  const uid = `tabs-${instanceCount++}`;
  const ids = ITEMS.map(({ id }) => ({
    tabId: `${uid}-tab-${id}`,
    panelId: `${uid}-panel-${id}`,
  }));

  const wrapper = document.createElement('div');
  wrapper.className =
    orientation === 'vertical' ? 'c-tabs c-tabs--vertical' : 'c-tabs';
  wrapper.innerHTML = `
  <div class="c-tabs__list" role="tablist" aria-label="Datos del perfil"${orientation === 'vertical' ? ' aria-orientation="vertical"' : ''}>${ITEMS.map(
    (item, index) =>
      tabButton({ ...ids[index], label: item.label, selected: index === 0 })
  ).join('')}
  </div>
  ${ITEMS.map((item, index) =>
    tabPanel({ ...ids[index], content: item.content, selected: index === 0 })
  ).join('')}
  `;

  new Tabs(wrapper.querySelector('.c-tabs__list'), { activation });
  return wrapper;
}

export const Automatica = {
  name: 'Activación automática',
  render: () => render({ activation: 'automatic' }),
};

export const Manual = {
  name: 'Activación manual',
  render: () => render({ activation: 'manual' }),
};

export const Vertical = {
  render: () => render({ orientation: 'vertical' }),
};
