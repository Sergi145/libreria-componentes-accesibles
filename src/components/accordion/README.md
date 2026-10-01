# Accordion

Lista de secciones colapsables. Implementa el patrón
[WAI-ARIA APG — Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

## Uso

```html
<link rel="stylesheet" href="accordion.css" />
<!-- Copia el markup de accordion.html: cada cabecera es un <h3><button>
     con aria-expanded/aria-controls, seguida del panel como <section>
     con aria-labelledby apuntando a la cabecera (un <section> con
     nombre accesible ya expone el rol "region" de forma nativa, sin
     necesidad de role="region" explícito). -->
```

```js
import { Accordion } from './accordion.js';

new Accordion(document.querySelector('[data-accordion]'), {
  allowMultiple: true, // false = solo un panel abierto a la vez
});
```

## Sin JavaScript

Si no se ejecuta `accordion.js`, retira los atributos `hidden` del HTML
de partida (o usa `<details>/<summary>` como alternativa nativa) para que
el contenido siga siendo legible.

## Variante nativa con `<details>`/`<summary>` (sin JS)

Si no necesitas la navegación con flechas, usa `<details>` y `<summary>`
con las clases `c-accordion__item` y `c-accordion__summary` (ver el
segundo bloque de `accordion.html`). No hace falta `accordion.js`:

- El navegador guarda el estado en el atributo `open`, abre y cierra con
  `Enter`/`Espacio` y el lector anuncia «expandido/contraído».
- Un mismo `name` en varios `<details>` deja **un solo panel abierto**
  (acordeón exclusivo nativo). Sin `name`, se abren varios a la vez.
- El triángulo por defecto se oculta y el estado se indica con el mismo
  icono girado que la variante con JS.

Limitaciones frente a la variante con JS:

- **Sin navegación por encabezados**: no metas un `<h3>` dentro del
  `<summary>`; algunos lectores tratan su contenido como presentacional
  y el encabezado se pierde. Si la página necesita encabezados, usa la
  variante con JS.
- **Sin `↑`/`↓`/`Home`/`End`** entre cabeceras: solo `Tab`.
- `name` exclusivo requiere navegadores recientes (Chrome 120, Safari
  17.2, Firefox 130); en los antiguos simplemente se pueden abrir varios.
- **NVDA anuncia una posición equivocada si hay más de un acordeón nativo
  en la misma página** (p. ej. «botón contraído 1 de 6» en vez de «1 de
  3»): Chrome no expone `posinset`/`setsize` para `<summary>` (comprobado
  con el árbol de accesibilidad vía DevTools Protocol: el nodo solo lleva
  `focusable` y `expanded`), así que NVDA calcula esa cifra por su cuenta
  contando **todos** los `<summary>` del documento, sin respetar ningún
  límite entre grupos. Un encabezado delante de cada acordeón **no lo
  arregla**: se probó en la página Docs de Storybook, donde cada historia
  nativa ya lleva su propio `<h3>` delante, y NVDA las sigue contando
  juntas. No hay un arreglo de marcado conocido; es una limitación de
  NVDA con este rol, no un error de esta implementación. Si tu página
  tiene un solo acordeón nativo (el caso normal), no ocurre. Para
  auditarlo con NVDA, prueba cada historia por separado
  (`?path=/story/...`, no `/docs/...`): ahí cada una cuenta bien «1 de 3».

## Accesibilidad

- **Cabecera semántica**: el `<button>` va dentro de un encabezado
  (`<h2>`–`<h6>`, el que corresponda a la jerarquía de la página), para
  que se pueda navegar por encabezados con el lector de pantalla.
- **`aria-expanded`**: en el trigger, refleja si el panel está abierto;
  el JS lo mantiene sincronizado con el atributo `hidden` del panel.
- **`aria-controls` / `aria-labelledby`**: enlazan trigger ↔ panel en
  ambas direcciones.
- **Teclado**: `Tab` mueve el foco entre triggers en el orden del DOM;
  `Espacio`/`Enter` alterna el panel; `↑`/`↓` mueven el foco entre
  triggers con envoltura; `Home`/`End` van al primero/último.
- **Rol de región**: cada panel es un `<section aria-labelledby="…">`;
  al tener nombre accesible, expone el rol "region" de forma nativa. Si
  hay muchos paneles, considera quitar el `<section>` (usar `<div>`) en
  favor de no saturar la lista de regiones del lector de pantalla
  (indicación del propio patrón APG).

## Pruebas manuales recomendadas

- Navegar solo con teclado: `Tab`, `↑`/`↓`, `Home`/`End`, `Espacio`.
- Con NVDA/VoiceOver, confirmar que se anuncia "expandido/contraído" al
  activar cada trigger.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 01 (Acordeón) de la
guía. No se ha añadido nada al código: ya cumplía todos los puntos.

**«Lo que te toca a ti»** (lo que el framework de referencia de la ficha
no resuelve solo):

- _Ajustar el nivel de encabezado a la jerarquía real de la página_: la
  ficha avisa de que su propio ejemplo usa `<h2>` sin pensar en el
  contexto. Aquí `accordion.html` usa `<h3>` y lo documenta como el
  nivel "que corresponda", no como un valor fijo.
- _Añadir `id` al botón y `role="region"` + `aria-labelledby` al panel_:
  el botón ya tiene `id`; en vez de `role="region"` explícito se usa
  `<section aria-labelledby="…">`, que expone el mismo rol "region" de
  forma nativa al tener nombre accesible (ver «Rol de región» arriba) —
  incluida la misma advertencia de la ficha de evitarlo con muchos
  paneles.
- _Implementar `Inicio`/`Fin` (opcional según la APG)_: implementado.
- _Marcar en el HTML inicial si el primer panel se muestra abierto_:
  `accordion.html` trae el primer panel con `aria-expanded="true"` y sin
  `hidden`; el estado inicial no depende de que se ejecute el JS.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Poner el disparador en el encabezado o en un `<div>` en vez de en un
  `<button>` — aquí el `<button>` siempre va dentro del encabezado.
- Usar `<a href="#">` como cabecera (se anunciaría como enlace, no como
  botón) — se usa `<button type="button">`.
- Icono de flecha como único indicador de estado — el icono lleva
  `aria-hidden="true"` y solo seguimiento visual; el indicador real es
  `aria-expanded`, que un lector de pantalla anuncia con independencia
  del icono.

**No aplica**: `aria-disabled="true"` en el botón — la ficha lo marca
como opcional para "un panel que no se puede cerrar". Esta
implementación permite cerrar cualquier panel en cualquier momento,
incluido el único abierto en modo `allowMultiple: false`, así que no hay
ningún trigger que deba quedar deshabilitado.
