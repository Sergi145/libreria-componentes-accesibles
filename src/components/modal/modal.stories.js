import '../button/button.css';
import './modal.css';
import { Modal } from './modal.js';

export default {
  title: 'Componentes/Modal',
  tags: ['autodocs'],
};

function render() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button type="button" class="c-button c-button--primary" data-modal-trigger="story-modal">
      Abrir modal
    </button>

    <dialog id="story-modal" class="c-modal" aria-labelledby="story-modal-title">
      <form method="dialog" class="c-modal__content">
        <header class="c-modal__header">
          <h2 id="story-modal-title" class="c-modal__title">Confirmar acción</h2>
          <button type="submit" class="c-modal__close" aria-label="Cerrar diálogo" value="cancel">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <div class="c-modal__body">
          <p>¿Seguro que quieres continuar? Esta acción no se puede deshacer.</p>
        </div>
        <footer class="c-modal__footer">
          <button type="submit" class="c-button c-button--secondary" value="cancel">Cancelar</button>
          <button type="submit" class="c-button c-button--primary" value="confirm" autofocus>Confirmar</button>
        </footer>
      </form>
    </dialog>
  `;

  const dialogEl = wrapper.querySelector('dialog');
  const modal = new Modal(dialogEl);
  wrapper
    .querySelector('[data-modal-trigger]')
    .addEventListener('click', () => modal.open());

  return wrapper;
}

export const Default = { render };
