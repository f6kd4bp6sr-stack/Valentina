/* ================= CHIMICA E BIOLOGIA: struttura dal syllabus MUR 2026/27 =================
   Per ora: unità con CFU, argomenti e voci del syllabus, autovalutazione.
   Spiegazioni, animazioni ed esercizi si aggiungono riempiendo breve/form/trap/anim e la banca domande qb. */
const CHI_UNITS=[
 {id:"c1",ic:"⚛️",t:"Atomo, legami, stati della materia, termodinamica",cfu:1,q:5,cp:2},
 {id:"c2",ic:"🧪",t:"Miscele, soluzioni e proprietà colligative",cfu:1,q:5,cp:2},
 {id:"c3",ic:"⏳",t:"Reazioni: cinetica ed equilibrio",cfu:.5,q:3,cp:1},
 {id:"c4",ic:"🩸",t:"Acidi, basi, tamponi, redox",cfu:1,q:5,cp:1},
 {id:"c5",ic:"⬡",t:"Carbonio e idrocarburi",cfu:.5,q:3,cp:1},
 {id:"c6",ic:"🔗",t:"Gruppi funzionali e isomerie",cfu:1,q:5,cp:2},
 {id:"c7",ic:"🧬",t:"Biomolecole",cfu:1,q:5,cp:1}];
const CHI_TOPICS=[
{id:"c1a",u:"c1",t:"Struttura dell'atomo, orbitali e tavola periodica",syl:["Protoni, neutroni ed elettroni; numero atomico e di massa; isotopi; proprietà magnetiche del nucleo e risonanza magnetica (cenni)","Numeri quantici, orbitali, principio di Pauli, regola di Hund; configurazione elettronica degli elementi degli organismi viventi","Proprietà periodiche: volume atomico, potenziale di ionizzazione, affinità elettronica, elettronegatività; regola dell'ottetto"]},
{id:"c1b",u:"c1",t:"Mole, legami chimici e nomenclatura",syl:["Molecole e ioni; unità di massa atomica; mole e numero di Avogadro","Legame covalente omopolare, eteropolare e di coordinazione; legame ionico; cenni sul legame metallico","Ibridazione sp, sp², sp³; orbitali σ e π; distanza, energia e angolo di legame; geometria; molecole polari e apolari di interesse biologico","Interazioni deboli (legame idrogeno, van der Waals) e interazioni idrofobiche","Numero di ossidazione; nomenclatura di composti binari e ternari biologicamente rilevanti (ossidi, idrossidi, perossidi, acidi, basi, sali)"]},
{id:"c1c",u:"c1",t:"Stati di aggregazione: solidi, gas e liquidi",syl:["Solidi ionici, molecolari, covalenti e metallici (cenni)","Leggi di Boyle, Charles e Gay-Lussac; equazione dei gas perfetti; applicazione alla respirazione; teoria cinetica e distribuzione di Maxwell-Boltzmann (cenni)","Liquidi: ebollizione, calore di evaporazione, tensione superficiale, pressione di vapore; diagrammi di fase di acqua e CO₂; sudore e termoregolazione"]},
{id:"c1d",u:"c1",t:"Termodinamica e bioenergetica",syl:["Funzioni di stato, entalpia, trasformazioni esotermiche ed endotermiche","Entropia ed energia libera di Gibbs; processi esoergonici ed endoergonici","ΔG come criterio di spontaneità ed equilibrio nei sistemi aperti"]},
{id:"c2a",u:"c2",t:"Miscele, soluzioni e solubilità",syl:["Soluzioni, sospensioni, colloidi e aerosol; soluzioni gassose, liquide e solide","L'acqua come solvente polare; soluti ionici e non ionici; elettroliti nei fluidi biologici","Solubilità dei gas nei liquidi: legge di Henry"]},
{id:"c2b",u:"c2",t:"Concentrazione delle soluzioni e miscele di gas",syl:["Percentuali p/p, p/v, v/v; molarità, molalità, frazione molare; concetto di equivalente","Soluzioni non ideali e coefficiente di attività (cenni)","Legge di Dalton; composizione dell'aria inspirata ed espirata"]},
{id:"c2c",u:"c2",t:"Proprietà colligative e osmosi",syl:["Legge di Raoult; abbassamento della pressione di vapore; innalzamento ebullioscopico e abbassamento crioscopico","Pressione osmotica; fattore di van't Hoff; osmolarità e osmolalità","Soluzioni isotoniche, ipertoniche, ipotoniche; fisiologica e glucosata; emolisi ed edema"]},
{id:"c3a",u:"c3",t:"Reazioni chimiche e cinetica",syl:["Conservazione di massa, energia e carica; bilanciamento","Velocità di reazione, ordine e molecolarità, reazioni a più stadi","Legge di Arrhenius, urti efficaci, energia di attivazione, stato di transizione; catalizzatori ed enzimi"]},
{id:"c3b",u:"c3",t:"Equilibrio chimico ed equilibri di solubilità",syl:["Costante di equilibrio, legge d'azione di massa, quoziente di reazione; ΔG ed equilibrio","Equilibrio e stato stazionario; principio di Le Châtelier; effetto della temperatura; equilibri multipli","Prodotto di solubilità, ione comune; precipitazione degli urati e calcoli renali"]},
{id:"c4a",u:"c4",t:"Acidi, basi, pH e sali",syl:["Teorie di Arrhenius, Brønsted-Lowry e Lewis (cenni); autoprotolisi dell'acqua e Kw","pH e pOH; Ka, Kb, pKa, pKb; acidi e basi forti e deboli; indicatori; acidi e basi poliprotici","Comportamento dei sali in acqua; solubilità e pH: ossalato di calcio, fosfato di calcio, urato di sodio"]},
{id:"c4b",u:"c4",t:"Soluzioni tampone e pH del sangue",syl:["Equazione di Henderson-Hasselbalch; efficienza di un tampone","Tamponi del sangue: CO₂/bicarbonato, diidrogenofosfato/idrogenofosfato, proteine","Acidosi e alcalosi"]},
{id:"c4c",u:"c4",t:"Ossidoriduzioni ed elettrochimica",syl:["Cella galvanica, anodo e catodo, semireazioni e potenziali standard; equazione di Nernst","Relazione tra ΔG e differenza di potenziale; lavoro chimico","Ossigeno accettore di elettroni nella respirazione; reazioni di Fenton e Haber-Weiss (radicale idrossilico)"]},
{id:"c5a",u:"c5",t:"Carbonio, nomenclatura e stereochimica",syl:["Ibridazione del carbonio; rappresentazione dei composti; idrocarburi saturi, insaturi, ciclici, eterociclici; nomenclatura IUPAC","Enantiomeri, diastereoisomeri, epimeri, racemi; convenzione R/S (cenni), potere ottico rotatorio, proiezioni di Fischer"]},
{id:"c5b",u:"c5",t:"Reattività e idrocarburi",syl:["Rottura omolitica (reazioni radicaliche) ed eterolitica; carbocationi e carboanioni; effetto induttivo; nucleofili ed elettrofili","Sostituzione nucleofila SN1 e SN2, eliminazione","Alcani e cicloalcani, alcheni (addizione elettrofila, dieni coniugati), aromatici (regola di Hückel, pirimidine e purine, sostituzione elettrofila aromatica, tossicità)"]},
{id:"c6a",u:"c6",t:"Alcoli, fenoli, eteri, tioli e ammine",syl:["Alcoli e tioli: disidratazione, ossidazione, sostituzione nucleofila; etanolo; acidità del fenolo; eteri, tioeteri, epossidi","Ammine: basicità, nucleofilicità, alchilazione, sali; nitrosammine; colina"]},
{id:"c6b",u:"c6",t:"Aldeidi e chetoni",syl:["Ossidazione, riduzione, addizione nucleofila, condensazione aldolica","Emiacetali, acetali, immine (basi di Schiff); idrogeno in alfa","Tautomeria cheto-enolica (urato, citosina, fosfoenolpiruvato); chinoni e ubichinone"]},
{id:"c6c",u:"c6",t:"Acidi carbossilici e derivati",syl:["Anidridi, esteri, tioesteri, ammidi, acilfosfati: struttura e acidità","Salificazione, decarbossilazione, sostituzione nucleofila acilica, esterificazione di Fischer, idrolisi, transesterificazione, condensazione di Claisen, lattoni"]},
{id:"c7a",u:"c7",t:"Amminoacidi e proteine",syl:["Classificazione per catena laterale, stereochimica (Fischer), proprietà acido-base e punto isoelettrico, essenziali","Legame peptidico; strutture primaria, secondaria, terziaria, quaternaria; ponti disolfuro"]},
{id:"c7b",u:"c7",t:"Carboidrati",syl:["Monosaccaridi: isomeri, epimeri, anomeri, ciclizzazione, mutarotazione","Ossidazione, riduzione, reazione di Maillard e prodotti di Amadori","Legame glicosidico; disaccaridi; amido, cellulosa, glicogeno; glicosamminoglicani"]},
{id:"c7c",u:"c7",t:"Lipidi",syl:["Acidi grassi saturi e insaturi; trigliceridi","Glicerofosfolipidi, sfingolipidi, glicolipidi","Colesterolo, ormoni steroidei, acidi biliari, vitamina D"]},
{id:"c7d",u:"c7",t:"Nucleotidi, acidi nucleici e danno ossidativo",syl:["Basi azotate, nucleosidi, nucleotidi; ATP; NAD⁺/NADH e FAD/FADH₂","Legame fosfodiestere; struttura di DNA e RNA","Deaminazione della citosina; radicale idrossilico su lipidi, proteine e DNA; antiossidanti non enzimatici (glutatione, tocoferolo, carotenoidi)"]}
];
const BIO_UNITS=[
 {id:"b1",ic:"🌳",t:"Basi dell'organizzazione biologica e molecolare",cfu:.5,q:3,cp:1},
 {id:"b2",ic:"🧶",t:"Informazione genetica ed epigenetica",cfu:.5,q:3,cp:1},
 {id:"b3",ic:"➡️",t:"Il flusso dell'informazione",cfu:1,q:5,cp:2},
 {id:"b4",ic:"🧬",t:"Caratteri selvatici e mutati",cfu:.75,q:4,cp:1},
 {id:"b5",ic:"🏭",t:"Strutture cellulari",cfu:1.75,q:8,cp:3},
 {id:"b6",ic:"📡",t:"Cellula, ambiente e segnalazione",cfu:.75,q:4,cp:1},
 {id:"b7",ic:"🔄",t:"Proliferazione e sopravvivenza cellulare",cfu:.75,q:4,cp:1}];
const BIO_TOPICS=[
{id:"b1a",u:"b1",t:"Albero della vita, teoria cellulare e virus",syl:["Organismi, teoria cellulare, proprietà della materia vivente","Virus: acido nucleico, capside, involucro; classi di virus animali; ciclo litico e lisogenico; ciclo di un retrovirus; entrata e uscita dalla cellula"]},
{id:"b1b",u:"b1",t:"Cellula procariotica",syl:["Membrana, parete, membrana esterna, capsula, fimbrie, pili, flagelli","Gram positivi e Gram negativi; eubatteri e archeobatteri","Trasferimento genico orizzontale: trasformazione, coniugazione, trasduzione"]},
{id:"b1c",u:"b1",t:"Cellula eucariotica ed endosimbiosi",syl:["Sistema delle endomembrane; origine del nucleo; endosimbiosi e mitocondri","Dagli unicellulari ai pluricellulari"]},
{id:"b1d",u:"b1",t:"Macromolecole, enzimi e metabolismo di base",syl:["Zuccheri, lipidi, proteine (domini, siti attivi), nucleotidi; DNA di Watson e Crick; RNA codificanti e non codificanti","Enzimi e classi principali (chinasi-fosfatasi, ubiquitinasi-deubiquitinasi, acetilasi-deacetilasi); modificazioni post-traduzionali","Anabolismo e catabolismo; condensazione e idrolisi"]},
{id:"b2a",u:"b2",t:"Cromosomi eucariotici",syl:["Cromosomi lineari; organizzazione minima; DNA centromerico e telomerico"]},
{id:"b2b",u:"b2",t:"Cromatina ed epigenetica",syl:["Nucleosomi, istoni, H1 e fibra di 30 nm; eucromatina ed eterocromatina","Metilazione del DNA; rimodellamento; modificazioni degli istoni (acetilazione); condensine"]},
{id:"b2c",u:"b2",t:"Il genoma umano",syl:["Sequenze singole, famiglie geniche (globine, rRNA), ripetute in tandem (mini e microsatelliti), intersperse (LINE, SINE, retrovirus endogeni); elementi mobili"]},
{id:"b3a",u:"b3",t:"Replicazione del DNA e telomeri",syl:["Meccanismo semiconservativo; origini; forcella; elicasi e topoisomerasi; primasi; DNA polimerasi e correzione; frammenti di Okazaki; ligasi","Telomeri, telomerasi e senescenza replicativa"]},
{id:"b3b",u:"b3",t:"Geni e trascrizione",syl:["Anatomia del gene; geni policistronici e monocistronici; promotori ed elementi in cis","Trascrizione nei procarioti e operone Lac","Livelli di controllo negli eucarioti; RNA polimerasi I, II, III; fattori generali; TATA box; enhancer e silencer; recettori degli ormoni steroidei"]},
{id:"b3c",u:"b3",t:"Maturazione degli RNA",syl:["Capping, poliadenilazione, splicing e splicing alternativo, spliceosoma e snRNA; ribozimi; editing","Stabilità del messaggero, miRNA e RNA interference; maturazione di rRNA e tRNA"]},
{id:"b3d",u:"b3",t:"Traduzione e destino delle proteine",syl:["Aminoacil-tRNA, ribosomi, codice genetico (ridondanza, degenerazione, non ambiguità, universalità); regioni non tradotte; fattori di inizio, allungamento, terminazione","Ripiegamento e chaperon; degradazione proteasomica ubiquitina-dipendente"]},
{id:"b4a",u:"b4",t:"Mutazioni e riparazione del DNA",syl:["Sostituzioni, inserzioni, delezioni; mutazioni geniche e cromosomiche; espansione di ripetizioni","Riparazione del danno su singolo e doppio filamento"]},
{id:"b4b",u:"b4",t:"Mendel e oltre Mendel",syl:["Omozigosi, eterozigosi ed eterozigosi composta; dominanza, recessività; leggi di Mendel","Dominanza incompleta, codominanza, alleli multipli (AB0), pleiotropia, epistasi, associazione e mappe","Penetranza, espressività, caratteri poligenici, imprinting genomico"]},
{id:"b4c",u:"b4",t:"Cromosomi umani e cariotipo",syl:["Diploidia, omologhi, bandeggio","Aneuploidie e poliploidie; traslocazioni, inversioni, delezioni, inserzioni; trisomia 21"]},
{id:"b4d",u:"b4",t:"Alberi genealogici",syl:["Ereditarietà autosomica dominante e recessiva; legata all'X e all'Y; mitocondriale"]},
{id:"b5a",u:"b5",t:"Membrane e trasporto",syl:["Mosaico fluido, glicocalice, asimmetria","Osmosi, diffusione, canali e trasportatori; trasporto attivo, pompe ATPasi e trasportatori ABC","Potenziale di membrana e potenziale d'azione (aspetti biologici)"]},
{id:"b5b",u:"b5",t:"Smistamento delle proteine e nucleo",syl:["Compartimenti e segnali di indirizzamento","Involucro nucleare, nucleolo e condensati, pori e nucleoporine; NLS e NES; importine, esportine, Ran, RanGEF, RanGAP; esempi NfkB e SREBP1"]},
{id:"b5c",u:"b5",t:"Mitocondri ed energetica",syl:["Struttura, genoma mitocondriale","Glicolisi, ciclo di Krebs, catena di trasporto, sintesi di ATP e bilancio","Fusione e fissione; importazione: TOM, TIM, SAM, OXA"]},
{id:"b5d",u:"b5",t:"Perossisomi",syl:["Funzioni biosintetiche, cataboliche e detossificanti; perossine; sindrome di Zellweger"]},
{id:"b5e",u:"b5",t:"Via secretoria",syl:["Reticolo endoplasmatico, SRP, traslocone; glicosilazione, calnexina e calreticulina","Controllo di qualità, UPR, ERAD; fibrosi cistica; Golgi; secrezione costitutiva e regolata"]},
{id:"b5f",u:"b5",t:"Traffico vescicolare, endocitosi, lisosomi e autofagia",syl:["Rivestimenti, NSF, SNAP, SNARE, RAB, fosfoinositidi","Endocitosi (transferrina, LDL, EGF), endosomi, lisosomi e mannosio-6-fosfato, malattie da accumulo, transcitosi, fagocitosi","Macro-, micro- e chaperon-autofagia; mitofagia"]},
{id:"b5g",u:"b5",t:"Citoscheletro",syl:["Microtubuli, GTP, centrosoma, MAP, dineine e chinesine, ciglia e flagelli","Actina, Arp2/3, miosine, distrofina e sarcomero, Rho/Rac/Cdc42, migrazione","Filamenti intermedi, cheratine, lamina nucleare"]},
{id:"b6a",u:"b6",t:"Matrice extracellulare",syl:["Struttura, degradazione, integrine, meccanotrasduzione; fibronectina"]},
{id:"b6b",u:"b6",t:"Adesione e giunzioni",syl:["Caderine e CAM; giunzioni occludenti, aderenti, desmosomi, emidesmosomi, comunicanti"]},
{id:"b6c",u:"b6",t:"Segnalazione e trasduzione del segnale",syl:["Segnalazione per contatto, autocrina, paracrina, endocrina, sinaptica; recettori di membrana e intracellulari; ossido nitrico","Recettori-canale, recettori accoppiati a proteine G, GEF e GAP, secondi messaggeri, desensitizzazione (visione)","Recettori tirosin-chinasici, via Ras-MAP chinasi, oncogeni; insulina ed EGF; fosfoinositidi"]},
{id:"b7a",u:"b7",t:"Ciclo cellulare e suo controllo",syl:["Fasi e checkpoint; cicline e CDK","Punto di restrizione, ciclina D-Cdk4/6, Rb ed E2F, inibitori; p53; proto-oncogeni, oncogeni, oncosoppressori; virus oncogeni"]},
{id:"b7b",u:"b7",t:"Mitosi",syl:["Condensazione, fuso mitotico, NDC80, movimento dei cromosomi","APC/C, securina, separazione dei cromatidi, citodieresi, mitosi asimmetrica"]},
{id:"b7c",u:"b7",t:"Meiosi e gametogenesi",syl:["Crossing over, differenze con la mitosi, cause di aneuploidia; gametogenesi maschile e femminile; cellula staminale"]},
{id:"b7d",u:"b7",t:"Morte cellulare",syl:["Necrosi e apoptosi; vie intrinseca ed estrinseca; caspasi; MOMP, citocromo c, apoptosoma; famiglia BCL2; recettori di morte"]}
];

/* ===== Registro degli esami della piattaforma ===== */
const EXAMS={
 fis:{id:"fis",t:"Fisica",ic:"⚛️",col:"--u2",ready:true,units:FIS_UNITS,topics:FIS_TOPICS,qb:FIS_QB,pt:FIS_PT,
   syl:"https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_FISICA_%20finale%202026.pdf",
   r25:"Al 1° appello 2025 l'hanno superata circa il 10–17% dei candidati (la più difficile delle tre); sui due appelli i promossi sono stati poco più di 11 mila."},
 chi:{id:"chi",t:"Chimica e propedeutica biochimica",short:"Chimica",ic:"🧪",col:"--u5",ready:false,units:CHI_UNITS,topics:CHI_TOPICS,qb:[],pt:[],
   syl:"https://www.mur.gov.it/sites/default/files/2026-06/Syllabus%20Chim.Prop_.Bioch_.%20-%20finale-%202026.pdf",
   r25:"Al 1° appello 2025: Statale di Milano 24%, Pavia 34,7%, Bicocca 30%, Catania 20%. Sui due appelli i promossi sono stati oltre 24 mila.",
   n26:["Unità 1 e 2 del 2025 unite in un modulo da 1 CFU; tolto il capitolo su radioisotopi e radioattività (resta un cenno alla risonanza magnetica nucleare).","Più esempi biomedici: osmolalità, soluzione fisiologica e glucosata, emolisi ed edema; urati e calcoli renali; pH e tamponi del sangue, acidosi e alcalosi; reazioni di Fenton e Haber-Weiss.","Biomolecole ampliate: Maillard e prodotti di Amadori, ormoni steroidei, acidi biliari, vitamina D, NAD⁺/FAD, legame fosfodiestere, deaminazione della citosina, antiossidanti."]},
 bio:{id:"bio",t:"Biologia",ic:"🧬",col:"--ok",ready:false,units:BIO_UNITS,topics:BIO_TOPICS,qb:[],pt:[],
   syl:"https://www.mur.gov.it/sites/default/files/2026-06/Syllabus_BIOLOGIA_%20finale%202026.pdf",
   r25:"Al 1° appello 2025: Statale di Milano 30%, Pavia 42,6%, Bicocca 36%, Catania 33,8%. Sui due appelli i promossi sono stati oltre 21 mila. Temi usciti: traffico di membrana, ciclo cellulare, cromatina, espressione genica, matrice extracellulare, microbiologia.",
   n26:["Più peso alle strutture cellulari (unità 5 sale a 1,75 CFU); la distribuzione delle domande 2025 ha seguito i CFU.","Scompare la parola «cenni»: si chiede più dettaglio (cellula procariotica, metabolismo, trascrizione nei procarioti).","Tolti Darwin e One Health e le basi chimiche già presenti in Chimica; aggiunte le regioni non tradotte dell'mRNA; i virus oncogeni passano all'unità 7."]}
};
const EXORD=["fis","chi","bio"];
