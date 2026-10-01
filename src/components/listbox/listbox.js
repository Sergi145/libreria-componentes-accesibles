/**
 * Componente: Listbox
 * Implementa el patrón WAI-ARIA APG "Listbox" (selección simple y
 * múltiple): https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * Reutiliza `rovingTabindex()` (foco DOM real, no
 * `aria-activedescendant`) y `createTypeahead()` de `src/utils/`. El
 * selector que reciben ambos excluye las opciones
 * `aria-disabled="true"`, así nunca reciben el foco con las flechas ni
 * se seleccionan con clic, typeahead o cualquiera de las teclas de
 * selección múltiple.
 *
 * En selección simple la selección sigue al foco: `rovingTabindex()`
 * mueve el foco con las flechas/Home/End/clic y, cada vez que lo hace,
 * llama a `onFocusChange`, que aquí selecciona la opción. En selección
 * múltiple (`aria-multiselectable="true"`) las flechas/Home/End solo
 * mueven el foco (`onFocusChange` solo actualiza el ancla de rango, sin
 * seleccionar); Espacio, Mayús+flecha, Ctrl+Mayús+Inicio/Fin, Ctrl+A y
 * Mayús+clic los gestiona `_onKeydown`/`_onClick` por su cuenta, sin
 * pasar por `rovingTabindex()`.
 *
 * Decisiones no obvias:
 * - `rovingTabindex()` también llama a `onFocusChange` en su propio
 *   arranque (con la primera opción, a ciegas). La bandera `ready` lo
 *   ignora hasta que el constructor fija el estado inicial correcto
 *   (en simple, la opción `aria-selected="true"` del HTML o, si no hay
 *   ninguna, la primera; en múltiple, el estado ya viene dado por el
 *   HTML y solo hace falta mover el tabindex), igual que hace `tabs.js`
 *   con `aria-selected`.
 * - `_onClick` llama a `stopImmediatePropagation()` en todo clic sobre
 *   una opción válida para que el propio listener de clic de
 *   `rovingTabindex()` (que no distingue Mayús ni modo) no vuelva a
 *   mover el tabindex o el ancla de rango por su cuenta.
 * - Mayús+flecha y Ctrl+Mayús+Inicio/Fin también cancelan la
 *   propagación: sin ello, el listener de teclado de `rovingTabindex()`
 *   movería el foco otra vez con su propia lógica (sin seleccionar ni
 *   respetar el rango).
 * - `listbox:change` solo se dispara si algo cambió de verdad (como el
 *   `change` de un `<select>` nativo): nunca al construir, ni al
 *   reseleccionar una opción ya seleccionada.
 * - Con Espacio, si hay una búsqueda de typeahead en marcha (una letra
 *   tecleada hace menos de 500 ms), el espacio se trata como parte de
 *   la búsqueda en vez de alternar la opción — así un texto con espacio
 *   («San Sebastián») se puede buscar sin alternar nada por el camino.
 * - `data-name` crea un `<input type="hidden" name>` por valor
 *   seleccionado, como hermano del propio listbox; se reconstruyen
 *   entrada por entrada en cada cambio de selección en vez de mutar los
 *   que ya había, así nunca quedan de más tras una deselección.
 *
 * Uso:
 *   import { Listbox } from './listbox.js';
 *   const listbox = new Listbox(document.querySelector('[data-listbox]'));
 *   listbox.value; // → string | null (simple) o string[] (múltiple)
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';
import { createTypeahead } from '../../utils/typeahead.js';

const OPTION_SELECTOR = '.c-listbox__option:not([aria-disabled="true"])';

// Debe coincidir con el timeout por defecto de createTypeahead(): es lo
// que tarda su búfer en vaciarse, y Espacio lo consulta para decidir si
// forma parte de una búsqueda en marcha o si alterna la opción activa.
const TYPEAHEAD_TIMEOUT = 500;

export class Listbox {
  /** @param {HTMLElement} el [data-listbox] con role="listbox". */
  constructor(el) {
    if (!el) {
      throw new Error('Listbox: se requiere el elemento con role="listbox".');
    }
    this.el = el;
    this._typeahead = createTypeahead();
    this._hiddenInputEls = [];
    this._anchor = null;
    this._lastSearchTime = 0;

    this._onKeydown = this._onKeydown.bind(this);
    this._onClick = this._onClick.bind(this);
    el.addEventListener('keydown', this._onKeydown);
    el.addEventListener('click', this._onClick);

    let ready = false;
    this._destroyRoving = rovingTabindex(el, OPTION_SELECTOR, {
      orientation: 'vertical',
      loop: false,
      onFocusChange: (option) => {
        if (!ready) return;
        if (this.multiple) {
          this._anchor = this._options().indexOf(option);
        } else {
          this._select(option, { focus: false });
        }
      },
    });

    const options = this._options();
    const initial =
      options.find(
        (option) => option.getAttribute('aria-selected') === 'true'
      ) ?? options[0];
    if (this.multiple) {
      if (initial) this._moveTabindexTo(initial);
      this._syncHiddenInputs();
    } else if (initial) {
      this._applySelection(initial);
    }
    ready = true;
  }

  /** @returns {boolean} */
  get multiple() {
    return this.el.getAttribute('aria-multiselectable') === 'true';
  }

  /** @returns {string | string[] | null} */
  get value() {
    const selected = this._options().filter(
      (option) => option.getAttribute('aria-selected') === 'true'
    );
    if (this.multiple) return selected.map((option) => this._valueOf(option));
    return selected.length ? this._valueOf(selected[0]) : null;
  }

  /** @param {string | string[] | null} v No dispara 'listbox:change'. */
  set value(v) {
    if (this.multiple) {
      const values = Array.isArray(v) ? v : [v];
      this._options().forEach((option) => {
        option.setAttribute(
          'aria-selected',
          String(values.includes(this._valueOf(option)))
        );
      });
      this._syncHiddenInputs();
      return;
    }
    const match = this._options().find((option) => this._valueOf(option) === v);
    if (match) this._applySelection(match);
  }

  /** Quita los listeners propios, los de rovingTabindex() y los inputs ocultos. */
  destroy() {
    this._destroyRoving();
    this.el.removeEventListener('keydown', this._onKeydown);
    this.el.removeEventListener('click', this._onClick);
    this._hiddenInputEls.forEach((input) => input.remove());
  }

  _options() {
    return Array.from(this.el.querySelectorAll(OPTION_SELECTOR));
  }

  _valueOf(option) {
    return option.getAttribute('data-value') ?? option.textContent.trim();
  }

  _currentOption() {
    return this.el.querySelector(`${OPTION_SELECTOR}[tabindex="0"]`);
  }

  _moveTabindexTo(option) {
    this._options().forEach((other) => {
      other.setAttribute('tabindex', other === option ? '0' : '-1');
    });
  }

  /** Selección simple: marca `option` como la única seleccionada y mueve el tabindex. */
  _applySelection(option) {
    this._moveTabindexTo(option);
    this._options().forEach((other) => {
      other.setAttribute('aria-selected', String(other === option));
    });
    this._syncHiddenInputs();
  }

  _select(option, { focus = true } = {}) {
    const changed = option.getAttribute('aria-selected') !== 'true';
    this._applySelection(option);
    if (focus) option.focus();
    if (changed) this._dispatchChange();
  }

  /** Selección múltiple: alterna `option` sin tocar las demás. */
  _toggle(option) {
    const selected = option.getAttribute('aria-selected') !== 'true';
    option.setAttribute('aria-selected', String(selected));
    this._syncHiddenInputs();
    this._dispatchChange();
  }

  _moveAndToggle(delta) {
    const options = this._options();
    const current = this._currentOption();
    if (!current) return;
    const targetIndex = options.indexOf(current) + delta;
    if (targetIndex < 0 || targetIndex >= options.length) return;
    const target = options[targetIndex];
    this._moveTabindexTo(target);
    target.focus();
    this._toggle(target);
  }

  _selectRangeToExtreme(edge) {
    const options = this._options();
    const current = this._currentOption();
    if (!current || !options.length) return;
    const currentIndex = options.indexOf(current);
    const targetIndex = edge === 'start' ? 0 : options.length - 1;
    const [from, to] =
      currentIndex <= targetIndex
        ? [currentIndex, targetIndex]
        : [targetIndex, currentIndex];
    for (let i = from; i <= to; i += 1) {
      options[i].setAttribute('aria-selected', 'true');
    }
    this._moveTabindexTo(options[targetIndex]);
    options[targetIndex].focus();
    this._syncHiddenInputs();
    this._dispatchChange();
  }

  _selectAllOrNone() {
    const options = this._options();
    const allSelected = options.every(
      (option) => option.getAttribute('aria-selected') === 'true'
    );
    options.forEach((option) =>
      option.setAttribute('aria-selected', String(!allSelected))
    );
    this._syncHiddenInputs();
    this._dispatchChange();
  }

  _dispatchChange() {
    this.el.dispatchEvent(
      new CustomEvent('listbox:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _typeaheadActive() {
    return Date.now() - this._lastSearchTime < TYPEAHEAD_TIMEOUT;
  }

  /** Crea/reconstruye los <input type="hidden"> de data-name junto al listbox. */
  _syncHiddenInputs() {
    const name = this.el.getAttribute('data-name');
    if (!name) return;

    this._hiddenInputEls.forEach((input) => input.remove());

    const value = this.value;
    const values = this.multiple ? value : value !== null ? [value] : [];
    this._hiddenInputEls = values.map((v) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = v;
      return input;
    });
    if (this._hiddenInputEls.length) this.el.after(...this._hiddenInputEls);
  }

  _onKeydown(event) {
    const { key, shiftKey, ctrlKey, metaKey, altKey } = event;

    if (this.multiple) {
      if (
        (ctrlKey || metaKey) &&
        !shiftKey &&
        !altKey &&
        key.toLowerCase() === 'a'
      ) {
        event.preventDefault();
        this._selectAllOrNone();
        return;
      }
      if (
        (ctrlKey || metaKey) &&
        shiftKey &&
        !altKey &&
        (key === 'Home' || key === 'End')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._selectRangeToExtreme(key === 'Home' ? 'start' : 'end');
        return;
      }
      if (
        shiftKey &&
        !ctrlKey &&
        !metaKey &&
        !altKey &&
        (key === 'ArrowDown' || key === 'ArrowUp')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this._moveAndToggle(key === 'ArrowDown' ? 1 : -1);
        return;
      }
      if (
        key === ' ' &&
        !shiftKey &&
        !ctrlKey &&
        !metaKey &&
        !altKey &&
        !this._typeaheadActive()
      ) {
        event.preventDefault();
        const current = this._currentOption();
        if (current) this._toggle(current);
        return;
      }
    }

    if (ctrlKey || metaKey || altKey) return;
    if (key.length !== 1) return;

    const current = this._currentOption();
    if (!current) return;

    const options = this._options();
    const index = this._typeahead.search(
      key,
      options,
      options.indexOf(current)
    );
    this._lastSearchTime = Date.now();
    if (index === -1) return;

    event.preventDefault();
    const target = options[index];
    if (this.multiple) {
      this._moveTabindexTo(target);
      target.focus();
      this._anchor = index;
    } else {
      this._select(target);
    }
  }

  _onClick(event) {
    const option = event.target.closest(OPTION_SELECTOR);
    if (!option || !this._options().includes(option)) return;

    event.stopImmediatePropagation();

    if (!this.multiple) {
      this._select(option);
      return;
    }

    const options = this._options();
    const index = options.indexOf(option);
    this._moveTabindexTo(option);
    option.focus();

    if (event.shiftKey && this._anchor !== null) {
      const [from, to] =
        this._anchor <= index ? [this._anchor, index] : [index, this._anchor];
      options.forEach((other, i) => {
        other.setAttribute('aria-selected', String(i >= from && i <= to));
      });
      this._syncHiddenInputs();
      this._dispatchChange();
    } else {
      this._toggle(option);
      this._anchor = index;
    }
  }
}

/**
 * Inicializa todos los listbox con [data-listbox] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Listbox[]}
 */
export function initListboxes(root = document) {
  return Array.from(root.querySelectorAll('[data-listbox]')).map(
    (el) => new Listbox(el)
  );
}
