/**
 * Componente: Tree View (árbol expandible)
 * Una <ul> anidada que el JS convierte en role="tree".
 * Implementa el patrón WAI-ARIA APG "Tree View":
 * https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 * Sin JS, el marcado es una lista anidada legible.
 * Con JS se agrega: role="tree", role="treeitem", role="group",
 * aria-expanded, aria-labelledby e iconos de flecha.
 *
 * El estado inicial de expansión viene de data-expanded en el HTML.
 * destroy() deshace los cambios y vuelve a ser una lista anidada.
 *
 * Uso:
 *   import { Tree, initTrees } from './tree-view.js';
 *   new Tree(document.querySelector('[data-tree]'));
 */

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

    // Poner role="tree" en el contenedor
    el.setAttribute('role', 'tree');

    // Procesar cada nodo (li)
    let labelCounter = 0;
    const processNode = (li, depth = 0) => {
      // Guardar estado inicial para destroy()
      this._initialState.push({
        el: li,
        hadRole: li.hasAttribute('role'),
        hadAriaExpanded: li.hasAttribute('aria-expanded'),
        hadAriaLabelledby: li.hasAttribute('aria-labelledby'),
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
    };

    Array.from(el.children).forEach((li) => {
      if (li.tagName === 'LI') {
        processNode(li);
      }
    });
  }

  destroy() {
    // Quitar role="tree"
    this.el.removeAttribute('role');

    // Restaurar cada nodo a su estado inicial
    this._initialState.forEach(
      ({ el: li, hadRole, hadAriaExpanded, hadAriaLabelledby }) => {
        if (!hadRole) li.removeAttribute('role');
        if (!hadAriaExpanded) li.removeAttribute('aria-expanded');
        if (!hadAriaLabelledby) li.removeAttribute('aria-labelledby');

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
