import './grid.css';
import { Grid } from './grid.js';

export default {
  title: 'Componentes/Grid',
  tags: ['autodocs'],
};

let renderCount = 0;

function createGrid() {
  const id = ++renderCount;
  const gridId = `grid-story-${id}`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <table class="c-table c-grid" id="${gridId}" data-grid data-page-size="5">
      <caption>Productos disponibles (navegación con flechas)</caption>
      <thead>
        <tr>
          <th scope="col">Nombre</th>
          <th scope="col">Precio</th>
          <th scope="col">Stock</th>
          <th scope="col">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="product-laptop">Laptop</td>
          <td>$999</td>
          <td>15</td>
          <td><a href="#laptop" aria-label="Ver detalles Laptop">Ver detalles</a></td>
        </tr>
        <tr>
          <td id="product-mouse">Mouse</td>
          <td>$25</td>
          <td>100</td>
          <td><button type="button" aria-label="Agregar Mouse">Agregar</button></td>
        </tr>
        <tr>
          <td id="product-keyboard">Teclado</td>
          <td>$75</td>
          <td>50</td>
          <td><a href="#keyboard" aria-label="Ver detalles Teclado">Ver detalles</a></td>
        </tr>
        <tr>
          <td id="product-monitor">Monitor</td>
          <td>$299</td>
          <td>20</td>
          <td><button type="button" aria-label="Agregar Monitor">Agregar</button></td>
        </tr>
        <tr>
          <td id="product-headphones">Auriculares</td>
          <td>$120</td>
          <td>35</td>
          <td><a href="#headphones" aria-label="Ver detalles Auriculares">Ver detalles</a></td>
        </tr>
        <tr>
          <td id="product-webcam">Webcam</td>
          <td>$50</td>
          <td>25</td>
          <td><button type="button" aria-label="Agregar Webcam">Agregar</button></td>
        </tr>
        <tr>
          <td id="product-mic">Micrófono</td>
          <td>$40</td>
          <td>40</td>
          <td><a href="#mic" aria-label="Ver detalles Micrófono">Ver detalles</a></td>
        </tr>
        <tr>
          <td id="product-hub">Hub USB</td>
          <td>$35</td>
          <td>60</td>
          <td><button type="button" aria-label="Agregar Hub USB">Agregar</button></td>
        </tr>
      </tbody>
    </table>
  `;

  const grid = wrapper.querySelector('[data-grid]');
  if (grid) {
    new Grid(grid);
  }
  return wrapper;
}

export const Basica = {
  render: createGrid,
};

export const ConEnlaces = {
  render: createGrid,
};
