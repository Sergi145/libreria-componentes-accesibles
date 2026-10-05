import './popover.css';
import { Popover } from './popover.js';

export default {
  title: 'Componentes/Popover',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez en el
// mismo documento: cada render necesita ids propios o aria-controls apunta
// siempre al primer panel.
let instanceCount = 0;

function renderIban() {
  const id = `story-popover-iban-${++instanceCount}`;
  const wrapper = document.createElement('div');
  wrapper.style.paddingBlock = '1rem 6rem';
  wrapper.innerHTML = `
    <div class="c-popover">
      <button type="button" class="c-popover__trigger" aria-expanded="false" aria-controls="${id}">
        ¿Qué es el IBAN?
      </button>
      <div id="${id}" class="c-popover__panel" hidden>
        <p>Código de 24 caracteres que identifica tu cuenta bancaria.</p>
      </div>
    </div>
  `;

  new Popover(wrapper.querySelector('button'));

  return wrapper;
}

function renderConTitulo() {
  const id = `story-popover-plazo-${++instanceCount}`;
  const wrapper = document.createElement('div');
  wrapper.style.paddingBlock = '6rem 1rem';
  wrapper.innerHTML = `
    <div class="c-popover">
      <button type="button" class="c-popover__trigger" aria-expanded="false" aria-controls="${id}">
        Plazo de entrega
      </button>
      <div id="${id}" class="c-popover__panel c-popover__panel--top" hidden>
        <p class="c-popover__title">Entrega estimada</p>
        <p>Entre 2 y 4 días laborables desde la confirmación del pedido.</p>
      </div>
    </div>
  `;

  new Popover(wrapper.querySelector('button'));

  return wrapper;
}

export const Iban = { render: renderIban };
export const ConTituloArriba = { render: renderConTitulo };
