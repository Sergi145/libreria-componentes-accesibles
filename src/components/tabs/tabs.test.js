import { describe, it, expect, beforeEach } from 'vitest';
import { Tabs, initTabs } from './tabs.js';

function buildMarkup({ orientation = 'horizontal' } = {}) {
  const orientationAttr =
    orientation === 'vertical' ? 'aria-orientation="vertical"' : '';
  document.body.innerHTML = `
    <div class="c-tabs__list" role="tablist" aria-label="Datos del perfil" data-tabs ${orientationAttr}>
      <button type="button" id="tab1" role="tab" aria-selected="true" aria-controls="panel1">Uno</button>
      <button type="button" id="tab2" role="tab" aria-selected="false" aria-controls="panel2">Dos</button>
      <button type="button" id="tab3" role="tab" aria-selected="false" aria-controls="panel3">Tres</button>
    </div>
    <div id="panel1" role="tabpanel" aria-labelledby="tab1" tabindex="0"><p>Contenido 1</p></div>
    <div id="panel2" role="tabpanel" aria-labelledby="tab2" tabindex="0" hidden><p>Contenido 2</p></div>
    <div id="panel3" role="tabpanel" aria-labelledby="tab3" tabindex="0" hidden><p>Contenido 3</p></div>
  `;
  return document.querySelector('[data-tabs]');
}

function press(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('Tabs', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Tabs(null)).toThrow();
  });

  it('estado inicial: respeta aria-selected="true" ya presente en el HTML', () => {
    const el = buildMarkup();
    new Tabs(el);

    expect(document.getElementById('tab1').getAttribute('tabindex')).toBe('0');
    expect(document.getElementById('tab2').getAttribute('tabindex')).toBe('-1');
    expect(document.getElementById('panel1').hasAttribute('hidden')).toBe(
      false
    );
    expect(document.getElementById('panel2').hasAttribute('hidden')).toBe(true);
  });

  it('activación automática: → mueve el foco y selecciona la siguiente pestaña', () => {
    const el = buildMarkup();
    new Tabs(el);
    const [tab1, tab2] = ['tab1', 'tab2'].map((id) =>
      document.getElementById(id)
    );
    const [panel1, panel2] = ['panel1', 'panel2'].map((id) =>
      document.getElementById(id)
    );

    tab1.focus();
    press(tab1, 'ArrowRight');

    expect(document.activeElement).toBe(tab2);
    expect(tab2.getAttribute('aria-selected')).toBe('true');
    expect(panel2.hasAttribute('hidden')).toBe(false);
    expect(tab1.getAttribute('aria-selected')).toBe('false');
    expect(panel1.hasAttribute('hidden')).toBe(true);
  });

  it('activación manual: → mueve el foco sin cambiar aria-selected; Enter selecciona', () => {
    const el = buildMarkup();
    new Tabs(el, { activation: 'manual' });
    const [tab1, tab2] = ['tab1', 'tab2'].map((id) =>
      document.getElementById(id)
    );
    const [panel1, panel2] = ['panel1', 'panel2'].map((id) =>
      document.getElementById(id)
    );

    tab1.focus();
    press(tab1, 'ArrowRight');

    expect(document.activeElement).toBe(tab2);
    expect(tab2.getAttribute('aria-selected')).toBe('false');
    expect(panel2.hasAttribute('hidden')).toBe(true);
    expect(tab1.getAttribute('aria-selected')).toBe('true');

    // Enter/Espacio en un <button> nativo dispara "click"; jsdom no
    // sintetiza ese click automáticamente, así que lo disparamos para
    // comprobar la activación manual (el mismo camino que usa el ratón).
    tab2.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(tab2.getAttribute('aria-selected')).toBe('true');
    expect(panel2.hasAttribute('hidden')).toBe(false);
    expect(tab1.getAttribute('aria-selected')).toBe('false');
    expect(panel1.hasAttribute('hidden')).toBe(true);
  });

  it('orientación horizontal (por defecto): ArrowRight/ArrowLeft mueven el foco', () => {
    const el = buildMarkup();
    new Tabs(el);
    const [tab1, tab2] = ['tab1', 'tab2'].map((id) =>
      document.getElementById(id)
    );

    tab1.focus();
    press(tab1, 'ArrowDown');
    expect(document.activeElement).toBe(tab1);

    press(tab1, 'ArrowRight');
    expect(document.activeElement).toBe(tab2);
  });

  it('orientación vertical: ArrowDown/ArrowUp mueven el foco', () => {
    const el = buildMarkup({ orientation: 'vertical' });
    new Tabs(el);
    const [tab1, tab2] = ['tab1', 'tab2'].map((id) =>
      document.getElementById(id)
    );

    tab1.focus();
    press(tab1, 'ArrowRight');
    expect(document.activeElement).toBe(tab1);

    press(tab1, 'ArrowDown');
    expect(document.activeElement).toBe(tab2);
  });

  it('Home/End van a la primera y última pestaña', () => {
    const el = buildMarkup();
    new Tabs(el);
    const [tab1, tab3] = ['tab1', 'tab3'].map((id) =>
      document.getElementById(id)
    );

    tab1.focus();
    press(tab1, 'End');
    expect(document.activeElement).toBe(tab3);

    press(tab3, 'Home');
    expect(document.activeElement).toBe(tab1);
  });

  it('la pestaña activa tiene tabindex="0" y su panel también, para que Tab lleve al panel', () => {
    const el = buildMarkup();
    new Tabs(el);

    const tab1 = document.getElementById('tab1');
    const tab2 = document.getElementById('tab2');
    const panel1 = document.getElementById('panel1');

    expect(tab1.getAttribute('tabindex')).toBe('0');
    expect(tab2.getAttribute('tabindex')).toBe('-1');
    expect(panel1.getAttribute('tabindex')).toBe('0');
  });

  it('select() activa una pestaña por índice o por referencia', () => {
    const el = buildMarkup();
    const tabs = new Tabs(el);
    const tab3 = document.getElementById('tab3');
    const panel3 = document.getElementById('panel3');

    tabs.select(2);

    expect(tab3.getAttribute('aria-selected')).toBe('true');
    expect(panel3.hasAttribute('hidden')).toBe(false);
  });

  it('destroy() quita los listeners', () => {
    const el = buildMarkup();
    const tabs = new Tabs(el);
    tabs.destroy();

    const tab1 = document.getElementById('tab1');
    const tab2 = document.getElementById('tab2');

    tab1.focus();
    press(tab1, 'ArrowRight');
    expect(document.activeElement).toBe(tab1);

    tab2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(tab2.getAttribute('aria-selected')).toBe('false');
  });

  it('initTabs inicializa todos los [data-tabs] de un contenedor', () => {
    buildMarkup();
    const instances = initTabs();
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Tabs);
  });
});
