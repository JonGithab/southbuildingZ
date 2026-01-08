import { Cell } from '@/lib/mazeGenerator';
import { cn } from '@/lib/utils';

interface MazeCellProps {
  cell: Cell;
  isPlayer: boolean;
  isStalker: boolean;
  isStalker2: boolean;
  isVisible: boolean;
  visibilityAlpha: number;
  cellSize: number;
}

export function MazeCell({
  cell,
  isPlayer,
  isStalker,
  isStalker2,
  isVisible,
  visibilityAlpha,
  cellSize
}: MazeCellProps) {
  const baseClasses = "transition-all duration-150 relative flex items-center justify-center";

  const getCellStyle = () => {
    if (!isVisible && !isPlayer) {
      return {
        backgroundColor: 'hsl(240 15% 2%)',
        opacity: 1
      };
    }

    const alpha = visibilityAlpha;

    switch (cell.type) {
      case 'wall':
        return {
          backgroundColor: `hsla(270, 40%, 15%, ${alpha})`,
          boxShadow: alpha > 0.5 ? 'inset 0 0 5px hsla(270, 40%, 25%, 0.5)' : 'none'
        };
      case 'floor':
      case 'start':
        return {
          backgroundColor: `hsla(240, 20%, 8%, ${alpha})`
        };
      case 'exit':
        return {
          backgroundColor: `hsla(120, 70%, 20%, ${alpha})`,
          boxShadow: `0 0 ${10 * alpha}px hsla(120, 70%, 50%, ${alpha * 0.5})`
        };
      case 'trap':
        return {
          backgroundColor: `hsla(40, 80%, 15%, ${alpha})`,
          backgroundImage: cell.crumbling 
            ? `repeating-linear-gradient(45deg, transparent, transparent 2px, hsla(40, 80%, 30%, ${alpha}) 2px, hsla(40, 80%, 30%, ${alpha}) 4px)`
            : 'none'
        };
      case 'bomb':
        return {
          backgroundColor: `hsla(240, 20%, 8%, ${alpha})`
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={cn(baseClasses)}
      style={{
        width: cellSize,
        height: cellSize,
        ...getCellStyle()
      }}
    >
      {/* Exit indicator */}
      {cell.type === 'exit' && isVisible && (
        <div 
          className="absolute inset-1 rounded animate-pulse-slow"
          style={{
            backgroundColor: 'hsla(120, 70%, 50%, 0.3)',
            boxShadow: '0 0 10px hsla(120, 70%, 50%, 0.5)'
          }}
        />
      )}

      {/* Bomb pickup */}
      {cell.type === 'bomb' && isVisible && (
        <div 
          className="text-lg animate-float"
          style={{
            textShadow: '0 0 10px hsl(45 100% 60%)'
          }}
        >
          💣
        </div>
      )}

      {/* Trap indicator */}
      {cell.type === 'trap' && isVisible && (
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xs",
            cell.crumbling && "animate-shake"
          )}
          style={{
            color: 'hsla(40, 80%, 60%, 0.7)'
          }}
        >
          ⚠
        </div>
      )}

      {/* Player */}
      {isPlayer && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div 
            className="text-xl"
            style={{
              filter: 'drop-shadow(0 0 8px hsl(30 100% 60%))',
              animation: 'float 2s ease-in-out infinite'
            }}
          >
            🐱
          </div>
        </div>
      )}

      {/* Main Stalker */}
      {isStalker && isVisible && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div 
            className="text-xl animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 15px hsl(0 100% 50%))'
            }}
          >
            👁️
          </div>
        </div>
      )}

      {/* Second Stalker */}
      {isStalker2 && isVisible && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div 
            className="text-xl animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 15px hsl(300 100% 50%))'
            }}
          >
            👁️
          </div>
        </div>
      )}

      {/* Vision edge glow */}
      {isVisible && visibilityAlpha < 0.5 && visibilityAlpha > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${cellSize / 2}px hsla(180, 100%, 50%, ${0.1 * visibilityAlpha})`
          }}
        />
      )}
    </div>
  );
}
