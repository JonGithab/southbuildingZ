import { useState, useEffect } from 'react';
import { MainMenu } from '@/components/game/MainMenu';
import { GameCanvas } from '@/components/game/GameCanvas';

type GameScreen = 'menu' | 'playing';

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});
  const [unlockedLevels, setUnlockedLevels] = useState(0);

  // Load saved data
  useEffect(() => {
    const savedTimes = localStorage.getItem('catmaze-best-times');
    const savedUnlocked = localStorage.getItem('catmaze-unlocked');
    
    if (savedTimes) {
      setBestTimes(JSON.parse(savedTimes));
    }
    if (savedUnlocked) {
      setUnlockedLevels(parseInt(savedUnlocked, 10));
    }
  }, []);

  const handleStartGame = (level: number) => {
    setCurrentLevel(level);
    setScreen('playing');
  };

  const handleMainMenu = () => {
    setScreen('menu');
  };

  const handleNewBestTime = (level: number, time: number) => {
    const newTimes = { ...bestTimes, [level]: time };
    setBestTimes(newTimes);
    localStorage.setItem('catmaze-best-times', JSON.stringify(newTimes));
  };

  const handleLevelComplete = (level: number) => {
    if (level >= unlockedLevels) {
      const newUnlocked = level + 1;
      setUnlockedLevels(newUnlocked);
      localStorage.setItem('catmaze-unlocked', newUnlocked.toString());
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {screen === 'menu' && (
        <MainMenu 
          onStartGame={handleStartGame}
          bestTimes={bestTimes}
          unlockedLevels={unlockedLevels}
        />
      )}
      {screen === 'playing' && (
        <GameCanvas
          level={currentLevel}
          onMainMenu={handleMainMenu}
          bestTimes={bestTimes}
          onNewBestTime={handleNewBestTime}
          onLevelComplete={handleLevelComplete}
        />
      )}
    </div>
  );
};

export default Index;
