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
