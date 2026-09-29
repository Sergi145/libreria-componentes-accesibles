/**
 * Utilidad: roving tabindex
 * Implementa el patrón de foco compartido ("roving tabindex") del
 * capítulo 1 de la guía: dentro de un grupo de controles relacionados,
 * solo uno tiene tabindex="0" (la parada en la secuencia de Tab); las
 * flechas y Home/End mueven ese tabindex y el foco entre los demás.
 * La usan Toolbar y Tabs.
 *
 * La visibilidad de un elemento no se calcula por layout (`offsetParent`
 * siempre es `null` en jsdom, así que ese filtro no es fiable en los
 * tests): se salta los elementos `disabled` o `hidden`, o dentro de un
 * ancestro `[hidden]`.
 *
 * Uso:
 *   const destroy = rovingTabindex(container, '.c-toolbar__item', {
 *     orientation: 'horizontal',
 *   });
 *   // …
 *   destroy(); // quita los listeners
 */

const KEYS_BY_ORIENTATION = {
  horizontal: { next: ['ArrowRight'], prev: ['ArrowLeft'] },
  vertical: { next: ['ArrowDown'], prev: ['ArrowUp'] },
  both: {
    next: ['ArrowRight', 'ArrowDown'],
    prev: ['ArrowLeft', 'ArrowUp'],
  },
};

function isFocusable(el) {
  if (el.disabled || el.hasAttribute('disabled')) return false;
  if (el.hidden || el.closest('[hidden]')) return false;
  return true;
}

/**
 * @param {HTMLElement} container
 * @param {string} selector Selector de los elementos del grupo, relativo a `container`.
 * @param {{
 *   orientation?: 'horizontal' | 'vertical' | 'both',
 *   loop?: boolean,
 *   onFocusChange?: (el: HTMLElement) => void,
 * }} [options]
 * @returns {() => void} Función que elimina los listeners.
 */
export function rovingTabindex(
  container,
  selector,
  { orientation = 'horizontal', loop = true, onFocusChange } = {}
) {
  const keys = KEYS_BY_ORIENTATION[orientation];

  function items() {
    return Array.from(container.querySelectorAll(selector)).filter(isFocusable);
  }

  function activate(el, { focus = true } = {}) {
    items().forEach((item) => {
      item.setAttribute('tabindex', item === el ? '0' : '-1');
    });
    if (focus) el.focus();
    onFocusChange?.(el);
  }

  function moveFocus(current, delta) {
    const list = items();
    const currentIndex = list.indexOf(current);
    if (currentIndex === -1 || list.length === 0) return;

    let targetIndex = currentIndex + delta;
    if (loop) {
      targetIndex = (targetIndex + list.length) % list.length;
    } else {
      targetIndex = Math.min(Math.max(targetIndex, 0), list.length - 1);
    }
    activate(list[targetIndex]);
  }

  function onKeydown(event) {
    const current = event.target.closest(selector);
    if (!current || !items().includes(current)) return;

    if (keys.next.includes(event.key)) {
      event.preventDefault();
      moveFocus(current, 1);
    } else if (keys.prev.includes(event.key)) {
      event.preventDefault();
      moveFocus(current, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const [first] = items();
      if (first) activate(first);
    } else if (event.key === 'End') {
      event.preventDefault();
      const list = items();
      if (list.length) activate(list[list.length - 1]);
    }
  }

  function onClick(event) {
    const target = event.target.closest(selector);
    if (target && items().includes(target)) {
      activate(target, { focus: false });
    }
  }

  // Estado inicial: respeta un tabindex="0" ya presente en el HTML; si no
  // hay ninguno, activa el primer elemento sin robarle el foco a la página.
  const initialItems = items();
  const initial =
    initialItems.find((item) => item.getAttribute('tabindex') === '0') ??
    initialItems[0];
  if (initial) activate(initial, { focus: false });

  container.addEventListener('keydown', onKeydown);
  container.addEventListener('click', onClick);

  return function destroy() {
    container.removeEventListener('keydown', onKeydown);
    container.removeEventListener('click', onClick);
  };
}
