/** 게임 룰을 위한 소켓 서버 */
module.exports = (server) => {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
        ws.send('something');
    });

    return wss;
};

