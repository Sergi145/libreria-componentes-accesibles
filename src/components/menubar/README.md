# Menubar (barra de menús)

Barra horizontal de acciones, cada una con un menú vertical desplegable
(Archivo, Editar, Vista…). Implementa el patrón
[WAI-ARIA APG — Menu Bar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/):
`role="menubar"`, roving tabindex horizontal, `menu` verticales con
`menuitem`, `menuitemcheckbox` y `menuitemradio`, y typeahead.

> **Dependencias:** `menubar.js` importa `../../utils/roving-tabindex.js`,
> `../../utils/dismiss.js`, `../../utils/typeahead.js` y
> `../../utils/menu.js`. Si copias la carpeta a otro proyecto, copia también
> esas cuatro. `dist/menubar/` es autónomo (Vite las empaqueta).

## Cuándo usarlo

- Acciones agrupadas en menús de aplicación (editor, herramientas).
- Sin submenús anidados: cada elemento de la barra abre un único menú.
- No es para navegación: una barra de enlaces usa [`Dropdown`](../dropdown).
  `role="menu"` con enlaces cambia el modo de lectura sin aportar nada.

## Uso

```html
<link rel="stylesheet" href="menubar.css" />

<ul class="c-menubar" role="menubar" aria-label="Edición">
  <li role="none">
    <button
      type="button"
      id="menu-archivo-btn"
      class="c-menubar__item"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded="false"
      aria-controls="menu-archivo"
    >
      Archivo
    </button>
    <ul
      id="menu-archivo"
      class="c-menubar__menu"
      role="menu"
      aria-labelledby="menu-archivo-btn"
      hidden
    >
      <li role="none">
        <button type="button" class="c-menubar__option" role="menuitem">
          Nuevo
        </button>
      </li>
    </ul>
  </li>
</ul>
```

```js
import { initMenubars } from './menubar.js';

initMenubars();
```

O con la clase: `new Menubar(barra)`, con `open(barItem, { focus: 'first' | 'last' })`,
`close({ returnFocus })`, `destroy()` y el getter `openMenu` (el `<ul role="menu">`
abierto o `null`).

Necesita JS, como [Menu Button](../menu-button): sin él los menús quedan
`hidden` y no se pueden abrir. Si la página debe funcionar sin JS, muestra
las acciones directamente en lugar de un menú.

## Teclado

| Tecla                                        | Acción                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tab                                          | Entra en la barra una sola vez (roving tabindex).                                                                         |
| ← / → (en la barra)                          | Elemento anterior / siguiente, con envoltura.                                                                             |
| ↓, Enter o Espacio (en un elemento con menú) | Abre el menú y enfoca su primer elemento.                                                                                 |
| ↑ (en un elemento con menú)                  | Abre el menú y enfoca su último elemento.                                                                                 |
| Una letra (en la barra)                      | Enfoca el siguiente elemento que empieza por ella (typeahead, búfer de 500 ms).                                           |
| Clic en un elemento de la barra              | Abre su menú; un segundo clic en el mismo elemento lo cierra.                                                             |
| ↑ / ↓ (en un menú)                           | Elemento anterior / siguiente, con envoltura.                                                                             |
| Inicio / Fin (en un menú)                    | Primer / último elemento.                                                                                                 |
| → / ← (en un menú)                           | Cierra ese menú y abre el del elemento siguiente / anterior de la barra, con envoltura.                                   |
| Una letra (en un menú)                       | Enfoca el siguiente elemento que empieza por ella (typeahead).                                                            |
| Enter, Espacio o clic en un `menuitem`       | Activa la acción, cierra el menú y devuelve el foco a su elemento de la barra.                                            |
| Enter, Espacio o clic en `menuitemcheckbox`  | Alterna `aria-checked`; no cierra.                                                                                        |
| Enter, Espacio o clic en `menuitemradio`     | Marca ese elemento y desmarca el resto de su grupo; no cierra.                                                            |
| Escape (en un menú)                          | Cierra y devuelve el foco a su elemento de la barra. Se cancela el evento, así que un `<dialog>` contenedor no se cierra. |
| Tab (en un menú)                             | Cierra sin forzar el foco; el foco sigue su orden natural.                                                                |
| Clic o foco fuera                            | Cierra sin devolver el foco.                                                                                              |

Un elemento de la barra sin menú (sin `aria-controls`) no abre nada: Enter,
Espacio y clic lo activan con su comportamiento nativo de botón.

## ARIA y estados

- `<ul role="menubar" aria-label>` con `<li role="none">` por elemento.
- Cada elemento de la barra es un `<button role="menuitem">` con
  `aria-haspopup="menu"`, `aria-expanded` (`"true"` mientras su menú está
  abierto) y `aria-controls` apuntando al menú.
- Cada menú es un `<ul role="menu">` con `aria-labelledby` hacia su
  elemento de la barra y `hidden` cuando está cerrado. Como mucho un menú
  está abierto a la vez.
- Casillas: `role="menuitemcheckbox"` con `aria-checked="true|false"`.
- Radios: `role="menuitemradio"` con `aria-checked`, dentro de un
  `role="group"` con `aria-label`. Marcar uno desmarca los demás del grupo.
- El estado marcado se ve también sin color: el indicador es un cuadro o un
  círculo que se rellena con `aria-checked="true"`, y en
  `forced-colors: active` el relleno pasa a un borde grueso.
- Sin JS, los menús quedan `hidden` y solo se ven los elementos de la barra.

## Pruebas manuales

Pendientes; no se han hecho todavía.

- [ ] Tab entra en la barra una sola vez; ← / → recorren con envoltura.
- [ ] ↓ abre con el foco en el primer elemento y `aria-expanded="true"`.
- [ ] → con un menú abierto lo cierra y abre el siguiente; Escape devuelve el foco al elemento de la barra.
- [ ] Una casilla alterna sin cerrar; un radio marca uno solo en su grupo.
- [ ] Con NVDA: se anuncian «menú», «elemento de menú», y «marcado / no marcado» en casillas y radios.
- [ ] Con VoiceOver: mismos anuncios que con NVDA.
- [ ] Dentro de un `<dialog>`: Escape cierra solo el menú.

## Conformidad con la guía

La guía `guia-componentes-accesibles-aria-bootstrap5.pdf` no está en el
repositorio, así que la referencia de este README es el patrón
[APG Menu Bar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

- Roles `menubar`, `menuitem`, `menu`, `menuitemcheckbox`,
  `menuitemradio`, `group` y `none` en la estructura, sin ARIA en
  elementos que ya tienen semántica nativa.
- Roving tabindex horizontal en la barra y vertical en el menú, con
  `rovingTabindex()`.
- Escape devuelve el foco al elemento de la barra; Tab cierra sin forzar el
  foco; clic o foco fuera cierran.
- Typeahead en la barra y en los menús con `createTypeahead()`.
- Sin submenús anidados, sin enlaces `<a role="menuitem">` ni menús
  verticales de barra: quedan fuera de alcance del SPEC 06.
