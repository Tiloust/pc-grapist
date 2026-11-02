(function(root){
'use strict';
const rows=(inventory,key)=>Array.isArray(inventory?.[key])?inventory[key]:[];
const names=(inventory,key)=>rows(inventory,key).map(x=>x.Name||x.Model||x.Product).filter(Boolean).join(', ');
function advise(context,samples,inventory=null){
 const advice=[],add=(title,detail)=>advice.push({title,detail});
 if(inventory)add('Configuration associee','CPU : '+(names(inventory,'cpu')||'inconnu')+' ; GPU : '+(names(inventory,'gpu')||'inconnu')+'. Inventaire Windows, pas validation des performances ou de la compatibilite.');
 else add('Inventaire manquant','Les mesures ne sont pas reliees a une configuration verifiee. Aucun achat ne peut etre valide.');
 const profiles={competitive:'Comparer regularite des images et latence pour le jeu competitif.',aaa:'Comparer resolution, textures, ray tracing et upscaling, un reglage a la fois.',simulation:'Reproduire une scene chargee en unites, trafic ou physique.',mixed:'Mesurer chaque jeu separement.'};
 add('Profil de jeu',profiles[context.genre]||profiles.mixed);
 if(context.problem==='stutter')add('Saccades : mesure complementaire necessaire','Les temps de rendu ne sont pas captures ici. Les mesures espacees de plusieurs secondes ne suffisent pas pour expliquer une saccade.');
 if(context.problem==='heat')add('Chauffe : verifier avant de remplacer','Comparer chaque capteur exact a la limite du modele fabricant. Verifier frequences et indicateurs de limitation ; la temperature seule ne prouve pas un throttling.');
 if(context.problem==='crash')add('Crash : ne pas acheter sur cette seule base','Recueillir message et journaux Windows. Les charges CPU/GPU ne diagnostiquent pas une panne.');
 if(!context.inGame){add('Aucune recommandation materielle issue de la session','Session non declaree en jeu.');return advice;}
 const valid=samples.filter(s=>s&&Number.isFinite(s.at)).slice().sort((a,b)=>a.at-b.at);
 if(valid.length<10||valid[valid.length-1].at-valid[0].at<30000){add('Session trop courte','Recueillir au moins 10 mesures sur 30 secondes de jeu actif.');return advice;}
 function sustained(selector,predicate){const values=valid.map(selector).filter(v=>v!==null&&v!==undefined);return values.length>=10&&values.length/valid.length>=0.8&&values.filter(predicate).length/values.length>=0.7;}
 if(sustained(s=>Number.isFinite(s.ramUsedPercent)?s.ramUsedPercent:null,v=>v>=90))add('Memoire : piste a verifier en priorite','Au moins 90 % de RAM utilisee dans au moins 70 % des mesures valides, couverture minimale 80 %. Seuil exploratoire : fermer les applications annexes et confirmer pression memoire/pagination avant un achat.');
 const below=Number.isFinite(context.observed)&&context.observed>0&&Number.isFinite(context.target)&&context.observed<context.target;
 if(!below)add('Objectif FPS non documente comme manque','FPS observes a renseigner pour cette session. Ils restent declares, pas mesures.');
 if(context.capped)add('Limite de FPS declaree','Aucune priorite CPU/GPU deduite avec limite FPS ou VSync declaree.');
 if(below&&!context.capped){
 const ids=new Set(valid.flatMap(s=>(s.gpus||[]).map(g=>g.index+'|'+g.name)));
 if(ids.size!==1)add('GPU : attribution insuffisante','Pas de GPU NVIDIA unique exploitable ; pas de choix automatique du GPU utilise par le jeu.');
 else{const id=[...ids][0],gpu=s=>(s.gpus||[]).find(g=>g.index+'|'+g.name===id);
 if(sustained(s=>Number.isFinite(gpu(s)?.loadPercent)?gpu(s).loadPercent:null,v=>v>=95))add('Carte graphique : candidate a comparer','Charge NVIDIA au moins 95 % dans au moins 70 % des mesures valides, couverture minimale 80 %, FPS declares sous objectif. Reduire les effets GPU ou la resolution et refaire la meme scene avant achat.');
 if(sustained(s=>Number.isFinite(s.threadMaxPercent)&&Number.isFinite(gpu(s)?.loadPercent)?{cpu:s.threadMaxPercent,gpu:gpu(s).loadPercent}:null,v=>v.cpu>=90&&v.gpu<85))add('Processeur / logiciel : piste a tester','Dans les MEMES mesures, processeur logique le plus sollicite au moins 90 % et charge NVIDIA sous 85 %, dans au moins 70 % des paires valides. Verifier logiciel, frequences et alimentation avant de conclure a un CPU insuffisant. Le processeur logique le plus sollicite peut changer entre les mesures.');
 }
 }
 add(Number(context.budget)===0?'Pas d’achat dans le budget declare':'Avant tout achat','Aucun modele ni prix recommande. Compatibilite, benchmarks du jeu, alimentation, dimensions et cout total restent a verifier. Les seuils sont heuristiques.');
 return advice;
}
function buildDossier(context,samples,inventory=null,session={}){
 const has=(key,property)=>rows(inventory,key).some(row=>row&&row[property]);
 const coverage=[
 {item:'Modele CPU',state:has('cpu','Name')?'detected':'missing'},
 {item:'Modele GPU',state:has('gpu','Name')?'detected':'missing'},
 {item:'Carte mere',state:has('board','Product')?'detected':'missing'},
 {item:'BIOS installe',state:has('bios','SMBIOSBIOSVersion')?'detected':'missing'},
 {item:'Barrettes RAM',state:rows(inventory,'ram').length?'detected':'missing'},
 {item:'Alimentation',state:context.manualHardware?.psu?.trim()?'declared':'missing'},
 {item:'Boitier et place disponible',state:context.manualHardware?.case?.trim()?'declared':'missing'},
 {item:'FPS observes',state:Number.isFinite(context.observed)&&context.observed>0?'declared':'missing'},
 {item:'FPS et temps de rendu automatiques',state:'not_implemented'},
 {item:'Processus du jeu et GPU actif',state:'not_verified'},
 {item:'Compatibilite d’un achat',state:'not_verified'}
 ];
 return {schemaVersion:2,exportedAt:new Date().toISOString(),session:{...session,sampleCount:samples.length},inventory,context,samples,coverage,canValidatePurchase:false,advice:advise(context,samples,inventory),limitations:['Mesures globales, non attribuees au jeu.','Aucune conclusion de panne ou de compatibilite.','Temperatures externes : fraicheur non certifiee.','Donnees manquantes distinctes des valeurs nulles ou de zero.']};
}
if(typeof module==='object'&&module.exports)module.exports={advise,buildDossier};else root.PCAdvisor={advise,buildDossier};
})(typeof window==='object'?window:globalThis);
