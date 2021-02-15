/*

  became consts into simple vars

*/

BG_COLOUR = '#231f20';
SNAKE_COLOUR = '#c2c2c2';
FOOD_COLOUR = '#e66916';

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const img = document.getElementById('colorImage');

window.onscroll = function () { window.scrollTo(0, 0); };
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const urlParams = new URLSearchParams(window.location.search);
  code = urlParams.get('gameCode')
  console.log(code)
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height - 80);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  img.src=state.imgURL;
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height - 80);
  if (state.food){
    let food = state.food
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;
    const sizex = canvas.width / gridsize;
    const sizey = canvas.height / gridsize;

    ctx.fillStyle = state.food[0].color.hex;
    ctx.fillRect(food[0].x * sizex, food[0].y * sizey, sizex, sizey);
    ctx.fillStyle = state.food[1].color.hex;
    ctx.fillRect(food[1].x * sizex, food[1].y * sizey, sizex, sizey);

    paintPlayer(state.players[0], sizex, sizey, SNAKE_COLOUR);
    paintPlayer(state.players[1], sizex, sizey, 'red');
  }
}

function paintPlayer(playerState, sizex, sizey, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * sizex, cell.y * sizey, sizex, sizey);
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
  gameCodeDisplay.innerText = gameCode;
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

/*

  making the colors change randomly. 

*/
function ramdBgColor(){
  BG_COLOUR = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
  return BG_COLOUR;

}

function ramdSnakeColor(){
  SNAKE_COLOUR = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
  return SNAKE_COLOUR;

}

function ramdFoodColor(){
  FOOD_COLOUR = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
  return FOOD_COLOUR;

}

ramdBgColor()
ramdSnakeColor()
ramdFoodColor()

if(ramdBgColor() == ramdSnakeColor() ){
  Location.reload(); 
}else{

}
