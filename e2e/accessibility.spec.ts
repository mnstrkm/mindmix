import { test, expect } from '@playwright/test';
test('every game remains usable at 320px with very large Turkish text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Türkçe', exact: true }).click();
  await page.getByRole('button', { name: 'Çok büyük', exact: true }).click();
  for (const game of ['recognition', 'digits', 'simon', 'spatial', 'arithmetic', 'search', 'switch', 'reaction']) {
    await page.goto(`#/game/${game}`);
    await page.getByRole('button', { name: 'Oyun nasıl oynanır?', exact: true }).click();
    await expect(page.locator('.guide')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${game} guide`).toBe(true);
    await page.getByRole('button', { name: 'Oyuna başla', exact: true }).click();
    await expect(page.locator('.game-content')).toBeVisible();
    const overflow = await page.evaluate(() => [...document.querySelectorAll('main *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).map(element => element.className));
    expect(overflow, game).toEqual([]);
    await page.getByRole('button', { name: 'Oyunu bitir', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), game).toBe(true);
  }
});

test('spatial 8 by 4 plateau keeps 48px targets with large text on the smallest viewport', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Sehr groß', exact: true }).click();
  await page.goto('#/game/spatial');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  for (let solved = 0; solved < 28; solved++) {
    await expect(page.locator('.marked')).not.toHaveCount(0);
    const marked = await page.locator('.spatial-cell').evaluateAll(items => items.map((item, index) => item.classList.contains('marked') ? index : -1).filter(index => index >= 0));
    await page.getByRole('button', { name: 'Muster ausblenden' }).click();
    for (const index of marked) await page.locator('.spatial-cell').nth(index).click();
    await page.getByRole('button', { name: 'Auswahl bestätigen' }).click();
    await expect(page.locator('.live-score')).toHaveText(String(solved + 1));
  }
  await expect(page.locator('.spatial-cell')).toHaveCount(32);
  for (const box of await page.locator('.spatial-cell').evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })))) {
    expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('dark mode is the default and the light choice persists', async ({ page }) => {
  await page.goto('#/settings');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Hell', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dunkel', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('reaction records show average and fastest independently while preserving old medians', async ({ page }) => {
  await page.addInitScript(() => {
    const base = { game: 'reaction', variant: 'default', actions: 5, eligible: true, date: '2026-10-18T12:00:00Z' };
    localStorage.setItem('mindmix:data', JSON.stringify({ version: 1, settings: {}, history: [], records: [
      { ...base, id: 'average', ruleVersion: 2, score: 310 },
      { ...base, id: 'fastest', ruleVersion: 2, metric: 'fastest', score: 180 },
      { ...base, id: 'old-median', ruleVersion: 1, score: 190 },
    ] }));
  });
  await page.goto('#/game/reaction');
  await expect(page.locator('.best-summary')).toContainText('310 ms');
  await expect(page.locator('.secondary-record')).toContainText('180 ms');
  await page.getByRole('link', { name: 'Bestleistungen', exact: true }).click();
  const reaction = page.locator('.record-card').filter({ has: page.getByRole('heading', { name: 'Reaktions-Challenge', exact: true }) });
  await expect(reaction).toContainText('Bester Durchschnitt');
  await expect(reaction).toContainText('Schnellste Einzelzeit');
  await reaction.locator('summary').click();
  await expect(reaction).toContainText('Median, frühere Wertung');
  await expect(reaction).toContainText('190 ms');
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
  await expect(page.getByRole('heading', { name: 'Acht Spiele. Dein Tempo.' })).toBeVisible();
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
  await page.goto('#/game/reaction');
  await page.getByRole('button', { name: 'Oyun nasıl oynanır?', exact: true }).click();
  await expect(page.locator('.guide')).toBeVisible();
  await page.screenshot({ path: '.preview/reaction-guide-mobile-tr.png', fullPage: true });
});
