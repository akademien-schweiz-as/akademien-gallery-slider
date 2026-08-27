// Dieses Script läuft beim Seitenaufruf als erstes.
// Es liest den Event-Slug aus der URL (?event=...), lädt die passende JSON-Datei
// aus dem Ordner events/ und bereitet alle Daten für die Galerie vor.
(async function loadEvent() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('event');

    if (!slug) {
        showMessage('No event specified. Add <code>?event=event-slug</code> to the URL.');
        return;
    }

    // Sicherheitsprüfung: nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.
    // Verhindert, dass jemand über die URL auf andere Dateien zugreifen kann (z. B. "../../passwort").
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        showMessage('Invalid event identifier.');
        return;
    }

    try {
        // cache: 'no-store' verhindert, dass der Browser eine veraltete Version der JSON-Datei aus
        // dem Cache lädt – wichtig, wenn die Datei nachträglich bearbeitet wird.
        const resp = await fetch('events/' + slug + '.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error('Not found');
        const config = await resp.json();

        // Bilder alphabetisch sortieren, damit die Reihenfolge bei jedem Aufruf gleich bleibt.
        // slice() erstellt eine Kopie des Arrays, damit das Original unverändert bleibt.
        window.images = config.imageNames.slice().sort().map(function(name) {
            return {
                full: config.baseUrl + name,           // URL des Originalbilds (hohe Auflösung)
                thumb: config.thumbnailBaseUrl + name, // URL des Vorschaubilds (klein, für die Galerie)
                filename: name
            };
        });

        // Die gesamte Event-Konfiguration global verfügbar machen,
        // damit script.js darauf zugreifen kann.
        window.eventConfig = config;

        document.title = config.title + ' – Gallery';

        var titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = config.title;

        var copyrightEl = document.getElementById('copyright-info');
        if (copyrightEl && config.copyrightHtml) {
            copyrightEl.innerHTML = '<p>' + config.copyrightHtml + '</p>';
        }

        // Ladeanimation ausblenden, Hauptinhalt einblenden
        var loadingEl = document.getElementById('gallery-loading');
        if (loadingEl) loadingEl.style.display = 'none';

        var mainEl = document.getElementById('gallery-main');
        if (mainEl) mainEl.style.display = '';

        // Galerie initialisieren (definiert in script.js)
        init();

    } catch (err) {
        showMessage('Event &ldquo;' + slug + '&rdquo; could not be loaded.');
        console.error(err);
    }

    function showMessage(html) {
        var loadingEl = document.getElementById('gallery-loading');
        if (loadingEl) {
            loadingEl.innerHTML = '<p style="color: #666; font-size: 1rem;">' + html + '</p>';
        }
    }
})();
