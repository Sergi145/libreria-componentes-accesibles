/**
 * Componente: Tree View (árbol expandible)
 * Una <ul> anidada que el JS convierte en role="tree".
 * Implementa el patrón WAI-ARIA APG "Tree View":
 * https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 * Teclado (selección simple):
 *  - ↓/↑: siguiente/anterior visible
 *  - →: expande o va al primer hijo
 *  - ←: pliega o va al padre
 *  - Inicio/Fin: primero/último visible
 *  - *: expande los hermanos
 *  - Una letra: typeahead
 *
 * Uso:
 *   import { Tree, initTrees } from './tree-view.js';
 *   const tree = new Tree(document.querySelector('[data-tree]'));
 *   tree.value; // → string | null
 */

import { createTypeahead } from '../../utils/typeahead.js';

export class Tree {
  /** @param {HTMLElement} el [data-tree] sobre <ul> con id */
  constructor(el) {
    if (!el || el.tagName !== 'UL') {
      throw new Error('Tree: se requiere un elemento <ul>[data-tree].');
    }
    if (!el.id) {
      throw new Error('Tree: el elemento <ul> necesita un atributo id.');
    }
    this.el = el;
    this._initialState = [];
    this._typeahead = null;
    this._listeners = [];
    this._lastSelectedItem = null;
    this._hiddenInputs = [];

    // Poner role="tree" en el contenedor
    el.setAttribute('role', 'tree');
    if (el.hasAttribute('data-multiple')) {
      el.setAttribute('aria-multiselectable', 'true');
    }

    // Procesar cada nodo (li)
    let labelCounter = 0;
    const processNode = (li, depth = 0) => {
      // Guardar estado inicial para destroy()
      this._initialState.push({
        el: li,
        hadRole: li.hasAttribute('role'),
        hadAriaExpanded: li.hasAttribute('aria-expanded'),
        hadAriaLabelledby: li.hasAttribute('aria-labelledby'),
        hadAriaSelected: li.hasAttribute('aria-selected'),
        hadTabindex: li.hasAttribute('tabindex'),
      });

      // Poner role="treeitem"
      li.setAttribute('role', 'treeitem');

      // Buscar la etiqueta (span.c-tree__label)
      const label = li.querySelector(':scope > .c-tree__label');
      if (label) {
        const labelId = `${el.id}-label-${++labelCounter}`;
        label.id = labelId;
        li.setAttribute('aria-labelledby', labelId);
      }

      // Buscar el grupo anidado (ul)
      const group = li.querySelector(':scope > ul');
      if (group) {
        // Poner role="group"
        group.setAttribute('role', 'group');

        // Obtener estado inicial de expansión
        const expanded = li.getAttribute('data-expanded') !== 'false';
        li.setAttribute('aria-expanded', String(expanded));
        if (!expanded) {
          group.hidden = true;
        }

        // Procesar nodos anidados
        Array.from(group.children).forEach((child) => {
          if (child.tagName === 'LI') {
            processNode(child, depth + 1);
          }
        });
      }
      // Las hojas no llevan aria-expanded: se anunciarían como «contraído».

      // Inicializar selección
      if (!li.hasAttribute('aria-selected')) {
        li.setAttribute('aria-selected', 'false');
      }
    };

    Array.from(el.children).forEach((li) => {
      if (li.tagName === 'LI') {
        processNode(li);
      }
    });

    // Typeahead
    this._typeahead = createTypeahead();

    // Listeners
    const onKeydown = (event) => this._onKeydown(event);
    const onClick = (event) => this._onClick(event);
    el.addEventListener('keydown', onKeydown);
    el.addEventListener('click', onClick);
    this._listeners.push(
      { target: el, listener: onKeydown, type: 'keydown' },
      { target: el, listener: onClick, type: 'click' }
    );

    // Roving tabindex propio (no rovingTabindex de utils): el árbol tiene sus
    // propias reglas de flechas y, con las dos, cada flecha avanzaba dos nodos.
    const items = Array.from(el.querySelectorAll('[role="treeitem"]'));
    const selected = items.find(
      (item) => item.getAttribute('aria-selected') === 'true'
    );
    // En selección simple la selección sigue al foco: empieza en el primero.
    if (!this.multiple && !selected && items[0]) {
      items[0].setAttribute('aria-selected', 'true');
    }
    items.forEach((item) => item.setAttribute('tabindex', '-1'));
    const start = selected || items[0];
    if (start) start.setAttribute('tabindex', '0');
  }

  _focusItem(item) {
    this.el
      .querySelectorAll('[role="treeitem"]')
      .forEach((i) => i.setAttribute('tabindex', i === item ? '0' : '-1'));
    item.focus();
  }

  _toggleItem(item) {
    const selected = item.getAttribute('aria-selected') !== 'true';
    item.setAttribute('aria-selected', String(selected));
    this._lastSelectedItem = item;
    this._syncHiddenInputs();
    this.el.dispatchEvent(
      new CustomEvent('tree:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  // Mueve el foco; en selección simple la selección lo sigue.
  _moveTo(item) {
    this._focusItem(item);
    if (!this.multiple) this._selectItem(item);
  }

  get multiple() {
    return this.el.getAttribute('aria-multiselectable') === 'true';
  }

  get value() {
    const selected = Array.from(
      this.el.querySelectorAll('[role="treeitem"][aria-selected="true"]')
    );
    if (this.multiple) {
      return selected.map(
        (item) => item.getAttribute('data-value') || item.textContent
      );
    }
    if (selected.length === 0) return null;
    return selected[0].getAttribute('data-value') || selected[0].textContent;
  }

  set value(v) {
    const values = Array.isArray(v) ? v : [v];
    Array.from(this.el.querySelectorAll('[role="treeitem"]')).forEach(
      (item) => {
        const itemValue = item.getAttribute('data-value') || item.textContent;
        item.setAttribute('aria-selected', String(values.includes(itemValue)));
      }
    );
  }

  destroy() {
    // Quitar inputs ocultos
    this._hiddenInputs.forEach((input) => input.remove());
    this._hiddenInputs = [];

    // Quitar listeners
    this._listeners.forEach(({ target, listener, type }) => {
      target.removeEventListener(type, listener);
    });
    this._listeners = [];
    this._typeahead = null;

    // Quitar role="tree"
    this.el.removeAttribute('role');

    // Restaurar cada nodo a su estado inicial
    this._initialState.forEach(
      ({
        el: li,
        hadRole,
        hadAriaExpanded,
        hadAriaLabelledby,
        hadAriaSelected,
        hadTabindex,
      }) => {
        if (!hadRole) li.removeAttribute('role');
        if (!hadTabindex) li.removeAttribute('tabindex');
        if (!hadAriaExpanded) li.removeAttribute('aria-expanded');
        if (!hadAriaLabelledby) li.removeAttribute('aria-labelledby');
        if (!hadAriaSelected) li.removeAttribute('aria-selected');

        // Quitar role="group" de grupos anidados
        const group = li.querySelector(':scope > ul');
        if (group) {
          group.removeAttribute('role');
          group.hidden = false;
        }

        // Quitar id de labels
        const label = li.querySelector(':scope > .c-tree__label');
        if (label && label.id) {
          label.removeAttribute('id');
        }
      }
    );
    this._initialState = [];
  }

  _getVisibleItems() {
    return Array.from(this.el.querySelectorAll('[role="treeitem"]')).filter(
      (item) => {
        let parent = item.parentElement;
        while (parent && parent !== this.el) {
          if (
            parent.hasAttribute('role') &&
            parent.getAttribute('role') === 'group'
          ) {
            const parentItem = parent.parentElement;
            if (
              parentItem &&
              parentItem.getAttribute('aria-expanded') === 'false'
            ) {
              return false;
            }
          }
          parent = parent.parentElement;
        }
        return true;
      }
    );
  }

  _onKeydown(event) {
    const { key } = event;
    const current = document.activeElement;
    if (
      !current ||
      !current.hasAttribute('role') ||
      current.getAttribute('role') !== 'treeitem'
    ) {
      return;
    }

    const visibleItems = this._getVisibleItems();
    const currentIndex = visibleItems.indexOf(current);

    // Space: alternar en múltiple, o seleccionar en simple
    if (key === ' ') {
      event.preventDefault();
      if (this.multiple) {
        this._toggleItem(current);
      } else {
        this._selectItem(current);
      }
      return;
    }

    // ↓ siguiente visible
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (currentIndex < visibleItems.length - 1) {
        const next = visibleItems[currentIndex + 1];
        this._moveTo(next);
        // Shift+↓: alternar selección del siguiente
        if (event.shiftKey && this.multiple) this._toggleItem(next);
      }
      return;
    }

    // ↑ anterior visible
    if (key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex > 0) {
        const prev = visibleItems[currentIndex - 1];
        this._moveTo(prev);
        // Shift+↑: alternar selección del anterior
        if (event.shiftKey && this.multiple) this._toggleItem(prev);
      }
      return;
    }

    // → expande o va al primer hijo
    if (key === 'ArrowRight') {
      event.preventDefault();
      const group = current.querySelector(':scope > [role="group"]');
      if (!group) return; // hoja: no hace nada
      if (current.getAttribute('aria-expanded') !== 'true') {
        current.setAttribute('aria-expanded', 'true');
        group.hidden = false;
      } else {
        const firstChild = group.querySelector(':scope > li');
        if (firstChild) this._moveTo(firstChild);
      }
      return;
    }

    // ← pliega o va al padre
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const expanded = current.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        current.setAttribute('aria-expanded', 'false');
        const group = current.querySelector(':scope > [role="group"]');
        if (group) group.hidden = true;
      } else {
        const group = current.closest('[role="group"]');
        if (group && group.parentElement?.hasAttribute('role')) {
          this._moveTo(group.parentElement);
        }
      }
      return;
    }

    // Home: primero visible
    if (key === 'Home') {
      event.preventDefault();
      if (visibleItems.length > 0) {
        const first = visibleItems[0];
        this._moveTo(first);
        if (event.ctrlKey && event.shiftKey && this.multiple) {
          // Ctrl+Shift+Home: seleccionar desde inicio hasta actual
          for (let i = 0; i <= currentIndex; i++) {
            visibleItems[i].setAttribute('aria-selected', 'true');
          }
          this._syncHiddenInputs();
          this.el.dispatchEvent(
            new CustomEvent('tree:change', {
              bubbles: true,
              detail: { value: this.value },
            })
          );
        }
      }
      return;
    }

    // End: último visible
    if (key === 'End') {
      event.preventDefault();
      if (visibleItems.length > 0) {
        const last = visibleItems[visibleItems.length - 1];
        this._moveTo(last);
        if (event.ctrlKey && event.shiftKey && this.multiple) {
          // Ctrl+Shift+End: seleccionar desde actual hasta fin
          for (let i = currentIndex; i < visibleItems.length; i++) {
            visibleItems[i].setAttribute('aria-selected', 'true');
          }
          this._syncHiddenInputs();
          this.el.dispatchEvent(
            new CustomEvent('tree:change', {
              bubbles: true,
              detail: { value: this.value },
            })
          );
        }
      }
      return;
    }

    // * expande hermanos
    if (key === '*') {
      event.preventDefault();
      const group = current.parentElement;
      if (group) {
        Array.from(group.children).forEach((li) => {
          const childGroup = li.querySelector(':scope > [role="group"]');
          if (li.tagName === 'LI' && childGroup) {
            li.setAttribute('aria-expanded', 'true');
            childGroup.hidden = false;
          }
        });
      }
      return;
    }

    // Ctrl+A: seleccionar todos los visibles (o ninguno si ya todos están seleccionados)
    if (key === 'a' && (event.ctrlKey || event.metaKey)) {
      if (this.multiple) {
        event.preventDefault();
        const allSelected = visibleItems.every(
          (item) => item.getAttribute('aria-selected') === 'true'
        );
        visibleItems.forEach((item) => {
          item.setAttribute('aria-selected', String(!allSelected));
        });
        this._syncHiddenInputs();
        this.el.dispatchEvent(
          new CustomEvent('tree:change', {
            bubbles: true,
            detail: { value: this.value },
          })
        );
      }
      return;
    }

    // Typeahead
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (key.length === 1 && key !== ' ') {
      const textContents = visibleItems.map((item) => {
        const label = item.querySelector('.c-tree__label');
        return label ? label.textContent : item.textContent;
      });
      const nextIndex = this._typeahead?.search(
        key,
        textContents,
        currentIndex
      );
      if (nextIndex !== -1 && nextIndex !== undefined) {
        this._moveTo(visibleItems[nextIndex]);
      }
    }
  }

  _onClick(event) {
    const item = event.target.closest('[role="treeitem"]');
    if (!item) return;

    // Clic en botón de flecha: expandir/plegar
    const toggleButton = event.target.closest('.c-tree__toggle');
    if (toggleButton) {
      if (item.getAttribute('aria-expanded') === 'true') {
        item.setAttribute('aria-expanded', 'false');
        const group = item.querySelector(':scope > [role="group"]');
        if (group) group.hidden = true;
      } else {
        item.setAttribute('aria-expanded', 'true');
        const group = item.querySelector(':scope > [role="group"]');
        if (group) group.hidden = false;
      }
      this._focusItem(item);
      return;
    }

    if (event.shiftKey && this.multiple && this._lastSelectedItem) {
      // Shift+clic: seleccionar rango desde el último seleccionado
      const visibleItems = this._getVisibleItems();
      const lastIndex = visibleItems.indexOf(this._lastSelectedItem);
      const currentIndex = visibleItems.indexOf(item);
      if (lastIndex !== -1 && currentIndex !== -1) {
        const [start, end] =
          lastIndex <= currentIndex
            ? [lastIndex, currentIndex]
            : [currentIndex, lastIndex];
        for (let i = start; i <= end; i++) {
          visibleItems[i].setAttribute('aria-selected', 'true');
        }
        this._syncHiddenInputs();
        this.el.dispatchEvent(
          new CustomEvent('tree:change', {
            bubbles: true,
            detail: { value: this.value },
          })
        );
      }
    } else if (this.multiple) {
      // Clic sin shift: alternar en múltiple
      this._toggleItem(item);
    } else {
      // Clic en simple: seleccionar
      this._selectItem(item);
    }
    this._focusItem(item);
  }

  _selectItem(item) {
    Array.from(this.el.querySelectorAll('[role="treeitem"]')).forEach((i) => {
      i.setAttribute('aria-selected', String(i === item));
    });
    this._lastSelectedItem = item;
    this._syncHiddenInputs();
    this.el.dispatchEvent(
      new CustomEvent('tree:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _syncHiddenInputs() {
    if (!this.el.hasAttribute('data-name')) return;

    const name = this.el.getAttribute('data-name');
    const selected = Array.from(
      this.el.querySelectorAll('[role="treeitem"][aria-selected="true"]')
    );

    // Quitar inputs anteriores
    this._hiddenInputs.forEach((input) => input.remove());
    this._hiddenInputs = [];

    // Crear inputs para valores seleccionados
    selected.forEach((item) => {
      const value = item.getAttribute('data-value') || item.textContent;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      this.el.insertAdjacentElement('afterend', input);
      this._hiddenInputs.push(input);
    });
  }
}

/**
 * Inicializa todas las [data-tree] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Tree[]}
 */
export function initTrees(root = document) {
  return Array.from(root.querySelectorAll('[data-tree]')).map(
    (el) => new Tree(el)
  );
}
