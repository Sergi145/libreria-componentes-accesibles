import './close-button.css';
import './close-button.stories.css';

export default {
  title: 'Componentes/Button/Close button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    label: 'Cerrar',
  },
};

function render({ label }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'c-close-button';
  button.setAttribute('aria-label', label);
  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;
  return button;
}

export const Default = { render };

export const EnUnPanel = {
  name: 'En un panel con título',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'close-button-demo__panel';

    const title = document.createElement('p');
    title.textContent = 'Se ha guardado tu progreso.';

    wrapper.append(title, render({ label: 'Cerrar aviso' }));
    return wrapper;
  },
};
