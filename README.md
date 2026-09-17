# KIM Discord Activity
Application ID: 1550179525806264400

## Lokal test
1. Installer Node.js 20+.
2. Kjør `npm install`
3. Kjør `npm run dev`
4. For Discord Activity må siden eksponeres på en offentlig HTTPS-adresse (f.eks. Cloudflare Tunnel/ngrok eller deploy til Vercel/Netlify).

## Discord Developer Portal
1. Åpne applikasjonen KIM (ID over).
2. Aktiver/konfigurer Activity / Embedded App.
3. Under URL Mappings peker `/` til HTTPS-adressen der denne appen kjører.
4. Start Activity fra Discord Developer Portal / testserver.

Ingen Bot Token eller Client Secret ligger i prosjektet eller skal legges i frontend.

## KIM-logikk
- Europe/Oslo brukes eksplisitt, så CET/CEST håndteres automatisk.
- 12:00: 0,2 ‰
- 18:00: 0,8 ‰
- 01:30: 2,8 ‰
- Etter 22:30 vises søvnfare.
- Fem Kim-illustrasjoner brukes som tilstandsbilder.
