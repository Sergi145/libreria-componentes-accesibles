# Badge

Etiqueta pequeña con un número o una palabra corta («Nuevo», «3»),
solo CSS. No tiene patrón APG propio: es texto en línea.

## Uso

```html
<link rel="stylesheet" href="badge.css" />

<span class="c-badge">Nuevo</span>
<span class="c-badge c-badge--danger">Error</span>

<!-- Un número necesita texto oculto que diga qué cuenta -->
<button type="button" class="c-button c-button--secondary">
  Mensajes
  <span class="c-badge c-badge--danger">
    3
    <span class="c-badge__sr-text">mensajes sin leer</span>
  </span>
</button>

<h2>
  Notificaciones
  <span class="c-badge c-badge--info">
    12
    <span class="c-badge__sr-text">sin leer</span>
  </span>
</h2>
```

Variantes: la primaria por defecto, `c-badge--neutral`, `--success`,
`--warning`, `--danger` e `--info`.

## Dependencias

Ninguna, salvo los tokens de `src/tokens/tokens.css` (`--color-primary-500`
y `--color-feedback-*`). Los ejemplos con botón usan `../button/button.css`.

## Accesibilidad

- **Un número suelto no dice nada.** «3» dentro de un botón se lee
  «Mensajes 3». Añade un texto oculto (`c-badge__sr-text`) que dé el
  contexto: «Mensajes 3 mensajes sin leer». Todos los ejemplos con número
  lo llevan.
- **El color no es la única pista**: el badge siempre lleva texto; el
  color solo refuerza. En la variante `danger`, el propio texto («Error»,
  «mensajes sin leer») dice de qué se trata.
- **Contraste**: estilo «suave» (fondo de superficie, borde y texto del
  color de acento). El texto da ≥ 4.5:1 en claro y en oscuro con los
  acentos de `--color-feedback-*` y `--color-primary-500`.
- **No es una región viva.** Si el contador cambia y quieres avisar,
  usa `announce()` de `src/utils/live-region.js` (el aviso automático de
  cambios de un badge queda fuera del SPEC 03).
- **No es interactivo**: no recibe foco. Si necesitas que sea un
  control, usa un `<button>` o un `<a>` y aplica la clase dentro.
- **Objetivo mínimo**: mide al menos 1.5 rem × 1.5 rem.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, recorrer el botón «Mensajes» y comprobar que se
  lee «Mensajes 3 mensajes sin leer» (no solo «Mensajes 3»).
- Comprobar el encabezado con badge: el lector debe leer el número y su
  contexto dentro del encabezado.
- Modo oscuro: texto y borde de cada variante deben leerse bien.

## Conformidad con la guía

Revisión frente a la ficha de Badge de la guía. Nota: el PDF no está en
el repositorio, así que esta lista recoge los puntos que el SPEC 03 toma
de la ficha.

**«Lo que te toca a ti»**:

- _Dar contexto al número con texto oculto_: `c-badge__sr-text` en todos
  los contadores.
- _No transmitir el significado solo con el color_: siempre hay texto.
- _Contraste suficiente_: ≥ 4.5:1 en las seis variantes.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Badge con un número y nada más («3») — todos los ejemplos con número
  llevan texto oculto.
- Badge coloreado como única indicación de estado — lleva texto.
- Badge usado como región viva sin serlo — se documenta que no lo es.
