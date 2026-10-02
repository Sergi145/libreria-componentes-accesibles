import './feed.css';
import { Feed } from './feed.js';

export default {
  title: 'Componentes/Feed',
  tags: ['autodocs'],
};

let renderCount = 0;

function createFeed(withLoadMore = false, withError = false) {
  const id = ++renderCount;
  const feedId = `feed-story-${id}`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <section class="c-feed" id="${feedId}" data-feed aria-labelledby="${feedId}-title">
      <h2 id="${feedId}-title">Últimas noticias</h2>

      <article>
        <h3>Primer artículo</h3>
        <p>Resumen del primer artículo con contenido interesante para leer sobre temas de tecnología.</p>
      </article>

      <article>
        <h3>Segundo artículo</h3>
        <p>Resumen del segundo artículo con más información relevante sobre desarrollo web.</p>
      </article>

      <article>
        <h3>Tercer artículo</h3>
        <p>Resumen del tercer artículo para completar el flujo inicial de noticias.</p>
      </article>

      <article>
        <h3>Cuarto artículo</h3>
        <p>Resumen del cuarto artículo con detalles adicionales y contexto importante.</p>
      </article>

      ${withLoadMore ? '<a class="c-feed__more" data-feed-more href="#">Cargar más artículos</a>' : ''}
    </section>
  `;

  const feed = wrapper.querySelector('[data-feed]');

  if (withLoadMore) {
    let loadCount = 0;
    const loadMore = async () => {
      // Simular retardo de red
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (withError && loadCount === 0) {
        loadCount++;
        throw new Error('Error al cargar artículos');
      }

      loadCount++;
      if (loadCount > 2) {
        // Última carga devuelve vacío (fin)
        return [];
      }

      // Devolver artículos simulados
      return [
        {
          title: `Artículo cargado ${loadCount}`,
          description: `Resumen del artículo cargado mediante scroll infinito.`,
        },
        {
          title: `Artículo cargado ${loadCount + 1}`,
          description: `Otro resumen de artículo añadido dinámicamente.`,
        },
      ];
    };

    new Feed(feed, { loadMore });
  } else {
    new Feed(feed);
  }

  return wrapper;
}

export const Basica = {
  render: () => createFeed(false, false),
};

export const ConCargaInfinita = {
  render: () => createFeed(true, false),
};

export const ConError = {
  render: () => createFeed(true, true),
};
