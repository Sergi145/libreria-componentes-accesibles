import './disclosure.css';
import { Disclosure } from './disclosure.js';

export default {
  title: 'Componentes/Disclosure',
  tags: ['autodocs'],
};

const CHEVRON = `<svg class="c-disclosure__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento (la vista principal de arriba y, otra vez, en
// la lista de historias de más abajo), así que un id fijo por historia
// no basta: hay que generar uno nuevo en cada llamada a render(), o las
// dos copias comparten id y aria-controls encuentra siempre la primera
// del documento.
let instanceCount = 0;

/**
 * @param {{ expanded?: boolean, storyName: string }} options `storyName`
 *   solo identifica la historia en el id generado, para que sea legible
 *   en el DOM al depurar.
 */
function render({ expanded = false, storyName }) {
  const id = `disclosure-demo-${storyName}-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button type="button" class="c-disclosure__trigger"
      aria-expanded="${expanded}" aria-controls="${id}">
      ${CHEVRON}
      Más información
    </button>
    <div class="c-disclosure__panel" id="${id}" ${expanded ? '' : 'hidden'}>
      <p>Contenido adicional que se muestra u oculta al pulsar el botón.</p>
    </div>
  `;
  new Disclosure(wrapper.querySelector('.c-disclosure__trigger'));
  return wrapper;
}

export const Cerrado = {
  render: () => render({ expanded: false, storyName: 'cerrado' }),
};

export const Abierto = {
  render: () => render({ expanded: true, storyName: 'abierto' }),
};
