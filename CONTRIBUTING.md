# Contribuire

Grazie dell'interesse! Il progetto non ha dipendenze né build: `web/` è HTML/CSS/JS puro.

- **Abilità nuove:** aggiungi un oggetto in `web/skills.js` (id, name, description, `test(testo)`, `run(testo)`). `run` restituisce `{text, source}` oppure lancia un errore: AIDA dice «verificato» solo se l'abilità ha funzionato.
- **Prova in locale:** `node server/server.mjs` → <http://localhost:8080>.
- **Controllo veloce:** `node --check web/app.js web/skills.js server/server.mjs netlify/functions/chat.mjs` (lo fa anche la CI).
- Niente chiavi, dati personali o file `.env` nei commit.
- Lingua dell'interfaccia: italiano.
