# Wortvorräte, Inhaltsversion 1

Die erste Fassung enthält **1.642 deutsche** und **1.633 türkische** Einträge. Beide
Listen liegen als lokale UTF-8-Dateien vor; sie benötigen keinen externen Dienst.

Die Wörter wurden bei der Implementierung mit Unterstützung eines Sprachmodells
nach alltäglichen Themen zusammengestellt: Haushalt, Essen, Beziehungen, Natur,
Unterwegssein, Arbeit, Freizeit und häufige Handlungen. Es wurde kein externes
Wörterbuch oder lizenziertes Korpus übernommen. Die Listen sind thematisch ähnlich,
enthalten aber auch sprachspezifische Wörter, etwa türkische Gerichte. Sie sind
kein wissenschaftlich normiertes oder nach Wortfrequenz ausgewogenes Material.

Bei einer zusätzlichen technischen Durchsicht wurden Dubletten und auffällige
künstliche Zusammenschreibungen entfernt, insbesondere türkische Wortgruppen,
die irrtümlich zu einem Wort verbunden waren. Die Listen wurden nicht mit
Flexionsformen oder automatisch gebildeten Kombinationen aufgefüllt. Wiederholte
Bedeutungen eines gleich geschriebenen Wortes erhalten keinen eigenen Eintrag.

Automatische Prüfungen sichern mindestens 1.000 Einträge pro Sprache,
NFC-Normalisierung, zulässige Buchstaben beziehungsweise Bindestriche und
Eindeutigkeit nach sprachgerechter Kleinschreibung. Türkisches `I`/`İ` wird mit
der türkischen Locale behandelt. Diese Tests prüfen keine sprachliche Natürlichkeit.

**Eine menschliche redaktionelle oder muttersprachliche Gesamtprüfung hat nicht
stattgefunden.** Sie bleibt insbesondere für die türkische Liste empfohlen.
Auch häufige Wörter können regional unterschiedlich vertraut sein; die konkrete
Leistung in diesem Spiel erlaubt keine medizinische oder normierte Aussage.

Inhaltliche Änderungen erfordern die Prüfung der Vergleichbarkeit und gegebenenfalls
eine neue `CONTENT_VERSION` in `config.ts`. Die Speicherung trennt Rekorde nach
Spiel, Sprache, Regelversion und Inhaltsversion. Ist der gesamte Vorrat in einer
Partie richtig beurteilt, endet sie transparent erfolgreich; der Gesehen-Status
wird niemals zurückgesetzt.
