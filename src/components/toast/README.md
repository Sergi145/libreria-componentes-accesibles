# Toast

Notificación breve y no modal que aparece en una esquina fija de la
pantalla. No tiene patrón APG propio: se apoya en las regiones vivas
(`src/utils/live-region.js`) y en el patrón
[WAI-ARIA APG — Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).

## Uso

```html
<link rel="stylesheet" href="toast.css" />
<!-- El botón de cierre reutiliza Close button -->
<link rel="stylesheet" href="../close-button/close-button.css" />
```

```js
import { showToast, initToasts } from './toast.js';

showToast('Cambios guardados', { variant: 'success' });

// Con acción: el botón ejecuta onClick y cierra el toast.
showToast('Archivo eliminado', {
  action: { label: 'Deshacer', onClick: () => restaurar() },
});
```

`showToast()` crea el toast dentro de `.c-toast-region` (la crea al final
de `<body>` si no existe), lo muestra y lo anuncia. Devuelve la
instancia de `Toast`. Al cerrarse, el toast se quita del DOM y, si la
región la creó `showToast()` y se queda vacía, también se quita: no queda
marcado huérfano.

También puedes escribir el toast en el HTML (con `data-toast` y `hidden`,
ver `toast.html`) y mostrarlo tú:

```js
const [toast] = initToasts();
toast.show(); // quita hidden y anuncia el texto
```

Variantes: `info` (por defecto), `success`, `warning`, `danger`.
Prefijos de texto oculto: «Información:», «Correcto:», «Aviso:»,
«Error:».

## Ocultación automática

Por defecto un toast **no se oculta solo**. Actívalo con `autohide`:

```js
showToast('Cambios guardados', { variant: 'success', autohide: true }); // 5000 ms
showToast('Copiado', { autohide: true, delay: 3000 });
```

```html
<div class="c-toast" data-toast data-autohide data-delay="3000" hidden>…</div>
```

- El temporizador se **pausa** mientras el ratón está encima o el foco
  está dentro del toast, y se reanuda con el tiempo que quedaba.
- Un toast con botón de acción (`[data-toast-action]`) **nunca** se oculta
  solo, aunque pases `autohide: true`: no daría tiempo a usarlo.
  **WCAG 2.2.1 (Tiempo ajustable)**: un mensaje que desaparece solo puede
  no dar tiempo a leerlo. Por eso es opt-in, se pausa y no se aplica a
  toasts con acciones. Usa `autohide` solo para avisos triviales y no
  dejes en un toast información o acciones que el usuario necesite
  después: ponlas también en la propia página.

## Dependencias

`toast.js` importa `../../utils/live-region.js` (Vite lo empaqueta en
`dist/toast/toast.js`; si copias la carpeta a otro proyecto, copia también
esa utilidad). El CSS del botón de cierre viene de
`../close-button/close-button.css`. Los colores de acento salen de
`--color-feedback-*` y el `z-index` de `--z-toast` en
`src/tokens/tokens.css`. `Toast` no importa `Alert`: su tabla de
variantes refleja la de `alert.js`.

## Accesibilidad

- **El toast visual no es región viva** (no lleva `role`). Su texto se
  anuncia con `announce()`, con cortesía según la variante: `polite`
  para `info` y `success`, `assertive` para `warning` y `danger`. Así no
  se lee dos veces y la región ya existe cuando llega el texto.
- **Mostrar un toast no mueve el foco.** Interrumpiría lo que el usuario
  estaba haciendo.
- **Foco al cerrar**: si el foco estaba dentro del toast, vuelve a
  `returnFocus` o, si no se da, al elemento que lo tenía antes de entrar
  en el toast. Si el foco estaba fuera, no se toca.
- **El color no es la única pista**: icono distinto por variante
  (`aria-hidden="true"`) y prefijo de texto oculto.
- **Botón de cierre** con `aria-label="Cerrar notificación"` y objetivo
  ≥ 24×24 px. El botón de acción también mide ≥ 24×24 px.
- **Orden de Tab**: por defecto la región está al final de `<body>`, así
  que el toast queda al final del orden de Tab, lejos de lo que lo
  provocó. Para que el siguiente Tab tras el botón llegue al toast, pasa
  el disparador en la opción `after`: `showToast()` crea una región propia
  justo después de él (la región es `position: fixed`, así que
  visualmente sigue en la esquina) y la quita al cerrar el toast. El foco
  vuelve al disparador al cerrarlo.

  ```js
  const boton = document.getElementById('guardar');
  boton.addEventListener('click', () =>
    showToast('Guardado', { variant: 'success', after: boton })
  );
  ```

  Así el orden es botón → (acción) → «Cerrar notificación». Sin `after`,
  las acciones importantes deben estar también en la propia página, no
  solo en el toast.

- **Esc cierra el toast** cuando el foco está dentro de él (no es un
  atajo global, para no chocar con diálogos ni menús). El foco vuelve a
  `returnFocus`, al disparador de `after` o al elemento previo.
- **Sigue siendo navegable**: el toast es no modal. No atrapa el foco ni
  vuelve inertes el resto de la página; el usuario puede seguir
  navegando con el toast abierto y cerrarlo cuando quiera.
- **WCAG 2.2 SC 2.4.11 (Foco no oculto)**: la región es `position:
fixed`, así que un toast abierto podría tapar el elemento que recibe
  el foco, sobre todo a 320 px (donde ocupa casi todo el ancho) o con el
  zoom al 400 %. Mientras haya un toast visible, si el foco llega a un
  elemento cuya caja se solapa con la de la región, esta salta al borde
  opuesto (`data-toast-top` la sube arriba; si allí vuelve a taparlo,
  baja de nuevo) y vuelve abajo cuando no queda ningún toast. Además
  tiene botón de cierre, Esc y `autohide`. Axe no detecta este problema:
  compruébalo también a mano (ver «Pruebas manuales»).
- **Movimiento**: la animación de entrada se desactiva con
  `prefers-reduced-motion: reduce`.
- **Contraste**: acentos ≥ 3:1 en claro y en oscuro; el texto usa
  `--color-text` sobre `--color-surface`.

## Pruebas manuales recomendadas

- Con NVDA/VoiceOver, disparar un toast `success` y otro `danger` y
  comprobar que se anuncian con su prefijo («Correcto: …», «Error: …»),
  el segundo interrumpiendo y el primero esperando.
- Comprobar que el foco no se mueve al aparecer el toast.
- Llegar al toast con Tab, cerrarlo con Enter y comprobar que el foco
  vuelve al elemento anterior.
- Con la acción «Deshacer», comprobar que se ejecuta y el toast se
  cierra.
- Repetir a 320 px y con el zoom al 400 %: el toast debe caber en el
  ancho sin scroll horizontal.
- Con el toast abierto a 320 px y al 400 % de zoom, recorrer la página
  con Tab hasta el final y comprobar que ningún elemento enfocado queda
  totalmente tapado por el toast (SC 2.4.11). Debe saltar de esquina cuando
  el foco llega a un elemento que iba a tapar.
- Con el foco dentro del toast, pulsar Esc: debe cerrarse y el foco
  volver al elemento esperado.

## Conformidad con la guía

Revisión frente a la ficha de Toast de la guía. Nota: el PDF no está en
el repositorio, así que esta lista recoge los puntos que el SPEC 03
toma de la ficha.

**«Lo que te toca a ti»**:

- _No insertar la región viva a la vez que su texto_: el anuncio va por
  las regiones persistentes de `live-region.js`.
- _Cortesía según la urgencia_: `assertive` solo en `warning` y `danger`.
- _No robar el foco al mostrarlo_: `show()` no lo mueve.
- _Devolver el foco al cerrar_: `returnFocus` o el elemento previo.
- _Nombre accesible del botón de cierre_: `aria-label="Cerrar
notificación"`, en español.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="alert"` o `aria-live` en el propio toast además del anuncio — se
  leería dos veces; el toast visual no lleva ninguno.
- Toast que solo se distingue por el color — lleva icono y prefijo.
- Foco perdido en `<body>` tras cerrar con el teclado — cubierto por
  tests.
