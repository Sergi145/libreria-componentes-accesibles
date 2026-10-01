/**
 * Componente: Combobox
 * Implementa el patrón WAI-ARIA APG "Combobox":
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * Dos variantes, cada una con su clase: `Combobox` (editable, valor
 * libre con lista "list") y `SelectCombobox` (solo-selección, sobre un
 * `<select>` — ver su cabecera justo antes de su clase, más abajo).
 * Comparten `placePopup()` para colocar el popup con `placeFloating()`.
 */

/**
 * Componente: Combobox editable
 * El foco del DOM nunca sale del `<input>`: la opción activa se marca
 * con `aria-activedescendant`, nunca moviendo el foco real a la
 * opción (a diferencia de Listbox, que usa roving tabindex). Las
 * opciones ya existen en el HTML; `combobox.js` solo les pone o les
 * quita `hidden` al filtrar, nunca las crea ni las destruye — así
 * `aria-activedescendant` siempre apunta a un `id` estable.
 *
 * Decisiones no obvias:
 * - Escribir filtra por «contiene», sin tildes ni mayúsculas
 *   (`normalizeText()`), y abre el popup; con el campo vacío, todas
 *   las opciones "contienen" la búsqueda vacía, así que se ven todas.
 * - Con 0 resultados, el popup (`role="listbox"`) se queda oculto y
 *   `aria-expanded` en `false` — no tiene sentido expandir una lista
 *   vacía — y en su lugar se muestra `.c-combobox__empty`, buscado por
 *   estructura (`input.closest('.c-combobox')`), no por id: es opcional,
 *   así que su ausencia no rompe el resto del componente.
 * - Tras 500 ms sin escribir, `announce()` dice el recuento de
 *   resultados («Sin resultados», «1 resultado» o «N resultados»):
 *   escribir varias letras seguidas solo dispara un anuncio, el de la
 *   última pausa, igual que el búfer de `createTypeahead()`.
 * - Con el popup cerrado, `↓`/`↑` lo abren y activan la primera/última
 *   opción visible; `Alt+↓` lo abre sin activar ninguna. Con el popup
 *   ya abierto, `↓`/`↑` mueven la opción activa con envoltura.
 * - `Escape` cierra el popup si está abierto; si ya estaba cerrado,
 *   vacía el campo. `dismissable()` ya cancela el evento en el primer
 *   caso (como en Menu Button) para que no cierre además un `<dialog>`
 *   que contenga el combobox; el segundo caso lo cancela esta misma
 *   clase, por la misma razón.
 * - `←`/`→`/`Home`/`End` quitan `aria-activedescendant` sin cerrar el
 *   popup: el usuario sigue moviendo el cursor de texto con esas
 *   teclas, y ninguna opción debe quedar marcada como activa mientras
 *   lo hace.
 * - `dismissable()` solo existe mientras hay una sesión de búsqueda
 *   activa (igual que en Dropdown): se crea en `open()` y se destruye
 *   en `close()`.
 * - `combobox:change` se dispara solo al aceptar una opción (Enter o
 *   clic), no en cada tecla: cada pulsación ya se puede observar con
 *   el evento nativo `input` del propio campo.
 * - Con `data-strict`, perder el foco con un texto que no coincide con
 *   ninguna opción pinta el error con `setFieldError()`; elegir una
 *   opción lo retira al momento (no espera a un `blur`, porque aceptar
 *   devuelve el foco al propio input: nunca llegaría a perderlo).
 * - Aceptar una opción también la anuncia con `announce()` (ver
 *   `announceChoice()`): el cambio de texto del input, por sí solo, no
 *   todos los lectores de pantalla lo anuncian de forma fiable sobre
 *   un `role="combobox"`.
 *
 * Uso:
 *   import { Combobox } from './combobox.js';
 *   new Combobox(document.querySelector('[data-combobox]'));
 */

import { dismissable } from '../../utils/dismiss.js';
import { normalizeText, createTypeahead } from '../../utils/typeahead.js';
import { announce } from '../../utils/live-region.js';
import {
  setFieldError,
  clearFieldError,
} from '../../utils/field-validation.js';
import { placeFloating } from '../../utils/placement.js';

const OPTION_SELECTOR = '[role="option"]';
const ANNOUNCE_DELAY = 500;

// Coloca el popup abajo y, si no cabe, arriba. La comparten Combobox y
// SelectCombobox: solo cambia el modificador; el CSS de cada lado lo
// pone combobox.css.
function placePopup(popup) {
  placeFloating(popup, {
    preferred: 'bottom',
    apply: (side) => {
      popup.classList.toggle('c-combobox__popup--top', side === 'top');
    },
  });
}

// Anuncia el valor elegido al aceptar una opción (Enter, Espacio,
// Alt+↑, Tab o clic), en las dos variantes: el cambio de texto del
// input o del disparador no basta para que todos los lectores de
// pantalla lo anuncien de forma fiable, así que se refuerza con una
// región viva, igual que el recuento de resultados del editable.
function announceChoice(labelEl, valueText) {
  const label = labelEl?.textContent.trim();
  announce(
    label
      ? `${label}: ${valueText}, seleccionado`
      : `${valueText}, seleccionado`
  );
}

export class Combobox {
  /** @param {HTMLInputElement} input [data-combobox] con role="combobox". */
  constructor(input) {
    if (!input) {
      throw new Error('Combobox: se requiere el <input role="combobox">.');
    }
    this.input = input;

    // Busca dentro de getRootNode(), no con document.getElementById(): el
    // input puede construirse antes de insertar su envoltorio en el
    // documento (p. ej. en las historias de Storybook), y en ese momento
    // el id del popup todavía no es alcanzable desde document (ver la
    // misma nota en tooltip.js).
    const popupId = input.getAttribute('aria-controls');
    this._popup = popupId
      ? input.getRootNode().querySelector(`[id="${popupId}"]`)
      : null;
    if (!this._popup) {
      throw new Error(
        'Combobox: aria-controls debe apuntar a la lista de opciones.'
      );
    }
    // Opcional: closest() funciona igual con el envoltorio todavía sin
    // insertar en el documento, a diferencia de un id + getElementById.
    this._emptyMessage =
      input.closest('.c-combobox')?.querySelector('.c-combobox__empty') ?? null;
    // Solo para el texto del anuncio al aceptar (ver _accept()): el
    // nombre accesible del input ya lo da el propio <label for> nativo,
    // sin necesitar aria-labelledby aquí.
    this._label = input.id
      ? input.getRootNode().querySelector(`label[for="${input.id}"]`)
      : null;

    this._dismissDestroy = null;
    this._announceTimer = null;

    this._onInput = this._onInput.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onPopupClick = this._onPopupClick.bind(this);

    input.addEventListener('input', this._onInput);
    input.addEventListener('keydown', this._onKeydown);
    input.addEventListener('blur', this._onBlur);
    this._popup.addEventListener('click', this._onPopupClick);

    // Solo sincroniza qué opciones están ocultas; no toca aria-expanded
    // ni la visibilidad del propio popup — el estado inicial (cerrado)
    // sale del HTML, como en el resto de componentes del proyecto.
    this._filter();
  }

  /** @returns {string} */
  get value() {
    return this.input.value;
  }

  /** @returns {boolean} */
  get expanded() {
    return this.input.getAttribute('aria-expanded') === 'true';
  }

  open() {
    this._filter();
    this._updateVisibility();
    if (!this._dismissDestroy) {
      this._dismissDestroy = dismissable(this._popup, {
        trigger: this.input,
        onDismiss: () => this.close(),
      });
    }
  }

  close() {
    this.input.setAttribute('aria-expanded', 'false');
    this._popup.hidden = true;
    if (this._emptyMessage) this._emptyMessage.hidden = true;
    this._clearActive();
    this._cancelAnnounce();
    this._dismissDestroy?.();
    this._dismissDestroy = null;
  }

  destroy() {
    this.close();
    this.input.removeEventListener('input', this._onInput);
    this.input.removeEventListener('keydown', this._onKeydown);
    this.input.removeEventListener('blur', this._onBlur);
    this._popup.removeEventListener('click', this._onPopupClick);
  }

  _options() {
    return Array.from(this._popup.querySelectorAll(OPTION_SELECTOR));
  }

  _visibleOptions() {
    return this._options().filter((option) => !option.hidden);
  }

  _activeOption() {
    const id = this.input.getAttribute('aria-activedescendant');
    return id ? document.getElementById(id) : null;
  }

  _setActive(option) {
    this._options().forEach((other) => {
      other.setAttribute('aria-selected', String(other === option));
    });
    if (option) {
      this.input.setAttribute('aria-activedescendant', option.id);
      // jsdom no implementa scrollIntoView (Vitest correría sin esto).
      option.scrollIntoView?.({ block: 'nearest' });
    } else {
      this.input.removeAttribute('aria-activedescendant');
    }
  }

  _clearActive() {
    this._setActive(null);
  }

  _filter() {
    const query = normalizeText(this.input.value);
    this._options().forEach((option) => {
      option.hidden = !normalizeText(option.textContent).includes(query);
    });
  }

  /** Sincroniza aria-expanded, la visibilidad del popup/del mensaje vacío y su posición. */
  _updateVisibility() {
    const hasResults = this._visibleOptions().length > 0;
    this.input.setAttribute('aria-expanded', String(hasResults));
    this._popup.hidden = !hasResults;
    if (this._emptyMessage) this._emptyMessage.hidden = hasResults;
    if (hasResults) placePopup(this._popup);
    else this._clearActive();
  }

  _move(delta) {
    const visible = this._visibleOptions();
    if (!visible.length) return;
    const current = this._activeOption();
    if (!current) {
      this._setActive(delta > 0 ? visible[0] : visible[visible.length - 1]);
      return;
    }
    const currentIndex = visible.indexOf(current);
    const nextIndex = (currentIndex + delta + visible.length) % visible.length;
    this._setActive(visible[nextIndex]);
  }

  _accept(option) {
    this.input.value = option.textContent.trim();
    this.close();
    this.input.focus();
    clearFieldError(this.input);
    announceChoice(this._label, this.value);
    this._dispatchChange();
  }

  _dispatchChange() {
    this.input.dispatchEvent(
      new CustomEvent('combobox:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _matchesOption(text) {
    const query = normalizeText(text);
    return this._options().some(
      (option) => normalizeText(option.textContent) === query
    );
  }

  _scheduleAnnounce() {
    this._cancelAnnounce();
    this._announceTimer = setTimeout(() => {
      this._announceTimer = null;
      const count = this._visibleOptions().length;
      const message =
        count === 0
          ? 'Sin resultados'
          : count === 1
            ? '1 resultado'
            : `${count} resultados`;
      announce(message);
    }, ANNOUNCE_DELAY);
  }

  _cancelAnnounce() {
    if (this._announceTimer !== null) {
      clearTimeout(this._announceTimer);
      this._announceTimer = null;
    }
  }

  _onInput() {
    this.open();
    this._clearActive();
    this._scheduleAnnounce();
  }

  _onKeydown(event) {
    const { key, altKey } = event;

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!this.expanded) {
        this.open();
        if (!altKey) {
          const visible = this._visibleOptions();
          const target =
            key === 'ArrowDown' ? visible[0] : visible[visible.length - 1];
          if (target) this._setActive(target);
        }
        return;
      }
      this._move(key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (key === 'Enter') {
      const active = this.expanded ? this._activeOption() : null;
      if (active) {
        event.preventDefault();
        this._accept(active);
      }
      return;
    }

    if (key === 'Escape') {
      if (this.expanded) return; // dismissable() se encarga de cerrar.
      event.preventDefault();
      event.stopPropagation();
      this.input.value = '';
      return;
    }

    if (
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Home' ||
      key === 'End'
    ) {
      this._clearActive();
    }
  }

  _onBlur() {
    if (!this.input.hasAttribute('data-strict') || !this.value) return;
    if (this._matchesOption(this.value)) {
      clearFieldError(this.input);
      return;
    }
    const message =
      this.input.getAttribute('data-error-strict') ||
      'Elige una opción de la lista';
    setFieldError(this.input, message);
  }

  _onPopupClick(event) {
    const option = event.target.closest(OPTION_SELECTOR);
    if (option) this._accept(option);
  }
}

/**
 * Componente: Combobox solo-selección
 * Mejora un `<select data-combobox>` nativo con el aspecto y el
 * teclado de un combobox APG, sin permitir texto libre. Sin JS, el
 * `<select>` funciona igual que cualquiera otro; `SelectCombobox` lo
 * oculta (`hidden`, nunca `disabled`) y crea delante un
 * `<div role="combobox" tabindex="0">` — el `<select>` oculto sigue
 * siendo el valor real del formulario, con el mismo `name`.
 *
 * Decisiones no obvias:
 * - El texto del disparador (`.c-combobox__trigger-text`) solo cambia
 *   al **elegir** una opción (Enter/Espacio/Alt+↑/Tab/clic), nunca al
 *   recorrer la lista con las flechas: lo activo (lo que se vería al
 *   elegir ahora) y lo elegido (`aria-selected`) son dos cosas
 *   distintas, igual que en un `<select>` nativo.
 * - La opción activa se marca con la clase `.is-active` (definida en
 *   `../listbox/listbox.css`, junto al `:hover`), no con
 *   `aria-selected`: ese atributo aquí solo refleja la opción elegida
 *   de verdad, nunca la que solo se está recorriendo.
 * - Sin envoltura en las flechas (a diferencia de Listbox y del
 *   combobox editable): `RePág`/`AvPág` mueven 10 opciones, también
 *   sin envoltura, como en los ejemplos de APG.
 * - `Tab` elige la opción activa pero no cancela su propio evento: el
 *   foco sigue tabulando con normalidad después de guardar el cambio,
 *   igual que al salir de un `<select>` nativo.
 * - `<optgroup>` se convierte en `role="presentation"` +
 *   `role="group"` anidado, igual que los grupos de Listbox.
 * - Elegir una opción también la anuncia con `announce()` (ver
 *   `announceChoice()`), con el nombre del campo si tiene `<label>`:
 *   el cambio de texto del disparador, por sí solo, no todos los
 *   lectores de pantalla lo anuncian de forma fiable sobre un
 *   `role="combobox"` que no es un `<input>`/`<select>` nativo.
 *
 * Uso:
 *   import { SelectCombobox } from './combobox.js';
 *   new SelectCombobox(document.querySelector('select[data-combobox]'));
 */
export class SelectCombobox {
  /** @param {HTMLSelectElement} select [data-combobox] sobre un <select>. */
  constructor(select) {
    if (!select) {
      throw new Error('SelectCombobox: se requiere el elemento <select>.');
    }
    if (!select.id) {
      throw new Error('SelectCombobox: el <select> necesita un id.');
    }
    this.select = select;
    const id = select.id;

    this._typeahead = createTypeahead();
    this._options = new Map(); // <li role="option"> → <option> original.
    this._dismissDestroy = null;

    // Busca en getRootNode(), no document.getElementById(): el select
    // puede construirse antes de insertar su envoltorio en el
    // documento (ver la misma nota en tooltip.js y en Combobox).
    this._label = select.getRootNode().querySelector(`label[for="${id}"]`);
    if (this._label && !this._label.id) this._label.id = `${id}-label`;

    this._trigger = this._buildTrigger(id);
    this._popup = this._buildPopup(id);

    select.hidden = true;
    select.before(this._trigger, this._popup);

    this._syncSelection(this._selectedOptionEl());

    this._onKeydown = this._onKeydown.bind(this);
    this._onTriggerClick = this._onTriggerClick.bind(this);
    this._onPopupClick = this._onPopupClick.bind(this);
    this._onLabelClick = this._onLabelClick.bind(this);

    this._trigger.addEventListener('keydown', this._onKeydown);
    this._trigger.addEventListener('click', this._onTriggerClick);
    this._popup.addEventListener('click', this._onPopupClick);
    this._label?.addEventListener('click', this._onLabelClick);
  }

  /** @returns {string} */
  get value() {
    return this.select.value;
  }

  /** @param {string} v No dispara 'combobox:change'. */
  set value(v) {
    const option = Array.from(this.select.options).find((o) => o.value === v);
    if (!option) return;
    this.select.value = v;
    this._syncSelection(option);
  }

  /** @returns {boolean} */
  get expanded() {
    return this._trigger.getAttribute('aria-expanded') === 'true';
  }

  open() {
    if (this.expanded) return;
    this._trigger.setAttribute('aria-expanded', 'true');
    this._popup.hidden = false;
    placePopup(this._popup);
    this._dismissDestroy = dismissable(this._popup, {
      trigger: this._trigger,
      onDismiss: () => this.close(),
    });
  }

  close() {
    this._trigger.setAttribute('aria-expanded', 'false');
    this._popup.hidden = true;
    this._clearActive();
    this._dismissDestroy?.();
    this._dismissDestroy = null;
  }

  /** Quita el combobox creado y vuelve a mostrar el <select> original. */
  destroy() {
    this.close();
    this._trigger.removeEventListener('keydown', this._onKeydown);
    this._trigger.removeEventListener('click', this._onTriggerClick);
    this._popup.removeEventListener('click', this._onPopupClick);
    this._label?.removeEventListener('click', this._onLabelClick);
    this._trigger.remove();
    this._popup.remove();
    this.select.hidden = false;
  }

  _buildTrigger(id) {
    const trigger = document.createElement('div');
    trigger.className = 'c-combobox__trigger';
    trigger.id = `${id}-combobox`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('tabindex', this.select.disabled ? '-1' : '0');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `${id}-listbox`);
    if (this._label) trigger.setAttribute('aria-labelledby', this._label.id);
    if (this.select.hasAttribute('required')) {
      trigger.setAttribute('aria-required', 'true');
    }
    // El icono es estático y decorativo: sin datos de usuario de por
    // medio, innerHTML aquí es seguro y más legible que createElementNS.
    trigger.innerHTML = `
      <span class="c-combobox__trigger-text"></span>
      <svg class="c-combobox__trigger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
    this._triggerText = trigger.querySelector('.c-combobox__trigger-text');
    return trigger;
  }

  _buildPopup(id) {
    const popup = document.createElement('ul');
    popup.className = 'c-listbox c-combobox__popup';
    popup.id = `${id}-listbox`;
    popup.setAttribute('role', 'listbox');
    popup.hidden = true;
    if (this._label) popup.setAttribute('aria-labelledby', this._label.id);

    let n = 0;
    const buildOption = (optionEl) => {
      n += 1;
      const li = document.createElement('li');
      li.id = `${id}-opt-${n}`;
      li.className = 'c-listbox__option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(optionEl.selected));
      if (optionEl.disabled) li.setAttribute('aria-disabled', 'true');
      // Nodo de texto aparte: el texto de la opción es ajeno (viene del
      // <option> original), así que nunca se interpola en el HTML
      // estático del icono que sigue.
      li.append(document.createTextNode(optionEl.textContent));
      li.insertAdjacentHTML(
        'beforeend',
        `<svg class="c-listbox__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <g class="c-listbox__check-forbidden" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke-linecap="round" />
          </g>
        </svg>`
      );
      this._options.set(li, optionEl);
      return li;
    };

    Array.from(this.select.children).forEach((child) => {
      if (child.tagName === 'OPTGROUP') {
        n += 1;
        const labelId = `${id}-group-${n}-label`;
        const groupLi = document.createElement('li');
        groupLi.className = 'c-listbox__group';
        groupLi.setAttribute('role', 'presentation');
        const labelSpan = document.createElement('span');
        labelSpan.className = 'c-listbox__group-label';
        labelSpan.id = labelId;
        labelSpan.textContent = child.label;
        const groupUl = document.createElement('ul');
        groupUl.className = 'c-listbox__group-options';
        groupUl.setAttribute('role', 'group');
        groupUl.setAttribute('aria-labelledby', labelId);
        Array.from(child.children).forEach((optionEl) => {
          groupUl.appendChild(buildOption(optionEl));
        });
        groupLi.append(labelSpan, groupUl);
        popup.appendChild(groupLi);
      } else if (child.tagName === 'OPTION') {
        popup.appendChild(buildOption(child));
      }
    });

    return popup;
  }

  _selectedOptionEl() {
    return this.select.options[this.select.selectedIndex] ?? null;
  }

  _syncSelection(optionEl) {
    this._triggerText.textContent = optionEl ? optionEl.textContent : '';
    this._options.forEach((opt, li) => {
      li.setAttribute('aria-selected', String(opt === optionEl));
    });
  }

  _allOptionLis() {
    return Array.from(this._options.keys());
  }

  _navigableOptions() {
    return this._allOptionLis().filter(
      (li) => li.getAttribute('aria-disabled') !== 'true'
    );
  }

  _liFor(optionEl) {
    if (!optionEl) return null;
    for (const [li, opt] of this._options) {
      if (opt === optionEl) return li;
    }
    return null;
  }

  _activeOption() {
    const id = this._trigger.getAttribute('aria-activedescendant');
    return id ? document.getElementById(id) : null;
  }

  _setActive(li) {
    this._activeOption()?.classList.remove('is-active');
    if (li) {
      this._trigger.setAttribute('aria-activedescendant', li.id);
      li.classList.add('is-active');
      li.scrollIntoView?.({ block: 'nearest' });
    } else {
      this._trigger.removeAttribute('aria-activedescendant');
    }
  }

  _clearActive() {
    this._setActive(null);
  }

  _move(delta) {
    const list = this._navigableOptions();
    if (!list.length) return;
    const current = this._activeOption();
    const currentIndex = current ? list.indexOf(current) : -1;
    const targetIndex = Math.min(
      Math.max(currentIndex + delta, 0),
      list.length - 1
    );
    this._setActive(list[targetIndex]);
  }

  _choose(li) {
    const option = this._options.get(li);
    if (!option) return;
    const changed = this.select.value !== option.value;
    this.select.value = option.value;
    this._syncSelection(option);
    this.close();
    this._trigger.focus();
    if (changed) {
      this.select.dispatchEvent(new Event('change', { bubbles: true }));
      announceChoice(this._label, option.textContent.trim());
      this._dispatchChange();
    }
  }

  _dispatchChange() {
    this._trigger.dispatchEvent(
      new CustomEvent('combobox:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _onClosedKeydown(event) {
    const { key, altKey } = event;

    if (
      key === 'ArrowDown' ||
      key === 'ArrowUp' ||
      key === 'Enter' ||
      key === ' '
    ) {
      event.preventDefault();
      this.open();
      if (!altKey) {
        const current = this._liFor(this._selectedOptionEl());
        this._setActive(current ?? this._navigableOptions()[0] ?? null);
      }
      return;
    }

    if (key === 'Home' || key === 'End') {
      event.preventDefault();
      this.open();
      const list = this._navigableOptions();
      this._setActive(key === 'Home' ? list[0] : list[list.length - 1]);
      return;
    }

    if (key.length === 1 && key !== ' ' && !altKey) {
      const list = this._navigableOptions();
      const current = this._liFor(this._selectedOptionEl());
      const index = this._typeahead.search(key, list, list.indexOf(current));
      if (index !== -1) {
        event.preventDefault();
        this.open();
        this._setActive(list[index]);
      }
    }
  }

  _onOpenKeydown(event) {
    const { key, altKey } = event;

    const isChoose =
      key === 'Enter' ||
      key === ' ' ||
      key === 'Tab' ||
      (key === 'ArrowUp' && altKey);
    if (isChoose) {
      if (key !== 'Tab') event.preventDefault();
      const active = this._activeOption();
      if (active) this._choose(active);
      else this.close();
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      this._move(key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (key === 'Home' || key === 'End') {
      event.preventDefault();
      const list = this._navigableOptions();
      this._setActive(key === 'Home' ? list[0] : list[list.length - 1]);
      return;
    }

    if (key === 'PageDown' || key === 'PageUp') {
      event.preventDefault();
      this._move(key === 'PageDown' ? 10 : -10);
      return;
    }

    if (key.length === 1 && key !== ' ' && !altKey) {
      const list = this._navigableOptions();
      const current = this._activeOption();
      const index = this._typeahead.search(key, list, list.indexOf(current));
      if (index !== -1) {
        event.preventDefault();
        this._setActive(list[index]);
      }
    }
  }

  _onKeydown(event) {
    if (event.ctrlKey || event.metaKey) return;
    if (this.expanded) this._onOpenKeydown(event);
    else this._onClosedKeydown(event);
  }

  _onTriggerClick() {
    if (this.expanded) {
      this.close();
      return;
    }
    this.open();
    const current = this._liFor(this._selectedOptionEl());
    this._setActive(current ?? this._navigableOptions()[0] ?? null);
  }

  _onPopupClick(event) {
    const li = event.target.closest(OPTION_SELECTOR);
    if (li && li.getAttribute('aria-disabled') !== 'true') this._choose(li);
  }

  _onLabelClick() {
    this._trigger.focus();
  }
}

/**
 * Inicializa todos los combobox con [data-combobox]: elige
 * `Combobox` o `SelectCombobox` según la etiqueta del elemento
 * (`<input>` o `<select>`).
 * @param {ParentNode} [root]
 * @returns {(Combobox | SelectCombobox)[]}
 */
export function initComboboxes(root = document) {
  const editable = Array.from(
    root.querySelectorAll('input[data-combobox]')
  ).map((input) => new Combobox(input));
  const selectOnly = Array.from(
    root.querySelectorAll('select[data-combobox]')
  ).map((select) => new SelectCombobox(select));
  return [...editable, ...selectOnly];
}
