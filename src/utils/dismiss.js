/**
 * Utilidad: dismiss
 * Escucha el cierre de un panel superpuesto no modal (menú, popover,
 * tooltip…): la tecla Escape y el clic o el foco fuera del panel (y de
 * su disparador, si se indica). No decide cómo se cierra el panel —
 * solo avisa a quien la usa a través de `onDismiss`. La usan Dropdown,
 * Menu Button, Popover y Tooltip.
 *
 * Al cerrar por Escape, cancela el evento (`preventDefault` +
 * `stopPropagation`) para que un <dialog> que contenga el panel (p. ej.
 * un Menu Button abierto dentro de un Modal) no se cierre también.
 *
 * Uso:
 *   const destroy = dismissable(panel, {
 *     trigger,
 *     onDismiss: (reason) => close(),
 *   });
 *   // …
 *   destroy(); // quita los listeners
 */

function isInside(target, container) {
  return !!container && (target === container || container.contains(target));
}

/**
 * @param {HTMLElement} panel
 * @param {{
 *   trigger?: HTMLElement,
 *   onDismiss?: (reason: 'escape' | 'outside') => void,
 *   escape?: boolean,
 *   outside?: boolean,
 * }} [options]
 * @returns {() => void} Función que elimina los listeners.
 */
export function dismissable(
  panel,
  { trigger, onDismiss, escape = true, outside = true } = {}
) {
  function isOwn(target) {
    return isInside(target, panel) || isInside(target, trigger);
  }

  function onKeydown(event) {
    if (!escape || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onDismiss?.('escape');
  }

  function onPointerdown(event) {
    if (!outside || isOwn(event.target)) return;
    onDismiss?.('outside');
  }

  function onFocusin(event) {
    if (!outside || isOwn(event.target)) return;
    onDismiss?.('outside');
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onPointerdown);
  document.addEventListener('focusin', onFocusin);

  return function destroy() {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onPointerdown);
    document.removeEventListener('focusin', onFocusin);
  };
}
