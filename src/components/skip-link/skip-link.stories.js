import './skip-link.css';
import './skip-link.stories.css';

export default {
  title: 'Componentes/Skip link',
  tags: ['autodocs'],
};

export const Default = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <p class="skip-link-demo__hint">
        Haz clic aquí y pulsa <kbd>Tab</kbd> para ver aparecer el enlace de salto.
      </p>
      <a class="c-skip-link" href="#skip-link-demo-main">Saltar al contenido principal</a>
      <header class="skip-link-demo__header">
        <nav aria-label="Principal">
          Cabecera y navegación de ejemplo (varios enlaces que el enlace de salto se salta)
        </nav>
      </header>
      <main id="skip-link-demo-main" tabindex="-1">
        <h2>Contenido principal</h2>
        <p>Aquí llega el foco al activar el enlace de salto.</p>
      </main>
    `;
    return wrapper;
  },
};
