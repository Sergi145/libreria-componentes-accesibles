import './range.css';
import { Range, initRanges } from './range.js';

export default {
  title: 'Componentes/Range',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que el resto de formularios).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

export const Basico = {
  name: 'Básico (porcentaje)',
  render: () => {
    const p = nextPrefix('basico');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-range">
        <label class="c-range__label" for="${p}-volumen">Volumen</label>
        <div class="c-range__control">
          <input class="c-range__input" type="range" id="${p}-volumen" name="volumen"
            min="0" max="100" step="1" value="40" data-range data-format="{value} %" />
          <output class="c-range__output" for="${p}-volumen" aria-live="off">40 %</output>
        </div>
      </div>
    `;
    initRanges(wrapper);
    return wrapper;
  },
};

export const FormatoPersonalizado = {
  name: 'Formato personalizado (función)',
  render: () => {
    const p = nextPrefix('formato');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-range">
        <label class="c-range__label" for="${p}-temperatura">Temperatura objetivo</label>
        <div class="c-range__control">
          <input class="c-range__input" type="range" id="${p}-temperatura" name="temperatura"
            min="16" max="28" step="0.5" value="21" />
          <output class="c-range__output" for="${p}-temperatura" aria-live="off">21 ºC</output>
        </div>
      </div>
    `;
    new Range(wrapper.querySelector('input'), {
      format: (value) => `${value} ºC`,
    });
    return wrapper;
  },
};

export const SinJs = {
  name: 'Sin JavaScript',
  render: () => {
    const p = nextPrefix('sin-js');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-range">
        <label class="c-range__label" for="${p}-brillo">Brillo de la pantalla</label>
        <div class="c-range__control">
          <input class="c-range__input" type="range" id="${p}-brillo" name="brillo"
            min="0" max="100" step="5" value="70" />
          <output class="c-range__output" for="${p}-brillo" aria-live="off">70</output>
        </div>
      </div>
    `;
    // A propósito, sin Range ni initRanges(): el <input> sigue siendo
    // utilizable por completo, solo el <output> no se actualiza solo.
    return wrapper;
  },
};

export const Deshabilitado = {
  render: () => {
    const p = nextPrefix('deshabilitado');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-range">
        <label class="c-range__label" for="${p}-calidad">
          Calidad de vídeo (requiere conexión estable)
        </label>
        <div class="c-range__control">
          <input class="c-range__input" type="range" id="${p}-calidad" name="calidad"
            min="0" max="3" step="1" value="1" disabled />
          <output class="c-range__output" for="${p}-calidad" aria-live="off">Media</output>
        </div>
      </div>
    `;
    return wrapper;
  },
};
