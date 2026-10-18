# Prüfungen und Gerätecheckliste

Die Prüfungen sichern konkrete Eigenschaften. Ein grüner Testlauf ist keine Garantie für Fehlerfreiheit oder identisches Verhalten aller Geräte. Automatisierte Browseremulation und echte Gerätetests werden getrennt dokumentiert.

## Befehle

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm check` fasst Typprüfung, Vitest und Produktionsbuild zusammen. Ein eigener Lint-Schritt ist derzeit nicht konfiguriert. Die Lockdatei fixiert den installierten Abhängigkeitsstand. Browser- oder Betriebssystempakete für Playwright müssen in der jeweiligen Umgebung verfügbar sein.

Für die manuelle Prüfung der PWA:

```sh
pnpm build
pnpm preview
```

Die vom Terminal ausgegebene Adresse einschließlich `/mindmix/` öffnen. Ein Test ausschließlich am Entwicklungsserver prüft keine vollständige Produktions-PWA.

## Automatisierte Abdeckung

| Bereich | Zu prüfende Eigenschaften |
| --- | --- |
| Wortwiedererkennung | Status vor Eintragung, neue und wiederholte Wörter, Poolende, Normalisierung und Dubletten |
| Zahlenfolgen | Führende Nullen, exakte Reihenfolge, neue Folge pro Runde, vollständig gelöste Länge |
| Simon | Folge um ein Signal verlängern, Eingabereihenfolge, gesperrte Vorführung, Pause vor/nach erster Eingabe, Timerbereinigung |
| Räumliches Gedächtnis | Anzahl und Eindeutigkeit der Markierungen, keine direkt gleichen Muster, Mengengleichheit, elf Stufen und Plateau |
| Kopfrechnen | Gültige Zahlenbereiche, korrekte Operationen, ganzzahlige Division, ausgewogene Rechenarten, begrenzte Erzeugung, keine direkte Wiederholung |
| Visuelle Suche | Exakt ein Ziel, gültige Positionen, Rastergrenze 4×4, Progression vor Ähnlichkeit |
| Regelwechsel | Alle acht Farbe/Form/Regel-Kombinationen, feste Antwortzuordnung, Blöcke und Wechselplateau |
| Reaktion | Phasen, Fehlstarts, Unterbrechungen, fünf gültige Messungen, Durchschnitt, sichtbare fünfte Zeit und getrennte Rekorde |
| Komponenten | Bestätigung und Korrektur, keine Systemtastatur, verborgene Vorlagen, Pausen, Doppelwertung und einmaliges Ende |
| Speicherung | Datenvalidierung, Ausfall des Speichers, maximal 30 Einträge pro Spiel, separate Rekorde, vergleichbare Gruppen, doppelte Finalisierung |
| Übersetzungen | Gleiche Schlüssel und Platzhalter in Deutsch und Türkisch |
| Audio | Sofortiger erzeugter Ersatz bei fehlenden oder noch ladenden Dateien, kein wiederholter Ladeversuch, optionale Musik, kein verspäteter Ton nach Pause |
| Browser | Navigation, Spielabläufe, Sprachen, Speicherung, Layout und Offline-Nutzung gemäß den eingerichteten Playwright-Fällen |

Zufallstests verwenden kontrollierte Quellen und prüfen garantierte Eigenschaften. Eine bestimmte statistische Trefferquote aus einer unkontrollierten Stichprobe ist keine stabile Testbedingung. Timer werden in Komponententests kontrolliert weitergeschaltet; tatsächliche Reaktions- und Audiolatenz lässt sich daraus nicht ableiten.

## Prüfprotokoll dieser Version

### Überarbeitung 1.1.0

Am **18.10.2026** bestanden unter Windows mit Node.js 24.19.0 und Microsoft Edge zunächst die strikte Typprüfung, der Produktionsbuild, **80 Vitest-Prüfungen in 20 Dateien** und **17 Browserprüfungen**. Die lokale Browserkonfiguration wurde weiterhin mit `PLAYWRIGHT_CHANNEL=msedge` ausgeführt. Der Build umfasst rund **466 KiB** im vollständigen Offline-Precache.

Neue beziehungsweise erweiterte Nachweise: Standard-Dark-Mode und persistente helle Ansicht, alle acht visuellen Erklärungen bei 320 Pixeln und sehr großer türkischer Schrift, unabhängige Durchschnitts-/Einzelrekorde, unveränderte und beschriftete alte Medianrekorde, kein dreifach direkt wiederholtes Wort, Simons sichtbare letzte Eingabe und eine bis zur Bestätigung sichtbare fünfte Reaktionszeit. Das räumliche Spiel wurde bis zur neuen höchsten Stufe mit **8×4 Feldern und 16 Markierungen** durchgespielt; alle 32 Touch-Ziele waren mindestens **48×48 CSS-Pixel** groß. Die Rekordtests prüfen zusätzlich, dass der schnellste Einzelwert nach mehr als 30 weiteren Partien erhalten bleibt.

Die folgenden älteren Protokolle dokumentieren die damaligen Versionen; ihre Median- und 4×4-Angaben gelten nicht als Beschreibung der aktuellen Regeln. Die Grenzen echter Geräte-, Systemschrift- und Haptikprüfung bestehen weiterhin.

Nach der letzten Straffung des mobilen Kopfbereichs bestanden zusätzlich alle **neun betroffenen Browserabläufe** erneut. Visuell geprüft wurden die dunkle Desktop-Startseite, Kopfrechnen und die visuelle Reaktionserklärung mit großer türkischer Schrift sowie die stehenbleibende fünfte Zeit mit separat beschriftetem Durchschnitt.

### Deployment-Korrektur 1.0.1

Der erste tatsächliche [GitHub-Lauf von Version 1.0.0](https://github.com/mnstrkm/mindmix/actions/runs/39082850830) bestand Typprüfung, 75 Tests und Build, scheiterte aber an einem von 15 Browserfällen. Beim Navigationsfall wurde der bisherige Verlauf gelesen, bevor React die verlassene Partie gespeichert hatte. Die korrigierte Prüfung wartet auf die Einstellungsseite und prüft anschließend mit `expect.poll` genau zwei Zahlenpartien, den Beendigungsgrund `stopped` und den erreichten Score 2. Es wurden weder Prüfungen deaktiviert noch pauschale Testwiederholungen zum Verdecken eines Fehlers eingerichtet.

Für **1.0.1** bestanden lokal am **18.10.2026** erneut `pnpm check` (Typprüfung, **75 Tests**, Produktionsbuild) und **fünf aufeinanderfolgende Durchläufe des betroffenen Browserfalls** mit Microsoft Edge. Die erneute Linux-/Chromium-Prüfung und Veröffentlichung sind im jeweiligen [GitHub-Actions-Lauf](https://github.com/mnstrkm/mindmix/actions/workflows/pages.yml) separat nachvollziehbar.

Parallel wurde bei der Diagnose festgestellt, dass die öffentliche Seite mit der Pages-Quelle `Deploy from a branch`, `main`, `/(root)` den ungebauten Repository-Einstieg auslieferte. Für die funktionierende Website ist die Quelle `GitHub Actions` und das erfolgreiche Deployment des erzeugten `dist/`-Artefakts erforderlich.

### Erstprüfung 1.0.0

Prüfstand **18.10.2026**, App **1.0.0**, Windows, Node.js **24.19.0**, pnpm **11.25.0**:

| Tatsächlich ausgeführte Prüfung | Ergebnis |
| --- | --- |
| Strikte TypeScript-Prüfung | Erfolgreich |
| Vollständige Vitest-Suite | **75 Tests in 20 Dateien bestanden** |
| Produktionsbuild mit Vite und PWA | Erfolgreich; **31 Dateien, rund 449 KiB**, im Precache |
| Playwright am Produktionsbuild mit installiertem Microsoft Edge, Chromium-Engine | **15 Browserprüfungen bestanden** |
| Visuelle Durchsicht von Browseraufnahmen | Desktop-Startseite, mobile Startseite und Kopfrechnen bei 320 Pixeln mit sehr großer türkischer Schrift |

Der Browserlauf wurde mit `PLAYWRIGHT_CHANNEL=msedge` und `pnpm exec playwright test` ausgeführt. Ohne diese Variable verwendet die Konfiguration Playwright-Chromium; der GitHub-Workflow installiert diesen Browser. Ein tatsächlicher GitHub-Actions- oder Pages-Lauf gehört nicht zum lokalen Prüfnachweis.

Nach einer abschließenden CSS-Korrektur der mobilen Navigationsumbrüche wurden der Produktionsbuild und die sechs betroffenen Layout-, Tastatur- und Speicherprüfungen erneut erfolgreich ausgeführt. Der dokumentierte Sammelbefehl `pnpm check` bestand ebenfalls vollständig.

Die Browserprüfungen decken richtige und falsche Antworten aller acht Spiele, Ergebnisse, Neustart, Navigation einschließlich Browser-Zurück, kontrolliertes Beenden, persistente Einstellungen und Rekorde sowie Sprachwechsel ab. Geprüft wurden 320, 390, 768 und 1.440 CSS-Pixel Breite und Querformat. Alle acht Spielansichten wurden bei 320 Pixeln mit sehr großer türkischer App-Schrift auf seitlichen Überlauf geprüft. Das räumliche Spiel wurde bis zum 4×4-Plateau durchgespielt; die 16 Touch-Flächen blieben mindestens 48×48 CSS-Pixel groß. Der Tastaturfall prüft Tab, Skip-Link, Enter und Leertaste sowie simulierte 200-Prozent-Textvergrößerung; dies ersetzt keinen Test des nativen Browser-Zooms oder der Systemschrift.

Nach vollständigem Precache wurden das Netzwerk deaktiviert, die Website neu geladen und alle acht zuvor nicht benötigten Spielmodule sowie das türkische Wortspiel offline geöffnet. Der Update-Test verändert den lokalen Service Worker, prüft den deaktivierten Update-Button während einer Partie und aktualisiert anschließend bewusst; der zuvor erreichte Rekord bleibt erhalten. Er prüft damit den Aktivierungsablauf, nicht die Bereitstellung zweier externer GitHub-Pages-Releases.

Zusätzlich wurde gesperrter Browserspeicher im Browser getestet. Die Audiotests prüfen fehlende beziehungsweise noch ladende Dateien, einmalige Ladeversuche, optionale Musik und den verhinderten verspäteten Ersatzton nach einer Pause. Die Wortlistenprüfung bestätigt Umfang, NFC-Normalisierung und sprachabhängige Eindeutigkeit von **1.642 deutschen / 1.633 türkischen Wörtern**.

### Noch nicht durch diese Entwicklung bewiesene Gerätebedingungen

- Echtes Android-Gerät mit großer beziehungsweise maximaler Systemschrift.
- iPhone/iPad mit Safari und installierter PWA.
- Nativer Browser-Zoom und installierte PWA auf realen Geräten; automatisiert wurde Textvergrößerung simuliert.
- Physische Touch-Ziele, reale Drehung und Bildschirm-/Gerätesperre auf diesen Geräten.
- Tatsächliche Audiofreigabe, Lautstärke und Wiedergabeunterbrechung auf diesen Geräten.
- Hardware-, Display- und Eingabelatenz der Reaktionsmessung.
- Vollständige Bedienprüfung mit realen Screenreadern.
- Menschliche sprachliche Prüfung der deutschen und türkischen Wortvorräte.

## Manuelle Checkliste

### Navigation und Zustand

- [ ] Alle acht Spielkarten führen zu einer Vorbereitung mit Erklärung, Rekord und Start.
- [ ] Richtige Eingabe, erste falsche Eingabe, Ergebnis, erneuter Start und Rückkehr ins Menü funktionieren.
- [ ] „Beenden“ und Browser-Zurück speichern nur bereits gewertete Partien und erzeugen keine doppelten Einträge.
- [ ] Eine lediglich geöffnete Partie erzeugt keinen Verlaufseintrag.
- [ ] Das Öffnen der Erklärung pausiert; die ausdrückliche Fortsetzung gibt Eingaben wieder frei.
- [ ] Tabwechsel und Sperren pausieren; nach Rückkehr läuft kein versteckter Timer weiter.
- [ ] Eine unterbrochene Reaktionsmessung wird verworfen, ohne Fehlstart oder gültige Messung.
- [ ] Simon startet vor erster Eingabe vollständig neu, zeigt nach begonnener Eingabe aber keine erneute Vorlage.
- [ ] Zahlen- und Rastervorlagen bleiben beim Öffnen der Erklärung während der Abrufphase verborgen.

### Große Schrift, kleine Geräte und Tastatur

- [ ] 320 CSS-Pixel Breite, größere Smartphones, Tablet und Desktop prüfen.
- [ ] Beide Sprachen bei normaler, großer und extra großer App-Schrift prüfen.
- [ ] Browser-Zoom bis mindestens 200 % und große Android-Systemschrift gesondert prüfen.
- [ ] Keine abgeschnittenen Beschriftungen, überlappenden Aktionen oder unerreichbaren Inhalte.
- [ ] Suchraster bis 4×4 und räumliche Raster bis 8×4 bleiben gut bedienbar; lange Zahlenfolgen umbrechen lesbar.
- [ ] Querformat und Rotation erhalten den Spielstand; Scrollen bleibt möglich.
- [ ] Alle normalen Aktionen mit Tab, Enter und Leertaste bedienen; sichtbaren Fokus und Fokusführung prüfen.
- [ ] Gedächtnisvorlagen in der Abrufphase auch im Accessibility-Baum kontrollieren.
- [ ] Reduzierte Bewegung, gute Kontraste und die zusätzlichen Symbole/Farbnamen prüfen.

### Sprache, Rekorde und Speicher

- [ ] Sprache wechseln: Navigation, Erklärungen, Spieltexte, Ergebnis und Hinweise wechseln vollständig.
- [ ] Wortspiel startet nach Sprachwechsel mit der gewählten Sprache neu.
- [ ] Wortrekorde sind nach Sprache, Rechenrekorde nach Modus getrennt.
- [ ] Sprachunabhängige Rekorde bleiben nach einem Wechsel der UI-Sprache erhalten.
- [ ] Neue Sitzung nach Reload erhält Einstellungen und passende Rekorde.
- [ ] Ein anderer Browser oder ein anderes Gerät besitzt erwartungsgemäß einen eigenen Bestand.
- [ ] Gesperrter oder voller Browserspeicher zeigt einen Hinweis, blockiert aber keine Spiele.

### Offline und Updates

- [ ] Produktionsbuild einmal vollständig online laden und auf erfolgreiche Offline-Vorbereitung warten.
- [ ] Netzwerk abschalten, die Website neu laden und jedes der acht Spiele starten; auch noch nicht zuvor geöffnete Module prüfen.
- [ ] Beide Sprachen sowie die Wortdaten offline prüfen.
- [ ] Browser vollständig schließen und offline erneut öffnen, soweit der Browser dies unterstützt.
- [ ] Einen tatsächlich veränderten zweiten Build bereitstellen und den Update-Hinweis prüfen.
- [ ] Während einer Partie kann das Update keinen Reload auslösen.
- [ ] Nach Ende bewusst aktualisieren; neue Version erscheint, Rekorde und Einstellungen bleiben erhalten.
- [ ] Service-Worker-Registrierungsfehler führt zu einem verständlichen Hinweis und einer spielbaren Online-Website.

### Audio und Assets

- [ ] Effekte an/aus und beide Lautstärken überprüfen.
- [ ] Keine konfigurierte Musik: App bleibt still, Hinweis und deaktivierte Musikauswahl passen dazu.
- [ ] Konfigurierte, aber fehlende Effektdatei: sofort erzeugter Ersatz, keine neue Dateiabfrage pro Klick.
- [ ] Noch nicht geladene oder fehlerhafte Effektdatei blockiert keine Aktion.
- [ ] Fehlende optionale Musik oder Effekte verhindern keine Service-Worker-Installation.
- [ ] Simon besitzt unterscheidbare Einzeltöne ohne zusätzliche Klicktöne.
- [ ] Beim Reaktionssignal gibt es keinen Startton.
- [ ] Erklärung, Tabwechsel und Verlassen stoppen laufende Musik beziehungsweise Effekte.

## Dokumentation eines neuen Prüflaufs

Datum, App-/Commitstand, Betriebssystem, Browser und ausgeführte Befehle beziehungsweise manuelle Schritte festhalten. Bestandene Prüfungen von nicht ausgeführten Prüfungen unterscheiden. Bei Fehlern den konkreten Ablauf und die verbliebene Einschränkung nennen. Nach einer Regeländerung gezielt betroffene Tests und `game-rules.md` aktualisieren; keine unveränderten Spiele nebenbei neu definieren.
