const D = document;
const W = window;
const CHUNK_SIZE = 128 * 1024;
const ButtonSendFile = D.querySelector(".send-file");
const ButtonGetFile = D.querySelector(".get-file");

let FoundServer = require("./udp-client");
const { BrowserWindow } = require('@electron/remote');
const fs = require('fs');
const { OnLineStates, GetFiles } = require("./utils/utils");

let FilesList = [];
let Key = null;// Key for recognition of the sender
let OnLineState = OnLineStates.offLine;

const State = new Proxy(
  { OnLineState: 0 },
  {
    set(target, prop, newValue) {
      target[prop] = newValue;
      return true;
    }
  }
);

async function checkInternet() {
  try {
    await fetch('https://google.com', { method: 'HEAD', cache: 'no-store' });
    State.OnLineState = OnLineStates.onLine;

    if (OnLineState === OnLineStates.connectedToServer) {
      D.querySelectorAll(".no-active")?.forEach(element => {
        element.classList.remove("no-active")
      });
    }
  } catch {
    State.OnLineState = OnLineStates.offLine;

    if (!ButtonGetFile.classList.contains("no-active")) {
      ButtonGetFile.classList.add("no-active")
    }

    if (!ButtonSendFile.classList.contains("no-active")) {
      ButtonSendFile.classList.add("no-active")
    }
  }
}

setInterval(() => {
  checkInternet()
}, 4000);

function ToggleElements(Elements = [], CSSClass = "") {
  if (Elements.length === 0) return;

  Elements.forEach(element => {
    element.classList.toggle(CSSClass);
  });
}
FoundServer((StringForConnect) => {
  socket = io(StringForConnect);
  console.log(StringForConnect)

  socket.on('connect', () => socket.emit('ping'));
  socket.on('disconnect', () => {
    OnLineState = OnLineStates.disconnected;
    ToggleElements([ ButtonGetFile, ButtonSendFile ], "no-active");
  })
  socket.on('pong', (data) => {
    Key = data.key;
    OnLineState = OnLineStates.connectedToServer;
    
    ToggleElements([ ButtonGetFile, ButtonSendFile ], "no-active");
  });

  let TempDir = null;
  ButtonSendFile.onclick = () => {
    FilesList.files.forEach((el) => {
      const stream = fs.createReadStream(el.file.path, {
        highWaterMark: CHUNK_SIZE
      });

      socket.emit("file-start", {
        fileName: el.fileName
      });
      
      stream.on("data", (chunk) => {
        socket.emit("file-chunk", { key: Key, chunk: chunk });
      });
      
      stream.on("end", () => {
        socket.emit("file-end");
      });
      // W.electronAPI.sendFiles({socketServer: socket}, {file: el.file, ext: el.extension, fileName: el.fileName, tempDir: TempDir});

      // socket.emit('upload', {file: el.file, ext: el.extension, fileName: el.fileName, tempDir: TempDir}, (status) => {
      //   if (typeof status === 'string') {
      //     TempDir = tempDir;
      //   }
      //   console.log(status);
      // });
    });
  }

  D.querySelector(".minimize-button").addEventListener("click", () => {
    BrowserWindow.getFocusedWindow().minimize();
  });

  D.querySelector(".maximize-button").addEventListener("click", () => {
    if (BrowserWindow.getFocusedWindow().isMaximized()) {
      BrowserWindow.getFocusedWindow().unmaximize();
    } else {
      BrowserWindow.getFocusedWindow().maximize();
    }
  });
  D.querySelector(".close-button").addEventListener("click", () => {
    BrowserWindow.getFocusedWindow().close();
  });

  D.querySelector("div.file").ondragover = (e) => {
    e.preventDefault();
  };

  D.querySelector("div.file").addEventListener("wheel", (e) => {
    e.preventDefault();
    D.querySelector("div.file").scrollLeft += e.deltaY;
  });

  D.querySelector("div.file").ondrop = (e) => {
    e.preventDefault();

    const Files = D.querySelectorAll(".fileIcon");
    Files.forEach((el) => el.remove());
    document.querySelector("div.text").classList.remove("hide");

    let JSONFormat = GetFiles(e.dataTransfer.files);
    FilesList = JSONFormat;

    if (typeof JSONFormat === "object") {
      document.querySelector("div.text").classList.add("hide");

      JSONFormat.files.forEach((el) => {
        const File = D.createElement("div");
        const FileIcon = D.createElement("img");
        const FileName = D.createElement("span");

        File.className = "fileIcon";
        FileName.className = "spanImage";
        FileName.innerText = el.fileName;

        FileIcon.src = el.iconExt;
        FileIcon.className = "iconExt";

        File.appendChild(FileIcon);
        File.appendChild(FileName);
        D.querySelector("div.file").appendChild(File);
      });
    } else {
    }
  };
});

// window.server.onServerFound((data) => {
//   socket = io(data);

//   socket.on('connect', () => socket.emit('ping'));
//   socket.on('pong', (dataid) => {
//     if (dataid === socket.id) {
//       console.log('Pong ID matches socket ID');
//     }
//   });
  
//   let TempDir = null;
//   ButtonSendFile.onclick = () => {
//     FilesList.files.forEach((el) => {
//       W.electronAPI.sendFiles({socketServer: socket}, {file: el.file, ext: el.extension, fileName: el.fileName, tempDir: TempDir});

//       // socket.emit('upload', {file: el.file, ext: el.extension, fileName: el.fileName, tempDir: TempDir}, (status) => {
//       //   if (typeof status === 'string') {
//       //     TempDir = tempDir;
//       //   }
//       //   console.log(status);
//       // });
//     });
//   }

//   D.querySelector(".minimize-button").addEventListener("click", () => {
//     W.electronAPI.minimizeWindow();
//   });

//   D.querySelector(".maximize-button").addEventListener("click", () => {
//     W.electronAPI.maximizeWindow();
//   });
//   D.querySelector(".close-button").addEventListener("click", () => {
//     W.electronAPI.closeWindow();
//   });

//   D.querySelector("div.file").ondragover = (e) => {
//     e.preventDefault();
//   };

//   D.querySelector("div.file").addEventListener("wheel", (e) => {
//     e.preventDefault();
//     D.querySelector("div.file").scrollLeft += e.deltaY;
//   });

//   D.querySelector("div.file").ondrop = (e) => {
//     e.preventDefault();

//     const Files = D.querySelectorAll(".fileIcon");
//     Files.forEach((el) => el.remove());
//     document.querySelector("div.text").classList.remove("hide");

//     let JSONFormat = GetFiles(e.dataTransfer.files);
//     FilesList = JSONFormat;

//     if (typeof JSONFormat === "object") {
//       document.querySelector("div.text").classList.add("hide");

//       JSONFormat.files.forEach((el) => {
//         const File = D.createElement("div");
//         const FileIcon = D.createElement("img");
//         const FileName = D.createElement("span");

//         File.className = "fileIcon";
//         FileName.className = "spanImage";
//         FileName.innerText = el.fileName;

//         FileIcon.src = el.iconExt;
//         FileIcon.className = "iconExt";

//         File.appendChild(FileIcon);
//         File.appendChild(FileName);
//         D.querySelector("div.file").appendChild(File);
//       });
//     } else {
//     }
//   };
// });


