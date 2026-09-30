/**
 * Componente: Radio group
 * `RadioGroup` valida un `<fieldset data-radio-group>` obligatorio
 * (`data-required`): exige que haya un radio marcado y pinta o quita
 * el error sobre el propio `<fieldset>` con
 * `src/utils/field-validation.js`. El resto del comportamiento
 * (flechas, Tab, selección) es del navegador: un grupo de radios con
 * el mismo `name` ya lo hace, sin roving tabindex propio.
 *
 * Decisiones no obvias:
 * - `validate()` no hace nada si el grupo no es `data-required`:
 *   siempre devuelve `true`.
 * - El mensaje se pinta sobre el `<fieldset>`, no sobre un radio en
 *   concreto: es el grupo el que es obligatorio, no una opción.
 * - Una vez marcado inválido, elegir cualquier radio retira el error
 *   al momento (listener de `change` en el propio `<fieldset>`), igual
 *   que `TextField` lo retira al escribir un valor válido.
 *
 * Uso:
 *   import { RadioGroup, initRadioGroups } from './radio-group.js';
 *   const group = new RadioGroup(document.querySelector('[data-radio-group]'));
 *   group.validate();
 *   // O, para inicializar todos los [data-radio-group] de la página:
 *   initRadioGroups();
 */

import {
  setFieldError,
  clearFieldError,
  DEFAULT_MESSAGES,
} from '../../utils/field-validation.js';

export class RadioGroup {
  /** @param {HTMLElement} fieldset [data-radio-group] */
  constructor(fieldset) {
    if (!fieldset || fieldset.tagName !== 'FIELDSET') {
      throw new Error('RadioGroup: se requiere un elemento <fieldset>.');
    }
    this.el = fieldset;
    this._onChange = this._onChange.bind(this);
    fieldset.addEventListener('change', this._onChange);
  }

  /** @returns {boolean} */
  get invalid() {
    return this.el.getAttribute('aria-invalid') === 'true';
  }

  /**
   * Exige una opción marcada si el grupo es `data-required`. Se puede
   * llamar en cualquier momento (p. ej. al enviar el formulario).
   * @returns {boolean}
   */
  validate() {
    if (!this.el.hasAttribute('data-required')) return true;

    if (this.el.querySelector('input[type="radio"]:checked')) {
      clearFieldError(this.el);
      return true;
    }

    const message =
      this.el.getAttribute('data-error-required') ||
      DEFAULT_MESSAGES.valueMissing;
    setFieldError(this.el, message);
    return false;
  }

  destroy() {
    this.el.removeEventListener('change', this._onChange);
  }

  _onChange() {
    if (this.invalid) this.validate();
  }
}

/**
 * Inicializa todos los [data-radio-group] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {RadioGroup[]}
 */
export function initRadioGroups(root = document) {
  return Array.from(root.querySelectorAll('[data-radio-group]')).map(
    (fieldset) => new RadioGroup(fieldset)
  );
}
