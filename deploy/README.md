# Deployment

Die Website ist rein statisch (`frontend/dist`), es gibt keinen Server-Prozess.
Sie läuft auf Cloudflare als Worker mit Static Assets.

## Cloudflare (aktuell)

Konfiguration: [`wrangler.jsonc`](../wrangler.jsonc) im Repo-Root. Der
`build`-Eintrag ruft `npm run build` auf (Root-`package.json`), das in
`frontend/` installiert und mit Astro baut. Danach lädt Wrangler
`frontend/dist` hoch.

Einstellungen im Cloudflare-Dashboard (Workers & Pages → Create → Connect to Git):

- Repository: `PatrickZantz/Shanti_Website_Neu`, Branch `main`
- Root-Verzeichnis: leer
- Build command: leer (übernimmt `wrangler.jsonc`) oder `npm run build`
- Deploy command: `npx wrangler deploy`
- Umgebungsvariablen: `NODE_VERSION=22` (zusätzlich liegt `.node-version` im Repo),
  optional `PUBLIC_CONTACT_EMAIL=hello@deine-domain.de` (Vorlage:
  `frontend/.env.example`)

Jeder Push auf `main` löst automatisch einen Build und Deploy aus.

Private Videos: siehe [VIDEOS.md](./VIDEOS.md).

Lokaler Test: `npx wrangler deploy --dry-run`.

## Domain

Domain bei Cloudflare Registrar registrieren (Preis ohne Aufschlag) oder
bestehende Domain als Zone hinzufügen. Danach im Worker unter
Settings → Domains & Routes die Custom Domain eintragen; DNS und TLS-Zertifikat
richtet Cloudflare automatisch ein.

## Kosten (Schätzung, Stand 2026, bitte beim Anbieter prüfen)

| Posten | Kosten |
|---|---|
| Cloudflare Workers Static Assets (Hosting, TLS, CDN) | 0 €: statische Asset-Requests sind kostenlos und unbegrenzt |
| Build/CI (Workers Builds, Free-Plan) | 0 € (begrenzt auf 3.000 Build-Minuten/Monat) |
| Domain `.de` | ca. 6–10 € pro Jahr |
| Domain `.com` (Cloudflare Registrar, Einkaufspreis) | ca. 10–11 $ pro Jahr |
| E-Mail-Weiterleitung (Cloudflare Email Routing) | 0 € |

Gesamt: **ca. 6–11 € pro Jahr**, also unter 1 € pro Monat. Ein Upgrade auf
Workers Paid (5 $/Monat) ist für diese Seite nicht nötig.

## Alternative: eigene VPS

```bash
npm run build
rsync -avz frontend/dist/ user@example.com:/srv/sites/shanti/
```

Caddy liefert die statischen Dateien aus (TLS automatisch):

```
shanti.example {
  root * /srv/sites/shanti
  file_server
  encode gzip
}
```

Kosten: VPS ab ca. 4 €/Monat zuzüglich Domain.
