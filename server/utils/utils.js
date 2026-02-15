const fs = require("fs");
const os = require('node:os');

function CreateTempDir(__dirname) {
    if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
    }

    return __dirname;
}

const isDevMode = (app) => { return !app.isPackaged };

const Filters = {
    ALL: "all",
    INFO: "info",
    WARN: "warn",
    FATAL: "fatal",
    NOFILTER: null
}

function GetTotalRam() {
    const totalMem = os.totalmem();
    return Number((totalMem / 1024**3).toFixed(1));
}

module.exports = {
    CreateTempDir,
    isDevMode,
    Filters,
    GetTotalRam
}