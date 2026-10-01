import '../src/tokens/tokens.css';
import '../src/styles/base.css';

/** @type {import('@storybook/html').Preview} */
const preview = {
  parameters: {
    layout: 'padded',
    // Los tokens de color solo tenían un mecanismo de modo oscuro
    // (prefers-color-scheme, la preferencia del sistema operativo). El
    // selector de fondo por defecto de esta barra de Storybook no lo
    // activa, así que elegir "dark" aquí dejaba el fondo oscuro con el
    // texto todavía en colores de modo claro (contraste roto: 1.40:1 en
    // vez de 4.5:1). Estos valores igualan los tokens --color-surface
    // reales; el interruptor "Tema" de abajo (globalTypes) es el que de
    // verdad sincroniza el resto de los tokens con el fondo elegido.
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1d23' },
      ],
    },
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
  globalTypes: {
    theme: {
      name: 'Tema',
      description:
        'Fuerza los tokens de color a claro/oscuro, con independencia de la preferencia del sistema operativo',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Claro' },
          { value: 'dark', icon: 'moon', title: 'Oscuro' },
        ],
      },
    },
  },
  decorators: [
    // El fondo del lienzo (selector de fondos) y el recuadro de cada
    // historia en Docs son blancos fijos y no siguen al tema: con el tema
    // oscuro, el texto claro quedaba sobre blanco. Cada historia lleva su
    // propio fondo desde los tokens. El margen negativo cubre el relleno
    // de layout 'padded' (1rem) sin desplazar el contenido.
    (story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      const content = story();
      const surface = document.createElement('div');
      surface.style.cssText =
        'margin: -1rem; padding: 1rem; ' +
        'background: var(--color-surface); color: var(--color-text);';
      if (typeof content === 'string') {
        surface.innerHTML = content;
      } else {
        surface.append(content);
      }
      return surface;
    },
  ],
};

export default preview;
