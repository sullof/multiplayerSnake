const io = require('socket.io')();

const { sendCaptcha, stopSendingCaptcha, initGame, initPoison, randomFood, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};


io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('recievedCaptcha', handleRecievedCaptcha);
  client.on('confirmedScore', handleConfirmedScore);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(message) {
    initPoison(message.roomName);
    state[message.roomName] = initGame(message.roomName);
    const room = io.sockets.adapter.rooms[message.roomName]
    // console.log('joined: ', message.screenSize, message.screenSize.width, message.screenSize.height)
    try {
      if (message.screenSize.width < 401) {
        console.log('setting grid to 20x20')
        state[message.roomName].gridX = 20
        state[message.roomName].gridY = 20
      }
      else {
        console.log('setting grid to 16x32')
        state[message.roomName].gridX = 32
        state[message.roomName].gridY = 16
      }
    }
    catch {
      console.log('caught some shit in screen size')
    }
    randomFood(state[message.roomName])
    state[message.roomName].startTime = new Date()
    state[message.roomName].timer = new Date();
    state[message.roomName].timer.setMinutes( state[message.roomName].timer.getMinutes() + 1 );
    state[message.roomName].lastFood = new Date()
    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = message.roomName;

    client.join(message.roomName);
    client.number = 1;
    client.emit('init', 1);
    startGameInterval(message.roomName);
  }

  function handleRecievedCaptcha(data) {
    let roomName = clientRooms[client.id]
    stopSendingCaptcha(roomName)
  }

  function handleRecievedCaptcha(data) {
    let roomName = data
    state[data].confirmed = true
  }

  function handleNewGame() {
    let roomName = makeid(10);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);
    console.log(roomName)

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
  }

  function handleKeydown(keyCode) {
    console.log('keystroke', client.id)
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
    try {
      currentVelocity = state[roomName].players[0].vel
      const vel = getUpdatedVelocity(keyCode, currentVelocity, state[roomName]);

      if (vel) {
        try {
          state[roomName].players[client.number - 1].vel = vel;
        }
        catch {
          console.log('caught some shit!')
        }
      }
    }
    catch {
      console.log('caught some shit!')
    }

  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {

    const winner = gameLoop(state[roomName]);
    const url = sendCaptcha(roomName)

    if (!winner) {
      emitGameState(roomName, state[roomName])
      if (url) {
        console.log('theres a captcha')
        emitCaptcha(roomName, url)
      }
    } else {
      emitGameOver(roomName, winner);
      state[roomName].endTime = new Date()
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  const player = gameState.players[0]
  const food = gameState.food
  const grid = {
    x: gameState.gridX,
    y: gameState.gridY
  }
  const lengthOfSnake = player.snake.length
  var bufArr = new ArrayBuffer(11+(lengthOfSnake * 2))
  var bufView = new Uint8Array(bufArr)
  bufView[0]=player.pos.x
  bufView[1]=player.pos.y
  bufView[2]=food[0].x
  bufView[3]=food[0].y
  bufView[4]=food[1].x
  bufView[5]=food[1].y
  bufView[6]= food[0].index
  bufView[7]= food[1].index
  bufView[8]=grid.x
  bufView[9]=grid.y
  bufView[10]=gameState.currentTime
  for (let x = 0; x < (lengthOfSnake); x++) {
    let index = 11 + (x * 2)
    bufView[index]=player.snake[x].x
    bufView[index+1]=player.snake[x].y
  }
  console.log(bufView)
  // console.log(bufView)
  io.sockets.in(room)
    .emit('gameState', bufArr)
}

function emitCaptcha(room, url) {
  // Send this event to everyone in the room.
  console.log('emitting captcha')
  io.sockets.in(room)
    .emit('captcha', url);
}

function emitGameOver(room, winner) {
  const scoreMessage = {
    score: state[room].foodTimes.length,
    gameCode: room
  }
  // if (!state[room].confirmed){
  // io.sockets.in(room)
  //   .emit('sendScore', scoreMessage);
  // }
  io.sockets.in(room)
    .emit('sendScore', scoreMessage);
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
