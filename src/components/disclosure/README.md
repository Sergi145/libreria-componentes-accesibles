# Disclosure

Botón que muestra u oculta un bloque de contenido asociado. Implementa
el patrón [WAI-ARIA APG — Disclosure (Show/Hide)](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

## Uso

```html
<link rel="stylesheet" href="disclosure.css" />

<button
  type="button"
  class="c-disclosure__trigger"
  aria-expanded="false"
  aria-controls="mas-info"
  data-disclosure
>
  <svg
    class="c-disclosure__icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    …
  </svg>
  Más información
</button>
<div class="c-disclosure__panel" id="mas-info" hidden>
  <p>Contenido adicional.</p>
</div>
```

```js
import { Disclosure, initDisclosures } from './disclosure.js';

new Disclosure(document.querySelector('[data-disclosure]'));
// O, para inicializar todos los que haya en la página:
initDisclosures();
```

## Sin JavaScript: `<details>`/`<summary>`

Si no necesitas gestionar el estado desde JS (por ejemplo, no hay que
sincronizarlo con nada más de la página), usa el elemento nativo
`<details>`/`<summary>` en vez de este componente: el navegador ya
resuelve el toggle, el estado expandido/colapsado y el foco, sin
JavaScript ni ARIA:

```html
<details>
  <summary>Más información</summary>
  <p>Contenido adicional.</p>
</details>
```

Usa `Disclosure` en su lugar cuando necesites un control visual que no
sea `<summary>` (por ejemplo, un botón con icono dentro de una barra),
animar la apertura con JS, o sincronizar el estado con otro componente
de la página. `Navbar` lo usa así para su botón de menú hamburguesa.

## Accesibilidad

- **`aria-expanded`** en el trigger: refleja si el panel está visible.
  El estado inicial se lee del HTML (`disclosure.js` no lo fuerza), así
  que cárgalo ya correcto en el marcado; si falta el atributo, se asume
  `"false"`.
- **`aria-controls`** apunta al `id` del panel.
- **`hidden`** en el panel: `disclosure.js` lo mantiene sincronizado con
  `aria-expanded` en cada cambio.
- **Teclado**: `Espacio`/`Enter` activan el trigger de forma nativa (es
  un `<button>`); `disclosure.js` solo escucha `click`, no añade ningún
  listener de teclado propio.
- **Objetivo táctil**: el trigger mide al menos 24×24px de alto.
- **Patrón de referencia**: [WAI-ARIA APG — Disclosure (Show/Hide)](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

## Pruebas manuales recomendadas

- Activar el trigger con `Espacio` y con `Enter` y comprobar que el panel
  aparece/desaparece en ambos casos.
- Con NVDA/VoiceOver, comprobar que se anuncia "expandido"/"contraído" al
  activar el trigger.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 07 (Collapse —
mostrar/ocultar) de la guía. El patrón APG equivalente que cita la
ficha es Disclosure (Show/Hide), el mismo que usa este componente.

**«Lo que ya hace Bootstrap»** (contexto: `.collapse` alterna
`aria-expanded`/`.collapsed` en todos los disparadores del mismo
objetivo y oculta el contenido con `display:none`).

**«Lo que te toca a ti»**:

- _Usar `<button>` como disparador (Bootstrap admite `<a>`, pero
  entonces necesita `role="button"`)_: `disclosure.html` usa siempre
  `<button type="button">`, sin alternativa de enlace.
- _No cambiar el texto del botón y además `aria-expanded` de forma
  contradictoria («Ocultar» + `expanded=false`)_: el texto del trigger
  del ejemplo («Más información») no depende del estado; solo
  `aria-expanded` y el icono cambian.
- _Para navegación desplegable: disclosure + lista de enlaces, no
  `role="menu"`_: documentado en el README de `Navbar`, que reutiliza
  este componente para su menú móvil.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Disparador sin `aria-expanded` en el HTML inicial — `disclosure.js`
  asume `"false"` si falta, pero el HTML de referencia siempre lo
  incluye explícito.
- Ocultar con `opacity: 0` o fuera de pantalla — se usa `hidden`, que
  saca el contenido del árbol de accesibilidad y del orden de
  tabulación por completo.
