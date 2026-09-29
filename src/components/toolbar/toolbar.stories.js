import './toolbar.css';
import { Toolbar } from './toolbar.js';
import { ToggleButton } from '../button/button.js';

export default {
  title: 'Componentes/Toolbar',
  tags: ['autodocs'],
};

function item(label, { pressed } = {}) {
  const pressedAttr = pressed !== undefined ? ` aria-pressed="${pressed}"` : '';
  return `<button type="button" class="c-toolbar__item"${pressedAttr}>${label}</button>`;
}

function group(label, itemsHtml) {
  return `
    <div class="c-toolbar__group" role="group" aria-label="${label}">
      ${itemsHtml.join('\n      ')}
    </div>`;
}

// Construye el marcado como una plantilla HTML indentada (como
// accordion.stories.js) en vez de con createElement/append: así el
// panel "Show code" de Storybook, que serializa el DOM ya renderizado,
// muestra el mismo espaciado en vez de todo en una sola línea.
function render(orientation) {
  const toolbar = document.createElement('div');
  toolbar.className = 'c-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Formato de texto');
  if (orientation === 'vertical') {
    toolbar.setAttribute('aria-orientation', 'vertical');
  }

  toolbar.innerHTML = `
    ${group('Estilo de texto', [
      item('Negrita', { pressed: false }),
      item('Cursiva', { pressed: false }),
      item('Subrayado', { pressed: false }),
    ])}
    ${group('Alineación', [item('Izquierda'), item('Centro'), item('Derecha')])}
  `;

  // ToggleButton alterna aria-pressed al clic; Toolbar solo gestiona el
  // foco compartido, así que se combinan como dos piezas independientes.
  toolbar
    .querySelectorAll('.c-toolbar__item[aria-pressed]')
    .forEach((button) => new ToggleButton(button));

  new Toolbar(toolbar);
  return toolbar;
}

export const Horizontal = {
  render: () => render('horizontal'),
};

export const Vertical = {
  render: () => render('vertical'),
};
