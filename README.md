# Shanti Yoga

Statische Website auf Astro 5 mit React. Inhalte und Seiteneinstellungen liegen
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

Der Build liegt anschließend in `frontend/dist/`.

Optional kann `PUBLIC_CONTACT_EMAIL` in `frontend/.env` gesetzt werden. Die
Vorlage dazu liegt in `frontend/.env.example`.

## Deployment

Deployment-Optionen und Cloudflare-Pages-Einstellungen stehen in
[deploy/README.md](./deploy/README.md). Projektstatus und offene Punkte stehen
in [PLAN.md](./PLAN.md).
