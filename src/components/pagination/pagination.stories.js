import './pagination.css';

export default {
  title: 'Componentes/Pagination',
  tags: ['autodocs'],
};

const chevronLeft = `
  <svg class="c-pagination__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

const chevronRight = `
  <svg class="c-pagination__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

function arrow({ label, icon, iconFirst, disabled, href }) {
  const text = `<span class="c-pagination__sr-text">${label}</span>`;
  const content = iconFirst ? `${icon}${text}` : `${text}${icon}`;
  return disabled
    ? `<a class="c-pagination__link c-pagination__link--arrow" aria-disabled="true">${content}</a>`
    : `<a class="c-pagination__link c-pagination__link--arrow" href="${href}">${content}</a>`;
}

function render({ total, current }) {
  const paginas = Array.from({ length: total }, (_, i) => i + 1)
    .map(
      (pagina) => `
    <li class="c-pagination__item">
      <a
        class="c-pagination__link"
        href="?pagina=${pagina}"
        aria-label="Página ${pagina}"
        ${pagina === current ? 'aria-current="page"' : ''}
      >${pagina}</a>
    </li>`
    )
    .join('');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <nav aria-label="Paginación de resultados">
      <ul class="c-pagination">
        <li class="c-pagination__item">
          ${arrow({
            label: 'Anterior',
            icon: chevronLeft,
            iconFirst: true,
            disabled: current === 1,
            href: `?pagina=${current - 1}`,
          })}
        </li>
        ${paginas}
        <li class="c-pagination__item">
          ${arrow({
            label: 'Siguiente',
            icon: chevronRight,
            iconFirst: false,
            disabled: current === total,
            href: `?pagina=${current + 1}`,
          })}
        </li>
      </ul>
    </nav>
  `;
  return wrapper;
}

export const Default = {
  render: () => render({ total: 5, current: 3 }),
};

export const PrimeraPagina = {
  name: 'Primera página (Anterior deshabilitado)',
  render: () => render({ total: 5, current: 1 }),
};

export const UltimaPagina = {
  name: 'Última página (Siguiente deshabilitado)',
  render: () => render({ total: 5, current: 5 }),
};
