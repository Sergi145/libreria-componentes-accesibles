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

import { rovingTabindex } from '../../utils/roving-tabindex.js';
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
    this._rovingDestroy = null;
    this._typeahead = null;
    this._listeners = [];

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
      } else {
        // Nodo sin hijos
        li.setAttribute('aria-expanded', 'false');
      }

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

    // Roving tabindex vertical
    this._rovingDestroy = rovingTabindex(el, '[role="treeitem"]', {
      orientation: 'vertical',
      wrap: false,
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

    // Seleccionar el primer nodo
    const firstItem = Array.from(el.querySelectorAll('[role="treeitem"]'))[0];
    if (firstItem) {
      firstItem.setAttribute('aria-selected', 'true');
    }
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
    // Quitar listeners
    this._listeners.forEach(({ target, listener, type }) => {
      target.removeEventListener(type, listener);
    });
    this._listeners = [];
    this._rovingDestroy?.();
    this._rovingDestroy = null;
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
      }) => {
        if (!hadRole) li.removeAttribute('role');
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

    // ↓ siguiente visible
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (currentIndex < visibleItems.length - 1) {
        visibleItems[currentIndex + 1].focus();
        this._selectItem(visibleItems[currentIndex + 1]);
      }
      return;
    }

    // ↑ anterior visible
    if (key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex > 0) {
        visibleItems[currentIndex - 1].focus();
        this._selectItem(visibleItems[currentIndex - 1]);
      }
      return;
    }

    // → expande o va al primer hijo
    if (key === 'ArrowRight') {
      event.preventDefault();
      const expanded = current.getAttribute('aria-expanded') === 'true';
      if (!expanded) {
        current.setAttribute('aria-expanded', 'true');
        const group = current.querySelector(':scope > [role="group"]');
        if (group) group.hidden = false;
      } else {
        const group = current.querySelector(':scope > [role="group"]');
        if (group) {
          const firstChild = group.querySelector(':scope > li');
          if (firstChild) firstChild.focus();
        }
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
          group.parentElement.focus();
        }
      }
      return;
    }

    // Home: primero visible
    if (key === 'Home') {
      event.preventDefault();
      if (visibleItems.length > 0) {
        visibleItems[0].focus();
        this._selectItem(visibleItems[0]);
      }
      return;
    }

    // End: último visible
    if (key === 'End') {
      event.preventDefault();
      if (visibleItems.length > 0) {
        visibleItems[visibleItems.length - 1].focus();
        this._selectItem(visibleItems[visibleItems.length - 1]);
      }
      return;
    }

    // * expande hermanos
    if (key === '*') {
      event.preventDefault();
      const group = current.parentElement;
      if (group) {
        Array.from(group.children).forEach((li) => {
          if (li.tagName === 'LI') {
            li.setAttribute('aria-expanded', 'true');
            const childGroup = li.querySelector(':scope > [role="group"]');
            if (childGroup) childGroup.hidden = false;
          }
        });
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
        visibleItems[nextIndex].focus();
        this._selectItem(visibleItems[nextIndex]);
      }
    }
  }

  _onClick(event) {
    const item = event.target.closest('[role="treeitem"]');
    if (!item) return;

    // Clic en item: seleccionar
    this._selectItem(item);
    item.focus();
  }

  _selectItem(item) {
    Array.from(this.el.querySelectorAll('[role="treeitem"]')).forEach((i) => {
      i.setAttribute('aria-selected', String(i === item));
    });
    this.el.dispatchEvent(
      new CustomEvent('tree:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
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
