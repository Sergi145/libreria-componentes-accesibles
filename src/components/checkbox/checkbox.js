/**
 * Componente: Checkbox — estado mixto
 * `CheckboxGroup` sincroniza una casilla «Seleccionar todo»
 * (`[data-checkbox-parent]`) con el resto de casillas de su
 * `<fieldset data-checkbox-group>`: todas marcadas → el padre marcado;
 * ninguna → el padre sin marcar; algunas → el padre en estado mixto.
 * Sigue el patrón WAI-ARIA APG "Checkbox" en su variante de estado
 * mixto: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 *
 * Decisiones no obvias:
 * - El estado mixto se expone con la propiedad `indeterminate` del
 *   propio `<input type="checkbox">`, no con `aria-checked="mixed"`
 *   escrito a mano: los navegadores ya lo traducen al árbol de
 *   accesibilidad como estado "mixed". "No ARIA is better than bad
 *   ARIA".
 * - `indeterminate` es una propiedad de JS, no un atributo: no
 *   sobrevive a una recarga sin este script. El estado inicial se
 *   recalcula en el constructor a partir de qué hijas están `checked`
 *   en el HTML, así que basta con marcar las hijas correctas en el
 *   marcado de referencia.
 * - Al activar el padre (clic o Espacio), el navegador ya cambia su
 *   `checked` según el valor que tenía antes del clic (true → false,
 *   false → true, también en estado mixto), pero NO limpia
 *   `indeterminate` por su cuenta: este componente lo hace en su
 *   manejador de `change`, y aplica ese mismo `checked` a todas las
 *   hijas. Por eso activar el padre en estado mixto dejaste todo
 *   marcado (partía de `checked = false`), no todo desmarcado.
 *
 * Uso:
 *   import { CheckboxGroup, initCheckboxGroups } from './checkbox.js';
 *   new CheckboxGroup(document.querySelector('[data-checkbox-group]'));
 *   // O, para inicializar todos los grupos de la página:
 *   initCheckboxGroups();
 */

export class CheckboxGroup {
  /** @param {HTMLElement} group [data-checkbox-group] con un padre y n hijas */
  constructor(group) {
    const parent = group?.querySelector('[data-checkbox-parent]');
    if (!parent) {
      throw new Error(
        'CheckboxGroup: falta [data-checkbox-parent] dentro del grupo'
      );
    }
    this.el = group;
    this._parent = parent;
    this._children = Array.from(
      group.querySelectorAll('input[type="checkbox"]')
    ).filter((checkbox) => checkbox !== parent);

    const ids = this._children.map((child) => child.id).filter(Boolean);
    if (ids.length) parent.setAttribute('aria-controls', ids.join(' '));

    this._onParentChange = this._onParentChange.bind(this);
    this._onChildChange = this._onChildChange.bind(this);
    parent.addEventListener('change', this._onParentChange);
    this._children.forEach((child) =>
      child.addEventListener('change', this._onChildChange)
    );

    this._syncParent();
  }

  /** @returns {'checked' | 'unchecked' | 'mixed'} */
  get state() {
    if (this._parent.indeterminate) return 'mixed';
    return this._parent.checked ? 'checked' : 'unchecked';
  }

  destroy() {
    this._parent.removeEventListener('change', this._onParentChange);
    this._children.forEach((child) =>
      child.removeEventListener('change', this._onChildChange)
    );
  }

  _onParentChange() {
    const checked = this._parent.checked;
    this._parent.indeterminate = false;
    this._children.forEach((child) => {
      child.checked = checked;
    });
  }

  _onChildChange() {
    this._syncParent();
  }

  _syncParent() {
    const total = this._children.length;
    const checkedCount = this._children.filter((child) => child.checked).length;

    if (checkedCount === 0) {
      this._parent.checked = false;
      this._parent.indeterminate = false;
    } else if (checkedCount === total) {
      this._parent.checked = true;
      this._parent.indeterminate = false;
    } else {
      this._parent.checked = false;
      this._parent.indeterminate = true;
    }
  }
}

/**
 * Inicializa todos los [data-checkbox-group] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {CheckboxGroup[]}
 */
export function initCheckboxGroups(root = document) {
  return Array.from(root.querySelectorAll('[data-checkbox-group]')).map(
    (group) => new CheckboxGroup(group)
  );
}
