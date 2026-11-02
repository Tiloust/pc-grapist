'use strict';
const { app, BrowserWindow, session, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { scanHardware } = require('./scan.cjs');
const pages = { hardware: path.join(__dirname, 'hardware.html'), manual: path.join(__dirname, '..', 'index.html') };
const allowed = new Set(Object.values(pages).map(file => pathToFileURL(file).href));
const hardwareURL = pathToFileURL(pages.hardware).href;
const sources = Object.freeze({
  nvidia: 'https://www.nvidia.com/Download/index.aspx',
  amd: 'https://www.amd.com/en/support',
  intel: 'https://www.intel.com/content/www/us/en/download-center/home.html',
  windows: 'https://support.microsoft.com/windows'
});
let window, scanning = false;
function trusted(event) {
  return window && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame && event.senderFrame.url === hardwareURL;
}
function showPage(name) {
  if (window) window.loadFile(pages[name]).catch(error => dialog.showErrorBox('PC GRAPIST', error.message));
}
function createWindow() {
  window = new BrowserWindow({
    width: 1180, height: 850, minWidth: 620, minHeight: 500,
    title: 'PC GRAPIST', backgroundColor: '#11141c',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (!allowed.has(url)) event.preventDefault(); });
  window.webContents.on('will-attach-webview', event => event.preventDefault());
  window.on('closed', () => { window = null; });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'PC GRAPIST', submenu: [
      { label: 'Analyser mon PC', click: () => showPage('hardware') },
      { label: 'Saisie manuelle et objectifs', click: () => showPage('manual') },
      { type: 'separator' }, { role: 'quit', label: 'Quitter' }
    ] },
    { label: 'Affichage', submenu: [{ role: 'reload', label: 'Recharger' }, { role: 'toggleDevTools', label: 'Outils de developpement' }] }
  ]));
  showPage('hardware');
}
ipcMain.handle('hardware:scan', async event => {
  if (!trusted(event)) throw new Error('Origine non autorisee.');
  if (scanning) throw new Error('Un scan est deja en cours.');
  scanning = true;
  try { return await scanHardware(); } finally { scanning = false; }
});
ipcMain.handle('hardware:source', async (event, id) => {
  if (!trusted(event) || typeof id !== 'string' || !Object.hasOwn(sources, id)) throw new Error('Source non autorisee.');
  await shell.openExternal(sources[id]);
});
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
