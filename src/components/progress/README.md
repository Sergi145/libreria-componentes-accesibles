# Progress

Barra de progreso sobre el elemento nativo `<progress>`, con estado
indeterminado y una clase JS opcional que acota el valor y avisa al
completarse. No tiene patrón APG propio: el `<progress>` ya expone el rol
`progressbar`, el valor y el máximo a los lectores de pantalla. «No ARIA
is better than bad ARIA»: no se usa `role="progressbar"` ni `aria-valuenow`.

## Uso

```html
<link rel="stylesheet" href="progress.css" />

<!-- Determinado -->
<div class="c-progress">
  <label class="c-progress__label" for="subida">Subida del archivo</label>
  <progress
    class="c-progress__bar"
    id="subida"
    max="100"
    value="60"
    data-progress
    data-complete-message="Subida completada"
  >
    60 %
  </progress>
</div>

<!-- Indeterminado: sin atributo value -->
<div class="c-progress">
  <label class="c-progress__label" for="cargando">Cargando resultados</label>
  <progress class="c-progress__bar" id="cargando">Cargando…</progress>
</div>
```

```js
import { Progress, initProgress } from './progress.js';

const progress = new Progress(document.getElementById('subida'), {
  completeMessage: 'Subida completada', // por defecto: «Completado»
});
progress.value = 80; // acota entre 0 y max
progress.value = 100; // anuncia «Subida completada» una sola vez

// O, para inicializar todos los que lleven data-progress:
initProgress();
```

El JS es opcional: sin él, el `<progress>` funciona igual y basta con
cambiar su atributo `value` (o `.value`) desde tu código.

## Dependencias

`progress.js` importa `../../utils/live-region.js` (Vite lo empaqueta en
`dist/progress/progress.js`; si copias la carpeta a otro proyecto, copia
también esa utilidad). El CSS usa los tokens de `src/tokens/tokens.css`.

## Accesibilidad

- **Elemento nativo**: `<progress>` con su `<label for>`. El nombre
  accesible viene de la etiqueta, no de un `aria-label`.
- **Sin atributo `value` = indeterminado**: se usa cuando no se sabe
  cuánto falta. El lector anuncia «indeterminado» o equivalente. Asignar
  `progress.value` lo convierte en determinado.
- **`Progress` no anuncia cada cambio.** Solo anuncia
  `completeMessage` **una vez**, al llegar a `max`, por una región viva
  (`polite`), **1 s después** de llegar (`COMPLETE_DELAY`): NVDA y otros
  lectores dicen por su cuenta el último valor («100 %») y ese habla puede
  pisar un aviso escrito en el mismo instante. Las regiones vivas se crean
  al construir `Progress`, no al anunciar: una región creada justo al
  anunciar suele no leerse la primera vez. Si el valor baja de `max` y vuelve a llegar, se anuncia de
  nuevo. Si ya estaba completo al inicializar, no se anuncia nada.
- **Pero el lector sí puede anunciar el `<progress>` por su cuenta.**
  NVDA (ajuste «Salida de barra de progreso»: pitidos, voz o ambos) y
  otros lectores comunican los cambios de un `<progress>` nativo, y desde
  la página no se puede desactivar. Si la barra avanza más rápido de lo
  que el lector puede decir, el usuario oye valores atrasados y el
  «Completado» llega tarde. Actualiza el valor **con moderación**: pasos
  grandes (p. ej. 20 %) y espaciados (segundos, no cientos de
  milisegundos), o agrupa varias actualizaciones en una.
- **`aria-describedby` hacia un texto de porcentaje: normalmente no.** El
  `<progress>` ya expone su valor; un `aria-describedby` que apunte a un
  «60 %» visible haría que se leyera dos veces. Úsalo solo para
  información que el elemento no da, por ejemplo «3 de 5 archivos
  subidos».
- **Contraste**: el borde (`--color-border`) y el relleno
  (`--color-primary-600`) dan ≥ 3:1 contra el fondo, en claro y en
  oscuro (WCAG 1.4.11). La información no depende solo del color: hay
  etiqueta y valor.
- **Movimiento**: la transición del relleno y la animación del estado
  indeterminado se desactivan con `prefers-reduced-motion: reduce`; el
  indeterminado queda como una barra estática.
- **Estilos entre navegadores**: se estilan `::-webkit-progress-value`
  (Chromium/WebKit) y `::-moz-progress-bar` (Firefox). El estado
  indeterminado se dibuja igual en los dos con un degradado animado.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, recorrer la barra y comprobar que se lee su nombre
  y su valor («Subida del archivo, barra de progreso, 60 por ciento») y
  que en la indeterminada no se inventa un porcentaje.
- Con la historia «Simulado» (20 % cada 2 s), comprobar que «Subida
  completada» se anuncia una sola vez al terminar. Con NVDA, el propio
  lector puede leer los avances de la barra según su ajuste de progreso;
  cambia `STEP` e `INTERVAL` en la historia para comprobar cómo afecta el
  ritmo.
- Activar «Reducir movimiento» en el sistema y comprobar que la barra
  indeterminada no se mueve.
- Repetir en Chrome y en Firefox: relleno y borde deben verse igual.
- Modo oscuro: el relleno debe distinguirse de la pista.

## Conformidad con la guía

Revisión frente a la ficha de Progress de la guía. Nota: el PDF no está
en el repositorio, así que esta lista recoge los puntos que el SPEC 03
toma de la ficha.

**«Lo que te toca a ti»**:

- _Usar el `<progress>` nativo y no un `div` con ARIA_: es un
  `<progress>`; no hay `role` ni `aria-value*`.
- _Dar nombre accesible_: cada barra tiene un `<label for>`.
- _No anunciar cada cambio_: solo se anuncia la finalización, una vez.
- _Distinguir el progreso indeterminado_: sin atributo `value`.
- _Respetar la preferencia de movimiento reducido_: animación y
  transición desactivadas.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="progressbar"` sobre un `div` con `aria-valuenow` mal mantenido —
  no se usa.
- Barra sin nombre accesible — todos los ejemplos llevan `<label>`.
- Región viva que repite cada porcentaje — solo se anuncia el final.
- Animación infinita sin alternativa de movimiento reducido — cubierta.
