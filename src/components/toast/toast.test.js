import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Toast, initToasts, showToast } from './toast.js';

const region = (politeness) =>
  document.querySelector(`[data-live-region="${politeness}"]`);

function buildMarkup({ variant = 'info' } = {}) {
  document.body.innerHTML = `
    <button id="antes">Antes</button>
    <div class="c-toast" id="toast" data-toast data-toast-variant="${variant}" hidden>
      <p data-toast-body><span>Prefijo:</span> Mensaje</p>
      <button type="button" id="accion">Acción</button>
      <button type="button" id="cerrar" aria-label="Cerrar notificación" data-toast-close>×</button>
    </div>
    <button id="despues">Después</button>
  `;
  return document.getElementById('toast');
}

describe('Toast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Toast(null)).toThrow();
  });

  it('show() quita hidden y visible pasa a true; hide() lo revierte', () => {
    const el = buildMarkup();
    const toast = new Toast(el);
    expect(toast.visible).toBe(false);
    toast.show();
    expect(toast.visible).toBe(true);
    expect(el.hasAttribute('hidden')).toBe(false);
    toast.hide();
    expect(toast.visible).toBe(false);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('el toast visual no es región viva (no lleva role)', () => {
    const el = buildMarkup();
    new Toast(el).show();
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.querySelector('[role]')).toBeNull();
  });

  it('show() anuncia el texto en la región cortés en info', () => {
    const toast = new Toast(buildMarkup({ variant: 'info' }));
    toast.show();
    vi.advanceTimersByTime(0);
    expect(region('polite').textContent).toBe('Prefijo: Mensaje');
  });

  it('show() anuncia en la región asertiva en danger y warning', () => {
    new Toast(buildMarkup({ variant: 'danger' })).show();
    vi.advanceTimersByTime(0);
    expect(region('assertive').textContent).toBe('Prefijo: Mensaje');
    expect(region('polite')?.textContent ?? '').toBe('');
  });

  it('show() en un toast ya visible no vuelve a anunciarlo', () => {
    const toast = new Toast(buildMarkup());
    toast.show();
    vi.advanceTimersByTime(0);
    region('polite').textContent = '';
    toast.show();
    vi.advanceTimersByTime(0);
    expect(region('polite').textContent).toBe('');
  });

  it('mostrar el toast no mueve el foco', () => {
    const el = buildMarkup();
    const antes = document.getElementById('antes');
    antes.focus();
    new Toast(el).show();
    expect(document.activeElement).toBe(antes);
  });

  it('el botón de cierre oculta el toast', () => {
    const el = buildMarkup();
    const toast = new Toast(el);
    toast.show();
    document.getElementById('cerrar').click();
    expect(toast.visible).toBe(false);
  });

  describe('foco al cerrar', () => {
    it('vuelve a returnFocus si se da', () => {
      const el = buildMarkup();
      const destino = document.getElementById('despues');
      const toast = new Toast(el, { returnFocus: destino });
      toast.show();
      const cerrar = document.getElementById('cerrar');
      cerrar.focus();
      cerrar.click();
      expect(document.activeElement).toBe(destino);
    });

    it('sin returnFocus, vuelve al elemento que tenía el foco antes de entrar', () => {
      const el = buildMarkup();
      const antes = document.getElementById('antes');
      const toast = new Toast(el);
      toast.show();
      antes.focus();
      const cerrar = document.getElementById('cerrar');
      cerrar.focus();
      // jsdom no rellena relatedTarget en focusin: se simula el evento.
      el.dispatchEvent(
        new FocusEvent('focusin', { bubbles: true, relatedTarget: antes })
      );
      cerrar.click();
      expect(document.activeElement).toBe(antes);
    });

    it('no toca el foco si estaba fuera del toast', () => {
      const el = buildMarkup();
      const toast = new Toast(el);
      toast.show();
      const despues = document.getElementById('despues');
      despues.focus();
      toast.hide();
      expect(document.activeElement).toBe(despues);
    });
  });

  describe('evitar tapar el foco (SC 2.4.11)', () => {
    const box = (left, top, right, bottom) => ({
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    });

    function setup() {
      document.body.innerHTML = `
        <button id="abajo">Abajo</button>
        <div data-toast-region id="region">
          <div id="toast" data-toast data-toast-variant="info" hidden>
            <p data-toast-body>Mensaje</p>
            <button id="cerrar" data-toast-close>×</button>
          </div>
        </div>
      `;
      const region = document.getElementById('region');
      const abajo = document.getElementById('abajo');
      region.getBoundingClientRect = () => box(0, 500, 300, 600);
      const toast = new Toast(document.getElementById('toast'));
      return { region, abajo, toast };
    }

    it('sube la región si el foco llega a un elemento que taparía', () => {
      const { region, abajo, toast } = setup();
      toast.show();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(true);
    });

    it('no la mueve si el elemento enfocado no se solapa', () => {
      const { region, abajo, toast } = setup();
      toast.show();
      abajo.getBoundingClientRect = () => box(10, 10, 100, 40);
      abajo.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });

    it('vuelve a bajar si arriba también taparía', () => {
      const { region, abajo, toast } = setup();
      toast.show();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      abajo.blur();
      region.getBoundingClientRect = () => box(0, 0, 300, 100);
      abajo.getBoundingClientRect = () => box(10, 20, 100, 50);
      abajo.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });

    it('comprueba el elemento ya enfocado al mostrar el toast', () => {
      const { region, abajo, toast } = setup();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      toast.show();
      expect(region.hasAttribute('data-toast-top')).toBe(true);
    });

    it('ignora el foco dentro del propio toast', () => {
      const { region, toast } = setup();
      toast.show();
      const cerrar = document.getElementById('cerrar');
      cerrar.getBoundingClientRect = () => box(10, 520, 100, 550);
      cerrar.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });

    it('con el toast oculto no mueve nada', () => {
      const { region, abajo } = setup();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });

    it('al cerrar el último toast la región vuelve a su sitio', () => {
      const { region, abajo, toast } = setup();
      toast.show();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      toast.hide();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });

    it('tras destroy() ya no reacciona al foco', () => {
      const { region, abajo, toast } = setup();
      toast.show();
      toast.destroy();
      abajo.getBoundingClientRect = () => box(10, 520, 100, 550);
      abajo.focus();
      expect(region.hasAttribute('data-toast-top')).toBe(false);
    });
  });

  describe('tecla Esc', () => {
    function esc(target) {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    }

    it('con el foco dentro cierra el toast y cancela el evento', () => {
      const el = buildMarkup();
      const toast = new Toast(el);
      toast.show();
      const cerrar = document.getElementById('cerrar');
      cerrar.focus();
      const event = esc(cerrar);
      expect(toast.visible).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    });

    it('devuelve el foco a returnFocus', () => {
      const el = buildMarkup();
      const destino = document.getElementById('despues');
      const toast = new Toast(el, { returnFocus: destino });
      toast.show();
      const cerrar = document.getElementById('cerrar');
      cerrar.focus();
      esc(cerrar);
      expect(document.activeElement).toBe(destino);
    });

    it('con el foco fuera del toast no lo cierra', () => {
      const el = buildMarkup();
      const toast = new Toast(el);
      toast.show();
      const antes = document.getElementById('antes');
      antes.focus();
      const event = esc(antes);
      expect(toast.visible).toBe(true);
      expect(event.defaultPrevented).toBe(false);
    });

    it('otras teclas no lo cierran', () => {
      const el = buildMarkup();
      const toast = new Toast(el);
      toast.show();
      const cerrar = document.getElementById('cerrar');
      cerrar.focus();
      cerrar.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      );
      expect(toast.visible).toBe(true);
    });

    it('tras destroy() Esc ya no lo cierra', () => {
      const el = buildMarkup();
      const toast = new Toast(el);
      toast.show();
      toast.destroy();
      esc(document.getElementById('cerrar'));
      expect(toast.visible).toBe(true);
    });
  });

  it('destroy() quita el listener del botón de cierre', () => {
    const el = buildMarkup();
    const toast = new Toast(el);
    toast.show();
    toast.destroy();
    document.getElementById('cerrar').click();
    expect(toast.visible).toBe(true);
  });

  it('initToasts() inicializa los [data-toast] sin mostrarlos', () => {
    buildMarkup();
    const toasts = initToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].visible).toBe(false);
  });

  it('initToasts() lee data-autohide y data-delay', () => {
    document.body.innerHTML = `
      <div data-toast data-autohide data-delay="2000" hidden></div>
      <div data-toast hidden></div>
    `;
    const [a, b] = initToasts();
    expect(a.autohide).toBe(true);
    expect(a.delay).toBe(2000);
    expect(b.autohide).toBe(false);
    expect(b.delay).toBe(5000);
  });
});

describe('showToast()', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="antes">Antes</button>';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('crea la región fija la primera vez y la reutiliza después', () => {
    showToast('Uno');
    showToast('Dos');
    const regions = document.querySelectorAll('[data-toast-region]');
    expect(regions).toHaveLength(1);
    expect(regions[0].children).toHaveLength(2);
  });

  it('sin after, la región global se quita al cerrar el último toast', () => {
    const uno = showToast('Uno');
    const dos = showToast('Dos');
    uno.hide();
    expect(document.querySelector('[data-toast-region]')).not.toBeNull();
    dos.hide();
    expect(document.querySelector('[data-toast-region]')).toBeNull();
    expect(document.querySelector('.c-toast-region')).toBeNull();
  });

  it('tras quitar la región global se puede mostrar otro toast', () => {
    showToast('Uno').hide();
    const toast = showToast('Dos');
    expect(toast.visible).toBe(true);
    expect(toast.el.isConnected).toBe(true);
  });

  describe('opción after', () => {
    beforeEach(() => {
      document.body.innerHTML =
        '<button id="boton">Abrir</button><button id="otro">Otro</button>';
    });

    it('crea una región propia justo después del disparador', () => {
      const boton = document.getElementById('boton');
      const toast = showToast('Hola', { after: boton });
      const region = boton.nextElementSibling;
      expect(region.classList.contains('c-toast-region')).toBe(true);
      expect(region.contains(toast.el)).toBe(true);
      expect(document.querySelector('[data-toast-region]')).toBeNull();
    });

    it('el siguiente botón en el orden de Tab es el de cerrar', () => {
      const boton = document.getElementById('boton');
      const toast = showToast('Hola', { after: boton });
      const buttons = Array.from(document.querySelectorAll('button'));
      expect(buttons[0]).toBe(boton);
      expect(buttons[1]).toBe(toast.el.querySelector('[data-toast-close]'));
      expect(buttons[2]).toBe(document.getElementById('otro'));
    });

    it('al cerrarlo se quita todo el marcado, región incluida', () => {
      const boton = document.getElementById('boton');
      const toast = showToast('Hola', { after: boton });
      toast.el.querySelector('[data-toast-close]').click();
      expect(document.querySelector('.c-toast-region')).toBeNull();
      expect(document.querySelector('[data-toast]')).toBeNull();
      expect(boton.nextElementSibling).toBe(document.getElementById('otro'));
    });

    it('al cerrarlo con el foco dentro, el foco vuelve al disparador', () => {
      const boton = document.getElementById('boton');
      const toast = showToast('Hola', { after: boton });
      const cerrar = toast.el.querySelector('[data-toast-close]');
      cerrar.focus();
      cerrar.click();
      expect(document.activeElement).toBe(boton);
    });

    it('mostrarlo no mueve el foco', () => {
      const otro = document.getElementById('otro');
      otro.focus();
      showToast('Hola', { after: document.getElementById('boton') });
      expect(document.activeElement).toBe(otro);
    });
  });

  it('devuelve un Toast visible con la clase de su variante', () => {
    const toast = showToast('Hola', { variant: 'warning' });
    expect(toast).toBeInstanceOf(Toast);
    expect(toast.visible).toBe(true);
    expect(toast.el.classList.contains('c-toast--warning')).toBe(true);
  });

  it('no lleva role y el botón de cierre tiene su nombre en español', () => {
    const { el } = showToast('Hola');
    expect(el.hasAttribute('role')).toBe(false);
    expect(
      el.querySelector('[data-toast-close]').getAttribute('aria-label')
    ).toBe('Cerrar notificación');
  });

  it.each([
    ['info', 'polite', 'Información: X'],
    ['success', 'polite', 'Correcto: X'],
    ['warning', 'assertive', 'Aviso: X'],
    ['danger', 'assertive', 'Error: X'],
  ])('la variante %s anuncia en la región %s', (variant, politeness, text) => {
    showToast('X', { variant });
    vi.advanceTimersByTime(0);
    expect(region(politeness).textContent).toBe(text);
  });

  it('inserta el mensaje como texto, no como HTML', () => {
    const { el } = showToast('<img src=x onerror=alert(1)>');
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('mostrarlo no mueve el foco', () => {
    const antes = document.getElementById('antes');
    antes.focus();
    showToast('Hola');
    expect(document.activeElement).toBe(antes);
  });

  it('al cerrarlo se quita del DOM', () => {
    const toast = showToast('Hola');
    toast.el.querySelector('[data-toast-close]').click();
    expect(toast.el.isConnected).toBe(false);
  });

  it('con action muestra el botón, ejecuta onClick y cierra el toast', () => {
    const onClick = vi.fn();
    const toast = showToast('Eliminado', {
      action: { label: 'Deshacer', onClick },
    });
    const button = toast.el.querySelector('[data-toast-action]');
    expect(button.textContent).toBe('Deshacer');
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toast.el.isConnected).toBe(false);
  });

  it('sin action no hay botón de acción', () => {
    const { el } = showToast('Hola');
    expect(el.querySelector('[data-toast-action]')).toBeNull();
  });

  it('cerrar con el foco dentro devuelve el foco al elemento previo', () => {
    const antes = document.getElementById('antes');
    const toast = showToast('Hola');
    antes.focus();
    const cerrar = toast.el.querySelector('[data-toast-close]');
    cerrar.focus();
    toast.el.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, relatedTarget: antes })
    );
    cerrar.click();
    expect(document.activeElement).toBe(antes);
  });
});

describe('Toast: ocultación automática', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function build({ action = false } = {}) {
    document.body.innerHTML = `
      <button id="fuera">Fuera</button>
      <div id="toast" data-toast hidden>
        <p data-toast-body>Mensaje</p>
        ${action ? '<button id="accion" data-toast-action>Deshacer</button>' : ''}
        <button id="cerrar" data-toast-close>×</button>
      </div>
    `;
    return document.getElementById('toast');
  }

  it('sin autohide sigue visible tras 60 s', () => {
    const toast = new Toast(build());
    toast.show();
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
  });

  it('con autohide se oculta a los 5000 ms, no antes', () => {
    const toast = new Toast(build(), { autohide: true, delay: 5000 });
    toast.show();
    vi.advanceTimersByTime(4999);
    expect(toast.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.visible).toBe(false);
  });

  it('respeta un delay personalizado', () => {
    const toast = new Toast(build(), { autohide: true, delay: 2000 });
    toast.show();
    vi.advanceTimersByTime(2000);
    expect(toast.visible).toBe(false);
  });

  it('con el foco dentro no se oculta mientras dure el foco', () => {
    const el = build();
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    document.getElementById('cerrar').focus();
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
  });

  it('al salir el foco se reanuda con el tiempo que quedaba', () => {
    const el = build();
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    vi.advanceTimersByTime(3000);
    el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
    el.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
    );
    vi.advanceTimersByTime(1999);
    expect(toast.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.visible).toBe(false);
  });

  it('el foco que pasa de un control del toast a otro no reanuda el tiempo', () => {
    const el = build({ action: false });
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    el.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.getElementById('cerrar'),
      })
    );
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
  });

  it('con el ratón encima no se oculta; al salir se reanuda', () => {
    const el = build();
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    vi.advanceTimersByTime(2000);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
    el.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(2999);
    expect(toast.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.visible).toBe(false);
  });

  it('con ratón y foco a la vez espera a que terminen los dos', () => {
    const el = build();
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    el.dispatchEvent(new MouseEvent('mouseenter'));
    el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
    el.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
    );
    vi.advanceTimersByTime(5000);
    expect(toast.visible).toBe(false);
  });

  it('con botón de acción nunca se oculta solo', () => {
    const toast = new Toast(build({ action: true }), {
      autohide: true,
      delay: 5000,
    });
    expect(toast.autohide).toBe(false);
    toast.show();
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
  });

  it('cerrarlo a mano cancela el temporizador', () => {
    const el = build();
    const toast = new Toast(el, { autohide: true, delay: 5000 });
    toast.show();
    toast.hide();
    toast.show();
    vi.advanceTimersByTime(4999);
    expect(toast.visible).toBe(true);
    vi.advanceTimersByTime(1);
    expect(toast.visible).toBe(false);
  });

  it('destroy() cancela el temporizador', () => {
    const toast = new Toast(build(), { autohide: true, delay: 5000 });
    toast.show();
    toast.destroy();
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
  });

  it('initToasts() aplica data-autohide y data-delay', () => {
    document.body.innerHTML = `
      <div data-toast data-autohide data-delay="1000" hidden><p data-toast-body>X</p></div>
    `;
    const [toast] = initToasts();
    toast.show();
    vi.advanceTimersByTime(1000);
    expect(toast.visible).toBe(false);
  });

  it('showToast con autohide se oculta y se quita del DOM', () => {
    const toast = showToast('Hola', { autohide: true, delay: 3000 });
    vi.advanceTimersByTime(3000);
    expect(toast.el.isConnected).toBe(false);
  });

  it('showToast con action ignora autohide', () => {
    const toast = showToast('Hola', {
      autohide: true,
      action: { label: 'Deshacer' },
    });
    vi.advanceTimersByTime(60000);
    expect(toast.visible).toBe(true);
    toast.hide();
  });

  it('hide() con el foco dentro (y autohide activo) lo devuelve a returnFocus', () => {
    const el = build();
    const destino = document.getElementById('fuera');
    const toast = new Toast(el, {
      autohide: true,
      delay: 1000,
      returnFocus: destino,
    });
    toast.show();
    // El foco dentro pausa el temporizador; hide() manual devuelve el foco.
    document.getElementById('cerrar').focus();
    toast.hide();
    expect(document.activeElement).toBe(destino);
  });
});
