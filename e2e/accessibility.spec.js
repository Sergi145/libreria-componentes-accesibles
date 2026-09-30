import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Auditoría automática con axe-core sobre cada historia de Storybook.
 * Esto detecta un subconjunto de problemas (contraste, atributos ARIA
 * inválidos, roles incorrectos…); NO sustituye la prueba manual con
 * teclado y lector de pantalla — ver los README de cada componente.
 */
const stories = [
  { id: 'componentes-button--primary', name: 'Button / primary' },
  { id: 'componentes-accordion--varios-abiertos', name: 'Accordion' },
  { id: 'componentes-modal--default', name: 'Modal' },

  // Button: ToggleButton, botón solo icono, enlace-botón deshabilitado
  { id: 'componentes-button--toggle', name: 'Button / toggle (aria-pressed)' },
  { id: 'componentes-button--solo-icono', name: 'Button / solo icono' },
  {
    id: 'componentes-button--enlace-deshabilitado',
    name: 'Button / enlace deshabilitado',
  },

  // Close button
  { id: 'componentes-button-close-button--default', name: 'Close button' },
  {
    id: 'componentes-button-close-button--en-un-panel',
    name: 'Close button / en un panel',
  },

  // Toolbar
  { id: 'componentes-toolbar--horizontal', name: 'Toolbar / horizontal' },
  { id: 'componentes-toolbar--vertical', name: 'Toolbar / vertical' },

  // Tabs
  { id: 'componentes-tabs--automatica', name: 'Tabs / activación automática' },
  { id: 'componentes-tabs--manual', name: 'Tabs / activación manual' },
  { id: 'componentes-tabs--vertical', name: 'Tabs / vertical' },

  // Breadcrumb
  { id: 'componentes-breadcrumb--default', name: 'Breadcrumb' },
  {
    id: 'componentes-breadcrumb--ruta-profunda',
    name: 'Breadcrumb / ruta profunda',
  },

  // Skip link
  { id: 'componentes-skip-link--default', name: 'Skip link' },

  // Navbar
  { id: 'componentes-navbar--default', name: 'Navbar' },
  { id: 'componentes-navbar--reflow-320-px', name: 'Navbar / reflow 320px' },

  // Pagination
  { id: 'componentes-pagination--default', name: 'Pagination' },
  {
    id: 'componentes-pagination--primera-pagina',
    name: 'Pagination / primera página',
  },
  {
    id: 'componentes-pagination--ultima-pagina',
    name: 'Pagination / última página',
  },

  // List group
  {
    id: 'componentes-list-group--lista-informativa',
    name: 'List group / lista informativa',
  },
  {
    id: 'componentes-list-group--enlaces-de-navegacion',
    name: 'List group / enlaces de navegación',
  },
  {
    id: 'componentes-list-group--botones-de-accion',
    name: 'List group / botones de acción',
  },
  {
    id: 'componentes-list-group--como-pestanas-verticales',
    name: 'List group / como pestañas verticales',
  },

  // Modal: alertdialog
  { id: 'componentes-modal--alert-dialog', name: 'Modal / alertdialog' },

  // Offcanvas
  { id: 'componentes-offcanvas--start', name: 'Offcanvas / inicio' },
  { id: 'componentes-offcanvas--end', name: 'Offcanvas / fin' },
  { id: 'componentes-offcanvas--top', name: 'Offcanvas / arriba' },
  { id: 'componentes-offcanvas--bottom', name: 'Offcanvas / abajo' },
  {
    id: 'componentes-offcanvas--responsive-movil',
    name: 'Offcanvas / responsive móvil',
  },
  {
    id: 'componentes-offcanvas--responsive-escritorio',
    name: 'Offcanvas / responsive escritorio',
  },

  // Tooltip
  {
    id: 'componentes-tooltip--texto-complementario',
    name: 'Tooltip / texto complementario',
  },
  { id: 'componentes-tooltip--solo-icono', name: 'Tooltip / solo icono' },
  {
    id: 'componentes-tooltip--colocacion-automatica',
    name: 'Tooltip / colocación automática',
  },
  {
    id: 'componentes-tooltip--elemento-deshabilitado',
    name: 'Tooltip / elemento deshabilitado',
  },

  // Popover
  { id: 'componentes-popover--iban', name: 'Popover' },
  {
    id: 'componentes-popover--con-titulo-arriba',
    name: 'Popover / con título arriba',
  },

  // Dropdown
  { id: 'componentes-dropdown--navegacion', name: 'Dropdown / navegación' },

  // Menu Button
  { id: 'componentes-menu-button--acciones', name: 'Menu Button / acciones' },
  {
    id: 'componentes-menu-button--casillas-y-radios',
    name: 'Menu Button / casillas y radios',
  },
  {
    id: 'componentes-menu-button--boton-partido',
    name: 'Menu Button / botón partido',
  },
  {
    id: 'componentes-menu-button--dentro-de-un-modal',
    name: 'Menu Button / dentro de un modal',
  },

  // Alert
  { id: 'componentes-alert--variantes', name: 'Alert / variantes' },
  { id: 'componentes-alert--descartable', name: 'Alert / descartable' },
  { id: 'componentes-alert--dinamica', name: 'Alert / dinámica' },

  // Toast
  { id: 'componentes-toast--variantes', name: 'Toast / variantes' },
  { id: 'componentes-toast--dinamica', name: 'Toast / dinámica' },

  // Progress
  { id: 'componentes-progress--determinado', name: 'Progress / determinado' },
  {
    id: 'componentes-progress--indeterminado',
    name: 'Progress / indeterminado',
  },
  { id: 'componentes-progress--simulado', name: 'Progress / simulado' },

  // Spinner
  { id: 'componentes-spinner--tamanos', name: 'Spinner / tamaños' },
  { id: 'componentes-spinner--dinamico', name: 'Spinner / dinámico' },

  // Placeholder
  { id: 'componentes-placeholder--tarjeta', name: 'Placeholder / tarjeta' },
  { id: 'componentes-placeholder--perfil', name: 'Placeholder / perfil' },
  { id: 'componentes-placeholder--simulado', name: 'Placeholder / simulado' },

  // Badge
  { id: 'componentes-badge--variantes', name: 'Badge / variantes' },
  { id: 'componentes-badge--en-boton', name: 'Badge / contador en un botón' },
  {
    id: 'componentes-badge--en-encabezado',
    name: 'Badge / contador en un encabezado',
  },

  // Card
  { id: 'componentes-card--basica', name: 'Card / básica' },
  { id: 'componentes-card--clicable', name: 'Card / clicable' },
  { id: 'componentes-card--con-badge', name: 'Card / con badge' },

  // Carousel
  { id: 'componentes-carousel--basica', name: 'Carousel / básica' },
  {
    id: 'componentes-carousel--automatico',
    name: 'Carousel / automático',
  },

  // Scrollspy
  { id: 'componentes-scrollspy--basica', name: 'Scrollspy / básica' },

  // Text field
  { id: 'componentes-text-field--basicos', name: 'Text field / básicos' },
  { id: 'componentes-text-field--invalido', name: 'Text field / inválido' },
  {
    id: 'componentes-text-field--textarea-y-select',
    name: 'Text field / textarea y select',
  },
  {
    id: 'componentes-text-field--formulario',
    name: 'Text field / formulario con resumen de errores',
  },
  {
    id: 'componentes-text-field--deshabilitado-y-solo-lectura',
    name: 'Text field / deshabilitado y solo lectura',
  },

  // Checkbox
  { id: 'componentes-checkbox--basicas', name: 'Checkbox / básicas' },
  {
    id: 'componentes-checkbox--deshabilitada',
    name: 'Checkbox / deshabilitada',
  },
  { id: 'componentes-checkbox--obligatoria', name: 'Checkbox / obligatoria' },
  {
    id: 'componentes-checkbox--estado-mixto',
    name: 'Checkbox / estado mixto',
  },

  // Radio group
  { id: 'componentes-radio-group--basico', name: 'Radio group / básico' },
  {
    id: 'componentes-radio-group--obligatorio',
    name: 'Radio group / obligatorio',
  },

  // Switch
  { id: 'componentes-switch--apagado', name: 'Switch / apagado' },
  { id: 'componentes-switch--encendido', name: 'Switch / encendido' },
  { id: 'componentes-switch--deshabilitado', name: 'Switch / deshabilitado' },

  // Range
  { id: 'componentes-range--basico', name: 'Range / básico' },
  {
    id: 'componentes-range--formato-personalizado',
    name: 'Range / formato personalizado',
  },
  { id: 'componentes-range--sin-js', name: 'Range / sin JavaScript' },
  { id: 'componentes-range--deshabilitado', name: 'Range / deshabilitado' },

  // Table
  { id: 'componentes-table--ordenable', name: 'Table / ordenable' },
  {
    id: 'componentes-table--desplazamiento-horizontal',
    name: 'Table / desplazamiento horizontal',
  },
  { id: 'componentes-table--sin-js', name: 'Table / sin JavaScript' },
];

for (const story of stories) {
  test(`${story.name} no tiene violaciones de accesibilidad detectables por axe`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    // Acota el análisis al contenido de la historia: el documento del
    // iframe de Storybook es solo un contenedor de piezas sueltas, no
    // una página completa, así que reglas de documento completo como
    // "landmark-one-main" o "page-has-heading-one" no aplican aquí (sí
    // se auditan en una página real que use estos componentes).
    const results = await new AxeBuilder({ page })
      .include('#storybook-root')
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('Modal: Escape cierra el diálogo y devuelve el foco al trigger', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=componentes-modal--default&viewMode=story');

  const trigger = page.getByRole('button', { name: 'Abrir modal' });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Confirmar acción' });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Accordion: las flechas mueven el foco entre cabeceras', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-accordion--varios-abiertos&viewMode=story'
  );

  const first = page.getByRole('button', { name: '¿Qué es esta librería?' });
  const second = page.getByRole('button', {
    name: '¿Necesito JavaScript para usarlo?',
  });

  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(second).toBeFocused();
});

test('Toolbar: las flechas mueven el foco entre controles, cruzando subgrupos', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-toolbar--horizontal&viewMode=story'
  );

  const negrita = page.getByRole('button', { name: 'Negrita' });
  const cursiva = page.getByRole('button', { name: 'Cursiva' });
  const subrayado = page.getByRole('button', { name: 'Subrayado' });
  const izquierda = page.getByRole('button', { name: 'Izquierda' });

  await negrita.focus();
  await page.keyboard.press('ArrowRight');
  await expect(cursiva).toBeFocused();

  // El roving tabindex es uno solo para toda la toolbar: la flecha
  // cruza del subgrupo "Estilo de texto" al subgrupo "Alineación".
  await subrayado.focus();
  await page.keyboard.press('ArrowRight');
  await expect(izquierda).toBeFocused();
});

test('Tabs: con activación automática, la flecha mueve el foco y selecciona la pestaña', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-tabs--automatica&viewMode=story'
  );

  const datos = page.getByRole('tab', { name: 'Datos personales' });
  const seguridad = page.getByRole('tab', { name: 'Seguridad' });

  await datos.focus();
  await page.keyboard.press('ArrowRight');
  await expect(seguridad).toBeFocused();
  await expect(seguridad).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Seguridad' })).toBeVisible();
});

test('Tabs: con activación manual, la flecha no selecciona pero Enter sí', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=componentes-tabs--manual&viewMode=story');

  const datos = page.getByRole('tab', { name: 'Datos personales' });
  const seguridad = page.getByRole('tab', { name: 'Seguridad' });

  await datos.focus();
  await page.keyboard.press('ArrowRight');
  await expect(seguridad).toBeFocused();
  await expect(seguridad).toHaveAttribute('aria-selected', 'false');

  await page.keyboard.press('Enter');
  await expect(seguridad).toHaveAttribute('aria-selected', 'true');
});

test('Offcanvas: Tab no saca el foco del panel; Escape lo cierra y devuelve el foco', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-offcanvas--start&viewMode=story'
  );

  const trigger = page.getByRole('button', { name: 'Abrir filtros' });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Filtros' });
  await expect(dialog).toBeVisible();

  // Más pulsaciones que controles (× + 2 casillas). El <dialog> modal
  // nativo pasa el foco por la interfaz del navegador (activeElement =
  // <body>) al dar la vuelta, pero nunca lo deja en la página de fondo,
  // que está inerte: el foco está en el panel o en <body>, nunca fuera.
  const focusInsideDialog = () =>
    page.evaluate(() => {
      const active = document.activeElement;
      return active === document.body || !!active?.closest('dialog[open]');
    });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await focusInsideDialog()).toBe(true);
  }
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await focusInsideDialog()).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Menu Button: ↓ abre, las flechas recorren y Escape devuelve el foco', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-menu-button--acciones&viewMode=story'
  );

  const button = page.getByRole('button', { name: 'Acciones' });
  await button.focus();
  await page.keyboard.press('ArrowDown');

  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Duplicar' })).toBeFocused();

  // Archivar está deshabilitado: se salta.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Eliminar' })).toBeFocused();

  await page.keyboard.press('e');
  await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
});

test('Menu Button: ↑ abre con el foco en el último y Tab cierra el menú', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-menu-button--acciones&viewMode=story'
  );

  const button = page.getByRole('button', { name: 'Acciones' });
  await button.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menuitem', { name: 'Eliminar' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Menu Button: dentro de un Modal, Escape cierra el menú y el Modal sigue abierto', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-menu-button--dentro-de-un-modal&viewMode=story'
  );

  await page.getByRole('button', { name: 'Abrir modal' }).click();
  const dialog = page.getByRole('dialog', { name: 'Documento' });
  await expect(dialog).toBeVisible();

  const button = page.getByRole('button', { name: 'Acciones' });
  await button.focus();
  await page.keyboard.press('ArrowDown');
  await expect(button).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog).toBeVisible();
  await expect(button).toBeFocused();
});

test('Tooltip: Escape lo oculta sin mover el foco', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=componentes-tooltip--texto-complementario&viewMode=story'
  );

  const trigger = page.getByRole('button', { name: 'Guardar' });
  // Antes de enfocar, la descripción ya está en el árbol de
  // accesibilidad (el tooltip no usa `hidden`): así NVDA la anuncia al
  // tabular hasta el botón.
  await expect(trigger).toHaveAccessibleDescription('Atajo: Ctrl + S');

  await trigger.focus();
  // Oculto solo visualmente (recorte CSS), por eso se comprueba el
  // estado `data-visible` y no la visibilidad de Playwright.
  const tooltip = page.locator('[role="tooltip"]');
  await expect(tooltip).toHaveAttribute('data-visible', '');
  await expect(trigger).toHaveAccessibleDescription('Atajo: Ctrl + S');

  await page.keyboard.press('Escape');
  await expect(tooltip).not.toHaveAttribute('data-visible', '');
  await expect(trigger).toBeFocused();
});

test('Tooltip: los tres tipos de disparador tienen nombre y descripción antes de enfocar', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-tooltip--solo-icono&viewMode=story'
  );
  await expect(
    page.getByRole('button', { name: 'Copiar enlace' })
  ).toBeVisible();

  await page.goto(
    '/iframe.html?id=componentes-tooltip--elemento-deshabilitado&viewMode=story'
  );
  await expect(page.locator('[tabindex="0"]')).toHaveAccessibleDescription(
    'Completa el formulario para continuar'
  );
});

test('Tooltip: se coloca solo en el lado donde no queda cortado', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-tooltip--colocacion-automatica&viewMode=story'
  );

  await page.getByRole('button', { name: 'Guardar' }).focus();
  const bubble = page.locator('[role="tooltip"]');
  await expect(bubble).toHaveAttribute('data-visible', '');
  // Pedido debajo (por defecto), pero en la caja no cabe: pasa a arriba.
  await expect(bubble).toHaveAttribute('data-placement', 'top');

  const box = await page.locator('#story-tooltip-caja').boundingBox();
  const rect = await bubble.boundingBox();
  expect(rect.y).toBeGreaterThanOrEqual(box.y - 0.5);
  expect(rect.y + rect.height).toBeLessThanOrEqual(box.y + box.height + 0.5);
});

test('Tooltip: con el ratón aparece a los 300 ms y se puede pasar a la burbuja sin que se oculte', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-tooltip--texto-complementario&viewMode=story'
  );

  const trigger = page.getByRole('button', { name: 'Guardar' });
  const bubble = page.locator('[role="tooltip"]');

  await trigger.hover();
  await page.waitForTimeout(100);
  await expect(bubble).not.toHaveAttribute('data-visible', '');
  await expect(bubble).toHaveAttribute('data-visible', '');

  // Hay un hueco entre el disparador y la burbuja: cruzarlo no debe
  // ocultarla (WCAG 1.4.13, hoverable).
  const box = await bubble.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 20,
  });
  await page.waitForTimeout(200);
  await expect(bubble).toHaveAttribute('data-visible', '');
});

test('Tooltip: el envoltorio enfocable de un botón deshabilitado usa el anillo de foco del sistema', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-tooltip--elemento-deshabilitado&viewMode=story'
  );

  const wrapper = page.locator('[tabindex="0"]');
  await wrapper.focus();
  await expect(wrapper).toBeFocused();
  await expect(wrapper).toHaveCSS('outline-width', '3px');
});

test('Dropdown: se abre con clic y con teclado, Escape devuelve el foco y un clic fuera lo cierra', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-dropdown--navegacion&viewMode=story'
  );

  const button = page.getByRole('button', { name: 'Productos' });
  const link = page.getByRole('link', { name: 'Hardware' });

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(link).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Software' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
  await expect(link).toBeHidden();

  await page.keyboard.press('Enter');
  await expect(link).toBeVisible();
  await page.mouse.click(600, 400);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Popover: Enter lo abre, Escape lo cierra con el foco en el disparador', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=componentes-popover--iban&viewMode=story');

  const button = page.getByRole('button', { name: '¿Qué es el IBAN?' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Código de 24 caracteres')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
});

test('Alert: cerrar con Enter quita la alerta y lleva el foco al campo indicado', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-alert--descartable&viewMode=story'
  );

  const close = page.getByRole('button', { name: 'Cerrar alerta' });
  const field = page.getByLabel('Correo electrónico');
  await close.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('.c-alert')).toHaveCount(0);
  await expect(field).toBeFocused();
});

test('Alert dinámica: solo hay una a la vez, tiene role="alert" y al cerrar el foco vuelve al botón', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=componentes-alert--dinamica&viewMode=story');

  const trigger = page.getByRole('button', { name: 'Mostrar error' });
  await trigger.click();
  await trigger.click();

  const alert = page.getByRole('alert');
  await expect(alert).toHaveCount(1);
  await expect(alert).toContainText('Error: No se pudo guardar el documento.');

  await expect(
    page.getByRole('button', { name: 'Cerrar alerta' })
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(alert).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Toast: no mueve el foco al mostrarse, el siguiente Tab es cerrar y Escape devuelve el foco', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=componentes-toast--dinamica&viewMode=story');

  const trigger = page.getByRole('button', { name: 'Mostrar aviso' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const close = page.getByRole('button', { name: 'Cerrar notificación' });
  await expect(close).toBeVisible();
  // Mostrar el toast no roba el foco.
  await expect(trigger).toBeFocused();

  // La región va justo después del disparador: el siguiente Tab es «Cerrar».
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(close).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Carousel: las flechas del selector cambian de diapositiva', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-carousel--basica&viewMode=story'
  );

  const first = page.getByRole('tab', { name: 'Diapositiva 1' });
  const second = page.getByRole('tab', { name: 'Diapositiva 2' });
  await first.focus();
  await expect(first).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('tabpanel', { name: '2 de 3' }).getByRole('heading')
  ).toHaveText('Teclado primero');
  await expect(page.getByRole('tabpanel', { name: '1 de 3' })).toBeHidden();
});

test('Carousel automático: rota solo, se detiene al enfocar un control y con el botón', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-carousel--automatico&viewMode=story'
  );

  const title = page.locator(
    '[data-carousel-slide]:not([hidden]) .c-carousel__title'
  );
  const slides = page.locator('[data-carousel-slides]');
  await expect(title).toHaveText('Bienvenida');
  await expect(slides).toHaveAttribute('aria-live', 'off');

  // Rota sola (la historia usa 4000 ms).
  await expect(title).toHaveText('Teclado primero', { timeout: 6000 });

  // Con el foco en un control, se detiene.
  await page.getByRole('button', { name: 'Diapositiva siguiente' }).focus();
  await expect(slides).toHaveAttribute('aria-live', 'polite');
  const parada = await title.innerText();
  await page.waitForTimeout(4600);
  await expect(title).toHaveText(parada);

  // «Detener» la para de forma permanente, aunque el foco salga.
  const stop = page.getByRole('button', {
    name: 'Detener rotación automática',
  });
  await stop.click();
  await expect(
    page.getByRole('button', { name: 'Iniciar rotación automática' })
  ).toBeVisible();
  await page.evaluate(() => document.activeElement?.blur());
  await page.mouse.move(0, 0);
  const detenida = await title.innerText();
  await page.waitForTimeout(4600);
  await expect(title).toHaveText(detenida);
});

test('Scrollspy: el enlace activo sigue al scroll y Enter salta a la sección sin mover el foco a otro sitio', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-scrollspy--basica&viewMode=story'
  );

  const current = page.locator('[data-scrollspy] [aria-current="true"]');
  await expect(current).toHaveText('Introducción');

  await page.evaluate(() => window.scrollTo(0, 380));
  await expect(current).toHaveText('Uso');
  await expect(current).toHaveCount(1);

  const link = page.getByRole('link', { name: 'Accesibilidad', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(current).toHaveText('Accesibilidad');
  // El scroll no mueve el foco: sigue en el enlace pulsado.
  await expect(link).toBeFocused();
});

test('Formulario: enviar vacío lleva el foco al resumen y un enlace enfoca su campo', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-text-field--formulario&viewMode=story'
  );

  await page.getByRole('button', { name: 'Enviar' }).click();

  const summary = page.locator('[data-error-summary]');
  await expect(summary).toBeFocused();
  await expect(summary).toContainText('Hay 2 errores en el formulario');

  const nameField = page.getByLabel('Nombre');
  await summary.getByRole('link').first().click();
  await expect(nameField).toBeFocused();
});

test('Radio group: las flechas mueven el foco y cambian la selección', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-radio-group--basico&viewMode=story'
  );

  const claro = page.getByRole('radio', { name: 'Claro' });
  const oscuro = page.getByRole('radio', { name: 'Oscuro' });
  const sistema = page.getByRole('radio', { name: 'Igual que el sistema' });

  await claro.focus();
  await page.keyboard.press('ArrowDown');

  await expect(oscuro).toBeFocused();
  await expect(oscuro).toBeChecked();
  await expect(claro).not.toBeChecked();

  // Tab entra en el grupo una sola vez: desde la opción marcada, Tab
  // saca el foco del grupo entero, no lo mueve a la siguiente opción.
  await oscuro.focus();
  await page.keyboard.press('Tab');
  await expect(sistema).not.toBeFocused();
  await expect(oscuro).not.toBeFocused();
});

test('Switch: Espacio alterna el estado', async ({ page }) => {
  await page.goto('/iframe.html?id=componentes-switch--apagado&viewMode=story');

  const toggle = page.getByRole('switch', { name: 'Modo oscuro' });
  await toggle.focus();
  await expect(toggle).not.toBeChecked();

  await page.keyboard.press('Space');

  await expect(toggle).toBeChecked();
});

test('Checkbox: activar el padre en estado mixto marca todas las hijas', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-checkbox--estado-mixto&viewMode=story'
  );

  const selectAll = page.getByRole('checkbox', { name: 'Seleccionar todo' });
  const pedidos = page.getByRole('checkbox', { name: 'Estado de mis pedidos' });
  const envios = page.getByRole('checkbox', {
    name: 'Actualizaciones de envío',
  });
  const ofertas = page.getByRole('checkbox', { name: 'Ofertas y promociones' });

  await expect(pedidos).toBeChecked();
  await expect(envios).not.toBeChecked();

  await selectAll.click();

  await expect(selectAll).toBeChecked();
  await expect(pedidos).toBeChecked();
  await expect(envios).toBeChecked();
  await expect(ofertas).toBeChecked();
});

test('Table: Enter en una cabecera ordena y mantiene el foco', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-table--ordenable&viewMode=story'
  );

  const clienteHeader = page.getByRole('button', { name: 'Cliente' });
  await clienteHeader.focus();
  await page.keyboard.press('Enter');

  await expect(clienteHeader).toBeFocused();
  const sortedHeader = page.locator('table[data-sortable] th[aria-sort]');
  await expect(sortedHeader).toHaveCount(1);
  await expect(sortedHeader).toHaveAttribute('aria-sort', 'ascending');

  const firstClient = page.locator(
    'table[data-sortable] tbody tr:first-child td:nth-child(2)'
  );
  await expect(firstClient).toHaveText('Andrés Pardo');
});
