const { IMAGES, COLORS, GRID_SIZE } = require('./constants');
let poisonFood = null
let atePoison = false

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  randomFood
}

function initGame() {
  const state = createGameState()
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    startTime: null,
    currentTime: null,
    endTime: null,
    foodTimes: [],
    lastFood: null,
    sinceLastFood: null,
    players: [
      {
        pos: {
          x: 3,
          y: 10,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          {x: 1, y: 10},
          {x: 2, y: 10},
          {x: 3, y: 10},
        ],
      },
      {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          // {x: 20, y: 10},
          // {x: 19, y: 10},
          // {x: 18, y: 10},
        ],
      }
    ],
    food: [{}],
    gridsize: GRID_SIZE,
    gridX: 0,
    gridY: 0
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }
  if (state.timer < new Date()) {
    return 2;
  }
  if(state.lastFood) {
    state.sinceLastFood = new Date().getTime() - state.lastFood.getTime()
  }
  if (state.timer) {
    state.currentTime = state.timer.getTime() - new Date().getTime()
    state.currentTime = Math.floor(state.currentTime/1000)
  }
  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  gridWidth = state.gridX
  gridHeight = state.gridY

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  if (playerOne.pos.x < 0 || playerOne.pos.x > gridWidth || playerOne.pos.y < 0 || playerOne.pos.y > gridHeight) {
    return 2;
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > gridWidth || playerTwo.pos.y < 0 || playerTwo.pos.y > gridHeight) {
    return 1;
  }


  if (state.food[0].x === playerOne.pos.x && state.food[0].y === playerOne.pos.y) {
    if(checkIfPoison(state, 0)) {
      return 2
    }
  }

  if (state.food[1].x === playerOne.pos.x && state.food[1].y === playerOne.pos.y) {
    if(checkIfPoison(state, 1)) {
      return 2
    }
  }

  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}

function checkIfPoison(state, foodNumber) {
  // console.log(poisonFood, foodNumber)
  if (foodNumber === poisonFood) {
    return true;
  } else {
    // console.log('eating')
    const playerOne = state.players[0];
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    state.lastFood = new Date()
    state.foodTimes.push(state.lastFood.getTime() - state.startTime.getTime())
    randomFood(state);
  }
}

function randomFood(state) {
  gridWidth = state.gridX - 2
  gridHeight = state.gridY - 2
  const food = [
    {
      x: Math.floor(Math.random() * gridWidth + 1),
      y: Math.floor(Math.random() * gridHeight + 1),
      color: {}
    },
    {
      x: Math.floor(Math.random() * gridWidth + 1),
      y: Math.floor(Math.random() * gridHeight + 1),
      color: {}
    }
  ]

  for (let cell of state.players[0].snake) {
    if (cell.x === food[0].x && cell.y === food[0].y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === food[1].x && cell.y === food[1].y) {
      return randomFood(state);
    }
  }

  if (food[0].x === food[1].x && food[0].y === food[1].y) {
    return randomFood(state);
  }

  state.food = food;
  state.sinceLastFood = 0;
  randomColors(state)
}

function randomColors(state) {
  let firstNumber = Math.floor(Math.random() * COLORS.length)
  let secondNumber = Math.floor(Math.random() * COLORS.length)
  if (firstNumber == secondNumber) {
    randomColors(state)
  } else {
    state.food[0].color = COLORS[firstNumber]
    state.food[1].color = COLORS[secondNumber]
    randomPoison(state);
  }
}

function randomPoison(state) {
  poisonFood = Math.round(Math.random())
  poisonColor = state.food[poisonFood].color.name
  let array = IMAGES.filter(image => image.color == poisonColor)
  let rand = Math.floor(Math.random() * array[0].imgURLs.length)
  state.imgURL = array[0].imgURLs[rand]
}

function getUpdatedVelocity(keyCode, currentVelocity) {
  console.log(currentVelocity)
  switch (keyCode) {
    case 37: { // left
      if (currentVelocity.x != 1) {
        return { x: -1, y: 0 };
      }
      else return null
    }
    case 38: { // down
      if (currentVelocity.y != 1) {
        return { x: 0, y: -1 };
      }
      else return null
    }
    case 39: { // right
      if (currentVelocity.x != -1) {
        return { x: 1, y: 0 };
      }
      else return null
    }
    case 40: { // up
      if (currentVelocity.y != -1) {
        return { x: 0, y: 1 };
      }
      else return null
    }
    case 'LEFT': { // left
      return { x: -1, y: 0 };
    }
    case 'DOWN': { // down
      return { x: 0, y: -1 };
    }
    case 'RIGHT': { // right
      return { x: 1, y: 0 };
    }
    case 'UP': { // up
      return { x: 0, y: 1 };
    }
    case 65: { // left
      return { x: -1, y: 0 };
    }
    case 87: { // down
      return { x: 0, y: -1 };
    }
    case 68: { // right
      return { x: 1, y: 0 };
    }
    case 83: { // up
      return { x: 0, y: 1 };
    }
  }
}
