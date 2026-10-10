# Semestre filtro — file sorgente

App per preparare gli esami del semestre filtro di Medicina 2026/27 (UPO): Fisica completa, Chimica e Biologia con il programma ufficiale.
Le pagine pubblicate **non si modificano a mano**: si modificano questi sorgenti e si rilancia la costruzione.

## Dove finisce
`semestre/` → https://f6kd4bp6sr-stack.github.io/mie-app/semestre/ — app **autonoma**, installabile su qualsiasi iPad (Safari → Condividi → Aggiungi alla schermata Home).

È separata da Pianificazione e da Il mio mondo: memoria propria sul dispositivo (`semestre-v1` e database `semestre-filtro`), service worker proprio. I vecchi indirizzi `licenze/semestre.html` e `licenze/fisica.html` rimandano solo qui. Tra iPad diversi i progressi si passano con la copia su File / iCloud.

## File
| File | Contenuto |
|---|---|
| `a_head.html` | intestazione della pagina e stile grafico (colori chiari e scuri) |
| `b_data.js` | **Fisica**: unità e CFU, 34 argomenti (spiegazioni, formule, trappole), banca domande, test d'ingresso, date, fonti |
| `b3_spiegazioni_fis.js` | **Fisica**: spiegazione estesa, esempi svolti passo per passo e collegamento medico per ognuno dei 34 argomenti (`FIS_EXPL`) |
| `b2_other.js` | **Chimica e Biologia** (unità, CFU, argomenti dal syllabus) e registro `EXAMS` dei tre esami |
| `c_anim.js` | 25 animazioni interattive (`AN.<nome>`), collegate agli argomenti con `anim:"<nome>"` |
| `d_app.js` | motore: navigazione, test, esercizi, simulazione 21+10 in 50 minuti, piano di studio, progressi, installazione |
| `e_barra_sf.js` | aggiornamento automatico, copia giornaliera, copia su File / iCloud |
| `qrcode.js` | libreria per il codice QR della pagina «Installa» (MIT, vedi `LICENSE-qrcode.txt`) |
| `build.py` | costruisce tutto (serve `node` per il codice QR) |

## Costruire e pubblicare
```
python3 sorgenti/semestre/build.py
git add -A && git commit -m "Semestre filtro: …" && git push
```
Il numero di versione nasce dal contenuto: se cambia qualcosa, gli iPad trovano la nuova versione al prossimo avvio e si aggiornano da soli (mai durante una simulazione).

## Aggiungere contenuti
- **Domanda**: in `qb` dell'esame, `{t:"<argomento>",k:"m",q:"testo",o:[5 opzioni],a:<indice giusta>,s:"spiegazione"}` oppure completamento `{t:…,k:"c",q:"… ____ …",a:["RISPOSTA","VARIANTE"],s:…}`.
- **Argomento**: `{id,u,t,breve:[…],form:[["formula","nota"]],trap:"…",anim:"<nome>"}`; spiegazione in un file a parte `{sp:[paragrafi],es:[{q,p:[passaggi],r}],med:"…"}`; per Chimica e Biologia oggi c'è solo `syl:[…]` (voci del syllabus).
- **Rendere pronto un esame**: riempire `topics` con le spiegazioni, aggiungere almeno 31 domande in `qb` (con almeno 10 a completamento) e un test d'ingresso `pt`, poi mettere `ready:true` in `EXAMS`.
- Per ogni unità `q` = domande nella simulazione (somma 31) e `cp` = di cui a completamento (somma 10).

## Fonti dei contenuti
Syllabus ufficiali MUR 2026/27 (D.M. 941/2026), pagina UPO sull'accesso a Medicina 2026/27, prove e analisi dei due appelli 2025. Dove le analisi commerciali e il testo ufficiale non coincidono, l'app segue il testo ufficiale.
Nessun dato personale nel codice: test, risposte e progressi restano solo sul dispositivo.
