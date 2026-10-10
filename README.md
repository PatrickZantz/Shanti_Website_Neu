# Shanti Yoga

Statische Website auf Astro 7 mit React. Inhalte und Seiteneinstellungen liegen
in `frontend/content`; das Frontend wird als statische Website gebaut.

## Entwicklung

Voraussetzung: Node.js ≥ 22.12.

```bash
cd frontend
npm install
npm run dev
npm run check
npm run build
```

Der Build liegt anschließend in `frontend/dist/`. Im Repo-Root baut `npm run build` das Frontend, `npx wrangler deploy` baut und lädt es zu Cloudflare hoch.

Optional kann `PUBLIC_CONTACT_EMAIL` in `frontend/.env` gesetzt werden. Die
Vorlage dazu liegt in `frontend/.env.example`.

## Deployment

Deployment-Einstellungen für Cloudflare, Kosten stehen in
[deploy/README.md](./deploy/README.md). Projektstatus und offene Punkte stehen
in [PLAN.md](./PLAN.md).
