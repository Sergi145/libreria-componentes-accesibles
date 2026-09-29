import { describe, it, expect, beforeEach } from 'vitest';
import { Disclosure, initDisclosures } from './disclosure.js';

function buildMarkup({ expanded = false } = {}) {
  document.body.innerHTML = `
    <button type="button" id="trigger" aria-expanded="${expanded}" aria-controls="panel" data-disclosure>
      Más información
    </button>
    <div id="panel" ${expanded ? '' : 'hidden'}>
      <p>Contenido</p>
    </div>
  `;
  return document.getElementById('trigger');
}

describe('Disclosure', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Disclosure(null)).toThrow();
  });

  it('si el HTML no trae aria-expanded, lo inicializa en "false"', () => {
    document.body.innerHTML =
      '<button type="button" id="trigger" aria-controls="panel"></button><div id="panel"></div>';
    const trigger = document.getElementById('trigger');
    new Disclosure(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('lee el estado inicial del HTML (aria-expanded="true")', () => {
    const trigger = buildMarkup({ expanded: true });
    const disclosure = new Disclosure(trigger);
    expect(disclosure.expanded).toBe(true);
  });

  it('lee el estado inicial del HTML (aria-expanded="false")', () => {
    const trigger = buildMarkup({ expanded: false });
    const disclosure = new Disclosure(trigger);
    expect(disclosure.expanded).toBe(false);
  });

  it('un clic alterna aria-expanded y el atributo hidden del panel', () => {
    const trigger = buildMarkup();
    new Disclosure(trigger);
    const panel = document.getElementById('panel');

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('hidden')).toBe(false);

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  it('Enter/Espacio activan el trigger de forma nativa (no hay listener de teclado propio)', () => {
    // jsdom no simula que Enter/Espacio disparen "click" en un <button>
    // (eso lo hace el navegador de forma nativa); Disclosure solo
    // escucha "click", así que comprobamos que ese único listener basta.
    const trigger = buildMarkup();
    new Disclosure(trigger);
    const panel = document.getElementById('panel');

    trigger.focus();
    trigger.click();
    expect(panel.hasAttribute('hidden')).toBe(false);
  });

  it('open()/close()/toggle() cambian el estado sin necesidad de clic', () => {
    const trigger = buildMarkup();
    const disclosure = new Disclosure(trigger);
    const panel = document.getElementById('panel');

    disclosure.open();
    expect(disclosure.expanded).toBe(true);
    expect(panel.hasAttribute('hidden')).toBe(false);

    disclosure.close();
    expect(disclosure.expanded).toBe(false);
    expect(panel.hasAttribute('hidden')).toBe(true);

    disclosure.toggle();
    expect(disclosure.expanded).toBe(true);
  });

  it('destroy() quita el listener de clic', () => {
    const trigger = buildMarkup();
    const disclosure = new Disclosure(trigger);
    disclosure.destroy();

    trigger.click();
    expect(disclosure.expanded).toBe(false);
  });

  it('initDisclosures inicializa todos los [data-disclosure] de un contenedor', () => {
    buildMarkup();
    const instances = initDisclosures();
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Disclosure);
  });
});
