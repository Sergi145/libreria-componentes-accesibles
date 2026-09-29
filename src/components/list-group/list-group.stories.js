import './list-group.css';
import '../tabs/tabs.css';
import { Tabs } from '../tabs/tabs.js';

export default {
  title: 'Componentes/List group',
  tags: ['autodocs'],
};

export const ListaInformativa = {
  name: 'Lista informativa (sin interacción)',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <ul class="c-list-group">
        <li class="c-list-group__item">Factura #2026-014</li>
        <li class="c-list-group__item">Factura #2026-013</li>
        <li class="c-list-group__item">Factura #2026-012</li>
      </ul>
    `;
    return wrapper;
  },
};

export const EnlacesDeNavegacion = {
  name: 'Enlaces de navegación (con contador y deshabilitado)',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <nav aria-label="Carpetas de correo">
        <div class="c-list-group">
          <a class="c-list-group__item c-list-group__item--action" href="/bandeja" aria-current="true">
            Bandeja de entrada
            <span class="c-list-group__badge">14<span class="c-list-group__sr-text"> mensajes sin leer</span></span>
          </a>
          <a class="c-list-group__item c-list-group__item--action" href="/enviados">Enviados</a>
          <a class="c-list-group__item c-list-group__item--action" href="/borradores">Borradores</a>
          <a class="c-list-group__item c-list-group__item--action" aria-disabled="true">Archivados</a>
        </div>
      </nav>
    `;
    return wrapper;
  },
};

export const BotonesDeAccion = {
  name: 'Botones de acción (con deshabilitado)',
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-list-group">
        <button type="button" class="c-list-group__item c-list-group__item--action">Duplicar informe</button>
        <button type="button" class="c-list-group__item c-list-group__item--action">Archivar informe</button>
        <button type="button" class="c-list-group__item c-list-group__item--action" disabled>Eliminar informe</button>
      </div>
    `;
    return wrapper;
  },
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que cada llamada a render() necesita ids
// nuevos (mismo fix que en accordion.stories.js y navbar.stories.js).
let instanceCount = 0;

export const ComoPestanasVerticales = {
  name: 'Como pestañas verticales (combinado con Tabs)',
  render: () => {
    const uid = instanceCount++;
    const ids = {
      cuenta: `lg-tabs-cuenta-${uid}`,
      privacidad: `lg-tabs-privacidad-${uid}`,
      notificaciones: `lg-tabs-notificaciones-${uid}`,
    };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-tabs c-tabs--vertical">
        <div
          class="c-list-group"
          role="tablist"
          aria-label="Ajustes de la cuenta"
          aria-orientation="vertical"
          data-tabs
        >
          <button type="button" class="c-list-group__item c-list-group__item--action"
            role="tab" id="${ids.cuenta}-tab" aria-selected="true" aria-controls="${ids.cuenta}">
            Cuenta
          </button>
          <button type="button" class="c-list-group__item c-list-group__item--action"
            role="tab" id="${ids.privacidad}-tab" aria-selected="false" aria-controls="${ids.privacidad}" tabindex="-1">
            Privacidad
          </button>
          <button type="button" class="c-list-group__item c-list-group__item--action"
            role="tab" id="${ids.notificaciones}-tab" aria-selected="false" aria-controls="${ids.notificaciones}" tabindex="-1">
            Notificaciones
          </button>
        </div>

        <div class="c-tabs__panel" id="${ids.cuenta}" role="tabpanel" aria-labelledby="${ids.cuenta}-tab" tabindex="0">
          <p>Nombre, correo electrónico y contraseña.</p>
        </div>
        <div class="c-tabs__panel" id="${ids.privacidad}" role="tabpanel" aria-labelledby="${ids.privacidad}-tab" tabindex="0" hidden>
          <p>Quién puede ver tu perfil público.</p>
        </div>
        <div class="c-tabs__panel" id="${ids.notificaciones}" role="tabpanel" aria-labelledby="${ids.notificaciones}-tab" tabindex="0" hidden>
          <p>Preferencias de correo y avisos push.</p>
        </div>
      </div>
    `;

    new Tabs(wrapper.querySelector('[data-tabs]'));
    return wrapper;
  },
};
