const board = document.querySelector(".board");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const timeEl = document.getElementById("time");

const modal = document.querySelector(".modal");
const startScreen = document.querySelector(".start-game");
const gameOverScreen = document.querySelector(".game-over");
const startBtn = document.querySelector(".btn-start");
const restartBtn = document.querySelector(".btn-restart");

const BOARD_SIZE = 15;
let snake = [];
let food = {};
let direction = "RIGHT";
let gameInterval;
let timeInterval;
let score = 0;
let time = 0;

let highScore = localStorage.getItem("highScore") || 0;
highScoreEl.innerText = highScore;

/* ---------------- INIT BOARD ---------------- */
function createBoard() {
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const div = document.createElement("div");
        div.classList.add("block");
        board.appendChild(div);
    }
}

/* ---------------- START GAME ---------------- */
function startGame() {
    modal.style.display = "none";
    startScreen.style.display = "flex";
    gameOverScreen.style.display = "none";

    snake = [{ x: 7, y: 7 }];
    direction = "RIGHT";
    score = 0;
    time = 0;

    scoreEl.innerText = score;
    score
    timeEl.innerText = time;

    createFood();
    draw();

    clearInterval(gameInterval);
    clearInterval(timeInterval);

    gameInterval = setInterval(moveSnake, 200);
    timeInterval = setInterval(() => {
        time++;
        timeEl.innerText = time;
    }, 1000);
}

/* ---------------- DRAW ---------------- */
function draw() {
    document.querySelectorAll(".block").forEach(b => {
        b.classList.remove("fill", "food", "head");
    });

    snake.forEach((part, index) => {
        const i = part.y * BOARD_SIZE + part.x;
        const block = board.children[i];
        block.classList.add(index === 0 ? "head" : "fill");
    });

    const foodIndex = food.y * BOARD_SIZE + food.x;
    board.children[foodIndex].classList.add("food");
}

/* ---------------- MOVE ---------------- */
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;

    /* WALL COLLISION */
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= BOARD_SIZE ||
        head.y >= BOARD_SIZE
    ) {
        endGame();
        return;
    }

    /* BODY COLLISION */
    for (let part of snake) {
        if (part.x === head.x && part.y === head.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    /* FOOD EAT */
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        createFood();
    } else {
        snake.pop();
    }

    draw();
}

/* ---------------- FOOD ---------------- */
function createFood() {
    food = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
    };

    // food should not spawn on snake
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            createFood();
        }
    });
}

/* ---------------- GAME OVER ---------------- */
function endGame() {
    clearInterval(gameInterval);
    clearInterval(timeInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreEl.innerText = highScore;
    }

    modal.style.display = "flex";
    startScreen.style.display = "none";
    gameOverScreen.style.display = "flex";
}

/* ---------------- CONTROLS ---------------- */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/* ---------------- BUTTONS ---------------- */
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

/* ---------------- INIT ---------------- */
modal.style.display = "flex";
createBoard();
