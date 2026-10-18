# Spielregeln – Version 1.0.0

Diese Beschreibung entspricht den Parametern in `src/games/*/config.ts`. Alle acht Spiele beginnen mit **Regelversion 1**. Der Wortvorrat besitzt zusätzlich **Inhaltsversion 1**. Änderungen an Regeln, Punktberechnung oder vergleichbarkeitsrelevanten Inhalten müssen versioniert und hier dokumentiert werden.

## Gemeinsame Regeln

- Eine richtige gewertete Antwort erhöht das jeweilige Ergebnis. Es gibt keine gemeinsame Gesamtpunktzahl über verschiedene Spiele.
- Außer der Reaktions-Challenge laufen Partien ohne feste Aufgabenanzahl und ohne Antwortzeitlimit weiter, bis eine falsche gewertete Antwort erfolgt oder freiwillig beendet wird. Das Wortspiel endet zusätzlich bei vollständig ausgeschöpftem Wortvorrat.
- „Beenden“ und das Verlassen der Spielseite bewahren das bereits korrekt erreichte Ergebnis. Es darf als Rekord zählen. Die Reaktions-Challenge benötigt dafür allerdings alle fünf gültigen Messungen.
- Eine geöffnete Partie ohne gewertete Aktion erzeugt keinen Verlaufseintrag. Eine erste falsche Antwort zählt als Aktion und kann einen Verlaufseintrag mit Ergebnis 0 erzeugen; sie erzeugt keinen positiven Rekord.
- Bestätigungsaufgaben dürfen bis zur Bestätigung korrigiert werden. Einzelne Auswahlaufgaben werten unmittelbar beim Betätigen der Antwortfläche.
- Eine Partie wird höchstens einmal finalisiert. Eingaben aus gesperrten Phasen und unmittelbare Doppelwertungen werden abgefangen.
- „Spiel erklären“ und Hintergrundwechsel pausieren. Nach Rückkehr ist eine ausdrückliche Fortsetzung erforderlich. Rotation allein ändert keine Spielregeln und setzt den Zustand nicht zurück.

## 1. Schon gesehen? (`recognition`)

Ein Wort wird als **Neu** oder **Schon gesehen** beurteilt. Bekannt bedeutet, dass dieses Wort irgendwann zuvor in derselben Partie gezeigt wurde. Frühere Partien zählen nicht.

Das erste Wort ist neu. Anschließend wird zuerst unabhängig entschieden, ob eine Wiederholung erzeugt wird: Ausgangswahrscheinlichkeit **45 %**. Erst danach wird das konkrete Wort gewählt. Gibt es ältere Wörter zusätzlich zum unmittelbar vorherigen Wort, wird innerhalb des Wiederholungszweigs mit **12 %** das direkt vorherige Wort gewählt; ansonsten eines der älteren Wörter. Bei erst einem bekannten Wort ist eine Wiederholung zwangsläufig unmittelbar. Wiederholungen können damit bereits bei der zweiten Aufgabe auftreten; es gibt weder eine feste Abwechslung noch eine vorgeschriebene Abschnittsquote.

Wörter können mehrfach wiederkehren und bleiben während der gesamten Partie bekannt. Der Status wird vor dem Eintragen des aktuellen Wortes in die Gesehen-Menge bestimmt. Eine richtige Entscheidung zeigt das nächste Wort; die erste falsche Entscheidung beendet. Ein Eingabeschutz von **260 ms** verhindert unmittelbare Mehrfachwertung, ohne eine Antwortfrist einzuführen.

**Ergebnis:** Anzahl richtiger Entscheidungen. Zusatzwerte: richtig erkannte neue Wörter und Wiederholungen. Bei einem Fehler wird die richtige Beurteilung angegeben. Sobald alle Wörter korrekt durchlaufen und keine neuen Wörter mehr vorhanden sind, endet die Partie mit einem transparenten Hinweis auf den abgeschlossenen Vorrat. Die Gesehen-Menge wird nicht zurückgesetzt.

**Vergleich:** getrennt nach Spielsprache, Regelversion und Inhaltsversion. Die gewählte Sprache und ihr Wortpool bleiben innerhalb einer Partie fest.

### Wortdaten und sprachliche Qualität

Die erste Inhaltsversion enthält **1.642 deutsche und 1.633 türkische Wörter**. Die eigenständigen, kategorienweise zusammengestellten Alltagswortlisten liegen in `src/games/recognition/words-de.ts` und `words-tr.ts`; `words.ts` ordnet sie den Sprachen zu. Die Listen wurden für dieses Projekt KI-gestützt verfasst; es wurden keine fremden Wortlisten importiert und keine menschliche sprachliche Prüfung behauptet. Beide Pools werden auf Unicode-Normalisierung, sprachabhängige Groß-/Kleinschreibung und Dubletten geprüft.

Die technische Prüfung ersetzt keine inhaltliche Prüfung durch deutsch- beziehungsweise türkischsprachige Personen. Insbesondere Häufigkeit, Eindeutigkeit, regionale Schreibweisen und ungeeignete Einzelwörter sollten vor einer späteren Inhaltsversion sprachlich überprüft werden. Weitere Angaben stehen im [Inhaltsnachweis beim Wortmodul](../src/games/recognition/content.md).

## 2. Zahlenfolge merken (`digits`)

Die erste Aufgabe zeigt **zwei Ziffern** gleichzeitig. Die Merkzeit ist selbstbestimmt. Erst „Ausblenden“ entfernt die Vorlage und beginnt die Eingabe mit dem eigenen Zahlenfeld. Die Systemtastatur wird nicht verwendet. Rücktaste und Bestätigung erlauben Korrekturen vor der Wertung.

Führende Nullen und wiederholte Ziffern sind gültig; Folgen bleiben Zeichenfolgen. Nach vollständiger richtiger Bestätigung wird eine **vollständig neue** Folge erzeugt, die eine Ziffer länger ist. Es wird nicht die vorherige Folge verlängert. Die erste falsch bestätigte Folge beendet.

**Ergebnis:** Länge der längsten vollständig richtig wiedergegebenen Folge. Zusatzwert: Anzahl vollständig geschaffter Aufgaben. Ein freiwilliges Ende mitten in einer Eingabe erhöht die bisher erreichte Länge nicht.

Die Vorlage bleibt in der Abrufphase auch bei einer Erklärung oder Pause verborgen und aus dem Accessibility-Baum entfernt. Lange Folgen dürfen umbrechen; das Spiel setzt keine künstliche Aufgabenanzahl fest.

## 3. Farbreihenfolge / Simon (`simon`)

Vier Felder behalten ihre Position, Farbe, ihr Symbol und ihren eigenen Ton. Die erste Folge enthält **zwei Signale**. Nach einer vollständig richtigen Wiedergabe wird **dieselbe Folge um ein zufälliges Signal verlängert**. Auch unmittelbar gleiche Signale sind erlaubt.

Die Vorführung beginnt nach **600 ms**. Jedes Signal wird **650 ms** hervorgehoben; zwischen Signalen liegen **280 ms** ohne Hervorhebung. Diese Zeiten bleiben unabhängig von der Folgenlänge gleich. Während der Vorführung sind Eingaben gesperrt. Die Eingabephase wird ausdrücklich angezeigt und besitzt kein Zeitlimit. Eine kurze Eingaberückmeldung mit **140 ms** Sperre schützt vor unmittelbarer Mehrfachwertung.

Die erste falsche Feldeingabe beendet. **Ergebnis:** längste vollständig reproduzierte Folge. Einzelne richtige Signale einer noch nicht abgeschlossenen Folge zählen als gewertete Aktionen, erhöhen jedoch nicht das Ergebnis. Zusatzwert: vollständig gelöste Folgen.

Eine vor der ersten gültigen Eingabe unterbrochene Vorführung beginnt nach bewusster Fortsetzung vollständig neu. Nach bereits begonnener Eingabe wird der Abruf fortgesetzt, ohne die Folge erneut vorzuspielen. Eine frei abrufbare Wiederholung gibt es nicht. Timer und Töne werden bei Unterbrechung und Verlassen bereinigt.

## 4. Räumliches Gedächtnis (`spatial`)

Ein Raster zeigt markierte Felder ohne Begrenzung der Merkzeit. „Ausblenden“ entfernt die Markierungen. Anschließend können Felder ausgewählt und durch erneutes Betätigen abgewählt werden. Die ausgewählte und die benötigte Anzahl bleiben sichtbar. Erst die Bestätigung wertet die gesamte Menge; Reihenfolge spielt keine Rolle. Die erste falsch bestätigte Auswahl beendet.

Die Schwierigkeit erhöht sich nach jedem vollständig richtigen Muster:

| Stufe | Zeilen × Spalten | Markierungen |
| --- | --- | --- |
| 1 | 2 × 2 | 2 |
| 2 | 3 × 2 | 2 |
| 3 | 3 × 2 | 3 |
| 4 | 3 × 3 | 3 |
| 5 | 3 × 3 | 4 |
| 6 | 4 × 3 | 4 |
| 7 | 4 × 3 | 5 |
| 8 | 4 × 4 | 5 |
| 9 | 4 × 4 | 6 |
| 10 | 4 × 4 | 7 |
| 11 und weitere Aufgaben | 4 × 4 | 8 |

Nach Stufe 11 folgen neue zufällige Muster auf derselben Schwierigkeit. Unmittelbar identische Muster werden verhindert. Es gibt keine besonderen Musterklassen und kein weiteres Verkleinern des Rasters.

**Ergebnis:** Anzahl vollständig richtig gelöster Muster. Zusatzwerte beschreiben die höchste erreichte aktuelle Schwierigkeit mit Stufe, Zeilen, Spalten und Markierungszahl. Die Aufgabenzahl kann weiter steigen, während die Stufe bei 11 bleibt. Die Vorlage bleibt während der Abrufphase auch bei Pausen verborgen.

## 5. Kopfrechnen (`arithmetic`)

Antworten erfolgen über das eigene Zahlenfeld. Vor der Bestätigung darf korrigiert werden. Die erste falsch bestätigte Antwort beendet und zeigt die korrekte Gleichung. Es gibt weder Zeitbonus noch Antwortzeitlimit.

**Grundrechnen:** Addition und Subtraktion; die Operanden und Ergebnisse liegen innerhalb 0–100. **Gemischt:** zusätzlich Multiplikation des kleinen Einmaleins und Division mit ganzzahligen Ergebnissen; Addition und Subtraktion bleiben innerhalb 0–200.

| Bereits richtige Aufgaben | Grundrechnen: Obergrenze | Gemischt: Obergrenze Addition/Subtraktion | Gemischt: größte Faktoren |
| --- | --- | --- | --- |
| 0–4 | 20 | 20 | 5 |
| 5–9 | 50 | 50 | 7 |
| 10–14 | 100 | 100 | 9 |
| ab 15 | 100 | 200 | 10 |

Im gemischten Modus kommen alle vier Rechenarten bereits im Einstieg vor. Faktoren beziehungsweise Divisor und Quotient werden unabhängig im Bereich 2 bis zur jeweiligen Faktorgrenze gewählt. Divisionen werden aus deren Produkt erzeugt; dadurch sind Division durch null, Dezimalzahlen und negative Ergebnisse ausgeschlossen. Addition und Subtraktion verzichten auf Operanden und Ergebnisse 0 oder 1, damit nicht viele triviale Aufgaben entstehen.

Jede zufällig angeordnete Gruppe enthält jede verfügbare Rechenart genau einmal. Die Reihenfolge bleibt variabel; direkt identische Aufgaben werden zusätzlich verhindert. Eine begrenzte Erzeugung mit Ersatzkandidaten verhindert Endlosschleifen auch bei einer ungünstigen Zufallsquelle.

**Ergebnis:** Anzahl richtig gelöster Aufgaben. **Vergleich:** getrennt nach `basic` und `mixed` sowie Regelversion. Eine richtige Antwort besitzt eine kurze Rückmeldung von **350 ms**, danach erscheint die nächste Aufgabe. Eine Pause hält diesen Übergang an.

## 6. Visuelle Suche (`search`)

Die Vorlage zeigt einen großen SVG-Pfeil. Im Raster befindet sich **genau ein Pfeil derselben Richtung**. Die Vorlage bleibt sichtbar. Eine richtige Auswahl startet die nächste Aufgabe, eine falsche Auswahl beendet sofort. Es gibt kein Zeitlimit und keinen Geschwindigkeitsbonus.

| Bereits richtige Aufgaben | Raster | Ablenker |
| --- | --- | --- |
| 0–3 | 2 × 2 | Gegenrichtung |
| 4–7 | 3 × 2 | Gegenrichtung |
| 8–11 | 3 × 3 | Gegenrichtung |
| 12–15 | 4 × 3 | Gegenrichtung |
| 16–19 | 4 × 4 | Gegenrichtung |
| 20–23 | 4 × 4 | Andere Hauptrichtungen |
| ab 24 | 4 × 4 | Alle anderen Richtungen einschließlich Diagonalen |

Zunächst variieren Zielpfeile zwischen oben, rechts, unten und links. Ab 24 richtigen Aufgaben sind auch die vier diagonalen Zielrichtungen möglich. Zielposition und Richtung werden zufällig gewählt. Die Schwierigkeit wächst damit zuerst über die Elementzahl und anschließend über die Ähnlichkeit. Auf dem letzten Niveau folgen unbegrenzt neue Aufgaben.

**Ergebnis:** Anzahl richtig gelöster Suchaufgaben. Zusatzwerte: aktuelle Stufe und Rastergröße. Eine richtige Auswahl erhält **350 ms** Rückmeldung mit gesperrten Eingaben. Beschriftungen enthalten Zeile, Spalte und Richtung; vollständige nichtvisuelle Gleichwertigkeit der visuellen Aufgabe wird nicht zugesichert.

## 7. Regelwechsel (`switch`)

Das Objekt besitzt unabhängig gewählte Eigenschaften: **Blau/Orange** und **Kreis/Dreieck**. Die aktuelle Regel **Farbe** oder **Form** steht über dem Objekt. Zusätzlich wird der Farbname ausgeschrieben; er kodiert keine Form.

Die Antwortflächen bleiben fest:

| Seite | Bei Farbe | Bei Form |
| --- | --- | --- |
| Links | Blau | Kreis |
| Rechts | Orange | Dreieck |

Ein orangefarbener Kreis verlangt beispielsweise bei Farbe rechts und bei Form links. Gleiche und unterschiedliche Antworten unter beiden Regeln sind durch die unabhängigen Eigenschaften möglich. Es gibt keine erzwungene Links-Rechts-Abfolge.

Die ersten vier Aufgaben verwenden **Farbe**, die nächsten vier **Form**. Anschließend wird für jede neue Aufgabe entschieden, ob die Regel gewechselt wird:

| Bereits richtige Aufgaben | Wahrscheinlichkeit eines Regelwechsels |
| --- | --- |
| 8–15 | 25 % |
| 16–23 | 40 % |
| ab 24 | 50 % |

Ein Wechsel wird durch einen Hinweis und die klar sichtbare Regel angekündigt. Es gibt kein Antwortzeitlimit. Die erste falsche Entscheidung beendet.

**Ergebnis:** Anzahl richtiger Entscheidungen. Zusatzwert: richtig beantwortete Aufgaben, deren Regel gegenüber der vorherigen Aufgabe gewechselt hat; der erste Wechsel von Farbe zu Form zählt ebenfalls. Die kurze Erfolgsrückmeldung dauert **350 ms** und pausiert mit der Partie. Es wird keine wissenschaftliche Flexibilitätskennzahl berechnet.

## 8. Reaktions-Challenge (`reaction`)

Eine optionale einzelne Probe ist ungewertet. Danach werden **fünf gültige Messungen** benötigt. Jeder Versuch wird bewusst gestartet. Die große Fläche zeigt zuerst „Warten …“. Nach einer zufälligen Wartezeit zwischen **2.000 und 5.000 ms** wechseln Text und Darstellung gemeinsam auf „Jetzt!“. Es gibt keinen zusätzlichen Signalton als Starthilfe.

Eine Berührung vor dem Signal ist ein Fehlstart. Sie liefert keine gültige Zeit; der nächste Versuch erhält eine neue Wartezeit. Nach insgesamt **drei Fehlstarts** endet die Partie ohne reguläres Gesamtergebnis. Fehlstarts in der optionalen Probe zählen nicht zu diesen drei.

Nur die Reaktionsfläche wertet bereits primäres `pointerdown` beziehungsweise Enter/Leertaste auf `keydown`. Wiederholte Keydown-Ereignisse und nachfolgende Click-Ereignisse erzeugen keine zweite Messung. Normale Buttons behalten das übliche Click-Verhalten. Ein Eingabeschutz von **260 ms** verhindert unmittelbare Ereignisketten zwischen Versuchen.

Die Zeitbasis ist `performance.now()`. Das Signal wird innerhalb eines `requestAnimationFrame` mit synchroner DOM-Aktualisierung ausgelöst. Das bringt den Zeitstempel nahe an die Ausgabe, misst aber weder das tatsächliche Aufleuchten eines Pixels noch eliminiert es Geräte-, Browser- oder Eingabelatenz.

**Ergebnis:** auf Millisekunden gerundeter Median der fünf gültigen Zeiten, also der mittlere Wert der sortierten Messungen. **Weniger ist besser.** Zusatzwerte: schnellster Versuch, Einzelzeiten, Anzahl gültiger Messungen und Fehlstarts. Freiwillig beendete oder durch drei Fehlstarts abgebrochene Partien zeigen vorhandene Einzelwerte, aber keinen regulären Medianrekord.

Bei Pause, Erklärung oder Hintergrundwechsel wird ein wartender oder bereits signalisierter Versuch verworfen. Er zählt weder als Messung noch als Fehlstart. Nach Fortsetzung muss ein neuer Versuch gestartet werden. Die übrigen gültigen Messungen bleiben erhalten. Unterschiedliche Geräte und Eingabemethoden können die Werte beeinflussen; Altersnormen oder medizinische Deutungen werden nicht verwendet.
