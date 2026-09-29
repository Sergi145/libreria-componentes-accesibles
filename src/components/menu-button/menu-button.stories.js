import '../button/button.css';
import '../modal/modal.css';
import { Modal } from '../modal/modal.js';
import './menu-button.css';
import { MenuButton } from './menu-button.js';

export default {
  title: 'Componentes/Menu Button',
  tags: ['autodocs'],
};

function render(html) {
  const wrapper = document.createElement('div');
  wrapper.style.paddingBlockEnd = '12rem';
  wrapper.innerHTML = html;
  wrapper
    .querySelectorAll('[data-menu-button]')
    .forEach((button) => new MenuButton(button));
  return wrapper;
}

export const Acciones = {
  render: () =>
    render(`
    <div class="c-menu-button">
      <button type="button" id="story-mb-acciones-btn" class="c-menu-button__toggle" data-menu-button
        aria-haspopup="menu" aria-expanded="false" aria-controls="story-mb-acciones">Acciones</button>
      <ul id="story-mb-acciones" class="c-menu-button__menu" role="menu" aria-labelledby="story-mb-acciones-btn" hidden>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Editar</button></li>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Duplicar</button></li>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem" disabled>Archivar</button></li>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Eliminar</button></li>
      </ul>
    </div>
  `),
};

export const CasillasYRadios = {
  render: () =>
    render(`
    <div class="c-menu-button">
      <button type="button" id="story-mb-vista-btn" class="c-menu-button__toggle" data-menu-button
        aria-haspopup="menu" aria-expanded="false" aria-controls="story-mb-vista">Vista</button>
      <ul id="story-mb-vista" class="c-menu-button__menu" role="menu" aria-labelledby="story-mb-vista-btn" hidden>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitemcheckbox" aria-checked="true">Mostrar barra lateral</button></li>
        <li role="none">
          <ul class="c-menu-button__group" role="group" aria-label="Ordenar por">
            <li role="none"><button type="button" class="c-menu-button__item" role="menuitemradio" aria-checked="true">Nombre</button></li>
            <li role="none"><button type="button" class="c-menu-button__item" role="menuitemradio" aria-checked="false">Fecha</button></li>
          </ul>
        </li>
      </ul>
    </div>
  `),
};

export const BotonPartido = {
  render: () =>
    render(`
    <div class="c-menu-button c-menu-button--split">
      <button type="button" class="c-menu-button__action">Guardar</button>
      <button type="button" id="story-mb-guardar-btn" class="c-menu-button__toggle" data-menu-button
        aria-label="Más opciones de guardar" aria-haspopup="menu" aria-expanded="false" aria-controls="story-mb-guardar"></button>
      <ul id="story-mb-guardar" class="c-menu-button__menu" role="menu" aria-labelledby="story-mb-guardar-btn" hidden>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Guardar como…</button></li>
        <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Guardar todo</button></li>
      </ul>
    </div>
  `),
};

export const DentroDeUnModal = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <button type="button" class="c-button c-button--primary" data-modal-trigger="story-mb-modal">
        Abrir modal
      </button>
      <dialog id="story-mb-modal" class="c-modal" style="inline-size: min(48rem, calc(100vw - 2rem)); max-inline-size: none" tabindex="-1" aria-labelledby="story-mb-modal-title">
        <form method="dialog" class="c-modal__content">
          <header class="c-modal__header">
            <h2 id="story-mb-modal-title" class="c-modal__title">Documento</h2>
            <button type="submit" class="c-modal__close" aria-label="Cerrar diálogo" value="cancel">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="c-modal__body" style="min-block-size: 20rem">
            <div class="c-menu-button">
              <button type="button" id="story-mb-modal-btn" class="c-menu-button__toggle" data-menu-button
                aria-haspopup="menu" aria-expanded="false" aria-controls="story-mb-modal-menu">Acciones</button>
              <ul id="story-mb-modal-menu" class="c-menu-button__menu" role="menu" aria-labelledby="story-mb-modal-btn" hidden>
                <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Editar</button></li>
                <li role="none"><button type="button" class="c-menu-button__item" role="menuitem">Duplicar</button></li>
                <li role="none"><button type="button" class="c-menu-button__item" role="menuitemcheckbox" aria-checked="true">Mostrar barra lateral</button></li>
                <li role="none">
                  <ul class="c-menu-button__group" role="group" aria-label="Ordenar por">
                    <li role="none"><button type="button" class="c-menu-button__item" role="menuitemradio" aria-checked="true">Nombre</button></li>
                    <li role="none"><button type="button" class="c-menu-button__item" role="menuitemradio" aria-checked="false">Fecha</button></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </dialog>
    `;
    const modal = new Modal(wrapper.querySelector('dialog'));
    wrapper
      .querySelector('[data-modal-trigger]')
      .addEventListener('click', () => modal.open());
    new MenuButton(wrapper.querySelector('[data-menu-button]'));
    return wrapper;
  },
};
