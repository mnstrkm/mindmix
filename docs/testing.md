# Qualitätssicherung

## Prüfstand 1.3.0

**18.10.2026 · Windows · Node.js 24.19.0 · pnpm 11.25.0 · Microsoft Edge (Chromium)**

| Prüfung | Ergebnis |
| --- | --- |
| Strikte TypeScript-Prüfung | Bestanden |
| Logik-, Komponenten-, Audio- und Übersetzungstests | 95 Tests in 22 Dateien bestanden |
| Produktionsbuild einschließlich PWA | Bestanden; 31 Precache-Dateien, rund 473 KiB |
| Playwright am Produktionsbuild | 27 Browserprüfungen bestanden |
| Visuelle Durchsicht | Mobile Zahlenfelder, Einstellungen, Rekordspalten und Ergebnisansichten; Deutsch und Türkisch, auch 320 Pixel mit sehr großer Schrift |

Lokale Browserprüfungen verwenden `PLAYWRIGHT_CHANNEL=msedge`. Der [CI-Workflow](https://github.com/mnstrkm/mindmix/actions/workflows/pages.yml) führt die Prüfungen mit Chromium unter Linux aus. Der jeweilige Workflow-Lauf dokumentiert den externen Stand separat.

## Prüfungen ausführen

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

Unter Windows kann statt Playwright-Chromium die vorhandene Edge-Installation verwendet werden:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
pnpm test:e2e
```

`pnpm check` umfasst Typprüfung, Vitest und Produktionsbuild. Die Browserprüfungen starten einen lokalen Server für den gebauten Stand. Offline- und Updateprüfungen benötigen diesen Produktionsbuild; die Entwicklungsansicht genügt dafür nicht.

## Automatisierte Abdeckung

| Bereich | Nachgewiesene Eigenschaften |
| --- | --- |
| Wörter | Neuer/bekannter Status vor Eintragung, nie unmittelbar identische Wörter, Zufallsrandfälle, Poolende, Normalisierung und Dubletten beider Sprachen |
| Zahlenfolgen | Führende Nullen, Korrekturen, genaue Reihenfolge, neue Folgen, gewertete vollständig gelöste Länge |
| Farbreihenfolge | Gesperrte Vorführung, Eingabereihenfolge, sichtbare letzte Eingabe, Pause vor/nach erster Eingabe, Timerbereinigung |
| Räumliches Gedächtnis | Eindeutige und unterschiedliche Muster, Mengengleichheit, Progression bis 8×4, mindestens 48×48-Pixel-Touchziele, verborgene Vorlage auch bei Pause |
| Kopfrechnen | Zahlenbereiche, alle Rechenarten, ganzzahlige Division, keine direkte Aufgabenwiederholung, begrenzte Erzeugung und ausgewogene Rechenarten |
| Visuelle Suche | Genau ein Ziel, Progression bis 4×4, Richtungen, kurze Rückmeldung und keine hängenbleibende Touch-Auswahl |
| Regelwechsel | Alle Farbe/Form/Regel-Kombinationen, feste Antwortflächen, Einstiegsblöcke und Wechselwahrscheinlichkeiten |
| Reaktion | Fünf Messungen, Fehlstarts, Unterbrechungen, Durchschnitt, getrennte Einzelrekorde und bewusst angezeigte fünfte Zeit |
| Ergebnisse | Einmalige Finalisierung, Fehlerübersichten, vorheriger vergleichbarer Rekord, keine doppelten Reaktionswerte, keine Speicherung der temporären Raster |
| Navigation | Wiederholen öffnet Vorbereitung in allen acht Spielen, gewählter Modus bleibt erhalten, keine unbeabsichtigte neue Sitzung, Menü führt zum Katalog |
| Scrollen und Fokus | Sichtbare Inhalte bleiben stehen, große Bereiche werden ausgerichtet, Katalogziel bei 320/768/1440 Pixeln, Tastatur und 200-Prozent-Textvergrößerung |
| Einstellungen | Sprache und Theme bleiben erhalten, drei ungebrochene Buchstabengrößen, neue Lautstärken bei 50 Prozent, gespeicherte Werte unverändert |
| Mobile Rekorde | Durchschnitt und Einzelzeit bündig in Vorbereitung und Bestleistungen, auch mit sehr großer türkischer Schrift bei 320 Pixeln |
| Audio | Einzelner UI-Ton, keine zusätzliche Klickebene auf Farbtönen, Fehlerton trotz neuem Rekord, stumme Effekte, Regleränderungen, optionale Dateien und kein verspäteter Ersatzton nach Pause |
| Speicherung | Validierung, Speicherausfall, maximal 30 Partien je Spiel, langfristige Rekorde, getrennte Vergleichsgruppen und keine doppelte Finalisierung |
| Übersetzungen | Gleiche Schlüssel und Platzhalter in Deutsch und Türkisch |
| Offline und Updates | Alle acht Module und beide Sprachen nach Precache offline, Offline-Neuladen, wartendes Update während der Partie und bewusste Aktivierung ohne Datenverlust |

Zufalls- und Timerprüfungen verwenden kontrollierte Quellen. Die Audioprüfungen beobachten die angeforderten Oszillatortöne und deren Zuordnung, nicht den Klang physischer Lautsprecher. Die Übersetzungsprüfung ersetzt keine redaktionelle Gesamtprüfung der Wortlisten.

## Offene Geräteprüfungen

Browseremulation prüft Layout und Ereignisse, aber keine reale Haptik oder Hardwarelatenz. Folgende Bedingungen sind noch auf echten Geräten zu prüfen:

- Android mit großer beziehungsweise maximaler Systemschrift und nativer Browservergrößerung.
- iPhone/iPad mit Safari und installierter PWA.
- Physische Touch-Ziele, Drehung, Bildschirmsperre und Rückkehr aus dem Hintergrund.
- Tatsächliche Audiofreigabe, Tonlautstärke und Gerätesperre; Kopfhörer und Lautsprecher.
- Bildschirm-, Geräte- und Eingabelatenz bei Reaktionsmessungen.
- Vollständige Bedienung mit realen Screenreadern.
- Menschliche sprachliche Gesamtprüfung beider Wortvorräte.

## Manuelle Abnahme

### Bedienung

- [ ] Von Ergebnis zu Vorbereitung, erneuter Start und direkte Rückkehr zur Spielauswahl.
- [ ] Passende Scrollposition bei kleiner, flacher und großer Anzeige; kein Sprung bei bereits sichtbarem Inhalt.
- [ ] Tab, Enter und Leertaste erreichen alle Bedienelemente; Fokus bleibt erkennbar.
- [ ] Gedächtnisvorlagen bleiben beim Öffnen der Erklärung verborgen.
- [ ] Hintergrundwechsel pausiert; Fortsetzen startet keinen verworfenen Reaktionsversuch erneut.

### Darstellung und Ton

- [ ] Beide Sprachen in allen drei Schriftgrößen, Hoch- und Querformat.
- [ ] Rekordwerte bleiben bündig; keine abgeschnittenen Beschriftungen oder überlappenden Aktionen.
- [ ] Jeder normale UI-Druck erhält einen dezenten Ton; Farb- und Antwortflächen spielen ausschließlich ihren eigenen Ton.
- [ ] Ein falsches Farbsignal bleibt auch bei neuem Rekord hörbar falsch.
- [ ] Effekte aus und Lautstärke null bleiben vollständig still.
- [ ] Optional konfigurierte Dateien blockieren bei Ladefehlern keinen Ablauf.

### Installation und Daten

- [ ] Nach vollständiger Vorbereitung Browser schließen und offline erneut öffnen.
- [ ] Installierte PWA starten; Hinweis und bewusste Aktivierung einer neuen Version prüfen.
- [ ] Während einer Partie bleibt die Update-Aktion gesperrt.
- [ ] Einstellungen, Verläufe und Rekorde bleiben nach Reload und Update erhalten.
- [ ] Nicht nutzbarer Browserspeicher zeigt den Hinweis und erlaubt Weiterspielen.

## Weitere Prüfprotokolle

Neue Prüfungen mit Datum, Version oder Commit, Betriebssystem, Browser und ausgeführten Schritten dokumentieren. Bestanden, nicht ausgeführt und fehlgeschlagen klar unterscheiden. Frühere Entwicklungsstände sind im [Änderungsverlauf](../CHANGELOG.md) und in der Git-Historie nachvollziehbar.
