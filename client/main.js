import './style.css'
import { blockList, blockColor } from './blockData'


const wsUrl = "ws://localhost:3000"
const socket = new WebSocket(wsUrl)

// 웹소켓 연결이 열릴 때 실행될 이벤트
socket.onopen = function (event) {
    socket.send(JSON.stringify({command : 'CREATE_OR_JOIN'}))
};

// 서버로부터 메시지를 받을 때 실행될 이벤트
socket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    switch(data.command) {
        case 'WAIT':
            waitModelToogle(true)
            gameData.state = gameState.Wait
            break
        case 'READY':
            waitModelToogle(false)
            lastTime = 0
            gameData.state = gameState.Ready
            break

        case 'PUT_GAME_DATA':
            otherPlayerBoard = data.data.PlayerBoard
            break

        case 'EXIT':
            gameData.state = gameState.Wait
            waitModelToogle(true)
            alert('상대가 게임에서 나갔습니다.')
            socket.send(JSON.stringify({command : 'WAIT'}))
            break

        case 'WIN':
            gameData.state = gameState.GameOver
            alert('게임에서 승리')
            break
    }
    console.log("Received message from server: " + data.command);
};

// 웹소켓 연결이 닫힐 때 실행될 이벤트
socket.onclose = function (event) {
    console.log("Disconnected from WebSocket server.");
};

// 오류 발생 시 실행될 이벤트
socket.onerror = function (error) {
    console.error("WebSocket error: " + error);
};

// 마지막 시간
var lastTime = 0
// 틱 카운트
var tickCount = 0
// 1초 계산용
var tickTime = 0
// 레벨업 틱
var levelUpTick = 30
// 레벨 디자인
var gameLevels = [300, 250, 200, 150, 100, 50]
var currentLevel = 0

// 테트리스 사이즈 정의
var tetrisBaseSize = {
    width: 10,
    height: 20,
}

// 블럭 시작 위치
var startPos = {
    xPos : 5,
    yPos : 0
}

// 블럭 종류의 수
var blockSize = blockList.length
// 현재 블럭
var currentBlock = {
    xPos: 5,
    yPos: 2,
    blockNum : 0,
    blockType : 0,
    is_show : false     // 블럭 보임 유무
}
// 다음 블럭
var nextBlock = {
    blockNum : 0,
}
// 다음 블럭 엘리먼트
var eleNextBlock = []

// 게임 상태 정보
var gameState = {
    Wait : 0,           // 상대 기다림
    Ready : 1,          // 플레이 할 준비가 됨
    Play : 2,           // 플레이 중
    GameOver : 3,            // 게임 종료
}
// 게임 정보
var gameData = {
    state : gameState.Wait
}

// 플레이어 점수
var playerScore = 0
// 플레이어 게임판 값
var playerBoard = []
// 플레이어 게임판 제어를 위한 엘리먼트 배열
var elePlayerBoard = []
// 플레이어 점수판
var elePlayerScoreBoard = document.querySelector('#player_score_board')
// 플레이어 게임판
var elePlayerGameBoard = document.querySelector('#player_game_board')

// 대기중 모달
var eleWaitModel = document.querySelector('#waitModel')

// 상대 플레이어 점수
var otherPlayerScore = 0
// 상대 플레이어 게임판
var otherPlayerBoard = []
// 상대 플레이어 게임판 제어를 위한 엘리먼트 배열
var eleOtherPlayerBoard = []
// 상대 플레이어 점수
var eleOtherPlayerScoreBoard = document.querySelector('#other_player_score_board')
// 상대 플레이어 게임판
var eleOtherPlayerGameBoard = document.querySelector('#other_player_game_board')

window.onload = function() {

    init()
}

function init() {
    tickCount = 0
    // 초기화
    playerScore = 0
    otherPlayerScore = 0

    // 플레이어 게임판 초기화
    playerBoard = []
    createGameBoardElement(elePlayerGameBoard, elePlayerBoard, playerBoard)

    // 상대 플레이어 게임판 초기화
    otherPlayerBoard = []
    createGameBoardElement(eleOtherPlayerGameBoard, eleOtherPlayerBoard, otherPlayerBoard)

    // 다음 블럭 관련 초기화
    let tmpEleNextBlock = document.querySelectorAll('#nextBlock li')
    let c = 0
    for(let i = 0; i < 4; i++) {
        let row = []
        for(let j = 0; j < 4; j++) {
            row.push(tmpEleNextBlock[c])
            c++
        }
        eleNextBlock.push(row)
    }

    requestAnimationFrame(gameloop)
}

function createGameBoardElement(eleGameBoard, eleBoard, board) {
    for(let i = 0; i < tetrisBaseSize.height; i++) {
        let row = []
        let eleRow = []
        let ul = document.createElement('ul')
        for(let j = 0; j < tetrisBaseSize.width; j++) {
            let li = document.createElement('li');
            ul.appendChild(li);
            row.push(-1)
            eleRow.push(li)
        }
        board.push(row)
        eleBoard.push(eleRow)
        eleGameBoard.appendChild(ul);
    }

}

// 게임에 필요한 계산 로직
function update(delta) {
    
    switch(gameData.state) {
        case gameState.Wait:
            break
        case gameState.Ready:
            // 현재 블럭
            currentBlock.blockNum = ChooseBlock()
            currentBlock.is_show = true
            currentBlock.xPos = startPos.xPos
            currentBlock.yPos = startPos.yPos

            // 다음 블럭
            nextBlock.blockNum = ChooseBlock()

            // 게임 상태 변경
            gameData.state = gameState.Play
            break
        case gameState.Play:
            procNextBlockDrop()

            break
        case gameState.GameOver:
            break
    }
}

// 한칸 아래 이동 로직
function procNextBlockDrop() {
    if(tickTime > gameLevels[currentLevel]) {

        if(currentBlock.is_show) {
            let tmpBlockData = blockList[currentBlock.blockNum][currentBlock.blockType]

            for(let i = 0; i < tmpBlockData.length; i++) {
                let chkYPos = tmpBlockData[i][0] + currentBlock.yPos + 1
                let chkXPos = tmpBlockData[i][1] + currentBlock.xPos
                // 끝부분인지 체크
                if(tetrisBaseSize.height <= chkYPos) {
                    endBlockDrop()
                    break
                }

                // 게임판 블럭과 충돌 체크
                if(chkYPos > 0 && playerBoard[chkYPos][chkXPos] != -1) {
                    endBlockDrop()
                    break
                }
            }

            // 블럭이 보이는 중이면 한칸 내리
            if(currentBlock.is_show) {
                currentBlock.yPos++
            }

        } else {
            // 현재 블럭 가져오기
            currentBlock.blockNum = nextBlock.blockNum
            currentBlock.blockType = 0
            currentBlock.xPos = startPos.xPos
            currentBlock.yPos = startPos.yPos
            currentBlock.is_show = true

            // 다음 블럭 가져오기
            nextBlock.blockNum = ChooseBlock()


        }

        tickCount++
        if(levelUpTick < tickCount) {
            currentLevel++
            if(currentLevel == gameLevels.length) {
                currentLevel--
            }
            tickCount = 0
        }
        tickTime -= gameLevels[currentLevel]

        // 상대 플레이어에게 내 상태 전송
        let tmpPlayerBoard = JSON.parse(JSON.stringify(playerBoard))
        var currentblockData = blockList[currentBlock.blockNum][currentBlock.blockType]

        for(let i = 0; i < currentblockData.length; i++) {
            var xPos = currentBlock.xPos + currentblockData[i][1]
            var yPos = currentBlock.yPos + currentblockData[i][0]
            if(xPos < 0 || yPos < 0) continue
            tmpPlayerBoard[yPos][xPos] = currentBlock.blockNum
        }

        socket.send(JSON.stringify({
            command : 'PUT_GAME_DATA',
            data : {
                playerScore,
                PlayerBoard : tmpPlayerBoard
            }
        }))
    }
}

// 더 내려가지 못하고 게임 보드판 데이터로 넘김
function endBlockDrop() {
    // 현재 블럭은 보이지 않음
    currentBlock.is_show = false

    // 현재 블럭을 게임판 데이터로 넘김
    let tmpBlockData = blockList[currentBlock.blockNum][currentBlock.blockType]
    for(let i = 0; i < tmpBlockData.length; i++) {
        let yPos = tmpBlockData[i][0] + currentBlock.yPos
        let xPos = tmpBlockData[i][1] + currentBlock.xPos

        if(yPos < 0) {
            // 게임 종료
            gameData.state = gameState.Wait
            waitModelToogle()
            alert('게임 오버')

        } else {
            playerBoard[yPos][xPos] = currentBlock.blockNum
        }
    }

    // 한줄이 완성되서 한줄을 삭제 가능한지 체크
    let isAllList = []
    for(let i = 0; i < tetrisBaseSize.height; i++) {
        let is_all = true
        for(let j = 0; j < tetrisBaseSize.width; j++) {
            if(playerBoard[i][j] == -1) {
                is_all = false
                break
            }
        }
        if(is_all) isAllList.push(i)
    }
    if(isAllList.length > 0) {
        
        // 제거 대상이 있으면 제거 처리
        for(let i = 0; i < isAllList.length; i++) {
            playerScore++
            // 해당 행 데이터 삭제
            for(let j = 0; j < tetrisBaseSize.width; j++) {
                playerBoard[isAllList[i]][j] = -1
            }

            for(let j = isAllList[i]; j >= 1; j--) {
                for(let z = 0; z < tetrisBaseSize.width; z++) {
                    playerBoard[j][z] = playerBoard[j-1][z]
                }
            }

            // 해당 행 데이터 삭제
            for(let j = 0; j < tetrisBaseSize.width; j++) {
                playerBoard[0][j] = -1
            }
        }
        
    }
}


// 블럭 선택
function ChooseBlock() {
    return Math.floor(Math.random() * blockSize)
}

// 게임 화면 랜더링
function render(delta) {

    switch(gameData.state) {
        case gameState.Wait:
            // 
            break
        case gameState.Ready:
            break
        case gameState.Play:
            GameBordRender(elePlayerBoard, playerBoard)
            GameBordRender(eleOtherPlayerBoard, otherPlayerBoard)
            nextBlockRender()

            if(currentBlock.is_show) {
                currentBlockRender()
            }
            elePlayerScoreBoard.innerText = playerScore
            
            break
        case gameState.GameOver:
            break
    }



}


function nextBlockRender() {
    var nextblockData = blockList[nextBlock.blockNum][0]

    for(let i = 0; i < eleNextBlock.length; i++) {
        for(let j = 0; j < eleNextBlock[i].length; j++) {
            eleNextBlock[i][j].style.backgroundColor = 'white'
        }
    }

    for(let i = 0; i < nextblockData.length; i++) {
        var xPos = 1 + nextblockData[i][1]
        var yPos = 1 + nextblockData[i][0]
        eleNextBlock[yPos][xPos].style.backgroundColor = blockColor[0]
    }  
}

// 현재 블럭 랜더링
function currentBlockRender() {
    var currentblockData = blockList[currentBlock.blockNum][currentBlock.blockType]

    for(let i = 0; i < currentblockData.length; i++) {
        var xPos = currentBlock.xPos + currentblockData[i][1]
        var yPos = currentBlock.yPos + currentblockData[i][0]
        if(xPos < 0 || yPos < 0) continue
        elePlayerBoard[yPos][xPos].style.backgroundColor = blockColor[currentBlock.blockNum]
    }
}


// 플레이어 게임판 랜더링(elePlayerBoard, playerBoard)
function GameBordRender(eleBoard, board) {
    for(let i = 0; i < eleBoard.length; i++) {
        for(let j = 0; j < eleBoard[i].length; j++) {
            if(board[i][j] == -1) {
                eleBoard[i][j].style.backgroundColor = 'white'
            } else {
                eleBoard[i][j].style.backgroundColor = blockColor[board[i][j]]
            }
        }
    }
}

// 게임 루프
function gameloop(timestamp) {
    let delta = timestamp - lastTime
    lastTime = timestamp
    tickTime += delta
    
    update(delta)
    render(delta)

    requestAnimationFrame(gameloop)
}

// 키 입력 제어
document.addEventListener('keydown', function(event) {
    if(gameData.state == gameState.Play) {

        switch(event.key) {
            case 'ArrowUp':
                changeCurrentBlockType()
                break;
            case 'ArrowDown':

                procDownBlock()

                break;
            case 'ArrowLeft':
                // 왼쪽으로 이동
                if(checkLeftRight(-1)) currentBlock.xPos--

                break;
            case 'ArrowRight':
                if(checkLeftRight(1)) currentBlock.xPos++
                break;
        }
    }
})

// 현재 블럭 타입을 변경 로직
function changeCurrentBlockType() {
    let blockTypeCount = blockList[currentBlock.blockNum].length
    let nextType = (currentBlock.blockType + 1) % blockTypeCount

    // 변경할때 벽이나 다른 블러과 충돌하는지 체크
    let tmpBlockData = blockList[currentBlock.blockNum][nextType]
    let is_ok = true        // 변경시 문제 없는지
    for(let i = 0; i < tmpBlockData.length; i++) {
        let chkYPos = tmpBlockData[i][0] + currentBlock.yPos
        // if(chkYPos < 0) {
        //     is_ok = false
        //     break
        // }

        let chkXPos = tmpBlockData[i][1] + currentBlock.xPos
        // 왼쪽 벽을 넘어 섰는지
        if(0 > chkXPos) {
            debugger
            is_ok = false
            break
        }

        // 오른쪽 벽을 넘어 섰는지
        if(tetrisBaseSize.width < chkXPos) {
            debugger
            is_ok = false
            break
        }

        // 게임판 블럭과 충돌 체크
        if(chkYPos > 0 && playerBoard[chkYPos][chkXPos] != -1) {
            debugger
            is_ok = false
            break
        }
    }

    if(is_ok) {
        // 이상 없다면 타입 변경 처리
        currentBlock.blockType = nextType
    }
}

// 왼쪽, 오른쪽 이동 가능 확인
function checkLeftRight(direction) {

    let tmpBlockData = blockList[currentBlock.blockNum][currentBlock.blockType]

    for(let i = 0; i < tmpBlockData.length; i++) {
        let chkYPos = tmpBlockData[i][0] + currentBlock.yPos
        if(chkYPos < 0) continue

        let chkXPos = tmpBlockData[i][1] + currentBlock.xPos + direction
        // 왼쪽 벽을 넘어 섰는지
        if(0 > chkXPos) return false

        // 오른쪽 벽을 넘어 섰는지
        if(tetrisBaseSize.width < chkXPos) return false

        // 게임판 블럭과 충돌 체크
        if(playerBoard[chkYPos][chkXPos] != -1) {
            return false
        }
    }
    return true

}

// 블럭 한번에 아래로 떨어 트리기
function procDownBlock() {

    // 현재 블럭이 있는지 체크
    if(!currentBlock.is_show) return

    let tmpBlockData = blockList[currentBlock.blockNum][currentBlock.blockType]

    for(let h = 0; h < tetrisBaseSize.height; h++) {
        for(let i = 0; i < tmpBlockData.length; i++) {
            let chkYPos = tmpBlockData[i][0] + currentBlock.yPos + h
            if(chkYPos < 0) continue
            
            let chkXPos = tmpBlockData[i][1] + currentBlock.xPos

            // 게임판 블럭과 충돌 체크
            if(playerBoard[chkYPos][chkXPos] != -1) {
                currentBlock.yPos = currentBlock.yPos + h - 1
                // endBlockDrop()
                return
            }

            // 게임판 끝인지 체크
            if(tetrisBaseSize.height-1 <= chkYPos) {
                currentBlock.yPos = currentBlock.yPos + h
                // endBlockDrop()
                return
            }

        }
    }

}

// 대기중 모달 토글
function waitModelToogle(is_show) {
    if(is_show) {
        eleWaitModel.style.display = 'block'
    } else {
        eleWaitModel.style.display = 'none'
    }
}