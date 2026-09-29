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

  // Disclosure
  { id: 'componentes-disclosure--cerrado', name: 'Disclosure / cerrado' },
  { id: 'componentes-disclosure--abierto', name: 'Disclosure / abierto' },

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

test('Disclosure: Enter alterna aria-expanded y muestra/oculta el panel', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=componentes-disclosure--cerrado&viewMode=story'
  );

  const trigger = page.getByRole('button', { name: 'Más información' });
  const panel = page.locator('.c-disclosure__panel');

  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await trigger.focus();
  await page.keyboard.press('Enter');

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
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
