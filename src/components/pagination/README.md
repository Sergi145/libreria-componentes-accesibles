# Pagination

Bloque de navegación entre páginas de resultados. La APG no define un
patrón propio de "paginación": combina el patrón
[Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
(navegación con nombre) y el patrón
[Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) (enlaces nativos).

## Uso

```html
<link rel="stylesheet" href="pagination.css" />

<nav aria-label="Paginación de resultados">
  <ul class="c-pagination">
    <li class="c-pagination__item">
      <a class="c-pagination__link c-pagination__link--arrow" href="?pagina=2">
        <svg
          class="c-pagination__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M15 6l-6 6 6 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="c-pagination__sr-text">Anterior</span>
      </a>
    </li>
    <li class="c-pagination__item">
      <a
        class="c-pagination__link"
        href="?pagina=1"
        aria-current="page"
        aria-label="Página 1"
        >1</a
      >
    </li>
    <!-- más páginas… -->
  </ul>
</nav>
```

Solo CSS: no requiere JavaScript. El estado deshabilitado de
«Anterior»/«Siguiente» en los extremos se decide al generar el HTML de
cada página (servidor o plantilla), no con JS del lado del cliente.

## Sin JavaScript

Funciona igual con o sin JavaScript: es una lista de enlaces `<a href>`
normales. Si tu paginación carga resultados por AJAX en vez de navegar
a una URL nueva, añade tú una región `status` que anuncie el cambio y
mueve el foco al inicio de los resultados — queda fuera de este
componente (ver «Conformidad con la guía» más abajo).

## Accesibilidad

- **`<nav aria-label="Paginación de resultados">`**: landmark de
  navegación con nombre propio. Si tu página tiene más de una
  paginación (por ejemplo, arriba y abajo de una tabla), dales nombres
  distintos (`"Paginación de resultados (superior)"`, `…(inferior)`).
- **`aria-current="page"`** en el enlace de la página actual: a
  diferencia de `Breadcrumb`, aquí el enlace **conserva su `href`** —
  recargar la página actual es una acción válida, así que no tiene
  sentido quitarle el enlace.
- **`aria-label="Página N"`** en cada número: un "3" suelto, sin la
  tabla visual de alrededor, no dice a qué corresponde. El `aria-label`
  se antepone al texto visible como nombre accesible.
- **Flechas Anterior/Siguiente**: el icono SVG lleva
  `aria-hidden="true"` y `focusable="false"` (decorativo); el nombre
  accesible del enlace lo da el texto de `.c-pagination__sr-text`,
  oculto visualmente con la técnica `.visually-hidden` de la guía
  (`clip`, no `display:none`, para que siga siendo anunciable).
- **Deshabilitado sin `href`**: `Anterior` en la primera página y
  `Siguiente` en la última son `<a>` **sin `href`** y con
  `aria-disabled="true"`. Un `<a>` sin `href` no es focable ni
  interactivo por sí solo, así que basta con quitar el atributo (no
  hace falta `tabindex="-1"` ni `role="button"`).
- **Objetivo táctil**: cada enlace mide `2.5rem` (40×40px), por encima
  del mínimo de `24×24px` de WCAG 2.2 (SC 2.5.8) — el mismo tamaño base
  que usa `Button`.
- **Página actual sin depender solo del color**: además de
  `--color-primary-500`, lleva fondo relleno y texto en negrita (WCAG
  1.4.1).

## Pruebas manuales recomendadas

- Navegar con `Tab`: cada enlace habilitado es una parada; `Anterior`
  en la primera página y `Siguiente` en la última no lo son.
- Con NVDA/VoiceOver, comprobar que cada número se anuncia como
  "Página N" (no solo el dígito) y que la página actual se identifica
  como tal.
- Verificar que las flechas se anuncian como "Anterior"/"Siguiente", no
  como "enlace" a secas ni con el nombre del icono.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 13 (Paginación) de la
guía.

**«Lo que te toca a ti»** (lo que el marcado de referencia de la ficha
no resuelve solo):

- _Nombre del `<nav>` específico si hay varias paginaciones (arriba y
  abajo de la tabla)_: documentado arriba, en «Accesibilidad»; el
  `aria-label` por defecto (`"Paginación de resultados"`) se debe
  particularizar en ese caso.
- _Quitar el `href` de los enlaces deshabilitados_: implementado —
  `Anterior`/`Siguiente` no llevan `href` cuando no hay página
  anterior/siguiente (ver `pagination.stories.js`, historias «Primera
  página» y «Última página»).
- _Si la paginación carga por AJAX, anunciar el cambio (región
  `status`) y mover el foco al inicio de los resultados_: **no
  aplica** a este componente. El SPEC 01 deja la paginación dinámica
  por AJAX fuera de alcance (ver `specs/01-base-acciones-y-navegacion.md`,
  sección «Fuera de alcance»): este componente cubre la navegación por
  URL, que es su caso de uso por defecto.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Solo `.active` sin `aria-current` — aquí la página actual siempre
  lleva `aria-current="page"` junto al estilo visual.
- Enlaces «»» y ««» sin texto alternativo — las flechas son un SVG
  `aria-hidden="true"` acompañado siempre de
  `.c-pagination__sr-text` con «Anterior»/«Siguiente».

**Diferencia deliberada con el ejemplo de la ficha**: la ficha usa los
caracteres `&laquo;`/`&raquo;` como icono. Aquí se usan dos `<svg>` de
flecha (mismo criterio que `Close button` y `Navbar`, ya `aria-hidden`

- texto oculto) para mantener un mismo lenguaje visual de iconos en
  toda la librería; el nombre accesible y el comportamiento son
  idénticos a los de la ficha.
