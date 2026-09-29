# Breadcrumb

Lista de enlaces a las páginas padre de la actual, en orden jerárquico.
Implementa el patrón
[WAI-ARIA APG — Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

## Uso

```html
<link rel="stylesheet" href="breadcrumb.css" />

<nav aria-label="Ruta de navegación">
  <ol class="c-breadcrumb">
    <li class="c-breadcrumb__item"><a href="/">Inicio</a></li>
    <li class="c-breadcrumb__item"><a href="/servicios/">Servicios</a></li>
    <li class="c-breadcrumb__item" aria-current="page">Trámites en línea</li>
  </ol>
</nav>
```

Solo CSS: no requiere JavaScript. El separador (`/`) lo pinta
`::before` en CSS — **no lo escribas como texto en el HTML**, o cada
separador se anunciará como contenido en el lector de pantalla.

## Accesibilidad

- **`<nav aria-label="Ruta de navegación">`**: landmark de navegación
  con nombre propio, distinto de la navegación principal (`Navbar`). Si
  copias este componente, traduce el `aria-label` al idioma de tu sitio.
- **`<ol>`**: al ser una lista ordenada, el lector de pantalla anuncia
  "lista, N elementos" y la posición de cada uno.
- **`aria-current="page"`** en el último elemento: es la página actual,
  así que **no lleva enlace** (un enlace a la propia página confunde:
  parece llevar a otro sitio). Si necesitas que apunte a algo, usa un
  enlace con `aria-current="page"`, pero para la ruta de navegación
  habitual, texto plano basta.
- **Separadores solo en CSS**: escribirlos como texto (`/`, `>`) hace
  que se lean en voz alta entre cada enlace.
- **Objetivo táctil**: los enlaces de un breadcrumb son texto dentro de
  una frase/lista de navegación, el mismo caso que cubre la excepción
  "inline" de WCAG 2.2 SC 2.5.8 — no necesitan el mínimo de 24×24px que
  sí exigimos a los botones.
- **Patrón de referencia**: [WAI-ARIA APG — Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

## Pruebas manuales recomendadas

- Navegar con `Tab`: cada enlace es una parada; el elemento actual no lo
  es (no tiene enlace).
- Con NVDA/VoiceOver, comprobar que los separadores no se anuncian como
  contenido, y que el último elemento se identifica como "página actual"
  o equivalente.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 03 (Migas de pan) de
la guía.

**«Lo que ya hace Bootstrap»** (contexto: marcado con `<nav>` + `<ol>`
y separadores generados por CSS; sus ejemplos ya usan
`aria-current="page"`).

**«Lo que te toca a ti»**:

- _Traducir `aria-label="breadcrumb"` a algo significativo en
  español_: implementado — `aria-label="Ruta de navegación"`.
- _Si cambias el separador por un SVG, asegúrate de que sigue siendo
  decorativo_: no aplica — este componente mantiene el separador como
  `::before` generado por CSS (un carácter `/`), no un SVG.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Escribir «>» o «/» como texto entre enlaces — el separador vive solo
  en `breadcrumb.css` (`::before`), nunca en el HTML.
- Enlazar la página actual sin `aria-current` — el último elemento
  siempre lleva `aria-current="page"`.
