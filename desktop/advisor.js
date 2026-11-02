(function(root){
'use strict';
function advise(context,samples){
 const advice=[];const add=(title,detail)=>advice.push({title,detail});
 const profile={competitive:'Competitif : comparer la regularite des images et la latence, pas seulement les FPS moyens.',aaa:'AAA : comparer d’abord resolution, textures, ray tracing et upscaling, un reglage a la fois.',simulation:'Simulation/strategie : reproduire une scene chargee en unites, trafic ou physique ; ne pas classer le PC sur une scene vide.',mixed:'Usage varie : mesurer chaque jeu separement ; une recommandation unique ne convient pas forcement a tous.'};
 add('Profil de jeu',profile[context.genre]||profile.mixed);
 if(context.problem==='stutter')add('Saccades : mesure complementaire necessaire','Cette capture lente ne mesure pas les temps de rendu. Une capture PresentMon/CapFrameX sera necessaire pour relier les saccades aux images.');
 if(context.problem==='heat')add('Chauffe : verifier avant de remplacer','Comparer chaque capteur exact a la limite du modele fabricant. Une temperature seule ne prouve pas un throttling ; verifier aussi frequences et indicateurs de limitation.');
 if(context.problem==='crash')add('Crash : ne pas acheter sur cette seule base','Conserver le message et les journaux Windows. Les pourcentages CPU/GPU seuls ne permettent pas de diagnostiquer une panne.');
 if(!context.inGame){add('Aucune recommandation materielle issue de la session','Session non declaree en jeu. Les mesures de bureau ne permettent pas de choisir un upgrade gaming.');return advice;}
 const valid=samples.filter(s=>s&&Number.isFinite(s.at));
 if(valid.length<10||valid[valid.length-1].at-valid[0].at<30000){add('Session trop courte','Recueillir au moins 10 mesures sur 30 secondes de jeu actif dans une scene reproductible.');return advice;}
 const fraction=(predicate,selector)=>{const values=valid.map(selector).filter(Number.isFinite);return values.length>=10?values.filter(predicate).length/values.length:0;};
 if(fraction(v=>v>=90,s=>s.ramUsedPercent)>=0.7)add('Memoire : piste a verifier en priorite','RAM utilisee a au moins 90 % dans au moins 70 % des mesures valides (seuil exploratoire). Fermer les applications annexes et refaire le test. Envisager plus de RAM seulement si une pression memoire et des acces de pagination sont confirmes.');
 const below=Number.isFinite(context.observed)&&context.observed>0&&Number.isFinite(context.target)&&context.observed<context.target;
 if(!below)add('Objectif FPS non documente comme manque','Renseigner des FPS observes pendant cette session et un objectif superieur pour evaluer une piste d’upgrade. Les FPS ne sont pas mesures automatiquement.');
 if(context.capped)add('Limite de FPS declaree','Une limite/VSync peut reduire la charge sans manque de puissance. Aucune priorite CPU/GPU deduite ici.');
 if(below&&!context.capped){
 const ids=new Set(valid.flatMap(s=>(s.gpus||[]).map(g=>g.index+'|'+g.name)));
 if(ids.size!==1)add('GPU : attribution insuffisante','Pas de GPU NVIDIA unique avec mesures exploitables. Les capteurs externes restent visibles, mais ne sont pas automatiquement attribues au jeu pour recommander un achat.');
 else{const id=[...ids][0],gpu=s=>(s.gpus||[]).find(g=>g.index+'|'+g.name===id);
 const high=fraction(v=>v>=95,s=>gpu(s)?.loadPercent);
 if(high>=0.7)add('Carte graphique : candidate a comparer','Charge NVIDIA au moins 95 % dans au moins 70 % des mesures valides avec FPS declares sous l’objectif. Hypothese, pas preuve : reduire la resolution ou les effets GPU et comparer la meme scene avant d’envisager une carte plus rapide.');
 const cpuBusy=fraction(v=>v>=90,s=>s.threadMaxPercent);
 const gpuLow=fraction(v=>v<85,s=>gpu(s)?.loadPercent);
 if(cpuBusy>=0.7&&gpuLow>=0.7)add('Processeur / logiciel : piste a tester','Un processeur logique est souvent tres sollicite alors que la charge NVIDIA reste plus basse. Cela ne prouve pas une limite CPU : verifier jeu, taches annexes, frequences et limites d’alimentation. Un changement de CPU n’est qu’une option apres confirmation et verification carte mere/BIOS.');
 }
 }
 add(Number(context.budget)===0?'Pas d’achat dans le budget declare':'Avant tout achat','Aucun modele ni prix recommande dans cette version : compatibilite, benchmarks du jeu et cout total de plateforme non verifies. Les seuils ci-dessus sont des heuristiques, pas des seuils constructeur.');
 return advice;
}
if(typeof module==='object'&&module.exports)module.exports={advise};else root.PCAdvisor={advise};
})(typeof window==='object'?window:globalThis);
