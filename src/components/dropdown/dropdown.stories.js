import './dropdown.css';
import { Dropdown } from './dropdown.js';

export default {
  title: 'Componentes/Dropdown',
  tags: ['autodocs'],
};

function renderNavegacion() {
  const wrapper = document.createElement('div');
  wrapper.style.paddingBlockEnd = '10rem';
  wrapper.innerHTML = `
    <div class="c-dropdown">
      <button type="button" class="c-dropdown__toggle" aria-expanded="false" aria-controls="story-dropdown-productos">
        Productos
      </button>
      <ul id="story-dropdown-productos" class="c-dropdown__list" hidden>
        <li><a class="c-dropdown__link" href="#software" aria-current="page">Software</a></li>
        <li><a class="c-dropdown__link" href="#hardware">Hardware</a></li>
        <li><a class="c-dropdown__link" href="#servicios">Servicios</a></li>
      </ul>
    </div>
  `;

  new Dropdown(wrapper.querySelector('button'));

  return wrapper;
}

export const Navegacion = { render: renderNavegacion };
