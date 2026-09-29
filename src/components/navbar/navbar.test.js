import { describe, it, expect, beforeEach } from 'vitest';
import { Navbar, initNavbars } from './navbar.js';

function buildMarkup() {
  document.body.innerHTML = `
    <nav aria-label="Principal" data-navbar>
      <a class="c-navbar__brand" href="/">
        <img src="logo.svg" alt="Sitio — Inicio" />
      </a>
      <button type="button" class="c-navbar__toggle"
        aria-controls="navbar-menu" aria-expanded="false" aria-label="Menú">
      </button>
      <div class="c-navbar__menu" id="navbar-menu" hidden>
        <ul class="c-navbar__list">
          <li><a class="c-navbar__link" href="/" aria-current="page">Inicio</a></li>
          <li><a class="c-navbar__link" href="/servicios">Servicios</a></li>
        </ul>
      </div>
    </nav>
  `;
  return document.querySelector('[data-navbar]');
}

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lanza un error si no recibe un elemento', () => {
    expect(() => new Navbar(null)).toThrow();
  });

  it('el botón hamburguesa alterna aria-expanded y el hidden del menú (vía Disclosure)', () => {
    const el = buildMarkup();
    new Navbar(el);
    const toggle = el.querySelector('.c-navbar__toggle');
    const menu = document.getElementById('navbar-menu');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.hasAttribute('hidden')).toBe(false);

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('hidden')).toBe(true);
  });

  it('el enlace activo lleva aria-current="page"', () => {
    const el = buildMarkup();
    new Navbar(el);
    const active = el.querySelector('[aria-current="page"]');
    expect(active.textContent).toBe('Inicio');
  });

  it('destroy() quita el listener del botón hamburguesa', () => {
    const el = buildMarkup();
    const navbar = new Navbar(el);
    navbar.destroy();

    const toggle = el.querySelector('.c-navbar__toggle');
    const menu = document.getElementById('navbar-menu');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.hasAttribute('hidden')).toBe(true);
  });

  it('funciona sin .c-navbar__toggle (navbar sin menú móvil)', () => {
    document.body.innerHTML = '<nav aria-label="Principal" data-navbar></nav>';
    const el = document.querySelector('[data-navbar]');
    expect(() => new Navbar(el)).not.toThrow();
  });

  it('initNavbars inicializa todos los [data-navbar] de un contenedor', () => {
    buildMarkup();
    const instances = initNavbars();
    expect(instances).toHaveLength(1);
    expect(instances[0]).toBeInstanceOf(Navbar);
  });
});
