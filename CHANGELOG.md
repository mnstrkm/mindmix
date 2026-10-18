# Änderungsverlauf

Die App folgt Semantic Versioning. Spielregeln, Wortvorräte und Speicherformat besitzen zusätzliche eigene Versionen; Änderungen daran müssen die Vergleichbarkeit bestehender Ergebnisse berücksichtigen.

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
