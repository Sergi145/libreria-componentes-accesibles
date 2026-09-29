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
    <footer class="c-modal__footer">
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
    </footer>
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

## Accesibilidad

- **`aria-labelledby`** en el `<dialog>` apunta al `<h2>` del título; es
  obligatorio para que el lector de pantalla anuncie de qué trata el
  diálogo al abrirse.
- **Foco inicial**: pon `autofocus` en el control que deba recibir el
  foco al abrir (aquí, "Confirmar"). Si el diálogo es solo informativo,
  ponlo en el botón de cerrar.
- **No uses `<div role="dialog">` a mano** salvo que de verdad necesites
  soportar un navegador sin `<dialog>`; en ese caso, usa un polyfill
  (p. ej. `dialog-polyfill`) en vez de reimplementar el atrapado de foco.
- **Backdrop**: el clic fuera del contenido cierra el diálogo (ver
  `modal.js`), pero `Escape` sigue siendo el cierre principal esperado
  por usuarios de teclado.
- **Patrón de referencia**: [WAI-ARIA APG — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Pruebas manuales recomendadas

- Abrir el modal y comprobar que `Tab` no se escapa a la página de
  detrás.
- Cerrar con `Escape` y comprobar que el foco vuelve al botón que abrió
  el modal.
- Con NVDA/VoiceOver, confirmar que se anuncia el título del diálogo al
  abrirse.
