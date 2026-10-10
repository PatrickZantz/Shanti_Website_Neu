# Deployment

Die Website ist rein statisch und wird als `frontend/dist` ausgeliefert. Es gibt keinen Server-Prozess im Produktionsbetrieb.

## Cloudflare Pages (empfohlen)

Der Astro-Build ist bereits für Cloudflare Pages vorbereitet. Die wichtigsten Einstellungen für das Pages-Projekt im Dashboard:

1. In Cloudflare auf `Workers & Pages` → `Pages` → `Create` → `Connect to Git` gehen.
2. Das GitHub-Repository `PatrickZantz/Shanti_Website_Neu` auswählen.
3. Als Root-Verzeichnis `frontend` setzen.
4. Build-Befehl: `npm run build`
5. Output Directory: `dist`
6. Build-Umgebung: `NODE_VERSION=22`
7. Optional: `PUBLIC_CONTACT_EMAIL` setzen, z. B. `hello@deine-domain.de`.
8. Produktion-Branch auf `main` setzen und das Projekt erstellen.
9. Danach Domain an das Pages-Projekt anbinden.

Wichtig: Cloudflare baut automatisch bei jedem Push auf `main`. Kein Node-Server, kein Docker und keine separate Laufzeit nötig.

### Beispiel für die Umgebungsvariablen

```
NODE_VERSION=22
PUBLIC_CONTACT_EMAIL=hello@example.com
```

Die Datei `frontend/.env.example` dient als Vorlage. Für das Live-Deployment sollte `PUBLIC_CONTACT_EMAIL` auf die echte E-Mail-Adresse der Website gesetzt werden.

### Optional: Cloudflare CLI

Falls du das Projekt aus der Kommandozeile verwalten willst, ist das nach einem Cloudflare-Login möglich:

```bash
cd frontend
npx wrangler pages project create shanti-yoga --production-branch main
```

Die tatsächliche Projekt-Erstellung auf Cloudflare selbst benötigt einen gültigen Cloudflare-Login oder ein API-Token.

## Alternative: eigene VPS

`npm run build` lokal oder in GitHub Actions ausführen und dann `frontend/dist/` per rsync auf die VPS kopieren:

```bash
npm run build
rsync -avz frontend/dist/ user@example.com:/srv/sites/shanti/
```

Damit kann Caddy die statische Website ausliefern:

```nginx
shanti.example {
  root * /srv/sites/shanti
  file_server
  encode gzip
}
```

Caddy übernimmt TLS automatisch. Es wird weder Docker noch Node auf der VPS benötigt.
