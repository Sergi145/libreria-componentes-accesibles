import { describe, it, expect, beforeEach } from 'vitest';
import { Tree, initTrees } from './tree-view.js';

function buildMarkup() {
  document.body.innerHTML = `
    <ul class="c-tree" id="tree-test" data-tree aria-labelledby="tree-label">
      <li data-value="docs">
        <span class="c-tree__label">Documentos</span>
        <ul>
          <li data-value="readme">
            <span class="c-tree__label">README.md</span>
          </li>
          <li data-value="license">
            <span class="c-tree__label">LICENSE</span>
          </li>
        </ul>
      </li>
      <li data-value="src" data-expanded="true">
        <span class="c-tree__label">src/</span>
        <ul>
          <li data-value="components">
            <span class="c-tree__label">components/</span>
            <ul>
              <li data-value="button">
                <span class="c-tree__label">button.js</span>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li data-value="dist" data-expanded="false">
        <span class="c-tree__label">dist/</span>
        <ul>
          <li data-value="index">
            <span class="c-tree__label">index.js</span>
          </li>
        </ul>
      </li>
      <li data-value="package">
        <span class="c-tree__label">package.json</span>
      </li>
    </ul>
  `;
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

describe('Tree', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error sin un <ul>[data-tree]', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => new Tree(document.querySelector('div'))).toThrow();
  });

  it('lanza un error si el <ul> no tiene id', () => {
    document.body.innerHTML = '<ul data-tree></ul>';
    expect(() => new Tree(document.querySelector('[data-tree]'))).toThrow();
  });

  it('pone role="tree" en el contenedor', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    expect($('[data-tree]').getAttribute('role')).toBe('tree');
  });

  it('pone role="treeitem" en cada <li>', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const items = $$('[role="treeitem"]');
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.tagName).toBe('LI');
    });
  });

  it('pone role="group" en cada <ul> anidado', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const groups = $$('[role="group"]');
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((group) => {
      expect(group.tagName).toBe('UL');
    });
  });

  it('pone aria-expanded desde data-expanded', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const srcNode = document.querySelector('[data-value="src"]');
    const docsNode = document.querySelector('[data-value="docs"]');
    const distNode = document.querySelector('[data-value="dist"]');

    expect(srcNode.getAttribute('aria-expanded')).toBe('true');
    expect(docsNode.getAttribute('aria-expanded')).toBe('true'); // por defecto true
    expect(distNode.getAttribute('aria-expanded')).toBe('false');
  });

  it('pone hidden en grupos plegados', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const distGroup = document
      .querySelector('[data-value="dist"]')
      .querySelector(':scope > ul');
    expect(distGroup.hidden).toBe(true);

    const srcGroup = document
      .querySelector('[data-value="src"]')
      .querySelector(':scope > ul');
    expect(srcGroup.hidden).toBe(false);
  });

  it('pone aria-labelledby en cada nodo hacia su etiqueta', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const items = $$('[role="treeitem"]');
    items.forEach((item) => {
      const labelledby = item.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      const label = document.getElementById(labelledby);
      expect(label).toBeTruthy();
      expect(item.querySelector(':scope > .c-tree__label')).toBe(label);
    });
  });

  it('el nombre accesible de un nodo no incluye el texto de sus hijos', () => {
    buildMarkup();
    new Tree($('[data-tree]'));

    const srcNode = document.querySelector('[data-value="src"]');
    const labelId = srcNode.getAttribute('aria-labelledby');
    const label = document.getElementById(labelId);
    const name = label.textContent.trim();

    expect(name).toBe('src/');
  });

  it('destroy() quita los roles y atributos ARIA', () => {
    buildMarkup();
    const tree = new Tree($('[data-tree]'));
    tree.destroy();

    expect($('[data-tree]').hasAttribute('role')).toBe(false);
    expect($$('[role="treeitem"]')).toHaveLength(0);
    expect($$('[role="group"]')).toHaveLength(0);
  });

  it('destroy() deja la lista original legible', () => {
    buildMarkup();
    const originalHTML = $('[data-tree]').innerHTML;
    const tree = new Tree($('[data-tree]'));
    tree.destroy();

    // Los id de las etiquetas se quitaron, pero la estructura es la misma
    const lis = $$('[data-tree] li');
    expect(lis.length).toBeGreaterThan(0);
    lis.forEach((li) => {
      expect(li.querySelector(':scope > .c-tree__label')).toBeTruthy();
    });
  });

  it('initTrees inicializa cada [data-tree]', () => {
    document.body.innerHTML = `
      <ul id="tree1" data-tree></ul>
      <ul id="tree2" data-tree></ul>
    `;

    const trees = initTrees();

    expect(trees).toHaveLength(2);
    expect(trees[0]).toBeInstanceOf(Tree);
    expect(trees[1]).toBeInstanceOf(Tree);
  });

  describe('teclado', () => {
    const item = (value) => $(`[data-value="${value}"]`);
    const press = (key, opts = {}) =>
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
          ...opts,
        })
      );
    const tabStops = () =>
      Array.from($$('[role="treeitem"]'))
        .filter((i) => i.getAttribute('tabindex') === '0')
        .map((i) => i.dataset.value);

    it('las hojas no llevan aria-expanded', () => {
      buildMarkup();
      new Tree($('[data-tree]'));

      expect(item('readme').hasAttribute('aria-expanded')).toBe(false);
      expect(item('package').hasAttribute('aria-expanded')).toBe(false);
      expect(item('dist').getAttribute('aria-expanded')).toBe('false');
    });

    it('↓ avanza un solo nodo y mueve el tabindex="0" con el foco', () => {
      buildMarkup();
      new Tree($('[data-tree]'));
      item('docs').focus();

      press('ArrowDown');

      expect(document.activeElement).toBe(item('readme'));
      expect(tabStops()).toEqual(['readme']);
    });

    it('en selección simple la selección sigue al foco', () => {
      buildMarkup();
      const tree = new Tree($('[data-tree]'));
      item('docs').focus();

      press('ArrowDown');
      press('ArrowDown');

      expect(tree.value).toBe('license');
    });

    it('en selección múltiple las flechas no cambian la selección y Espacio la alterna', () => {
      buildMarkup();
      $('[data-tree]').setAttribute('data-multiple', '');
      const tree = new Tree($('[data-tree]'));
      expect(tree.value).toEqual([]);
      item('docs').focus();

      press('ArrowDown');
      press('ArrowDown');
      expect(tree.value).toEqual([]);

      press(' ');
      expect(tree.value).toEqual(['license']);

      press(' ');
      expect(tree.value).toEqual([]);
    });

    it('Espacio en múltiple actualiza los <input type="hidden">', () => {
      buildMarkup();
      $('[data-tree]').setAttribute('data-multiple', '');
      $('[data-tree]').setAttribute('data-name', 'archivos');
      new Tree($('[data-tree]'));
      item('readme').focus();

      press(' ');

      expect(
        Array.from($$('input[name="archivos"]')).map((i) => i.value)
      ).toEqual(['readme']);
    });

    it('→ en una hoja no hace nada', () => {
      buildMarkup();
      new Tree($('[data-tree]'));
      item('package').focus();

      press('ArrowRight');

      expect(item('package').hasAttribute('aria-expanded')).toBe(false);
      expect(document.activeElement).toBe(item('package'));
    });
  });
});
