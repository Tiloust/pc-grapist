'use strict';
const api=window.pcHardware,form=document.querySelector('#profile'),fields=document.querySelector('#fields'),start=document.querySelector('#start'),stop=document.querySelector('#stop'),exportButton=document.querySelector('#export'),status=document.querySelector('#status'),live=document.querySelector('#live'),cards=document.querySelector('#cards');
let running=false,loading=false,generation=0,timer=null,samples=[],context=null,inventory=null,sessionInventory=null,session={};
const hardwareSection=document.createElement('section'),heading=document.createElement('h2'),scanButton=document.createElement('button'),inventoryText=document.createElement('p'),coverageList=document.createElement('ul');
heading.textContent='Dossier materiel et session';scanButton.type='button';scanButton.textContent='Lire / actualiser mon materiel';inventoryText.textContent='Aucun inventaire associe. Au demarrage d’une session, une lecture Windows sera tentee automatiquement. Un nouveau scan ne modifie pas une session deja terminee.';
hardwareSection.append(heading,scanButton,inventoryText,coverageList);form.before(hardwareSection);
const manual=document.createElement('div');manual.className='grid';
for(const [name,label,placeholder] of [['psu','Alimentation (facultatif)','Marque, modele, puissance, connecteurs'],['case','Boitier / place disponible (facultatif)','Modele, longueur GPU disponible, contraintes']]){const element=document.createElement('label'),input=document.createElement('input');element.textContent=label;input.name=name;input.maxLength=500;input.placeholder=placeholder;element.append(input);manual.append(element);}fields.append(manual);
const notice=document.createElement('p');notice.textContent='L’autorisation de collecte inclut l’inventaire Windows. Le rapport et son export associent ce materiel aux objectifs et mesures. Aucun resultat n’est envoye a un serveur.';fields.append(notice);
function buttons(){start.disabled=!api||running||loading;scanButton.disabled=!api||running||loading;stop.disabled=!running;exportButton.disabled=running||loading||!context;document.querySelector('#lhm-link').disabled=!api;}
function dossier(){return PCAdvisor.buildDossier(context,samples,sessionInventory,session);}
function draw(){if(!context)return;const report=dossier();cards.replaceChildren(...report.advice.map(item=>{const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=item.title;p.textContent=item.detail;article.append(h,p);return article;}));const states={detected:'detecte',declared:'declare, non verifie',missing:'manquant',not_verified:'non verifie',not_implemented:'non implemente'};coverageList.replaceChildren(...report.coverage.map(item=>{const li=document.createElement('li');li.textContent=item.item+' : '+states[item.state];return li;}));}
function describeInventory(data){const names=key=>(data?.[key]||[]).map(row=>row.Name||row.Product||row.Model).filter(Boolean).join(', ');inventoryText.textContent=data?'Inventaire '+(data.scannedAt||'sans date')+' — CPU : '+(names('cpu')||'inconnu')+' ; GPU : '+(names('gpu')||'inconnu')+' ; carte mere : '+(names('board')||'inconnue')+'. '+(data.warnings?.length||0)+' lecture(s) incomplete(s).':'Inventaire absent : le rapport indiquera les informations manquantes.';}
async function readInventory(){loading=true;buttons();status.textContent='Lecture de l’inventaire Windows…';try{inventory=await api.scan();describeInventory(inventory);return inventory;}catch(error){inventory=null;describeInventory(null);status.textContent='Inventaire indisponible : '+error.message;return null;}finally{loading=false;buttons();}}
scanButton.addEventListener('click',async()=>{if(!api||running||loading)return;if(!form.elements.consent.checked){status.textContent='Cocher d’abord l’autorisation de collecte locale.';return;}const result=await readInventory();if(result)status.textContent='Inventaire pret pour la prochaine session.';});
function end(reason='user'){running=false;generation++;clearTimeout(timer);fields.disabled=false;session.endedAt=new Date().toISOString();session.stopReason=reason;buttons();draw();}
function value(number,unit){return Number.isFinite(number)?number.toFixed(1)+' '+unit:'Indisponible';}
async function tick(token){
 if(!running||token!==generation)return;
 try{let sample=await api.sample(context.lhm);if(!running||token!==generation)return;
 if(!samples.length)sample={...sample,cpuPercent:null,threadMaxPercent:null,notes:[...(sample.notes||[]),'Premier intervalle CPU ignore : reference de debut de session.']};
 samples.push(sample);const lines=['CPU global : '+value(sample.cpuPercent,'%'),'Processeur logique le plus sollicite : '+value(sample.threadMaxPercent,'%'),'RAM utilisee : '+value(sample.ramUsedPercent,'%')+' / '+value(sample.ramTotalGiB,'Gio')];
 for(const gpu of sample.gpus||[])lines.push(gpu.name+' | charge '+value(gpu.loadPercent,'%')+' | temperature '+value(gpu.temperatureC,'°C')+' | VRAM '+value(gpu.memoryUsedMiB,'MiB')+' / '+value(gpu.memoryTotalMiB,'MiB')+' | frequence '+value(gpu.clockMHz,'MHz'));
 if(!sample.gpus?.length)lines.push('GPU NVIDIA : donnees indisponibles.');
 for(const sensor of sample.sensors||[])lines.push(sensor.id+' · '+sensor.name+' : '+sensor.raw+' [LibreHardwareMonitor]');
 lines.push(...sample.notes||[]);live.textContent=lines.join('\n');status.textContent=samples.length+' mesures. Inventaire fige pour cette session. Revenir arreter apres le test en jeu.';
 if(samples.length>=600){end('limit');status.textContent='Limite de 600 mesures atteinte.';return;}
 }catch(error){if(!running||token!==generation)return;end('error');status.textContent='Capture arretee : '+error.message;return;}
 if(running&&token===generation)timer=setTimeout(()=>tick(token),3000);
}
form.addEventListener('submit',async event=>{event.preventDefault();if(!api||running||loading)return;
 if(context&&!window.confirm('Demarrer un nouveau dossier ? Exporter le precedent avant si necessaire.'))return;
 const data=new FormData(form);const nextContext={game:data.get('game'),genre:data.get('genre'),problem:data.get('problem'),settings:data.get('settings'),target:Number(data.get('target')),observed:data.get('observed')?Number(data.get('observed')):null,budget:Number(data.get('budget')),inGame:data.has('inGame'),capped:data.has('capped'),lhm:data.has('lhm'),manualHardware:{psu:String(data.get('psu')||''),case:String(data.get('case')||'')}};
 fields.disabled=true;await readInventory();
 context=nextContext;sessionInventory=inventory?structuredClone(inventory):null;samples=[];session={startedAt:new Date().toISOString(),inventoryScannedAt:sessionInventory?.scannedAt||null};running=true;generation++;buttons();live.textContent='Premiere mesure en cours…';coverageList.replaceChildren();cards.textContent='Session en cours : analyse a l’arret.';tick(generation);
});
stop.addEventListener('click',()=>{end();status.textContent='Session arretee. Rapport lie au materiel detecte lors du demarrage.';});
window.addEventListener('beforeunload',()=>{running=false;generation++;clearTimeout(timer);});
exportButton.textContent='Exporter le dossier complet JSON';exportButton.addEventListener('click',()=>{if(!context||running)return;const url=URL.createObjectURL(new Blob([JSON.stringify(dossier(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='pc-grapist-dossier.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
document.querySelector('#lhm-link').addEventListener('click',async()=>{try{await api.openSource('lhm');}catch(error){status.textContent=error.message;}});
if(!api)status.textContent='Lancer cette page dans l’application avec npm.cmd start.';buttons();
