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

Der Host fixiert beim Start die Vergleichsmetadaten und erzeugt eine Sitzungskennung. Das Spiel erhält `language`, `variant`, `paused`, `onProgress` und `onFinish`. Es meldet ausschließlich Ergebnisdaten; direkte Schreibzugriffe auf den lokalen Ergebnisspeicher bleiben beim Host.

`onProgress` aktualisiert den sichtbaren Score und den zuletzt erreichten Stand für ein freiwilliges Ende. `onFinish` liefert das abschließende Ergebnis mit einem Grund wie Fehler oder erfolgreich abgeschlossen. `actions` unterscheidet eine lediglich geöffnete Partie von einer bereits gewerteten Aktion. `eligible: false` schließt insbesondere unvollständige Reaktionsmessungen von Rekorden aus.

Der Host besitzt eine Finalisierungssperre pro Sitzung. Der Speicherdienst weist zusätzlich dieselbe Sitzungskennung zurück. Dadurch erzeugen wiederholte Ereignisse keine doppelten Verlaufseinträge. Navigieren aus einem Spiel beendet die aktuelle Partie mit dem zuletzt gemeldeten Stand. Ein vollständiges Schließen des Browsers stellt keine laufende Partie wieder her.

Die Regeln arbeiten, soweit erforderlich, mit übergebenen Zufallsquellen und Zeitwerten. Tests können dadurch gezielt Randfälle erzeugen. Es gibt keine dauernde Render-Schleife; zeitabhängige Spiele verwenden begrenzte Timer beziehungsweise einen Animationsframe für das Reaktionssignal.

## Unterbrechungen und Eingaben

Eine Erklärung oder ein Hintergrundwechsel pausiert das Spiel. Die Fortsetzung erfolgt bewusst per Button. Der Host blendet die laufende Spielansicht währenddessen aus und gibt `paused` weiter. Die Spielmodule bereinigen eigene Timer und akzeptieren keine Eingaben während der Pause. Audio wird angehalten.

Zahlen- und Rastervorlagen werden in der Abrufphase tatsächlich aus der Darstellung entfernt; eine Pause stellt sie nicht wieder her. Simon beginnt eine unterbrochene Vorführung vor der ersten gültigen Eingabe vollständig neu. Nach bereits begonnener Eingabe bleibt der Abrufzustand erhalten, ohne erneute Vorführung. Bei der Reaktion wird ausschließlich der unterbrochene Versuch verworfen.

Normale Buttons reagieren auf `click`, damit sich eine versehentliche Berührung abbrechen lässt. Nur die Reaktionsfläche misst bei primärem `pointerdown` beziehungsweise Enter/Leertaste auf `keydown`; ein nachfolgendes Click-Ereignis wird dort nicht erneut gewertet.

## Speicherung und Vergleichbarkeit

`localStorage` enthält unter `mindmix:data` ein Objekt mit Schemaversion, Einstellungen, Verlauf und Rekorden. Der Speicherdienst bietet über `useSyncExternalStore` einen kleinen reaktiven Snapshot an. Der gemeinsame React-Kontext enthält nur die Information, ob gerade eine Partie läuft, damit etwa Updates gesperrt werden können.

Geladene Daten werden als unbekannte Daten behandelt und validiert. Ungültige Einzelergebnisse werden herausgefiltert, Einstellungen erhalten sichere Standardwerte. Beschädigtes JSON oder unbekannte Schemaversionen werden nicht ungeprüft übernommen. Bei einem Lesefehler beginnt die laufende App mit Standardwerten; die alte Speicherung bleibt bis zur nächsten bewussten Änderung unangetastet. Bei Schreibfehlern läuft die Anwendung mit dem Datenbestand im Arbeitsspeicher weiter und zeigt die fehlende dauerhafte Speicherung an.

Pro Spiel bleiben höchstens 30 Verlaufseinträge erhalten, über alle Varianten zusammen. Die Vorbereitung zeigt die letzten fünf zur aktuellen Vergleichsgruppe passenden Einträge. Rekorde werden separat gespeichert und verschwinden nicht dadurch, dass ein alter Verlaufseintrag herausfällt. Vollständige Eingabeprotokolle oder personenbezogene Daten werden nicht gespeichert.

Der Vergleichsschlüssel enthält Spiel, Variante, Regelversion und gegebenenfalls Inhaltsversion. Nur das Wortspiel verwendet zusätzlich die Spielsprache. Die UI-Sprache trennt keine sprachunabhängigen Rekorde. Beim Kopfrechnen trennen `basic` und `mixed` die Rekorde. Bei Reaktionszeiten ist kleiner besser; bei den anderen Spielen ist größer besser. Gleichstände ersetzen den bestehenden Rekord nicht.

Versionen haben unterschiedliche Aufgaben:

- `package.json` / `CHANGELOG.md`: veröffentlichte App-Version, zunächst **1.0.0**.
- `RULE_VERSION` im jeweiligen Spiel: vergleichbare Regeln und Punktberechnung, zunächst **1**.
- `CONTENT_VERSION` beim Wortspiel: vergleichbarer Wortvorrat, zunächst **1**.
- `SCHEMA_VERSION` im Speicherdienst: Format der gespeicherten Daten, zunächst **1**.

Eine neue Regelversion benötigt keine Datenmigration, nur eine neue Vergleichsgruppe. Eine Änderung am Speicherformat benötigt dagegen eine bewusst implementierte Migration. Für Version 1 existiert kein älteres unterstütztes Schema.

## Sprache, Inhalte und Darstellung

i18next lädt die beiden Sprachressourcen lokal. Jeder Spielname besitzt einen eigenen Namespace; gemeinsame Navigation, Einstellungen und Hinweise liegen in `common`. Komponenten verwenden vollständige übersetzte Sätze mit Platzhaltern. Ein Test vergleicht Schlüssel und Platzhalter beider Sprachen.

Die Wortlisten sind getrennte Inhalte für Deutsch und Türkisch. Eine Partie fixiert ihren Wortvorrat beim Start. Der Weg zu den Spracheinstellungen beendet die laufende Partie kontrolliert; eine neue Wortpartie verwendet anschließend den neu gewählten Pool. Wortdatenpflege und sprachlicher Prüfbedarf sind bei den [Spielregeln](game-rules.md) beschrieben.

Globale CSS-Variablen definieren Farben, Schrift und Abstände. Spielbezogene Styles bleiben beim jeweiligen Modul. Das Layout verwendet skalierbare Maße, Textumbruch, sichtbare Fokuszustände und lokale SVG-Symbole. Gedächtnis- und Suchaufgaben haben trotz Beschriftungen keine zugesicherte vollständige nichtvisuelle Gleichwertigkeit.

## Audio und PWA

Spiele senden Ereignisse wie `correct` oder `simon0` an den Audiodienst. Web Audio erzeugt die Standardeffekte. Optionale lokale Dateien werden zentral konfiguriert, einmal vorbereitet und bei fehlender Nutzbarkeit durch Synthese ersetzt. Musik besitzt keinen erzeugten Ersatz. Effekte und Musik haben getrennte Einstellungen; die Audiofreigabe erfolgt bei Nutzerinteraktion.

Die Spielkomponenten werden über `React.lazy` getrennt geladen. Workbox nimmt dennoch alle gebauten JavaScript-Dateien, Styles und erforderlichen lokalen Assets in den Precache auf. Damit umfasst die Offline-Vorbereitung auch noch nicht geöffnete Spiele und die Wortdaten. Optionale Audio-Dateien sind kein notwendiger Bestandteil der Service-Worker-Installation.

Der Service Worker verwendet einen Update-Hinweis. Aktivierung und Neuladen erfolgen bewusst; während einer Partie bleibt die Update-Aktion deaktiviert. Cachebereinigung betrifft Build-Dateien und verändert den lokalen Ergebnisbestand nicht.
