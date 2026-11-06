import './text-field.css';
import '../button/button.css';
import { initTextFields, FormValidation } from './text-field.js';
import {
  setFieldError,
  clearFieldError,
  DEFAULT_MESSAGES,
} from '../../utils/field-validation.js';

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
          <div data-field-error="${p}-usuario" aria-live="polite" aria-atomic="true"></div>
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

// Nombres que el «servidor» de la demo da por ocupados.
const TAKEN_USERNAMES = ['admin', 'ana'];
const FAKE_LATENCY_MS = 1200;
// Pausa al escribir antes de validar el campo.
const DEBOUNCE_MS = 600;

/** Simula una consulta al servidor: ¿está libre este nombre de usuario? */
function checkUsernameAvailable(username) {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(!TAKEN_USERNAMES.includes(username.trim().toLowerCase())),
      FAKE_LATENCY_MS
    );
  });
}

/** Icono del mensaje de error (decorativo), igual que en la historia Inválido. */
function buildErrorIcon() {
  const template = document.createElement('template');
  template.innerHTML = `<svg class="c-field__error-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>`;
  return template.content.firstElementChild;
}

/** Mensaje de la validación nativa, con `data-error-*` o el de por defecto. */
function nativeMessage(control) {
  const { validity } = control;
  const attrs = {
    valueMissing: 'required',
    typeMismatch: 'type-mismatch',
    tooShort: 'too-short',
  };
  for (const [key, suffix] of Object.entries(attrs)) {
    if (validity[key]) {
      return (
        control.getAttribute(`data-error-${suffix}`) || DEFAULT_MESSAGES[key]
      );
    }
  }
  return DEFAULT_MESSAGES.badInput;
}

export const FormularioAsincrono = {
  name: 'Formulario con validación asíncrona (aria-live)',
  render: () => {
    const p = nextPrefix('asincrono');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <form novalidate aria-describedby="${p}-estado">
        <div class="c-field" data-field>
          <label class="c-field__label" for="${p}-usuario">
            Nombre de usuario <span class="c-field__required">(obligatorio)</span>
          </label>
          <input class="c-field__control" type="text" id="${p}-usuario" name="usuario"
            autocomplete="username" required minlength="3"
            aria-describedby="${p}-usuario-hint"
            data-error-required="Escribe un nombre de usuario"
            data-error-too-short="El nombre de usuario necesita al menos 3 caracteres" />
          <p class="c-field__hint" id="${p}-usuario-hint">
            Se comprueba en el servidor mientras escribes. Prueba con «ana» o «admin».
          </p>
          <div data-field-error="${p}-usuario" aria-live="polite" aria-atomic="true"></div>
        </div>

        <div class="c-field" data-field>
          <label class="c-field__label" for="${p}-correo">
            Correo electrónico <span class="c-field__required">(obligatorio)</span>
          </label>
          <input class="c-field__control" type="email" id="${p}-correo" name="correo"
            autocomplete="email" required
            data-error-required="Escribe tu correo electrónico"
            data-error-type-mismatch="Introduce un correo electrónico válido" />
          <div data-field-error="${p}-correo" aria-live="polite" aria-atomic="true"></div>
        </div>

        <p class="${p}-estado" id="${p}-estado" role="status"></p>
        <button type="submit" class="c-button c-button--primary">Crear cuenta</button>
      </form>
    `;

    const form = wrapper.querySelector('form');
    const status = wrapper.querySelector(`.${p}-estado`);
    const button = form.querySelector('button[type="submit"]');
    const username = form.elements.usuario;
    const controls = [username, form.elements.correo];
    // Una consulta al servidor por valor: si el usuario sale del campo y
    // luego envía sin cambiarlo, se reutiliza en vez de repetirla.
    const availability = new Map();
    let pending = false;

    function showError(control, message) {
      const errorId = `${control.id}-error`;
      setFieldError(control, message);
      document.getElementById(errorId).prepend(buildErrorIcon());

      // Con el foco en el campo, el mensaje ya lo anuncia su región viva.
      // Si además entra en aria-describedby, el lector relee la
      // descripción entera (ayuda + error). Se enlaza al salir del campo.
      if (document.activeElement !== control) return;
      const ids = control.getAttribute('aria-describedby').split(/\s+/);
      const others = ids.filter((id) => id !== errorId);
      if (others.length) {
        control.setAttribute('aria-describedby', others.join(' '));
      } else {
        control.removeAttribute('aria-describedby');
      }
      control.addEventListener(
        'blur',
        () => {
          if (!document.getElementById(errorId)) return;
          const current = (control.getAttribute('aria-describedby') || '')
            .split(/s+/)
            .filter(Boolean);
          if (!current.includes(errorId)) current.push(errorId);
          control.setAttribute('aria-describedby', current.join(' '));
        },
        { once: true }
      );
    }

    /**
     * Valida un campo: primero en local y, solo el usuario, después en el
     * servidor. Pinta o quita su mensaje; no toca el foco.
     * @returns {Promise<boolean>}
     */
    async function validateField(control) {
      if (!control.checkValidity()) {
        showError(control, nativeMessage(control));
        return false;
      }
      if (control !== username) {
        clearFieldError(control);
        return true;
      }

      const value = username.value.trim();
      if (!availability.has(value)) {
        availability.set(value, checkUsernameAvailable(value));
      }
      const free = await availability.get(value);

      // Si el valor cambió mientras se esperaba, la respuesta ya no vale.
      if (username.value.trim() !== value) return false;
      if (free) {
        clearFieldError(username);
      } else {
        showError(username, `«${value}» ya está en uso, elige otro`);
      }
      return free;
    }

    const timers = new Map();

    controls.forEach((control) => {
      // Cada pulsación retira el error del campo (ya puede estar obsoleto)
      // y reinicia la cuenta atrás; se valida cuando el usuario hace una
      // pausa, no en cada tecla ni al cambiar el foco.
      control.addEventListener('input', () => {
        clearTimeout(timers.get(control));
        clearFieldError(control);
        timers.set(
          control,
          setTimeout(() => validateField(control), DEBOUNCE_MS)
        );
      });
    });

    // El envío solo completa lo que aún no se ha validado.
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending) return;
      pending = true;
      timers.forEach(clearTimeout);
      form.setAttribute('aria-busy', 'true');
      button.setAttribute('aria-disabled', 'true');

      const results = await Promise.all(controls.map(validateField));

      form.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
      pending = false;
      if (results.every(Boolean)) {
        status.textContent = 'Cuenta creada correctamente.';
      }
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
