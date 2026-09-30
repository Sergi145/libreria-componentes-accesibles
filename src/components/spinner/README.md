# Spinner

Indicador de carga de tamaño pequeño, solo CSS. No tiene patrón APG
propio: es un `role="status"` (región viva cortés) con un texto oculto
que dice qué se está cargando; el círculo que gira es decorativo.

## Uso

```html
<link rel="stylesheet" href="spinner.css" />

<div class="c-spinner" role="status">
  <span class="c-spinner__circle" aria-hidden="true"></span>
  <span class="c-spinner__sr-text">Cargando…</span>
</div>
```

Tamaños: `c-spinner--sm` y `c-spinner--lg` (el círculo mide `1.5em`, así que
sigue al `font-size`). El texto oculto es el que pronuncia el lector de
pantalla; ajústalo al contexto («Guardando cambios…», «Buscando…»).

## Dependencias

Ninguna, salvo los tokens de `src/tokens/tokens.css`.

## Accesibilidad

- **`role="status"` + texto oculto**: el lector anuncia el texto, no el
  círculo. El círculo lleva `aria-hidden="true"`.
- **Un `role="status"` insertado a la vez que su texto no se anuncia de
  forma fiable.** Las regiones vivas solo anuncian _cambios_ en una región
  ya existente. Si el spinner aparece por JavaScript:
  1. inserta primero el contenedor `role="status"` **vacío**;
  2. escribe el texto oculto en el siguiente tick (`setTimeout(…, 0)`);
  3. o, más sencillo, avisa con `announce('Cargando…')` de
     `src/utils/live-region.js`, que ya lo hace bien. Con `announce()`
     puedes dejar el spinner sin `role` y solo con el texto oculto si no
     quieres una segunda región.

  El spinner que ya está en el HTML al cargar la página no se anuncia por
  sí solo: es texto normal en el orden de lectura.

- **Anunciar el final**: cuando termina la carga, di que ha terminado
  (`announce('Datos cargados')` o quita el spinner y muestra el
  resultado en una región viva). Un spinner que desaparece en silencio
  deja al usuario de lector sin saber qué ocurrió.
- **Movimiento**: con `prefers-reduced-motion: reduce` el giro se
  sustituye por un pulso de opacidad (sin rotación).
- **Contraste**: el arco (`--color-primary-600`) da ≥ 3:1 contra el fondo
  en claro y en oscuro (WCAG 1.4.11).
- **No es un control**: no recibe foco ni tiene objetivo táctil.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, insertar el spinner por JS (historia «Dinámico») y
  comprobar que se oye «Cargando…» una vez, sin que se lea el círculo.
- Recorrer la página con el cursor virtual y comprobar que el spinner
  estático se lee como texto normal, sin interrupciones.
- Activar «Reducir movimiento» en el sistema y comprobar que el círculo
  no gira.
- Modo oscuro: el arco debe distinguirse del fondo.

## Conformidad con la guía

Revisión frente a la ficha de Spinner de la guía. Nota: el PDF no está en
el repositorio, así que esta lista recoge los puntos que el SPEC 03 toma
de la ficha.

**«Lo que te toca a ti»**:

- _Dar un texto accesible al spinner_: `role="status"` con texto oculto
  «Cargando…».
- _No confiar en un `role="status"` insertado junto con su texto_:
  contenedor vacío primero, o `announce()`.
- _Respetar el movimiento reducido_: pulso de opacidad en vez de giro.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Spinner sin ningún texto accesible — lleva texto oculto en todos los
  ejemplos.
- Círculo que el lector intenta leer — es `aria-hidden="true"`.
- Animación sin alternativa de movimiento reducido — cubierta.
