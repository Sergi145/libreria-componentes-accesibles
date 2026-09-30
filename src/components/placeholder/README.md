# Placeholder

Esqueletos de carga (_skeleton screens_), solo CSS. No tienen patrón APG
propio: los bloques son decorativos y el contenedor se marca como
ocupado mientras dura la carga.

## Uso

```html
<link rel="stylesheet" href="placeholder.css" />

<div class="c-placeholder-group" aria-busy="true">
  <div class="c-placeholder c-placeholder--media" aria-hidden="true"></div>
  <div class="c-placeholder c-placeholder--title" aria-hidden="true"></div>
  <div class="c-placeholder" aria-hidden="true"></div>
  <div class="c-placeholder c-placeholder--medium" aria-hidden="true"></div>
  <div class="c-placeholder c-placeholder--short" aria-hidden="true"></div>
</div>
```

Bloques: `c-placeholder--title`, `--avatar` y `--media`; sin modificador es
una línea de texto. Anchos: `--short` (40 %) y `--medium` (70 %). Al
terminar la carga, sustituye el grupo por el contenido real (o pon
`aria-busy="false"`).

## Dependencias

Ninguna, salvo los tokens de `src/tokens/tokens.css`. Usa `color-mix()`
para que los bloques se vean en claro y en oscuro.

## Accesibilidad

- **Bloques con `aria-hidden="true"`**: son formas vacías; el lector no
  debe recorrerlas.
- **Contenedor con `aria-busy="true"`** mientras carga: indica a las
  tecnologías de apoyo que el contenido está incompleto.
- **`aria-busy` no avisa de nada por sí solo.** Un usuario de lector no
  sabe que se está cargando ni cuándo termina. Avisa con `announce()` de
  `src/utils/live-region.js` (`announce('Cargando contenido…')` al
  empezar y `announce('Contenido cargado')` al terminar), o acompaña el
  esqueleto con un [Spinner](../spinner). La historia «Simulado» lo hace
  así.
- **No pongas un `role="status"` en el marcado del esqueleto.** Un
  `role="status"` insertado a la vez que su texto no se anuncia de forma
  fiable; `announce()` mantiene regiones persistentes y lo resuelve.
- **Movimiento**: el brillo animado se desactiva con
  `prefers-reduced-motion: reduce`; los bloques quedan estáticos.
- **Contraste**: al ser decorativos y ocultos para los lectores, no tienen
  requisito de contraste; aun así se ven en claro y en oscuro (mezcla del
  color de texto con la superficie).
- **No interactivos**: no reciben foco.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, ejecutar la historia «Simulado»: el lector no debe
  leer ningún bloque vacío; debe oírse «Cargando contenido…» al empezar
  y «Contenido cargado» al terminar.
- Recorrer el esqueleto con el cursor virtual y comprobar que no hay
  paradas en los bloques.
- Activar «Reducir movimiento» y comprobar que el brillo no se mueve.
- Modo oscuro: los bloques deben distinguirse del fondo.

## Conformidad con la guía

Revisión frente a la ficha de Placeholder de la guía. Nota: el PDF no
está en el repositorio, así que esta lista recoge los puntos que el
SPEC 03 toma de la ficha.

**«Lo que te toca a ti»**:

- _Ocultar los bloques decorativos_: `aria-hidden="true"` en todos.
- _Marcar el contenedor como ocupado_: `aria-busy="true"`.
- _Avisar del estado de carga por otra vía_: `announce()` o Spinner.
- _Respetar el movimiento reducido_: animación desactivada.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Esqueleto sin `aria-hidden`: el lector lee decenas de bloques vacíos —
  todos lo llevan.
- Confiar en `aria-busy` como único aviso — se documenta que no basta.
- Dejar `aria-busy="true"` tras cargar — el README pide sustituir el
  grupo o ponerlo a `false`.
