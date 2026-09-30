import './table.css';
import { initSortableTables } from './table.js';

export default {
  title: 'Componentes/Table',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que el resto de formularios).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

function pedidosMarkup(p) {
  return `
    <section class="c-table__wrapper" tabindex="0" aria-labelledby="${p}-caption">
      <table class="c-table c-table--striped c-table--hover" data-sortable>
        <caption id="${p}-caption">Pedidos recientes</caption>
        <thead>
          <tr>
            <th scope="col" data-sort="text">Pedido</th>
            <th scope="col" data-sort="text">Cliente</th>
            <th scope="col" data-sort="text">Fecha</th>
            <th scope="col" class="c-table__cell--numeric" data-sort="number">Importe</th>
            <th scope="col" data-sort="text">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">#1024</th>
            <td>Marta Ruiz</td>
            <td data-sort-value="2026-03-12">12/03/2026</td>
            <td class="c-table__cell--numeric" data-sort-value="48.90">48,90&nbsp;€</td>
            <td>Enviado</td>
          </tr>
          <tr>
            <th scope="row">#1023</th>
            <td>Javier Soto</td>
            <td data-sort-value="2026-03-11">11/03/2026</td>
            <td class="c-table__cell--numeric" data-sort-value="129.00">129,00&nbsp;€</td>
            <td>Procesando</td>
          </tr>
          <tr>
            <th scope="row">#1022</th>
            <td>Laura Gómez</td>
            <td data-sort-value="2026-03-09">09/03/2026</td>
            <td class="c-table__cell--numeric" data-sort-value="9.50">9,50&nbsp;€</td>
            <td>Entregado</td>
          </tr>
          <tr>
            <th scope="row">#1021</th>
            <td>Andrés Pardo</td>
            <td data-sort-value="2026-03-08">08/03/2026</td>
            <td class="c-table__cell--numeric" data-sort-value="312.40">312,40&nbsp;€</td>
            <td>Cancelado</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

export const Ordenable = {
  name: 'Ordenable, rayada + resaltado al pasar el ratón',
  render: () => {
    const p = nextPrefix('pedidos');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = pedidosMarkup(p);
    initSortableTables(wrapper);
    return wrapper;
  },
};

export const SinJs = {
  name: 'Sin JavaScript',
  render: () => {
    const p = nextPrefix('sin-js');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = pedidosMarkup(p);
    // A propósito, sin initSortableTables(): la tabla se lee y se
    // recorre igual, solo faltan los botones de ordenar.
    return wrapper;
  },
};

export const DesplazamientoHorizontal = {
  name: 'Desplazamiento horizontal (envoltorio enfocable)',
  render: () => {
    const p = nextPrefix('inventario');
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '480px';
    wrapper.innerHTML = `
      <section class="c-table__wrapper" tabindex="0" aria-labelledby="${p}-caption">
        <table class="c-table">
          <caption id="${p}-caption">Inventario del almacén central</caption>
          <thead>
            <tr>
              <th scope="col">SKU</th>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col">Proveedor</th>
              <th scope="col">Ubicación</th>
              <th scope="col" class="c-table__cell--numeric">Stock</th>
              <th scope="col" class="c-table__cell--numeric">Precio unitario</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">SKU-00214</th>
              <td>Teclado mecánico 75%</td>
              <td>Periféricos</td>
              <td>Nortek S.L.</td>
              <td>Pasillo 4, estante B</td>
              <td class="c-table__cell--numeric">128</td>
              <td class="c-table__cell--numeric">54,90&nbsp;€</td>
            </tr>
            <tr>
              <th scope="row">SKU-00351</th>
              <td>Monitor 27" 144Hz</td>
              <td>Pantallas</td>
              <td>Vistalux</td>
              <td>Pasillo 1, estante A</td>
              <td class="c-table__cell--numeric">42</td>
              <td class="c-table__cell--numeric">219,00&nbsp;€</td>
            </tr>
          </tbody>
        </table>
      </section>
    `;
    return wrapper;
  },
};
