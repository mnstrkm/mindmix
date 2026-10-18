# Spielregeln – Version 1.1.0

Diese Beschreibung entspricht den Parametern in `src/games/*/config.ts`. Wortspiel, räumliches Gedächtnis und Reaktion verwenden **Regelversion 2**, ebenso nur der gemischte Rechenmodus. Die übrigen Regeln einschließlich Grundrechnen bleiben bei **1**. Der Wortvorrat besitzt unverändert **Inhaltsversion 1**. Frühere Rekorde bleiben getrennt einsehbar.

## Gemeinsame Regeln

- Eine richtige gewertete Antwort erhöht das jeweilige Ergebnis. Es gibt keine gemeinsame Gesamtpunktzahl über verschiedene Spiele.
- Außer der Reaktions-Challenge laufen Partien ohne feste Aufgabenanzahl und ohne Antwortzeitlimit weiter, bis eine falsche gewertete Antwort erfolgt oder freiwillig beendet wird. Das Wortspiel endet zusätzlich bei vollständig ausgeschöpftem Wortvorrat.
- „Beenden“ und das Verlassen der Spielseite bewahren das erreichte Ergebnis. Die Reaktions-Challenge benötigt für den Durchschnitt alle fünf gültigen Messungen; der schnellste gültige Einzelversuch wird separat berücksichtigt.
- Eine geöffnete Partie ohne gewertete Aktion erzeugt keinen Verlaufseintrag. Eine erste falsche Antwort zählt als Aktion und kann einen Verlaufseintrag mit Ergebnis 0 erzeugen; sie erzeugt keinen positiven Rekord.
- Bestätigungsaufgaben dürfen bis zur Bestätigung korrigiert werden. Einzelne Auswahlaufgaben werten unmittelbar beim Betätigen der Antwortfläche.
- Eine Partie wird höchstens einmal finalisiert. Eingaben aus gesperrten Phasen und unmittelbare Doppelwertungen werden abgefangen.
- „Spiel erklären“ und Hintergrundwechsel pausieren. Nach Rückkehr ist eine ausdrückliche Fortsetzung erforderlich. Rotation allein ändert keine Spielregeln und setzt den Zustand nicht zurück.

## 1. Schon gesehen? (`recognition`)

Ein Wort wird als **Neu** oder **Schon gesehen** beurteilt. Bekannt bedeutet, dass dieses Wort irgendwann zuvor in derselben Partie gezeigt wurde. Frühere Partien zählen nicht.

Das erste Wort ist neu. Anschließend wird zuerst entschieden, ob eine Wiederholung erzeugt werden soll: Ausgangswahrscheinlichkeit **45 %**. Erst danach wird das konkrete Wort gewählt. Eine unmittelbare Wiederholung wird im Wiederholungszweig mit **6 %** zugelassen, jedoch niemals ein drittes identisches Wort in Folge. Ansonsten wird ein anderes bekanntes Wort gewählt; bevorzugt eines, das nicht unter den letzten vier gezeigten Wörtern liegt. Ist erst ein Wort bekannt und keine unmittelbare Wiederholung zulässig, folgt ein neues Wort. Damit verhindert auch der Einstieg lange identische Serien. Mehrere unterschiedliche bekannte Wörter hintereinander bleiben möglich; es gibt keine feste Abwechslung oder Abschnittsquote.

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

Die Vorführung beginnt nach **600 ms**. Jedes Signal wird **650 ms** hervorgehoben; zwischen Signalen liegen **280 ms** ohne Hervorhebung. Diese Zeiten bleiben unabhängig von der Folgenlänge gleich. Während der Vorführung sind Eingaben gesperrt. Zwischeneingaben besitzen **180 ms** Rückmeldung und Schutz vor Mehrfachwertung. Das letzte richtige Signal bleibt **400 ms** sichtbar; erst danach wird die Folge verlängert und die nächste Vorführung vorbereitet. Die Eingabe hat kein Zeitlimit.

Die erste falsche Feldeingabe beendet. **Ergebnis:** längste vollständig reproduzierte Folge. Einzelne richtige Signale einer noch nicht abgeschlossenen Folge zählen als gewertete Aktionen, erhöhen jedoch nicht das Ergebnis. Zusatzwert: vollständig gelöste Folgen.

Eine vor der ersten gültigen Eingabe unterbrochene Vorführung beginnt nach bewusster Fortsetzung vollständig neu. Nach bereits begonnener Eingabe wird der Abruf fortgesetzt, ohne die Folge erneut vorzuspielen. Eine frei abrufbare Wiederholung gibt es nicht. Timer und Töne werden bei Unterbrechung und Verlassen bereinigt.

## 4. Räumliches Gedächtnis (`spatial`)

Ein Raster zeigt markierte Felder ohne Begrenzung der Merkzeit. „Ausblenden“ entfernt die Markierungen. Anschließend können Felder ausgewählt und durch erneutes Betätigen abgewählt werden. Die ausgewählte und die benötigte Anzahl bleiben sichtbar. Erst die Bestätigung wertet die gesamte Menge; Reihenfolge spielt keine Rolle. Die erste falsch bestätigte Auswahl beendet.

Die ersten elf Stufen steigen nach jedem richtigen Muster. Größere Raster bleiben anschließend mehrere Aufgaben lang gleich:

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
| 11 (ab 10 richtigen Mustern) | 4 × 4 | 8 |
| 12 (ab 12) | 5 × 4 | 8 |
| 13 (ab 14) | 5 × 4 | 9 |
| 14 (ab 16) | 6 × 4 | 10 |
| 15 (ab 18) | 6 × 4 | 12 |
| 16 (ab 21) | 7 × 4 | 13 |
| 17 (ab 24) | 8 × 4 | 14 |
| 18 (ab 27) und weitere Aufgaben | 8 × 4 | 16 |

Nach Stufe 18 folgen neue zufällige Muster auf derselben Schwierigkeit. Maximal vier Spalten halten die Felder auf kleinen Displays groß; längere Raster dürfen vertikal gescrollt werden. Unmittelbar identische Muster werden verhindert. Es gibt keine besonderen Musterklassen oder immer kleinere Touch-Flächen.

**Ergebnis:** Anzahl vollständig richtig gelöster Muster. Zusatzwerte beschreiben die höchste erreichte Schwierigkeit mit Stufe, Zeilen, Spalten und Markierungszahl. Die Aufgabenzahl kann weiter steigen, während die Stufe bei 18 bleibt. Die Vorlage bleibt während der Abrufphase auch bei Pausen verborgen.

## 5. Kopfrechnen (`arithmetic`)

Antworten erfolgen über das eigene Zahlenfeld. Vor der Bestätigung darf korrigiert werden. Die erste falsch bestätigte Antwort beendet und zeigt die korrekte Gleichung. Es gibt weder Zeitbonus noch Antwortzeitlimit.

**Grundrechnen:** Addition und Subtraktion innerhalb 0–100. **Gemischt:** zusätzlich Multiplikation mit Faktoren bis 12 und passende Division mit ganzzahligen Ergebnissen. Addition und Subtraktion bleiben innerhalb 0–200.

| Bereits richtige Aufgaben | Grundrechnen: Obergrenze | Gemischt: Obergrenze Addition/Subtraktion | Gemischt: größte Faktoren |
| --- | --- | --- | --- |
| 0–4 | 20 | 20 | 6 |
| 5–9 | 50 | 50 | 8 |
| 10–17 | 100 | 100 | 10 |
| ab 18 | 100 | 200 | 12 |

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

Die fünfte Zeit bleibt wie alle vorherigen Zeiten sichtbar. Erst **„Ergebnis ansehen“** öffnet die Zusammenfassung. Es gibt keinen automatischen Sprung, der diesen Wert überspringt.

**Ergebnis:** arithmetischer Durchschnitt der fünf gültigen Zeiten, auf Millisekunden gerundet. **Weniger ist besser.** Zwei unabhängige Rekorde werden geführt: bester Durchschnitt einer vollständigen Partie und schnellster gültiger Einzelversuch. Der schnellste Einzelversuch darf auch aus einer bewusst beendeten oder nach drei Fehlstarts abgebrochenen Partie stammen; ohne fünf gültige Versuche gibt es dagegen keinen Durchschnittsrekord. Die optionalen Probemessungen zählen für keinen Rekord. Zusatzwerte sind Durchschnitt, schnellster Versuch dieser Partie, alle Einzelzeiten und Fehlstarts. Frühere Werte aus Regelversion 1 bleiben ausdrücklich als Median im Archiv sichtbar.

Bei Pause, Erklärung oder Hintergrundwechsel wird ein wartender oder bereits signalisierter Versuch verworfen. Er zählt weder als Messung noch als Fehlstart. Nach Fortsetzung muss ein neuer Versuch gestartet werden. Die übrigen gültigen Messungen bleiben erhalten. Unterschiedliche Geräte und Eingabemethoden können die Werte beeinflussen; Altersnormen oder medizinische Deutungen werden nicht verwendet.
