# Menu Button (acciones)

Botón que abre un menú de **acciones** de aplicación. Implementa el
patrón [WAI-ARIA APG — Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/):
`role="menu"`, `menuitem`, flechas, Inicio/Fin, typeahead, casillas,
radios y botón partido.

> **Dependencias:** `menu-button.js` importa `../../utils/roving-tabindex.js`
> y `../../utils/dismiss.js`. Si copias la carpeta a otro proyecto, copia
> también esas dos. `dist/menu-button/` es autónomo (Vite las empaqueta).

## ¿Menu Button o Dropdown?

| Usa…                      | Cuando…                                              |
| ------------------------- | ---------------------------------------------------- |
| **Menu Button** (este)    | La lista contiene **acciones** (Editar, Eliminar…).  |
| [`Dropdown`](../dropdown) | La lista contiene **enlaces** que navegan a páginas. |

`role="menu"` cambia el modo de lectura de los lectores de pantalla:
no lo uses para listas de enlaces.

## Uso

```html
<link rel="stylesheet" href="menu-button.css" />

<div class="c-menu-button">
  <button
    type="button"
    id="menu-acciones-btn"
    class="c-menu-button__toggle"
    data-menu-button
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="menu-acciones"
  >
    Acciones
  </button>
  <ul
    id="menu-acciones"
    class="c-menu-button__menu"
    role="menu"
    aria-labelledby="menu-acciones-btn"
    hidden
  >
    <li role="none">
      <button type="button" class="c-menu-button__item" role="menuitem">
        Editar
      </button>
    </li>
  </ul>
</div>
```

```js
import { initMenuButtons } from './menu-button.js';

initMenuButtons();
```

O con la clase: `new MenuButton(button)`, con `open({ focus: 'first' | 'last' })`,
`close({ returnFocus })`, `destroy()` y el getter `expanded`.

## Teclado

| Tecla                             | Acción                                                         |
| --------------------------------- | -------------------------------------------------------------- |
| Enter / Espacio / ↓ (en el botón) | Abre y enfoca el primer elemento.                              |
| ↑ (en el botón)                   | Abre y enfoca el último.                                       |
| ↓ / ↑ (en el menú)                | Siguiente / anterior, con envoltura; salta los deshabilitados. |
| Inicio / Fin                      | Primero / último.                                              |
| Una letra                         | Enfoca el siguiente elemento que empieza por ella (sin búfer). |
| Enter / Espacio en un `menuitem`  | Activa, cierra y devuelve el foco al botón.                    |
| `Escape`                          | Cierra y devuelve el foco al botón.                            |
| Tab                               | Cierra; el foco sigue su orden natural.                        |

`Escape` se cancela al cerrar el menú, así que un menú dentro de un
[`Modal`](../modal) no cierra también el diálogo.

## Casillas y radios

- `role="menuitemcheckbox"` con `aria-checked`: alterna y **no cierra**.
- `role="menuitemradio"` dentro de un `role="group"` con nombre
  (`aria-label`): marca uno y desmarca el resto del grupo; no cierra.
- El indicador visual sale del CSS a partir de `aria-checked`.

## Botón partido

Envoltorio `.c-menu-button--split` con la acción principal
(`.c-menu-button__action`) y el botón de la flecha
(`.c-menu-button__toggle`) con `aria-label="Más opciones de <acción>"`.
`MenuButton` se engancha al botón de la flecha.

## Posición

Menú debajo y alineado al inicio; `.c-menu-button--end` lo alinea al
final (propiedades lógicas, respeta `dir="rtl"`). **No hay volteo
automático:** cerca del borde del viewport puede salirse.

## Accesibilidad

- Cada `<li>` lleva `role="none"` y cada acción es un `<button
role="menuitem">`.
- El menú se nombra con `aria-labelledby` apuntando al botón.
- Los elementos deshabilitados usan `disabled` y se saltan con flechas.
- El estado vive en `aria-expanded`, `aria-checked` y `hidden`.
- Sin menús anidados ni Menubar (SPEC 05).

## Pruebas manuales recomendadas

- Enter, Espacio y ↓ abren con el foco en el primer elemento; ↑ en el
  último.
- Flechas, Inicio, Fin y letras mueven el foco; Escape vuelve al botón.
- Tab cierra y pasa al siguiente control de la página.
- Con NVDA/VoiceOver: se anuncia «menú», «elemento de menú», y «marcado /
  no marcado» en casillas y radios.
- Dentro de un Modal: Escape cierra solo el menú.

## Conformidad con la guía

Ficha 08 (caso b: acciones) de
`guia-componentes-accesibles-aria-bootstrap5.pdf`.

- _`role="menu"`/`menuitem`/`none`, `aria-haspopup`, `aria-expanded`,
  `aria-controls`_: en el marcado de todos los ejemplos.
- _Flechas, Inicio/Fin, ↑ abre al final_: `rovingTabindex` y
  `keydown` del botón, cubiertos por tests.
- _Esc devuelve el foco; Tab cierra_: `dismissable` y `keydown` de Tab.
- _Typeahead, casillas, radios y botón partido_: implementados y
  probados.
- _No usar `role="menu"` para navegación_: para eso está `Dropdown`.
