# Technische Entscheidungen

## Statische Anwendung ohne Dienste

Alle Spiele, Texte und erforderlichen Assets werden lokal mitgeliefert. GitHub Pages kann den Produktionsbuild direkt ausliefern. Konten, Datenbank, Tracking und externe Laufzeitdienste sind für die Aufgaben nicht erforderlich.

## React, striktes TypeScript und kleine Spielmodule

React verwaltet die Darstellung, reine TypeScript-Funktionen die Regeln. Jedes Spiel besitzt eigene Zustände und Konfigurationen. Die gemeinsame Infrastruktur bleibt klein; ein universeller Spiele-Interpreter, eine globale State-Bibliothek und eine Spiele-Engine würden die acht unterschiedlichen Abläufe unnötig erschweren.

## Vite, Repository-Unterpfad und Hash-Routing

Der vorhandene Repository-Kontext ist `mnstrkm/mindmix`. Deshalb lautet der Standardbasispfad `/mindmix/`. Hash-Routing hält Spieladressen ohne spezielle Server-Weiterleitungen erreichbar. Der Basispfad lässt sich beim Build über `BASE_PATH` ändern.

Referenzen: [Vite: statische Bereitstellung](https://vite.dev/guide/static-deploy.html), [Vite: öffentlicher Basispfad](https://vite.dev/guide/build.html#public-base-path).

## Offline-Vollständigkeit trotz getrennter Spielmodule

Die Spielkomponenten werden erst bei Bedarf ausgeführt, alle gebauten Module werden jedoch beim ersten vollständigen Laden für Offline-Nutzung vorbereitet. Dadurch bleiben Start und Architektur überschaubar, ohne spätere Offline-Lücken bei bislang ungeöffneten Spielen zu erzeugen. Das Wortspiel benötigt keinen Online-Abruf.

Updates verwenden eine ausdrückliche Bestätigung; ein Reload während einer Partie würde den Spielstand verlieren. Nicht konfigurierte oder fehlende optionale Audio-Dateien dürfen die notwendige Offline-Vorbereitung nicht verhindern.

Referenzen: [Vite PWA: Einstieg](https://vite-pwa-org.netlify.app/guide/), [Vite PWA: Update-Hinweis](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html).

## Lokale Ergebnisse und getrennte Versionen

`localStorage` genügt für Einstellungen, 30 letzte Partien pro Spiel und getrennte Rekorde. Ein fehlender Speicher führt zu einem verständlichen Hinweis und einem weiterhin nutzbaren Arbeitsspeicherbestand. Es gibt keine Profile, Synchronisation oder Exportplattform.

App-, Regel-, Inhalts- und Schemaversionen bleiben getrennt. Eine kosmetische App-Änderung setzt keinen Rekord zurück. Neue Regeln oder ein veränderter Wortvorrat dürfen dagegen keine unvergleichbaren Ergebnisse zusammenführen. Der Verlauf und der Rekordbestand werden getrennt gehalten, damit ein alter Rekord länger als 30 Partien bestehen kann.

## Kein allgemeines Antwortzeitlimit

Die Aufgaben belohnen richtige Antworten beziehungsweise vollständig erinnerte Folgen. Ein Zeitbonus würde ruhiges Spielen benachteiligen. Nur die Reaktions-Challenge misst Zeit. Seit 1.1.0 verwendet sie auf Nutzerwunsch den verständlichen Durchschnitt aus fünf gültigen Versuchen; der schnellste Einzelversuch ist ein eigenständiger Rekord. Frühere Medianwerte bleiben getrennt beschriftet. Geräte- und Eingabelatenz bleiben enthalten.

## Fortschritt mit bedienbarem Plateau

Die visuelle Suche endet bei 4×4. Das räumliche Gedächtnis wächst seit 1.1.0 auf Nutzerwunsch darüber hinaus bis 8×4. Zusätzliche Zeilen erhöhen den Umfang, während maximal vier Spalten die Touch-Ziele auf dem Handy groß halten. Vertikales Scrollen ist erlaubt. Größere Stufen bleiben mehrere Aufgaben lang bestehen. Kopfrechnen und Regelwechsel behalten begrenzte Schwierigkeitsstufen. Auf den Plateaus sind weitere neue Aufgaben möglich.

## Dunkle Ansicht und vollständige Rückmeldungen

Die gesamte App startet auf Nutzerwunsch dunkel; eine helle Ansicht bleibt wählbar. Reaktion und Simon beenden die sichtbare Rückmeldung des letzten Schritts vollständig: Die fünfte Reaktionszeit wartet auf eine ausdrückliche Ergebnisaktion, Simons letztes Feld bleibt vor dem Übergang hervorgehoben. Statische Beispiele erleichtern die Erklärung ohne zusätzliche Trainingsmodi oder ungewertete Wiederholungen der laufenden Aufgabe.

## Sichtbare Regeln und zusätzliche Kennzeichnungen

Farben werden durch Symbole oder lesbare Farbnamen ergänzt. Suchpfeile sind kontrollierte SVG-Grafiken und keine schwer vorhersehbaren Unicode-Glyphen. Verborgene Gedächtnisvorlagen verschwinden auch aus dem Accessibility-Baum. Räumliche Aufgaben werden nicht als vollständig gleichwertig nichtvisuell bedienbar ausgegeben.

## Erzeugte Effekte, optionale Dateien

Web Audio vermeidet notwendige Audio-Downloads und zusätzliche Bibliotheken. Eigene Dateien können später zentral eingetragen werden. Die Hintergrundmusik bleibt ohne Datei still. Audiofehler dürfen keinen Spielablauf blockieren.

Ein eigener, kurzer und leiser UI-Ton bestätigt gewöhnliche Aktivierungen. Bedienelemente mit semantischem Spielton melden sich über `data-ui-sound="off"` von diesem Ton ab. Das verhindert eine zusätzliche Klickebene auf Farb- oder Antworttönen. Beim Ergebnis hat ein Fehler Vorrang vor dem Rekordton. Spiel-Audio wird bei Navigation beendet; der kurze Navigationston darf ausklingen. Hintergrundwechsel und deaktivierte Effekte stoppen weiterhin alle Töne.

## Ausrichtung nach Inhalt und Sichtbereich

Die Vorbereitung bleibt zwischen Ergebnis und erneutem Start als bewusster Zwischenschritt erhalten. Rückwege zum Katalog zielen direkt auf die Auswahl. Andere Scrollwechsel messen den Inhalt und die Fensterhöhe: Was bereits passt, bleibt stehen; größere Bereiche werden mit Rand ausgerichtet. Das passt sich kleinen Smartphones, großen Schriftgraden und flachen Laptopfenstern an, ohne für jedes Gerät eigene Koordinaten zu pflegen.

## Ehrliche Qualitätsgrenzen

Automatisierte Prüfungen sichern konkrete Regeln, Zustandsübergänge und Browserabläufe. Eine simulierte kleine Bildschirmbreite ersetzt weder Android-Systemschrift noch iOS/Safari auf einem echten Gerät. Die offene Gerätecheckliste gehört deshalb zur Dokumentation; die erste Version verspricht keine Fehlerfreiheit oder medizinisch bewertbare Leistung.
