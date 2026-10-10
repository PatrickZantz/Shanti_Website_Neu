# Projektplan: Shanti Yoga

## Neustart-Basis

- Frisches Repository aus dem aktuellen Astro-Projekt; keine Übernahme der
  bisherigen Git-Historie oder des archivierten Next.js/CMS-Standes.
- Statische Astro-Website (Astro 7.3.8), derzeit 34 generierte Seiten.
- Keine Mitglieder, kein Login und kein CMS. Diese Funktionen sind nicht Teil
  des aktuellen Neustarts.
- Deployment-Ziel ist Cloudflare Pages; eine statische Auslieferung über einen
  anderen Hoster bleibt möglich.
- Der kritische Astro-Audit-Befund der übernommenen Version wurde durch das
  Upgrade behoben. Vier moderate Audit-Hinweise aus der Build-Abhängigkeit
  `gray-matter` → `js-yaml` 3 → `argparse` → `sprintf-js` sind noch offen.

## Vor dem Livegang

- [ ] Impressum und Datenschutzhinweise mit echten Angaben vervollständigen und
      rechtlich prüfen.
- [ ] `PUBLIC_CONTACT_EMAIL` auf die echte Kontaktadresse setzen und den
      Kontaktablauf testen.
- [ ] Domain und Cloudflare-Pages-Projekt einrichten.
- [ ] Website auf Mobilgeräten, Formularverhalten, Links und Seitentitel prüfen.
- [ ] Beispielvideos entfernen oder durch freigegebene Inhalte ersetzen.
- [ ] Verbleibende moderate npm-Audit-Hinweise in der Frontmatter-Abhängigkeit
      bewerten und nach Möglichkeit beheben.

## Später entscheiden

- [ ] Nach dem Livegang offene Punkte und gewünschte Änderungen sammeln.
- [ ] CMS oder Mitgliederbereich nur bei konkretem Bedarf neu bewerten; dafür
      keine alten Zugangsdaten oder Konfigurationen wiederverwenden.
