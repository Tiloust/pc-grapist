'use strict';
const api = window.pcHardware;
const scan = document.querySelector('#scan'), consent = document.querySelector('#consent'), status = document.querySelector('#status'), exportButton = document.querySelector('#export'), results = document.querySelector('#results');
let inventory = null, busy = false;
const labels = {Name:'Modèle',Manufacturer:'Fabricant',NumberOfCores:'Cœurs',NumberOfLogicalProcessors:'Processeurs logiques',MaxClockSpeed:'Fréquence max déclarée (MHz)',DriverVersion:'Version pilote Windows',VideoProcessor:'Processeur vidéo',ConfigManagerErrorCode:'Code périphérique Windows',PartNumber:'Référence',Capacity:'Capacité',Speed:'Vitesse déclarée',ConfiguredClockSpeed:'Vitesse configurée',Product:'Produit',Version:'Version',SMBIOSBIOSVersion:'Version BIOS',Model:'Modèle',Size:'Capacité',InterfaceType:'Interface déclarée',MediaType:'Type déclaré',TotalPhysicalMemory:'RAM totale',Caption:'Système',BuildNumber:'Build Windows',OSArchitecture:'Architecture',DeviceName:'Périphérique',DeviceClass:'Classe',DriverProviderName:'Fournisseur pilote',IsSigned:'Signature déclarée',DriverDate:'Date fabricant'};
function updateButton(){scan.disabled=!api||!consent.checked||busy;}
consent.addEventListener('change',updateButton);
function display(value,key){
 if(value===null||value===undefined||value==='')return 'Non disponible';
 if(typeof value==='boolean')return value?'Oui':'Non';
 if(['Capacity','Size','TotalPhysicalMemory'].includes(key)&&Number.isFinite(Number(value)))return (Number(value)/1073741824).toFixed(1)+' Gio';
 return String(value);
}
function addSection(title,rows){
 const section=document.createElement('section'),heading=document.createElement('h2');heading.textContent=title;section.append(heading);
 if(!Array.isArray(rows)||!rows.length){const p=document.createElement('p');p.textContent='Aucune donnée retournée. Cela ne prouve pas l’absence du composant.';section.append(p);}
 else{const keys=Object.keys(rows[0]);const container=document.createElement('div');container.className='scroll';const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
 keys.forEach(key=>{const th=document.createElement('th');th.scope='col';th.textContent=labels[key]||key;tr.append(th);});head.append(tr);table.append(head);const body=document.createElement('tbody');
 rows.forEach(row=>{const line=document.createElement('tr');keys.forEach(key=>{const cell=document.createElement('td');cell.textContent=display(row[key],key);line.append(cell);});body.append(line);});table.append(body);container.append(table);section.append(container);}
 results.append(section);
}
scan.addEventListener('click',async()=>{
 if(!api||!consent.checked||busy)return;busy=true;inventory=null;exportButton.disabled=true;updateButton();results.replaceChildren();status.textContent='Lecture Windows en cours… délai maximal : 90 secondes.';
 try{const data=await api.scan();inventory=data;
 for(const [key,title] of [['system','PC'],['os','Windows'],['cpu','Processeur'],['gpu','Cartes graphiques'],['ram','Barrettes de RAM'],['board','Carte mère'],['bios','BIOS installé'],['disks','Disques'],['drivers','Pilotes installés — mises à jour non vérifiées']])addSection(title,data[key]);
 const warnings=Array.isArray(data.warnings)?data.warnings:[];if(warnings.length){const section=document.createElement('section'),h=document.createElement('h2');h.textContent='Lectures incomplètes';section.append(h);warnings.forEach(text=>{const p=document.createElement('p');p.className='notice';p.textContent=text;section.append(p);});results.prepend(section);}
 status.textContent='Inventaire terminé'+(warnings.length?' avec lectures incomplètes.':'.')+' Vérification des mises à jour non effectuée.';exportButton.disabled=false;
 }catch(error){status.textContent='Scan impossible : '+error.message;}finally{busy=false;updateButton();}
});
exportButton.addEventListener('click',()=>{if(!inventory)return;const url=URL.createObjectURL(new Blob([JSON.stringify(inventory,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='pc-grapist-inventaire.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
document.querySelectorAll('[data-source]').forEach(button=>{button.disabled=!api;button.addEventListener('click',async()=>{try{await api.openSource(button.dataset.source);}catch(error){status.textContent='Ouverture impossible : '+error.message;}});});
if(!api)status.textContent='La détection fonctionne dans l’application Electron, pas en ouvrant cette page dans un navigateur. Lance npm.cmd start dans le dossier du projet.';
updateButton();
