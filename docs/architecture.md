# Architektur

MindMix ist eine statische React-/TypeScript-Anwendung. Vite erzeugt den Produktionsbuild; Hash-Routing ermöglicht direkte Spieladressen auf GitHub Pages. Es gibt kein Backend und keine zur Laufzeit erforderlichen externen Dienste.

## Zuständigkeiten

| Bereich | Verantwortung |
| --- | --- |
| `src/main.tsx` | Initialisiert i18next, globale Styles und React |
| `src/app/App.tsx` | Navigation, Routen, Hauptlayout, globale Einstellungen |
| `src/app/registry.ts` | Die acht Spiele mit Kennung, Modul, Regel-/Inhaltsversion und Darstellungsfarbe registrieren |
| `src/app/GameHost.tsx` | Vorbereitung, Erklärung, Pause, Start, freiwilliges Ende, Ergebnis und genau einmalige Finalisierung |
| `src/app/types.ts` | Kleine gemeinsame Verträge für Spielkennung, Sprache, Ergebnis und Komponenten-Props |
| `src/games/<id>/logic.ts` | Reine Erzeugungs-, Prüf- und Zustandsfunktionen des jeweiligen Spiels |
| `src/games/<id>/config.ts` | Benannte Regelparameter und Progression |
| `src/games/<id>/Game.tsx` | Lokaler Spielzustand, Darstellung und Eingaben |
| `src/games/<id>/translations.ts` | Deutsche und türkische Texte eines Spiels |
| `src/shared/ui/` | Gemeinsame Bedienelemente ohne Spielregeln |
| `src/shared/ui/viewport.ts` | Inhaltsbereiche messen, gezielt sichtbar machen und Fokus ohne natives Nachscrollen setzen |
| `src/services/storage/` | Validierung, lokale Einstellungen, Verlauf, Rekorde und Speicherung |
| `src/services/audio/` | Semantische Soundereignisse, erzeugte Töne und optionale Audio-Dateien |
| `src/i18n/` | Gemeinsame Texte und Registrierung aller Sprachressourcen |
| `src/pwa/` | Offline-Status und kontrollierte Update-Aktivierung |

Spielmodule importieren keine internen Dateien anderer Spiele. Gemeinsame UI kennt weder Punktberechnung noch Schwierigkeitsregeln. Für neue Aufgaben wird keine universelle Spielsprache oder externe State-Bibliothek benötigt.

## Ablauf einer Partie

```text
Spielverzeichnis → Vorbereitung → Spielmodul → Ergebnis
                           ↓          ↓            ↓
                       Erklärung   onProgress    Finalisierung
                                      ↓            ↓
                               aktueller Stand   Speicher
```

Der Host fixiert beim Start die Vergleichsmetadaten und erzeugt eine Sitzungskennung. Das Spiel erhält `language`, `variant`, `paused`, `onProgress` und `onFinish`. Es meldet Ergebnisdaten und bei Bedarf eine vorübergehende Ergebnisansicht; direkte Schreibzugriffe auf den lokalen Ergebnisspeicher bleiben beim Host.

`onProgress` aktualisiert den sichtbaren Score und den zuletzt erreichten Stand für ein freiwilliges Ende. `onFinish` liefert das abschließende Ergebnis mit einem Grund wie Fehler oder erfolgreich abgeschlossen. `actions` unterscheidet eine lediglich geöffnete Partie von einer bereits gewerteten Aktion. `eligible: false` schließt insbesondere unvollständige Reaktionsmessungen von Rekorden aus.

Seit 1.2.0 kann ein Spiel mit `review` eine eigene, nicht interaktive React-Ergebnisansicht liefern. Die zugehörigen `ResultReview.tsx`-Komponenten bleiben im Spielmodul; der Host kennt ihre Regeln nicht. Er zeigt diese Ansicht erst nach dem Ende und entfernt sie vor der Speicherung. Raster, der Zahlenfolgenvergleich und einzelne Reaktionszeiten werden so nicht als Eingabeprotokoll gespeichert. `hideResultRecord` unterdrückt bei Bedarf den allgemeinen Rekordblock, damit die Reaktionsübersicht ihren Durchschnitt nicht mehrfach zeigt. Bei einer verbesserten Hauptbestleistung hält der Host den vorherigen vergleichbaren Wert für die Ergebnisansicht fest.

Der Host besitzt eine Finalisierungssperre pro Sitzung. Der Speicherdienst weist zusätzlich dieselbe Sitzungskennung zurück. Dadurch erzeugen wiederholte Ereignisse keine doppelten Verlaufseinträge. Navigieren aus einem Spiel beendet die aktuelle Partie mit dem zuletzt gemeldeten Stand. Ein vollständiges Schließen des Browsers stellt keine laufende Partie wieder her.

Nach dem Ergebnis führt „Noch einmal“ in die Vorbereitung zurück, ohne eine Sitzung zu eröffnen. Variante und Vergleichsgruppe bleiben ausgewählt. Erst der ausdrückliche Start erzeugt wieder eine Sitzungskennung. Ausschließlich „Zum Menü“ aus dem Ergebnis setzt `scrollTarget: 'games'` im Routenzustand; der Einstiegstext der Startseite wird dann übersprungen.

Die Scrollführung verwendet gemessene Elementgrenzen und die aktuelle Fensterhöhe. Passende Inhalte bleiben sichtbar, große Bereiche beginnen mit einem kleinen Rand im Sichtbereich. `ReadyContent` richtet nach dem Laden eines Spielmoduls dessen tatsächliche Ansicht aus. Programmatische Fokuswechsel unterbinden zunächst das native Scrollen, bevor der benötigte Bereich gezielt eingeblendet wird. Es werden keine festen Gerätemodelle oder Scrollkoordinaten vorausgesetzt.

Die Regeln arbeiten, soweit erforderlich, mit übergebenen Zufallsquellen und Zeitwerten. Tests können dadurch gezielt Randfälle erzeugen. Es gibt keine dauernde Render-Schleife; zeitabhängige Spiele verwenden begrenzte Timer beziehungsweise einen Animationsframe für das Reaktionssignal.

Normale Fokuswechsel scrollen nur um den tatsächlich verdeckten Bereich. Bei einem neuen räumlichen Muster wird die Rastervorlage mit Stufenangabe ausgerichtet, statt dem Ausblendknopf unter dem wachsenden Raster zu folgen. Das Zahlenfeld bietet symmetrisch Löschen, Null und eine kleine Bestätigung; der große Bestätigungsknopf bleibt zusätzlich erhalten. Beide lösen dieselbe Prüfung aus.

## Unterbrechungen und Eingaben

Eine Erklärung oder ein Hintergrundwechsel pausiert das Spiel. Die Fortsetzung erfolgt bewusst per Button. Der Host blendet die laufende Spielansicht währenddessen aus und gibt `paused` weiter. Die Spielmodule bereinigen eigene Timer und akzeptieren keine Eingaben während der Pause. Audio wird angehalten.

Zahlen- und Rastervorlagen werden in der Abrufphase tatsächlich aus der Darstellung entfernt; eine Pause stellt sie nicht wieder her. Simon beginnt eine unterbrochene Vorführung vor der ersten gültigen Eingabe vollständig neu. Nach bereits begonnener Eingabe bleibt der Abrufzustand erhalten, ohne erneute Vorführung. Bei der Reaktion wird ausschließlich der unterbrochene Versuch verworfen.

Normale Buttons reagieren auf `click`, damit sich eine versehentliche Berührung abbrechen lässt. Nur die Reaktionsfläche misst bei primärem `pointerdown` beziehungsweise Enter/Leertaste auf `keydown`; ein nachfolgendes Click-Ereignis wird dort nicht erneut gewertet.

## Speicherung und Vergleichbarkeit

`localStorage` enthält unter `mindmix:data` ein Objekt mit Schemaversion, Einstellungen, Verlauf und Rekorden. Der Speicherdienst bietet über `useSyncExternalStore` einen kleinen reaktiven Snapshot an. Der gemeinsame React-Kontext enthält nur die Information, ob gerade eine Partie läuft, damit etwa Updates gesperrt werden können.

Geladene Daten werden als unbekannte Daten behandelt und validiert. Ungültige Einzelergebnisse werden herausgefiltert, Einstellungen erhalten sichere Standardwerte. Beschädigtes JSON oder unbekannte Schemaversionen werden nicht ungeprüft übernommen. Bei einem Lesefehler beginnt die laufende App mit Standardwerten; die alte Speicherung bleibt bis zur nächsten bewussten Änderung unangetastet. Bei Schreibfehlern läuft die Anwendung mit dem Datenbestand im Arbeitsspeicher weiter und zeigt die fehlende dauerhafte Speicherung an.

Pro Spiel bleiben höchstens 30 Verlaufseinträge erhalten, über alle Varianten zusammen. Die Vorbereitung zeigt die letzten fünf zur aktuellen Vergleichsgruppe passenden Einträge. Rekorde werden separat gespeichert und verschwinden nicht dadurch, dass ein alter Verlaufseintrag herausfällt. Vollständige Eingabeprotokolle oder personenbezogene Daten werden nicht gespeichert.

Der Vergleichsschlüssel enthält Spiel, Variante, Regelversion und gegebenenfalls Inhaltsversion. Nur das Wortspiel verwendet zusätzlich die Spielsprache. Die UI-Sprache trennt keine sprachunabhängigen Rekorde. Beim Kopfrechnen trennen `basic` und `mixed` die Rekorde. Bei Reaktionszeiten ist kleiner besser; bei den anderen Spielen ist größer besser. Gleichstände ersetzen den bestehenden Rekord nicht.

Seit 1.1.0 enthält der Vergleichsschlüssel zusätzlich eine optionale Metrikkennung. `recordScores` meldet weitere unabhängige Rekorde derselben Vergleichsrichtung; bei der Reaktion ist dies `fastest`. Der Speicher hält diesen Rekord getrennt vom Durchschnitt, auch wenn seine ursprüngliche Partie aus dem 30-Einträge-Verlauf herausfällt. Eine gültige Einzelzeit kann einen solchen Rekord ergeben, obwohl die Partie noch keinen vollständigen Durchschnitt besitzt. `variantRuleVersions` ermöglicht eine Regeländerung nur im gemischten Rechenmodus. Frühere Vergleichsgruppen bleiben gespeichert. Alle Spiele zeigen ausschließlich die aktuellen Vergleichsgruppen; Archiv-Dropdowns und die dorthin führenden Links sind ausgeblendet. Seit 1.4.0 verwendet das Wortspiel Regelversion 4: Nur richtig erkannte neue Wörter geben Punkte. Ältere Punktestände werden weder umgerechnet noch mit der neuen Wertung zusammengeführt.

Versionen haben unterschiedliche Aufgaben:

- `package.json` / `CHANGELOG.md`: veröffentlichte App-Version, zunächst **1.0.0**.
- `RULE_VERSION` im jeweiligen Spiel: vergleichbare Regeln und Punktberechnung, zunächst **1**.
- `CONTENT_VERSION` beim Wortspiel: vergleichbarer Wortvorrat, zunächst **1**.
- `SCHEMA_VERSION` im Speicherdienst: Format der gespeicherten Daten, zunächst **1**.

Eine neue Regelversion benötigt keine Datenmigration, nur eine neue Vergleichsgruppe. Eine Änderung am Speicherformat benötigt dagegen eine bewusst implementierte Migration. Für Version 1 existiert kein älteres unterstütztes Schema.

Die Erweiterungen von 1.1.0 sind additive Felder im Schema 1: ältere Einstellungen erhalten `theme: 'dark'`, fehlende Rekordmetriken bedeuten den bisherigen Hauptwert. Bestehende Ergebnisse werden nicht umgerechnet oder entfernt. Insbesondere wird kein Median als Durchschnitt ausgegeben.

## Sprache, Inhalte und Darstellung

i18next lädt die beiden Sprachressourcen lokal. Jeder Spielname besitzt einen eigenen Namespace; gemeinsame Navigation, Einstellungen und Hinweise liegen in `common`. Komponenten verwenden vollständige übersetzte Sätze mit Platzhaltern. Ein Test vergleicht Schlüssel und Platzhalter beider Sprachen.

Die Wortlisten sind getrennte Inhalte für Deutsch und Türkisch. Eine Partie fixiert ihren Wortvorrat beim Start. Der Weg zu den Spracheinstellungen beendet die laufende Partie kontrolliert; eine neue Wortpartie verwendet anschließend den neu gewählten Pool. Wortdatenpflege und sprachlicher Prüfbedarf sind bei den [Spielregeln](game-rules.md) beschrieben.

Globale CSS-Variablen definieren Farben, Schrift und Abstände. Spielbezogene Styles bleiben beim jeweiligen Modul. Das Layout verwendet skalierbare Maße, Textumbruch, sichtbare Fokuszustände und lokale SVG-Symbole. Gedächtnis- und Suchaufgaben haben trotz Beschriftungen keine zugesicherte vollständige nichtvisuelle Gleichwertigkeit.

Dark Mode ist der Standard; eine gespeicherte helle Ansicht bleibt optional. Das Theme wird vor dem React-Start gesetzt. Jedes Spiel besitzt ein eigenes `Guide.tsx` mit einem statischen visuellen Beispiel. Nur der darstellende Rahmen ist gemeinsam; die Beispiele greifen nicht auf die laufende Aufgabe oder deren verborgene Gedächtnisvorlage zu.

## Audio und PWA

Spiele senden Ereignisse wie `correct` oder `simon0` an den Audiodienst. Web Audio erzeugt die Standardeffekte. Optionale lokale Dateien werden zentral konfiguriert, einmal vorbereitet und bei fehlender Nutzbarkeit durch Synthese ersetzt. Musik besitzt keinen erzeugten Ersatz. Effekte und Musik haben getrennte Einstellungen; die Audiofreigabe erfolgt bei Nutzerinteraktion.

Die Spielkomponenten werden über `React.lazy` getrennt geladen. Workbox nimmt dennoch alle gebauten JavaScript-Dateien, Styles und erforderlichen lokalen Assets in den Precache auf. Damit umfasst die Offline-Vorbereitung auch noch nicht geöffnete Spiele und die Wortdaten. Optionale Audio-Dateien sind kein notwendiger Bestandteil der Service-Worker-Installation.

Der Service Worker verwendet einen Update-Hinweis. Aktivierung und Neuladen erfolgen bewusst; während einer Partie bleibt die Update-Aktion deaktiviert. Cachebereinigung betrifft Build-Dateien und verändert den lokalen Ergebnisbestand nicht.
