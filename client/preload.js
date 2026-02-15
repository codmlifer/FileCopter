//const { contextBridge, ipcRenderer } = require("electron");



const fs = require("fs");
const net = require('net');
const path = require('path');

const D = document;

// contextBridge.exposeInMainWorld("electronAPI", {
//   minimizeWindow: () => ipcRenderer.send("minimize-window"),
//   maximizeWindow: () => ipcRenderer.send("maximize-window"),
//   closeWindow: () => ipcRenderer.send("close-window"),
//   sendFile: (data) => ipcRenderer.invoke('start-send', data),
//   receiveFile: () => ipcRenderer.invoke('start-receive'),
//   sendFiles: (socket, data) => sendFiles(socket, data)
// });

function sendFiles(socket, data) {
  console.log(socket.socketServer)
  socket.socketServer.emit('upload', data, (status) => {
    if (typeof status === 'string') {
      TempDir = tempDir;
    }
    console.log(status);
  });
}

// contextBridge.exposeInMainWorld('server', {
//   onServerFound: (callback) => {
//     ipcRenderer.on('server-string', (_, data) => {
//       callback(data);
//     });
//   }
// });

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

});
