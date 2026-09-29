/**
 * Utilidad: placement
 * Elige el lado (abajo, arriba, inicio o fin) en el que un elemento
 * flotante posicionado por CSS no queda cortado. Sin dependencias: prueba
 * los lados por orden de preferencia, mide el elemento y se queda con el
 * primero que cabe; si ninguno cabe, con el que menos se sale.
 *
 * «Cabe» significa dentro del viewport Y dentro de todos los
 * antecesores que recortan (`overflow` distinto de `visible`: el cuerpo
 * de un Modal, el contenedor de una historia de Storybook…), porque un
 * flotante `position: absolute` queda cortado por ellos aunque el
 * viewport tenga sitio.
 *
 * No recoloca al hacer scroll o redimensionar: se llama al mostrar el
 * flotante. Los estilos de cada lado los define el CSS del componente;
 * esta utilidad solo llama a `apply(side)`.
 *
 * Uso:
 *   placeFloating(bubble, {
 *     preferred: 'bottom',
 *     apply: (side) => bubble.setAttribute('data-placement', side),
 *   });
 */

export const SIDES = ['bottom', 'top', 'end', 'start'];

/** @param {'bottom' | 'top' | 'end' | 'start'} preferred */
function order(preferred) {
  const opposite = { bottom: 'top', top: 'bottom', start: 'end', end: 'start' };
  const rest = SIDES.filter(
    (s) => s !== preferred && s !== opposite[preferred]
  );
  return [preferred, opposite[preferred], ...rest];
}

// jsdom devuelve '' cuando no hay overflow declarado: cuenta como visible.
function clips(overflow) {
  return overflow !== '' && overflow !== 'visible';
}

/**
 * Zona visible para `el`: el viewport recortado por los antecesores con
 * overflow distinto de `visible`.
 * @param {HTMLElement} el
 */
export function visibleBounds(el) {
  const root = document.documentElement;
  const bounds = {
    left: 0,
    top: 0,
    right: root.clientWidth,
    bottom: root.clientHeight,
  };
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === root) continue;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (clips(style.overflowX)) {
      bounds.left = Math.max(bounds.left, rect.left);
      bounds.right = Math.min(bounds.right, rect.right);
    }
    if (clips(style.overflowY)) {
      bounds.top = Math.max(bounds.top, rect.top);
      bounds.bottom = Math.min(bounds.bottom, rect.bottom);
    }
  }
  return bounds;
}

function overflowAmount(rect, bounds) {
  return (
    Math.max(0, bounds.left - rect.left) +
    Math.max(0, rect.right - bounds.right) +
    Math.max(0, bounds.top - rect.top) +
    Math.max(0, rect.bottom - bounds.bottom)
  );
}

/**
 * @param {HTMLElement} floating Elemento ya visible (con su tamaño real).
 * @param {{
 *   preferred?: 'bottom' | 'top' | 'end' | 'start',
 *   apply: (side: 'bottom' | 'top' | 'end' | 'start') => void,
 * }} options
 * @returns {'bottom' | 'top' | 'end' | 'start'} El lado aplicado.
 */
export function placeFloating(floating, { preferred = 'bottom', apply }) {
  const bounds = visibleBounds(floating);
  let best = preferred;
  let bestOverflow = Infinity;

  for (const side of order(preferred)) {
    apply(side);
    const overflow = overflowAmount(floating.getBoundingClientRect(), bounds);
    if (overflow === 0) return side;
    if (overflow < bestOverflow) {
      best = side;
      bestOverflow = overflow;
    }
  }

  apply(best);
  return best;
}
