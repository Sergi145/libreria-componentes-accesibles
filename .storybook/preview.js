import '../src/tokens/tokens.css';
import '../src/styles/base.css';

/** @type {import('@storybook/html').Preview} */
const preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // El addon de accesibilidad (axe-core) audita cada historia y
    // muestra los resultados en la pestaña "Accessibility".
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
