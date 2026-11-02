'use strict';
const os=require('node:os'),path=require('node:path'),fs=require('node:fs'),http=require('node:http');
const {execFile}=require('node:child_process');
let previous=null;
function cpuSample(){
 const current=os.cpus().map(cpu=>({idle:cpu.times.idle,total:Object.values(cpu.times).reduce((a,b)=>a+b,0)}));
 let threads=[];
 if(previous&&previous.length===current.length)threads=current.map((cpu,i)=>{const total=cpu.total-previous[i].total;return total>0?Math.max(0,Math.min(100,100*(1-(cpu.idle-previous[i].idle)/total))):null;});
 previous=current;const valid=threads.filter(Number.isFinite);
 return {cpuPercent:valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null,threadMaxPercent:valid.length?Math.max(...valid):null};
}
function nvidia(){
 const candidates=[path.join(process.env.SystemRoot||'C:\Windows','System32','nvidia-smi.exe'),path.join(process.env.ProgramFiles||'C:\Program Files','NVIDIA Corporation','NVSMI','nvidia-smi.exe')];
 const executable=candidates.find(file=>fs.existsSync(file));
 if(!executable)return Promise.resolve({gpus:[],note:'nvidia-smi absent : mesures NVIDIA indisponibles.'});
 return new Promise(resolve=>execFile(executable,['--query-gpu=index,name,utilization.gpu,temperature.gpu,memory.used,memory.total,clocks.gr','--format=csv,noheader,nounits'],{windowsHide:true,timeout:4500,maxBuffer:128*1024,encoding:'utf8'},(error,stdout)=>{
 if(error)return resolve({gpus:[],note:'Lecture NVIDIA indisponible ou non prise en charge.'});
 const number=value=>/^[-+]?\d+(\.\d+)?$/.test(value)?Number(value):null;
 const gpus=stdout.trim().split(/\r?\n/).filter(Boolean).map(line=>line.split(',').map(x=>x.trim())).filter(row=>row.length===7).map(row=>({index:row[0],name:row[1],loadPercent:number(row[2]),temperatureC:number(row[3]),memoryUsedMiB:number(row[4]),memoryTotalMiB:number(row[5]),clockMHz:number(row[6]),source:'nvidia-smi'}));
 resolve({gpus,note:gpus.length?null:'Sortie NVIDIA non reconnue.'});
 }));
}
function libre(){
 return new Promise(resolve=>{let done=false;const finish=value=>{if(!done){done=true;resolve(value);}};
 const request=http.get({hostname:'127.0.0.1',port:8085,path:'/data.json',timeout:1500},response=>{
 if(response.statusCode!==200){response.resume();return finish({sensors:[],note:'LibreHardwareMonitor : reponse HTTP non disponible.'});}
 let text='',size=0;response.setEncoding('utf8');
 response.on('data',chunk=>{size+=Buffer.byteLength(chunk);if(size>1048576){response.destroy();finish({sensors:[],note:'Reponse capteurs trop volumineuse.'});}else text+=chunk;});
 response.on('error',()=>finish({sensors:[],note:'Lecture des capteurs interrompue.'}));
 response.on('end',()=>{if(done)return;try{const root=JSON.parse(text),sensors=[];let count=0;
 function walk(node,depth){if(!node||typeof node!=='object'||depth>30||++count>10000)return;
 const id=typeof node.SensorId==='string'?node.SensorId:'';
 if(/^\/(intelcpu|amdcpu|gpu-nvidia|gpu-amd|gpu-intel)\//.test(id)&&['Temperature','Load','Clock'].includes(node.Type)){const raw=String(node.Value??'');const match=raw.replace(',','.').match(/^\s*(-?\d+(?:\.\d+)?)/);if(match)sensors.push({id,name:String(node.Text||id).slice(0,160),type:node.Type,value:Number(match[1]),raw:raw.slice(0,80),source:'LibreHardwareMonitor local'});}
 if(Array.isArray(node.Children))node.Children.forEach(child=>walk(child,depth+1));}
 walk(root,0);finish({sensors,note:sensors.length?'Capteurs externes : fraicheur non verifiee par PC GRAPIST.':'Aucun capteur CPU/GPU compatible retourne.'});
 }catch{finish({sensors:[],note:'Format LibreHardwareMonitor non reconnu.'});}});
 });
 request.on('timeout',()=>request.destroy());request.on('error',()=>finish({sensors:[],note:'LibreHardwareMonitor non joignable sur 127.0.0.1:8085. Activer son serveur local compatible si souhaite.'}));
 });
}
async function sample(useLibre){
 if(process.platform!=='win32')throw new Error('Suivi disponible uniquement sous Windows.');
 const cpu=cpuSample(),total=os.totalmem(),free=os.freemem();
 const [gpu,lhm]=await Promise.all([nvidia(),useLibre?libre():Promise.resolve({sensors:[],note:'Capteurs LibreHardwareMonitor desactives.'})]);
 return {at:Date.now(),...cpu,ramUsedPercent:total?100*(total-free)/total:null,ramTotalGiB:total/1073741824,gpus:gpu.gpus,sensors:lhm.sensors,notes:[gpu.note,lhm.note].filter(Boolean)};
}
module.exports={sample};
