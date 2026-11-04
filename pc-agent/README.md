# Agente per PC — Mark LVI (facoltativo)

AIDA non include il codice di **Mark LVI** (di FatihMakes, licenza CC BY-NC 4.0, solo uso non commerciale): si scarica a parte dal suo repository.

```
cd pc-agent
git clone https://github.com/FatihMakes/Mark-LVI.git mark-lvi
cd mark-lvi
python setup.py      # installa le dipendenze
python main.py       # al primo avvio chiede la chiave Gemini (gratuita)
```
La cartella `pc-agent/mark-lvi/` è esclusa da Git (`.gitignore`), così non finisce nel tuo repository.

## Collegarlo ad AIDA
1. Avvia Mark: nelle sue impostazioni c'è il **pannello per il telefono** con indirizzo e codice QR.
2. In AIDA: Impostazioni → *Installazione e PC* → scrivi l'indirizzo (per esempio `http://192.168.1.20:8000`) → **Apri Mark**.
3. Telefono e PC sulla stessa rete, oppure collegati con **Tailscale** (indirizzo `100.x.y.z` del PC).
I comandi al PC restano gestiti da Mark: non passano da AIDA.
