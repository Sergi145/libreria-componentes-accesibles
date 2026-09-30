import './card.css';
import '../badge/badge.css';

export default {
  title: 'Componentes/Card',
  tags: ['autodocs'],
};

const image = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='${color}'/%3E%3C/svg%3E`;

function wrap(html) {
  const wrapper = document.createElement('div');
  wrapper.style.maxInlineSize = '22rem';
  wrapper.innerHTML = html;
  return wrapper;
}

export const Basica = {
  name: 'Básica',
  render: () =>
    wrap(`
      <article class="c-card">
        <img class="c-card__media" src="${image('%23c7d2fe')}" alt="" width="640" height="360" />
        <div class="c-card__body">
          <div class="c-card__title">Guía de accesibilidad</div>
          <p class="c-card__text">Resumen de los patrones WAI-ARIA usados en la librería.</p>
        </div>
      </article>
    `),
};

export const Clicable = {
  render: () =>
    wrap(`
      <article class="c-card c-card--link">
        <img class="c-card__media" src="${image('%23bbf7d0')}" alt="" width="640" height="360" />
        <div class="c-card__body">
          <div class="c-card__title">
            <a class="c-card__link" href="https://example.com/articulo">Novedades de la versión 2</a>
          </div>
          <p class="c-card__text">Lo que cambia en los componentes de feedback.</p>
        </div>
      </article>
    `),
};

export const ConBadge = {
  name: 'Con badge',
  render: () =>
    wrap(`
      <article class="c-card c-card--link">
        <div class="c-card__body">
          <div class="c-card__title">
            <a class="c-card__link" href="https://example.com/beta">Modo oscuro</a>
          </div>
          <p class="c-card__text">
            <span class="c-badge c-badge--info">Beta</span>
            Disponible para probar desde los ajustes.
          </p>
        </div>
      </article>
    `),
};
