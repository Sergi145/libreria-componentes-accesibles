# Feed (flujo de artículos)

Lista de artículos que se puede recorrer con el teclado y que, opcionalmente,
carga más artículos al llegar al final. Implementa el patrón
[WAI-ARIA APG — Feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/):
`role="feed"`, `article` enfocables, `aria-posinset`/`aria-setsize`, AvPág/RePág
entre artículos y Ctrl+Inicio/Ctrl+Fin para salir del feed.

> **Dependencias:** `feed.js` importa `../../utils/live-region.js` (anuncios
> con `announce()`). Si copias la carpeta a otro proyecto, copia también esa
> utilidad. `feed.css` define su propio `.c-spinner`; no enlaza
> `spinner/spinner.css`. `dist/feed/` es autónomo (Vite empaqueta la utilidad).

## Uso

Sin JavaScript es un listado simple de artículos con un enlace «Cargar más
artículos» que apunta a la siguiente página del servidor.

```html
<link rel="stylesheet" href="feed.css" />

<div class="c-feed">
  <h2 id="feed-title">Últimas noticias</h2>

  <section data-feed aria-labelledby="feed-title">
    <article>
      <h3>Primer artículo</h3>
      <p>Resumen del primer artículo.</p>
    </article>
  </section>

  <a class="c-feed__more" data-feed-more href="?pagina=2"
    >Cargar más artículos</a
  >
</div>
```

Con JavaScript, el feed es estático (solo teclado):

```js
import { initFeeds } from './feed.js';

initFeeds();
```

Con carga infinita, pasa `loadMore` al constructor:

```js
import { Feed } from './feed.js';

new Feed(document.querySelector('[data-feed]'), {
  loadMore: async () => {
    const respuesta = await fetch('/api/articulos?pagina=2');
    const datos = await respuesta.json();
    return datos; // [{ title, description }, ...] o [] si no hay más
  },
});
```

### Contrato de `loadMore`

`loadMore()` devuelve una promesa con una lista de artículos nuevos:

- Lista con elementos `{ title, description }`: el componente crea cada
  `<article>` (con `<h3>` y `<p>`) y lo añade al final del feed.
- Lista vacía (`[]`): se da por terminado el feed. Se muestra «No hay más
  artículos», se desconecta la observación y todos los artículos quedan con el
  mismo `aria-setsize`.
- Promesa rechazada: se muestra «No se pudieron cargar más artículos» con un
  botón «Reintentar» que vuelve a llamar a `loadMore()`.

El componente no sabe de dónde salen los datos. No hace `fetch` ni plantillas
de artículo.

> Diferencia con el SPEC 06: el spec describe `loadMore(page)` devolviendo
> `<article>` ya construidos y sin ningún argumento de página. La
> implementación actual recibe `{ title, description }` y no pasa número de
> página.

## API de JavaScript

| Miembro                      | Descripción                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| `new Feed(el, { loadMore })` | `el` es `<section data-feed>`. Sin `loadMore` el feed es estático.         |
| `initFeeds(root, options)`   | Crea un `Feed` por cada `[data-feed]` dentro de `root`.                    |
| `destroy()`                  | Quita los listeners, el observador, `role`, `aria-*` y los `id` generados. |

## Teclado

| Tecla       | Acción                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| AvPág       | Enfoca el artículo siguiente. Al llegar al último, empieza la carga (con `loadMore`). |
| RePág       | Enfoca el artículo anterior.                                                          |
| Ctrl+Fin    | Sale del feed: enfoca el primer elemento enfocable posterior al feed.                 |
| Ctrl+Inicio | Sale del feed: enfoca el último elemento enfocable anterior al feed.                  |
| Tab         | Recorre los artículos (cada uno es una parada de Tab) y los controles de la página.   |

La sección no lleva `tabindex`: solo los artículos son paradas de Tab, y la
sección no se enfoca sola. Los artículos llevan `tabindex="0"`, como en el
ejemplo de APG.

## ARIA y estados

- `<section data-feed>` recibe `role="feed"` y `aria-busy`.
- Cada `<article>` recibe `tabindex="0"`, `aria-posinset` (desde 1) y
  `aria-setsize` (número de artículos cargados). Un `<article>` ya tiene el
  rol implícito, así que no se añade `role`.
- Cada artículo se nombra con `aria-labelledby` (su `<h1>`–`<h6>`) y se describe
  con `aria-describedby` (su primer `<p>`). Si el encabezado o el resumen no
  tienen `id`, el componente se lo asigna y `destroy()` lo quita.
- `aria-busy="true"` durante la carga y `"false"` al terminar.
- El estado (cargando, error, fin) es un `<p class="c-feed__status">` fuera de
  `role="feed"`, porque el feed solo admite artículos como hijos.
- Cada estado se anuncia con `announce()`: «Cargando más artículos…», «N
  artículos nuevos», «No se pudieron cargar más artículos» y «No hay más
  artículos».
- Mientras el total no se conoce no se usa `aria-setsize="-1"`: el componente
  pone el número de artículos cargados (ver «Diferencias con el SPEC 06»).

El botón «Reintentar» se mantiene durante la carga con `aria-disabled="true"`,
para que el foco no caiga en `<body>` al pulsarlo. Si el foco estaba en ese
botón y llegan artículos nuevos, pasa al primero de ellos.

## Carga infinita

- Un `IntersectionObserver` observa el último artículo con `rootMargin: 100px`
  y llama a la carga cuando aparece. Si el navegador no lo soporta, no hay
  carga automática.
- AvPág que lleva el foco al último artículo también inicia la carga.
- No se lanzan dos cargas a la vez.
- Con `loadMore`, el enlace «Cargar más artículos» se oculta (`hidden`) y
  vuelve a mostrarse con `destroy()`.

## Diferencias con el SPEC 06

Estos puntos del spec no se cumplen todavía en el código:

- `loadMore` devuelve datos, no `<article>`, y no recibe número de página.
- No hay métodos públicos `load()`, `busy` ni `done`; la carga es interna (`_load()`).
- Durante la carga no se muestra el `.c-spinner` ni se usa `spinner/spinner.css`.
- Sin total conocido, `aria-setsize` no vale `-1`.
- AvPág sobre el último artículo no inicia ninguna acción.
- El texto del enlace sin JS es «Cargar más artículos» (el spec pide «Cargar más»).
- Si el foco estaba en «Reintentar», el componente lo mueve al primer artículo nuevo;
  el spec pide que `document.activeElement` no cambie tras la carga.

## Estilos

- `.c-feed` contiene el título y la sección. Los artículos usan los tokens de
  `src/tokens/tokens.css` y el anillo `--color-focus-ring` con `:focus-visible`.
- En modo oscuro, `.c-feed__more` y el botón de estado usan `primary-500`
  (`primary-600` no alcanza 4.5:1 sobre la superficie oscura).
- `prefers-reduced-motion: reduce` desactiva la animación de `.c-spinner`. El
  enlace «Cargar más artículos» tiene una transición de 150 ms sin alternativa
  reducida; queda pendiente.
- No hay reglas `forced-colors`: ningún estado del feed depende solo del color.
  El botón «Reintentar» pierde su fondo en ese modo y solo se distingue por su
  texto; queda pendiente.

## Accesibilidad

- Un `<article>` por entrada, con encabezado propio y nombre accesible.
- Navegación por teclado completa sin ratón (AvPág, RePág, Ctrl+Inicio/Fin).
- Los estados de carga, error y fin se comunican por `announce()`, no solo
  visualmente.
- Sin JavaScript, el feed es una lista de artículos con un enlace real a la
  siguiente página.

## Pruebas manuales

Pendientes. No hay resultados registrados todavía.

- [ ] Con NVDA: se anuncian «feed», el número de artículo («artículo 2 de 4») y
      el nombre de cada artículo.
- [ ] Con NVDA: AvPág/RePág cambian de artículo y el lector lo anuncia.
- [ ] Con VoiceOver (macOS/iOS): los artículos se recorren con el rotor y con
      las flechas.
- [ ] Con carga infinita: al llegar al final se anuncia «Cargando más artículos…»
      y después «N artículos nuevos» o «No hay más artículos».
- [ ] Con error de carga: se anuncia el error y «Reintentar» vuelve a cargar.
- [ ] Ctrl+Fin y Ctrl+Inicio salen del feed sin atrapar el foco.

## Conformidad con la guía

La referencia es el patrón WAI-ARIA APG «Feed». La guía
`guia-componentes-accesibles-aria-bootstrap5.pdf` no está en el repositorio,
así que este apartado no se ha contrastado con su ficha.

- `role="feed"` con `article` enfocables y `aria-posinset`/`aria-setsize`:
  implementado y cubierto por tests.
- AvPág/RePág y Ctrl+Inicio/Ctrl+Fin: implementados y cubiertos por tests.
- `aria-busy` durante la carga y mensajes con `announce()`: implementados y
  cubiertos por tests.
- Los puntos de la sección «Diferencias con el SPEC 06» quedan pendientes.
