import './text-field.css';
import '../button/button.css';
import { initTextFields, FormValidation } from './text-field.js';

export default {
  title: 'Componentes/Text field',
  tags: ['autodocs'],
};

// La página "Docs" de Storybook renderiza cada historia más de una vez
// en el mismo documento, así que los ids se generan con un contador en
// cada llamada a render() (mismo patrón que Accordion).
let instanceCount = 0;

function nextPrefix(storyName) {
  return `${storyName}-${instanceCount++}`;
}

export const Basicos = {
  name: 'Campos básicos',
  render: () => {
    const p = nextPrefix('basicos');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-nombre">
          Nombre <span class="c-field__required">(obligatorio)</span>
        </label>
        <input class="c-field__control" type="text" id="${p}-nombre" name="nombre"
          autocomplete="name" required aria-describedby="${p}-nombre-hint" />
        <p class="c-field__hint" id="${p}-nombre-hint">
          Como aparece en tu documento de identidad.
        </p>
      </div>

      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-password">
          Contraseña <span class="c-field__required">(obligatorio)</span>
        </label>
        <input class="c-field__control" type="password" id="${p}-password" name="password"
          autocomplete="new-password" required minlength="8"
          aria-describedby="${p}-password-hint" />
        <p class="c-field__hint" id="${p}-password-hint">Al menos 8 caracteres.</p>
      </div>

      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-telefono">Teléfono</label>
        <input class="c-field__control" type="tel" id="${p}-telefono" name="telefono"
          autocomplete="tel" inputmode="tel" />
      </div>

      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-web">Sitio web</label>
        <input class="c-field__control" type="url" id="${p}-web" name="web"
          autocomplete="url" placeholder="https://ejemplo.com" />
      </div>
    `;
    return wrapper;
  },
};

export const Invalido = {
  name: 'Correo con error (aria-invalid)',
  render: () => {
    const p = nextPrefix('invalido');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-correo">
          Correo electrónico <span class="c-field__required">(obligatorio)</span>
        </label>
        <input class="c-field__control" type="email" id="${p}-correo" name="correo"
          autocomplete="email" required value="ana#ejemplo.com"
          aria-invalid="true" aria-describedby="${p}-correo-error"
          data-error-type-mismatch="Introduce un correo electrónico válido" />
        <p class="c-field__error" id="${p}-correo-error">
          <svg class="c-field__error-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Introduce un correo electrónico válido
        </p>
      </div>
    `;
    return wrapper;
  },
};

export const TextareaYSelect = {
  name: 'Textarea y select',
  render: () => {
    const p = nextPrefix('textarea-select');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-comentarios">Comentarios</label>
        <textarea class="c-field__control" id="${p}-comentarios" name="comentarios" rows="4"
          aria-describedby="${p}-comentarios-hint"></textarea>
        <p class="c-field__hint" id="${p}-comentarios-hint">Máximo 500 caracteres.</p>
      </div>

      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-pais">País</label>
        <select class="c-field__control" id="${p}-pais" name="pais">
          <option value="">Selecciona un país</option>
          <option value="es">España</option>
          <option value="mx">México</option>
          <option value="ar">Argentina</option>
        </select>
      </div>
    `;
    return wrapper;
  },
};

export const Formulario = {
  name: 'Formulario con resumen de errores',
  render: () => {
    const p = nextPrefix('formulario');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <form data-validate>
        <div class="c-field" data-field>
          <label class="c-field__label" for="${p}-nombre">
            Nombre <span class="c-field__required">(obligatorio)</span>
          </label>
          <input class="c-field__control" type="text" id="${p}-nombre" name="nombre"
            autocomplete="name" required aria-describedby="${p}-nombre-hint" />
          <p class="c-field__hint" id="${p}-nombre-hint">
            Como aparece en tu documento de identidad.
          </p>
        </div>

        <div class="c-field" data-field>
          <label class="c-field__label" for="${p}-correo">
            Correo electrónico <span class="c-field__required">(obligatorio)</span>
          </label>
          <input class="c-field__control" type="email" id="${p}-correo" name="correo"
            autocomplete="email" required
            data-error-type-mismatch="Introduce un correo electrónico válido" />
        </div>

        <p class="${p}-resultado" hidden>Formulario enviado correctamente.</p>
        <button type="submit" class="c-button c-button--primary">Enviar</button>
      </form>
    `;

    const form = wrapper.querySelector('form');
    initTextFields(wrapper);
    new FormValidation(form);
    // Solo para la demo: evita la navegación real (no hay backend) y
    // muestra un mensaje cuando FormValidation deja pasar el envío.
    form.addEventListener('submit', (event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      wrapper.querySelector(`.${p}-resultado`).hidden = false;
    });

    return wrapper;
  },
};

export const DeshabilitadoYSoloLectura = {
  name: 'Deshabilitado y solo lectura',
  render: () => {
    const p = nextPrefix('estados');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-plan">Plan actual</label>
        <input class="c-field__control" type="text" id="${p}-plan" name="plan"
          value="Profesional" disabled />
      </div>

      <div class="c-field" data-field>
        <label class="c-field__label" for="${p}-id-cliente">Identificador de cliente</label>
        <input class="c-field__control" type="text" id="${p}-id-cliente" name="id-cliente"
          value="CUS-48213" readonly />
      </div>
    `;
    return wrapper;
  },
};
