# Dropdown (navegación)

Lista de enlaces que se despliega desde un botón. Es un patrón
[Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) con
`dismissable`, **no un menú WAI-ARIA**: sin `role="menu"` ni
`menuitem`, y sin flechas ↑/↓ (se recorre con Tab).

> **Dependencias:** `dropdown.js` importa `../disclosure/disclosure.js` y
> `../../utils/dismiss.js`. Si copias la carpeta a otro proyecto, copia
> también esas dos. `dist/dropdown/` es autónomo (Vite las empaqueta).

## ¿Dropdown o Menu Button?

| Usa…                            | Cuando…                                              |
| ------------------------------- | ---------------------------------------------------- |
| **Dropdown** (este)             | La lista contiene **enlaces** que navegan a páginas. |
| [`Menu Button`](../menu-button) | La lista contiene **acciones** (Editar, Eliminar…).  |

La guía insiste en no confundirlos: `role="menu"` promete al usuario de
lector de pantalla un comportamiento de aplicación (flechas, typeahead)
que una lista de enlaces no tiene.

## Uso

```html
<link rel="stylesheet" href="dropdown.css" />

<div class="c-dropdown">
  <button
    type="button"
    class="c-dropdown__toggle"
    data-dropdown
    aria-expanded="false"
    aria-controls="dropdown-productos"
  >
    Productos
  </button>
  <ul id="dropdown-productos" class="c-dropdown__list" hidden>
    <li>
      <a class="c-dropdown__link" href="/software" aria-current="page"
        >Software</a
      >
    </li>
    <li><a class="c-dropdown__link" href="/hardware">Hardware</a></li>
  </ul>
</div>
```

```js
import { initDropdowns } from './dropdown.js';

initDropdowns();
```

O con la clase: `new Dropdown(button)`, con `open()`,
`close({ returnFocus })`, `toggle()`, `destroy()` y el getter `expanded`.

## Comportamiento

- **Enter / Espacio** (o clic) en el botón: abre y cierra.
- **Tab**: recorre los enlaces; al salir de la lista, el foco sigue su
  orden y la lista se cierra.
- **`Escape`**: cierra y devuelve el foco al botón.
- **Clic o foco fuera**: cierra sin mover el foco.
- La página actual se marca con `aria-current="page"`.
- Modificador `.c-dropdown--end`: alinea la lista al final. Sin volteo
  automático.

## Accesibilidad

- **Sin roles de menú.** No añadas `role="menu"`/`menuitem`.
- El disparador es un `<button>` con `aria-expanded` y `aria-controls`.
- Si el Dropdown es de navegación principal, envuélvelo en
  `<nav aria-label="…">`.
- No se usa dentro de la [`Navbar`](../navbar) en este spec.

## Pruebas manuales recomendadas

- Tab hasta el botón; Enter abre la lista y Tab recorre los enlaces.
- `Escape` con el foco en un enlace: la lista se cierra y el foco vuelve
  al botón.
- Tab desde el último enlace: la lista se cierra y el foco pasa al
  siguiente elemento de la página.
- Con NVDA/VoiceOver: se anuncia «contraído/expandido» y el enlace actual
  como «página actual».

## Conformidad con la guía

Ficha 08 (caso a: navegación) de
`guia-componentes-accesibles-aria-bootstrap5.pdf`.

- _No usar `role="menu"` para navegación_: la lista es un `<ul>` de
  enlaces, verificado por un test.
- _`aria-expanded` y cierre con Esc devolviendo el foco_: `Disclosure` +
  `dismissable`.
- _Cierre al perder el foco o clic fuera_: `dismissable`.
- _`aria-current="page"` en el activo_: presente en los ejemplos.
