const dgram = require('dgram');
const os = require('os');
const { InfoLogger, ErrorLogger } = require('./utils/logister');

const BROADCAST_PORT = 41234;
const SERVER_PORT = 7896;
const LogErr = new ErrorLogger;
const LogInfo = new InfoLogger;

const socket = dgram.createSocket('udp4');

socket.bind(() => {
  socket.setBroadcast(true);
  
  LogInfo.info('System client-server detection started');
});

setInterval(() => {
  const message = Buffer.from(JSON.stringify({
    type: 'server-found-for-filecopter',
    port: SERVER_PORT,
    name: os.hostname()
  }));

  socket.send(
    message,
    0,
    message.length,
    BROADCAST_PORT,
    '255.255.255.255'
  );
}, 2000);