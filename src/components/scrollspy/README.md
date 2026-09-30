# Scrollspy

Tabla de contenidos que resalta el enlace de la sección que se está
leyendo. No tiene patrón APG propio: es un `<nav>` de enlaces internos
cuyo enlace activo lleva `aria-current="true"`.

## Uso

```html
<link rel="stylesheet" href="scrollspy.css" />

<nav class="c-scrollspy" aria-label="En esta página" data-scrollspy>
  <ul class="c-scrollspy__list">
    <li><a class="c-scrollspy__link" href="#introduccion">Introducción</a></li>
    <li><a class="c-scrollspy__link" href="#uso">Uso</a></li>
  </ul>
</nav>

<section id="introduccion">…</section>
<section id="uso">…</section>
```

```js
import { Scrollspy, initScrollspies } from './scrollspy.js';

const spy = new Scrollspy(document.querySelector('[data-scrollspy]'));
spy.active; // el <a> con aria-current="true", o null

// Otra línea de referencia (p. ej. con una cabecera fija de 80 px):
new Scrollspy(nav, { rootMargin: '-80px 0px -50% 0px' });

// Si las secciones están en un contenedor con scroll propio:
new Scrollspy(nav, { root: document.querySelector('.panel') });

// O, para inicializar todos los que lleven data-scrollspy:
initScrollspies();
```

Crea el `Scrollspy` **después** de que las secciones existan en el
documento: busca cada destino con `document.getElementById`. Los enlaces
cuyo `href="#id"` no apunta a nada se ignoran.

## Dependencias

Ninguna, salvo los tokens de `src/tokens/tokens.css`.

## Accesibilidad

- **`<nav>` con nombre** (`aria-label="En esta página"`), distinto del de
  otras navegaciones de la página, para que el lector las distinga.
- **`aria-current="true"`** en el enlace de la sección actual, y solo en
  uno a la vez. Es un estado, no una notificación.
- **Nunca mueve el foco ni anuncia nada.** No hay `aria-live`: que la
  sección cambie al hacer scroll es contexto, y anunciarlo interrumpiría la
  lectura. Los usuarios de lector de pantalla encuentran el enlace actual
  al recorrer el `<nav>`.
- **Detección con `IntersectionObserver`**, no con el evento `scroll`: sin
  listeners síncronos en cada desplazamiento ni cálculos de posición. El
  enlace activo es el de la **primera** sección visible (en el orden de los
  enlaces); «visible» significa «alguna parte dentro de la zona observada»,
  y esa zona es una **banda fina**: una línea de referencia al 20 % desde
  arriba (`rootMargin: '-20% 0px -79% 0px'`). Solo la sección que cruza esa
  línea es la actual. Con una zona ancha, al pulsar un enlace asomaba una
  franja de la sección anterior (por el `scroll-margin`) y quedaba
  resaltada la sección equivocada.
- **La última sección tiene que llegar a la línea de referencia.** Si es
  muy corta y la página se acaba antes, su parte superior nunca alcanza el
  20 % de arriba y su enlace no se activa. Dale una altura mínima (p. ej.
  `min-block-size: 100vh`) o espacio debajo, o ajusta `rootMargin`.
- **Entre dos secciones** (ninguna en la zona), se conserva el último enlace
  activo: la tabla de contenidos no se queda en blanco.
- **Funciona dentro de un `<iframe>`.** Por defecto observa respecto al
  documento del propio `<nav>`, no al de la ventana superior (que es lo que
  hace un `IntersectionObserver` sin `root` dentro de un iframe, y dejaría
  la línea del 20 % fuera de la página incrustada).
- **Sin `IntersectionObserver`**, no hace nada: los enlaces siguen
  funcionando, solo sin resaltado.
- **El resaltado no depende solo del color**: el enlace activo va en
  negrita y con una barra a su inicio, además del color de marca.
- **Enlaces de al menos 24 px de alto** (WCAG 2.5.8) y anillo de foco
  `--color-focus-ring` con `:focus-visible`.
- **Movimiento**: la transición del resaltado se desactiva con
  `prefers-reduced-motion: reduce`.
- Con una **cabecera fija**, da a las secciones un `scroll-margin-top`
  para que el enlace no las deje tapadas al saltar (WCAG 2.4.11).

## Pruebas manuales recomendadas

- Desplázate con la rueda y con las teclas: el enlace resaltado debe ir
  cambiando a la vez que las secciones, con una sola marca a la vez.
- Pulsa un enlace: la página salta a su sección y el enlace queda
  resaltado; el foco no se mueve solo.
- Con NVDA/VoiceOver, recorre el `<nav>`: el enlace actual se lee como
  «actual» (o equivalente) y **no** se anuncia nada al hacer scroll.
- Navega solo con teclado: Tab por los enlaces, con el anillo de foco
  visible; Enter salta a la sección.
- 320 px y zoom al 400 %: la tabla de contenidos no debe desbordar.

## Conformidad con la guía

Revisión frente a la ficha de Scrollspy de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el SPEC 03
toma de la ficha.

**«Lo que te toca a ti»**:

- _Un `<nav>` con nombre_: `aria-label="En esta página"`.
- _Indicar la sección actual con `aria-current`_: `aria-current="true"`,
  solo en un enlace.
- _No anunciar ni mover el foco al hacer scroll_: nunca lo hace.
- _No depender solo del color_: negrita + barra.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `aria-live` en la tabla de contenidos: el lector interrumpe la lectura
  en cada scroll — no hay `aria-live`.
- Mover el foco al enlace activo — no se mueve.
- Escuchar el evento `scroll` sin control — se usa `IntersectionObserver`.
- Marcar varios enlaces a la vez — solo uno.
