# Sicurezza

## Regole d'oro per chi pubblica AIDA
- **Mai chiavi nel codice o in Git.** Le chiavi (`OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `TS_AUTHKEY`…) vanno solo nelle variabili d'ambiente di Netlify o nel file `.env` (già in `.gitignore`).
- **Imposta `ACCESS_CODE`** se la tua istanza ha chiavi AI e non è solo su una rete privata: senza codice chiunque trovi l'indirizzo può usare le tue chiavi.
- **Limite di spesa** nel pannello del fornitore (OpenAI, OpenRouter) e `RATE_LIMIT` / `FREE_DAILY_CAP` / `MAX_TOKENS` per contenere gli abusi.
- Per uso personale preferisci **Tailscale**: l'istanza resta privata e non è esposta su Internet.
- Se una chiave finisce per sbaglio su GitHub, **revocala subito** e creane una nuova: cancellare il commit non basta, la cronologia resta visibile.

## Privacy
Memoria, chat e XP restano sul dispositivo. Con un motore cloud i messaggi (e, se attivata, la memoria) vengono inviati al fornitore del modello. Con la sincronizzazione attiva i dati sono salvati nel file `aida-sync.json` del tuo server, non cifrato.

## Segnalare un problema
Apri una *Security advisory* privata dalla scheda **Security** del repository (non una issue pubblica) con i passaggi per riprodurlo.
