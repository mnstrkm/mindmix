# Arbeitsanweisungen

- Bestehende Nutzeränderungen bewahren. Keine fremden Änderungen zurücksetzen.
- React/TypeScript strikt halten. Spiellogik als reine Funktionen, UI im jeweiligen `src/games/<id>`-Modul; keine internen Imports zwischen Spielen.
- Gemeinsame UI enthält keine Spielregeln. Konfiguration, Inhalte, Audio und Speicherung getrennt halten.
- Sichtbare Texte und zugängliche Beschriftungen ausschließlich aus i18next-Ressourcen (Deutsch/Türkisch). Schlüssel und Platzhalter prüfen.
- Regeländerungen gezielt durchführen, keine Nebenwirkungen auf andere Spiele. `docs/game-rules.md`, Regel-/Inhaltsversionen und CHANGELOG aktualisieren. Nur vergleichbare Rekorde zusammenführen.
- Keine unnötigen Abhängigkeiten, externen Laufzeitdienste, Tracking oder medizinischen Leistungsversprechen.
- Vor Abschluss Typprüfung, Logik-/Komponententests und Produktionsbuild ausführen; wichtige Browserabläufe und Offline-Verhalten prüfen, soweit die Umgebung es ermöglicht. Grenzen ehrlich dokumentieren.
- Große Schrift, 320-Pixel-Breite, Tastatur, Pausen, Timerbereinigung und einmalige Finalisierung bei Änderungen berücksichtigen.
