import { Maze, generateMaze, findPath, getDistance } from './mazeGenerator';

export interface GameState {
  maze: Maze;
  playerX: number;
  playerY: number;
  stalkerX: number;
  stalkerY: number;
  stalker2X: number | null;
  stalker2Y: number | null;
  visionRadius: number;
  baseVisionRadius: number;
  bombs: number;
  stepCount: number;
  silentStep: boolean;
  isFreeze: boolean;
  freezeTimer: number;
  dashCooldown: number;
  isDashing: boolean;
  level: number;
  isGameOver: boolean;
  isVictory: boolean;
  startTime: number;
  elapsedTime: number;
  stalkerDistance: number;
  secondStalkerSpawned: boolean;
}

export interface LevelConfig {
  width: number;
  height: number;
  trapCount: number;
  bombCount: number;
  visionRadius: number;
  stalkerSpeed: number;
  secondStalkerTime: number; // seconds until second stalker spawns
}

export const LEVELS: LevelConfig[] = [
  { width: 15, height: 15, trapCount: 2, bombCount: 2, visionRadius: 4, stalkerSpeed: 800, secondStalkerTime: 180 },
  { width: 19, height: 19, trapCount: 4, bombCount: 2, visionRadius: 3.5, stalkerSpeed: 700, secondStalkerTime: 150 },
  { width: 23, height: 23, trapCount: 6, bombCount: 3, visionRadius: 3, stalkerSpeed: 600, secondStalkerTime: 120 },
  { width: 27, height: 27, trapCount: 8, bombCount: 3, visionRadius: 2.5, stalkerSpeed: 500, secondStalkerTime: 90 },
  { width: 31, height: 31, trapCount: 10, bombCount: 4, visionRadius: 2, stalkerSpeed: 400, secondStalkerTime: 60 },
];

export function createInitialState(level: number = 0): GameState {
  const config = LEVELS[Math.min(level, LEVELS.length - 1)];
  const maze = generateMaze(config.width, config.height, config.trapCount, config.bombCount);
  
  // Place stalker far from player
  let stalkerX = maze.exitX;
  let stalkerY = maze.exitY - 2;
  
  // Find valid floor tile for stalker
  if (maze.grid[stalkerY]?.[stalkerX]?.type === 'wall') {
    for (let y = maze.height - 3; y > maze.height / 2; y--) {
      for (let x = maze.width - 3; x > maze.width / 2; x--) {
        if (maze.grid[y][x].type === 'floor') {
          stalkerX = x;
          stalkerY = y;
          break;
        }
      }
    }
  }

  return {
    maze,
    playerX: maze.startX,
    playerY: maze.startY,
    stalkerX,
    stalkerY,
    stalker2X: null,
    stalker2Y: null,
    visionRadius: config.visionRadius,
    baseVisionRadius: config.visionRadius,
    bombs: 0,
    stepCount: 0,
    silentStep: false,
    isFreeze: false,
    freezeTimer: 0,
    dashCooldown: 0,
    isDashing: false,
    level,
    isGameOver: false,
    isVictory: false,
    startTime: Date.now(),
    elapsedTime: 0,
    stalkerDistance: getDistance(maze.startX, maze.startY, stalkerX, stalkerY),
    secondStalkerSpawned: false
  };
}

export function movePlayer(
  state: GameState,
  dx: number,
  dy: number
): GameState {
  if (state.isGameOver || state.isVictory || state.isFreeze) {
    return state;
  }

  const newX = state.playerX + dx;
  const newY = state.playerY + dy;

  // Check bounds
  if (newX < 0 || newX >= state.maze.width || newY < 0 || newY >= state.maze.height) {
    return state;
  }

  const cell = state.maze.grid[newY][newX];

  // Can't walk through walls
  if (cell.type === 'wall') {
    return state;
  }

  let newState = { ...state };
  newState.playerX = newX;
  newState.playerY = newY;
  newState.stepCount += 1;
  newState.isFreeze = false;
  newState.freezeTimer = 0;
  newState.visionRadius = state.baseVisionRadius;

  // Shadow Step passive - every 10 steps, next is silent
  if (newState.stepCount % 10 === 0) {
    newState.silentStep = true;
  }

  // Handle cell types
  if (cell.type === 'exit') {
    newState.isVictory = true;
    newState.elapsedTime = Date.now() - state.startTime;
  } else if (cell.type === 'bomb') {
    newState.bombs += 1;
    newState.maze.grid[newY][newX].type = 'floor';
  } else if (cell.type === 'trap') {
    // Trap will be handled by the game loop (1 second timer)
  }

  // Update stalker distance
  newState.stalkerDistance = getDistance(newX, newY, state.stalkerX, state.stalkerY);

  return newState;
}

export function moveStalker(state: GameState, silent: boolean = false): GameState {
  if (state.isGameOver || state.isVictory) return state;
  
  // If player is using silent step, stalker doesn't move
  if (state.silentStep && !silent) {
    return { ...state, silentStep: false };
  }

  let newState = { ...state };

  // Move main stalker
  const path = findPath(
    state.maze,
    state.stalkerX,
    state.stalkerY,
    state.playerX,
    state.playerY
  );

  if (path.length > 1) {
    newState.stalkerX = path[1][0];
    newState.stalkerY = path[1][1];
  }

  // Check collision with player
  if (newState.stalkerX === state.playerX && newState.stalkerY === state.playerY) {
    newState.isGameOver = true;
    newState.elapsedTime = Date.now() - state.startTime;
  }

  // Move second stalker if spawned
  if (state.stalker2X !== null && state.stalker2Y !== null) {
    const path2 = findPath(
      state.maze,
      state.stalker2X,
      state.stalker2Y,
      state.playerX,
      state.playerY
    );

    if (path2.length > 1) {
      newState.stalker2X = path2[1][0];
      newState.stalker2Y = path2[1][1];
    }

    if (newState.stalker2X === state.playerX && newState.stalker2Y === state.playerY) {
      newState.isGameOver = true;
      newState.elapsedTime = Date.now() - state.startTime;
    }
  }

  // Update stalker distance
  newState.stalkerDistance = getDistance(state.playerX, state.playerY, newState.stalkerX, newState.stalkerY);

  return newState;
}

export function useBomb(state: GameState, direction: 'up' | 'down' | 'left' | 'right'): GameState {
  if (state.bombs <= 0 || state.isGameOver || state.isVictory) return state;

  const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
  const dy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;

  const targetX = state.playerX + dx;
  const targetY = state.playerY + dy;

  if (
    targetX >= 0 && targetX < state.maze.width &&
    targetY >= 0 && targetY < state.maze.height &&
    state.maze.grid[targetY][targetX].type === 'wall'
  ) {
    const newMaze = { ...state.maze };
    newMaze.grid = state.maze.grid.map(row => [...row]);
    newMaze.grid[targetY][targetX] = { ...newMaze.grid[targetY][targetX], type: 'floor' };

    return {
      ...state,
      maze: newMaze,
      bombs: state.bombs - 1
    };
  }

  return state;
}

export function dash(state: GameState, dx: number, dy: number): GameState {
  if (state.dashCooldown > 0 || state.isGameOver || state.isVictory) return state;

  let newState = { ...state, isDashing: true, dashCooldown: 5 };

  // Dash 2 tiles
  for (let i = 0; i < 2; i++) {
    const newX = newState.playerX + dx;
    const newY = newState.playerY + dy;

    if (
      newX >= 0 && newX < state.maze.width &&
      newY >= 0 && newY < state.maze.height &&
      state.maze.grid[newY][newX].type !== 'wall'
    ) {
      newState.playerX = newX;
      newState.playerY = newY;
    } else {
      break;
    }
  }

  setTimeout(() => {
    // Reset dash animation
  }, 100);

  return newState;
}

export function toggleFreeze(state: GameState, freeze: boolean): GameState {
  if (freeze && !state.isFreeze) {
    return { ...state, isFreeze: true, freezeTimer: 0 };
  } else if (!freeze && state.isFreeze) {
    return { ...state, isFreeze: false, freezeTimer: 0, visionRadius: state.baseVisionRadius };
  }
  return state;
}

export function updateFreezeVision(state: GameState): GameState {
  if (!state.isFreeze) return state;

  const newTimer = state.freezeTimer + 0.1;
  const visionDecay = Math.max(0.5, state.baseVisionRadius - (newTimer * 0.3));

  return {
    ...state,
    freezeTimer: newTimer,
    visionRadius: visionDecay
  };
}

export function spawnSecondStalker(state: GameState): GameState {
  if (state.secondStalkerSpawned) return state;

  return {
    ...state,
    stalker2X: state.maze.exitX,
    stalker2Y: state.maze.exitY,
    secondStalkerSpawned: true
  };
}
