import './progress.css';
import '../button/button.css';
import { Progress } from './progress.js';

export default {
  title: 'Componentes/Progress',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids (label for) se generan nuevos
// en cada render() con un contador.
let instanceCount = 0;

function markup({ label, value, max = 100, text }) {
  const id = `progress-demo-${instanceCount++}`;
  const wrapper = document.createElement('div');
  wrapper.style.maxInlineSize = '30rem';
  wrapper.innerHTML = `
    <div class="c-progress">
      <label class="c-progress__label" for="${id}">${label}</label>
      <progress class="c-progress__bar" id="${id}" max="${max}"
        ${value === undefined ? '' : `value="${value}"`}>${text}</progress>
    </div>
  `;
  return wrapper;
}

export const Determinado = {
  render: () =>
    markup({ label: 'Subida del archivo', value: 60, text: '60 %' }),
};

export const Indeterminado = {
  render: () => markup({ label: 'Cargando resultados', text: 'Cargando…' }),
};

// Pasos grandes y espaciados: NVDA y otros lectores anuncian por su cuenta
// los cambios de un <progress> (según su ajuste «Salida de barra de
// progreso») y no pueden seguir el ritmo de una barra que avanza cada
// pocos cientos de ms; la barra iría por delante de lo que oye el usuario.
const STEP = 20;
const INTERVAL = 2000;

export const Simulado = {
  name: 'Simulado (anuncia al completar)',
  render: () => {
    const wrapper = markup({
      label: 'Subida del archivo',
      value: 0,
      text: '0 %',
    });
    const bar = wrapper.querySelector('progress');
    const progress = new Progress(bar, {
      completeMessage: 'Subida completada',
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-button c-button--primary';
    button.textContent = 'Simular subida';
    button.style.marginBlockStart = '0.75rem';
    button.style.maxInlineSize = '100%';

    let timer = null;
    button.addEventListener('click', () => {
      if (timer) return;
      progress.value = 0;
      // aria-disabled y no disabled: un botón con foco que se deshabilita lo pierde.
      button.setAttribute('aria-disabled', 'true');
      timer = setInterval(() => {
        progress.value += STEP;
        if (progress.value >= bar.max) {
          clearInterval(timer);
          timer = null;
          button.removeAttribute('aria-disabled');
        }
      }, INTERVAL);
    });

    wrapper.append(button);
    return wrapper;
  },
};
