/**
 * Componente: Text field — validación y resumen de errores
 * Añade la Constraint Validation nativa (`checkValidity()`) al marcado
 * de text-field.html: valida cada campo al perder el foco y, mientras
 * siga inválido, también al escribir, para retirar el error en cuanto
 * se corrige. Pinta y enlaza el mensaje con
 * `src/utils/field-validation.js`.
 *
 * `FormValidation` valida todo el formulario al enviarlo: campos de
 * `[data-field]`, grupos `[data-radio-group][data-required]` (Radio
 * group, SPEC 04 paso 7) y casillas `required` sueltas (Checkbox, paso
 * 5) que no estén dentro de un `[data-field]`. No depende de las
 * clases `RadioGroup` ni `Checkbox`: solo de esos atributos y de la
 * Constraint Validation nativa, así que funciona igual si esos
 * componentes se inicializan por su cuenta o no.
 *
 * Decisiones no obvias:
 * - No valida hasta que el campo pierde el foco por primera vez («se
 *   toca»): un campo `required` vacío no muestra error mientras el
 *   usuario todavía no ha llegado a él ni ha salido de él.
 * - Una vez tocado e inválido, también valida en cada `input`, solo
 *   para poder retirar el error en cuanto el valor pasa a ser válido
 *   (o para actualizar el mensaje si cambia el motivo de invalidez).
 *   No introduce un error nuevo mientras el campo sigue siendo válido.
 * - El mensaje sale de `data-error-<clave>` en el control
 *   (`data-error-required`, `data-error-type-mismatch`,
 *   `data-error-pattern`…) o, si no existe, de `DEFAULT_MESSAGES`.
 *   Nunca de `control.validationMessage`: depende del idioma del
 *   navegador, no del de la página.
 * - El error de un campo no se anuncia con una región viva: se enlaza
 *   con `aria-describedby` y el lector lo lee al volver al campo.
 * - El resumen de errores tampoco usa una región viva: recibe el foco
 *   (`tabindex="-1"`) al fallar el envío, y el lector lo anuncia por
 *   ese cambio de foco. Anunciarlo además con `announce()` sería doble
 *   lectura.
 * - `[data-validate]` pone `novalidate` en el `<form>` al construirse:
 *   sin JS, el navegador sigue validando por su cuenta.
 *
 * Uso:
 *   import { initTextFields, initForms } from './text-field.js';
 *   initTextFields(); // valida cada [data-field] en su propio blur
 *   initForms();      // [data-validate]: resumen de errores al enviar
 */

import {
  setFieldError,
  clearFieldError,
  DEFAULT_MESSAGES,
} from '../../utils/field-validation.js';

/**
 * Sufijo de `data-error-<sufijo>` por cada clave de `ValidityState`
 * que este componente sabe resolver, en el orden en que se comprueban.
 */
const VALIDITY_ATTR = {
  valueMissing: 'required',
  typeMismatch: 'type-mismatch',
  patternMismatch: 'pattern',
  tooShort: 'too-short',
  tooLong: 'too-long',
  rangeUnderflow: 'range-underflow',
  rangeOverflow: 'range-overflow',
  stepMismatch: 'step-mismatch',
  badInput: 'bad-input',
};

/**
 * @param {HTMLElement} control
 * @returns {string}
 */
function resolveMessage(control) {
  const { validity } = control;
  for (const [key, attrSuffix] of Object.entries(VALIDITY_ATTR)) {
    if (!validity[key]) continue;
    const override = control.getAttribute(`data-error-${attrSuffix}`);
    return override || DEFAULT_MESSAGES[key];
  }
  // Motivo de invalidez no cubierto por las claves anteriores (p. ej.
  // customError, fuera de alcance sin validación de servidor).
  return DEFAULT_MESSAGES.badInput;
}

/**
 * Valida `control` con la Constraint Validation nativa y pinta o quita
 * su mensaje de error. La usan `TextField.validate()` y
 * `FormValidation`.
 * @param {HTMLElement} control
 * @returns {boolean}
 */
function validateControl(control) {
  if (control.checkValidity()) {
    clearFieldError(control);
    return true;
  }
  setFieldError(control, resolveMessage(control));
  return false;
}

export class TextField {
  /** @param {HTMLElement} el [data-field] con un solo control dentro */
  constructor(el) {
    const control = el?.querySelector('input, select, textarea');
    if (!control) {
      throw new Error('TextField: el elemento necesita un control dentro');
    }
    this.el = el;
    this._control = control;
    this._touched = false;
    this._onBlur = this._onBlur.bind(this);
    this._onInput = this._onInput.bind(this);
    control.addEventListener('blur', this._onBlur);
    control.addEventListener('input', this._onInput);
  }

  /** @returns {HTMLElement} */
  get control() {
    return this._control;
  }

  /** @returns {boolean} */
  get invalid() {
    return this._control.getAttribute('aria-invalid') === 'true';
  }

  /**
   * Valida con la Constraint Validation nativa y pinta o quita el
   * mensaje de error. Se puede llamar en cualquier momento (p. ej. al
   * enviar el formulario), no solo tras el blur.
   * @returns {boolean}
   */
  validate() {
    return validateControl(this._control);
  }

  destroy() {
    this._control.removeEventListener('blur', this._onBlur);
    this._control.removeEventListener('input', this._onInput);
  }

  _onBlur() {
    this._touched = true;
    this.validate();
  }

  _onInput() {
    if (this._touched && this.invalid) this.validate();
  }
}

/**
 * Inicializa todos los [data-field] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {TextField[]}
 */
export function initTextFields(root = document) {
  return Array.from(root.querySelectorAll('[data-field]')).map(
    (el) => new TextField(el)
  );
}

/**
 * @param {HTMLElement} target Control o fieldset con id, foco al pulsar
 *   el enlace del resumen.
 * @returns {string} Texto del <label for> o del <legend> más cercano.
 */
function fieldLabel(target) {
  if (target.tagName === 'FIELDSET') {
    return target.querySelector('legend')?.textContent.trim() || '';
  }
  const label =
    target.id && document.querySelector(`label[for="${target.id}"]`);
  return label ? label.textContent.trim() : '';
}

export class FormValidation {
  /** @param {HTMLFormElement} form [data-validate] */
  constructor(form) {
    if (!form || form.tagName !== 'FORM') {
      throw new Error('FormValidation: se requiere un elemento <form>.');
    }
    this.form = form;
    form.setAttribute('novalidate', '');
    this._summary = this._resolveSummary();
    this._onSubmit = this._onSubmit.bind(this);
    form.addEventListener('submit', this._onSubmit);
  }

  /**
   * Valida todo el formulario. Si hay errores, rellena el resumen y le
   * da el foco.
   * @returns {boolean}
   */
  validate() {
    const invalid = this._validateAll();
    this._renderSummary(invalid);
    if (invalid.length) {
      this._summary.focus();
      return false;
    }
    return true;
  }

  destroy() {
    this.form.removeEventListener('submit', this._onSubmit);
  }

  /** @param {SubmitEvent} event */
  _onSubmit(event) {
    if (!this.validate()) {
      event.preventDefault();
    }
  }

  /** @returns {{ target: HTMLElement, message: string }[]} */
  _validateAll() {
    const invalid = [];

    this.form.querySelectorAll('[data-field]').forEach((field) => {
      const control = field.querySelector('input, select, textarea');
      if (!control) return;
      if (!validateControl(control)) {
        invalid.push({ target: control, message: resolveMessage(control) });
      }
    });

    this.form.querySelectorAll('[data-radio-group]').forEach((group) => {
      if (!group.hasAttribute('data-required')) return;
      const checked = group.querySelector('input[type="radio"]:checked');
      if (checked) {
        clearFieldError(group);
        return;
      }
      const message =
        group.getAttribute('data-error-required') ||
        DEFAULT_MESSAGES.valueMissing;
      setFieldError(group, message);
      invalid.push({
        target: group.querySelector('input[type="radio"]') || group,
        message,
      });
    });

    this.form
      .querySelectorAll('input[type="checkbox"][required]')
      .forEach((checkbox) => {
        if (checkbox.closest('[data-field]')) return; // ya validada arriba
        if (!validateControl(checkbox)) {
          invalid.push({
            target: checkbox,
            message: resolveMessage(checkbox),
          });
        }
      });

    return invalid;
  }

  /** @returns {HTMLElement} */
  _resolveSummary() {
    let summary = this.form.querySelector('[data-error-summary]');
    if (!summary) {
      summary = document.createElement('div');
      summary.setAttribute('data-error-summary', '');
      summary.className = 'c-error-summary';
      this.form.insertBefore(summary, this.form.firstElementChild);
    }
    summary.tabIndex = -1;
    summary.hidden = true;
    return summary;
  }

  /** @param {{ target: HTMLElement, message: string }[]} invalid */
  _renderSummary(invalid) {
    this._summary.innerHTML = '';
    if (!invalid.length) {
      this._summary.hidden = true;
      return;
    }

    const title = document.createElement('p');
    title.className = 'c-error-summary__title';
    title.textContent =
      invalid.length === 1
        ? 'Hay 1 error en el formulario'
        : `Hay ${invalid.length} errores en el formulario`;

    const list = document.createElement('ul');
    list.className = 'c-error-summary__list';
    invalid.forEach(({ target, message }) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${target.id}`;
      const label = fieldLabel(target);
      link.textContent = label ? `${label}: ${message}` : message;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        target.focus();
      });
      li.appendChild(link);
      list.appendChild(li);
    });

    this._summary.append(title, list);
    this._summary.hidden = false;
  }
}

/**
 * Inicializa todos los [data-validate] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {FormValidation[]}
 */
export function initForms(root = document) {
  return Array.from(root.querySelectorAll('[data-validate]')).map(
    (form) => new FormValidation(form)
  );
}
