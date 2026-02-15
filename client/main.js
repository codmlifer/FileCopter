const { app, BrowserWindow, ipcMain } = require("electron");
const window = require("electron").BrowserWindow;
require("@electron/remote/main").initialize();
const path = require("path");
const fs = require("fs");

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      devTools: true,
    },
    icon: path.join(__dirname, "assets/icon.ico"),
  });
  mainWindow.maximize();
  mainWindow.setContentProtection(true);
  require("@electron/remote/main").enable(mainWindow.webContents);
  mainWindow.loadFile("index.html");

  //write check dev mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}
app.whenReady().then(() => {
  createWindow();
  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});