const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron");
require("@electron/remote/main").initialize();
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const { InfoLogger, ErrorLogger } = require("./utils/logister");

//block doubles ++
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log("Server is already running!")
  app.quit();

  return;
}
//block doubles --

const { CreateTempDir, isDevMode } = require("./utils/utils");
const { CreateHashKey, CheckHashKey } = require("./utils/security");

const LogisterInfo = new InfoLogger();
const LogisterErr = new ErrorLogger();
const StateFile = path.join(app.getPath("userData"), "serverfc-state.temp");
const LockFile = path.join(app.getPath("temp"), "serverfc.lock");

const FLOCK = (fs.existsSync(LockFile)?fs.readFileSync(LockFile, "utf-8"):"");
const FD = fs.openSync(LockFile, 'a');


//if file serverfc-state.temp exists, server was killed
if (fs.existsSync(StateFile) || !FLOCK.endsWith("server was stopped correctly")) LogisterErr.fatal("Сервер був вимкнений аварійно")
  
fs.writeFileSync(FD, JSON.stringify({ pid: process.pid, time: Date.now() }));

//fixing start app
if (!fs.existsSync(StateFile)) fs.writeFileSync(StateFile, "STARTED-" + Date.now())


require("./udp-server");

const net = require('net');

function generateKey() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

const dns = require('node:dns');
const os = require('node:os');

let SystemTray = null;
let mainWindow = null;

const options = { family: 4 };

dns.lookup(os.hostname(), options, (err, addr) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`IPv4 address: ${addr}`);
  }
});


const { Server } = require("socket.io");
const { writeFile } = require("node:fs");

const io = new Server(7896, { 
  maxHttpBufferSize: 20e8,
  connectionStateRecovery: {} //reconnecting and send missed messages
});

io.on("connection", (socket) => {
  LogisterInfo.info("a user connected: " + socket.id)

  socket.on("disconnect", (reason) => {
    LogisterErr.warn("a user leaved: " + socket.id + ". Причина: " + reason);// server shutting down, transport close, 
  });

  socket.on("upload", (info, callback) => {
    let DirName;
    if (info.tempDir == null) {
      DirName = CreateTempDir("/tmp/uploads/tmp" + socket.id) + "/"
      console.log(DirName);
    }
    console.log((info.tempDir == null ? DirName : info.tempDir) + `${info.fileName}`)
    
    fs.writeFile((info.tempDir == null ? DirName : info.tempDir) + `${info.fileName}`, info.file, (err) => {
      callback({ message: err ? err : DirName });
    })
  })

  socket.on("file-chunk", data => {
    if (CheckHashKey(data.key)) {
      console.log(data.chunk)
    }
  })

  socket.on("file-end", () => {
    console.log("fileend")
  })

  socket.on("ping", () => {
    const objectUser = { sockId: socket.id, key: CreateHashKey(socket.id) }
    io.to(socket.id).emit("pong", objectUser);

    LogisterInfo.info("User event ping-pong success")
  })
});

app.whenReady().then(() => {
  LogisterInfo.info("Server started")

    //IF ISDEVMODE comment
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      name: "ServerFC",
      args: [
        "--autostart"
      ]
    })
    //IF ISDEVMODE
    
    app.setAppUserModelId("com.serverfc.app")
  

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    //resizable: false,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
      webviewTag: false,
      devTools: isDevMode(app),
    },
    // width: 800,
    // height: 500,
    icon: path.join(__dirname, "assets/icon.ico"),
  });

  mainWindow.setContentProtection(true);
  mainWindow.loadFile("Window.html");
  mainWindow.hide();

  const iconPath = path.join(
    process.resourcesPath,
    'assets',
    'icon.ico'
  )
  SystemTray = new Tray(isDevMode(app) ? "./assets/icon.ico" : iconPath);

  const SystemContextMenu = Menu.buildFromTemplate([
    {
      label: "Серверна панель",
      click: () => mainWindow.show()
    },
    {
      label: "Закрити панель",
      click: () => mainWindow.hide()
    },
    {
      label: "----------------------------",
      type: "separator",
      click: () => mainWindow.show()
    },
    {
      label: "Зупинити сервер",
      click: () => StopServer()
    }
  ]);

  SystemTray.setToolTip("Server FileCopter");
  SystemTray.setContextMenu(SystemContextMenu);

  SystemTray.on("click", () => SystemTray.popUpContextMenu())
});


function StopServer() {
  mainWindowStop = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preloadPrompt.js"),
      webviewTag: true,
      devTools: true,
    },
    width: 300,
    height: 75,
    icon: path.join(__dirname, "assets/icon.ico"),
  });
  
  mainWindowStop.center();
  mainWindowStop.setContentProtection(true);
  mainWindowStop.loadFile("Prompt.html");
}

app.on("before-quit", () => {
  fs.appendFileSync(FD, "server was stopped correctly");
})

ipcMain.on("quit", () => {
  fs.appendFileSync(FD, "server was stopped correctly");
  LogisterErr.fatal("Server stopted, reason: reloaded PC or user stopted")
  app.quit()
})
ipcMain.on("hide", () => mainWindow.hide())