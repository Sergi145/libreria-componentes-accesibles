import './window-splitter.css';
import { WindowSplitter } from './window-splitter.js';

export default {
  title: 'Componentes/Window splitter',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento: un contador por render evita que los ids
// choquen entre la copia de arriba y la de la lista de más abajo.
let instanceCount = 0;

export const LadoALado = {
  name: 'Lado a lado (separador vertical)',
  render: () => {
    const id = `nav-principal-${instanceCount++}`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-splitter c-splitter--horizontal">
        <div class="c-splitter__pane" id="${id}">
          <h3>Navegación</h3>
          <p>Panel principal: su tamaño lo controla el separador.</p>
        </div>
        <div
          class="c-splitter__separator"
          role="separator"
          aria-controls="${id}"
          aria-label="Cambiar tamaño del panel de navegación"
          aria-orientation="vertical"
          data-splitter
        ></div>
        <div class="c-splitter__pane">
          <h3>Contenido</h3>
          <p>Panel secundario: ocupa el espacio que deja el principal.</p>
        </div>
      </div>
    `;
    new WindowSplitter(wrapper.querySelector('[data-splitter]'));
    return wrapper;
  },
};

export const Apilado = {
  name: 'Apilado (separador horizontal)',
  render: () => {
    const id = `panel-superior-${instanceCount++}`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-splitter c-splitter--vertical">
        <div class="c-splitter__pane" id="${id}">
          <h3>Panel superior</h3>
          <p>Panel principal: su tamaño lo controla el separador.</p>
        </div>
        <div
          class="c-splitter__separator"
          role="separator"
          aria-controls="${id}"
          aria-label="Cambiar tamaño del panel superior"
          aria-orientation="horizontal"
          data-splitter
        ></div>
        <div class="c-splitter__pane">
          <h3>Panel inferior</h3>
          <p>Panel secundario: ocupa el espacio que deja el principal.</p>
        </div>
      </div>
    `;
    new WindowSplitter(wrapper.querySelector('[data-splitter]'));
    return wrapper;
  },
};

export const SinJs = {
  name: 'Sin JavaScript',
  render: () => {
    const id = `sin-js-principal-${instanceCount++}`;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-splitter c-splitter--horizontal">
        <div class="c-splitter__pane" id="${id}">
          <h3>Navegación</h3>
          <p>Sin JavaScript, los paneles quedan al 50 %.</p>
        </div>
        <div
          class="c-splitter__separator"
          role="separator"
          aria-controls="${id}"
          aria-label="Cambiar tamaño del panel de navegación"
          aria-orientation="vertical"
        ></div>
        <div class="c-splitter__pane">
          <h3>Contenido</h3>
          <p>No hay tabindex ni aria-value*: el separador no es interactivo.</p>
        </div>
      </div>
    `;
    // A propósito, sin WindowSplitter: el separador no es interactivo
    // y los paneles se quedan al 50 % (valor inicial de la variable CSS).
    return wrapper;
  },
};
