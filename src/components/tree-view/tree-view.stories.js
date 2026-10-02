import './tree-view.css';

export default {
  title: 'Componentes/Tree View',
  tags: ['autodocs'],
};

let renderCount = 0;

function createTree() {
  const id = ++renderCount;
  const treeId = `tree-story-${id}`;
  const labelId = `${treeId}-label`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <p id="${labelId}" style="margin-bottom: var(--space-3); font-weight: bold;">Estructura del proyecto</p>
    <ul class="c-tree" id="${treeId}" data-tree aria-labelledby="${labelId}">
      <li data-value="docs">
        <span class="c-tree__label">
          <button type="button" class="c-tree__toggle" aria-hidden="true">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          Documentos
        </span>
        <ul role="group">
          <li data-value="readme">
            <span class="c-tree__label">README.md</span>
          </li>
          <li data-value="license">
            <span class="c-tree__label">LICENSE</span>
          </li>
        </ul>
      </li>
      <li data-value="src" data-expanded="true">
        <span class="c-tree__label">
          <button type="button" class="c-tree__toggle" aria-hidden="true">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          src/
        </span>
        <ul role="group">
          <li data-value="components">
            <span class="c-tree__label">
              <button type="button" class="c-tree__toggle" aria-hidden="true">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              components/
            </span>
            <ul role="group">
              <li data-value="button">
                <span class="c-tree__label">button.js</span>
              </li>
              <li data-value="modal">
                <span class="c-tree__label">modal.js</span>
              </li>
            </ul>
          </li>
          <li data-value="utils">
            <span class="c-tree__label">
              <button type="button" class="c-tree__toggle" aria-hidden="true">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              utils/
            </span>
            <ul role="group">
              <li data-value="helpers">
                <span class="c-tree__label">helpers.js</span>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li data-value="dist" data-expanded="false">
        <span class="c-tree__label">
          <button type="button" class="c-tree__toggle" aria-hidden="true">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          dist/
        </span>
        <ul role="group">
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
  return wrapper;
}

export const Basica = {
  render: createTree,
};

export const ConSeleccion = {
  render: createTree,
};

export const SeleccionMultiple = {
  render: createTree,
};
