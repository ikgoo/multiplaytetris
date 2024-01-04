import './style.css'
import { blockList, blockColor } from './blockData'

// 마지막 시간
var lastTime = 0
// 1초 계산용
var tickTime = 0
// 떨어지는 속도
var dropTime = 300

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
    state : gameState.Ready
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

// // 상대 플레이어 점수
// var other_player_score = 0
// // 상대 플레이어 게임판
// var other_player_board = []
// // 상대 플레이어 점수
// var ele_other_player_score_board = document.querySelector('#other_player_score_board')
// // 상대 플레이어 게임판
// var ele_other_player_game_board = document.querySelector('#other_player_game_board')

window.onload = function() {
    init()
}

function init() {
    // 초기화
    playerScore = 0

    // 플레이어 게임판 초기화
    playerBoard = []
    createGameBoardElement(elePlayerGameBoard, playerBoard)

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

function createGameBoardElement(eleBoard, board) {
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
        elePlayerBoard.push(eleRow)
        eleBoard.appendChild(ul);
    }

}

// 게임에 필요한 계산 로직
function update(delta) {
    
    switch(gameData.state) {
        case gameState.Wait:
            // 
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
    if(tickTime > dropTime) {

        // tetrisBaseSize
        
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
                if(playerBoard[chkYPos][chkXPos] != -1) {
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


        tickTime -= dropTime
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
            console.log('game over')
            gameData.state = gameState.GameOver

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
            playerGameBordRender()
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

// 현재 블럭 타입을 변경 로직
function changeCurrentBlockType() {
    // 변경할때 벽이나 다른 블러과 충돌하는지 체크
    // 추후 작업 할 것

    // 이상 없다면 타입 변경 처리
    let blockTypeCount = blockList[currentBlock.blockNum].length
    let nextType = (currentBlock.blockType + 1) % blockTypeCount
    currentBlock.blockType = nextType
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

// 플레이어 게임판 랜더링
function playerGameBordRender() {
    for(let i = 0; i < elePlayerBoard.length; i++) {
        for(let j = 0; j < elePlayerBoard[i].length; j++) {
            if(playerBoard[i][j] == -1) {
                elePlayerBoard[i][j].style.backgroundColor = 'white'
            } else {
                elePlayerBoard[i][j].style.backgroundColor = blockColor[playerBoard[i][j]]
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