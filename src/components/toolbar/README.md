# Toolbar

Agrupa varios controles relacionados (por ejemplo, los botones de una
barra de herramientas de edición) en una sola parada de `Tab`. Implementa
el patrón [WAI-ARIA APG — Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

## Uso

```html
<link rel="stylesheet" href="toolbar.css" />

<div
  class="c-toolbar"
  role="toolbar"
  aria-label="Formato de texto"
  data-toolbar
>
  <div class="c-toolbar__group" role="group" aria-label="Estilo de texto">
    <button type="button" class="c-toolbar__item" aria-pressed="false">
      Negrita
    </button>
    <button type="button" class="c-toolbar__item" aria-pressed="false">
      Cursiva
    </button>
  </div>
  <div class="c-toolbar__group" role="group" aria-label="Alineación">
    <button type="button" class="c-toolbar__item">Izquierda</button>
    <button type="button" class="c-toolbar__item">Derecha</button>
  </div>
</div>
```

```js
import { Toolbar, initToolbars } from './toolbar.js';

new Toolbar(document.querySelector('[data-toolbar]'));
// O, para inicializar todos los que haya en la página:
initToolbars();
```

Los botones con `aria-pressed` (como "Negrita"/"Cursiva" del ejemplo) no
alternan su estado por sí solos: `Toolbar` solo gestiona el foco
compartido. Combínalos con [`ToggleButton`](../button) si necesitas que
el clic alterne `aria-pressed`.

## ¿Cuándo NO necesitas un toolbar?

Si solo tienes dos o tres botones sueltos y no necesitas moverte entre
ellos con las flechas, no hace falta `role="toolbar"` ni roving
tabindex: basta un contenedor con `role="group"` y `aria-label` (o
ningún rol, si el agrupamiento visual ya es suficiente). El patrón
toolbar existe para cuando hay _muchos_ controles relacionados y quieres
que `Tab` los atraviese en una sola parada en vez de una por control.

## Accesibilidad

- **`role="toolbar"` + `aria-label`** en el contenedor: nombra el
  conjunto completo.
- **`role="group"` + `aria-label`** en cada subgrupo: los subgrupos NO
  son paradas de `Tab` aparte ni cambian la navegación por flechas, solo
  dan nombre a conjuntos relacionados dentro del toolbar (por ejemplo,
  para que un lector de pantalla anuncie "grupo, Alineación" al entrar
  en esa zona).
- **Teclado**: `Tab`/`Shift+Tab` entran y salen del toolbar en una sola
  parada. `→`/`↓` (según la orientación) mueven el foco al siguiente
  control _de todo el toolbar_, cruzando subgrupos, con envoltura.
  `Home`/`End` van al primer/último control de todo el toolbar.
- **Orientación**: por defecto horizontal (`→`/`←`); pon
  `aria-orientation="vertical"` en el contenedor para que las flechas
  pasen a ser `↓`/`↑` — `toolbar.js` lee ese mismo atributo, así que no
  hace falta configurarlo también en JS.
- **Objetivo táctil**: cada `.c-toolbar__item` mide al menos 24×24px.
- **Patrón de referencia**: [WAI-ARIA APG — Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

## Pruebas manuales recomendadas

- Navegar solo con teclado: `Tab` hasta el toolbar, `→`/`←` (o `↓`/`↑` en
  la variante vertical) entre todos sus controles, `Home`/`End` al
  primero/último, `Tab` de nuevo para salir del toolbar.
- Con NVDA/VoiceOver, comprobar que se anuncia "barra de herramientas,
  Formato de texto" al entrar, y el nombre de cada grupo al recorrerlo.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 05 (Grupos de
botones y barra de herramientas) de la guía.

**«Lo que ya hace Bootstrap»** (contexto: `.btn-toolbar`/`.btn-group`
solo aportan estilos y ejemplos con `role="group"`/`role="toolbar"` +
`aria-label`, sin nada de teclado).

**«Lo que te toca a ti»**:

- _Añadir los roles y nombres (en español)_: implementado —
  `role="toolbar"` + `aria-label` en el contenedor, `role="group"` +
  `aria-label` en cada subgrupo, todo en español en `toolbar.html`.
- _Implementar el roving tabindex y las flechas si usas
  `role="toolbar"`: si no, el rol promete un comportamiento que no
  existe_: implementado con `rovingTabindex()` (ver
  `src/utils/roving-tabindex.js`), incluida la envoltura y cruzando
  subgrupos.
- _Si solo hay 2 botones, basta con `role="group"` y `Tab` normal_:
  documentado en «¿Cuándo NO necesitas un toolbar?» más arriba.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="toolbar"` sin navegación por flechas — aquí siempre va
  acompañado de `rovingTabindex()`.
- Grupo sin `aria-label` — los dos subgrupos del ejemplo («Estilo de
  texto», «Alineación») lo llevan.
