import { describe, it, expect, beforeEach } from 'vitest';
import { Popover, initPopovers } from './popover.js';

function buildMarkup() {
  document.body.innerHTML = `
    <span class="c-popover">
      <button type="button" data-popover aria-expanded="false" aria-controls="p1">
        ¿Qué es el IBAN?
      </button>
      <div id="p1" hidden><p>Código de 24 caracteres.</p></div>
    </span>
    <button type="button" id="otro">Otro</button>
  `;
}

function keydown(key) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  );
}

describe('Popover', () => {
  beforeEach(buildMarkup);

  it('lanza un error si no recibe disparador', () => {
    expect(() => new Popover(null)).toThrow();
  });

  it('empieza cerrado', () => {
    const popover = new Popover(document.querySelector('[data-popover]'));

    expect(popover.expanded).toBe(false);
    expect(document.getElementById('p1').hidden).toBe(true);
  });

  it('un clic alterna aria-expanded y hidden', () => {
    const trigger = document.querySelector('[data-popover]');
    const popover = new Popover(trigger);

    trigger.click();
    expect(popover.expanded).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('p1').hidden).toBe(false);

    trigger.click();
    expect(popover.expanded).toBe(false);
    expect(document.getElementById('p1').hidden).toBe(true);
  });

  it('el panel es el siguiente hermano del disparador', () => {
    const trigger = document.querySelector('[data-popover]');
    expect(trigger.nextElementSibling.id).toBe('p1');
  });

  it('Escape lo cierra y deja el foco en el disparador', () => {
    const trigger = document.querySelector('[data-popover]');
    const popover = new Popover(trigger);
    // El foco está fuera antes de abrir: así se comprueba que Escape
    // lo devuelve al disparador, no que ya estuviera allí.
    document.getElementById('otro').focus();
    popover.open();

    keydown('Escape');

    expect(popover.expanded).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape con el popover cerrado no cancela el evento', () => {
    new Popover(document.querySelector('[data-popover]'));
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('un pointerdown fuera lo cierra sin mover el foco', () => {
    const trigger = document.querySelector('[data-popover]');
    const otro = document.getElementById('otro');
    const popover = new Popover(trigger);
    trigger.click();
    otro.focus();

    otro.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(popover.expanded).toBe(false);
    expect(document.activeElement).toBe(otro);
  });

  it('un pointerdown dentro del panel no lo cierra', () => {
    const trigger = document.querySelector('[data-popover]');
    const popover = new Popover(trigger);
    trigger.click();

    document
      .querySelector('#p1 p')
      .dispatchEvent(new Event('pointerdown', { bubbles: true }));

    expect(popover.expanded).toBe(true);
  });

  it('open() y close() funcionan por API, y close({ returnFocus }) mueve el foco', () => {
    const trigger = document.querySelector('[data-popover]');
    const popover = new Popover(trigger);

    popover.open();
    expect(popover.expanded).toBe(true);

    document.getElementById('otro').focus();
    popover.close({ returnFocus: true });
    expect(popover.expanded).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('destroy() quita los listeners: ni clic ni Escape hacen nada', () => {
    const trigger = document.querySelector('[data-popover]');
    const popover = new Popover(trigger);
    popover.open();

    popover.destroy();
    keydown('Escape');
    expect(popover.expanded).toBe(true);

    trigger.click();
    expect(popover.expanded).toBe(true);
  });

  it('initPopovers inicializa cada [data-popover]', () => {
    expect(initPopovers()).toHaveLength(1);
  });
});
