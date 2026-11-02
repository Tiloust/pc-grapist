'use strict';
const { app, BrowserWindow, session, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { scanHardware } = require('./scan.cjs');
const { sample } = require('./telemetry.cjs');
const pages = { hardware: path.join(__dirname, 'hardware.html'), performance: path.join(__dirname, 'performance.html'), manual: path.join(__dirname, '..', 'index.html') };
const urls = Object.fromEntries(Object.entries(pages).map(([key,file]) => [key,pathToFileURL(file).href]));
const allowed = new Set(Object.values(urls));
const sources = Object.freeze({nvidia:'https://www.nvidia.com/Download/index.aspx',amd:'https://www.amd.com/en/support',intel:'https://www.intel.com/content/www/us/en/download-center/home.html',windows:'https://support.microsoft.com/windows',lhm:'https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases'});
let window, scanning=false, sampling=false, nextSample=0;
function trusted(event, performanceOnly=false){
 return window && event.sender===window.webContents && event.senderFrame===window.webContents.mainFrame && (performanceOnly ? event.senderFrame.url===urls.performance : [urls.hardware,urls.performance].includes(event.senderFrame.url));
}
function showPage(name){if(window)window.loadFile(pages[name]).catch(error=>dialog.showErrorBox('PC GRAPIST',error.message));}
function createWindow(){
 window=new BrowserWindow({width:1180,height:850,minWidth:620,minHeight:500,title:'PC GRAPIST',backgroundColor:'#11141c',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:false}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 window.webContents.on('will-navigate',(event,url)=>{if(!allowed.has(url))event.preventDefault();});
 window.webContents.on('will-attach-webview',event=>event.preventDefault());
 window.on('closed',()=>{window=null;});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'PC GRAPIST',submenu:[{label:'Jeux et performances',click:()=>showPage('performance')},{label:'Inventaire materiel',click:()=>showPage('hardware')},{label:'Saisie manuelle et objectifs',click:()=>showPage('manual')},{type:'separator'},{role:'quit',label:'Quitter'}]},{label:'Affichage',submenu:[{role:'reload',label:'Recharger'},{role:'toggleDevTools',label:'Outils de developpement'}]}]));
 showPage('performance');
}
ipcMain.handle('hardware:scan',async event=>{if(!trusted(event))throw new Error('Origine non autorisee.');if(scanning)throw new Error('Scan deja en cours.');scanning=true;try{return await scanHardware();}finally{scanning=false;}});
ipcMain.handle('hardware:source',async(event,id)=>{if(!trusted(event)||typeof id!=='string'||!Object.hasOwn(sources,id))throw new Error('Source non autorisee.');await shell.openExternal(sources[id]);});
ipcMain.handle('performance:sample',async(event,lhm)=>{
 if(!trusted(event,true)||typeof lhm!=='boolean')throw new Error('Requete non autorisee.');
 if(sampling||Date.now()<nextSample)throw new Error('Mesure deja en cours ou trop rapprochee.');
 sampling=true;nextSample=Date.now()+2500;try{return await sample(lhm);}finally{sampling=false;}
});
app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((_c,_p,callback)=>callback(false));session.defaultSession.setPermissionCheckHandler(()=>false);createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
