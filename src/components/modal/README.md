# Modal

Diálogo modal de confirmación. Construido sobre el elemento `<dialog>`
nativo en vez de reimplementar el patrón a mano, porque los navegadores
modernos (Chrome, Edge, Firefox, Safari) ya resuelven correctamente al
llamar a `showModal()`:

- **Atrapado de foco**: `Tab`/`Shift+Tab` no pueden salir del diálogo.
- **Cierre con `Escape`**.
- **Devolución del foco** al elemento que abrió el diálogo, al cerrarlo.
- **El resto de la página queda inerte** para la tecnología de
  asistencia mientras el diálogo está abierto.

## Uso

```html
<link rel="stylesheet" href="modal.css" />

<button type="button" data-modal-trigger="ejemplo-modal">Abrir modal</button>

<dialog
  id="ejemplo-modal"
  class="c-modal"
  tabindex="-1"
  aria-labelledby="ejemplo-modal-title"
>
  <form method="dialog" class="c-modal__content">
    <header class="c-modal__header">
      <h2 id="ejemplo-modal-title" class="c-modal__title">Confirmar acción</h2>
      <button
        type="submit"
        class="c-modal__close"
        aria-label="Cerrar diálogo"
        value="cancel"
      >
        ×
      </button>
    </header>
    <div class="c-modal__body"><p>…</p></div>
    <div class="c-modal__footer">
      <button type="submit" class="c-button c-button--secondary" value="cancel">
        Cancelar
      </button>
      <button
        type="submit"
        class="c-button c-button--primary"
        value="confirm"
        autofocus
      >
        Confirmar
      </button>
    </div>
  </form>
</dialog>
```

```js
import { initModals } from './modal.js';

// Conecta automáticamente cada [data-modal-trigger="ID"] con su
// <dialog id="ID">.
initModals();
```

O de forma manual con la clase `Modal`:

```js
import { Modal } from './modal.js';

const modal = new Modal(document.querySelector('#ejemplo-modal'));
document.querySelector('[data-modal-trigger]').addEventListener('click', () => {
  modal.open();
});
```

## Por qué `<form method="dialog">`

Los botones "Cancelar"/"Confirmar" son `<button type="submit">` dentro de
un `<form method="dialog">`: al pulsarlos, el propio navegador cierra el
diálogo (sin JS) y expone qué botón se usó en `dialog.returnValue`
(`"cancel"` o `"confirm"`). Escúchalo así:

```js
dialogEl.addEventListener('close', () => {
  if (dialogEl.returnValue === 'confirm') {
    // continuar con la acción confirmada
  }
});
```

## Variante alertdialog

Un `role="alertdialog"` es un modal que interrumpe para pedir una
respuesta (confirmaciones destructivas, como borrar una cuenta). Se
declara solo en el HTML; `Modal` no cambia de API, pero al detectar el
rol deja de cerrar con el clic en el backdrop — la acción es demasiado
importante para descartarla sin querer. `Escape` lo sigue cerrando, para
no atrapar al usuario de teclado.

```html
<button
  type="button"
  class="c-button c-button--danger"
  data-modal-trigger="confirmar"
>
  Eliminar cuenta
</button>

<dialog
  id="confirmar"
  class="c-modal"
  role="alertdialog"
  tabindex="-1"
  aria-labelledby="confirmar-title"
  aria-describedby="confirmar-desc"
>
  <form method="dialog" class="c-modal__content">
    <header class="c-modal__header">
      <h2 id="confirmar-title" class="c-modal__title">¿Eliminar la cuenta?</h2>
      <button
        type="submit"
        class="c-modal__close"
        aria-label="Cerrar diálogo"
        value="cancel"
        autofocus
      >
        ×
      </button>
    </header>
    <div class="c-modal__body">
      <p id="confirmar-desc">
        Se borrarán todos tus datos. No se puede deshacer.
      </p>
    </div>
    <div class="c-modal__footer">
      <button type="submit" class="c-button c-button--secondary" value="cancel">
        Cancelar
      </button>
      <button type="submit" class="c-button c-button--danger" value="confirm">
        Eliminar definitivamente
      </button>
    </div>
  </form>
</dialog>
```

- **`aria-describedby`** apunta al párrafo con la descripción breve de
  la acción; omítelo si el cuerpo es largo o estructurado (el lector ya
  lo recorre al entrar en el diálogo).
- **Foco inicial en el botón de cerrar (×)**: es el primer elemento
  enfocable del DOM, y su `value` es `"cancel"` — la misma acción menos
  destructiva que "Cancelar" pide la ficha, así que una pulsación
  accidental de Enter tampoco confirma la acción.
- **`modal.isAlert`** devuelve `true` cuando el `<dialog>` tiene
  `role="alertdialog"`; lo usa `_onBackdropClick` para no cerrar, y está
  disponible si tu propio código necesita la misma comprobación.

## Accesibilidad

- **`aria-labelledby`** en el `<dialog>` apunta al `<h2>` del título; es
  obligatorio para que el lector de pantalla anuncie de qué trata el
  diálogo al abrirse.
- **`tabindex="-1"` en el propio `<dialog>`**: permite enfocar el
  diálogo en sí (no solo sus controles), tal y como pide la ficha. Sin
  él, si algún día un diálogo se queda sin ningún control focable en el
  cuerpo (poco probable aquí, pero sí posible en un diálogo puramente
  informativo con solo texto), no habría ningún sitio donde depositar
  el foco al abrir.
- **Foco inicial**: pon `autofocus` en el control que deba recibir el
  foco al abrir (aquí, "Confirmar"). Si el diálogo es solo informativo,
  ponlo en el botón de cerrar. En diálogos con mucho texto, pon
  `autofocus` y `tabindex="-1"` en el título (o en un contenedor que
  envuelva el cuerpo) en vez de en un botón: si el foco arranca en el
  pie, un lector de pantalla que sigue el foco empieza a leer por el
  final y se salta el contenido.
- **No uses `<div role="dialog">` a mano** salvo que de verdad necesites
  soportar un navegador sin `<dialog>`; en ese caso, usa un polyfill
  (p. ej. `dialog-polyfill`) en vez de reimplementar el atrapado de foco.
- **Backdrop**: el clic fuera del contenido cierra el diálogo (ver
  `modal.js`), salvo en la variante alertdialog. `Escape` sigue siendo
  el cierre principal esperado por usuarios de teclado en ambos casos.
- **Modales anidados**: si abres un modal desde otro (p. ej. una
  confirmación sobre el modal de un formulario), cada `<dialog>`
  devuelve el foco por su cuenta al elemento que lo abrió con
  `showModal()` — el segundo modal lo devuelve a su disparador (dentro
  del primero), y el primero sigue intacto detrás. No hace falta
  gestionarlo a mano; solo evita anidar más de dos niveles, porque cada
  nivel adicional hace más difícil volver atrás con el teclado.
- **Patrón de referencia**: [WAI-ARIA APG — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  y [Alert and Message Dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
  para la variante alertdialog.

## Pruebas manuales recomendadas

- Abrir el modal y comprobar que `Tab` no se escapa a la página de
  detrás.
- Cerrar con `Escape` y comprobar que el foco vuelve al botón que abrió
  el modal.
- Con NVDA/VoiceOver, confirmar que se anuncia el título del diálogo al
  abrirse.
- En el alertdialog, confirmar que el foco arranca en el botón de cerrar
  (×) y que clicar el backdrop no lo cierra.

## Conformidad con la guía

Revisión de esta implementación frente a la ficha 09 (Modal) de la
guía.

**«Lo que te toca a ti»**:

- _`aria-labelledby` al título real y, si procede, `aria-describedby`_:
  hecho en ambas variantes; en el alertdialog, `aria-describedby`
  apunta al texto de la confirmación.
- _`tabindex="-1"` en el contenedor, para poder enfocarlo_: la tabla de
  la ficha lo pide para que Bootstrap pueda enfocar `.modal`. Aquí el
  `<dialog>` lleva el mismo `tabindex="-1"`, aunque con `<dialog>`
  nativo casi nunca hace falta en la práctica (`showModal()` ya enfoca
  el primer control focable del diálogo sin necesidad de `autofocus`):
  queda como red de seguridad para el caso de un diálogo sin ningún
  control focable en el cuerpo.
- _Mover el foco al elemento adecuado, porque `autofocus` no funciona en
  los modales de Bootstrap_: al usar `<dialog>.showModal()` nativo en
  vez del plugin de Bootstrap, el atributo `autofocus` del HTML sí
  funciona — no hace falta moverlo por JS en un evento `shown`.
- _Traducir `aria-label="Close"`_: el botón de cierre usa
  `aria-label="Cerrar diálogo"`.
- _No usar backdrop estático + `keyboard: false` salvo que sea
  imprescindible_: el bloqueo del backdrop solo se activa con
  `role="alertdialog"`, y solo para el clic — `Escape` nunca se
  desactiva, así el usuario de teclado siempre puede salir.
- _Gestionar a dónde vuelve el foco en modales anidados_: lo resuelve
  `<dialog>.showModal()` de forma nativa (ver «Modales anidados» más
  arriba); no ha hecho falta código adicional.

**«Errores frecuentes»** (comprobado que no se cometen aquí):

- Contenido del modal fuera de `.c-modal__content` o botones de acción
  fuera del diálogo — todo el contenido, incluidos los botones del pie,
  vive dentro del `<form method="dialog">`.
- Diálogos muy largos sin foco en el inicio — documentado en
  «Accesibilidad» con la alternativa de `tabindex="-1"` en el título.
- Modales que se abren solos al cargar la página sin nombre ni forma
  clara de cerrarlos — ningún ejemplo de este componente se abre solo;
  siempre requieren un disparador explícito y siempre tienen
  `aria-labelledby` y un botón de cierre visible.
