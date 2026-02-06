const board = document.querySelector('.board');
const blockHeight = 80
const blockWidth = 80
const startButton = document.querySelector('.btn-start')
const modal = document.querySelector('.modal')

const startGameModal = document.querySelector('.start-game')
const gameOverModal = document.querySelector('.game-over')
const restartButton = document.querySelector('.btn-restart')

const highScoreElement = document.querySelector('#high-score')
const scoreElement = document.querySelector('#score')
const timeElement = document.querySelector('#time')

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

let setIntervalId = null
let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }

const blocks = []
let snake = [
    { row: 1, col: 5 }

]
let direction = 'left'

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.style.width = `${blockWidth}px`
        block.style.height = `${blockHeight}px`

        board.appendChild(block)
        block.innerText = `${row}-${col}`;
        blocks[`${row}-${col}`] = block;
    }


}
function render() {
    snake.forEach(segment => {
        blocks[`${segment.row}-${segment.col}`].classList.add('fill')
        blocks[`${food.x}-${food.y}`].classList.add('food')



    })
}

IntervalId = setInterval(() => {
    let head = null

    if (direction === 'left') {
        head = { x: snake[0].row, y: snake[0].col - 1 }
    } else if (direction === 'right') {
        head = { x: snake[0].row, y: snake[0].col + 1 }
    } else if (direction === 'up') {
        head = { x: snake[0].row - 1, y: snake[0].col }
    } else if (direction === 'down') {
        head = { x: snake[0].row + 1, y: snake[0].col }
    }

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {

        clearInterval(IntervalId)

        modal.style.display = 'flex'
        startGameModal.style.display = 'none'
        gameOverModal.style.display = 'flex'
        return;

    }
    //food consume logic
    if (head.x === food.x && head.y === food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove('food')
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
        blocks[`${food.x}-${food.y}`].classList.add('food')
        snake.unshift(head)

        score += 10
        scoreElement.innerText = score


    }




    snake.forEach(segment => {
        blocks[`${segment.row}-${segment.col}`].classList.remove('fill')
    })


    snake.pop()
    snake.unshift({ row: head.x, col: head.y })



    render()
}, 450);

addEventListener("keydown", (event) => {
    if (event.key === 'ArrowLeft') {
        direction = 'left'
    } else if (event.key === 'ArrowRight') {
        direction = 'right'
    } else if (event.key === 'ArrowUp') {
        direction = 'up'
    } else if (event.key === 'ArrowDown') {
        direction = 'down'
    }


})





let highScore = 0
let score = 0
let time = 0




startButton.addEventListener('click', () => {
    modal.style.display = 'none'
    IntervalId = setInterval(() => { render() }, 300)

})
restartButton.addEventListener("click", restartGame)

function restartGame() {
    blocks[`${food.x}-${food.y}`].classList.remove('food')
    snake.forEach(segment => {
        blocks[`${segment.row}-${segment.col}`].classList.remove('fill')
    })
    direction = 'down'

    modal.style.display = 'none'
    snake = [{ row: 1, col: 5 }]
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
    IntervalId = setInterval(() => { render() }, 300)


}
//

/*const board = document.querySelector('.board')
const blockHeight = 60
const blockWidth = 60

const startButton = document.querySelector('.btn-start')
const modal = document.querySelector('.modal')

const startGameModal = document.querySelector('.start-game')
const gameOverModal = document.querySelector('.game-over')
const restartButton = document.querySelector('.btn-restart')

const highScoreElement = document.querySelector('#high-score')
const scoreElement = document.querySelector('#score')
const timeElement = document.querySelector('#time')

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

let highScore = localStorage.getItem("highscore") || 0;
highScoreElement.innerText = highScore;

let intervalId = null

let food = {
    row: Math.floor(Math.random() * rows),
    col: Math.floor(Math.random() * cols)
}

const blocks = {}

let snake = [{ row: 1, col: 5 }]
let direction = 'right'

let score = 0

//  CREATE BOARD
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.style.width = `${blockWidth}px`
        block.style.height = `${blockHeight}px`
        board.appendChild(block)
        blocks[`${row}-${col}`] = block
    }
}

//  RENDER
function render() {
    Object.values(blocks).forEach(block => {
        block.classList.remove('fill', 'food')
    })

    snake.forEach(seg => {
        blocks[`${seg.row}-${seg.col}`].classList.add('fill')
    })

    blocks[`${food.row}-${food.col}`].classList.add('food')
}

//  NEW FOOD
function generateFood() {
    food = {
        row: Math.floor(Math.random() * rows),
        col: Math.floor(Math.random() * cols)
    }
}

//  GAME LOOP
function gameLoop() {
    let head = { ...snake[0] }

    if (direction === 'left') head.col--
    if (direction === 'right') head.col++
    if (direction === 'up') head.row--
    if (direction === 'down') head.row++

    //  WALL COLLISION
    if (
        head.row < 0 || head.row >= rows ||
        head.col < 0 || head.col >= cols
    ) {
        gameOver()
        return
    }

    // 🍽 FOOD EAT
    if (head.row === food.row && head.col === food.col) {
        snake.unshift(head)
        score += 10
        scoreElement.innerText = score


        generateFood()
        if (score > highscore) {
            highScore = score;
            localStorage.setItem("highscore", highScore.toString());
            highScoreElement.innerText = highScore;
        }
    } else {
        snake.pop()
        snake.unshift(head)
    }

    render()
}

//  START GAME
startButton.addEventListener('click', () => {
    modal.style.display = 'none'
    generateFood()
    render()
    intervalId = setInterval(gameLoop, 150)
})

//  RESTART
restartButton.addEventListener('click', () => {
    clearInterval(intervalId)
    snake.forEach(seg => {
        blocks[`${seg.row}-${seg.col}`].classList.remove('fill')
    })
    score = 0
    time = `00:00`

    snake = [{ row: 1, col: 5 }]
    direction = 'right'
    score = 0
    scoreElement.innerText = score

    startGameModal.style.display = 'flex'
    gameOverModal.style.display = 'none'
    modal.style.display = 'none'

    generateFood()
    render()
    intervalId = setInterval(gameLoop, 50)
})

//  CONTROLS
addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left'
    if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right'
    if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up'
    if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down'
})

//  GAME OVER
function gameOver() {
    clearInterval(intervalId)
    modal.style.display = 'flex'
    startGameModal.style.display = 'none'
    gameOverModal.style.display = 'flex'
}*/