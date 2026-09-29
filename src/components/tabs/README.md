# Tabs

Conjunto de pestañas que muestran un panel de contenido cada vez, en la
misma página. Implementa el patrón
[WAI-ARIA APG — Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Uso

```html
<link rel="stylesheet" href="tabs.css" />

<div class="c-tabs">
  <div
    class="c-tabs__list"
    role="tablist"
    aria-label="Datos del perfil"
    data-tabs
  >
    <button
      type="button"
      class="c-tabs__tab"
      id="tab-datos"
      role="tab"
      aria-selected="true"
      aria-controls="panel-datos"
    >
      Datos personales
    </button>
    <button
      type="button"
      class="c-tabs__tab"
      id="tab-seguridad"
      role="tab"
      aria-selected="false"
      aria-controls="panel-seguridad"
    >
      Seguridad
    </button>
  </div>

  <div
    class="c-tabs__panel"
    id="panel-datos"
    role="tabpanel"
    aria-labelledby="tab-datos"
    tabindex="0"
  >
    <p>…</p>
  </div>
  <div
    class="c-tabs__panel"
    id="panel-seguridad"
    role="tabpanel"
    aria-labelledby="tab-seguridad"
    tabindex="0"
    hidden
  >
    <p>…</p>
  </div>
</div>
```

```js
import { Tabs, initTabs } from './tabs.js';

new Tabs(document.querySelector('[data-tabs]'));
// Activación manual: mover el foco no selecciona, hace falta clic o
// Enter/Espacio.
new Tabs(document.querySelector('[data-tabs]'), { activation: 'manual' });

// O, para inicializar todos los que haya en la página (misma opción
// para todos):
initTabs();
```

## Automática vs. manual

- **Automática** (por defecto): mover el foco con las flechas ya
  selecciona la pestaña y muestra su panel. Úsala si los paneles ya
  están en el DOM y cambiar de uno a otro es instantáneo.
- **Manual**: mover el foco solo mueve el foco; hace falta pulsar
  `Enter`/`Espacio` (o clicar) para seleccionar. Úsala si cambiar de
  panel tiene un coste (por ejemplo, carga sus datos por red) y no
  quieres disparar esa carga solo por recorrer las pestañas con las
  flechas. La carga diferida en sí (pedir los datos al seleccionar) no
  la resuelve este componente: `Tabs` solo decide _cuándo_ se considera
  seleccionada una pestaña.

## Pestañas vs. navegación entre páginas

Si tus "pestañas" en realidad son enlaces a URLs distintas (cada una
carga una página nueva), **no uses este componente ni roles de
pestaña**: eso es navegación, no un widget de pestañas. Usa un `<nav>`
con enlaces normales y `aria-current="page"` en el activo:

```html
<nav aria-label="Secciones de la cuenta">
  <a href="/cuenta" aria-current="page">Resumen</a>
  <a href="/cuenta/pagos">Pagos</a>
</nav>
```

Poner `role="tablist"`/`role="tab"` en una navegación real entre páginas
es uno de los errores más frecuentes de este patrón: un lector de
pantalla dejaría de anunciar esos enlaces como enlaces.

## Accesibilidad

- **`role="tablist"` + `aria-label`** en el contenedor de pestañas.
- **`role="tab"`** en cada `<button>`, con `aria-selected` y
  `aria-controls` (id del panel).
- **`role="tabpanel"` + `aria-labelledby` + `tabindex="0"`** en cada
  panel: el `tabindex="0"` es necesario para poder llegar a él con `Tab`
  aunque no tenga contenido enfocable propio.
- **Teclado**: `Tab` entra en la pestaña activa; el siguiente `Tab` va
  directo a su panel (las pestañas inactivas tienen `tabindex="-1"`).
  `→`/`←` (`↓`/`↑` en vertical) mueven el foco entre pestañas, con
  envoltura. `Home`/`End` van a la primera/última.
- **Orientación**: por defecto horizontal; pon `aria-orientation="vertical"`
  en el `role="tablist"` para que las flechas pasen a ser `↓`/`↑` —
  `tabs.js` lee ese mismo atributo. Añade también la clase
  `.c-tabs--vertical` al contenedor `.c-tabs` para el layout (pestañas a
  la izquierda, panel a la derecha).
- **Objetivo táctil**: cada `.c-tabs__tab` mide al menos 24×24px de alto.
- **Patrón de referencia**: [WAI-ARIA APG — Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Pruebas manuales recomendadas

- Navegar solo con teclado: `Tab` hasta la pestaña activa, `→`/`←` (o
  `↓`/`↑` en vertical) entre pestañas, `Home`/`End`, `Tab` de nuevo para
  entrar en el panel.
- Con activación manual, comprobar que las flechas no cambian el panel
  visible hasta pulsar `Enter`/`Espacio`.
- Con NVDA/VoiceOver, comprobar que se anuncia "pestaña, seleccionada" o
  "pestaña" según el estado, y el nombre del panel al entrar en él.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 11 (Pestañas — navs
& tabs) de la guía.

**«Lo que ya hace Bootstrap»** (contexto: gestiona `aria-selected`,
`tabindex="-1"` en las inactivas y, desde Bootstrap 5.3, las flechas y
`Home`/`End` con activación automática).

**«Lo que te toca a ti»**:

- _Escribir todos los roles, ids, `aria-controls`/`aria-labelledby` y
  `tabindex="0"` en los paneles_: implementado en `tabs.html`.
- _Poner nombre al `tablist`_: `aria-label="Datos del perfil"` en el
  ejemplo de referencia.
- _Si los paneles cargan por AJAX, valorar activación manual (requiere
  JS propio)_: implementado como opción (`{ activation: 'manual' }`),
  documentado en «Automática vs. manual» más arriba.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Usar roles de pestaña en una navegación entre páginas — documentado
  explícitamente en «Pestañas vs. navegación entre páginas», con el
  marcado correcto (`<nav>` + `aria-current="page"`) como alternativa.
- Pestañas como `<a href="#">` sin `role="tab"` — aquí son siempre
  `<button role="tab">`.
- Poner un dropdown dentro de un `tablist` — fuera de alcance de este
  componente (Dropdown va en el spec 02).
