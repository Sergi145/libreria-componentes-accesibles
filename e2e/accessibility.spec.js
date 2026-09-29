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
];

for (const story of stories) {
  test(`${story.name} no tiene violaciones de accesibilidad detectables por axe`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    const results = await new AxeBuilder({ page }).analyze();
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
