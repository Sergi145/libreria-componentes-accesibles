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

| Clase | Uso |
|---|---|
| `.c-button--primary` | Acción principal de la vista (una por vista, idealmente) |
| `.c-button--secondary` | Acción alternativa |
| `.c-button--danger` | Acción destructiva (eliminar, cancelar suscripción…) |
| `.c-button--sm` / `.c-button--lg` | Tamaño |

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
