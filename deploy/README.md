# Deployment

Die Website ist rein statisch (`frontend/dist`). Es gibt keinen Server-Prozess.

## Cloudflare Pages (empfohlen, keine VPS nötig)

1. Repo bei GitHub anlegen und pushen.
2. Cloudflare → Workers & Pages → Pages → Git verbinden.
3. Einstellungen: Root-Verzeichnis `frontend`, Build-Befehl `npm run build`,
   Ausgabe `dist`, Umgebungsvariable `NODE_VERSION=22`.
4. Optional `PUBLIC_CONTACT_EMAIL` setzen, dann Domain verbinden.

Jeder Push baut und veröffentlicht automatisch. Ein Repo/Pages-Projekt pro Kunde.

## Alternative: eigene VPS

`npm run build` lokal oder in GitHub Actions, `frontend/dist/` per rsync nach
`/srv/sites/<kunde>/` kopieren und mit Caddy ausliefern:

```
kunde.example {
  root * /srv/sites/kunde
  file_server
  encode gzip
}
```

Caddy übernimmt TLS automatisch. Es wird weder Docker noch Node auf der VPS benötigt.
