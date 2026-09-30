import { describe, it, expect, beforeEach } from 'vitest';
import { setFieldError, clearFieldError } from './field-validation.js';

describe('field-validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('setFieldError', () => {
    it('pone aria-invalid, crea el mensaje con el texto y lo añade a aria-describedby sin quitar la ayuda', () => {
      document.body.innerHTML = `
        <div data-field>
          <input id="email" aria-describedby="email-hint" />
          <p id="email-hint">Usaremos este correo para contactarte</p>
        </div>
      `;
      const input = document.getElementById('email');

      setFieldError(input, 'Introduce un correo electrónico válido');

      const error = document.getElementById('email-error');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(error.textContent).toBe('Introduce un correo electrónico válido');
      expect(error.tagName).toBe('P');
      expect(input.getAttribute('aria-describedby')).toBe(
        'email-hint email-error'
      );
    });

    it('llamada dos veces actualiza el mismo mensaje sin duplicarlo', () => {
      document.body.innerHTML = `
        <div data-field><input id="name" /></div>
      `;
      const input = document.getElementById('name');

      setFieldError(input, 'Este campo es obligatorio');
      setFieldError(input, 'Escribe al menos 2 caracteres');

      expect(document.querySelectorAll('#name-error')).toHaveLength(1);
      expect(document.getElementById('name-error').textContent).toBe(
        'Escribe al menos 2 caracteres'
      );
    });

    it('el mensaje se coloca en [data-field-error] si existe', () => {
      document.body.innerHTML = `
        <div data-field>
          <input id="phone" />
        </div>
        <div data-field-error="phone"></div>
      `;
      const input = document.getElementById('phone');

      setFieldError(input, 'Introduce un teléfono válido');

      const target = document.querySelector('[data-field-error="phone"]');
      expect(target.querySelector('#phone-error')).not.toBeNull();
      expect(document.querySelector('[data-field] #phone-error')).toBeNull();
    });

    it('un control sin id lanza un error', () => {
      const input = document.createElement('input');
      expect(() => setFieldError(input, 'X')).toThrow();
    });
  });

  describe('clearFieldError', () => {
    it('deja aria-describedby solo con el id de la ayuda', () => {
      document.body.innerHTML = `
        <div data-field>
          <input id="email" aria-describedby="email-hint" />
          <p id="email-hint">Ayuda</p>
        </div>
      `;
      const input = document.getElementById('email');
      setFieldError(input, 'Error');

      clearFieldError(input);

      expect(document.getElementById('email-error')).toBeNull();
      expect(input.hasAttribute('aria-invalid')).toBe(false);
      expect(input.getAttribute('aria-describedby')).toBe('email-hint');
    });

    it('sin más ids, quita aria-describedby del todo', () => {
      document.body.innerHTML = `
        <div data-field><input id="name" /></div>
      `;
      const input = document.getElementById('name');
      setFieldError(input, 'Error');

      clearFieldError(input);

      expect(input.hasAttribute('aria-describedby')).toBe(false);
    });

    it('un control sin id lanza un error', () => {
      const input = document.createElement('input');
      expect(() => clearFieldError(input)).toThrow();
    });
  });
});
