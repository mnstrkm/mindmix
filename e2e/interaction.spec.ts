import { test, expect } from '@playwright/test';

declare global { interface Window { __mindmixSounds: number[] } }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.1;
    window.__mindmixSounds = [];
    // Observe the real service's synthesized tones without relying on physical speakers.
    Object.defineProperty(window, 'AudioContext', { value: class {
      state = 'running'; currentTime = 0; destination = {};
      resume() { return Promise.resolve(); }
      createOscillator() {
        return { frequency: { value: 0 }, onended: null, connect() {}, disconnect() {}, stop() {},
          start() { window.__mindmixSounds.push(this.frequency.value); } };
      }
      createGain() { return { connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    } });
  });
});

test('UI sounds are single, sliders use one tick, and muted effects stay silent', async ({ page }) => {
  await page.goto('#/settings');
  await expect(page.getByRole('slider').first()).toHaveValue('0.5');
  await expect(page.getByRole('slider').last()).toHaveValue('0.5');
  await page.getByRole('button', { name: 'Hell', exact: true }).click();
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([950]);
  const effects = page.getByRole('checkbox', { name: 'Spieleffekte', exact: true });
  await effects.uncheck();
  await page.getByRole('button', { name: 'Dunkel', exact: true }).click();
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([]);
  await effects.check();
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([950]);
  await page.getByRole('slider').first().focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([950]);
  await page.getByRole('link', { name: 'Spiele', exact: true }).click();
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([950]);
});

test('Simon uses only its color tone and one error tone even when the failed round sets a record', async ({ page }) => {
  await page.goto('#/game/simon');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await expect(page.locator('.simon-pad').first()).toBeEnabled({ timeout: 7000 });
  await page.evaluate(() => { window.__mindmixSounds = []; });
  await page.locator('.simon-pad').first().click();
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([262]);
  await expect(page.locator('.simon-pad').first()).not.toHaveAttribute('aria-disabled', 'true');
  await page.locator('.simon-pad').first().click();
  await expect(page.locator('.live-score')).toHaveText('2');
  await expect(page.locator('.simon-pad').first()).toBeEnabled({ timeout: 7000 });
  await page.evaluate(() => { window.__mindmixSounds = []; });
  await page.locator('.simon-pad').nth(1).click();
  await expect(page.getByRole('heading', { name: 'Eine neue Bestleistung!', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__mindmixSounds)).toEqual([180]);
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([180]);
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  await expect(page.locator('.preparation')).toBeVisible();
  await expect(page.locator('.simon-grid')).toHaveCount(0);
  expect(await page.evaluate(() => window.__mindmixSounds.splice(0))).toEqual([950]);
});

test('replay opens preparation in all games without creating a session or losing the mode', async ({ page }) => {
  for (const game of ['recognition', 'digits', 'simon', 'spatial', 'arithmetic', 'search', 'switch', 'reaction']) {
    await page.goto(`#/game/${game}`);
    if (game === 'arithmetic') await page.getByRole('button', { name: 'Gemischt', exact: true }).click();
    await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
    await expect(page.locator('.game-content')).toBeVisible();
    await page.getByRole('button', { name: 'Partie beenden', exact: true }).click();
    await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
    await expect(page.locator('.preparation')).toBeVisible();
    await expect(page.locator('.game-content')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
    if (game === 'arithmetic') await expect(page.getByRole('button', { name: 'Gemischt', exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mindmix:data') ?? '{"history":[]}').history)).toEqual([]);
});

test('menu targets the catalog and a fitting desktop game does not scroll unnecessarily', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('#/game/digits');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await expect(page.locator('.digit-sequence')).toBeVisible();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  for (const [width, height] of [[320, 640], [768, 600], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('#/game/arithmetic');
    await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
    await expect(page.locator('.number-pad')).toBeVisible();
    await expect.poll(() => page.locator('.play-panel').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBeGreaterThanOrEqual(0);
    await page.getByRole('button', { name: 'Partie beenden', exact: true }).click();
    await page.getByRole('link', { name: 'Zum Menü', exact: true }).click();
    await expect(page.locator('#game-list')).toBeFocused();
    await expect.poll(() => page.locator('#game-selection').evaluate(element => element.getBoundingClientRect().top)).toBeLessThanOrEqual(64);
    await expect(page.locator('.game-card').first()).toBeInViewport();
    // Browser scrolling rounds to physical pixels, while the margin can be fractional.
    expect(await page.locator('#game-selection').evaluate(element => Math.abs(element.getBoundingClientRect().top - parseFloat(getComputedStyle(element).scrollMarginTop)))).toBeLessThanOrEqual(1);
  }
});

test('record values align and font samples stay unbroken on small screens in both languages', async ({ page }) => {
  await page.addInitScript(() => {
    const base = { game: 'reaction', variant: 'default', ruleVersion: 2, actions: 5, date: '2026-10-18T12:00:00Z' };
    localStorage.setItem('mindmix:data', JSON.stringify({ version: 1, settings: { textSize: 'extra' }, history: [], records: [
      { ...base, id: 'average', score: 272 }, { ...base, id: 'fastest', metric: 'fastest', score: 236 },
    ] }));
  });
  await page.setViewportSize({ width: 320, height: 740 });
  for (const language of ['de', 'tr']) {
    await page.goto('#/settings');
    await page.getByRole('button', { name: language === 'de' ? 'Deutsch' : 'Türkçe', exact: true }).click();
    const samples = await page.locator('.text-size-sample').evaluateAll(elements => elements.map(element => ({ text: element.textContent, size: Number.parseFloat(getComputedStyle(element).fontSize) })));
    expect(samples.map(sample => sample.text)).toEqual(['A', 'A', 'A']);
    expect(samples[0].size).toBeLessThan(samples[1].size);
    expect(samples[1].size).toBeLessThan(samples[2].size);
    await page.screenshot({ path: `.preview/settings-1.3-${language}.png`, fullPage: true });
    await page.goto('#/game/reaction');
    await expect(page.locator('.secondary-record strong')).toHaveText('236 ms');
    const rightEdges = await page.locator('.best-summary strong, .secondary-record strong').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().right));
    expect(rightEdges).toHaveLength(2);
    expect(Math.abs(rightEdges[0] - rightEdges[1])).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `.preview/reaction-records-1.3-${language}.png`, fullPage: true });
    await page.goto('#/records');
    await expect(page.locator('.record-card')).toHaveCount(8);
    const reaction = page.locator('.record-card').filter({ has: page.getByRole('heading', { name: language === 'de' ? 'Reaktions-Challenge' : 'Tepki Mücadelesi', exact: true }) });
    const edges = await reaction.locator('.record-line strong').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().right));
    expect(Math.abs(edges[0] - edges[1])).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});
