# Galerie-Seite – Akademien der Wissenschaften Schweiz

Diese Seite zeigt Fotos von Veranstaltungen. Sie lässt sich für beliebig viele Events einsetzen – jede Veranstaltung bekommt eine eigene kleine Datei, in der alle nötigen Informationen stehen.

---

## Wie es funktioniert

Die Galerie hat keine Datenbank und kein Backend. Sie besteht aus einfachen HTML-, CSS- und JavaScript-Dateien, die jeder Webserver ausliefern kann.

Wenn jemand die Seite aufruft, schaut das JavaScript auf den Wert `?event=...` in der URL, lädt die passende Datei aus dem Ordner `events/` und baut die Seite damit auf. Die Bilder selbst liegen auf Cloudinary (einem Bild-CDN) und werden von dort geladen – sie müssen also nicht auf diesem Server gespeichert sein.

---

## Einen neuen Event einrichten

1. Im Ordner `events/` eine neue Datei anlegen, zum Beispiel `events/mein-anlass-2026.json`.
2. Die Seite aufrufen mit `?event=mein-anlass-2026`.

Der Dateiname (ohne `.json`) wird der sogenannte *Slug* und erscheint in der URL. Er darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.

### Aufbau der JSON-Datei

```json
{
    "title": "Titel des Anlasses",
    "photographer": "Vorname Nachname",
    "date": "24.6.2026",
    "archiveSize": "184 MB",
    "languages": ["en", "de", "fr"],
    "copyrightHtml": "Die Bilder dürfen frei verwendet werden, sofern ...",
    "baseUrl": "https://res.cloudinary.com/.../originale/",
    "thumbnailBaseUrl": "https://res.cloudinary.com/.../vorschau/",
    "imageNames": [
        "bild-001.jpg",
        "bild-002.jpg"
    ]
}
```

**Was bedeuten die einzelnen Felder?**

| Feld | Bedeutung |
|---|---|
| `title` | Titel des Events – erscheint als Überschrift auf der Seite |
| `photographer` | Name der Fotografin / des Fotografen |
| `date` | Datum des Events, so wie es angezeigt werden soll |
| `archiveSize` | Gesamtgrösse des Bildarchivs (z. B. `"184 MB"`). Wenn weggelassen, wird diese Angabe nicht angezeigt. |
| `languages` | Welche Sprachen sollen angeboten werden? (siehe unten) |
| `copyrightHtml` | Copyright-Hinweis unter dem Titel. HTML ist erlaubt, z. B. für Links. |
| `baseUrl` | Basis-URL der Originalbilder auf Cloudinary (für den Download) |
| `thumbnailBaseUrl` | Basis-URL der Vorschaubilder auf Cloudinary (für die Galerie-Ansicht) |
| `imageNames` | Liste aller Dateinamen – einfach die Bildnamen aufzählen |

---

## Sprachen

Die Seite unterstützt Englisch (`en`), Deutsch (`de`), Französisch (`fr`) und Italienisch (`it`).

Welche Sprachen im Umschalter oben rechts erscheinen, wird pro Event im Feld `languages` festgelegt:

```json
"languages": ["en", "de"]
```

Damit erscheinen nur EN und DE – FR und IT werden versteckt. Wenn ein Besucher bisher eine Sprache gespeichert hatte, die für diesen Event nicht verfügbar ist, wird er automatisch auf die erste verfügbare Sprache umgestellt.

Das Logo in Kopf- und Fusszeile wechselt automatisch mit der Sprache.

Die Übersetzungen der Texte (Buttons, Beschriftungen usw.) sind in `translations.js` gespeichert.

---

## Lokal starten

Die Seite funktioniert nicht, wenn man `index.html` direkt im Browser öffnet – der Browser blockiert dann gewisse Netzwerkanfragen. Man braucht einen kleinen lokalen Webserver.

Der einfachste Weg, wenn Python installiert ist:

```bash
python3 -m http.server 8765
```

Danach ist die Seite unter dieser Adresse erreichbar:

```
http://localhost:8765/?event=sris-2026
```

---

## Dateistruktur

```
/
├── index.html            Hauptseite (HTML-Struktur der gesamten Seite)
├── style.css             Alle Styles (Farben, Abstände, Schriften – a+ Design-System)
├── script.js             Interaktivität: Galerie, Lightbox, Sprachumschalter, Downloads
├── data.js               Lädt die Event-Datei beim Seitenaufruf und startet alles
├── translations.js       Texte in allen Sprachen (EN, DE, FR, IT)
│
├── events/
│   └── sris-2026.json    Beispiel-Event (Swiss Research and Innovation Summit 2026)
│
└── assets/
    ├── logo-en.png       Logo auf Englisch
    ├── logo-de.png       Logo auf Deutsch
    ├── logo-fr.png       Logo auf Französisch
    └── logo-it.png       Logo auf Italienisch
```

---

## Häufige Fragen

**Die Seite zeigt „No event specified" an.**  
Die URL fehlt das `?event=...`. Sicherstellen, dass die URL so aussieht: `https://beispiel.ch/?event=mein-anlass`.

**Ein Bild wird nicht angezeigt.**  
Den Dateinamen in `imageNames` prüfen – er muss genau mit dem Dateinamen auf Cloudinary übereinstimmen, Gross-/Kleinschreibung inklusive.

**Ich möchte eine Übersetzung ändern.**  
Die Datei `translations.js` öffnen. Dort sind alle Texte nach Sprache geordnet aufgelistet.

**Ich möchte eine neue Sprache hinzufügen.**  
In `translations.js` ein neues Objekt mit allen Schlüsseln hinzufügen (z. B. für `it`), ein neues Logo unter `assets/logo-it.png` ablegen und den Sprachbutton in `index.html` von `display:none` auf sichtbar stellen.
