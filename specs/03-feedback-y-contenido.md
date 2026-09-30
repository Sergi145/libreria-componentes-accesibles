# SPEC 03 — Feedback y contenido

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-30
> **Objetivo:** Crear la utilidad compartida de regiones vivas y los componentes de feedback y contenido de la guía (Alert, Toast, Progress, Spinner, Placeholder, Carousel, Card, Badge y Scrollspy).

## Por qué existe este spec

Es el tercero de los 5 specs en los que se reparte `guia-componentes-accesibles-aria-bootstrap5.pdf` (ver la tabla del SPEC 01).
Cubre las fichas de Alert, Toast, Progress, Spinner, Placeholder, Carousel, Card, Badge y Scrollspy.

Casi todos estos componentes comunican un cambio sin mover el foco: un mensaje que aparece, una carga que avanza, una diapositiva que cambia.
El problema común es anunciarlo al lector de pantalla sin ruido y sin perder el mensaje.
El SPEC 01 dejó pendiente el «anunciador de regiones vivas» para el spec que lo usara primero: es este.
El fallo más frecuente es insertar la región viva a la vez que su texto (no se anuncia), así que la utilidad mantiene regiones persistentes en el DOM.

## Alcance

**Dentro:**

- Utilidad `src/utils/live-region.js` con sus tests: dos regiones persistentes (`role="status"` y `role="alert"`) y la función `announce()`.
- **Alert**: alerta con `role` según su variante (`alert` en `warning` y `danger`, `status` en `info` y `success`), variante descartable con botón de cierre y gestión del foco, y función `showAlert()` que inserta una alerta con su `role` y se anuncia sola. Cuatro variantes (`info`, `success`, `warning`, `danger`) con icono y prefijo de texto oculto, no solo color.
- **Toast**: función `showToast()` que crea el toast en un contenedor `.c-toast-region` y lo anuncia con `announce()`, y clase `Toast` para toasts escritos en el HTML. Ocultación automática opcional con pausa por hover y por foco.
- **Progress**: `<progress>` nativo con `<label>`, estilado con CSS, estado indeterminado sin `value`, y clase JS opcional que actualiza el valor y anuncia al completar.
- **Spinner**: solo CSS, `role="status"` con texto oculto «Cargando…».
- **Placeholder**: solo CSS, bloques con `aria-hidden="true"` y `aria-busy="true"` en el contenedor.
- **Carousel**: patrón APG Carousel en su variante con pestañas: botón de rotación, Anterior/Siguiente, selector `tablist` con `rovingTabindex` y rotación automática opcional.
- **Card**: solo CSS, `<article>` con título (un `<div>`, no un encabezado) y variante de tarjeta entera clicable con un único enlace.
- **Badge**: solo CSS, con texto oculto que da contexto al número o la etiqueta.
- **Scrollspy**: `IntersectionObserver` que marca con `aria-current="true"` el enlace de la sección visible en un `<nav aria-label>`.
- Cada componente nuevo se añade a la auditoría axe de `e2e/accessibility.spec.js` y a la tabla «Componentes disponibles» del `README.md` raíz.

**Fuera de alcance (para specs futuros):**

- Todos los componentes de los specs 04–05.
- Atajo de teclado (F6 o similar) para saltar a la región de toasts.
- Cola o límite de toasts visibles a la vez.
- Anuncio automático de los cambios de un Badge (contador vivo). El README remite a `announce()`.
- Carousel con varias diapositivas visibles a la vez, gestos táctiles (swipe) y carga diferida de imágenes.
- Barra de progreso apilada (varias barras en una).
- Desplazamiento suave de Scrollspy (`scroll-behavior`) y cambio de la URL al hacer scroll.
- Rejillas o grupos de Card (`card-group`, masonry).
- Generador de ids: los ids van escritos en el marcado de referencia.
- Añadir Bootstrap o cualquier dependencia de ejecución.

## Modelo de datos

Este spec no introduce estado persistente.
Introduce estas APIs públicas de JS:

```js
// src/utils/live-region.js
// Crea (si no existen o se desconectaron) dos regiones visualmente ocultas al final de <body>:
// <div data-live-region="polite" role="status"> y <div data-live-region="assertive" role="alert">.
export function initLiveRegions(root = document.body); // opcional: crear las regiones al cargar la página
export function announce(message, { politeness = 'polite' /* | 'assertive' */ } = {});
// Vacía la región y escribe el texto en el siguiente tick, para que se anuncie
// aunque la región se acabe de crear o el mensaje se repita.

// src/components/alert/alert.js
export class Alert { constructor(el, { returnFocus } = {}); dismiss(); destroy(); } // [data-alert]
export function initAlerts(root = document);
export function showAlert(container, message, {
  variant = 'info',     // 'info' | 'success' | 'warning' | 'danger'
  dismissible = false,
} = {}); // → Alert | HTMLElement; la alerta lleva su role y se anuncia sola (no usa announce())

// src/components/toast/toast.js
export class Toast {
  constructor(el, { autohide = false, delay = 5000, returnFocus } = {});
  get visible(); show(); hide(); destroy();
}
export function initToasts(root = document); // [data-toast]; lee data-autohide y data-delay
export function showToast(message, {
  variant = 'info',
  autohide = false,     // se ignora si hay `action`
  delay = 5000,
  action,               // { label, onClick } opcional → botón de acción
  after,                // disparador: crea una región propia justo después de él (Tab → toast); por defecto, la global al final de <body>
} = {}); // → Toast

// src/components/progress/progress.js
export class Progress {
  constructor(el, { completeMessage = 'Completado' } = {}); // el = <progress>
  get value(); set value(v); // acota entre 0 y max; al llegar a max anuncia una vez
  destroy();
}
export function initProgress(root = document); // [data-progress]

// src/components/carousel/carousel.js
export class Carousel {
  constructor(el, { interval = 5000 } = {}); // autoplay si el marcado lleva data-autoplay
  get index(); get playing();
  goTo(index); next(); prev(); play(); pause(); destroy();
}
export function initCarousels(root = document); // [data-carousel]; lee data-interval

// src/components/scrollspy/scrollspy.js
export class Scrollspy {
  constructor(nav, { rootMargin = '-20% 0px -79% 0px', root /* Element | Document; por defecto el documento del <nav> */ } = {});
  get active(); // enlace con aria-current="true" o null
  destroy();
}
export function initScrollspies(root = document); // [data-scrollspy]
```

Convenciones (las mismas que en los SPEC 01 y 02):

- Clases CSS con prefijo `c-` y BEM: `c-alert--danger`, `c-toast-region`, `c-carousel__slide`, `c-card--link`…
- El JS se engancha por atributos `data-*`, nunca por clases.
- El estado se guarda en los atributos ARIA (`aria-selected`, `aria-current`, `aria-live`) y en `hidden`, sin copia en variables.
- Cortesía del anuncio según la variante: `polite` para `info` y `success`, `assertive` para `warning` y `danger`. La usan `showAlert()` y `showToast()`.
- Prefijos de texto oculto por variante: «Información:», «Correcto:», «Aviso:», «Error:».
- Todos los textos por defecto están en español: `aria-label="Cerrar alerta"`, `aria-label="Cerrar notificación"`, «Cargando…», «Completado», «Diapositiva anterior», «Diapositiva siguiente», «Detener rotación automática», «Iniciar rotación automática», `aria-roledescription="carrusel"` y `aria-roledescription="diapositiva"`.
- Los botones de cierre de Alert y Toast usan la clase `c-close-button` del SPEC 01: su README indica enlazar `close-button.css`.
- Estilos solo con los tokens de `src/tokens/tokens.css`. Si faltan tokens (colores `warning` e `info`, `z-index` de la región de toasts), se añaden en el paso que los necesite.
- `live-region.js` no tiene `.css`: oculta sus regiones con estilos en línea (patrón `clip` de `.visually-hidden`).

Estructura de carpetas resultante:

```
src/utils/
├─ live-region.js
└─ live-region.test.js
src/components/
├─ alert/           html, css, js, stories, test, README   — importa live-region
├─ toast/           html, css, js, stories, test, README   — importa live-region
├─ progress/        html, css, js, stories, test, README   — importa live-region
├─ spinner/         html, css, stories, README             — solo CSS
├─ placeholder/     html, css, stories, README             — solo CSS
├─ carousel/        html, css, js, stories, test, README   — importa rovingTabindex
├─ card/            html, css, stories, README             — solo CSS
├─ badge/           html, css, stories, README             — solo CSS
└─ scrollspy/       html, css, js, stories, test, README
```

## Plan de implementación

Cada paso deja `npm run check` en verde y Storybook funcionando.
Cada componente sigue la checklist de 10 puntos del `README.md` raíz.
Su README incluye un apartado «Conformidad con la guía» que recoge lo que la ficha dice en «Lo que te toca a ti» y «Errores frecuentes», y cómo lo resuelve.

1. **Utilidad live-region.**
   Crear `src/utils/live-region.js` y `live-region.test.js`.
   Tests: `initLiveRegions()` crea exactamente una región de cada tipo aunque se llame dos veces, `announce()` crea las regiones si no existen, el texto aparece tras el tick (temporizadores falsos), `politeness: 'assertive'` escribe en la región `role="alert"`, un mensaje repetido se vuelve a escribir, y las regiones se recrean si se quitaron del DOM.
2. **Alert: estática y descartable.**
   Crear `src/components/alert/`: `<div class="c-alert c-alert--info" role="status">` (`role="alert"` en `warning` y `danger`), icono SVG `aria-hidden="true"` y prefijo `.visually-hidden` por variante.
   Añadir los tokens de `warning` e `info` con contraste ≥ 4.5:1.
   Variante descartable con `data-alert` y botón `c-close-button` `aria-label="Cerrar alerta"`.
   `Alert.dismiss()` quita la alerta y mueve el foco a `returnFocus`, o al elemento de `data-alert-return="ID"`, o al siguiente elemento enfocable tras la alerta.
   Tests de las tres ramas del foco.
3. **Alert: `showAlert()`.**
   Inserta la alerta en `container` con el `role` de su variante y sin texto, y escribe prefijo + mensaje en el siguiente tick, para que el lector lo anuncie como cambio de una región ya existente.
   No usa `announce()` (sería doble lectura).
   Solo admite una alerta a la vez por contenedor: si ya hay una de `showAlert()`, devuelve la existente.
   El README explica que un `role` presente al cargar la página no se anuncia, y que `role="alert"` es solo para lo urgente.
4. **Toast: base.**
   Crear `src/components/toast/`: contenedor `.c-toast-region` fijo en la esquina inferior-final (propiedades lógicas), creado por `showToast()` si no existe.
   Toast con mensaje, botón de acción opcional y botón `c-close-button` `aria-label="Cerrar notificación"`.
   Mostrar un toast no mueve el foco; el texto se anuncia con `announce()` según la variante, y el toast visual no es región viva.
   `initToasts()` engancha los `[data-toast]` del HTML y `show()` los anuncia.
   Al cerrar con el foco dentro, el foco va a `returnFocus` o, si no se da, al elemento que tenía el foco antes de entrar en el toast.
   Animación de entrada desactivada con `prefers-reduced-motion`.
5. **Toast: ocultación automática.**
   Solo con `autohide: true` o `data-autohide`, y nunca si hay botón de acción.
   El temporizador de `delay` ms se pausa con el ratón encima o con el foco dentro, y se reanuda con el tiempo restante al salir.
   Tests con temporizadores falsos de Vitest.
   El README cita WCAG 2.2.1 y recomienda que las acciones importantes estén también fuera del toast.
6. **Progress.**
   Crear `src/components/progress/`: `<label for>` + `<progress max value>` estilado con `::-webkit-progress-value` y `::-moz-progress-bar`.
   Variante indeterminada sin atributo `value`, con animación desactivada con `prefers-reduced-motion`.
   `Progress` acota el valor y anuncia `completeMessage` una sola vez al llegar a `max`, 1 s después (`COMPLETE_DELAY`) para que no lo pise el propio anuncio del lector, y crea las regiones vivas al construirse.
   El README explica cuándo usar `aria-describedby` hacia un texto de porcentaje y que no se anuncia cada cambio.
7. **Spinner y Placeholder.**
   Crear `src/components/spinner/`: `<div class="c-spinner" role="status">` con `<span class="visually-hidden">Cargando…</span>` y círculo decorativo.
   Con `prefers-reduced-motion` gira más lento o se sustituye por un pulso de opacidad.
   Crear `src/components/placeholder/`: bloques `.c-placeholder` con `aria-hidden="true"` dentro de un contenedor con `aria-busy="true"`.
   El README de ambos explica que un `role="status"` insertado a la vez que su texto no se anuncia y remite a `announce()`.
8. **Badge y Card.**
   Crear `src/components/badge/`: `<span class="c-badge">` con variantes de color, contraste verificado, y ejemplos con texto oculto («3 <span class="visually-hidden">mensajes sin leer</span>») dentro de un botón y de un encabezado.
   Crear `src/components/card/`: `<article class="c-card">` con título (`<div class="c-card__title">`, no un encabezado), imagen (`alt=""` si es decorativa) y cuerpo.
   Variante `c-card--link`: un único `<a>` en el título cuyo `::after` cubre toda la tarjeta, con el anillo de foco visible alrededor de la tarjeta.
   El README advierte de no anidar otros controles en la tarjeta clicable (o elevarlos con `position: relative` y `z-index`).
9. **Carousel: base.**
   Crear `src/components/carousel/`: `<section class="c-carousel" aria-roledescription="carrusel" aria-label>`.
   Controles en este orden: botón de rotación (oculto si no hay `data-autoplay`), Anterior/Siguiente y `role="tablist" aria-label="Diapositivas"` con `role="tab"` `aria-label="Diapositiva N"` y `aria-controls`.
   Cada diapositiva es `role="tabpanel" aria-roledescription="diapositiva" aria-label="N de M"`, y solo la activa es visible.
   El contenedor de diapositivas lleva `aria-live="polite"`.
   Anterior/Siguiente dan la vuelta al llegar a un extremo.
   El selector usa `rovingTabindex(tablist, '[role="tab"]', { onFocusChange })` con activación automática.
   Sin JS, los controles están `hidden` y todas las diapositivas se ven apiladas.
10. **Carousel: rotación automática.**
    Solo con `data-autoplay`, cada `interval` ms (5000 por defecto, `data-interval` para cambiarlo).
    Mientras rota, el contenedor lleva `aria-live="off"`.
    El foco dentro del carrusel o el ratón encima pausan la rotación, que se reanuda al salir.
    El botón de rotación alterna su `aria-label` entre «Detener rotación automática» e «Iniciar rotación automática»; una pausa con el botón no se reanuda sola.
    Con `prefers-reduced-motion: reduce` no arranca solo y los cambios de diapositiva no se animan.
    Tests con temporizadores falsos.
11. **Scrollspy.**
    Crear `src/components/scrollspy/`: `<nav aria-label="En esta página" data-scrollspy>` con enlaces `href="#id"` a las secciones.
    `IntersectionObserver` marca con `aria-current="true"` el enlace de la primera sección visible, y solo uno a la vez.
    Nunca mueve el foco ni anuncia nada.
    Estilo del enlace activo a partir de `aria-current`.
    Tests con un `IntersectionObserver` falso (jsdom no lo implementa).
12. **Integración.**
    Añadir cada historia nueva a la lista `stories` de `e2e/accessibility.spec.js`.
    Añadir tests e2e de teclado para Alert (cerrar y destino del foco), Toast (el foco no se mueve al mostrarse, la pausa con foco y Esc con el foco dentro), Carousel (flechas en el selector y parada de la rotación al enfocar) y Scrollspy (el enlace activo cambia al hacer scroll).
    Añadir las filas de los componentes nuevos a la tabla «Componentes disponibles» del `README.md` raíz.
    Documentar `live-region.js` en «Estructura» y en el párrafo de `src/utils/`.

## Criterios de aceptación

- [x] `npm run check` (lint JS + lint CSS + Vitest) termina sin errores.
- [x] `npm run lint:html` termina sin errores.
- [x] `npm run test:e2e` pasa: cero violaciones de axe en todas las historias de la lista y todos los tests de teclado en verde.
- [x] `npm run build` genera `dist/<componente>/` para los 9 componentes de este spec, además de los 16 existentes (`Disclosure` pasó a `src/utils/`, ver «Decisiones»). `alert`, `toast`, `progress`, `carousel` y `scrollspy` tienen `.js`, `.css` y `.html`; `spinner`, `placeholder`, `card` y `badge` tienen `.css` y `.html`.
- [x] Ningún `.js` de `dist/` contiene `import` de rutas relativas: `live-region` y `rovingTabindex` quedan empaquetados dentro.
- [x] Cada componente nuevo tiene un README con uso, accesibilidad, pruebas manuales y el apartado «Conformidad con la guía».
- [x] `announce()`: tras llamar dos veces a `initLiveRegions()` hay exactamente un `[data-live-region="polite"]` y un `[data-live-region="assertive"]` en el documento.
- [x] `announce()` sin regiones previas: el mensaje acaba escrito en la región recién creada.
- [x] Alert: `warning` y `danger` llevan `role="alert"`; `info` y `success` llevan `role="status"`. Ninguna lleva ambos.
- [x] Alert: cada variante tiene un prefijo de texto oculto distinto y un icono con `aria-hidden="true"`.
- [x] Alert descartable: al cerrarla, `document.activeElement` es el elemento de `data-alert-return` o, sin él, el siguiente enfocable tras la alerta. En ningún caso es `document.body`.
- [x] `showAlert(c, 'X', { variant: 'danger' })` inserta una alerta con `role="alert"` que nace vacía y, tras el siguiente tick, contiene «Error: X». Con `variant: 'success'` el `role` es `status`. No escribe en las regiones de `live-region.js`, así que no hay doble lectura.
- [x] `showAlert()` con una alerta ya visible en el contenedor: no inserta otra, devuelve la existente y no cambia su texto. Tras descartarla, se puede mostrar otra.
- [x] `showToast()`: `document.activeElement` es el mismo antes y después de mostrar el toast.
- [x] Toast: con un toast visible, enfocar un elemento cuya caja se solapa con la región la mueve al borde opuesto (`data-toast-top`); al cerrar el último toast, la región vuelve a su posición por defecto.
- [x] Toast: Esc con el foco dentro lo cierra y devuelve el foco; Esc con el foco fuera no lo cierra.
- [x] Toast sin `autohide`: sigue visible tras 60 s (temporizadores falsos).
- [x] Toast con `autohide` y `delay: 5000`: se oculta a los 5000 ms. Con el foco dentro no se oculta mientras dure el foco.
- [x] Toast con `action`: no se oculta solo aunque se pase `autohide: true`.
- [x] Progress: es un `<progress>` con nombre accesible por `<label>`. La variante indeterminada no tiene atributo `value`.
- [x] `Progress`: asignar un valor mayor que `max` deja `value === max`, y «Completado» se anuncia una sola vez aunque se asigne `max` dos veces.
- [x] Spinner: tiene `role="status"` y un texto oculto «Cargando…». Su círculo no tiene texto accesible.
- [x] Placeholder: todos los bloques `.c-placeholder` tienen `aria-hidden="true"` y su contenedor `aria-busy="true"`.
- [x] Card clicable: tiene exactamente un elemento enfocable, su nombre accesible es el texto del título y un clic en cualquier punto de la tarjeta navega a su `href`.
- [x] Badge: todos los ejemplos con número tienen texto oculto que explica qué cuenta.
- [x] Carousel: el botón de rotación (si existe) es el primer elemento enfocable del carrusel.
- [x] Carousel: → y ← en el selector mueven el foco y activan la diapositiva correspondiente con `aria-selected="true"`. Solo esa diapositiva es visible.
- [x] Carousel: «Diapositiva siguiente» en la última diapositiva lleva a la primera.
- [x] Carousel con `data-autoplay`: cambia de diapositiva a los 5000 ms y el contenedor tiene `aria-live="off"`. Al enfocar un control deja de rotar. Tras pulsar «Detener rotación automática», el contenedor tiene `aria-live="polite"` y no vuelve a rotar al salir el foco.
- [x] Carousel con `prefers-reduced-motion: reduce`: no rota solo aunque tenga `data-autoplay`.
- [x] Carousel sin JS: todas las diapositivas son visibles y no hay controles visibles.
- [x] Scrollspy: en todo momento hay como mucho un enlace con `aria-current="true"`, y el foco nunca se mueve por el scroll.
- [x] Ningún componente del spec usa texto en inglés en `aria-label`, `aria-roledescription` ni en texto oculto. («Error:» es español correcto, aunque se escriba igual en inglés.)
- [x] Todos los controles interactivos miden al menos 24×24 px y usan el anillo `--color-focus-ring` con `:focus-visible`.
- [x] Todas las animaciones nuevas se desactivan o reducen con `prefers-reduced-motion: reduce`.
- [x] Los tests existentes de los SPEC 01 y 02 siguen pasando sin modificar sus aserciones. (Único cambio: el test e2e de `Disclosure` se eliminó al convertirlo en utilidad; sus tests unitarios se movieron a `src/utils/disclosure.test.js` sin cambios.)

## Decisiones

- **Sí:** utilidad `src/utils/live-region.js` con regiones persistentes y `announce()`. Evita el fallo de insertar la región junto a su texto y la comparten Alert, Toast y Progress. Mismo criterio que `rovingTabindex` y `dismiss`: se crea en el spec que la usa por primera vez.
- **No:** regiones vivas escritas en el marcado de cada componente. Cada autor tendría que garantizar que la región existe antes del mensaje.
- **Sí:** el toast visual no es región viva; el anuncio va por `announce()`. Evita la doble lectura.
- **Sí:** la alerta (estática y dinámica) lleva `role` según su variante. Decisión del usuario, tomada durante la implementación del paso 3; sustituye a la anterior de «Alert sin `role`».
- **Sí:** `showAlert()` inserta la alerta vacía con su `role` y escribe el texto en el siguiente tick. Un `role` insertado a la vez que su contenido no se anuncia de forma fiable.
- **No:** `showAlert()` con `announce()` además del `role`. Se leería dos veces.
- **Sí:** `showAlert()` solo deja una alerta a la vez por contenedor; una segunda llamada devuelve la existente sin insertar ni anunciar. Decisión del usuario, tomada durante la implementación del paso 3. Evita apilar alertas idénticas si la acción se dispara varias veces.
- **No:** sustituir la alerta anterior por la nueva. Descartado por el usuario; se quedó con no duplicar.
- **Sí:** cortesía por variante: `polite` para `info`/`success`, `assertive` para `warning`/`danger`. La guía reserva `role="alert"` para lo urgente.
- **Aviso:** un `role` presente en el marcado al cargar la página no se anuncia por sí solo. Los roles del marcado estático dan semántica y cubren los cambios posteriores de su contenido; para avisar de algo nuevo se usa `showAlert()`.
- **Sí:** `showAlert()` además de la alerta de marcado y la descartable, para cubrir los mensajes dinámicos sin obligar a usar Toast.
- **Sí:** foco tras cerrar una Alert: `returnFocus` o `data-alert-return`, y si no, el siguiente enfocable. Nunca se pierde en `<body>`.
- **No:** foco al contenedor padre con `tabindex="-1"`. Modifica marcado ajeno.
- **Sí:** foco tras cerrar un Toast: `returnFocus` o el elemento que tenía el foco antes de entrar en el toast. Adapta la decisión de Alert: la región de toasts está al final de `<body>` y «el siguiente enfocable» no existiría.
- **Sí:** toasts creados por `showToast()` en un contenedor `.c-toast-region`, más la clase `Toast` para los escritos en el HTML.
- **Sí:** `showToast()` acepta una opción `after` (el disparador): crea una región propia justo después de él y el foco vuelve a él al cerrar. Decisión del usuario durante el paso 5: el foco no se mueve solo (descartado); en su lugar, el siguiente Tab tras el botón llega al toast. La región global al final de `<body>` sigue siendo el valor por defecto.
- **Sí:** las regiones que crea `showToast()` (la global y las de `after`) se quitan del DOM cuando se cierra su último toast. Decisión del usuario: que al eliminar un toast no quede marcado huérfano.
- **No:** mover el foco al toast automáticamente al mostrarlo, ni siquiera con retardo. Descartado por el usuario: el lector lo lee encima del mensaje y el retardo es una estimación.
- **Sí:** Esc cierra el toast solo cuando el foco está dentro de él (listener en el toast, no en `document`). Decisión del usuario, tomada en el paso 5 tras plantear si el usuario puede seguir navegando con un toast abierto: el toast es no modal (correcto), pero un toast fijo puede tapar el foco (WCAG 2.4.11) y Esc da otra vía de cierre por teclado.
- **No:** Esc global para cerrar toasts. Chocaría con diálogos y menús abiertos.
- **Sí:** mientras hay un toast visible, si el foco llega a un elemento cuya caja se solapa con la región de toasts, esta salta al borde opuesto (`data-toast-top`). Decisión del usuario, fuera del alcance original de este spec: el toast `position: fixed` podía tapar el elemento enfocado (SC 2.4.11) a 320 px o con zoom al 400 %. Axe no lo detecta; se comprueba también a mano (README del Toast).
- **No:** reducir la anchura del toast. Ya es `min(24rem, 100vw − 2 × espaciado)`; recortarla más no evitaba tapar controles.
- **No:** `scroll-padding` en el documento. No ayuda con elementos al final de la página, donde no hay más recorrido de scroll.
- **Sí:** ocultación automática de toasts solo opt-in, con pausa por hover y foco, y nunca con botón de acción (WCAG 2.2.1).
- **No:** ocultación automática por defecto ni toasts que nunca se ocultan.
- **Sí:** `<progress>` nativo («no ARIA is better than bad ARIA»), con JS opcional solo para acotar y anunciar el final.
- **Aviso:** el `<progress>` nativo lo anuncian por su cuenta algunos lectores (NVDA, según su ajuste de progreso), y la página no puede desactivarlo. `Progress` no anuncia cada cambio, pero una barra que avanza más rápido que el lector se oye atrasada. La historia «Simulado» usa pasos de 20 % cada 2 s y el README pide actualizar con moderación. Detectado por el usuario con NVDA durante el paso 6.
- **Sí:** `Progress` crea las regiones vivas en el constructor y retrasa 1 s el anuncio de «Completado». El usuario, probando con NVDA, no oía «Subida completada» al terminar: la región se creaba justo al anunciar y el habla del propio lector («100 %») podía pisarla. Es una hipótesis razonable, no verificada con NVDA; el retardo es una estimación.
- **No:** `<div role="progressbar">`. ARIA en lugar de un elemento nativo equivalente.
- **Sí:** Spinner, Placeholder, Card y Badge solo CSS. Su marcado ya es accesible sin JS.
- **No:** clase JS para Spinner que gestione `aria-busy` y el anuncio final. Se documenta con `announce()`.
- **Sí:** el título de la Card es un `<div>`, no un `<h3>`. Decisión del usuario durante el paso 8. Contrapartida: el título no aparece en la navegación por encabezados del lector; el README explica cómo cambiarlo a un `<h2>`/`<h3>` si se necesita.
- **Sí:** Card clicable con un único enlace estirado (`::after`). Una sola parada de Tab y nombre accesible corto.
- **No:** envolver toda la tarjeta en un `<a>`. El nombre accesible sería todo el contenido de la tarjeta.
- **Sí:** Carousel completo según la APG: botón de rotación primero, Anterior/Siguiente, selector y rotación automática opcional.
- **Sí:** `Disclosure` deja de ser un componente y pasa a la utilidad `src/utils/disclosure.js` (con su test). Petición del usuario durante la implementación de este spec. Navbar, Dropdown y Popover, que la importaban, solo cambian la ruta del import; se borran su CSS, su HTML de referencia, sus historias y su README. Los SPEC 01 y 02, ya aprobados, siguen mencionándola como componente: quedan desactualizados en ese punto.
- **No:** copiar la lógica de `Disclosure` en Navbar, Dropdown y Popover. Duplicaría código en tres sitios.
- **Sí:** la historia «Sin JavaScript» del Carousel se sustituye por «Automático (con Play/Pausa)». Petición del usuario durante el paso 9: enseña la rotación automática con su botón. La mejora progresiva sigue cubierta por el test del marcado de referencia. Esto adelanta el paso 10 del plan.
- **Sí:** pulsar «Iniciar rotación automática» con el foco o el ratón dentro anula las pausas temporales; si no, el botón parecería no hacer nada.
- **Sí:** las diapositivas del Carousel llevan una imagen (`c-carousel__media`, 16:9) y un pie con título y texto (`c-carousel__caption`). Petición del usuario durante el paso 9. Las ilustraciones son SVG propios en `carousel/img/`, que `copy-assets.mjs` copia a `dist/carousel/img/`; cada una lleva un `alt` descriptivo. La carga diferida sigue fuera de alcance.
- **Sí:** selector del Carousel como `tablist` con `rovingTabindex` (variante con pestañas de la APG).
- **No:** reutilizar la clase `Tabs`. Su `select()` no conoce la rotación y habría que sincronizar dos estados.
- **No:** selector como grupo de botones con `aria-current`. Una parada de Tab por diapositiva.
- **Sí:** rotación automática solo con `data-autoplay`, 5000 ms por defecto, sin arrancar con `prefers-reduced-motion`. La pausa del botón es permanente; la de foco y hover, temporal.
- **Sí:** el `rootMargin` por defecto del Scrollspy es una banda fina (`'-20% 0px -79% 0px'`), no `'0px 0px -60% 0px'` como decía el modelo de datos. Detectado probando con scroll real en el paso 11: con la zona del 40 % superior, al pulsar un enlace asomaba una franja de la sección anterior (por el `scroll-margin`) y quedaba resaltada la equivocada. La última sección debe ser lo bastante alta para llegar a la línea (documentado en el README).
- **Sí:** Scrollspy observa respecto al documento del `<nav>` (opción `root`), no al viewport implícito. Detectado en la pestaña Docs de Storybook (la historia va en un iframe): sin `root`, el viewport de referencia es el de la ventana superior y la línea del 20 % cae fuera del iframe. También sirve para contenedores con scroll propio.
- **Sí:** Scrollspy con `IntersectionObserver` y `aria-current="true"`. Sin listeners de scroll y sin mover el foco.
- **No:** Scrollspy con el evento `scroll` y `getBoundingClientRect`. Peor rendimiento y más difícil de probar.
- **Sí:** los botones de cierre reutilizan la clase `c-close-button` del SPEC 01. **No:** estilos de cierre propios en Alert y Toast.
- **No:** generador de ids. Ningún componente de este spec crea marcado que necesite ids referenciados por ARIA.

## Riesgos

| Riesgo                                                                                                                     | Mitigación                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Una región viva creada justo antes del primer mensaje no se anuncia en algunos lectores                                    | `announce()` escribe en el siguiente tick. El README recomienda `initLiveRegions()` al cargar la página. Prueba manual con NVDA y VoiceOver.                                                                     |
| Los tests limpian `document.body` y dejan la utilidad con referencias a regiones desconectadas                             | `announce()` comprueba `isConnected` y recrea las regiones. Lo cubre un test.                                                                                                                                    |
| Las acciones de un toast quedan al final del orden de Tab, lejos del disparador                                            | El README pide que las acciones importantes estén también fuera del toast. El atajo F6 queda fuera de alcance.                                                                                                   |
| Un toast fijo puede tapar el elemento enfocado (WCAG 2.4.11), sobre todo a 320 px o con zoom al 400 %                      | La región salta al borde opuesto si el foco llega a un elemento que iba a tapar; además, botón de cierre, Esc con el foco dentro y `autohide` opcional. Axe no lo detecta: prueba manual en el README del Toast. |
| `<progress>` se estila de forma distinta en Chromium/WebKit y en Firefox                                                   | Se estilan los dos pseudoelementos. La historia se revisa en los navegadores de Playwright.                                                                                                                      |
| `aria-roledescription` mal usado o en inglés                                                                               | Solo en el carrusel y sus diapositivas, en español, con criterio de aceptación propio. Axe lo valida.                                                                                                            |
| jsdom no implementa `IntersectionObserver` ni `matchMedia`                                                                 | Falsos en los tests de Scrollspy y Carousel. El comportamiento real se verifica en Playwright.                                                                                                                   |
| El `::after` de la Card clicable tapa otros controles dentro de la tarjeta                                                 | El README lo advierte y documenta cómo elevarlos. La historia no anida controles.                                                                                                                                |
| Alert, Toast, Progress y Carousel dependen de `src/utils/` o de `close-button.css`: copiar solo su carpeta rompe el import | Cada README lo indica. `dist/` es autónomo porque Vite empaqueta las utilidades (criterio de aceptación); `close-button.css` se enlaza aparte y se documenta.                                                    |
| Las herramientas automáticas solo detectan una parte de los problemas                                                      | Cada README incluye pruebas manuales con NVDA/VoiceOver (punto 10 de la checklist del README raíz).                                                                                                              |

## Lo que **no** entra en este spec

- Formularios y tablas → SPEC 04.
- Combobox, Listbox, Menu/Menubar, Tree, Grid, Feed, Spinbutton, Window splitter → SPEC 05.
- Atajo F6 a la región de toasts, y cola o límite de toasts.
- Badge con anuncio automático de cambios.
- Carousel con varias diapositivas visibles, gestos táctiles y carga diferida.
- Barra de progreso apilada.
- Scrollspy con desplazamiento suave o cambio de URL.
- Grupos y rejillas de Card.
- Generador de ids.
- Bootstrap o cualquier otra dependencia de ejecución.

Cada uno de ellos, si llega, va en su propio spec.
