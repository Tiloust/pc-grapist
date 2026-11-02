'use strict';
const { app, BrowserWindow, session, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
let window;
const entry = path.join(__dirname, '..', 'index.html');
const entryURL = pathToFileURL(entry).href;
function createWindow() {
  window = new BrowserWindow({
    width: 1180, height: 850, minWidth: 620, minHeight: 500,
    title: 'PC GRAPIST', backgroundColor: '#11141c',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== entryURL) event.preventDefault();
  });
  window.webContents.on('will-attach-webview', event => event.preventDefault());
  window.loadFile(entry).catch(error => dialog.showErrorBox('PC GRAPIST', error.message));
  window.on('closed', () => { window = null; });
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
