import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Alert, initAlerts, showAlert } from './alert.js';
import referenceHtml from './alert.html?raw';

function buildMarkup({ returnId = '' } = {}) {
  document.body.innerHTML = `
    <button id="antes">Antes</button>
    <div class="c-alert c-alert--danger" id="alerta" data-alert
      ${returnId ? `data-alert-return="${returnId}"` : ''}>
      <p><span>Error:</span> No se pudo enviar.</p>
      <button type="button" id="cerrar" aria-label="Cerrar alerta" data-alert-close>×</button>
    </div>
    <button id="despues">Después</button>
    <input id="campo" />
  `;
  return {
    alert: document.getElementById('alerta'),
    close: document.getElementById('cerrar'),
  };
}

describe('Alert', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Alert(null)).toThrow();
  });

  it('el marcado de referencia tiene el role de su variante', () => {
    document.body.innerHTML = referenceHtml;
    const roleOf = (variant) =>
      document.querySelector(`.c-alert--${variant}`).getAttribute('role');
    expect(roleOf('info')).toBe('status');
    expect(roleOf('success')).toBe('status');
    expect(roleOf('warning')).toBe('alert');
    expect(roleOf('danger')).toBe('alert');
  });

  it('cada variante del marcado tiene un prefijo de texto oculto distinto y un icono aria-hidden', () => {
    document.body.innerHTML = referenceHtml;
    const alerts = document.querySelectorAll('.c-alert');
    expect(alerts).toHaveLength(4);
    const prefixes = Array.from(alerts).map((a) =>
      a.querySelector('.c-alert__sr-text').textContent.trim()
    );
    expect(new Set(prefixes).size).toBe(4);
    alerts.forEach((a) => {
      expect(
        a.querySelector('svg.c-alert__icon').getAttribute('aria-hidden')
      ).toBe('true');
    });
  });

  it('el botón de cierre quita la alerta del DOM', () => {
    const { alert, close } = buildMarkup();
    new Alert(alert);
    close.focus();
    close.click();
    expect(document.getElementById('alerta')).toBeNull();
  });

  describe('foco al cerrar', () => {
    it('va a la opción returnFocus', () => {
      const { alert, close } = buildMarkup({ returnId: 'campo' });
      const destino = document.getElementById('antes');
      new Alert(alert, { returnFocus: destino });
      close.focus();
      close.click();
      expect(document.activeElement).toBe(destino);
    });

    it('va al elemento de data-alert-return', () => {
      const { alert, close } = buildMarkup({ returnId: 'campo' });
      new Alert(alert);
      close.focus();
      close.click();
      expect(document.activeElement).toBe(document.getElementById('campo'));
    });

    it('sin nada de lo anterior, va al siguiente enfocable tras la alerta', () => {
      const { alert, close } = buildMarkup();
      new Alert(alert);
      close.focus();
      close.click();
      expect(document.activeElement).toBe(document.getElementById('despues'));
    });

    it('si no hay enfocables después, va al anterior', () => {
      document.body.innerHTML = `
        <button id="antes">Antes</button>
        <div id="alerta" data-alert>
          <button type="button" id="cerrar" data-alert-close>×</button>
        </div>
      `;
      new Alert(document.getElementById('alerta'));
      const close = document.getElementById('cerrar');
      close.focus();
      close.click();
      expect(document.activeElement).toBe(document.getElementById('antes'));
    });

    it('ignora los enfocables ocultos al buscar el siguiente', () => {
      const { alert, close } = buildMarkup();
      document.getElementById('despues').hidden = true;
      new Alert(alert);
      close.focus();
      close.click();
      expect(document.activeElement).toBe(document.getElementById('campo'));
    });

    it('nunca deja el foco en <body> si hay algún enfocable', () => {
      const { alert, close } = buildMarkup();
      new Alert(alert);
      close.focus();
      close.click();
      expect(document.activeElement).not.toBe(document.body);
    });

    it('el clic mueve el foco aunque el botón no lo tuviera (Safari)', () => {
      const { alert, close } = buildMarkup();
      new Alert(alert);
      expect(document.activeElement).toBe(document.body);
      close.click();
      expect(document.activeElement).toBe(document.getElementById('despues'));
    });
  });

  describe('dismiss()', () => {
    it('quita la alerta y mueve el foco si estaba dentro', () => {
      const { alert, close } = buildMarkup();
      const instance = new Alert(alert);
      close.focus();
      instance.dismiss();
      expect(document.getElementById('alerta')).toBeNull();
      expect(document.activeElement).toBe(document.getElementById('despues'));
    });

    it('no toca el foco si estaba fuera de la alerta', () => {
      const { alert } = buildMarkup();
      const instance = new Alert(alert);
      const campo = document.getElementById('campo');
      campo.focus();
      instance.dismiss();
      expect(document.getElementById('alerta')).toBeNull();
      expect(document.activeElement).toBe(campo);
    });
  });

  it('destroy() quita el listener del botón', () => {
    const { alert, close } = buildMarkup();
    const instance = new Alert(alert);
    instance.destroy();
    close.click();
    expect(document.getElementById('alerta')).not.toBeNull();
  });

  it('una alerta sin botón de cierre se inicializa sin errores', () => {
    document.body.innerHTML = '<div id="a" data-alert><p>Aviso</p></div>';
    expect(() => new Alert(document.getElementById('a'))).not.toThrow();
  });

  it('initAlerts() inicializa todas las alertas con [data-alert]', () => {
    document.body.innerHTML = `
      <div data-alert></div><div data-alert></div><div></div>
    `;
    expect(initAlerts()).toHaveLength(2);
  });
});

describe('showAlert()', () => {
  let container;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="avisos"></div>
      <button id="despues">Después</button>
    `;
    container = document.getElementById('avisos');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lanza un error si no recibe contenedor', () => {
    expect(() => showAlert(null, 'Hola')).toThrow();
  });

  it('inserta la alerta en el contenedor con la clase de su variante', () => {
    const el = showAlert(container, 'Hola', { variant: 'warning' });
    expect(container.contains(el)).toBe(true);
    expect(el.classList.contains('c-alert--warning')).toBe(true);
  });

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ])('la variante %s lleva role="%s"', (variant, role) => {
    const el = showAlert(container, 'Hola', { variant });
    expect(el.getAttribute('role')).toBe(role);
  });

  it('nace vacía y escribe «Prefijo mensaje» en el siguiente tick', () => {
    const el = showAlert(container, 'X', { variant: 'danger' });
    expect(el.textContent.trim()).toBe('');
    vi.advanceTimersByTime(0);
    expect(el.textContent.trim()).toBe('Error: X');
    expect(el.querySelector('.c-alert__sr-text').textContent).toBe('Error:');
  });

  it('con success el texto lleva el prefijo «Correcto:»', () => {
    const el = showAlert(container, 'A', { variant: 'success' });
    vi.advanceTimersByTime(0);
    expect(el.textContent.trim()).toBe('Correcto: A');
  });

  it('inserta el mensaje como texto, no como HTML', () => {
    const el = showAlert(container, '<img src=x onerror=alert(1)>');
    vi.advanceTimersByTime(0);
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('no escribe en las regiones de live-region (sin doble lectura)', () => {
    showAlert(container, 'X', { variant: 'danger' });
    vi.advanceTimersByTime(0);
    expect(document.querySelector('[data-live-region]')).toBeNull();
  });

  it('una variante desconocida cae en info', () => {
    const el = showAlert(container, 'X', { variant: 'raro' });
    expect(el.classList.contains('c-alert--info')).toBe(true);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('dismissible devuelve un Alert cuyo botón la cierra y mueve el foco', () => {
    const alert = showAlert(container, 'X', { dismissible: true });
    expect(alert).toBeInstanceOf(Alert);
    const close = alert.el.querySelector('[data-alert-close]');
    expect(close.getAttribute('aria-label')).toBe('Cerrar alerta');
    close.focus();
    close.click();
    expect(container.children).toHaveLength(0);
    expect(document.activeElement).toBe(document.getElementById('despues'));
  });

  it('solo deja una alerta a la vez: la segunda llamada devuelve la existente', () => {
    const first = showAlert(container, 'Uno', { variant: 'danger' });
    vi.advanceTimersByTime(0);
    const second = showAlert(container, 'Dos', { variant: 'danger' });
    vi.advanceTimersByTime(0);
    expect(second).toBe(first);
    expect(container.children).toHaveLength(1);
    expect(container.textContent).toContain('Uno');
    expect(container.textContent).not.toContain('Dos');
  });

  it('con dismissible, la segunda llamada devuelve el mismo Alert', () => {
    const first = showAlert(container, 'Uno', { dismissible: true });
    const second = showAlert(container, 'Dos', { dismissible: true });
    expect(second).toBe(first);
    expect(container.children).toHaveLength(1);
  });

  it('tras descartar la alerta se puede mostrar otra', () => {
    const first = showAlert(container, 'Uno', { dismissible: true });
    first.dismiss();
    const second = showAlert(container, 'Dos', { dismissible: true });
    vi.advanceTimersByTime(0);
    expect(second).not.toBe(first);
    expect(container.children).toHaveLength(1);
    expect(container.textContent).toContain('Dos');
  });

  it('el límite es por contenedor', () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="otro"></div>');
    const otro = document.getElementById('otro');
    showAlert(container, 'Uno');
    showAlert(otro, 'Dos');
    expect(container.children).toHaveLength(1);
    expect(otro.children).toHaveLength(1);
  });

  it('sin dismissible no hay botón de cierre', () => {
    const el = showAlert(container, 'X');
    expect(el.querySelector('[data-alert-close]')).toBeNull();
  });
});
