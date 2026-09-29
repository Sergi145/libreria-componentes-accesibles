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
