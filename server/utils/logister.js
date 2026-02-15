const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')

/* ====== CONST ====== */
const MAGIC = Buffer.from('SFCLOG') // 6 bytes
const VERSION = 1

/* encrypt / decrypt */
const encrypt = data => data
const decrypt = data => data

class Logger extends EventEmitter {
  constructor(filename) {
    super()

    this.logDir = path.join(process.cwd(), 'Logs')
    this.filePath = path.join(this.logDir, filename)

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }

    if (!fs.existsSync(this.filePath)) {
      const header = Buffer.concat([
        MAGIC,
        Buffer.from([VERSION])
      ])
      fs.writeFileSync(this.filePath, header)
    }

    this.lastSize = fs.statSync(this.filePath).size
    this.watching = false
  }

  /* ===== WRITE ===== */

  setLog(message, level = 'INFO') {
    const record = {
      time: Date.now(),
      level,
      message
    }

    const json = Buffer.from(JSON.stringify(record))
    const encrypted = encrypt(json)

    const length = Buffer.alloc(4)
    length.writeUInt32BE(encrypted.length)

    const payload = Buffer.concat([length, encrypted])

    fs.appendFile(this.filePath, payload, err => {
      if (!err) {
        this.emit('log', record)
      }
    })
  }

  /* ===== WATCH (RENDERER) ===== */

  startWatch(interval = 300) {
    if (this.watching) return
    this.watching = true

    fs.watchFile(this.filePath, { interval }, (curr, prev) => {
      // файл пересоздали / обрезали
      if (curr.size < prev.size) {
        this.lastSize = curr.size
        return
      }

      if (curr.size === this.lastSize) return

      const diff = curr.size - this.lastSize
      const buffer = Buffer.alloc(diff)

      const fd = fs.openSync(this.filePath, 'r')
      fs.readSync(fd, buffer, 0, diff, this.lastSize)
      fs.closeSync(fd)

      this.lastSize = curr.size
      this._parseChunk(buffer)
    })
  }

  stopWatch() {
    if (!this.watching) return
    fs.unwatchFile(this.filePath)
    this.watching = false
  }

  _parseChunk(buffer) {
    let offset = 0

    while (offset + 4 <= buffer.length) {
      const size = buffer.readUInt32BE(offset)
      offset += 4

      if (offset + size > buffer.length) break

      const encrypted = buffer.subarray(offset, offset + size)
      offset += size

      try {
        const record = JSON.parse(
          decrypt(encrypted).toString('utf8')
        )
        this.emit('log', record)
      } catch {
        // файл ещё дописывается
      }
    }
  }

  /* ===== READ FULL ===== */

  getAllLogs() {
    const buffer = fs.readFileSync(this.filePath)
    let offset = 7 // MAGIC + VERSION

    const logs = []

    while (offset + 4 <= buffer.length) {
      const size = buffer.readUInt32BE(offset)
      offset += 4

      if (offset + size > buffer.length) break

      const encrypted = buffer.subarray(offset, offset + size)
      offset += size

      logs.push(
        JSON.parse(decrypt(encrypted).toString('utf8'))
      )
    }

    return logs
  }

  getLog(level) {
    return this.getAllLogs().filter(l => l.level === level)
  }

  onLog(cb) {
    this.on('log', cb)
  }
}

/* ===== CHILD LOGGERS ===== */

class InfoLogger extends Logger {
  constructor() {
    super('log.sfc')
  }
  info(msg) {
    this.setLog(msg, 'INFO')
  }
}

class ErrorLogger extends Logger {
  constructor() {
    super('log.sfc')
  }
  warn(msg) {
    this.setLog(msg, 'WARN')
  }
  fatal(msg) {
    this.setLog(msg, 'FATAL')
  }
}

module.exports = {
  Logger,
  InfoLogger,
  ErrorLogger
}
