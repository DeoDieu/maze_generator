const displayMaze = document.querySelector(".displayMaze");
const DFSbtn = document.querySelector(".DFS");

const preset1 = document.querySelector(".preset1");
const preset2 = document.querySelector(".preset2");
const preset3 = document.querySelector(".preset3");

/// make DFS Solver Start from player start:done
/// make DSF Solver Find the Goal:Done
/// make highlight the shortest path:Done

const body = document.body;

let rowNum = 31;
let colNum = 41;
let pixelSize = "32px";

let brick;

let maze;
let walls = document.querySelectorAll(".wall");

let canMove = false;

let steps = 0;

let playerPosition;
let previousPosition;
let goal;

let current;
let trackStart;
let stack = [];
let stack2 = [];
let visited = new Set();
let visited2 = new Set();
let direction = [];
let previous = [];

let nextMove;
let previousMove;
DFSbtn.disabled = true;

function createMaze(rows, columns) {
  displayMaze.innerHTML = "";

  let maze = [];
  displayMaze.style.gridTemplateColumns = `repeat(${columns}, ${pixelSize}`;
  displayMaze.style.gridTemplateRows = `repeat(${rows}, ${pixelSize})`;

  for (let r = 0; r < rows; r++) {
    let row = [];

    for (let c = 0; c < columns; c++) {
      row.push([r, c]);
      walls = document.createElement("div");
      walls.classList.add("wall");
      displayMaze.appendChild(walls);
    }
    maze.push(row);
  }

  return maze;
}

function randomStart() {
  let randomRow = Math.floor(Math.random() * rowNum);
  let randomCol = Math.floor(Math.random() * colNum);

  // Make sure both are odd numbers
  if (randomRow % 2 === 0) randomRow += 1;
  if (randomCol % 2 === 0) randomCol += 1;

  // Clamp in case they go out of bounds
  if (randomRow >= rowNum) randomRow = rowNum - 2;
  if (randomCol >= colNum) randomCol = colNum - 2;

  current = maze[randomRow][randomCol];
  trackStart = playerPosition;
  console.log("Start at:", current);
}

function drawMaze() {
  visited.add(previousMove);
  visited.add(current);

  getDistanceNeighbour();

  if (nextMove) {
    console.log(` moving to ${nextMove}`);

    stack.push(current);

    current = nextMove;
  } else if (stack.length > 0) {
    current = stack.pop();
    console.log("Backtracking to", current);
  } else {
    console.log(visited);
    console.log(direction);
    let [x, y] = playerPosition;

    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = "red";
    canMove = true;
    createGoal();
    DFSbtn.disabled = false;
    return;
  }

  requestAnimationFrame(drawMaze);
}

function getDistanceNeighbour() {
  let [x, y] = current;

  let top = maze[x - 1]?.[y];
  let down = maze[x + 1]?.[y];
  let right = maze[x]?.[y + 1];
  let left = maze[x]?.[y - 1];

  let targetTopWall = maze[x - 2]?.[y];
  let targetBottomWall = maze[x + 2]?.[y];
  let targetRightWall = maze[x]?.[y + 2];
  let targetLeftWall = maze[x]?.[y - 2];

  let index = x * colNum + y;
  let currentwall = walls[index];

  if (top && !visited.has(targetTopWall)) {
    direction.push(targetTopWall);
    previous.push(top);
  }
  if (down && !visited.has(targetBottomWall)) {
    direction.push(targetBottomWall);
    previous.push(down);
  }
  if (right && !visited.has(targetRightWall)) {
    direction.push(targetRightWall);
    previous.push(right);
  }
  if (left && !visited.has(targetLeftWall)) {
    direction.push(targetLeftWall);
    previous.push(left);
  }

  if (direction.length > 0) {
    let moveTo = Math.floor(Math.random() * direction.length);

    nextMove = direction[moveTo];

    previousMove = previous[moveTo];
    if (nextMove) {
      let [x1, y1] = current;
      let [x2, y2] = nextMove;
      let wallX = Math.floor((x1 + x2) / 2);
      let wallY = Math.floor((y1 + y2) / 2);
      let wallIndex = wallX * colNum + wallY;
      let currentBetweenWall = walls[wallIndex];
      currentBetweenWall.style.backgroundColor = "black";
      currentBetweenWall.classList.add("openWall");
      currentBetweenWall.classList.remove("wall");
    }

    direction = [];
    previous = [];
  } else {
    nextMove = undefined;
  }

  //console.log(current)
  currentwall.style.backgroundColor = "black";
  currentwall.classList.add("openWall");
  currentwall.classList.remove("wall");
}
//DSF
const parent = new Map();

function highlightPath() {
  let [x, y] = nextMove;

  nextMove = parent.get(nextMove);
  console.log(nextMove);
  let index = x * colNum + y;
  let currentwall = walls[index];
  currentwall.style.backgroundColor = "green";

  if (parent.get(nextMove) || nextMove) {
    highlightPath();
  }
  [x, y] = playerPosition;
  index = x * colNum + y;
  currentwall = walls[index];
  currentwall.style.backgroundColor = "red";
  return;
}

function trackMaze() {
  visited2.add(trackStart);

  getNeighbour();

  if (nextMove) {
    console.log(nextMove);
    console.log(goal);

    parent.set(nextMove, trackStart);
    stack2.push(trackStart);
    trackStart = nextMove;
  } else if (stack2.length > 0) {
    trackStart = stack2.pop();

    console.log("Backtracking to", trackStart);
  } else {
    nextMove = parent.get(goal);
    //highlight goal
    let [x, y] = goal;
    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = "green";
    highlightPath();

    return;
  }

  requestAnimationFrame(trackMaze);
}

function getNeighbour() {
  console.log("tracking");
  let [x, y] = trackStart;

  console.log(trackStart);

  let top = maze[x - 1]?.[y];
  let down = maze[x + 1]?.[y];
  let right = maze[x]?.[y + 1];
  let left = maze[x]?.[y - 1];

  let index = x * colNum + y;
  let currentwall = walls[index];

  if (top && visited.has(top) && !visited2.has(top)) {
    console.log("going Up");

    direction.push(top);
  }
  if (down && visited.has(down) && !visited2.has(down)) {
    console.log("going Down");

    direction.push(down);
  }
  if (right && visited.has(right) && !visited2.has(right)) {
    console.log("going right");

    direction.push(right);
  }
  if (left && visited.has(left) && !visited2.has(left)) {
    console.log("going left");
    direction.push(left);
  }

  if (direction.length > 0) {
    let moveTo = Math.floor(Math.random() * direction.length);
    nextMove = direction[moveTo];
    currentwall.style.backgroundColor = "Blue";
  } else {
    console.log("nothing");
    console.log(visited, visited2);
    nextMove = undefined;
  }

  //console.log(current)

  direction = [];

  currentwall.style.backgroundColor = "Blue";
}

DFSbtn.addEventListener("click", trackMaze);

document.addEventListener("keydown", (event) => {
  if (!canMove) {
    return;
  }

  let [x, y] = playerPosition;
  let top = maze[x - 1]?.[y];
  let down = maze[x + 1]?.[y];
  let right = maze[x]?.[y + 1];
  let left = maze[x]?.[y - 1];

  let index = x * colNum + y;
  let currentwall = walls[index];

  previousPosition = currentwall;

  let color = "red";

  if (event.key == "d" && right && visited.has(right)) {
    [x, y] = right;

    playerPosition = right;
    steps++;

    console.log("going right");

    console.log(playerPosition);
    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = color;

    previousPosition.style.backgroundColor = "black";
  }

  if (event.key === "a" && left && visited.has(left)) {
    [x, y] = left;
    playerPosition = left;
    steps++;
    console.log("going left");

    console.log(playerPosition);
    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = color;
    previousPosition.style.backgroundColor = "black";
  }

  if (event.key === "w" && top && visited.has(top)) {
    [x, y] = top;
    playerPosition = top;
    steps++;
    console.log("going up");

    console.log(playerPosition);
    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = color;
    previousPosition.style.backgroundColor = "black";
  }

  if (event.key === "s" && down && visited.has(down)) {
    [x, y] = down;
    playerPosition = down;
    steps++;
    console.log("going down");
    console.log(playerPosition);

    let index = x * colNum + y;
    let currentwall = walls[index];
    currentwall.style.backgroundColor = color;
    previousPosition.style.backgroundColor = "black";
  }
  goalChecker();
});

function createGoal() {
  let visitedArray = [...visited];

  const randomNum = Math.floor(Math.random() * visitedArray.length);

  goal = maze[rowNum - 2][colNum - 2];
  let [x, y] = goal;

  let index = x * colNum + y;
  let goalLocation = walls[index];
  console.log(goalLocation);
  goalLocation.style.backgroundColor = "white";
}

function goalChecker() {
  if (goal === playerPosition) {
    console.log("you found me");
    const winner = document.createElement("h1");
    winner.innerHTML = `You Found me, Took you ${steps} steps`;
    winner.style.display = "block";
    winner.style.position = "absolute";
    winner.style.top = "50%";
    winner.style.color = "Pink";
    winner.style.fontSize = "64px";
    body.append(winner);
    canMove = false;
    setTimeout(() => {
      winner.remove();
    }, 5000);
  }
}

preset1.addEventListener("click", () => {
  DFSbtn.disabled = true;
  rowNum = 11;
  colNum = 21;
  pixelSize = "32px";
  maze = createMaze(rowNum, colNum);
  walls = document.querySelectorAll(".wall");
  playerPosition = maze[1][1];

  randomStart();
  drawMaze();
});

preset2.addEventListener("click", () => {
  DFSbtn.disabled = true;
  rowNum = 21;
  colNum = 31;
  pixelSize = "32px";
  maze = createMaze(rowNum, colNum);
  walls = document.querySelectorAll(".wall");
  playerPosition = maze[1][1];
  randomStart();
  drawMaze();
});

preset3.addEventListener("click", () => {
  DFSbtn.disabled = true;
  rowNum = 31;
  colNum = 41;
  pixelSize = "22px";
  maze = createMaze(rowNum, colNum);
  walls = document.querySelectorAll(".wall");
  playerPosition = maze[1][1];
  randomStart();
  drawMaze();
});
