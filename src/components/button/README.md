# Button

Botón de acción básico. Usa un `<button>` nativo: no requiere JavaScript
para ser accesible (foco por teclado, activación con `Espacio`/`Enter`,
rol y estado anunciados automáticamente).

## Uso

```html
<link rel="stylesheet" href="button.css" />

<button type="button" class="c-button c-button--primary">
  Guardar cambios
</button>
```

```js
// Opcional: solo si necesitas un estado de "cargando" accesible
import { Button } from './button.js';

const instance = new Button(document.querySelector('.c-button'));
instance.setLoading(true, 'Guardando…');
```

## Variantes

| Clase                             | Uso                                                      |
| --------------------------------- | -------------------------------------------------------- |
| `.c-button--primary`              | Acción principal de la vista (una por vista, idealmente) |
| `.c-button--secondary`            | Acción alternativa                                       |
| `.c-button--danger`               | Acción destructiva (eliminar, cancelar suscripción…)     |
| `.c-button--sm` / `.c-button--lg` | Tamaño                                                   |

## ToggleButton (botón con estado pulsado/no pulsado)

Implementa el patrón [WAI-ARIA APG — Button (Toggle)](https://www.w3.org/WAI/ARIA/apg/patterns/button/):
un botón con dos estados, expuestos con `aria-pressed`, sin cambiar su
texto visible (por ejemplo "Favorito", "Negrita", "Silenciar").

```html
<button
  type="button"
  class="c-button c-button--secondary"
  data-toggle-button
  aria-pressed="false"
>
  Favorito
</button>
```

```js
import { ToggleButton, initToggleButtons } from './button.js';

const fav = new ToggleButton(document.querySelector('[data-toggle-button]'));
fav.pressed; // false
fav.toggle(); // alterna aria-pressed
fav.pressed = true; // también se puede fijar directamente

// O, para inicializar todos los que haya en la página:
initToggleButtons();
```

- Si el HTML no trae `aria-pressed`, `ToggleButton` lo inicializa en `"false"`.
- Un clic alterna `aria-pressed` entre `"true"` y `"false"` sin tocar el
  texto del botón; el estado pulsado se distingue visualmente con el
  estilo `[aria-pressed="true"]` de `button.css`.
- No confundir con un botón deshabilitado ni con una casilla de
  verificación: `ToggleButton` es para acciones con dos estados
  persistentes, no para seleccionar opciones de un formulario (para eso,
  usa `<input type="checkbox">`).

## Botón solo icono

Cuando el botón no tiene texto visible, el icono (siempre con
`aria-hidden="true"`) no aporta nombre accesible, así que hay que dárselo
con `aria-label` en el propio `<button>`:

```html
<button type="button" class="c-button c-button--secondary" aria-label="Buscar">
  <svg
    class="c-button__icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    …
  </svg>
</button>
```

## Enlace usado como botón, deshabilitado

Un `<a>` sin `href` no tiene ningún rol implícito (ni "link" ni "button")
ni es focable, así que no forma parte del orden de tabulación de forma
nativa (no hace falta `tabindex="-1"` ni JavaScript). Añade `role="button"`
para que se anuncie con el rol correcto a quien lo encuentre por otra vía
que no sea `Tab` (lectura secuencial, navegación "por todos los
elementos"...), y `aria-disabled="true"` para anunciarlo además como
deshabilitado:

```html
<a class="c-button c-button--secondary" role="button" aria-disabled="true">
  Editar (no disponible)
</a>
```

El rol no lo hace focable — eso solo lo daría `href` o `tabindex`, y aquí
no queremos ninguno de los dos.

No uses esta variante si el enlace sí tiene una URL de destino válida:
en ese caso, usa un `<button>` real o resuelve el estado deshabilitado en
el servidor (no muestres el enlace en absoluto).

## Accesibilidad

- **Elemento correcto**: siempre `<button type="button">` (o `type="submit"`
  dentro de un `<form>`). Nunca un `<div>` o `<a>` sin `href` con `onclick`.
- **Texto del botón**: describe la acción ("Guardar cambios", no "Enviar").
  Si el botón es solo icono, añade `aria-label`.
- **Foco visible**: el anillo de foco usa `:focus-visible`, por lo que
  solo aparece con teclado, no al hacer clic con el ratón.
- **Deshabilitado**: usa `disabled` cuando la acción no debe ser anunciada
  ni alcanzable; usa `aria-disabled="true"` (sin `disabled`) cuando quieras
  que el botón siga siendo enfocable y anunciado como deshabilitado — es
  el enfoque que usa el estado de carga de `Button.setLoading()`.
- **Objetivo táctil**: la altura mínima (2.5rem / 40px) supera el mínimo
  de 24×24px de WCAG 2.2 (SC 2.5.8).
- **Patrón de referencia**: [WAI-ARIA APG — Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Pruebas manuales recomendadas

- Navegar con `Tab` y activar con `Espacio` y `Enter`.
- Comprobar con NVDA/VoiceOver que se anuncia como "botón" + el texto.
- Verificar el contraste del texto sobre cada variante (≥ 4.5:1).
