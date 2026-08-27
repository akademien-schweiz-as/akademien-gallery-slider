// script.js – Hauptlogik der Galerie.
// Wird von data.js aufgerufen, nachdem die Event-Daten geladen wurden.
// Zuständig für: Sprachumschalter, Bildergalerie, Lightbox und Downloads.

let lightboxIndex = 0;

// Gespeicherte Sprache aus dem Browser-Speicher laden (bleibt beim nächsten Besuch erhalten).
// Fallback auf Englisch, falls noch keine Sprache gespeichert wurde.
let currentLang = localStorage.getItem('gallery_lang') || 'en';

const galleryGrid = document.getElementById('gallery-grid');

// Sprachspezifische Logo-Dateien.
// Das Logo wechselt automatisch, wenn die Sprache geändert wird.
const logoMap = {
    en: 'assets/logo-en.png',
    de: 'assets/logo-de.png',
    fr: 'assets/logo-fr.png',
    it: 'assets/logo-it.png'
};

// Setzt das Logo in Kopf- und Fusszeile auf die richtige Sprachversion.
function updateLogos(lang) {
    var src = logoMap[lang] || logoMap['en'];
    var siteLogo = document.getElementById('site-logo');
    var footerLogo = document.getElementById('footer-logo');
    if (siteLogo) siteLogo.src = src;
    if (footerLogo) footerLogo.src = src;
}

// Einstiegspunkt – wird von data.js nach dem Laden der Event-Daten aufgerufen.
function init() {
    setupLanguages();        // Sprachbuttons einrichten
    applyTranslations(currentLang); // Texte in der aktiven Sprache setzen
    renderGallery();         // Bilder in die Galerie laden
    renderLightboxStrip();   // Vorschaustreifen im Lightbox-Bereich aufbauen
    fillPageData();          // Statistiken (Bilder, Datum, Archivgrösse) befüllen
    setupEventListeners();   // Klick- und Tastatur-Events registrieren
}

// Blendet Sprachbuttons aus, die im JSON nicht aufgelistet sind.
// Beispiel: ["en", "de"] zeigt nur EN und DE an, FR und IT werden versteckt.
// Falls die aktuell gespeicherte Sprache nicht erlaubt ist, wird auf die erste erlaubte Sprache gewechselt.
function setupLanguages() {
    if (!window.eventConfig || !window.eventConfig.languages) return;
    var allowed = window.eventConfig.languages;
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        var lang = btn.getAttribute('data-lang');
        btn.style.display = allowed.indexOf(lang) >= 0 ? '' : 'none';
    });
    if (allowed.indexOf(currentLang) < 0) {
        currentLang = allowed[0] || 'en';
        localStorage.setItem('gallery_lang', currentLang);
    }
}

// Befüllt die Statistiken im Hero-Bereich (Bilder, Datum, Archivgrösse).
// Felder wie "Archiv" werden nur angezeigt, wenn sie in der JSON-Datei angegeben sind.
function fillPageData() {
    var countEl = document.getElementById('image-count');
    if (countEl) countEl.textContent = images.length;

    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (window.eventConfig) {
        var breadcrumbEvent = document.getElementById('breadcrumb-event');
        if (breadcrumbEvent) breadcrumbEvent.textContent = window.eventConfig.title;

        var photographer = window.eventConfig.photographer;
        if (photographer) {
            var dict = translations[currentLang] || translations['en'];
            var photoCredit = document.getElementById('photographer-credit');
            if (photoCredit) photoCredit.textContent = (dict.photographyBy || 'Photography: ') + photographer;
            var footerPhotog = document.getElementById('footer-photographer');
            if (footerPhotog) footerPhotog.textContent = photographer;
        }

        var date = window.eventConfig.date;
        if (date) {
            var dateWrap = document.getElementById('stat-date-wrap');
            var dateEl = document.getElementById('event-date');
            if (dateWrap) dateWrap.style.display = '';
            if (dateEl) dateEl.textContent = date;
        }

        // Archivgrösse ist optional – nur anzeigen, wenn im JSON vorhanden
        var archiveSize = window.eventConfig.archiveSize;
        if (archiveSize) {
            var archiveWrap = document.getElementById('stat-archive-wrap');
            var archiveEl = document.getElementById('archive-size');
            if (archiveWrap) archiveWrap.style.display = '';
            if (archiveEl) archiveEl.textContent = archiveSize;
        }
    }
}

// Setzt alle Texte auf der Seite in der gewählten Sprache.
// HTML-Elemente mit data-i18n="schlüssel" werden automatisch übersetzt.
// Ruft auch updateLogos() auf, damit das Logo zur Sprache passt.
function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('gallery_lang', lang);
    const dict = translations[lang] || translations['en'];

    // Alle Elemente mit data-i18n-Attribut übersetzen
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // Elemente mit data-i18n-title: Tooltip-Text übersetzen
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key]) el.title = dict[key];
    });

    // Aktiven Sprachbutton visuell hervorheben
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    updateLogos(lang);

    // Galerie neu rendern, damit z. B. Download-Button-Tooltips ebenfalls übersetzt werden
    if (galleryGrid && galleryGrid.innerHTML.trim() !== '') {
        renderGallery();
    }
}

// Baut die Bildergalerie auf: für jedes Bild wird eine Kachel mit Vorschaubild
// und Download-Button erstellt.
function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    const dict = translations[currentLang] || translations['en'];

    images.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.innerHTML = `
            <img src="${img.thumb}" alt="Gallery image ${idx + 1}" loading="lazy">
            <div class="grid-overlay">
                <button class="dl-btn" data-idx="${idx}" title="${dict.downloadImgTitle || 'Download Image'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>
                </button>
            </div>
        `;
        // Klick auf die Kachel öffnet den Lightbox – ausser wenn auf den Download-Button geklickt wird
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.dl-btn')) openLightbox(idx);
        });
        galleryGrid.appendChild(item);
    });

    document.querySelectorAll('.dl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
            downloadImage(images[idx]);
        });
    });
}

// Erstellt den Vorschaustreifen am unteren Rand des Lightbox.
function renderLightboxStrip() {
    const strip = document.getElementById('lightbox-strip');
    if (!strip) return;
    strip.innerHTML = '';
    images.forEach((img, idx) => {
        const btn = document.createElement('button');
        btn.className = 'lightbox-thumb-btn';
        btn.dataset.idx = idx;
        btn.innerHTML = `<img src="${img.thumb}" alt="">`;
        btn.addEventListener('click', () => openLightbox(idx));
        strip.appendChild(btn);
    });
}

// Hebt das aktuell angezeigte Bild im Vorschaustreifen hervor
// und scrollt es ins Sichtfeld.
function updateLightboxStrip(idx) {
    const strip = document.getElementById('lightbox-strip');
    if (!strip) return;
    strip.querySelectorAll('.lightbox-thumb-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
    const active = strip.querySelector('.lightbox-thumb-btn.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ── Lightbox ──

function openLightbox(index) {
    lightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = images[lightboxIndex].full;
    updateLightboxMeta(lightboxIndex);
    updateLightboxStrip(lightboxIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Scrollen der Seite im Hintergrund deaktivieren
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function changeLightboxImage(step) {
    // Modulo-Rechnung sorgt dafür, dass nach dem letzten Bild wieder das erste kommt
    lightboxIndex = (lightboxIndex + step + images.length) % images.length;
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) lightboxImg.src = images[lightboxIndex].full;
    updateLightboxMeta(lightboxIndex);
    updateLightboxStrip(lightboxIndex);
}

function updateLightboxMeta(idx) {
    const counter = document.getElementById('lightbox-counter');
    const caption = document.getElementById('lightbox-caption');
    if (counter) counter.textContent = (idx + 1) + ' / ' + images.length;
    if (caption) caption.textContent = images[idx].filename;
}

// ── Downloads ──

// Lädt ein einzelnes Bild herunter. Falls der Browser-Download fehlschlägt
// (z. B. wegen CORS), wird das Bild stattdessen in einem neuen Tab geöffnet.
async function downloadImage(imgObj) {
    const dict = translations[currentLang] || translations['en'];
    try {
        const response = await fetch(imgObj.full);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imgObj.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error(dict.downloadFallback || 'Download failed, opening in new tab:', err);
        window.open(imgObj.full, '_blank');
    }
}

async function downloadAll() {
    const dict = translations[currentLang] || translations['en'];
    const confirmMsg = (dict.downloadConfirm || 'This will download {count} images. Continue?').replace('{count}', images.length);
    if (confirm(confirmMsg)) {
        for (const img of images) {
            await downloadImage(img);
            // Kurze Pause zwischen den Downloads, damit der Browser nicht überlastet wird
            await new Promise(r => setTimeout(r, 400));
        }
    }
}

// ── Event-Listener ──

function setupEventListeners() {
    // Sprachumschalter
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');
            applyTranslations(lang);
            document.documentElement.lang = lang;
        });
    });

    // "Alle herunterladen"-Button
    const downloadAllBtn = document.getElementById('download-all-btn');
    if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAll);

    // Lightbox-Steuerung
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxDl = document.getElementById('lightbox-dl');

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(1); });
    if (lightboxDl) lightboxDl.addEventListener('click', (e) => { e.stopPropagation(); downloadImage(images[lightboxIndex]); });

    // Klick auf den dunklen Hintergrund schliesst den Lightbox
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // Touch-Wischen für mobile Geräte (links/rechts)
    let lbTouchStartX = 0;
    const lbImgEl = document.getElementById('lightbox-img');
    if (lbImgEl) {
        lbImgEl.addEventListener('touchstart', (e) => { lbTouchStartX = e.touches[0].clientX; }, { passive: true });
        lbImgEl.addEventListener('touchend', (e) => {
            const diff = lbTouchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) changeLightboxImage(diff > 0 ? 1 : -1);
        });
    }

    // Pfeiltasten und Escape-Taste im Lightbox
    document.addEventListener('keydown', (e) => {
        const lightboxActive = lightbox && lightbox.classList.contains('active');
        if (!lightboxActive) return;
        if (e.key === 'ArrowLeft') changeLightboxImage(-1);
        if (e.key === 'ArrowRight') changeLightboxImage(1);
        if (e.key === 'Escape') closeLightbox();
    });
}

// init() wird von data.js aufgerufen, sobald die Event-Daten geladen sind.
