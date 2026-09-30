import { describe, it, expect, beforeEach } from 'vitest';
import { CheckboxGroup, initCheckboxGroups } from './checkbox.js';

function group({ parentChecked = false, childrenChecked = [] } = {}) {
  document.body.innerHTML = `
    <fieldset data-checkbox-group>
      <legend>Notificaciones</legend>
      <input type="checkbox" id="padre" data-checkbox-parent ${parentChecked ? 'checked' : ''} />
      <input type="checkbox" id="hija-1" ${childrenChecked[0] ? 'checked' : ''} />
      <input type="checkbox" id="hija-2" ${childrenChecked[1] ? 'checked' : ''} />
      <input type="checkbox" id="hija-3" ${childrenChecked[2] ? 'checked' : ''} />
    </fieldset>
  `;
  return document.querySelector('[data-checkbox-group]');
}

describe('CheckboxGroup', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('con ninguna hija marcada, el padre queda sin marcar', () => {
    const cg = new CheckboxGroup(group());

    expect(cg.state).toBe('unchecked');
    expect(document.getElementById('padre').checked).toBe(false);
    expect(document.getElementById('padre').indeterminate).toBe(false);
  });

  it('con todas las hijas marcadas, el padre queda marcado', () => {
    const cg = new CheckboxGroup(
      group({ childrenChecked: [true, true, true] })
    );

    expect(cg.state).toBe('checked');
    expect(document.getElementById('padre').checked).toBe(true);
    expect(document.getElementById('padre').indeterminate).toBe(false);
  });

  it('con algunas hijas marcadas, el padre queda mixto', () => {
    const cg = new CheckboxGroup(
      group({ childrenChecked: [true, false, false] })
    );

    expect(cg.state).toBe('mixed');
    expect(document.getElementById('padre').checked).toBe(false);
    expect(document.getElementById('padre').indeterminate).toBe(true);
  });

  it('el estado inicial sale del HTML, sin esperar a ninguna interacción', () => {
    // Estado mixto ya escrito en el marcado antes de construir.
    const cg = new CheckboxGroup(
      group({ childrenChecked: [true, false, true] })
    );

    expect(cg.state).toBe('mixed');
  });

  it('activar el padre en estado mixto marca todas las hijas', () => {
    new CheckboxGroup(group({ childrenChecked: [true, false, false] }));
    const parent = document.getElementById('padre');
    expect(parent.indeterminate).toBe(true);

    parent.click();

    expect(parent.checked).toBe(true);
    expect(parent.indeterminate).toBe(false);
    expect(document.getElementById('hija-1').checked).toBe(true);
    expect(document.getElementById('hija-2').checked).toBe(true);
    expect(document.getElementById('hija-3').checked).toBe(true);
  });

  it('activar el padre con todas marcadas las desmarca todas', () => {
    new CheckboxGroup(group({ childrenChecked: [true, true, true] }));
    const parent = document.getElementById('padre');

    parent.click();

    expect(parent.checked).toBe(false);
    expect(document.getElementById('hija-1').checked).toBe(false);
    expect(document.getElementById('hija-2').checked).toBe(false);
    expect(document.getElementById('hija-3').checked).toBe(false);
  });

  it('desmarcar una hija tras "todas" pasa el padre a mixto', () => {
    const cg = new CheckboxGroup(
      group({ childrenChecked: [true, true, true] })
    );
    expect(cg.state).toBe('checked');

    document.getElementById('hija-2').click();

    expect(cg.state).toBe('mixed');
    expect(document.getElementById('padre').checked).toBe(false);
    expect(document.getElementById('padre').indeterminate).toBe(true);
  });

  it('el padre tiene aria-controls con los ids de las hijas', () => {
    new CheckboxGroup(group());

    expect(document.getElementById('padre').getAttribute('aria-controls')).toBe(
      'hija-1 hija-2 hija-3'
    );
  });

  it('no escribe aria-checked en el padre: el navegador expone el estado mixto', () => {
    new CheckboxGroup(group({ childrenChecked: [true, false, false] }));

    expect(document.getElementById('padre').hasAttribute('aria-checked')).toBe(
      false
    );
  });

  it('el constructor lanza un error si no hay [data-checkbox-parent]', () => {
    document.body.innerHTML = `<fieldset data-checkbox-group></fieldset>`;
    expect(
      () => new CheckboxGroup(document.querySelector('[data-checkbox-group]'))
    ).toThrow();
  });

  it('destroy() quita los listeners: activar el padre ya no sincroniza las hijas', () => {
    const cg = new CheckboxGroup(group());
    cg.destroy();

    document.getElementById('padre').click();

    expect(document.getElementById('hija-1').checked).toBe(false);
  });
});

describe('initCheckboxGroups', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inicializa todos los [data-checkbox-group] de un contenedor', () => {
    document.body.innerHTML = `
      <fieldset data-checkbox-group>
        <input type="checkbox" id="a-padre" data-checkbox-parent />
        <input type="checkbox" id="a-hija" />
      </fieldset>
      <fieldset data-checkbox-group>
        <input type="checkbox" id="b-padre" data-checkbox-parent />
        <input type="checkbox" id="b-hija" />
      </fieldset>
    `;

    const groups = initCheckboxGroups();

    expect(groups).toHaveLength(2);
    expect(groups[0]).toBeInstanceOf(CheckboxGroup);
  });
});
