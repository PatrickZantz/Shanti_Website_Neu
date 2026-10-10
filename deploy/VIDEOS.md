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

## Neues Video hinzufügen

Ablauf: **1. MP4 nach R2 hochladen, 2. Dateinamen im Content eintragen, 3. pushen.**

### 1. Upload nach R2

**Dashboard (bis 300 MB pro Datei):**
Cloudflare Dashboard → R2 Object Storage → Bucket `shanti-videos` → Objects →
Upload → Datei wählen. Der Objektname ist der Dateiname (z. B. `morgen-flow.mp4`).

**CLI (empfohlen, auch größere Dateien):**

```bash
npx wrangler login   # einmalig
npx wrangler r2 object put shanti-videos/morgen-flow.mp4 \
  --file ./morgen-flow.mp4 --content-type video/mp4 --remote
```

Prüfen: `npx wrangler r2 object get shanti-videos/morgen-flow.mp4 --remote --file /dev/null`
oder im Dashboard unter Objects. Dateien > 300 MiB gehen nicht über Wrangler,
dafür rclone mit der R2-S3-API (Dashboard → R2 → Manage API tokens).

Dateinamen: nur Kleinbuchstaben, Ziffern, `-`, `.`; keine Leerzeichen, keine
Unterordner nötig (Unterordner wie `kurse/flow.mp4` gehen, der Pfad wird dann
komplett als `videoFile` eingetragen). Format: MP4 (H.264/AAC), „faststart"
(`ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`), 720p–1080p.

### 2. Dateiname im Projekt pflegen

Die Dateinamen stehen im Frontmatter der Videoeinträge in
`frontend/content/videos/<name>.md`, Feld `videoFile`:

```yaml
---
title: Morgen-Flow
slug: morgen-flow
description: Sanfter Start in den Tag.
category: Video · Erde
energyLevel: Niedrig
elements: [Erde]
videoDuration: 12 Min.
videoFile: morgen-flow.mp4
---

Beschreibungstext (Markdown).
```

Für ein neues Video eine bestehende Datei kopieren, `slug`, Titel usw. anpassen,
`videoUrl` entfernen und `videoFile` setzen. Der Dateiname muss exakt dem
R2-Objektnamen entsprechen (Groß-/Kleinschreibung). Ein bestehendes Video
ersetzen: gleiche Datei unter gleichem Namen erneut hochladen.

### 3. Veröffentlichen

`git add`, `git commit`, `git push` auf `main` → Cloudflare baut und deployt.
Videos erscheinen sofort nach dem Deploy; der Upload allein macht noch nichts
sichtbar. Die Videoseite zeigt nur Eingeloggten den Player.

## Nutzer freischalten

1. Cloudflare Dashboard → Zero Trust → Access → Applications → die
   Shanti-Anwendung → Edit → Policies.
2. Policy „Allow" öffnen → bei Include „Emails" die E-Mail-Adresse
   hinzufügen (oder „Emails ending in" für eine ganze Domain) → Save.
   Alternativ eine Access-Gruppe pflegen (Access → Access groups) und diese
   in der Policy verwenden; dann ist nur die Gruppe zu ändern.
3. Der Nutzer öffnet die Videoseite, gibt seine E-Mail ein und erhält einen
   Einmalcode per Mail. Die Sitzung gilt so lange wie die eingestellte
   Session Duration (Standard 24 h, anpassbar unter der Anwendung).

Insgesamt maximal 50 Nutzer im Free-Plan (Zero Trust → Settings → Billing).

## Nutzer entfernen

1. Zero Trust → Access → Applications → Anwendung → Policies → „Allow" →
   E-Mail-Adresse entfernen → Save (bzw. aus der Access-Gruppe löschen).
2. Bestehende Sitzung sofort beenden: Zero Trust → Users (bzw. Access →
   Users) → Nutzer wählen → „Revoke" / „Revoke all sessions". Ohne diesen
   Schritt bleibt der Zugriff bis zum Ablauf der Session erhalten.
3. Prüfen: In einem Privatfenster mit dieser Adresse anmelden; Zugriff muss
   abgelehnt werden.

## Lokal testen

`.dev.vars` mit `ALLOW_INSECURE_DEV=1` anlegen, dann `npx wrangler dev`
(lokaler R2-Speicher). Niemals in Produktion setzen.

## Kosten

R2: 10 GB Speicher und 1 Mio. Leseoperationen pro Monat gratis, Egress immer
kostenlos; danach ca. 0,015 $/GB/Monat. Access Free bis 50 Nutzer. Worker-Free-Plan
(100.000 Requests/Tag) reicht; Video-Range-Requests zählen mit.
