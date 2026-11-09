# WohnBudget – Wohnungen finanziell vergleichen (PWA)

Reine statische Web-App (HTML/CSS/JavaScript, **kein Build nötig**, kein Backend). Daten bleiben lokal im Browser (localStorage). Backup per JSON-Export/-Import im Tab «Budget».

## Dateien
`index.html` · `style.css` · `app.js` (gesamte Logik) · `sw.js` (Offline) · `manifest.webmanifest` · `icon-*.png`

## Lokal testen
`python3 -m http.server 8000` im Ordner, dann http://localhost:8000 öffnen.

## Auf GitHub Pages veröffentlichen
1. Auf github.com ein neues **öffentliches** Repository erstellen (z. B. `wohnbudget`).
2. «Add file → Upload files», alle Dateien aus diesem Ordner hochladen (nicht den Ordner selbst), «Commit changes».
3. «Settings → Pages»: Source = «Deploy from a branch», Branch `main`, Ordner `/ (root)`, Save.
4. Nach ca. 1 Minute erreichbar unter `https://DEINNAME.github.io/wohnbudget/`. Alle Pfade sind relativ, ein Basis-Pfad ist nicht nötig.

## Auf dem iPhone installieren
1. Die URL in **Safari** öffnen.
2. Teilen-Symbol → «Zum Home-Bildschirm» → «Hinzufügen».
3. Einmal online öffnen, danach funktioniert die App offline.

## Hinweise
- Daten sind pro Gerät/Browser getrennt: Zwischen Geräten per Export/Import übertragen.
- Die iPhone-Home-Bildschirm-App hat einen eigenen Speicher; Daten aus Safari ggf. per Export/Import übernehmen.
- Bei Updates in `sw.js` die Version (`wohnbudget-v1`) erhöhen.
