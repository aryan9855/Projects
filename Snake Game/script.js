const canvasEl = document.createElement("canvas");
const canvas = canvasEl.getContext("2d");
canvasEl.width = 400;
canvasEl.height = 400;
document.getElementById("canvas").appendChild(canvasEl);

const box = 20;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let combo = 0;
let speed = 150;
let direction = "RIGHT";
let game;
let particles = [];
let isSlowed = false;
let isPaused = false;
let isGameOver = false;

let snake = [{ x: 9 * box, y: 10 * box }];
let food = generateFood();

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
highScoreEl.innerText = highScore.toString().padStart(2, "0");

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
document.addEventListener("keydown", changeDirection);
document.getElementById("replay").addEventListener("click", restartGame);

const pauseBtn = document.getElementById("pause");
pauseBtn.addEventListener("click", () => {
  if (isPaused) {
    game = setInterval(draw, speed);
    pauseBtn.innerHTML = "<i class='fas fa-pause'></i> Pause";
  } else {
    clearInterval(game);
    pauseBtn.innerHTML = "<i class='fas fa-play'></i> Resume";
  }
  isPaused = !isPaused;
});

const modal = document.getElementById("gameOverModal");
const finalScoreEl = document.getElementById("finalScore");
const modalReplayBtn = document.getElementById("modalReplay");
modalReplayBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  restartGame();
});

const FOOD_TYPES = {
  NORMAL: { color: "#2ecc71", points: 1 },
  BONUS: { color: "#3498db", points: 5 },
  SLOW: { color: "#f1c40f", points: 0 },
  BOMB: { color: "#e74c3c", points: 0, deadly: true }
};

function generateFood() {
  const rand = Math.random();
  let type = "NORMAL";
  if (rand < 0.1) type = "BONUS";
  else if (rand < 0.2) type = "SLOW";
  else if (rand < 0.25) type = "BOMB";

  const newFood = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
    type
  };

  if (newFood.type === "BOMB") {
    setTimeout(() => {
      if (food === newFood && !isGameOver) {
        food = generateFood();
      }
    }, 3000);
  }

  return newFood;
}

function changeDirection(e) {
  const key = e.keyCode;
  if (key === 37 && direction !== "RIGHT") direction = "LEFT";
  else if (key === 38 && direction !== "DOWN") direction = "UP";
  else if (key === 39 && direction !== "LEFT") direction = "RIGHT";
  else if (key === 40 && direction !== "UP") direction = "DOWN";
}

function collision(head, array) {
  return array.some(s => s.x === head.x && s.y === head.y);
}

function addParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x + box / 2,
      y: y + box / 2,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 30,
      color
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    canvas.beginPath();
    canvas.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    canvas.fillStyle = p.color;
    canvas.fill();
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function draw() {
  if (isGameOver || isPaused) return;

  canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);
  drawParticles();

  for (let i = 0; i < snake.length; i++) {
    canvas.fillStyle = i === 0 ? "#4cffd7" : "rgba(76, 255, 215, 0.3)";
    canvas.shadowColor = "#4cffd7";
    canvas.shadowBlur = i === 0 ? 15 : 5;
    canvas.fillRect(snake[i].x, snake[i].y, box, box);
    canvas.shadowBlur = 0;
  }

  const foodColor = FOOD_TYPES[food.type].color;
  canvas.fillStyle = foodColor;
  canvas.beginPath();
  canvas.arc(food.x + box / 2, food.y + box / 2, box / 2.5, 0, 2 * Math.PI);
  canvas.fill();

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvasEl.width ||
    head.y >= canvasEl.height ||
    collision(head, snake)
  ) {
    endGame();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    const ft = FOOD_TYPES[food.type];
    eatSound.play();
    addParticles(food.x, food.y, ft.color);

    if (ft.deadly) {
      endGame();
      return;
    }

    if (food.type === "SLOW") slowMotion();

    score += ft.points;
    combo++;

    if (combo % 5 === 0 && speed > 50) {
      speed -= 10;
      resetInterval();
    }

    food = generateFood();
  } else {
    snake.pop();
    combo = 0;
  }

  snake.unshift(head);
  scoreEl.innerText = score.toString().padStart(2, "0");

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreEl.innerText = `HIGH: ${highScore.toString().padStart(2, "0")}`;
  }
}

function endGame() {
  isGameOver = true;
  gameOverSound.play();
  clearInterval(game);
  gameOverAnimation();
  finalScoreEl.innerText = score;
  modal.classList.remove("hidden");
}

function restartGame() {
  score = 0;
  combo = 0;
  speed = 150;
  direction = "RIGHT";
  isSlowed = false;
  isPaused = false;
  isGameOver = false;
  snake = [{ x: 9 * box, y: 10 * box }];
  food = generateFood();
  particles = [];
  scoreEl.innerText = "00";
  highScoreEl.innerText = `HIGH: ${highScore.toString().padStart(2, "0")}`;
  clearInterval(game);
  game = setInterval(draw, speed);
  pauseBtn.innerHTML = "<i class='fas fa-pause'></i> Pause";
}

function slowMotion() {
  if (isSlowed) return;
  isSlowed = true;
  clearInterval(game);
  game = setInterval(draw, speed + 100);
  setTimeout(() => {
    clearInterval(game);
    game = setInterval(draw, speed);
    isSlowed = false;
  }, 3000);
}

function gameOverAnimation() {
  let fade = 1;
  const fadeInterval = setInterval(() => {
    canvas.fillStyle = `rgba(0, 0, 0, ${fade})`;
    canvas.fillRect(0, 0, canvasEl.width, canvasEl.height);
    fade -= 0.05;
    if (fade <= 0) {
      clearInterval(fadeInterval);
    }
  }, 50);
}

function resetInterval() {
  clearInterval(game);
  game = setInterval(draw, speed);
}

game = setInterval(draw, speed);
