import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.1; });
});

test('digit results compare leading zeroes, wrong and missing digits at 320px with large text in both languages', async ({ page }) => {
  for (const turkish of [false, true]) {
    await page.goto('#/settings');
    if (turkish) await page.getByRole('button', { name: 'Türkçe', exact: true }).tap();
    await page.getByRole('button', { name: turkish ? 'Çok büyük' : 'Sehr groß', exact: true }).tap();
    await page.goto('#/game/digits');
    await page.evaluate(() => { Math.random = () => 0; });
    await page.getByRole('button', { name: turkish ? 'Oyuna başla' : 'Spiel starten', exact: true }).tap();
    await expect(page.locator('.digit-sequence')).toHaveText('00');
    await page.getByRole('button', { name: turkish ? 'Ezberlediğim diziyi gizle' : 'Gemerkte Folge ausblenden', exact: true }).tap();
    await page.getByRole('button', { name: turkish ? '1' : '0', exact: true }).tap();
    await expect(page.locator('.result-review')).toHaveCount(0);
    await page.getByRole('button', { name: turkish ? 'Onayla' : 'Bestätigen', exact: true }).last().tap();
    await expect(page.locator('.digit-answer')).toHaveCount(2);
    await expect(page.locator('.digit-review dt')).toHaveText(turkish ? ['Doğru dizi', 'Senin girişin'] : ['Richtige Folge', 'Deine Eingabe']);
    await expect(page.locator('.result-review .review-legend')).toHaveCount(0);
    await expect(page.locator('.digit-missing')).toHaveCount(1);
    await expect(page.locator(turkish ? '.digit-wrong' : '.digit-correct')).toHaveCount(1);
    await expect(page.locator('.digit-answer').first()).toHaveAttribute('aria-label', turkish ? /doğru rakam 0, girilen 1/ : /richtig 0, eingegeben 0/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('mindmix:data')!.includes('review'))).toBe(false);
    await page.screenshot({ path: `.preview/digits-review-1.4.1-${turkish ? 'tr' : 'de'}.png`, fullPage: true });
  }
});

test('symmetric numeric controls, ordered settings, aligned history and no technical rule labels', async ({ page }) => {
  await page.addInitScript(() => {
    const base = { game: 'simon', variant: 'default', ruleVersion: 1, actions: 5, date: '2026-10-18T12:00:00Z' };
    localStorage.setItem('mindmix:data', JSON.stringify({ version: 1, settings: {}, records: [], history: [
      { ...base, id: 'stopped', score: 3, reason: 'stopped' },
      { ...base, id: 'mistake', score: 6, reason: 'mistake' },
    ] }));
  });
  await page.goto('#/settings');
  expect((await page.locator('.settings-section h2').allTextContents()).slice(0, 3)).toEqual(['Sprache', 'Schriftgröße', 'Darstellung']);
  await page.goto('#/game/simon');
  await expect(page.locator('.history li')).toHaveCount(2);
  const positions = await page.locator('.history li > span').evaluateAll(items => items.map(item => item.getBoundingClientRect().left));
  expect(positions[0]).toBe(positions[1]);
  await expect(page.locator('main')).not.toContainText('Regelversion');
  await page.screenshot({ path: '.preview/history-mobile.png', fullPage: true });
  await page.goto('#/game/arithmetic');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Bestätigen', exact: true })).toHaveCount(2);
  const lastRow = await page.locator('.number-pad button').evaluateAll(buttons => buttons.slice(-3).map(button => button.getAttribute('aria-label') ?? button.textContent));
  expect(lastRow).toEqual(['Letzte Ziffer löschen', '0', 'Bestätigen']);
  await expect(page.locator('.game-content')).not.toContainText('Plus und Minus');
});

test('spatial feedback shows correct, missed and wrong cells only after the round', async ({ page }) => {
  await page.goto('#/game/spatial');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).tap();
  await expect(page.locator('.spatial-cell.marked')).toHaveCount(2);
  const marked = await page.locator('.spatial-cell').evaluateAll(items => items.map((item, index) => item.classList.contains('marked') ? index : -1).filter(index => index >= 0));
  const wrong = [0, 1, 2, 3].find(index => !marked.includes(index))!;
  await page.getByRole('button', { name: 'Muster ausblenden', exact: true }).tap();
  await page.locator('.spatial-cell').nth(marked[0]!).tap();
  await page.locator('.spatial-cell').nth(wrong).tap();
  await expect(page.locator('.result-review')).toHaveCount(0);
  await page.getByRole('button', { name: 'Spiel erklären', exact: true }).tap();
  await expect(page.locator('.result-review')).toHaveCount(0);
  await expect(page.locator('.spatial-cell.marked')).toHaveCount(0);
  await page.getByRole('button', { name: 'Weiter spielen', exact: true }).tap();
  await page.getByRole('button', { name: 'Auswahl bestätigen', exact: true }).tap();
  await expect(page.locator('.review-correct')).toHaveCount(1);
  await expect(page.locator('.review-missed')).toHaveCount(1);
  await expect(page.locator('.review-wrong')).toHaveCount(1);
  await expect(page.getByRole('img', { name: /übersehen/ })).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('mindmix:data')!.includes('review'))).toBe(false);
  await page.screenshot({ path: '.preview/spatial-review-mobile.png', fullPage: true });
});

test('touch feedback clears for the next search and the final board shows both arrows', async ({ page }) => {
  await page.goto('#/game/search');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).tap();
  await page.locator('.search-grid button').first().tap();
  await expect(page.locator('.search-grid button').first()).toBeEnabled();
  await expect(page.locator('.search-grid .selected')).toHaveCount(0);
  expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
  const colors = await page.locator('.search-grid button').evaluateAll(items => items.map(item => getComputedStyle(item).backgroundColor));
  expect(new Set(colors).size).toBe(1);
  await page.locator('.search-grid button').nth(1).tap();
  await expect(page.locator('.review-correct')).toHaveCount(1);
  await expect(page.locator('.review-wrong')).toHaveCount(1);
  await expect(page.locator('.review-cell')).toHaveCount(4);
  expect(await page.evaluate(() => localStorage.getItem('mindmix:data')!.includes('review'))).toBe(false);
  await page.screenshot({ path: '.preview/search-review-mobile.png', fullPage: true });
});

test('a new record retains the previous comparable score in the result', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mindmix:data', JSON.stringify({ version: 1, settings: {}, history: [], records: [
      { game: 'digits', variant: 'default', ruleVersion: 1, score: 2, actions: 1, id: 'old', date: '2026-10-18T12:00:00Z' },
    ] }));
  });
  await page.goto('#/game/digits');
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).tap();
  for (let length = 2; length <= 3; length++) {
    const sequence = (await page.locator('.digit-sequence').innerText()).replace(/\s/g, '');
    await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).tap();
    for (const digit of sequence) await page.getByRole('button', { name: digit, exact: true }).tap();
    await page.getByRole('button', { name: 'Bestätigen', exact: true }).last().tap();
    await expect(page.locator('.live-score')).toHaveText(String(length));
  }
  await page.getByRole('button', { name: 'Partie beenden', exact: true }).tap();
  await expect(page.locator('.previous-best')).toHaveText('Dein bisheriger Rekord: 2 Ziffern');
  await expect(page.locator('.result-score')).toContainText('3');
});

test('result grids fit very large Turkish text on a 320px touch screen', async ({ page }) => {
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Türkçe', exact: true }).tap();
  await page.getByRole('button', { name: 'Çok büyük', exact: true }).tap();
  for (const game of ['spatial', 'search']) {
    await page.goto(`#/game/${game}`);
    await page.getByRole('button', { name: 'Oyuna başla', exact: true }).tap();
    if (game === 'spatial') {
      await page.getByRole('button', { name: 'Deseni gizle', exact: true }).tap();
      await page.getByRole('button', { name: 'Seçimi onayla', exact: true }).tap();
    } else await page.locator('.search-grid button').nth(1).tap();
    await expect(page.locator('.result-review')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `.preview/${game}-review-mobile-large-tr.png`, fullPage: true });
  }
});

test('spatial row and column changes keep the new pattern visible instead of following the hide button', async ({ page }) => {
  test.setTimeout(60000);
  for (const [width, height] of [[320, 640], [390, 844], [1366, 768]]) {
    await page.setViewportSize({ width, height });
    await page.goto('#/game/spatial');
    await page.getByRole('button', { name: 'Spiel starten', exact: true }).tap();
    for (let solved = 0; solved < 5; solved++) {
      await expect(page.locator('.spatial-cell.marked')).not.toHaveCount(0);
      const pattern = await page.locator('.spatial-cell').evaluateAll(cells => cells.flatMap((cell, index) => cell.classList.contains('marked') ? [index] : []));
      await page.getByRole('button', { name: 'Muster ausblenden', exact: true }).tap();
      for (const index of pattern) await page.locator('.spatial-cell').nth(index).tap();
      await page.getByRole('button', { name: 'Auswahl bestätigen', exact: true }).tap();
      await expect(page.locator('.live-score')).toHaveText(String(solved + 1));
      await expect(page.locator('.spatial-game .status-line')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.spatial-game .status-line')).toBeFocused();
      // Allow layout and native scroll anchoring to settle before checking the top edge.
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      const top = await page.locator('.spatial-grid').evaluate(element => element.getBoundingClientRect().top);
      expect(top, `${width}px, solved=${solved + 1}`).toBeGreaterThanOrEqual(0);
      if (solved === 0) await page.screenshot({ path: `.preview/spatial-row-change-1.3.1-${width}.png` });
    }
    await page.getByRole('button', { name: 'Partie beenden', exact: true }).tap();
    await page.getByRole('button', { name: 'Noch einmal', exact: true }).tap();
  }
});
