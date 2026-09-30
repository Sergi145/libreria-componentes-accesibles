# Alert

Mensaje breve dentro del flujo de la página, con cuatro variantes
(`info`, `success`, `warning`, `danger`) y una versión descartable.
Patrón de referencia: [WAI-ARIA APG — Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).
El `role` depende de la variante: `alert` en `warning` y `danger`,
`status` en `info` y `success` (ver «Accesibilidad»).

## Uso

```html
<link rel="stylesheet" href="alert.css" />
<!-- Solo si la alerta es descartable: el botón reutiliza Close button -->
<link rel="stylesheet" href="../close-button/close-button.css" />

<!-- Estática: role="alert" en warning/danger, role="status" en info/success -->
<div class="c-alert c-alert--warning" role="alert">
  <svg
    class="c-alert__icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    …
  </svg>
  <p class="c-alert__body">
    <span class="c-alert__sr-text">Aviso:</span>
    Quedan pocas unidades de este producto.
  </p>
</div>

<!-- Descartable: data-alert + botón con data-alert-close -->
<div
  class="c-alert c-alert--danger"
  role="alert"
  data-alert
  data-alert-return="email"
>
  …
  <button
    type="button"
    class="c-close-button c-alert__close"
    aria-label="Cerrar alerta"
    data-alert-close
  >
    …
  </button>
</div>
```

```js
import { Alert, initAlerts } from './alert.js';

new Alert(document.querySelector('[data-alert]'), {
  returnFocus: document.getElementById('email'), // opcional
});
// O, para inicializar todas las que haya en la página:
initAlerts();
```

Variantes: `c-alert--info` (por defecto), `--success`, `--warning`,
`--danger`. Prefijos de texto oculto: «Información:», «Correcto:»,
«Aviso:», «Error:».

## Alerta dinámica: `showAlert()`

```js
import { showAlert } from './alert.js';

showAlert(document.getElementById('avisos'), 'No se pudo guardar', {
  variant: 'danger', // 'info' | 'success' | 'warning' | 'danger'
  dismissible: true, // devuelve un Alert; si no, el elemento insertado
});
```

Inserta en el contenedor una alerta con el `role` de su variante, **vacía**,
y escribe «Error: No se pudo guardar» en el siguiente tick. Así el lector
de pantalla lo detecta como un cambio en una región ya existente: un
`role` insertado a la vez que su contenido no se anuncia de forma fiable.
No usa `announce()` (se leería dos veces). El mensaje se inserta como
texto (`textContent`), nunca como HTML.

**Una alerta a la vez por contenedor.** Si ya hay una alerta creada por
`showAlert()` visible en ese contenedor, una nueva llamada no inserta ni
anuncia nada y devuelve la existente (ignora el mensaje y las opciones de
la nueva). Así, disparar la acción varias veces no apila alertas iguales.
En cuanto se descarta o se quita del DOM, se puede mostrar otra.

## Dependencias

`alert.js` no importa nada. El CSS del botón de cierre viene de
`../close-button/close-button.css`: si copias solo la carpeta `alert/`
a otro proyecto, copia también ese archivo (o enlázalo aparte). Los
colores de acento salen de `--color-feedback-*` en
`src/tokens/tokens.css`.

## Accesibilidad

- **`role` según la variante**: `role="alert"` (asertivo, interrumpe) en
  `warning` y `danger`; `role="status"` (cortés, espera) en `info` y
  `success`. Reserva `alert` para lo urgente.
- **Lo que hay en el HTML al cargar no se anuncia.** Los lectores solo
  anuncian _cambios_ en una región viva ya existente, así que el `role` de
  una alerta escrita en el marcado da semántica y cubre los cambios
  posteriores de su contenido, pero no la anuncia al cargar. Para avisar
  de algo que ocurre _después_ de cargar, usa `showAlert()`.
- **El color no es la única pista**: cada variante lleva un icono
  distinto (`aria-hidden="true"`) y un prefijo de texto oculto
  («Error:»…) que el lector de pantalla lee antes del mensaje.
- **Botón de cierre** con `aria-label="Cerrar alerta"`, el icono
  decorativo y objetivo táctil ≥ 24×24 px (viene de `c-close-button`).
- **Foco al cerrar**: el botón desaparece con la alerta, así que el
  foco se devuelve explícitamente, en este orden:
  1. la opción `returnFocus` del constructor;
  2. el elemento con el `id` de `data-alert-return`;
  3. el siguiente elemento enfocable tras la alerta en el DOM (y, si no
     lo hay, el anterior).
     El foco nunca se pierde en `<body>` mientras haya algo enfocable.
- **`dismiss()` programático** solo mueve el foco si estaba dentro de la
  alerta; no roba el foco de otro sitio.
- **Contraste**: los acentos (bordes e iconos) dan ≥ 3:1 en claro y en
  oscuro; el texto usa `--color-text` sobre `--color-surface-muted`.

## Pruebas manuales recomendadas

- Recorrer la página con NVDA/VoiceOver y comprobar que cada alerta se
  lee en su sitio con su prefijo («Error: No se pudo enviar…») y que
  se anuncia al insertarla con `showAlert()` (asertiva en `danger` y
  `warning`, cortés en `info` y `success`) y que la del marcado no se
  anuncia sola al cargar.
- Con el teclado: Tab hasta «Cerrar alerta», Enter, y comprobar que el
  foco cae en el elemento esperado (nunca al principio de la página).
- Repetir con el zoom al 400 % y a 320 px: el texto debe reajustarse sin
  scroll horizontal.
- Activar el modo oscuro y comprobar que iconos y bordes siguen
  visibles.

## Conformidad con la guía

Revisión frente a la ficha de Alert de la guía. Nota: el PDF no está en
el repositorio, así que esta lista recoge los puntos que el SPEC 03
toma de la ficha.

**«Lo que te toca a ti»**:

- _No confiar en el `role` para lo que ya está en la página al cargar_:
  el marcado lleva el `role` de su variante, pero lo dinámico se inserta
  con `showAlert()` (región vacía + texto en el siguiente tick).
- _Reservar `role="alert"` para lo urgente_: solo `warning` y `danger`.
- _No transmitir el tipo solo con el color_: icono + prefijo de texto
  oculto por variante.
- _Devolver el foco al descartar_: `returnFocus`, `data-alert-return` o
  el siguiente enfocable.
- _Nombre accesible del botón de cierre_: `aria-label="Cerrar alerta"`,
  en español.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- `role="alert"` en todas las alertas — solo `warning` y `danger`; `info`
  y `success` usan `role="status"`.
- Insertar el `role` y su texto a la vez — `showAlert()` escribe el texto
  en el siguiente tick.
- Botón de cierre solo con un «×» como texto — el icono es decorativo y
  el nombre viene de `aria-label`.
- Foco perdido en `<body>` tras cerrar — cubierto por tests.
