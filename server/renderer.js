const { ipcRenderer } = require("electron");
const dns = require('node:dns');
const os = require('node:os');
const fs = require("fs");
const { InfoLogger, ErrorLogger } = require("./utils/logister");
const { Filters, GetTotalRam } = require("./utils/utils");
const uPlot = require("uplot");

const options = { family: 4 };
const D = document;
const W = window;
const LogInf = new InfoLogger();
const LogErr = new ErrorLogger();

let currentFilter = Filters.ALL;

LogInf.startWatch();

getLogs("all")

LogInf.onLog(log => {
  outLogInRealTime(log)
})



// массивы для данных
const time = [];
const used = [];
const totalRAM = [];
const freeRAM = [];

// настройки графика
const opts = {
  title: 'System RAM Usage',
  width: 400,
  height: 500,
  scales: {
   // x: {  },
    y: { auto: true, min: 0, max: GetTotalRam()}
  },
  series: [
    {}, // X axis
    { label: 'Used RAM (GB)', stroke: '#f7764f', width: 2 },
    // { label: 'Total RAM (GB)', stroke: '#81c784', width: 2 },
    { label: 'Free RAM (GB)', stroke: '#0b6310', width: 2 }
  ]
};

// создаём график
const chart = new uPlot(
  opts,
  [time, used, freeRAM],
  document.getElementById('memChart')
);

// функция обновления графика
function addPoint(usedGB, totalGB, freeGB) {
  time.push(Date.now() / 1000);
  used.push(usedGB);
  totalRAM.push(totalGB);
  freeRAM.push(freeGB);

  if (time.length > 60) {
    time.shift();
    used.shift();
    totalRAM.shift();
    freeRAM.shift();
  }

  chart.setData([time, used, freeRAM]);
}

D.querySelector(".u-under").remove()

// обновление каждые 1 сек
setInterval(() => {
  const totalMem = os.totalmem();
  const free = os.freemem();

  const usedGB = Number(((totalMem - free) / 1024**3).toFixed(1));
  const totalGB = Number((totalMem / 1024**3).toFixed(1));
  const frGB = Number((free / 1024**3).toFixed(1));

  addPoint(usedGB, totalGB, frGB);
}, 1000);


let LogsHistory = [];
function outLogInRealTime(log) {
  let arr = new Array;
  arr.push(log);
  buildOutputLog(arr, undefined, true, currentFilter);
}

dns.lookup(os.hostname(), options, (err, addr) => {
  if (err) {
    LogErr.fatal(err);
    document.querySelector("input").value = "error";
  } else {
    document.querySelector("input").value = addr + ":7896";
  }
});

document.querySelector("input").onclick = function () {
  this.select();

  navigator.clipboard.writeText(this.value);

  document.querySelector("copy").innerText = " скопійовано ✔";
  document.querySelector("copy").style.color = "green";
  setTimeout(() => {
    document.querySelector("copy").innerText = "(натисніть щоб скопіювати)";
    document.querySelector("copy").style.color = "black";
  }, 1500)

  LogInf.info("скопіювали підключення до серверу");
}

document.querySelector("close").onclick = () => ipcRenderer.send("hide")

function clearActiveClass() {
  D.querySelector(".active")?.classList.remove("active");
}

// BUTTON EVENTS ++
function getInfo() {
  clearActiveClass();
  D.querySelector("#filter-err-info").classList.add("active");

  currentFilter = Filters.INFO;
  getLogs("info")
}
function getAll() {
  clearActiveClass();
  D.querySelector("#filter-err-all").classList.add("active");

  currentFilter = Filters.ALL;
  getLogs("all")
}
function getWarn() {
  clearActiveClass();
  D.querySelector("#filter-err-warn").classList.add("active");

  currentFilter = Filters.WARN;
  getLogs("warn")
}
function getFatal() {
  clearActiveClass();
  D.querySelector("#filter-err-fatal").classList.add("active");

  currentFilter = Filters.FATAL;
  getLogs("fatal")
}

function rerunState() {location.reload()}

// BUTTON EVENTS --

function getLogs(lvl) {
  try {
    if (lvl.toUpperCase() === "ALL") { buildOutputLog(LogInf.getAllLogs()) } else {
      buildOutputLog(LogInf.getLog(lvl.toUpperCase()))
    }
  } catch (err) {
    buildOutputLog([], err);
  }
}

function clearViewLog() {
  D.querySelector("viewlog").innerHTML = "";
}

function normalizeTimePart(timePart) {
  return String(timePart).length == 1 ? `0${timePart}` : timePart;
}

function buildOutputLog(arrayLogs, err = undefined, appendData = false, filter = Filters.NOFILTER) {
  appendData ? "" : clearViewLog();

  if (arrayLogs.length === 0 && err == undefined) return;

  if (err) {
    const ViewLog = D.querySelector("viewlog");
    let lineViewLog = D.createElement("line");
    lineViewLog.className = "linelog FATALlog";

    lineViewLog.innerHTML = `<msg>${err}</smg><br><msg>Пошкоджений журнал логування(Corrupted journal log)</msg><br><success>Вирішення: видаліть папку Logs</success>`;

    ViewLog.appendChild(lineViewLog);

    return;
  }
  const ViewLog = D.querySelector("viewlog");

  const isNearBottom =
    ViewLog.scrollTop + ViewLog.clientHeight >=
    ViewLog.scrollHeight - 10;

  arrayLogs.forEach(lineLog => {
    let lineViewLog = D.createElement("line");
    lineViewLog.className = "linelog " + lineLog.level + "log";

    const DateLog = new Date(lineLog.time);

    lineViewLog.innerHTML = `<time>[${normalizeTimePart(DateLog.getHours())}:${normalizeTimePart(DateLog.getMinutes())}:${normalizeTimePart(DateLog.getSeconds())} <sub>${DateLog.getMilliseconds()}</sub>]</time> <msg>${lineLog.message}</smg>`;
    
    if (filter === Filters.NOFILTER || filter === Filters.ALL) {
      ViewLog.appendChild(lineViewLog);
    } else {
      if (filter == String(lineLog.level).toLocaleLowerCase()) ViewLog.appendChild(lineViewLog);
    }

    if (isNearBottom) {
      lineViewLog.scrollIntoView({
        behavior: "smooth",
        block: "end"
      })
    }
  });
}