const crypto = require('crypto');
const fs = require("fs");
const JSHash = require("./JSHash");

const OnLineStates = {
  onLine: 1,
  offLine: 0,
  connectedToServer: 3,
  disconnected: 4
}
function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return {
    numSize: bytes.toFixed(2),
    calculus: units[i],
    string: `${bytes.toFixed(2)} ${units[i]}`,
  };
}

function GetUUID(string) {return crypto.randomUUID() + "-" + string}

function GetFiles(Files) {
  let files = undefined;
  const fileArray = Array.from(Files || []); // FileList не имеет forEach — конвертируем в массив
  if (fileArray.length > 0) {
    let fileList = { files: [] };

    fileArray.forEach((fileKey) => {
      let fileObject = {};

      const Stats = fs.statSync(fileKey.path);

      fileObject.fileName = fileKey.name;
      fileObject.filePath = fileKey.path;
      fileObject.fileSize = fileKey.size;
      const FileInfo = formatSize(fileKey.size);
      fileObject.fileSizeConverted = FileInfo.numSize;
      fileObject.fileCalculus = FileInfo.calculus;
      fileObject.fileString = FileInfo.string;
      fileObject.file = fileKey;
      fileObject.isDir = Stats.isDirectory();
      fileObject.uid = GetUUID(JSHash.hash(fileKey.path));

      let ArrExt = fileKey.name.split(".");
      const Extension = ArrExt.findLast((lastElem) => {
        return lastElem;
      });

      fileObject.iconExt = FileImage((Stats.isDirectory()?"dir":Extension));
      fileObject.extension = Extension;

      fileList.files.push(fileObject);
    });

    files = fileList;
  } else {
    files = "Files empty";
  }

  return files;
}

//get file icon for extension
function FileImage(extension) {
  const FImage = {
    doc: `./assets/icons/document.svg`,
    docx: `./assets/icons/document.svg`,
    exe: `./assets/icons/exe.svg`,
    js: `./assets/icons/js.svg`,
    css: `./assets/icons/css.svg`,
    pdf: `./assets/icons/pdf.svg`,
    odt: `./assets/icons/document.svg`,
    txt: `./assets/icons/template.svg`,
    xlsx: `./assets/icons/table.svg`,
    xls: `./assets/icons/table.svg`,
    xml: `./assets/icons/xml.svg`,
    npm: `./assets/icons/npm.svg`,
    md: `./assets/icons/markdown.svg`,
    mp3: `./assets/icons/lyric.svg`,
    html: `./assets/icons/html.svg`,
    png: `./assets/icons/image.svg`,
    svg: `./assets/icons/image.svg`,
    ico: `./assets/icons/image.svg`,
    json: `./assets/icons/json.svg`,
    asm: `./assets/icons/assembly.svg`,
    bin: `./assets/icons/assembly.svg`,
    apk: `./assets/icons/android.svg`,
    zip: `./assets/icons/zip.svg`,
    rar: `./assets/icons/bibliography.svg`,
    cmake: `./assets/icons/cmake.svg`,
    chromium: `./assets/icons/chrome.svg`,
    bat: `./assets/icons/console.svg`,
    drawio: `./assets/icons/drawio.svg`,
    dart: `./assets/icons/dart.svg`,
    iso: `./assets/icons/disc.svg`,
    sql: `./assets/icons/database.svg`,
    php: `./assets/icons/php.svg`,
    ps: `./assets/icons/powershell.svg`,
    ps1: `./assets/icons/powershell.svg`,
    jsx: `./assets/icons/react.svg`,
    figma: `./assets/icons/figma.svg`,
    dir: `./assets/icons/folder-base.svg`
  };

  const exts = Object.keys(FImage);

  if (!exts.includes(extension)) return FImage.txt;

  return FImage[extension];
}

function generateKey() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

module.exports = {
  formatSize,
  GetFiles,
  FileImage,
  generateKey,
  OnLineStates,
  GetUUID
}