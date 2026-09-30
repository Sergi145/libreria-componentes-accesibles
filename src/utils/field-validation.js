/**
 * Utilidad: field-validation
 * Pinta y quita el mensaje de error de un control de formulario
 * (<input>, <select>, <textarea> o un <fieldset> de grupo) y lo enlaza
 * con `aria-describedby` sin perder la ayuda que ya tuviera. La usan
 * TextField, CheckboxGroup y RadioGroup.
 *
 * Decisiones no obvias:
 * - Sin generador de ids: el control necesita su propio `id` escrito en
 *   el marcado. El mensaje deriva su id del control (`<id>-error`).
 * - El mensaje se inserta en `[data-field-error="<id>"]` si existe, o al
 *   final del `[data-field]` que contiene el control; si no hay ninguno
 *   de los dos, se inserta justo después del control.
 * - `aria-describedby` conserva los demás ids (p. ej. el de la ayuda):
 *   `setFieldError()`/`clearFieldError()` solo añaden o quitan el suyo.
 * - `DEFAULT_MESSAGES` da un texto en español por cada clave de
 *   `ValidityState`; nunca se usa `validationMessage`, que depende del
 *   idioma del navegador y no del de la página. Un control puede
 *   sustituir cualquiera con `data-error-<clave>` (lo resuelve quien
 *   llama a `setFieldError()`, esta utilidad solo pinta el mensaje ya
 *   resuelto).
 *
 * Uso:
 *   setFieldError(input, 'Introduce un correo electrónico válido');
 *   // …
 *   clearFieldError(input);
 */

/** Un texto en español por cada clave de `ValidityState`. */
export const DEFAULT_MESSAGES = {
  valueMissing: 'Este campo es obligatorio',
  typeMismatch: 'El valor no tiene el formato esperado',
  patternMismatch: 'El formato no es válido',
  tooShort: 'El texto es demasiado corto',
  tooLong: 'El texto es demasiado largo',
  rangeUnderflow: 'El valor es demasiado bajo',
  rangeOverflow: 'El valor es demasiado alto',
  stepMismatch: 'El valor no es válido',
  badInput: 'El valor no es válido',
};

/**
 * @param {HTMLElement} control
 * @returns {string}
 */
function requireId(control) {
  if (!control.id) {
    throw new Error('field-validation: el control necesita un atributo id');
  }
  return control.id;
}

/**
 * @param {HTMLElement} control
 * @param {string} id
 */
function addDescribedBy(control, id) {
  const ids = (control.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter(Boolean);
  if (!ids.includes(id)) {
    ids.push(id);
  }
  control.setAttribute('aria-describedby', ids.join(' '));
}

/**
 * @param {HTMLElement} control
 * @param {string} id
 */
function removeDescribedBy(control, id) {
  const ids = (control.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter((existing) => existing && existing !== id);
  if (ids.length) {
    control.setAttribute('aria-describedby', ids.join(' '));
  } else {
    control.removeAttribute('aria-describedby');
  }
}

/**
 * Elemento donde insertar el mensaje de `control`.
 * @param {HTMLElement} control
 * @param {string} controlId
 * @returns {{ parent: HTMLElement, before: Node | null }}
 */
function resolveHost(control, controlId) {
  const target = document.querySelector(`[data-field-error="${controlId}"]`);
  if (target) return { parent: target, before: null };

  const field = control.closest('[data-field]');
  if (field) return { parent: field, before: null };

  return { parent: control.parentNode, before: control.nextSibling };
}

/**
 * Marca `control` como inválido y pinta `message` en su mensaje de
 * error, creándolo si hace falta.
 * @param {HTMLElement} control
 * @param {string} message
 */
export function setFieldError(control, message) {
  const controlId = requireId(control);
  const errorId = `${controlId}-error`;

  let errorEl = document.getElementById(errorId);
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = errorId;
    errorEl.className = 'c-field__error';
    const { parent, before } = resolveHost(control, controlId);
    parent.insertBefore(errorEl, before);
  }
  errorEl.textContent = message;

  control.setAttribute('aria-invalid', 'true');
  addDescribedBy(control, errorId);
}

/**
 * Quita el mensaje de error de `control`, si lo tiene.
 * @param {HTMLElement} control
 */
export function clearFieldError(control) {
  const controlId = requireId(control);
  const errorId = `${controlId}-error`;

  document.getElementById(errorId)?.remove();
  control.removeAttribute('aria-invalid');
  removeDescribedBy(control, errorId);
}
