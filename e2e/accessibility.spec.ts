import { test, expect } from '@playwright/test';
test('every game remains usable at 320px with very large Turkish text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Türkçe', exact: true }).click();
  await page.getByRole('button', { name: 'Çok büyük', exact: true }).click();
  for (const game of ['recognition', 'digits', 'simon', 'spatial', 'arithmetic', 'search', 'switch', 'reaction']) {
    await page.goto(`#/game/${game}`);
    await page.getByRole('button', { name: 'Oyuna başla', exact: true }).click();
    await expect(page.locator('.game-content')).toBeVisible();
    const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => element.className));
    expect(overflow, game).toEqual([]);
    await page.getByRole('button', { name: 'Oyunu bitir', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), game).toBe(true);
  }
});

test('spatial plateau uses at least 48px targets with large text on the smallest viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Sehr groß', exact: true }).click();
  await page.goto('#/game/spatial');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  for (let solved = 0; solved < 11; solved++) {
    await expect(page.locator('.marked')).not.toHaveCount(0);
    const marked = await page.locator('.spatial-cell').evaluateAll(items => items.map((item, index) => item.classList.contains('marked') ? index : -1).filter(index => index >= 0));
    await page.getByRole('button', { name: 'Muster ausblenden' }).click();
    for (const index of marked) await page.locator('.spatial-cell').nth(index).click();
    await page.getByRole('button', { name: 'Auswahl bestätigen' }).click();
    await expect(page.locator('.live-score')).toHaveText(String(solved + 1));
  }
  await expect(page.locator('.spatial-cell')).toHaveCount(16);
  for (const box of await page.locator('.spatial-cell').evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })))) {
    expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('storage denial remains playable and displays a clear warning', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new DOMException('Denied', 'SecurityError'); } });
  });
  await page.goto('#/game/recognition');
  await expect(page.getByText(/Dauerhaftes Speichern ist gerade nicht möglich/)).toBeVisible();
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await page.getByRole('button', { name: 'Neu', exact: true }).click();
  await expect(page.locator('.live-score')).toHaveText('1');
  await page.getByRole('button', { name: 'Partie beenden' }).click();
  await expect(page.locator('.result-score')).toContainText('1');
});

test('keyboard navigation and 200 percent text zoom preserve controls', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Kleine Spiele. Große Spielfreude.' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Zum Inhalt' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.goto('#/game/digits');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.digit-sequence')).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.setViewportSize({ width: 640, height: 480 });
  await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).click();
  await page.getByRole('button', { name: '1', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.number-output')).toHaveText('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('capture visual review artifacts at desktop and small phone sizes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('');
  await expect(page.locator('.game-card')).toHaveCount(8);
  await page.screenshot({ path: '.preview/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.preview/home-mobile.png', fullPage: true });
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Sehr groß', exact: true }).click();
  await page.getByRole('button', { name: 'Türkçe', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/game/arithmetic');
  await page.getByRole('button', { name: 'Oyuna başla', exact: true }).click();
  await expect(page.locator('.number-pad')).toBeVisible();
  await page.screenshot({ path: '.preview/arithmetic-mobile-large-tr.png', fullPage: true });
});
