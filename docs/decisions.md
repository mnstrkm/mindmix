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

Die Aufgaben belohnen richtige Antworten beziehungsweise vollständig erinnerte Folgen. Ein Zeitbonus würde ruhiges Spielen benachteiligen. Nur die Reaktions-Challenge misst Zeit und verwendet fünf gültige Versuche mit Median, um einzelne ungewöhnliche Messungen weniger stark zu gewichten. Diese Browsermessung ist ein persönlicher Vergleichswert; Geräte- und Eingabelatenz bleiben enthalten.

## Fortschritt mit bedienbarem Plateau

Such- und räumliche Raster enden bei 4×4, damit Touch-Ziele erkennbar bleiben. Kopfrechnen bleibt in definierten Zahlenbereichen; Regelwechsel erreicht eine begrenzte Wechselwahrscheinlichkeit. Die Partien können auf dem Plateau weitergehen. Zahlen- und Simon-Folgen wachsen dagegen in ihrer Länge, ohne zugleich das Tempo zu erhöhen.

## Sichtbare Regeln und zusätzliche Kennzeichnungen

Farben werden durch Symbole oder lesbare Farbnamen ergänzt. Suchpfeile sind kontrollierte SVG-Grafiken und keine schwer vorhersehbaren Unicode-Glyphen. Verborgene Gedächtnisvorlagen verschwinden auch aus dem Accessibility-Baum. Räumliche Aufgaben werden nicht als vollständig gleichwertig nichtvisuell bedienbar ausgegeben.

## Erzeugte Effekte, optionale Dateien

Web Audio vermeidet notwendige Audio-Downloads und zusätzliche Bibliotheken. Eigene Dateien können später zentral eingetragen werden. Die Hintergrundmusik bleibt ohne Datei still. Audiofehler dürfen keinen Spielablauf blockieren.

## Ehrliche Qualitätsgrenzen

Automatisierte Prüfungen sichern konkrete Regeln, Zustandsübergänge und Browserabläufe. Eine simulierte kleine Bildschirmbreite ersetzt weder Android-Systemschrift noch iOS/Safari auf einem echten Gerät. Die offene Gerätecheckliste gehört deshalb zur Dokumentation; die erste Version verspricht keine Fehlerfreiheit oder medizinisch bewertbare Leistung.
