function seed() {
  return [...arguments];
}

function same([x, y], [j, k]) {
  return x === j && y === k;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  //console.log(`this = ${JSON.stringify(this)}`);
  return (
    this &&
    Array.isArray(this) &&
    this.findIndex((live) => same(live, cell)) > -1
  );
}

const printCell = (cell, state) => {
  return contains.call(state, cell) ? "\u25A3" : "\u25A2";
};

const corners = (state = []) => {
  if (!state.length) {
    return { topRight: [0, 0], bottomLeft: [0, 0] };
  }
  const borders = {
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
  };
  state.forEach((cell) => {
    if (borders.left === undefined || borders.left > cell[0]) {
      borders.left = cell[0];
    }
    if (borders.right === undefined || borders.right < cell[0]) {
      borders.right = cell[0];
    }
    if (borders.top === undefined || borders.top < cell[1]) {
      borders.top = cell[1];
    }
    if (borders.bottom === undefined || borders.bottom > cell[1]) {
      borders.bottom = cell[1];
    }
  });
  return {
    topRight: [borders.right, borders.top],
    bottomLeft: [borders.left, borders.bottom],
  };
};

/* console.log(
  JSON.stringify(
    corners([
      [1, 2],
      [4, 1],
    ])
  )
); */

const printCells = (state) => {
  //console.log("pc");
  const cells = [];
  const borders = corners(state);
  //console.log("borders = " + JSON.stringify(borders));
  //console.log(`borders: ${JSON.stringify(borders)}`);
  for (let y = borders.topRight[1]; y >= borders.bottomLeft[1]; y--) {
    for (let x = borders.bottomLeft[0]; x <= borders.topRight[0]; x++) {
      const cell = [x, y];
      cells.push(printCell(cell, state), " ");
    }
    cells.splice(cells.length - 1, 1);
    cells.push("\n");
  }
  //console.log(`cells: ${JSON.stringify(cells)}`);
  return cells.join("");
};

/* console.log(
  printCells([
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4],
  ])
); */

const getNeighborsOf = ([x, y]) => {
  /* return [
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1],
  ]; */

  const neighbors = [];
  for (let xx = x - 1; xx <= x + 1; xx++) {
    for (let yy = y - 1; yy <= y + 1; yy++) {
      if (xx === x && yy === y) {
        continue;
      }
      neighbors.push([xx, yy]);
    }
  }
  return neighbors;
};

const getLivingNeighbors = (cell, state) => {
  const neighbors = getNeighborsOf(cell);
  const bindedContains = contains.bind(state);
  return neighbors.filter((neighbor) => bindedContains(neighbor));
};

const willBeAlive = (cell, state) => {
  // the cell has three living neighbors, or,
  // the cell is currently alive and has two living neighbors

  //console.log(`state = ${state}`);

  const livingNeighbors = getLivingNeighbors(cell, state);
  if (livingNeighbors.length == 3) {
    return true;
  }

  const isAlive = contains.call(state, cell);
  return isAlive && livingNeighbors.length == 2;
};

const calculateNext = (state) => {
  const nextState = [];
  const borders = corners(state);
  for (let x = borders.bottomLeft[0] - 1; x <= borders.topRight[0] + 1; x++) {
    for (let y = borders.bottomLeft[1] - 1; y <= borders.topRight[1] + 1; y++) {
      if (willBeAlive([x, y], state)) {
        nextState.push([x, y]);
      }
    }
  }
  return nextState;
};

const iterate = (state, iterations) => {
  const states = [state];
  for (let i = 0; i < iterations; i++) {
    const previousState = states[states.length - 1];
    const nextState = calculateNext(previousState);
    //console.log(printCells(state));
    states.push(nextState);
  }
  return states;
};

const startPatterns = {
  rpentomino: [
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4],
  ],
  glider: [
    [-2, -2],
    [-1, -2],
    [-2, -1],
    [-1, -1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [2, 3],
  ],
  square: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ],
};

//console.log(`test1: ${startPatterns.rpentomino}`);

const main = (pattern, iterations) => {
  const initState = startPatterns[pattern];
  //console.log(JSON.stringify(initState));
  //console.log("0:\n" + printCells(initState));
  iterate(initState, iterations).forEach((state) => {
    console.log(printCells(state));
    //console.log("\n");
  });
};

//console.log(main("rpentomino", 2));

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
  if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
    main(pattern, parseInt(iterations));
  } else {
    console.log("Usage: node js/gameoflife.js rpentomino 50");
  }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;
