'use strict';
const api=window.pcHardware,form=document.querySelector('#profile'),fields=document.querySelector('#fields'),start=document.querySelector('#start'),stop=document.querySelector('#stop'),exportButton=document.querySelector('#export'),status=document.querySelector('#status'),live=document.querySelector('#live'),cards=document.querySelector('#cards');
let running=false,generation=0,timer=null,samples=[],context=null;
function draw(){cards.replaceChildren(...PCAdvisor.advise(context,samples).map(item=>{const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=item.title;p.textContent=item.detail;article.append(h,p);return article;}));}
function end(){running=false;generation++;clearTimeout(timer);fields.disabled=false;start.disabled=!api;stop.disabled=true;exportButton.disabled=!samples.length;if(context)draw();}
function value(number,unit){return Number.isFinite(number)?number.toFixed(1)+' '+unit:'Indisponible';}
async function tick(token){
 if(!running||token!==generation)return;
 try{const sample=await api.sample(context.lhm);if(!running||token!==generation)return;samples.push(sample);
 const lines=['CPU global : '+value(sample.cpuPercent,'%'),'Processeur logique le plus sollicite : '+value(sample.threadMaxPercent,'%'),'RAM utilisee : '+value(sample.ramUsedPercent,'%')+' / '+value(sample.ramTotalGiB,'Gio')];
 for(const gpu of sample.gpus)lines.push(gpu.name+' | charge '+value(gpu.loadPercent,'%')+' | temperature '+value(gpu.temperatureC,'°C')+' | VRAM '+value(gpu.memoryUsedMiB,'MiB')+' / '+value(gpu.memoryTotalMiB,'MiB')+' | frequence '+value(gpu.clockMHz,'MHz'));
 if(!sample.gpus.length)lines.push('GPU NVIDIA : donnees indisponibles.');
 for(const sensor of sample.sensors)lines.push(sensor.id+' · '+sensor.name+' : '+sensor.raw+' [LibreHardwareMonitor]');
 lines.push(...sample.notes);live.textContent=lines.join('\n');status.textContent=samples.length+' mesures en memoire. Joue dans la scene choisie puis reviens arreter la session.';
 if(samples.length>=600){end();status.textContent='Limite de 600 mesures atteinte ; capture arretee.';return;}
 }catch(error){if(!running||token!==generation)return;end();status.textContent='Capture arretee : '+error.message;return;}
 if(running&&token===generation)timer=setTimeout(()=>tick(token),3000);
}
form.addEventListener('submit',event=>{event.preventDefault();if(!api||running)return;const data=new FormData(form);context={game:data.get('game'),genre:data.get('genre'),problem:data.get('problem'),settings:data.get('settings'),target:Number(data.get('target')),observed:data.get('observed')?Number(data.get('observed')):null,budget:Number(data.get('budget')),inGame:data.has('inGame'),capped:data.has('capped'),lhm:data.has('lhm')};samples=[];running=true;generation++;fields.disabled=true;start.disabled=true;stop.disabled=false;exportButton.disabled=true;cards.textContent='Session en cours : aucune recommandation materielle avant son arret.';tick(generation);});
stop.addEventListener('click',()=>{end();status.textContent='Session arretee. Le rapport utilise les mesures disponibles et tes declarations.';});
window.addEventListener('beforeunload',()=>{running=false;generation++;clearTimeout(timer);});
exportButton.addEventListener('click',()=>{if(!context||!samples.length)return;const payload={schemaVersion:1,exportedAt:new Date().toISOString(),context,samples,advice:PCAdvisor.advise(context,samples)},url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='pc-grapist-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
document.querySelector('#lhm-link').addEventListener('click',async()=>{try{await api.openSource('lhm');}catch(error){status.textContent=error.message;}});
if(!api){start.disabled=true;document.querySelector('#lhm-link').disabled=true;status.textContent='Lancer cette page dans l’application avec npm.cmd start.';}
