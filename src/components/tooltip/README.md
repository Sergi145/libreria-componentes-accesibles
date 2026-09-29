# Tooltip

Información breve que aparece al enfocar o pasar el ratón por un
disparador. Nunca recibe el foco y no debe contener elementos
enfocables. Implementa el patrón [WAI-ARIA APG — Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

El marcado va siempre en el HTML — este componente no genera nada por
JS —: un envoltorio `.c-tooltip` con el disparador y, justo después,
el propio texto en un `<span role="tooltip">`, enlazado con
`aria-describedby` (texto complementario) o `aria-labelledby` (el
propio nombre accesible del disparador — ver «Sin doble lectura»).

## Uso

```html
<link rel="stylesheet" href="tooltip.css" />

<span class="c-tooltip">
  <button type="button" data-tooltip aria-describedby="tooltip-guardar">
    Guardar
  </button>
  <span role="tooltip" id="tooltip-guardar" class="c-tooltip__bubble">
    Atajo: Ctrl + S
  </span>
</span>
```

```js
import { initTooltips } from './tooltip.js';

// Inicializa cada [data-tooltip] de la página.
initTooltips();
```

O de forma manual con la clase `Tooltip`:

```js
import { Tooltip } from './tooltip.js';

new Tooltip(document.querySelector('[data-tooltip]'), { delay: 300 });
```

## Comportamiento

- **Foco**: lo muestra al momento; perder el foco lo oculta al
  momento.
- **Ratón**: lo muestra tras `delay` ms (300 por defecto) para evitar
  parpadeos al pasar el cursor de camino a otro sitio. Si el ratón sale
  antes de que se cumpla el plazo, no llega a mostrarse.
- **Hoverable (WCAG 1.4.13)**: el ratón puede moverse del disparador a
  la propia burbuja sin que se oculte — el listener escucha en todo el
  envoltorio `.c-tooltip`, no solo en el disparador.
- **`Escape`** lo oculta sin mover el foco (WCAG 1.4.13: descartable).
  Solo intercepta `Escape` mientras el tooltip está visible, así que no
  interfiere con nada más el resto del tiempo (p. ej. con el `Escape`
  de un Modal si el tooltip está cerrado).
- **Sin doble lectura**: en un botón solo icono, en vez de duplicar el
  texto en `aria-label` y comparar cadenas por JS (el truco de la
  ficha), usa `aria-labelledby` apuntando directo al
  `<span role="tooltip">` — una sola fuente del texto. Un elemento
  referenciado por `aria-labelledby` cuenta como nombre accesible, así
  que el botón tiene nombre desde el principio, no solo mientras se
  muestra el tooltip.
  Ver «Variante: botón solo icono» más abajo.

## Posición

Por defecto se coloca debajo, centrado. Tres modificadores piden otro
lado:

| Clase                       | Posición pedida     |
| --------------------------- | ------------------- |
| _(ninguno)_                 | Abajo (por defecto) |
| `.c-tooltip__bubble--top`   | Arriba              |
| `.c-tooltip__bubble--start` | Al inicio (lateral) |
| `.c-tooltip__bubble--end`   | Al final (lateral)  |

`--start`/`--end` usan propiedades lógicas, así que un `dir="rtl"` en
la página los invierte automáticamente.

### Colocación automática

Al mostrarse, el tooltip comprueba que su lado pedido no queda cortado
y, si lo está, prueba los demás (primero el opuesto, luego los
laterales) con [`placeFloating`](../../utils/placement.js). «Cortado»
significa fuera del viewport **o** fuera de un contenedor con
`overflow` distinto de `visible` (el cuerpo de un Modal, una caja con
scroll…). Si ningún lado cabe, usa el que menos se sale.

- El lado elegido queda en `data-placement` (y en el modificador de
  clase correspondiente en la burbuja).
- Se calcula **al mostrarse**: no se recoloca al hacer scroll ni al
  redimensionar con el tooltip ya visible.
- Un ancestro con `overflow: hidden` que no deja sitio en ningún lado
  seguirá cortando el tooltip: dale espacio o mueve el tooltip fuera.

## Variante: disparador deshabilitado

Un `<button disabled>` no puede recibir foco ni eventos de ratón, así
que no puede disparar un tooltip por sí mismo. Envuélvelo en un
`<span tabindex="0">` y engancha el tooltip a ese `<span>`, no al
botón:

```html
<span class="c-tooltip">
  <span tabindex="0" data-tooltip aria-describedby="tooltip-continuar">
    <button type="button" disabled>Continuar</button>
  </span>
  <span role="tooltip" id="tooltip-continuar" class="c-tooltip__bubble">
    Completa el formulario para continuar
  </span>
</span>
```

## Accesibilidad

- **`role="tooltip"` + `aria-describedby`**: el vínculo es explícito en
  el HTML, no lo añade el JS. **El tooltip no lleva `hidden`**: se oculta
  solo visualmente (CSS) y se muestra con `data-visible`. Con `hidden`
  quitado en el mismo evento de foco, NVDA + Chrome no anunciaba la
  descripción al tabular; con el texto siempre en el árbol de
  accesibilidad sí. El lector de pantalla lee la descripción tras el
  nombre al enfocar; no anuncia la aparición visual del tooltip.
- **Nunca pongas controles dentro del tooltip** (enlaces, botones…): no
  puede recibir el foco, así que serían inalcanzables por teclado. Si
  necesitas contenido interactivo, usa [`Popover`](../popover) o
  [`Modal`](../modal) en su lugar.
- **No pongas información esencial solo en el tooltip**: en pantallas
  táctiles no hay "hover", así que puede no llegar a verse nunca.
- **El disparador debe ser un elemento enfocable e interactivo**
  (`<button>`, o el envoltorio `tabindex="0"` de la variante
  deshabilitada) — nunca un `<span>` o `<i>` sueltos.

## Pruebas manuales recomendadas

- Enfocar el disparador con `Tab`: el tooltip aparece al momento.
- Pasar el ratón: el tooltip tarda un instante en aparecer, y no
  aparece si el ratón solo pasa de largo.
- Con el tooltip visible, mover el ratón hacia la propia burbuja sin
  que desaparezca.
- Pulsar `Escape` con el tooltip visible: desaparece y el foco no se
  mueve.
- Con NVDA/VoiceOver, comprobar que el botón solo icono no repite el
  texto dos veces.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 15 (Tooltip) de la
guía.

**«Lo que te toca a ti»**:

- _Inicializar los tooltips (son opt-in)_: `initTooltips()` los conecta
  por `[data-tooltip]`.
- _Ponerlos solo en elementos enfocables e interactivos_: documentado
  en «Accesibilidad»; la variante deshabilitada usa el envoltorio
  `tabindex="0"` en vez del propio botón.
- _Comprobar que se cierran con `Escape` y que el ratón puede pasar al
  tooltip sin que desaparezca_: los dos están implementados y cubiertos
  por tests (ver «Comportamiento»).
- _No poner información esencial solo en el tooltip_: advertido en
  «Accesibilidad».

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Tooltip en un `<i>` o `<span>` sin foco — los ejemplos de
  `tooltip.html` siempre usan un `<button>` o un envoltorio
  `tabindex="0"`.
- Tooltips con enlaces o botones dentro — el `role="tooltip"` de los
  ejemplos solo contiene texto.
- `data-bs-trigger="hover"` únicamente — aquí el foco siempre lo
  muestra, con o sin ratón.
