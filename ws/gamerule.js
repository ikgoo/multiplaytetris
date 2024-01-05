/** 게임 룰을 위한 소켓 서버 */
module.exports = (server) => {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    var rooms = {}
    // 룸 구조
    // var room = {
    //     state : 'WAIT OR PLAYING',
    //     player : []
    // }
    

    wss.on('connection', function (ws) {
        ws.on('message', function (message) {

            const { command } = JSON.parse(message)

            switch(command) {
                case 'WAIT':    // 게임이 특정 이유에 의해서 종료되었는때
                    rooms[ws.room].state = 'WAIT'
                    ws.send(JSON.stringify({command : 'WAIT_OK'}))
                    break

                case 'CREATE_OR_JOIN':          // 게임 참여
                    let room_uuids = Object.keys(rooms)
                    // 방 탐색
                    for(let i = 0; i < room_uuids.length; i++) {
                        if(rooms[room_uuids[i]].state == 'WAIT' && rooms[room_uuids[i]].player.length == 1) {
                            rooms[room_uuids[i]].player.push(ws)
                            ws.room = room_uuids[i]

                            rooms[room_uuids[i]].state = 'PLAYING'

                            rooms[room_uuids[i]].player.forEach(client => {
                                client.send(JSON.stringify({command : 'READY'}))
                            });
                            return
                        }
                    }

                    // 대기중인 방이 없는 경우 방 생성
                    const { v4: uuidv4 } = require('uuid');
                    let uuid = uuidv4()
                    rooms[uuid] = {
                        state : 'WAIT',
                        player : [],
                    }
                    rooms[uuid].player.push(ws)
                    ws.room = uuid
                    ws.send(JSON.stringify({command : 'WAIT'}))

                    break
                    

                case 'PUT_GAME_DATA':   // 상대에게 게임 보드 정보 전송
                    if(ws.room && rooms[ws.room]) {
                        rooms[ws.room].player.forEach(client => {
                            if(client != ws) {  // 다른 상대에게 보냄
                                let tt = JSON.parse(message)
                                let tt2 = JSON.stringify(tt)
                                client.send(tt2)
                            }
                        });
                    }
                    break
                
                case 'LOSE':        // 상대에게 패배 알림
                    if(ws.room && rooms[ws.room]) {
                        rooms[ws.room].forEach(client => {
                            if(client != ws) {  // 다른 상대에게 보냄
                                client.send(JSON.stringify({command : 'WIN'}))
                            }
                        });
                    }
                break

            }

            
        });

        ws.on('close', function() {
            if(ws.room && rooms[ws.room]) {
                let index = rooms[ws.room].player.indexOf(ws)
                if(index != -1) {
                    rooms[ws.room].player.splice(index, 1)
                }

                if(rooms[ws.room].player.length == 0) {
                    delete rooms[ws.room]
                } else {
                    // 상대가 나가서 다른 상대도 게임에서 나가게 처리
                    rooms[ws.room].player[0].send(JSON.stringify({command : 'EXIT'}))
                }
            }
        })

    });

    return wss;
};

