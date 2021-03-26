const io = require('socket.io')();

const { sendCaptcha, stopSendingCaptcha, initGame, initPoison, randomFood, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
// const poison = {};
const clientRooms = {};


io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('recievedCaptcha', handleRecievedCaptcha);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(message) {
    initPoison(message.roomName);
    console.log(message.roomName)
    state[message.roomName] = initGame(message.roomName);
    const room = io.sockets.adapter.rooms[message.roomName]
    console.log('joined: ', message.screenSize, message.screenSize.width, message.screenSize.height)
    try {
      if (message.screenSize.width < 350) {
        state[message.roomName].gridX = message.screenSize.width/15
        state[message.roomName].gridY = message.screenSize.height/15
      }
      else if(message.screenSize.width < 450) {
        state[message.roomName].gridX = message.screenSize.width/20
        state[message.roomName].gridY = message.screenSize.height/20
      }
      else if(message.screenSize.width < 550){
        state[message.roomName].gridX = message.screenSize.width/25
        state[message.roomName].gridY = message.screenSize.height/25
      }
      else if(message.screenSize.width < 800){
        state[message.roomName].gridX = message.screenSize.width/30
        state[message.roomName].gridY = message.screenSize.height/30
      }
      else {
        console.log('setting large room')
        state[message.roomName].gridX = message.screenSize.width/40
        state[message.roomName].gridY = message.screenSize.height/40
      }
      randomFood(state[message.roomName])
      state[message.roomName].startTime = new Date()
      state[message.roomName].timer = new Date();
      state[message.roomName].timer.setMinutes( state[message.roomName].timer.getMinutes() + 1 );
      state[message.roomName].lastFood = new Date()
    }
    catch {
      console.log('caught some shit')
    }

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
      console.log('game completed in: ' + (state[roomName].endTime.getTime() - state[roomName].startTime.getTime()))
      // console.log(state[roomName])
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
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
  io.sockets.in(room)
    .emit('sendScore', scoreMessage);
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
