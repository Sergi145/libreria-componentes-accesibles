import { describe, it, expect, beforeEach } from 'vitest';
import { placeFloating, visibleBounds } from './placement.js';

// jsdom no hace layout: cada lado tiene un rectángulo simulado.
function setup(rectBySide, { container } = {}) {
  document.body.innerHTML = `
    <div id="box"><span id="floating"></span></div>
  `;
  const floating = document.getElementById('floating');
  if (container) {
    document.getElementById('box').style.overflowX = 'hidden';
    document.getElementById('box').style.overflowY = 'hidden';
  }
  if (container) {
    document.getElementById('box').getBoundingClientRect = () => container;
  }
  let current = 'bottom';
  floating.getBoundingClientRect = () => rectBySide[current];
  const apply = (side) => {
    current = side;
    floating.setAttribute('data-placement', side);
  };
  return { floating, apply };
}

const inside = { left: 10, top: 10, right: 60, bottom: 40 };
const outside = { left: -20, top: 10, right: 30, bottom: 40 };

describe('placeFloating', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 800,
    });
  });

  it('mantiene el lado preferido si cabe', () => {
    const { floating, apply } = setup({
      bottom: inside,
      top: inside,
      end: inside,
      start: inside,
    });

    expect(placeFloating(floating, { preferred: 'bottom', apply })).toBe(
      'bottom'
    );
    expect(floating.getAttribute('data-placement')).toBe('bottom');
  });

  it('prueba primero el lado opuesto cuando el preferido se sale', () => {
    const { floating, apply } = setup({
      bottom: { left: 10, top: 780, right: 60, bottom: 830 },
      top: inside,
      end: inside,
      start: inside,
    });

    expect(placeFloating(floating, { preferred: 'bottom', apply })).toBe('top');
  });

  it('cae a un lado lateral si arriba y abajo se salen', () => {
    const cut = { left: 10, top: -30, right: 60, bottom: 20 };
    const { floating, apply } = setup({
      bottom: cut,
      top: cut,
      end: inside,
      start: outside,
    });

    expect(placeFloating(floating, { preferred: 'bottom', apply })).toBe('end');
  });

  it('si ninguno cabe, elige el que menos se sale', () => {
    const { floating, apply } = setup({
      bottom: { left: -50, top: 10, right: 0, bottom: 40 },
      top: { left: -10, top: 10, right: 40, bottom: 40 },
      end: { left: -30, top: 10, right: 20, bottom: 40 },
      start: { left: -40, top: 10, right: 10, bottom: 40 },
    });

    expect(placeFloating(floating, { preferred: 'bottom', apply })).toBe('top');
    expect(floating.getAttribute('data-placement')).toBe('top');
  });

  it('respeta un preferido distinto de abajo', () => {
    const { floating, apply } = setup({
      bottom: inside,
      top: outside,
      end: inside,
      start: inside,
    });

    expect(placeFloating(floating, { preferred: 'top', apply })).toBe('bottom');
  });

  it('tiene en cuenta los antecesores con overflow que recortan', () => {
    const container = { left: 0, top: 0, right: 300, bottom: 50 };
    const { floating, apply } = setup(
      {
        bottom: { left: 10, top: 40, right: 60, bottom: 70 },
        top: { left: 10, top: 5, right: 60, bottom: 35 },
        end: inside,
        start: inside,
      },
      { container }
    );

    expect(placeFloating(floating, { preferred: 'bottom', apply })).toBe('top');
  });
});

describe('visibleBounds', () => {
  it('sin antecesores que recorten devuelve el viewport', () => {
    document.body.innerHTML = '<div><span id="f"></span></div>';
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 500,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 400,
    });

    expect(visibleBounds(document.getElementById('f'))).toEqual({
      left: 0,
      top: 0,
      right: 500,
      bottom: 400,
    });
  });
});
