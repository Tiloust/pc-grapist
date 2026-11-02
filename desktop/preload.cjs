'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pcHardware', Object.freeze({
  scan: () => ipcRenderer.invoke('hardware:scan'),
  openSource: id => ipcRenderer.invoke('hardware:source', id)
}));
