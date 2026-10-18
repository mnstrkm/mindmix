# Änderungsverlauf

Die App folgt Semantic Versioning. Spielregeln, Wortvorräte und Speicherformat besitzen zusätzliche eigene Versionen; Änderungen daran müssen die Vergleichbarkeit bestehender Ergebnisse berücksichtigen.

## 1.2.0 – 2026-10-18

- Mobile Verläufe mit festen Spalten: unterschiedliche Abschlussbeschriftungen verschieben die Ergebnisse nicht mehr.
- Technische Regelnummern aus der Oberfläche entfernt; interne Vergleichsgruppen und frühere Bestleistungen bleiben erhalten. Bei einem verbesserten Hauptrekord wird der bisherige vergleichbare Rekord mit angezeigt.
- Zahleneingaben besitzen genau einen großen Bestätigungsknopf. Überflüssige Modusbeschreibungen beim Kopfrechnen und die Fortschritts-/Unterbrechungstexte beim Farbreihenspiel entfernt.
- Wortspiel: identische Wörter sind unmittelbar nacheinander vollständig ausgeschlossen, auch bei bereits bekannten Wörtern. Regelversion 3; Wortvorrat unverändert, alte Rekorde getrennt erhalten.
- Kleine Ergebnisraster für räumliches Gedächtnis und fehlerhafte visuelle Suche zeigen richtige und eigene Auswahl mit Symbolen, Farben und zugänglichen Beschriftungen. Diese Ansichten werden nicht gespeichert und erscheinen nicht während der Aufgabe oder Pause.
- Touch-Hervorhebungen bereinigt: Hover-Effekte gelten nur auf hoverfähigen Geräten; die bewusste Suchrückmeldung endet mit dem Aufgabenwechsel. Tastaturfokus bleibt sichtbar.
- Reaktionsübersicht zeigt den Durchschnitt einmal und die Einzelzeiten mit hervorgehobener schnellster Zeit. Doppelte Durchschnitts-/Schnellstwertblöcke entfernt; unabhängige Rekorde bleiben in Vorbereitung und Bestleistungen verfügbar. Mehr Abstand zwischen laufenden Reaktionsinformationen.
- Einstellungen beginnen mit Sprache, Schriftgröße und danach Darstellung. Den wiederholten Hinweis zur kleineren Reaktionszeit entfernt. Deutsche und türkische Ressourcen angepasst.

## 1.1.0 – 2026-10-18

- Dark Mode als Standard, dauerhaft wählbare helle Ansicht, zurückhaltendere Startseite, überarbeitete Texte und ein vereinfachtes App-Icon.
- Alle acht Erklärungen erhalten visuelle Beispiele in Deutsch und Türkisch.
- Wortspiel: höchstens zweimal dasselbe Wort direkt nacheinander; direkte Wiederholungen seltener und kürzlich gezeigte Wörter nach Möglichkeit ausgespart. Regelversion 2, unveränderte Wortvorräte.
- Reaktion: Durchschnitt statt Median als Hauptwert; bester Durchschnitt und schnellster gültiger Einzelversuch werden unabhängig gespeichert. Die fünfte Zeit bleibt bis „Ergebnis ansehen“ sichtbar. Regelversion 2; frühere Medianrekorde bleiben im Archiv beschriftet erhalten.
- Simon: Auch die letzte korrekte Eingabe bleibt 400 ms hervorgehoben, bevor die nächste Vorführung beginnt. Zwischeneingaben erhalten 180 ms Rückmeldung. Regeln und Score bleiben vergleichbar.
- Räumliches Gedächtnis: zusätzliche, langsamer steigende Stufen bis 8×4 mit 16 Markierungen. Vier Spalten erhalten ausreichend große Touch-Flächen auf schmalen Displays. Regelversion 2.
- Gemischtes Kopfrechnen: Faktoren und Divisionen bis 12, Einstieg bis 6; höchste Stufe ab 18 gelösten Aufgaben. Neue Regelversion 2 nur für diesen Modus; Grundrechnen bleibt bei Regelversion 1.
- Frühere Rekorde bleiben lesbar. Zusätzliche Rekordmetriken und die Theme-Einstellung ergänzen das bestehende Speicherschema mit sicheren Standardwerten.

## 1.0.1 – 2026-10-18

- Einen Timingfehler im Browsertest für das Beenden per Navigation behoben: Die Prüfung wartet auf die abgeschlossene Navigation und die gespeicherte Partie, statt den noch vorherigen Verlauf zu lesen. Zusätzlich werden Ergebnis, Beendigungsgrund und genau ein neuer Eintrag geprüft.
- GitHub-Pages-Anleitung um die Diagnose einer leeren Seite bei versehentlicher Veröffentlichung des Repository-Quellcodes ergänzt. Die Pages-Quelle muss den vorhandenen GitHub-Actions-Workflow verwenden.
- App-Version auf 1.0.1 erhöht. Spielregeln, Inhalte und Speicherformat bleiben vergleichbar; vorhandene Rekorde behalten ihre Gültigkeit.

## 1.0.0 – 2026-10-18

Erste vollständige Version von MindMix:

- Acht spielbare Browser-Spiele: Schon gesehen?, Zahlenfolge merken, Farbreihenfolge, Räumliches Gedächtnis, Kopfrechnen, Visuelle Suche, Regelwechsel und Reaktions-Challenge.
- Durchgängige deutsche und türkische Oberfläche einschließlich Erklärungen, Ergebnisse, Hinweise und zugänglicher Beschriftungen.
- Eigenständige Wortvorräte mit 1.642 deutschen und 1.633 türkischen Einträgen; Herkunft und ausstehende menschliche Sprachprüfung dokumentiert.
- Gemeinsame Oberfläche für Smartphone, Tablet und Desktop mit drei Schriftgrößen, Tastaturbedienung und großen Spielfeldern.
- Lokale Einstellungen, getrennte Rekorde und bis zu 30 letzte Partien je Spiel; abgesicherte Speicherzugriffe und einmalige Ergebnisfinalisierung.
- Kontrollierte Pausen bei Erklärungen und Hintergrundwechseln, Timerbereinigung und freiwilliges Beenden mit dem erreichten Stand.
- Erzeugte Soundeffekte, zentral konfigurierbare optionale Audio-Dateien und separate Lautstärken für Effekte und Musik.
- PWA mit vollständig vorbereiteten Offline-Inhalten und bewusst aktivierten Updates nach der Partie.
- GitHub-Pages-Konfiguration mit Repository-Basispfad, Hash-Routing und prüfendem Deployment-Workflow.
- Tests für Spiellogik, Komponenten, Übersetzungen, Speicherung, Audio und wesentliche Browserabläufe; deutsche Architektur-, Regel- und Prüfdokumentation.

Versionsstände: App **1.0.0**, alle Spielregeln **1**, Wortvorrat **1**, Speicherschema **1**.

Verbleibende Prüfgrenzen stehen in [docs/testing.md](docs/testing.md). Insbesondere echte Android-Systemschrift, iOS/Safari, physische Audio-/Eingabelatenz und eine menschliche Gesamtprüfung der Wortlisten sind durch diese Entwicklung nicht nachgewiesen.
