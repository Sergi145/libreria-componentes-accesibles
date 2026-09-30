# Navbar

Barra de navegación principal: landmark de navegación con nombre, botón
_disclosure_ para el menú móvil (la hamburguesa) e indicación de página
actual. Implementa la combinación de patrones
[Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) +
[Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) que
describe la ficha de Navbar de la guía.

## Uso

```html
<link rel="stylesheet" href="../skip-link/skip-link.css" />
<link rel="stylesheet" href="navbar.css" />

<a class="c-skip-link" href="#contenido">Saltar al contenido principal</a>

<header>
  <nav class="c-navbar" aria-label="Principal" data-navbar>
    <a class="c-navbar__brand" href="/">
      <img src="logo.svg" alt="Nombre del sitio — Inicio" height="32" />
    </a>

    <button
      type="button"
      class="c-navbar__toggle"
      aria-controls="navbar-menu"
      aria-expanded="false"
      aria-label="Menú"
    >
      <svg
        class="c-navbar__toggle-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        …
      </svg>
    </button>

    <div class="c-navbar__menu" id="navbar-menu" hidden>
      <ul class="c-navbar__list">
        <li>
          <a class="c-navbar__link" href="/" aria-current="page">Inicio</a>
        </li>
        <li><a class="c-navbar__link" href="/servicios">Servicios</a></li>
      </ul>
    </div>
  </nav>
</header>

<main id="contenido" tabindex="-1">
  <h1>Título de la página</h1>
</main>
```

```js
import { Navbar, initNavbars } from './navbar.js';

new Navbar(document.querySelector('[data-navbar]'));
// O, para inicializar todos los que haya en la página:
initNavbars();
```

`navbar.js` importa `Disclosure` de `src/utils/disclosure.js` para el
botón hamburguesa: copiar solo la carpeta `navbar/` sin esa utilidad rompe
el import en `src`. El build de `dist/navbar/navbar.js` es autónomo, porque
Vite empaqueta `Disclosure` dentro.

## Ancho de escritorio

A partir de 768px el menú se muestra siempre (CSS) y el botón
hamburguesa desaparece. El estado de `aria-expanded`/`hidden` que
gestiona `Disclosure` sigue cambiando por debajo del capó, pero deja de
tener efecto visual: no hace falta ninguna lógica extra en JS para eso.

## Accesibilidad

- **`<nav aria-label="Principal">`**: landmark con nombre — obligatorio
  si la página tiene más de un `<nav>` (si no, todos aparecerían como
  "navegación" sin distinguirse en la lista de landmarks del lector de
  pantalla).
- **`alt` del logotipo**: dice a dónde lleva el enlace ("Inicio"), no
  solo el nombre del sitio.
- **`aria-label="Menú"`** en el botón hamburguesa: su icono es
  puramente visual (`aria-hidden="true"`), así que sin este `aria-label`
  el botón no tendría nombre accesible.
- **`aria-current="page"`** en el enlace activo, con un indicador visual
  que no depende solo del color (aquí, negrita además del color de
  acento) — mantén el mismo orden de navegación en todas las páginas
  (WCAG 2.2 SC 3.2.3).
- **Enlace de salto antes del `<nav>`**: ver
  [`skip-link`](../skip-link), que debe ser el primer elemento enfocable
  de la página.
- **Objetivo táctil**: el botón hamburguesa mide 24×24px como mínimo.
- **Reflow**: comprobado a 320px de ancho (WCAG 2.2 SC 1.4.10) — ver la
  historia «Reflow a 320px» en Storybook.

## Pruebas manuales recomendadas

- A menos de 768px: navegar con `Tab` hasta el botón hamburguesa,
  activarlo con `Espacio`/`Enter` y comprobar que el menú aparece/
  desaparece.
- A 320px de ancho (o zoom 400%), comprobar que no aparece scroll
  horizontal.
- Con NVDA/VoiceOver, comprobar que se anuncia "navegación, Principal" y
  que el enlace activo se identifica como página actual.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 12 (Navbar) de la
guía.

**«Lo que ya hace Bootstrap»** (contexto: el toggler es un `<button>`
que alterna `aria-expanded`; los ejemplos oficiales ya incluyen
`aria-current="page"` y `aria-label` en el toggler, aunque en inglés).

**«Lo que te toca a ti»**:

- _Enlace de salto, nombre del `<nav>`, textos en español_:
  implementado — el ejemplo de uso incluye [`skip-link`](../skip-link)
  antes del `<nav>`, `aria-label="Principal"` en español y todos los
  textos del componente en español.
- _`alt` del logotipo que diga a dónde lleva (normalmente «Inicio»)_:
  implementado en el ejemplo (`alt="Nombre del sitio — Inicio"`).
- _Mantener el mismo orden de navegación en todas las páginas (WCAG
  2.2 SC 3.2.3)_: responsabilidad de quien use el componente (el orden
  de `.c-navbar__list` en el HTML es el que se mantiene entre
  páginas); documentado aquí para que no se pierda al copiarlo.
- _Comprobar el reflow a 320px / zoom 400% (WCAG 1.4.10)_: cubierto por
  la historia «Reflow a 320px» de Storybook, auditada con axe en
  `e2e/accessibility.spec.js`.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Varios `<nav>` sin nombre: en la lista de landmarks aparecerían
  todos como "navegación", indistinguibles entre sí — este `<nav>`
  siempre lleva `aria-label="Principal"`.
- `role="menubar"` en la navegación de un sitio web: ese rol es para
  barras de menú de aplicación (con flechas, activación de
  acciones...), no para enlaces de navegación normales — `Navbar` no
  usa ningún rol de menú.
