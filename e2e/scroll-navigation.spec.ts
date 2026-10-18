import { test, expect } from '@playwright/test';

test('header opens the top while explicit discovery and result menu include the full catalog heading', async ({ page }) => {
  for (const [width, height] of [[320, 640], [390, 844], [1366, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto('#/settings');
    await page.getByRole('link', { name: 'Spiele', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator('.hero h1')).toBeInViewport();
    await page.getByRole('link', { name: 'Spiele entdecken', exact: true }).click();
    await expect(page.locator('#game-list')).toBeFocused();
    const discoveryTop = await page.locator('#game-selection').evaluate(element => element.getBoundingClientRect().top);
    expect(discoveryTop).toBeGreaterThanOrEqual(24);
    expect(discoveryTop).toBeLessThanOrEqual(64);
    await expect(page.locator('.catalog .eyebrow')).toBeInViewport({ ratio: 1 });
    await page.getByRole('link', { name: 'Visuelle Suche öffnen', exact: true }).click();
    await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
    await expect(page.locator('.search-grid')).toBeVisible();
    await page.getByRole('button', { name: 'Partie beenden', exact: true }).click();
    await page.getByRole('link', { name: 'Zum Menü', exact: true }).click();
    await expect(page.locator('#game-list')).toBeFocused();
    await expect.poll(() => page.locator('#game-selection').evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(discoveryTop, 0);
    await expect(page.locator('.catalog .eyebrow')).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: `.preview/catalog-1.3.1-${width}.png` });
    // The header also clears the catalog target when the pathname is already '/'.
    await page.getByRole('link', { name: 'Spiele', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
});

test('recognition archives are hidden without deleting records, and the comparison note has spacing', async ({ page }) => {
  await page.addInitScript(() => {
    const base = { game: 'recognition', variant: 'default', contentVersion: 1, actions: 10, date: '2026-10-18T12:00:00Z' };
    localStorage.setItem('mindmix:data', JSON.stringify({ version: 1, settings: {}, history: [], records: [
      { ...base, id: 'old-de', language: 'de', ruleVersion: 2, score: 80 },
      { ...base, id: 'current-de', language: 'de', ruleVersion: 3, score: 10 },
      { ...base, id: 'current-tr', language: 'tr', ruleVersion: 3, score: 12 },
    ] }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('#/records');
  const recognition = page.locator('.record-card').filter({ has: page.getByRole('heading', { name: 'Schon gesehen?', exact: true }) });
  await expect(recognition.locator('.record-line')).toHaveCount(2);
  await expect(recognition.locator('summary')).toHaveCount(0);
  await expect(recognition).toContainText('10 richtige Entscheidungen');
  await expect(recognition).toContainText('12 richtige Entscheidungen');
  const gap = await page.evaluate(() => document.querySelector('.records-note')!.getBoundingClientRect().top - document.querySelector('.record-grid')!.getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(30);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mindmix:data')!).records)).toHaveLength(3);
  await page.goto('#/game/recognition');
  await expect(page.getByRole('link', { name: /Frühere Bestleistungen/ })).toHaveCount(0);
});
