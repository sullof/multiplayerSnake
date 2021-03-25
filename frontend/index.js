const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#ffffff';
const FOOD_COLOUR = '#e66916';

const socket = io('http://3.139.87.87:3000');
const socketPractice = io('http://3.133.132.75:3000');

// For Development
// const socket = io('http://localhost:3000');
// const socketPractice = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('sendScore', handleScore);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

socketPractice.on('init', handleInit);
socketPractice.on('gameState', handleGameState);
socketPractice.on('gameOver', handleGameOver);
socketPractice.on('gameCode', handlePracticeCode);
socketPractice.on('unknownCode', handleUnknownCode);
socketPractice.on('sendScore', handleScore);
socketPractice.on('tooManyPlayers', handleTooManyPlayers);

// window.onscroll = function () { window.scrollTo(0, 0); };

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const countdownScreen = document.getElementById('countdownScreen');
const countdown = document.getElementById('countdown');
const scoreScreen = document.getElementById('scoreScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const newGameBtn = document.getElementById('newGameButton');
const gcanvas = document.getElementById('gameCanvas');
const joinGameBtn = document.getElementById('joinGameButton');
const practiceBtn = document.getElementById('practiceButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const time = document.getElementById('time');
var isPractice = false
// const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const img = document.getElementById('colorImage');
const toolbar = document.getElementById('toolbar')
scoreScreen.style.display = "none";
joinGameBtn.addEventListener('click', joinGame);

var mc = new Hammer(gameScreen);

mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

mc.on("swipeleft", function() {
  console.log('left')
  if (isPractice) {
    socketPractice.emit('keydown', 65);
  } else {
    socket.emit('keydown', 65);
  }
});

mc.on("swiperight", function() {
  console.log('right')
  if (isPractice) {
    socketPractice.emit('keydown', 68);
  } else {
    socket.emit('keydown', 68);
  }
});

mc.on("swipedown", function() {
  console.log('down')
  if (isPractice) {
    socketPractice.emit('keydown', 83);
  } else {
    socket.emit('keydown', 83);
  }
});

mc.on("swipeup", function() {
  console.log('up')
  if (isPractice) {
    socketPractice.emit('keydown', 87);
  } else {
    socket.emit('keydown', 87);
  }
});

const url = new URLSearchParams(window.location.search);
code = url.get('gameCode')
console.log(code)
if (code) {
  joinGame()
}

function joinPractice(gameCode) {
  initialScreen.style.display = "none";
  countdownScreen.style.display = "none";
  gameScreen.style.display = "block";
  console.log('toolbar', toolbar.clientHeight)
  let padding = toolbar.clientHeight
  const windowHeight = $('body').innerHeight() - padding
  const windowWidth = $('body').innerWidth()
  if (windowWidth < 350) {
    gcanvas.width = Math.floor(windowWidth/15) * 15
    gcanvas.height = Math.floor(windowHeight/15) * 15
  }
  else if(windowWidth < 450) {
    gcanvas.width = Math.floor(windowWidth/20) * 20
    gcanvas.height = Math.floor(windowHeight/20) * 20
  }
  else if(windowWidth < 550){
    gcanvas.width = Math.floor(windowWidth/25) * 25
    gcanvas.height = Math.floor(windowHeight/25) * 25
  }
  else if(windowWidth < 800){
    gcanvas.width = Math.floor(windowWidth/30) * 30
    gcanvas.height = Math.floor(windowHeight/30) * 30
  }
  else {
    console.log('setting large size')
    gcanvas.width = Math.floor(windowWidth/40) * 40
    gcanvas.height = Math.floor(windowHeight/40) * 40
  }
  const message = {
    roomName: gameCode,
    screenSize: {
      width: gcanvas.width,
      height: gcanvas.height
    }
  }
  console.log(message)
  socketPractice.emit('joinGame', message);
  init();
}
let playerNumber;
let gameActive = false;

function newGame() {
  console.log("newGame")
  socket.emit('newGame');
}

function newPractice() {
  console.log("newGame")
  socketPractice.emit('newGame');
  // init();
}

function joinGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('gameCode')
  if (!code) {
    isPractice = true
    newPractice()
  } else {
    initialScreen.style.display = "none";
    console.log('setting countdown')
    countdownScreen.style.display = "block";
    var timeleft = 3;
    var downloadTimer = setInterval(function(){
      if(timeleft <= 0){
        console.log('starting game')
        let padding = toolbar.clientHeight
        const windowHeight = $('body').innerHeight() - padding
        const windowWidth = $('body').innerWidth()
        if (windowWidth < 350) {
          gcanvas.width = Math.floor(windowWidth/15) * 15
          gcanvas.height = Math.floor(windowHeight/15) * 15
        }
        else if(windowWidth < 450) {
          gcanvas.width = Math.floor(windowWidth/20) * 20
          gcanvas.height = Math.floor(windowHeight/20) * 20
        }
        else if(windowWidth < 550){
          gcanvas.width = Math.floor(windowWidth/25) * 25
          gcanvas.height = Math.floor(windowHeight/25) * 25
        }
        else if(windowWidth < 800){
          gcanvas.width = Math.floor(windowWidth/30) * 30
          gcanvas.height = Math.floor(windowHeight/30) * 30
        }
        else {
          console.log('setting large size')
          gcanvas.width = Math.floor(windowWidth/40) * 40
          gcanvas.height = Math.floor(windowHeight/40) * 40
        }
        const message = {
          roomName: code,
          screenSize: {
            width: gcanvas.width,
            height: gcanvas.height
          }
        }
        console.log(message)
        socket.emit('joinGame', message);
        init()
        clearInterval(downloadTimer);
      } else {
        countdown.innerHTML = timeleft
      }
      timeleft -= 1;
    }, 1000)
  }
}

function init() {
  initialScreen.style.display = "none";
  countdownScreen.style.display = "none";
  gameScreen.style.display = "block";

  ctx3 = gcanvas.getContext('2d');

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  console.log(e.keyCode)
  if (isPractice) {
    socketPractice.emit('keydown', e.keyCode);
  } else {
    socket.emit('keydown', e.keyCode);
  }
}

function paintGame(state) {
  img.src=state.imgURL;
  time.innerText = state.currentTime;

  // // Black Background, useful for debugging
  // ctx3.fillStyle = '#000000'
  // ctx3.fillRect(0, 0, gcanvas.width, gcanvas.height);

  ctx3.clearRect(0, 0, gcanvas.width, gcanvas.height);

  ctx3.fillStyle = 'rgba(0,0,0,0)'
  ctx3.fillRect(0, 0, gcanvas.width, gcanvas.height)
  ctx3.lineWidth = 2;
  ctx3.strokeStyle = "white";
  ctx3.strokeRect(0, 0, gcanvas.width, gcanvas.height);

  if (state.food){
    let food = state.food
    let sizeX = gcanvas.width/(state.gridX+1)
    let sizeY = gcanvas.height/(state.gridY+1)
    if (gcanvas.width < 350) {
      ctx3.fillStyle = state.food[0].color.hex;
      ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 15, 15);
      ctx3.fillStyle = state.food[1].color.hex;
      ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 15, 15);
    }
    else if(gcanvas.width < 450) {
      ctx3.fillStyle = state.food[0].color.hex;
      ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 20, 20);
      ctx3.fillStyle = state.food[1].color.hex;
      ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 20, 20);
    }
    else if(gcanvas.width < 550){
      ctx3.fillStyle = state.food[0].color.hex;
      ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 25, 25);
      ctx3.fillStyle = state.food[1].color.hex;
      ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 25, 25);
    }
    else if(gcanvas.width < 800){
      ctx3.fillStyle = state.food[0].color.hex;
      ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 30, 30);
      ctx3.fillStyle = state.food[1].color.hex;
      ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 30, 30);
    }
    else {
      ctx3.fillStyle = state.food[0].color.hex;
      ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 40, 40);
      ctx3.fillStyle = state.food[1].color.hex;
      ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 40, 40);
    }
    // ctx3.fillStyle = state.food[0].color.hex;
    // ctx3.fillRect(food[0].x * sizeX, food[0].y * sizeY, 15, 15);
    // ctx3.fillStyle = state.food[1].color.hex;
    // ctx3.fillRect(food[1].x * sizeX, food[1].y * sizeY, 15, 15);

    paintPlayer(state.players[0], sizeX, sizeY, SNAKE_COLOUR);
    paintPlayer(state.players[1], sizeX, sizeY, 'red');
  }
}

function paintPlayer(playerState, sizeX, sizeY, colour) {
  const snake = playerState.snake;

  ctx3.fillStyle = colour;
  for (let cell of snake) {
    if (gcanvas.width < 350) {
      ctx3.fillRect(cell.x * sizeX, cell.y * sizeY, 15, 15);
    }
    else if(gcanvas.width < 450) {
      ctx3.fillRect(cell.x * sizeX, cell.y * sizeY, 20, 20);
    }
    else if(gcanvas.width < 550){
      ctx3.fillRect(cell.x * sizeX, cell.y * sizeY, 25, 25);
    }
    else if(gcanvas.width < 800){
      ctx3.fillRect(cell.x * sizeX, cell.y * sizeY, 30, 30);
    }
    else {
      ctx3.fillRect(cell.x * sizeX, cell.y * sizeY, 40, 40);
    }
  }
}

function handleInit(number) {
  playerNumber = 1;
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
    alert('You died!');
  } else {
    alert('Your died!');
  }
  isPractice = false
}

function handleScore(data) {
  scoreDisplay.innerText = data.score;
  gameScreen.style.display = "none";
  scoreScreen.style.display = "block";
  console.log(data.score)
}

function handlePracticeCode(gameCode) {
  joinPractice(gameCode)
}

function handleGameCode(gameCode) {
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
  // gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  isPractice = false
}
