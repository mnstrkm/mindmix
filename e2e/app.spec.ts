import { test, expect, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

async function start(page: Page, game: string) {
  await page.goto(`#/game/${game}`);
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Partie beenden' })).toBeVisible();
  await expect(page.locator('.game-content')).toBeVisible();
}
async function digitEntry(page: Page, value: string) {
  for (const digit of value) await page.getByRole('button', { name: digit, exact: true }).click();
  await page.getByRole('button', { name: 'Bestätigen', exact: true }).last().click();
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.1; });
});

test('eight games, navigation and browser back', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.game-card')).toHaveCount(8);
  await page.getByRole('link', { name: 'Zahlenfolge merken öffnen' }).click();
  await expect(page.getByRole('heading', { name: 'Zahlenfolge merken' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Acht Spiele. Dein Tempo.' })).toBeVisible();
  await page.getByRole('link', { name: 'Bestleistungen', exact: true }).click();
  await expect(page.locator('.record-card')).toHaveCount(8);
});

test('digits concealment, correction, result, restart, persistence and navigation finalization', async ({ page }) => {
  await start(page, 'digits');
  const digits = (await page.locator('.digit-sequence').innerText()).replace(/\s/g, '');
  await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).click();
  await expect(page.locator('.digit-sequence')).toHaveCount(0);
  await page.getByRole('button', { name: 'Spiel erklären' }).click();
  await expect(page.locator('.digit-sequence')).toHaveCount(0);
  await page.getByRole('button', { name: 'Weiter spielen' }).click();
  await digitEntry(page, digits);
  await expect(page.locator('.live-score')).toHaveText('2');
  await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).click();
  await digitEntry(page, '9');
  await expect(page.getByRole('heading', { name: 'Eine neue Bestleistung!' })).toBeVisible();
  await expect(page.locator('.result-score')).toContainText('2');
  await page.getByRole('button', { name: 'Noch einmal' }).click();
  await expect(page.locator('.game-content')).toHaveCount(0);
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await expect(page.locator('.live-score')).toHaveText('0');
  await page.getByRole('button', { name: 'Partie beenden' }).click();
  await page.reload();
  await expect(page.locator('.best-summary')).toContainText('2 Ziffern');
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('mindmix:data')!));
  expect(data.history.filter((item: { game: string }) => item.game === 'digits')).toHaveLength(1);
  await start(page, 'digits');
  const next = (await page.locator('.digit-sequence').innerText()).replace(/\s/g, '');
  await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).click();
  await digitEntry(page, next);
  await expect(page.locator('.live-score')).toHaveText('2');
  await page.getByRole('link', { name: 'Einstellungen', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Einstellungen', exact: true })).toBeVisible();
  // Route cleanup writes the result in a React effect. Wait for that observable
  // outcome instead of racing it with an immediate localStorage snapshot.
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('mindmix:data')!) as {
      history: { game: string; reason: string; score: number }[];
    };
    const rounds = saved.history.filter(item => item.game === 'digits');
    return { count: rounds.length, reason: rounds.at(-1)?.reason, score: rounds.at(-1)?.score };
  })).toEqual({ count: 2, reason: 'stopped', score: 2 });
});

test('recognition evaluates previous appearance and ends on wrong answer', async ({ page }) => {
  await start(page, 'recognition');
  const seen = new Set<string>();
  let newWords = 0;
  let repeats = 0;
  for (let action = 0; action < 6; action++) {
    const word = await page.locator('.stimulus').innerText();
    if (seen.has(word)) repeats++; else newWords++;
    await page.getByRole('button', { name: seen.has(word) ? 'Schon gesehen' : 'Neu', exact: true }).click();
    seen.add(word);
    await expect(page.locator('.live-score')).toHaveText(String(newWords));
    await expect(page.getByRole('button', { name: 'Neu', exact: true })).not.toHaveAttribute('aria-disabled', 'true');
  }
  expect(repeats).toBeGreaterThan(0);
  const word = await page.locator('.stimulus').innerText();
  await page.getByRole('button', { name: seen.has(word) ? 'Neu' : 'Schon gesehen', exact: true }).click();
  await expect(page.locator('.result-score')).toContainText(String(newWords));
  await expect(page.locator('.result-stats')).toContainText('Richtige Antwort');
});

test('spatial patterns can be recalled and the next task has the right dimensions', async ({ page }) => {
  await start(page, 'spatial');
  const cells = await page.locator('.spatial-cell').evaluateAll(items => items.map((item, index) => item.classList.contains('marked') ? index : -1).filter(index => index >= 0));
  await page.getByRole('button', { name: /Muster ausblenden/ }).click();
  await expect(page.locator('.marked')).toHaveCount(0);
  for (const index of cells) await page.locator('.spatial-cell').nth(index).click();
  await page.getByRole('button', { name: /Auswahl bestätigen/ }).click();
  await expect(page.locator('.live-score')).toHaveText('1');
  await expect(page.locator('.spatial-cell')).toHaveCount(6);
  await page.getByRole('button', { name: /Muster ausblenden/ }).click();
  await page.getByRole('button', { name: /Auswahl bestätigen/ }).click();
  await expect(page.locator('.result-score')).toContainText('1');
});

test('simon presents, accepts order and pauses without exposing a new replay after input', async ({ page }) => {
  await start(page, 'simon');
  await expect(page.locator('.simon-pad').first()).toBeEnabled({ timeout: 7000 });
  await page.locator('.simon-pad').first().click();
  await page.getByRole('button', { name: 'Spiel erklären' }).click();
  await page.getByRole('button', { name: 'Weiter spielen' }).click();
  await expect(page.locator('.simon-pad').first()).toBeEnabled();
  await page.locator('.simon-pad').first().click();
  await expect(page.locator('.live-score')).toHaveText('2');
  await expect(page.locator('.simon-pad').first()).toBeEnabled({ timeout: 7000 });
  await page.locator('.simon-pad').nth(1).click();
  await expect(page.locator('.result-score')).toContainText('2');
});

test('arithmetic, visual search and rule switch score correct answers and stop at mistakes', async ({ page }) => {
  await start(page, 'arithmetic');
  const problem = await page.locator('.stimulus').innerText();
  const match = problem.match(/(\d+)\s*([+−−–-])\s*(\d+)/)!;
  const answer = match[2] === '+' ? Number(match[1]) + Number(match[3]) : Number(match[1]) - Number(match[3]);
  await digitEntry(page, String(answer));
  await expect(page.locator('.live-score')).toHaveText('1');
  await digitEntry(page, '999');
  await expect(page.locator('.result-score')).toContainText('1');
  await start(page, 'search');
  const target = await page.locator('.search-target').getAttribute('aria-label');
  const direction = target!.split(':').at(-1)!.trim();
  await page.locator('.search-grid button').filter({ has: page.locator('svg') }).evaluateAll((buttons, direction) => {
    const target = buttons.find(button => button.getAttribute('aria-label')?.endsWith(direction));
    (target as HTMLButtonElement).click();
  }, direction);
  await expect(page.locator('.live-score')).toHaveText('1');
  await expect(page.locator('.search-grid button').first()).toBeEnabled();
  const nextTarget = (await page.locator('.search-target').getAttribute('aria-label'))!.split(':').at(-1)!.trim();
  await page.locator('.search-grid button').evaluateAll((buttons, direction) => {
    (buttons.find(button => !button.getAttribute('aria-label')?.endsWith(direction)) as HTMLButtonElement).click();
  }, nextTarget);
  await expect(page.locator('.result-score')).toContainText('1');
  await start(page, 'switch');
  await page.locator('.switch-answers button').first().click();
  await expect(page.locator('.live-score')).toHaveText('1');
  await page.locator('.switch-answers button').last().click();
  await expect(page.locator('.result-score')).toContainText('1');
});

test('reaction measures five valid trials and rejects three false starts', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.clock.install();
  await start(page, 'reaction');
  await page.getByRole('button', { name: /Direkt zur Messung/ }).click();
  await page.getByRole('button', { name: /Versuch starten/ }).click();
  for (let index = 0; index < 5; index++) {
    await page.clock.fastForward(6000);
    await expect(page.locator('.reaction-target.signal')).toBeVisible();
    await page.clock.fastForward(240 + index * 10);
    await page.locator('.reaction-target').press('Space');
    if (index < 4) { await page.clock.fastForward(400); await page.getByRole('button', { name: /Nächster Versuch/ }).click(); }
  }
  await expect(page.getByRole('button', { name: 'Ergebnis ansehen', exact: true })).toBeVisible();
  await expect(page.locator('.result-panel')).toHaveCount(0);
  await page.screenshot({ path: '.preview/reaction-fifth-time.png', fullPage: true });
  await page.getByRole('button', { name: 'Ergebnis ansehen', exact: true }).click();
  await expect(page.locator('.result-panel')).toBeVisible();
  await expect(page.locator('.result-panel .best-summary, .result-panel .secondary-record')).toHaveCount(0);
  await expect(page.locator('.trial-list li')).toHaveCount(5);
  await expect(page.locator('.fastest-trial')).not.toHaveCount(0);
  await expect(page.locator('.result-stats')).not.toContainText('Durchschnitt');
  await expect(page.locator('.result-stats')).not.toContainText('Schnellster');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: '.preview/reaction-result.png', fullPage: true });
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('mindmix:data')!));
  expect(data.records.find((item: { game: string }) => item.game === 'reaction').eligible).toBe(true);
  await page.getByRole('button', { name: 'Noch einmal' }).click();
  await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
  await page.getByRole('button', { name: /Direkt zur Messung/ }).click();
  await page.getByRole('button', { name: /Versuch starten/ }).click();
  for (let index = 0; index < 3; index++) {
    await page.locator('.reaction-target').press('Space');
    if (index < 2) { await page.clock.fastForward(400); await page.getByRole('button', { name: /Nächster Versuch/ }).click(); }
  }
  await expect(page.getByText('Drei Fehlstarts – Partie beendet')).toBeVisible();
  await expect(page.getByText(/Für einen Durchschnittsrekord brauchst du fünf gültige Versuche/)).toBeVisible();
});

test('settings persist, Turkish is complete, large text fits phone/tablet/desktop and rotation', async ({ page }) => {
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Türkçe', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await page.getByRole('button', { name: 'Çok büyük', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Çok büyük', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height });
    for (const route of ['', '#/settings', '#/records', '#/game/spatial']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('#/game/spatial');
  await page.getByRole('button', { name: 'Oyuna başla', exact: true }).click();
  await page.setViewportSize({ width: 740, height: 320 });
  await expect(page.getByRole('button', { name: 'Oyunu bitir', exact: true })).toBeVisible();
});

test('all eight modules and both languages load offline after precache, including reload', async ({ page, context }) => {
  await page.goto('');
  await expect(page.getByText('Bereit für offline', { exact: true })).toBeVisible({ timeout: 20000 });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Du bist offline', { exact: true })).toBeVisible();
  for (const id of ['recognition', 'digits', 'simon', 'spatial', 'arithmetic', 'search', 'switch', 'reaction']) {
    await start(page, id);
    await expect(page.locator('.game-content')).toBeVisible();
    await page.getByRole('button', { name: 'Partie beenden' }).click();
  }
  await page.goto('#/settings');
  await page.getByRole('button', { name: 'Türkçe', exact: true }).click();
  await page.goto('#/game/recognition');
  await page.getByRole('button', { name: 'Oyuna başla', exact: true }).click();
  await expect(page.locator('.stimulus')).not.toBeEmpty();
  await context.setOffline(false);
});

test('new service worker waits during a game, then updates without losing records', async ({ page }) => {
  const path = new URL('../dist/sw.js', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await page.goto('');
    await expect(page.getByText('Bereit für offline', { exact: true })).toBeVisible({ timeout: 20000 });
    await page.reload();
    await start(page, 'digits');
    const sequence = (await page.locator('.digit-sequence').innerText()).replace(/\s/g, '');
    await page.getByRole('button', { name: 'Gemerkte Folge ausblenden' }).click();
    await digitEntry(page, sequence);
    await expect(page.locator('.live-score')).toHaveText('2');
    await writeFile(path, `${original}\n// e2e update ${Date.now()}\n`);
    await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
    await expect(page.getByRole('button', { name: 'Jetzt aktualisieren' })).toBeDisabled({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Partie beenden' })).toBeVisible();
    await page.getByRole('button', { name: 'Partie beenden' }).click();
    await expect(page.getByRole('button', { name: 'Jetzt aktualisieren' })).toBeEnabled();
    await page.getByRole('button', { name: 'Jetzt aktualisieren' }).click();
    await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
    await expect(page.locator('.best-summary')).toContainText('2 Ziffern');
  } finally { await writeFile(path, original); }
});
