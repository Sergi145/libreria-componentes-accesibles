import './accordion.css';
import { Accordion } from './accordion.js';

export default {
  title: 'Componentes/Accordion',
  tags: ['autodocs'],
};

const CHEVRON = `<svg class="c-accordion__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

function item({ id, question, answer, expanded }) {
  return `
    <h3 class="c-accordion__heading">
      <button type="button" class="c-accordion__trigger"
        id="${id}-trigger" aria-expanded="${expanded}" aria-controls="${id}-panel">
        <span class="c-accordion__trigger-text">${question}</span>
        ${CHEVRON}
      </button>
    </h3>
    <section class="c-accordion__panel" id="${id}-panel"
      aria-labelledby="${id}-trigger" ${expanded ? '' : 'hidden'}>
      <div class="c-accordion__panel-content"><p>${answer}</p></div>
    </section>
  `;
}

function render(allowMultiple) {
  const wrapper = document.createElement('div');
  wrapper.className = 'c-accordion';
  wrapper.setAttribute('data-accordion', '');
  wrapper.innerHTML = [
    item({
      id: 'a1',
      question: '¿Qué es esta librería?',
      answer:
        'Un conjunto de componentes accesibles con HTML, CSS y JS independientes.',
      expanded: true,
    }),
    item({
      id: 'a2',
      question: '¿Necesito JavaScript para usarlo?',
      answer: 'El JS añade la interacción; sin él, el contenido va abierto.',
      expanded: false,
    }),
    item({
      id: 'a3',
      question: '¿Cumple WCAG 2.2 AA?',
      answer: 'Ese es el objetivo de cada componente de la librería.',
      expanded: false,
    }),
  ].join('');

  new Accordion(wrapper, { allowMultiple });
  return wrapper;
}

export const VariosAbiertos = {
  name: 'Permite varios paneles abiertos',
  render: () => render(true),
};

export const UnoSoloAbierto = {
  name: 'Solo un panel abierto a la vez',
  render: () => render(false),
};
