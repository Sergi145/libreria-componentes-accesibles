import './menubar.css';

export default {
  title: 'Componentes/Menubar',
  tags: ['autodocs'],
};

let renderCount = 0;

function createMenubar() {
  const id = ++renderCount;
  const menuId = (name) => `menubar-story-${id}-${name}`;

  const wrapper = document.createElement('div');
  wrapper.style.paddingBlockEnd = '12rem';
  wrapper.innerHTML = `
    <ul class="c-menubar" role="menubar" aria-label="Edición">
      <li role="none">
        <button
          type="button"
          class="c-menubar__item"
          id="${menuId('archivo-btn')}"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${menuId('archivo')}"
        >
          Archivo
        </button>
        <ul
          id="${menuId('archivo')}"
          class="c-menubar__menu"
          role="menu"
          aria-labelledby="${menuId('archivo-btn')}"
          hidden
        >
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Nuevo
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Abrir…
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Guardar
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Guardar como…
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <button
          type="button"
          class="c-menubar__item"
          id="${menuId('editar-btn')}"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${menuId('editar')}"
        >
          Editar
        </button>
        <ul
          id="${menuId('editar')}"
          class="c-menubar__menu"
          role="menu"
          aria-labelledby="${menuId('editar-btn')}"
          hidden
        >
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Deshacer
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Rehacer
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Cortar
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Copiar
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Pegar
            </button>
          </li>
        </ul>
      </li>
      <li role="none">
        <button
          type="button"
          class="c-menubar__item"
          id="${menuId('vista-btn')}"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${menuId('vista')}"
        >
          Vista
        </button>
        <ul
          id="${menuId('vista')}"
          class="c-menubar__menu"
          role="menu"
          aria-labelledby="${menuId('vista-btn')}"
          hidden
        >
          <li role="none">
            <button
              type="button"
              class="c-menubar__option"
              role="menuitemcheckbox"
              aria-checked="true"
            >
              Barra lateral
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              class="c-menubar__option"
              role="menuitemcheckbox"
              aria-checked="false"
            >
              Miniatura
            </button>
          </li>
          <li role="none">
            <ul class="c-menubar__group" role="group" aria-label="Zoom">
              <li role="none">
                <button
                  type="button"
                  class="c-menubar__option"
                  role="menuitemradio"
                  aria-checked="false"
                >
                  100%
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  class="c-menubar__option"
                  role="menuitemradio"
                  aria-checked="true"
                >
                  Ajustar a la ventana
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  class="c-menubar__option"
                  role="menuitemradio"
                  aria-checked="false"
                >
                  Ancho completo
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li role="none">
        <button
          type="button"
          class="c-menubar__item"
          id="${menuId('ayuda-btn')}"
          role="menuitem"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="${menuId('ayuda')}"
        >
          Ayuda
        </button>
        <ul
          id="${menuId('ayuda')}"
          class="c-menubar__menu"
          role="menu"
          aria-labelledby="${menuId('ayuda-btn')}"
          hidden
        >
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Manual
            </button>
          </li>
          <li role="none">
            <button type="button" class="c-menubar__option" role="menuitem">
              Acerca de
            </button>
          </li>
        </ul>
      </li>
    </ul>
  `;
  return wrapper;
}

export const Basica = {
  render: createMenubar,
};

export const Acciones = {
  render: createMenubar,
};

export const CasillasYRadios = {
  render: createMenubar,
};
