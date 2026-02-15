const remote = require("electron").remote;
const { ipcRenderer } = require("electron");

const PromptCustomDialog = document.createElement("div")
const PromptCustomDialogButtonOK = document.createElement("button")
const PromptCustomDialogButtonCancel = document.createElement("button")
const PromptCustomDialogText = document.createElement("text")
const PromptCustomDialogTempDIV = document.createElement("div")

//main dialog ++
PromptCustomDialog.id = "kmasdYhBBYGUyuhdv"
PromptCustomDialog.className = "PromptDialog"
//main dialog --

//main dialog ++
PromptCustomDialogButtonOK.id = "kmasdYhBBYGUyuhdm"
PromptCustomDialogButtonOK.className = "PromptDialogButtonOK"
PromptCustomDialogButtonOK.innerHTML = `ТАК`
//main dialog --

//main dialog ++
PromptCustomDialogButtonCancel.id = "kmasdYhBBYGUyuhdg"
PromptCustomDialogButtonCancel.className = "PromptDialogButtonCancel"
PromptCustomDialogButtonCancel.innerHTML = `НІ`
//main dialog --

//main dialog ++
PromptCustomDialogText.id = "kmasdYhBBYGUyuhdl"
PromptCustomDialogText.className = "PromptDialogText"
PromptCustomDialogText.innerHTML = `Зупинити сервер?`
//main dialog --

//main dialog ++
PromptCustomDialogTempDIV.id = "kmasdYhBBYGUyuhde"
PromptCustomDialogTempDIV.className = "PromptDialogTempDIV"
//main dialog --

PromptCustomDialogTempDIV.appendChild(PromptCustomDialogButtonOK)
PromptCustomDialogTempDIV.appendChild(PromptCustomDialogButtonCancel)

PromptCustomDialog.appendChild(PromptCustomDialogText)
PromptCustomDialog.appendChild(PromptCustomDialogTempDIV)

document.body.appendChild(PromptCustomDialog)

PromptCustomDialogButtonCancel.onclick = () => window.close()
PromptCustomDialogButtonOK.onclick = () => ipcRenderer.send("quit")