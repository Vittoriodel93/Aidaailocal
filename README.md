# AIDA — assistente personale con voce, memoria e abilità

Web, Android e PC da un'unica base di codice, installabile come app, con uso offline. Si collega a ChatGPT, a modelli gratuiti o a **Ollama** locale, e si può ospitare in privato con **Docker + Tailscale**. Nessuna dipendenza, nessuna build.

```
web/                     AIDA (PWA): chat, voce, «Ehi Aida», memoria, abilità
netlify/functions/       Funzione AI (ChatGPT, modelli gratuiti, Ollama): chiavi sempre lato server
server/server.mjs        Server per PC / NAS / Docker: sito + funzione AI + sincronizzazione
Dockerfile, docker-compose*.yml, docker/tailscale/   Docker, anche con Tailscale (HTTPS privato)
pc-agent/                Istruzioni per collegare Mark LVI (agente per PC, scaricato a parte)
```

## Come vuoi usarla?
| Dove | Come |
|---|---|
| **Sito pubblico** | Netlify (come finora): `netlify.toml` pubblica `web/` e la funzione AI |
| **PC, senza Docker** | `node server/server.mjs` (serve Node 18+) → <http://localhost:8080> |
| **PC / NAS con Docker** | `cp .env.example .env` → `docker compose up -d --build` → `http://IP:8080` |
| **Ovunque, in privato** | Docker + Tailscale (sotto): HTTPS `https://aida.<tuo-tailnet>.ts.net` |
| **Android** | Chrome → «Installa app» (o APK da pwabuilder.com) |
| **Installare su PC** | Chrome/Edge → icona «Installa» nella barra dell’indirizzo |

> Microfono, «Ehi Aida» e installazione richiedono **HTTPS** (o `localhost`). Su `http://IP:8080` del NAS il sito funziona, ma il microfono no: usa Tailscale (sotto) o Netlify.

## Docker
1. `cp .env.example .env` e inserisci le chiavi che vuoi usare (`OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_URL`…). Il file `.env` non va mai caricato su GitHub.
2. `docker compose up -d --build`
3. Dati (memoria sincronizzata) nel volume `aida-data`. Aggiornare: `git pull` e `docker compose up -d --build`.

## Tailscale (HTTPS privato, solo i tuoi dispositivi)
1. Nel pannello Tailscale (login.tailscale.com/admin): **DNS → attiva MagicDNS e «HTTPS Certificates»**, poi **Settings → Keys → Generate auth key**.
2. In `.env`: `TS_AUTHKEY=tskey-auth-…` e, se vuoi, `TS_HOSTNAME=aida`.
3. `docker compose -f docker-compose.tailscale.yml up -d --build`
4. Installa l’app **Tailscale** sul telefono/PC (stesso account) e apri `https://aida.<nome-tailnet>.ts.net`. Da lì installi AIDA come app e il microfono funziona.
Senza Docker: sul PC con Tailscale, `tailscale serve --bg 8080` pubblica AIDA nello stesso modo.
Il sito resta **privato** (non è su Internet): lo vedono solo i dispositivi del tuo account Tailscale.

## Memoria collegata all’AI
- Impostazioni → **Usa la mia memoria con l’AI**: le note della Memoria vengono inviate al modello (ChatGPT, gratuito o Ollama) a ogni messaggio. Spento di default; la scheda «Esecuzione» mostra quante note sono state usate.
- Si salva a voce o in chat: «**Ricorda che** la mia auto è grigia» · «**Cosa ricordi?**» (funziona con qualsiasi motore).
- **Sincronizzazione** (solo con il server Docker/PC): Impostazioni → *Sincronizza con il mio server*. Memoria, progetti, XP e chat identici su telefono e PC. Se modifichi la stessa cosa su due dispositivi, le note vengono unite; una nota cancellata su un dispositivo può riapparire se l’altro ne ha ancora una copia.
- Con `ACCESS_CODE` nel `.env`, ogni dispositivo deve inserire il codice in Impostazioni.

## Modelli
ChatGPT (`OPENAI_API_KEY`, `OPENAI_MODEL`) · gratuiti via OpenRouter (`OPENROUTER_API_KEY`, l’elenco in `netlify/functions/chat.mjs` cambia spesso) · **Ollama** locale e senza limiti (`OLLAMA_URL`, `OLLAMA_MODEL`, per esempio Qwen sul tuo NAS). Limiti: `RATE_LIMIT`, `FREE_DAILY_CAP`, `MAX_TOKENS`.

## Mark LVI sul PC (facoltativo)
Non è incluso: si scarica dal suo repository, vedi `pc-agent/README.md`. Con Tailscale puoi aprire il pannello di Mark da ovunque: nelle Impostazioni di AIDA scrivi l’indirizzo Tailscale del PC (per esempio `http://100.x.y.z:8000`).

## Scorciatoie
Tocca la A per parlare · «Ehi Aida» (Impostazioni) · **Ctrl+Spazio** sul PC.

## Crediti
- Le abilità e il pannello PC sono ispirati a **Mark LVI** di FatihMakes (codice di AIDA scritto da zero, quello di Mark non è incluso).
- Meteo: [Open-Meteo](https://open-meteo.com). Rete privata: [Tailscale](https://tailscale.com).

## Sicurezza e contributi
Leggi `SECURITY.md` prima di pubblicare la tua istanza e `CONTRIBUTING.md` per aggiungere abilità.
