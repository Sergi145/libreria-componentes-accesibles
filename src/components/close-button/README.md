# Close button

Botón de cierre reutilizable, solo CSS. Pensado para usarse dentro de
cualquier superficie que se pueda cerrar (modal, alerta, toast,
offcanvas…) — este componente solo define su aspecto; la lógica de
cerrar la superficie concreta vive en el componente que lo usa.

## Uso

```html
<link rel="stylesheet" href="close-button.css" />

<button type="button" class="c-close-button" aria-label="Cerrar">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</button>
```

No requiere JavaScript propio: es un `<button>` nativo, ya focable y
activable con `Espacio`/`Enter`. Cablea su `click` a la acción de cerrar
de tu componente (cerrar el `<dialog>`, quitar el toast del DOM…).

## Accesibilidad

- **`aria-label`**: el icono no aporta nombre accesible por sí solo
  (lleva `aria-hidden="true"`), así que el `aria-label` del `<button>` es
  su único nombre. Ajústalo al contexto cuando "Cerrar" sea ambiguo (por
  ejemplo, "Cerrar diálogo" o "Cerrar aviso" si hay varios cierres en la
  misma vista).
- **Icono decorativo**: `aria-hidden="true"` y `focusable="false"` en el
  `<svg>` (evita que quede como parada de `Tab` en navegadores antiguos
  que hacen focables los `<svg>` por defecto).
- **Objetivo táctil**: `24×24px` (`--target-size-min`), el mínimo de
  WCAG 2.2 (SC 2.5.8).
- **Contraste del icono**: usa `--color-text-muted` sobre fondo
  transparente/`--color-surface`, ≥ 10:1 en claro y ≥ 13:1 en oscuro —
  supera de sobra el 3:1 exigido a los objetos gráficos (SC 1.4.11).
- **Foco visible**: `:focus-visible` con el anillo `--color-focus-ring`.

## Pruebas manuales recomendadas

- Navegar con `Tab` hasta el botón y activarlo con `Espacio`/`Enter`.
- Con NVDA/VoiceOver, confirmar que se anuncia como "botón, Cerrar" (o el
  texto que le hayas puesto en `aria-label`), no como "botón" a secas ni
  con el nombre del `<svg>`.

## Conformidad con la guía

Revisión frente a la parte de «botón de cierre» de la ficha 25 (Cards,
badges, botón de cierre y scrollspy) de la guía — es la única que lo
menciona; el resto de esa ficha (cards, badges, scrollspy) no
corresponde a este componente y queda fuera de este spec.

**«Lo que ya hace Bootstrap»** (contexto): `.btn-close` es un
`<button>` con un icono SVG de fondo; los ejemplos oficiales ya
incluyen `aria-label="Close"`.

**«Lo que te toca a ti»**:

- _Traducir la etiqueta de cierre_: implementado —
  `aria-label="Cerrar"` en español en el HTML de referencia, no
  `"Close"`.

**«Errores frecuentes»**: la ficha no lista ninguno específico de este
control aislado — los suyos son sobre enlaces repetidos en cards y
sobre `alt` de imágenes, que no aplican a un botón de cierre.

**Añadido por esta implementación, más allá de lo que cubre la
ficha**: mínimo de objetivo táctil 24×24px explícito y
`focusable="false"` en el SVG (para navegadores antiguos que hacen
focables los `<svg>` por defecto) — la ficha no entra en ese detalle.
