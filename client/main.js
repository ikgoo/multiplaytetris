import './style.css'
import blockList from './blockData'


// 테트리스 사이즈 정의
var tetrisBaseSize = [10, 20]
var startPos = [0, 5]
var currentBlock = {
    xPos: 0,
    yPos: 5,
    blockNum : 0,
    blockType : 0,
}

// 플레이어 점수
var playerScore = 0
// 플레이어 게임판
var playerBoard = []
// 플레이어 점수판
var elePlayerGameBoard = document.querySelector('#player_game_board')
// 플레이어 게임판
var playerGameBoard = document.querySelector('#player_game_board')

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

    requestAnimationFrame(gameloop)
}

function createGameBoardElement(eleBoard, board) {
    for(let i = 0; i < tetrisBaseSize[1]; i++) {
        let row = []
        let ul = document.createElement('ul')
        for(let j = 0; j < tetrisBaseSize[0]; j++) {
            row.push(0)
            let li = document.createElement('li');
            ul.appendChild(li);
        }
        board.push(row)
        eleBoard.appendChild(ul);
    }
}

function update() {

}



function render() {

}


function currentBlockRender(xPos, yPos, blockNum, blockType) {

}

function gameloop() {
    
    update()
    render()

    requestAnimationFrame(gameloop)
}

