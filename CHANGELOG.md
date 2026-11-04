# AIDA 0.4
- Risolto il blocco causato dal backend non configurato: la modalità locale è predefinita.
- Chat locale integrata, memoria, progetti, competenze, proposte Evolution Lab.
- Progressione XP e livelli 0–100.
- Backup JSON e ripristino.
- PWA installabile e cache offline.
- Collegamento NAS rinviato a modulo facoltativo futuro.

# AIDA 0.5 — Holo HUD
- Nuova interfaccia futuristica: HUD con angoli a staffa, griglia, scanline e bagliore dinamico.
- Nucleo AIDA animato (canvas) che cambia colore con lo stato: oro standby, ciano ascolto, viola elaborazione, verde esecuzione, rosso silenzioso.
- Barra comandi con visualizzatore a 9 barre, reattivo al microfono reale quando è attivo.
- Pulsante microfono con dettato vocale (dove supportato dal browser).
- Le risposte mostrano una scheda "Esecuzione" espandibile con i passaggi e i tempi.
- Dati e backup compatibili con la 0.4. Rispetta "riduci animazioni" del sistema.

- Voce femminile italiana: AIDA parla le risposte (opzione "Parla da sola"), selettore voce, tono e velocità, pulsante di prova.

# AIDA 0.6
- Motore AI nel cloud tramite funzione Netlify: ChatGPT e modelli gratuiti (OpenRouter), risposta in streaming.
- Selettore del motore in chat; «Locale (offline)» resta sempre disponibile.
- Le chiavi stanno solo nelle variabili d'ambiente di Netlify; limiti per utente e tetto giornaliero per i modelli gratuiti.

- Il nucleo animato compare anche in chat (toccalo per parlare). Conversazione vocale: microfono → AIDA risponde a voce → ascolta di nuovo.
- Voce più affidabile: frasi lette a blocchi, riconoscimento in pausa mentre AIDA parla.

- Attivazione con «Ehi Aida» (opzionale nelle Impostazioni): AIDA ascolta mentre l'app è aperta, risponde «Dimmi» e dopo qualche secondo di silenzio torna in attesa.

- Tocca la A nella Panoramica per parlare con AIDA: ascolta, risponde a voce senza cambiare pagina e mostra sotto il nucleo cosa senti e cosa risponde. La conversazione resta anche nella pagina Assistente.
- «Ehi Aida» non cambia più pagina: risponde da dove sei.

# AIDA 0.6.2
- Aggiornamenti immediati: il service worker ora scarica prima dalla rete e prende il controllo subito (prima serviva chiudere tutto per vedere la versione nuova).
- Microfono: messaggi di stato visibili («Ti ascolto…», codice errore), niente più blocchi silenziosi sull'ascolto, voce più robusta su Android.

# AIDA 0.7 — progetto unico
- Un solo progetto: web, Android (PWA/APK da PWABuilder) e PC (installazione da Chrome/Edge), con pulsante «Installa» nelle Impostazioni.
- Icone PNG nuove in stile HUD (192, 512, maskable, Apple, favicon) e manifest completo.
- Abilità integrate: orologio, calcolatrice, timer, meteo (Open-Meteo), con esito «verificato / non verificato».
- Mark LVI incluso in `pc-agent/` (copia originale, licenza CC BY-NC) e collegamento al suo pannello dalle Impostazioni.
- Ctrl+Spazio avvia/ferma la conversazione vocale sul PC.

# AIDA 0.8 — Docker, Tailscale e memoria collegata all'AI
- Server senza dipendenze (`server/server.mjs`) per PC/NAS: sito, funzione AI e sincronizzazione. Dockerfile, `docker-compose.yml` e variante Tailscale con HTTPS privato.
- Memoria collegata a ChatGPT, modelli gratuiti e Ollama (opzione in Impostazioni, spenta di default). «Ricorda che…» e «Cosa ricordi?» funzionano con qualsiasi motore.
- Sincronizzazione di memoria, progetti, XP e chat tra dispositivi; campo «Codice di accesso» nelle Impostazioni.
- Nuovo motore «Locale · Ollama» (per esempio Qwen sul tuo NAS).

# Preparazione per la pubblicazione
- Rimosso Mark LVI dal repository (licenza non commerciale): si scarica a parte.
- Rimossi i nomi dei progetti personali dai dati predefiniti.
- Aggiunti SECURITY.md, CONTRIBUTING.md e CI (controllo sintassi e build Docker).

- Licenza MIT, © 2026 Vittorio Pace.
