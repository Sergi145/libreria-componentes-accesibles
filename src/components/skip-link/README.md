# Skip link

Enlace de salto: oculto hasta que recibe el foco, permite ir directo al
contenido principal sin recorrer con `Tab` toda la cabecera y la
navegación. Resuelve WCAG 2.2 SC 2.4.1 "Bypass Blocks". Referencia:
capítulo 2 de la guía, técnica `.visually-hidden-focusable`.

## Uso

```html
<link rel="stylesheet" href="skip-link.css" />

<body>
  <a class="c-skip-link" href="#contenido">Saltar al contenido principal</a>

  <header>...</header>
  <nav aria-label="Principal">...</nav>

  <main id="contenido" tabindex="-1">
    <h1>Título de la página</h1>
    ...
  </main>
</body>
```

Solo CSS: no requiere JavaScript. El navegador ya mueve el foco al
`<main>` al activar el enlace, gracias al `href="#contenido"` +
`id="contenido"`.

## Dónde colocarlo

- Debe ser el **primer elemento enfocable de la página**: va antes de
  la cabecera y la navegación **en el DOM**, no solo visualmente (un
  `order` o posición CSS no cambia el orden de tabulación).
- El destino (`<main id="contenido">`) necesita `tabindex="-1"`: un
  `<main>` no es focable de forma nativa, así que sin `tabindex="-1"`
  el navegador movería el scroll pero no el foco, y el lector de
  pantalla seguiría anunciando el resto de la página como si no
  hubieras saltado nada.

## Accesibilidad

- **Oculto con `clip`, no con `display:none`/`hidden`**: así sigue en
  el orden de tabulación y un lector de pantalla lo anuncia al llegar a
  él; `display:none`/`hidden` lo quitarían por completo.
- **Visible con `:focus`** (no solo `:focus-visible`): un enlace de
  salto tiene que aparecer siempre que tenga el foco, incluida una
  llamada programática a `.focus()`, no solo cuando el navegador infiere
  que el foco vino del teclado.
- **Contraste**: fondo `--color-primary-600` con texto blanco, los
  mismos tokens ya verificados para el botón primario (≥ 4.5:1 en claro
  y en oscuro).
- **Un solo enlace de salto suele bastar**; si la página tiene varios
  landmarks relevantes (contenido, búsqueda...), pueden añadirse varios
  enlaces seguidos al principio del `<body>`.

## Pruebas manuales recomendadas

- Cargar la página y pulsar `Tab` una sola vez: el enlace de salto debe
  ser lo primero que recibe el foco y debe hacerse visible.
- Activarlo (`Enter`) y comprobar que el foco (no solo el scroll) pasa
  al `<main>`: con NVDA/VoiceOver, el siguiente `Tab` debe moverse desde
  dentro del contenido principal, no desde la cabecera.

## Conformidad con la guía

La guía no dedica una ficha numerada propia a «skip link»: aparece
como técnica en el capítulo 1 («Cómo ocultar contenido correctamente»,
`.visually-hidden-focusable`) y, ya aplicado, en la ficha 12 (Navbar).

**Capítulo 1 — técnica `.visually-hidden-focusable`** («Visible al
recibir foco», para «Enlaces "Saltar al contenido"»): implementado —
`skip-link.css` usa `clip` (no `display:none`/`hidden`) para que el
enlace siga en el orden de tabulación y se revele con `:focus`.

**Ficha 12 (Navbar) — «Lo que te toca a ti»**:

- _Enlace de salto, nombre del `<nav>`, textos en español_: la parte
  de enlace de salto es exactamente este componente, en español
  («Saltar al contenido principal»); el nombre del `<nav>` es
  responsabilidad de `Navbar`, que combina los dos.

**Errores frecuentes**: la guía no lista ninguno específico de este
control — los suyos, bajo la ficha de Navbar, son sobre `<nav>` sin
nombre y `role="menubar"`, que no aplican a un enlace de salto.

**Detalle no cubierto explícitamente por la guía, añadido aquí**: usar
`:focus` en vez de `:focus-visible` (ver «Accesibilidad» más arriba) —
necesario para que el enlace se revele también ante un `.focus()`
programático, no solo ante foco por teclado.
