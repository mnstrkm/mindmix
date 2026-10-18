# Entwicklung

## Voraussetzungen und Start

Node.js **ab 22.12.0** und **pnpm 11.25.0**. Die Lockdatei ist Bestandteil des Projekts.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Die Entwicklungsadresse lautet üblicherweise `http://127.0.0.1:5173/mindmix/`. Für Offline- und Updateprüfungen den Produktionsbuild verwenden:

```sh
pnpm build
pnpm preview
```

## Prüfungen

| Befehl | Zweck |
| --- | --- |
| `pnpm check` | Typprüfung, vollständige Vitest-Suite und Produktionsbuild |
| `pnpm typecheck` | Strikte TypeScript-Prüfung |
| `pnpm test` | Logik-, Komponenten-, Speicher-, Audio- und Übersetzungstests |
| `pnpm test:watch` | Tests während der Entwicklung |
| `pnpm test:e2e` | Playwright am Produktionsbuild |

Playwright benötigt einen installierten Browser, etwa `pnpm exec playwright install chromium`. Unter Windows kann die vorhandene Edge-Installation mit `$env:PLAYWRIGHT_CHANNEL='msedge'` verwendet werden. Der CI-Workflow installiert Chromium und führt dieselben Prüfungen aus. Ein eigener Lint-Schritt ist nicht eingerichtet.

Aktuelle Nachweise und offene Gerätetests stehen in [testing.md](testing.md).

## Projektstruktur

| Bereich | Ort |
| --- | --- |
| Navigation, Spielvorbereitung und Ergebnisse | `src/app/` |
| Regeln und Schwierigkeit | `src/games/<id>/logic.ts`, `config.ts` |
| Spielansicht, Ergebnisraster und Erklärungen | `src/games/<id>/` |
| Deutsche und türkische Texte | `src/i18n/`, `src/games/<id>/translations.ts` |
| Gemeinsame Bedienelemente und Sichtbereich | `src/shared/ui/` |
| Farben, Abstände und responsive Layouts | `src/styles/` |
| Lokale Daten und Rekorde | `src/services/storage/` |
| Effekte und UI-Töne | `src/services/audio/` |
| Offline-Status und kontrollierte Updates | `src/pwa/` |
| Lokale Bilder und optionale Audiodateien | `public/` |

Spielregeln bleiben reine Funktionen. Die gemeinsame UI enthält keine Spielregeln; Spielmodule importieren keine internen Dateien anderer Spiele. Verbindliche Hinweise stehen in [AGENTS.md](../AGENTS.md).

## Audio

Effekte werden mit Web Audio erzeugt. Der kurze `ui`-Ton ist leiser und kürzer als die Spieltöne. `UiSounds` erfasst normale Aktivierungen sowie Änderungen der Lautstärkeregler. Bedienelemente mit eigenem Spielton kennzeichnen sich oder ihren Container mit `data-ui-sound="off"`; dazu zählen Farbflächen und gewertete Antworten. Neue Bedienelemente mit eigenem Ton müssen diese Kennzeichnung ebenfalls setzen.

Beim Verlassen eines Spiels wird dessen Audio beendet. Ein gerade ausgelöster UI-Ton darf über diesen Übergang zu Ende laufen; Pausen, Hintergrundwechsel und ausgeschaltete Effekte stoppen alle Töne. Ein Fehler hat Vorrang vor dem Rekordton. Das Reaktionssignal bleibt ohne Startton.

Optionale Dateien lassen sich in `src/services/audio/config.ts` eintragen, mit Pfaden relativ zu `public/`, etwa `audio/correct.mp3`. Fehlende oder noch ladende Dateien erhalten einen unmittelbar erzeugten Ersatz. Ohne konfigurierte Musikdatei bleibt die Musikfunktion deaktiviert. Beide Lautstärken beginnen bei **50 %**; gespeicherte Einstellungen werden beibehalten.

## Navigation und Layout

„Noch einmal“ öffnet die Vorbereitung desselben Spiels und erhält den gewählten Modus. Erst „Spiel starten“ legt eine neue Sitzung an. Ausschließlich „Zum Menü“ aus dem Ergebnis verwendet den Routenzustand `scrollTarget: 'games'`, damit der Einstiegstext übersprungen wird. Der obere Menüpunkt „Spiele“ und „Alle Spiele“ führen an den Seitenanfang. „Spiele entdecken“ und der Ergebnis-Rückweg verwenden denselben Kataloganker einschließlich Bereichsüberschrift und oberem Abstand.

`viewport.ts` misst Zielbereich und verfügbare Höhe. Sichtbare Inhalte bleiben an ihrer Position; große Bereiche werden mit etwas Abstand am oberen Rand ausgerichtet. Fokuswechsel verhindern zunächst das native Scrollen. Nach dem Laden eines Spielmoduls wird der tatsächlich gerenderte Inhalt berücksichtigt. Es gibt keine gerätespezifischen festen Scrollkoordinaten.

Normale Fokuswechsel scrollen nur um den tatsächlich verdeckten Bereich. Bei einem neuen räumlichen Muster wird die Rastervorlage mit Stufenangabe ausgerichtet, statt dem Ausblendknopf unter dem wachsenden Raster zu folgen. Das Zahlenfeld bietet symmetrisch Löschen, Null und eine kleine Bestätigung; der große Bestätigungsknopf bleibt zusätzlich erhalten. Beide lösen dieselbe Prüfung aus.

## Pfade und Daten

Vite verwendet `/mindmix/` als Basispfad. `BASE_PATH` kann diesen beim Build ersetzen; der Wert benötigt einen führenden und abschließenden Schrägstrich. Manifest, Assets und Service Worker verwenden denselben Pfad. Hash-Routing hält direkte Spieladressen ohne Server-Weiterleitungen erreichbar.

Das Speicherschema bleibt unabhängig von der App-Version. Regeländerungen benötigen eine Prüfung der Vergleichbarkeit, eine passende Regelversion und eine Aktualisierung von [game-rules.md](game-rules.md) sowie [CHANGELOG.md](../CHANGELOG.md). Reine UI-Änderungen setzen keine Rekorde zurück. Herkunft und Prüfbedarf der Wortlisten stehen im [Inhaltsnachweis](../src/games/recognition/content.md).
