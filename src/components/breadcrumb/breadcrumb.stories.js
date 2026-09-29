import './breadcrumb.css';

export default {
  title: 'Componentes/Breadcrumb',
  tags: ['autodocs'],
};

function crumb({ href, label, current }) {
  return `
    <li class="c-breadcrumb__item"${current ? ' aria-current="page"' : ''}>${
      href ? `<a href="${href}">${label}</a>` : label
    }</li>`;
}

function render(items) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <nav aria-label="Ruta de navegación">
      <ol class="c-breadcrumb">
        ${items.map((item) => crumb(item)).join('')}
      </ol>
    </nav>
  `;
  return wrapper;
}

export const Default = {
  render: () =>
    render([
      { href: '/', label: 'Inicio' },
      { href: '/servicios/', label: 'Servicios' },
      { label: 'Trámites en línea', current: true },
    ]),
};

export const RutaProfunda = {
  name: 'Ruta profunda (varios niveles)',
  render: () =>
    render([
      { href: '/', label: 'Inicio' },
      { href: '/tienda/', label: 'Tienda' },
      { href: '/tienda/electronica/', label: 'Electrónica' },
      { href: '/tienda/electronica/portatiles/', label: 'Portátiles' },
      { label: 'Portátil 14" 16GB', current: true },
    ]),
};
