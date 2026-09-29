import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dismissable } from './dismiss.js';

function press(el, key) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
  return event;
}

function pointerdown(el) {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
}

describe('dismissable', () => {
  let panel;
  let trigger;
  let outsideEl;
  let onDismiss;
  let destroy;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="trigger">Abrir</button>
      <div id="panel"><button id="panel-item">Dentro</button></div>
      <button id="outside">Fuera</button>
    `;
    trigger = document.getElementById('trigger');
    panel = document.getElementById('panel');
    outsideEl = document.getElementById('outside');
    onDismiss = vi.fn();
    destroy = null;
  });

  afterEach(() => {
    destroy?.();
  });

  it('Esc llama a onDismiss("escape") y cancela el evento', () => {
    destroy = dismissable(panel, { trigger, onDismiss });

    const event = press(document.body, 'Escape');

    expect(onDismiss).toHaveBeenCalledWith('escape');
    expect(event.defaultPrevented).toBe(true);
  });

  it('un pointerdown fuera del panel y del disparador llama a onDismiss("outside")', () => {
    destroy = dismissable(panel, { trigger, onDismiss });

    pointerdown(outsideEl);

    expect(onDismiss).toHaveBeenCalledWith('outside');
  });

  it('un pointerdown en el disparador o dentro del panel no llama a onDismiss', () => {
    destroy = dismissable(panel, { trigger, onDismiss });

    pointerdown(trigger);
    pointerdown(document.getElementById('panel-item'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('el foco que sale del panel a otro elemento llama a onDismiss("outside")', () => {
    document.getElementById('panel-item').focus();
    destroy = dismissable(panel, { trigger, onDismiss });

    outsideEl.focus();

    expect(onDismiss).toHaveBeenCalledWith('outside');
  });

  it('escape: false desactiva el cierre con Esc', () => {
    destroy = dismissable(panel, { trigger, onDismiss, escape: false });

    const event = press(document.body, 'Escape');

    expect(onDismiss).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('outside: false desactiva el cierre por pointerdown y por foco fuera', () => {
    destroy = dismissable(panel, { trigger, onDismiss, outside: false });

    pointerdown(outsideEl);
    outsideEl.focus();

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('destroy() quita los listeners: Esc y el clic fuera dejan de avisar', () => {
    destroy = dismissable(panel, { trigger, onDismiss });
    destroy();

    press(document.body, 'Escape');
    pointerdown(outsideEl);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
