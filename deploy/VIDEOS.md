# Private Videos (Cloudflare Access + R2)

Videos liegen in einem privaten R2-Bucket und werden nur über den Worker
(`worker/index.ts`) unter `/media/<datei>` ausgeliefert. Cloudflare Access
(kostenlos bis 50 Nutzer) schützt `/videos/*` und `/media/*`. Der Worker prüft
zusätzlich das Access-JWT (fail closed). Die öffentlichen Seiten (`/yoga`,
Startseite) enthalten keine Video-URLs.

## Einmalig einrichten (vor dem Deploy dieses Branches!)

1. **R2-Bucket anlegen** (ohne öffentlichen Zugriff, kein r2.dev, keine Custom Domain):
   `npx wrangler r2 bucket create shanti-videos`
2. **Zero Trust aktivieren:** Dashboard → Zero Trust → Team-Namen wählen, Free-Plan.
   Login-Methode: „One-time PIN" (E-Mail-Code).
3. **Access-Anwendung anlegen:** Zero Trust → Access → Applications → Self-hosted.
   Domain = deine Website, Pfade `/videos/*` und `/media/*`.
   Policy „Allow" → Emails: die freigeschalteten Adressen (oder eine Gruppe).
4. **Werte eintragen** in [`wrangler.jsonc`](../wrangler.jsonc):
   `ACCESS_TEAM_DOMAIN` (`https://<team>.cloudflareaccess.com`) und `ACCESS_AUD`
   (Application Audience Tag aus der Access-Anwendung).
5. Deploy (Merge nach `main`).

Hinweis: Access greift nur auf der Custom Domain, nicht auf `*.workers.dev`.
`workers_dev` und Preview-URLs deshalb in den Worker-Einstellungen deaktivieren.
Auf `workers.dev` fehlt das JWT, `/media/*` liefert dort 403; die Videoseiten
selbst wären dort ungeschützt erreichbar (ohne Video-Datei).

## Video hinzufügen

```bash
npx wrangler r2 object put shanti-videos/morgen-flow.mp4 --file ./morgen-flow.mp4 --content-type video/mp4 --remote
```

(Dateien > 300 MiB über rclone/S3-API hochladen.) Dann in
`frontend/content/videos/<name>.md` statt `videoUrl` setzen:

```yaml
videoFile: morgen-flow.mp4
```

Empfehlung: MP4 (H.264/AAC), „faststart", 720p–1080p.

## Nutzer freischalten / entziehen

Zero Trust → Access → Applications → Policy → E-Mail hinzufügen oder entfernen.
Aktive Sitzungen unter Users → Revoke beenden.

## Lokal testen

`.dev.vars` mit `ALLOW_INSECURE_DEV=1` anlegen, dann `npx wrangler dev`
(lokaler R2-Speicher). Niemals in Produktion setzen.

## Kosten

R2: 10 GB Speicher und 1 Mio. Leseoperationen pro Monat gratis, Egress immer
kostenlos; danach ca. 0,015 $/GB/Monat. Access Free bis 50 Nutzer. Worker-Free-Plan
(100.000 Requests/Tag) reicht; Video-Range-Requests zählen mit.
