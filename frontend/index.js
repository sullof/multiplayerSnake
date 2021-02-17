const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

window.onscroll = function () { window.scrollTo(0, 0); };

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const canvas = document.getElementById('canvas');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const time = document.getElementById('time');
// const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const img = document.getElementById('colorImage');
const toolbar = document.getElementById('toolbar').clientHeight;
console.log(toolbar.height)
const windowHeight = window.innerHeight - toolbar
canvas.width = Math.floor(window.innerWidth/40) * 40
canvas.height = Math.floor(windowHeight/40) * 40
console.log(canvas.width)
console.log(canvas.height)

// window.onscroll = function () { window.scrollTo(0, 0); };
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
  socket.emit('newGame');
  // init();
}

function joinGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('gameCode')
  const message = {
    roomName: code,
    screenSize: {
      width: canvas.width,
      height: canvas.height
    }
  }
  console.log(message)
  socket.emit('joinGame', message);
  init();
}
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  // canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  img.src=state.imgURL;
  // console.log(state.sinceLastFood)
  time.innerText = state.currentTime;
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (state.food){
    let food = state.food
    // const gridsize = state.gridsize;
    const sizeX = canvas.width /state.gridX
    const sizeY = canvas.height/state.gridY

    ctx.fillStyle = state.food[0].color.hex;
    ctx.fillRect(food[0].x * sizeX, food[0].y * sizeY, 40, 40);
    ctx.fillStyle = state.food[1].color.hex;
    ctx.fillRect(food[1].x * sizeX, food[1].y * sizeY, 40, 40);

    paintPlayer(state.players[0], sizeX, sizeY, SNAKE_COLOUR);
    paintPlayer(state.players[1], sizeX, sizeY, 'red');
  }
}

function paintPlayer(playerState, sizeX, sizeY, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * sizeX, cell.y * sizeY, 40, 40);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

function handleGameCode(gameCode) {
  // gameCodeDisplay.innerText = gameCode;
  console.log(gameCode)
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

