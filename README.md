<p align="center"><img src="public/icon.svg" width="72" height="72" alt="MindMix" /></p>

# MindMix

**Acht Spiele. Dein Tempo.**

Kurze Spiele zum Merken, Rechnen und Reagieren – auf Deutsch und Türkisch, auf dem Smartphone und im Browser.

### [MindMix spielen →](https://mnstrkm.github.io/mindmix/)

[![Prüfungen](https://github.com/mnstrkm/mindmix/actions/workflows/pages.yml/badge.svg)](https://github.com/mnstrkm/mindmix/actions/workflows/pages.yml)

Version **1.3.1** · [Änderungsverlauf](CHANGELOG.md) · [Repository](https://github.com/mnstrkm/mindmix)

## Spielen

- Acht eigenständige Spiele mit visuellen Erklärungen und persönlichen Bestleistungen.
- Ohne Zeitdruck; nur die Reaktions-Challenge misst Zeit.
- Dunkle und helle Ansicht, drei Schriftgrößen, Tastaturbedienung und dezente Tonrückmeldungen.
- Nach vollständiger Offline-Vorbereitung auch ohne Internet spielbar. Optional als App zum Startbildschirm hinzufügen.
- Ohne Konto, Werbung oder Tracking. Einstellungen und Ergebnisse bleiben im verwendeten Browser.

| Spiel | Aufgabe |
| --- | --- |
| Schon gesehen? | Neue und bereits gezeigte Wörter unterscheiden |
| Zahlenfolge merken | Immer längere Ziffernfolgen wiedergeben |
| Farbreihenfolge | Farb- und Tonsignale in derselben Reihenfolge wählen |
| Räumliches Gedächtnis | Markierungen im Raster wiederfinden |
| Kopfrechnen | Aufgaben im Grundrechnen oder gemischten Modus lösen |
| Visuelle Suche | Den passenden Pfeil im Raster finden |
| Regelwechsel | Abwechselnd nach Farbe oder Form entscheiden |
| Reaktions-Challenge | Fünf Reaktionszeiten messen und vergleichen |

Bestleistungen werden je Spiel und Modus geführt. Frühere Ergebnisse bleiben bei Regeländerungen getrennt erhalten. Es gibt keine gemeinsame Leistungsnote oder medizinische Bewertung.

## Offline und als App

MindMix einmal online öffnen und auf **„Bereit für offline“** warten. Anschließend sind alle Spiele und beide Sprachen offline verfügbar. Über das Browser-Menü lässt sich die App zum Startbildschirm hinzufügen; die genaue Bezeichnung hängt vom Browser ab.

Updates erscheinen als Hinweis und werden bewusst aktiviert. Während einer Partie wird kein Update eingespielt. Browserdaten können auf Nutzerwunsch oder bei Platzmangel gelöscht werden; Ergebnisse werden nicht zwischen Geräten synchronisiert.

## Lokal entwickeln

Voraussetzungen: **Node.js ≥ 22.12.0** und **pnpm 11.25.0**.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Die ausgegebene lokale Adresse öffnen. `pnpm check` prüft Typen und Tests und erstellt den Produktionsbuild. Weitere Befehle und Konfigurationen stehen im [Entwicklungsleitfaden](docs/development.md).

## Dokumentation

| Thema | Dokument |
| --- | --- |
| Entwicklung, Audio und Navigation | [Entwicklungsleitfaden](docs/development.md) |
| Module, Datenfluss und Speicherung | [Architektur](docs/architecture.md) |
| Regeln und Ergebnisberechnung | [Spielregeln](docs/game-rules.md) |
| Architekturentscheidungen | [Technische Entscheidungen](docs/decisions.md) |
| Testabdeckung und offene Geräteprüfungen | [Qualitätssicherung](docs/testing.md) |
| Herkunft der deutschen und türkischen Wortlisten | [Wortvorräte](src/games/recognition/content.md) |

Die Wortlisten sind technisch geprüft; eine menschliche sprachliche Gesamtprüfung steht aus. Tatsächliche Geräte- und Eingabelatenz ist insbesondere bei Reaktionszeiten Teil des gemessenen Werts.
