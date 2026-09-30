# Card

Tarjeta de contenido, solo CSS: un `<article>` con imagen opcional,
título y texto. Incluye una variante en la que **toda la
tarjeta es clicable** con un único enlace. No tiene patrón APG propio.

## Uso

```html
<link rel="stylesheet" href="card.css" />

<!-- Tarjeta básica -->
<article class="c-card">
  <img class="c-card__media" src="…" alt="" width="640" height="360" />
  <div class="c-card__body">
    <div class="c-card__title">Guía de accesibilidad</div>
    <p class="c-card__text">Resumen de los patrones WAI-ARIA.</p>
  </div>
</article>

<!-- Tarjeta entera clicable -->
<article class="c-card c-card--link">
  <img class="c-card__media" src="…" alt="" width="640" height="360" />
  <div class="c-card__body">
    <div class="c-card__title">
      <a class="c-card__link" href="/articulo">Novedades de la versión 2</a>
    </div>
    <p class="c-card__text">Lo que cambia en los componentes de feedback.</p>
  </div>
</article>
```

## Dependencias

Ninguna, salvo los tokens de `src/tokens/tokens.css`. La historia «Con
badge» usa además `../badge/badge.css`.

## Accesibilidad

- **`<article>` con un título en un `<div>`**: la tarjeta es un
  `<article>`, pero su título **no es un encabezado**, así que no aparece
  en la navegación por encabezados de los lectores de pantalla (la tecla
  `H` en NVDA). Es una decisión de diseño: con muchas tarjetas, una lista
  de encabezados repetitivos no ayuda. Si quieres que cada tarjeta se
  encuentre por encabezados, cambia el `<div class="c-card__title">` por
  un `<h2>`, `<h3>`… (el nivel que continúe la jerarquía de la página);
  el CSS es el mismo.
- **Imagen**: `alt=""` si es decorativa (lo normal cuando el título ya
  describe el contenido); un `alt` descriptivo si aporta información.
- **Tarjeta clicable con UN solo enlace.** El `<a>` va dentro del título y
  su `::after` (posición absoluta, `inset: 0`) cubre la tarjeta entera.
  Resultado:
  - una sola parada de Tab;
  - el nombre accesible del enlace es solo el título (no todo el
    contenido de la tarjeta);
  - un clic en cualquier punto de la tarjeta navega.
- **No envuelvas toda la tarjeta en un `<a>`**: el nombre accesible sería
  el contenido completo, largo y confuso.
- **Foco**: el anillo (`--color-focus-ring`, con `:focus-visible`) se
  dibuja alrededor de toda la tarjeta, hacia dentro para que
  `overflow: hidden` no lo recorte.
- **No anides otros controles en una tarjeta clicable.** El `::after` del
  enlace tapa la tarjeta y los enlaces o botones de dentro dejarían de
  recibir clics. Si es imprescindible, elévalos con `position: relative;
z-index: 1`; pero entonces la tarjeta ya no es «un solo control» y
  conviene preguntarse si no es mejor una tarjeta normal con un enlace
  explícito («Leer más»).
- **Movimiento**: la transición del hover se desactiva con
  `prefers-reduced-motion: reduce`.
- **Contraste**: borde (`--color-border`) y texto cumplen el mínimo en
  claro y en oscuro; el texto secundario usa `--color-text-muted`.

## Pruebas manuales recomendadas

- Con teclado: Tab debe detenerse **una sola vez** en la tarjeta clicable
  y el anillo debe rodearla entera; Enter navega.
- Con NVDA/VoiceOver: el enlace se lee con el texto del título
  («Novedades de la versión 2, enlace»), no con todo el contenido.
- Clic con ratón en la imagen, en el texto y en el borde: navega en todos
  los casos.
- Selección de texto con el ratón en la tarjeta clicable: puede resultar
  incómoda por el `::after`; es una limitación conocida de esta técnica.
- Zoom al 400 % y modo oscuro.

## Conformidad con la guía

Revisión frente a la ficha de Card de la guía. Nota: el PDF no está en el
repositorio, así que esta lista recoge los puntos que el SPEC 03 toma de
la ficha.

**«Lo que te toca a ti»**:

- _Un encabezado por tarjeta con el nivel adecuado_: **no se cumple por
  decisión de diseño**: el título es un `<div>`. Si se necesita, se cambia
  por un `<h2>`, `<h3>`… (ver «Accesibilidad»).
- _`alt` correcto en la imagen_: `alt=""` en las decorativas.
- _Tarjeta clicable sin envolver todo en un enlace_: enlace único en el
  título con `::after` estirado.
- _Foco visible_: anillo alrededor de toda la tarjeta.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Toda la tarjeta dentro de un `<a>` — el nombre accesible sería
  enorme; aquí el enlace solo envuelve el título.
- Varios enlaces que apuntan al mismo destino en una tarjeta — hay uno.
- Imagen decorativa con `alt` redundante — `alt=""`.
