import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LEVELS } from '@/lib/gameState';

interface MainMenuProps {
  onStartGame: (level: number) => void;
  bestTimes: Record<number, number>;
  unlockedLevels: number;
}

export function MainMenu({ onStartGame, bestTimes, unlockedLevels }: MainMenuProps) {
  const [showLevels, setShowLevels] = useState(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(270 40% 10%) 0%, hsl(240 15% 5%) 100%)'
          }}
        />
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: `hsla(180, 100%, 50%, ${Math.random() * 0.3 + 0.1})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* Title */}
        <div className="mb-2 text-6xl animate-float">🐱</div>
        <h1 className="text-3xl md:text-4xl font-pixel text-glow-cyan mb-2">
          CatMiniMaze
        </h1>
        <h2 className="text-xl md:text-2xl font-pixel text-glow-orange mb-8">
          QUEST
        </h2>
        
        <p className="text-lg font-retro text-muted-foreground mb-12 max-w-md">
          Navigate the shifting darkness. Avoid the Stalker. 
          Find the exit before it finds you.
        </p>

        {!showLevels ? (
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => onStartGame(0)}
              size="lg"
              className="font-pixel text-lg px-12 py-6 bg-primary hover:bg-primary/80 text-primary-foreground box-glow-cyan"
            >
              START GAME
            </Button>
            <Button 
              onClick={() => setShowLevels(true)}
              variant="outline"
              className="font-pixel text-sm border-secondary text-secondary-foreground hover:bg-secondary/20"
            >
              SELECT LEVEL
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-pixel text-foreground mb-4">SELECT LEVEL</h3>
            <div className="grid gap-3 max-w-sm mx-auto">
              {LEVELS.map((config, index) => {
                const isLocked = index > unlockedLevels;
                const time = bestTimes[index];
                
                return (
                  <Button
                    key={index}
                    onClick={() => !isLocked && onStartGame(index)}
                    disabled={isLocked}
                    variant={isLocked ? "ghost" : "outline"}
                    className={`
                      w-full font-retro text-lg py-6 flex justify-between items-center
                      ${isLocked ? 'opacity-50 cursor-not-allowed' : 'border-primary hover:bg-primary/10'}
                    `}
                  >
                    <span>
                      {isLocked ? '🔒' : '▶'} Level {index + 1}
                    </span>
                    {time && (
                      <span className="text-sm text-accent">
                        ⏱ {formatTime(time)}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
            <Button 
              onClick={() => setShowLevels(false)}
              variant="ghost"
              className="font-pixel text-sm text-muted-foreground"
            >
              ← BACK
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-16 text-sm font-retro text-muted-foreground space-y-2">
          <p>🎮 WASD or Arrow Keys to move</p>
          <p>👁️ Stay still to hide (Space)</p>
          <p>💨 Shift + Direction to dash</p>
          <p>💣 Collect bombs to blast walls</p>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-xs font-retro text-muted-foreground">
        v1.0 - "Into South Building"
      </div>
    </div>
  );
}
