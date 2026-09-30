# Carousel

Carrusel de diapositivas con botones Anterior/Siguiente y un selector de
diapositivas. Implementa el patrón
[WAI-ARIA APG — Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
en su variante con pestañas.

## Uso

```html
<link rel="stylesheet" href="carousel.css" />

<section
  class="c-carousel"
  aria-roledescription="carrusel"
  aria-label="Destacados"
  data-carousel
>
  <div class="c-carousel__controls" data-carousel-controls hidden>
    <button
      class="c-carousel__button"
      aria-label="Diapositiva anterior"
      data-carousel-prev
    >
      …
    </button>
    <button
      class="c-carousel__button"
      aria-label="Diapositiva siguiente"
      data-carousel-next
    >
      …
    </button>
    <div
      class="c-carousel__tabs"
      role="tablist"
      aria-label="Diapositivas"
      data-carousel-tablist
    >
      <button
        class="c-carousel__tab"
        role="tab"
        aria-label="Diapositiva 1"
        aria-selected="true"
        aria-controls="slide-1"
      >
        <span class="c-carousel__dot" aria-hidden="true"></span>
      </button>
      …
    </div>
  </div>
  <div class="c-carousel__slides" aria-live="polite" data-carousel-slides>
    <div
      class="c-carousel__slide"
      role="tabpanel"
      id="slide-1"
      aria-roledescription="diapositiva"
      aria-label="1 de 3"
      data-carousel-slide
    >
      …
    </div>
    …
  </div>
</section>
```

Ver `carousel.html` para el marcado completo (con el botón de rotación).

```js
import { Carousel, initCarousels } from './carousel.js';

const carousel = new Carousel(document.querySelector('[data-carousel]'));
carousel.next();
carousel.goTo(2);

// O, para inicializar todos los que lleven data-carousel:
initCarousels();
```

## Rotación automática

Solo con `data-autoplay` en la `<section>` (y `data-interval="3000"` para
cambiar los 5000 ms por defecto):

```html
<section
  class="c-carousel"
  data-carousel
  data-autoplay
  data-interval="4000"
  …
></section>
```

```js
const carousel = new Carousel(el, { interval: 4000 });
carousel.pause(); // detiene hasta llamar a play()
carousel.play();
carousel.playing; // true si está activada (aunque esté en pausa temporal)
```

- **Botón de rotación**, el primero del carrusel en el DOM. Alterna su
  `aria-label` entre «Detener rotación automática» e «Iniciar rotación
  automática» y cambia de icono (pausa / play).
- **Pausa temporal**: el ratón encima o el foco dentro detienen la
  rotación, que se reanuda al salir. No cambia el nombre del botón.
- **Pausa permanente**: el botón «Detener rotación automática». No se
  reanuda sola, ni al salir el ratón ni el foco; hay que pulsar «Iniciar».
- **`aria-live`**: `off` mientras rota, para que cada cambio no se anuncie
  encima de lo que el usuario está leyendo; `polite` cuando no rota (por
  cualquier motivo), para anunciar los cambios manuales.
- **`prefers-reduced-motion: reduce`**: no arranca sola. El botón aparece
  como «Iniciar rotación automática» y el usuario decide. Los cambios de
  diapositiva tampoco se animan.
- **Pulsar «Iniciar» con el foco o el ratón dentro** anula las pausas
  temporales: si no, el botón parecería no hacer nada.
- **WCAG 2.2.2 (Pausar, detener, ocultar)**: el contenido que se mueve
  solo durante más de 5 s debe poderse pausar. Por eso la rotación es
  opt-in, tiene botón visible y se detiene con foco y ratón.

## Imágenes

Cada diapositiva puede llevar una imagen (`c-carousel__media`, a todo el
ancho y en 16:9) y un pie con título y texto (`c-carousel__caption`).
`carousel.html` usa las tres ilustraciones de `img/` (SVG); en `dist/`
la carpeta `img/` se copia junto al `.html`.

```html
<div class="c-carousel__slide" role="tabpanel" … data-carousel-slide>
  <img
    class="c-carousel__media"
    src="img/slide-1.svg"
    alt="Ilustración de montañas violetas bajo un cielo al amanecer"
    width="640"
    height="360"
  />
  <div class="c-carousel__caption">
    <h3 class="c-carousel__title">Bienvenida</h3>
    <p>Descubre los componentes accesibles de la librería.</p>
  </div>
</div>
```

- **`alt` describe lo que se ve**, no repite el título del pie. Si la imagen
  es solo decorativa (el pie ya lo dice todo), usa `alt=""`.
- **Indica `width` y `height`** para reservar el espacio y evitar saltos de
  maquetación al cargar.
- **Las imágenes de las diapositivas ocultas se cargan igualmente**: la
  carga diferida (`loading="lazy"`) queda fuera del SPEC 03.
- **Texto en la imagen**: evita meter texto dentro de la imagen; si es
  imprescindible, repítelo en el `alt` o en el pie.

## Dependencias

`carousel.js` importa `../../utils/roving-tabindex.js` (Vite lo empaqueta
en `dist/carousel/carousel.js`; si copias la carpeta a otro proyecto,
copia también esa utilidad). No usa `Tabs`.

## Accesibilidad

- **`<section>` con `aria-roledescription="carrusel"` y `aria-label`**: el
  lector anuncia «Destacados, carrusel». El nombre dice qué contiene.
- **Imágenes con `alt` descriptivo** y el texto en el pie, no dentro de la imagen (ver «Imágenes»).
- **Diapositivas como `role="tabpanel"`** con
  `aria-roledescription="diapositiva"` y `aria-label="N de M"`: el lector
  dice «1 de 3, diapositiva».
- **Orden de los controles en el DOM y en pantalla**: botón de rotación
  (cuando exista), Anterior, Siguiente y selector; después, las
  diapositivas. El foco sigue el orden visual.
- **Selector de diapositivas** (`role="tablist"`): una sola parada de Tab
  (roving tabindex); ← → / Inicio / Fin mueven el foco y **muestran la
  diapositiva** (activación automática). Cada pestaña lleva
  `aria-label="Diapositiva N"` y `aria-controls`.
- **Anterior / Siguiente** dan la vuelta en los extremos y **no mueven el
  foco** (siguen sobre el botón pulsado).
- **`aria-live="polite"`** en el contenedor de diapositivas: el lector
  anuncia el contenido nuevo al cambiar con un control.
- **La pestaña activa no se distingue solo por el color**: punto lleno
  frente a anillo vacío.
- **Objetivos táctiles**: botones de 2.5 rem y pestañas de al menos 24×24
  px (WCAG 2.5.8).
- **Foco visible**: anillo `--color-focus-ring` con `:focus-visible`.
- **Mejora progresiva**: sin JS, los controles están `hidden` y todas las
  diapositivas se ven apiladas; el contenido sigue siendo accesible.
- **Rotación automática opt-in**, con botón Play/Pausa, pausa por foco y
  ratón, y sin arrancar con movimiento reducido (ver «Rotación automática»).
- **Movimiento**: el fundido entre diapositivas se desactiva con
  `prefers-reduced-motion: reduce`.

## Pruebas manuales recomendadas

- Solo con teclado: Tab pasa por Anterior, Siguiente y **una sola vez**
  por el selector; ← → cambian de diapositiva; el anillo de foco es
  visible en todos los controles.
- Con NVDA/VoiceOver: comprobar que se anuncia «Destacados, carrusel»,
  «1 de 3, diapositiva» y que, al pulsar Siguiente, se lee la diapositiva
  nueva.
- Con rotación automática: comprobar que al enfocar un control o poner
  el ratón encima se detiene; que «Detener rotación automática» la para
  para siempre; y que con «Reducir movimiento» en el sistema no arranca.
- Desactivar JavaScript: deben verse todas las diapositivas y ningún
  control.
- 320 px y zoom al 400 %: los controles deben envolver sin scroll
  horizontal.

## Conformidad con la guía

Revisión frente a la ficha de Carousel de la guía. Nota: el PDF no está en
el repositorio, así que esta lista recoge los puntos que el SPEC 03 toma
de la ficha.

**«Lo que te toca a ti»**:

- _Rol y descripción del carrusel y de las diapositivas_:
  `aria-roledescription` en español y `aria-label` con «N de M».
- _Controles con nombre accesible_: todos llevan `aria-label` en español.
- _Selector como pestañas con foco gestionado_: `tablist` + roving
  tabindex.
- _Región viva_: `aria-live="polite"`; con rotación automática, `off`
  mientras rota.
- _Mejora progresiva_: contenido visible sin JS.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Imagen de diapositiva sin `alt` o con `alt` que repite el título — cada
  imagen tiene un `alt` propio que describe la ilustración.
- Puntos del selector que son `<span>` clicables sin teclado — son
  `<button role="tab">`.
- Botones solo con icono sin nombre — todos tienen `aria-label`.
- `aria-live="assertive"` — se usa `polite`.
- Diapositivas ocultas solo con `opacity` — se ocultan con `hidden`.
