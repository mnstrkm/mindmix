# MindMix

MindMix ist eine Sammlung von acht kleinen Browser-Spielen auf Deutsch und Türkisch. Die Aufgaben lassen sich ohne Zeitdruck spielen; die Reaktions-Challenge misst als einzige Aufgabe die Reaktionszeit. Die App funktioniert als normale Website und kann optional als PWA installiert werden.

Die Ergebnisse beschreiben ausschließlich die jeweils gespielte Aufgabe. Es gibt keine Gesamtbewertung der Person, medizinischen Aussagen, Konten, Werbung oder Tracking. Einstellungen und Ergebnisse bleiben im verwendeten Browser.

**Version:** 1.1.0 · **Repository:** [mnstrkm/mindmix](https://github.com/mnstrkm/mindmix)

| Spiel | Ergebnis |
| --- | --- |
| Schon gesehen? | Richtig als neu oder bekannt beurteilte Wörter |
| Zahlenfolge merken | Längste vollständig wiedergegebene Ziffernfolge |
| Farbreihenfolge | Längste vollständig wiedergegebene Signalfolge |
| Räumliches Gedächtnis | Vollständig richtig wiedergegebene Rastermuster |
| Kopfrechnen | Richtige Aufgaben, getrennt nach Grundrechnen und Gemischt |
| Visuelle Suche | Richtig gefundene Zielsymbole |
| Regelwechsel | Richtige Entscheidungen nach Farbe oder Form |
| Reaktions-Challenge | Durchschnitt aus fünf Versuchen und separat schnellster Einzelversuch |

## Lokal starten

Voraussetzungen: Node.js ab **22.12.0** und **pnpm 11.25.0**, entsprechend `engines` und `packageManager` in `package.json`. Die genauen installierten Abhängigkeiten stehen in der eingecheckten `pnpm-lock.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Die im Terminal ausgegebene Adresse öffnen, normalerweise [http://127.0.0.1:5173/mindmix/](http://127.0.0.1:5173/mindmix/). Die laufende Website benötigt keinen zusätzlichen Serverdienst. Vites lokaler Entwicklungsserver dient nur der Entwicklung.

| Befehl | Zweck |
| --- | --- |
| `pnpm typecheck` | Strikte TypeScript-Prüfung |
| `pnpm test` | Logik-, Komponenten-, Speicher- und Übersetzungstests |
| `pnpm test:watch` | Tests während der Entwicklung erneut ausführen |
| `pnpm build` | Typprüfung und Produktionsdateien in `dist/` erstellen |
| `pnpm preview` | Vorhandenen Produktionsbuild lokal ansehen |
| `pnpm test:e2e` | Die eingerichteten Playwright-Browserprüfungen ausführen |
| `pnpm check` | Typprüfung, Tests und Produktionsbuild nacheinander |

Für Playwright muss ein passender Browser installiert sein, beispielsweise mit `pnpm exec playwright install chromium`. Systemabhängigkeiten können unter Linux zusätzlich erforderlich sein. Ein eigener Lint-Schritt ist derzeit nicht eingerichtet. Der Stand tatsächlich ausgeführter Prüfungen und die Gerätecheckliste stehen in [docs/testing.md](docs/testing.md).

## GitHub Pages veröffentlichen

Das Repository ist der Quellcode. `pnpm build` erzeugt daraus die statischen Dateien. Der [Pages-Workflow](.github/workflows/pages.yml) prüft den Quellcode, baut diese Dateien und veröffentlicht den Build über GitHub Actions auf GitHub Pages. Pull Requests werden geprüft, aber nicht veröffentlicht.

1. In [den Repository-Einstellungen](https://github.com/mnstrkm/mindmix/settings/pages) unter **Pages → Build and deployment → Source** den Eintrag **GitHub Actions** wählen.
2. Änderungen einschließlich Lockdatei und Workflow committen und auf den im Workflow vorgesehenen Branch `main` pushen.
3. Unter **Actions** den Build und das Pages-Deployment überprüfen. Falls GitHub eine Freigabe der Umgebung `github-pages` verlangt, diese im Repository erteilen.
4. Nach erfolgreichem Deployment ist die vorgesehene Adresse [https://mnstrkm.github.io/mindmix/](https://mnstrkm.github.io/mindmix/).

Die Konfiguration bereitet die Veröffentlichung vor. Ein lokaler Commit allein lädt nichts zu GitHub hoch; ein erfolgreiches externes Deployment muss separat im Actions-Lauf bestätigt werden.

**Falls die veröffentlichte Seite leer bleibt:** Unter **Pages → Source** muss tatsächlich **GitHub Actions** ausgewählt sein. **Deploy from a branch → main → /(root)** veröffentlicht bei diesem Projekt die ungebaute Quelldatei und ergibt keine funktionierende App. Der richtige Workflow heißt **Check and deploy MindMix**; erst wenn darin sowohl **check** als auch **deploy** erfolgreich sind, wurde der geprüfte Vite-Build veröffentlicht. Ein separater grüner Lauf namens **pages build and deployment** kann dagegen aus der falschen Branch-Konfiguration stammen.

### Basispfad und Routing

Vite verwendet standardmäßig **`/mindmix/`**. Dieser Pfad wird auch für Manifest, Startadresse, Service Worker und lokale Assets verwendet. Mit der Build-Umgebungsvariable `BASE_PATH` lässt er sich ändern; dabei einen führenden und abschließenden Schrägstrich setzen. Für eine Domain direkt im Hauptverzeichnis lautet er `/`.

React Router verwendet Hash-Routing. Eine Spieladresse sieht beispielsweise so aus:

```text
https://mnstrkm.github.io/mindmix/#/game/arithmetic
```

Der Server erhält nur `/mindmix/`; die Navigation hinter `#` verarbeitet der Browser. Dadurch braucht GitHub Pages keine eigene Weiterleitungsregel für jede Spielseite.

## Offline, Installation und Updates

Der Produktionsbuild enthält einen Service Worker. Beim ersten vollständigen Online-Laden werden die notwendigen lokalen Dateien einschließlich aller acht Spielmodule und beider Sprachen vorbereitet. Erst die erfolgreiche Vorbereitung wird als offline verfügbar gemeldet. Danach können die Spiele auch ohne Internet geöffnet werden. Zum Prüfen den Produktionsbuild mit `pnpm preview` verwenden; die Entwicklungsansicht ist kein Nachweis für Offline-Unterstützung.

Die Installation ist optional und wird vom jeweiligen Browser angeboten. HTTPS beziehungsweise `localhost` ist für Service Worker erforderlich. Browser können Website-Daten bei Platzmangel oder auf Nutzerwunsch löschen; dann ist erneut ein vollständiges Online-Laden nötig.

Eine neue Version wird angekündigt und erst nach einer bewussten Aktualisierung aktiviert. Während einer laufenden Partie ist die Aktualisierung gesperrt. Alte Asset-Caches werden bereinigt; die lokalen Spielergebnisse liegen getrennt davon in `localStorage`.

## Anpassen und weiterentwickeln

Die Oberfläche startet standardmäßig dunkel. In den Einstellungen lässt sich eine helle Ansicht wählen; die Wahl wird lokal gespeichert. Alle Erklärungen enthalten ein kleines visuelles Beispiel. Alte Rekorde bleiben nach Regeländerungen unter **Bestleistungen → Frühere Bestleistungen** einsehbar. Frühere Reaktionsrekorde waren Medianwerte und werden deshalb ausdrücklich so beschriftet; neue Durchschnittswerte werden damit nicht vermischt.

| Bereich | Ort |
| --- | --- |
| Routing, Spielverzeichnis, Vorbereitung und Ergebnis | `src/app/` |
| Regeln und Progression eines Spiels | `src/games/<id>/logic.ts`, `config.ts` |
| Darstellung und lokale Texte eines Spiels | `src/games/<id>/Game.tsx`, `translations.ts` |
| Wortvorräte | `src/games/recognition/words.ts`, `words-de.ts`, `words-tr.ts` |
| Gemeinsame Texte und Sprache | `src/i18n/` |
| Farben, Abstände, Schriftgrößen, Layout | `src/styles/` |
| Zahlenfeld und gemeinsame UI | `src/shared/ui/` |
| Einstellungen, Rekorde, letzter Spielverlauf | `src/services/storage/` |
| Effekte und optionale Musik | `src/services/audio/` |
| Offline- und Update-Anzeige | `src/pwa/` |
| Lokale Bilder und optionale Audio-Dateien | `public/` |

Effekte werden standardmäßig mit Web Audio erzeugt. Eigene lokale Dateien können in `src/services/audio/config.ts` eingetragen werden; die Pfade sind relativ zu `public/`, etwa `audio/correct.mp3`. Fehlende oder noch nicht nutzbare Effekte erhalten einen erzeugten Ersatz. Musik ist optional, standardmäßig ausgeschaltet und ohne konfigurierte Datei nicht verfügbar. Es gibt keine Ersatzmusik.

Die App speichert einen Ergebnisbestand pro Browser, ohne Profile oder Synchronisation. Auf einem anderen Gerät beginnt deshalb ein eigener Bestand. Pro Spiel werden die letzten 30 gewerteten oder bewusst beendeten Partien aufbewahrt; Rekorde bleiben unabhängig vom gekürzten Verlauf erhalten. Ohne nutzbaren Browserspeicher bleibt die App spielbar und zeigt einen Hinweis.

Das Wortspiel enthält 1.642 deutsche und 1.633 türkische Wörter. Die eigenständig KI-gestützt zusammengestellten Listen wurden technisch auf Normalisierung und Dubletten geprüft. Eine menschliche sprachliche Gesamtprüfung steht aus; siehe [Herkunft und Prüfbedarf](src/games/recognition/content.md).

## Dokumentation und Versionen

- [Architektur und Datenfluss](docs/architecture.md)
- [Tatsächlich implementierte Spielregeln](docs/game-rules.md)
- [Technische Entscheidungen](docs/decisions.md)
- [Prüfungen und manuelle Gerätecheckliste](docs/testing.md)
- [Änderungsverlauf](CHANGELOG.md)
- [Verbindliche Arbeitsanweisungen](AGENTS.md)

Die App-Version folgt Semantic Versioning. Davon getrennt besitzen jedes Spiel eine Regelversion, das Wortspiel eine Inhaltsversion und die Speicherung eine Schemaversion. Eine Änderung der Regeln oder Wortdaten muss ihre Vergleichbarkeit prüfen; unvereinbare Rekorde werden nicht vermischt.
