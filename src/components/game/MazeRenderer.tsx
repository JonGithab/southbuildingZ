import { useMemo } from 'react';
import { GameState } from '@/lib/gameState';
import { getDistance } from '@/lib/mazeGenerator';
import { MazeCell } from './MazeCell';
import { cn } from '@/lib/utils';

interface MazeRendererProps {
  state: GameState;
  shaking: boolean;
}

export function MazeRenderer({ state, shaking }: MazeRendererProps) {
  const cellSize = useMemo(() => {
    const maxSize = Math.min(600, window.innerWidth - 300);
    return Math.floor(maxSize / Math.max(state.maze.width, state.maze.height));
  }, [state.maze.width, state.maze.height]);

  const visibilityMap = useMemo(() => {
    const map: number[][] = [];
    for (let y = 0; y < state.maze.height; y++) {
      map[y] = [];
      for (let x = 0; x < state.maze.width; x++) {
        const dist = getDistance(x, y, state.playerX, state.playerY);
        if (dist <= state.visionRadius) {
          map[y][x] = 1 - (dist / (state.visionRadius + 1));
        } else if (dist <= state.visionRadius + 1) {
          map[y][x] = 0.1;
        } else {
          map[y][x] = 0;
        }
      }
    }
    return map;
  }, [state.playerX, state.playerY, state.visionRadius, state.maze.height, state.maze.width]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-border",
        shaking && "animate-shake"
      )}
      style={{
        boxShadow: '0 0 50px hsla(180, 100%, 50%, 0.1), inset 0 0 100px hsla(240, 15%, 5%, 0.9)'
      }}
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines z-30 pointer-events-none" />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, hsla(240, 15%, 2%, 0.8) 100%)'
        }}
      />

      {/* Maze grid */}
      <div 
        className="relative z-10"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${state.maze.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${state.maze.height}, ${cellSize}px)`,
          backgroundColor: 'hsl(240 15% 2%)'
        }}
      >
        {state.maze.grid.map((row, y) =>
          row.map((cell, x) => (
            <MazeCell
              key={`${x}-${y}`}
              cell={cell}
              isPlayer={x === state.playerX && y === state.playerY}
              isStalker={x === state.stalkerX && y === state.stalkerY}
              isStalker2={x === state.stalker2X && y === state.stalker2Y}
              isVisible={visibilityMap[y][x] > 0}
              visibilityAlpha={visibilityMap[y][x]}
              cellSize={cellSize}
            />
          ))
        )}
      </div>
    </div>
  );
}
