import React, { useState, useEffect, useRef } from 'react';
import { Target, Target3D } from './components/Target';
import GameOverlay from './components/GameOverlay';
import StartScreen from './components/StartScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { useTargetSpawner } from './hooks/useTargetSpawner';
import { useSoundEffects } from './hooks/useSoundEffects';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameMode, setGameMode] = useState('2d');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    score,
    timeLeft,
    hits,
    misses,
    accuracy,
    isPaused,
    startGame,
    endGame,
    togglePause,
    quitGame,
    registerHit,
    registerMiss,
  } = useGameLogic(difficulty);

  const { targets, spawnTarget, removeTarget } = useTargetSpawner(difficulty, gameStarted, isPaused);
  const { playShootSound, playHitSound, playMissSound } = useSoundEffects();

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleStartGame = (selectedDifficulty, selectedMode) => {
    setDifficulty(selectedDifficulty);
    setGameMode(selectedMode);
    startGame();
    setGameStarted(true);
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      setMousePosition({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
      e.preventDefault();
    }
  };

  const handleShoot = (e) => {
    if (!gameStarted || timeLeft <= 0 || isPaused) return;
    
    playShootSound();
    
    // Get click/touch coordinates
    let x, y;
    
    if (e.type === 'touchstart' || e.type === 'touchend') {
      // For touch events
      if (e.changedTouches && e.changedTouches[0]) {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
      } else {
        // Use current mouse position if touch position can't be determined
        x = mousePosition.x;
        y = mousePosition.y;
      }
      e.preventDefault();
    } else {
      // For mouse events
      x = e.clientX;
      y = e.clientY;
    }
    
    // Check if any target was hit
    let hit = false;
    
    for (const target of targets) {
      const targetElement = document.getElementById(`target-${target.id}`);
      if (!targetElement) continue;
      
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Calculate distance from click to target center
      const distance = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
      
      // Check if click is within target radius
      if (distance <= rect.width / 2) {
        hit = true;
        playHitSound();
        registerHit();
        removeTarget(target.id);
        spawnTarget();
        break;
      }
    }
    
    if (!hit) {
      playMissSound();
      registerMiss();
    }
  };

  const handleMobileShoot = () => {
    if (!gameStarted || timeLeft <= 0 || isPaused) return;
    
    playShootSound();
    
    // Use current mouse/touch position for shooting
    const x = mousePosition.x;
    const y = mousePosition.y;
    
    // Check if any target was hit
    let hit = false;
    
    for (const target of targets) {
      const targetElement = document.getElementById(`target-${target.id}`);
      if (!targetElement) continue;
      
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Calculate distance from current position to target center
      const distance = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
      
      // Check if position is within target radius
      if (distance <= rect.width / 2) {
        hit = true;
        playHitSound();
        registerHit();
        removeTarget(target.id);
        spawnTarget();
        break;
      }
    }
    
    if (!hit) {
      playMissSound();
      registerMiss();
    }
  };

  const handleGameOver = () => {
    endGame();
    setGameStarted(false);
  };

  const handleQuitGame = () => {
    quitGame();
    setGameStarted(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div 
      className={`game-container ${gameStarted ? 'game-active' : ''}`}
      onClick={handleShoot}
      onTouchEnd={handleShoot}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {gameStarted ? (
        <>
          <div className="targets-container">
            {targets.map(target => (
              gameMode === '2d' ? (
                <Target 
                  key={target.id} 
                  id={target.id} 
                  x={target.x} 
                  y={target.y} 
                  size={target.size} 
                  speed={target.speed}
                  isPaused={isPaused}
                />
              ) : (
                <Target3D 
                  key={target.id} 
                  id={target.id} 
                  x={target.x} 
                  y={target.y} 
                  z={target.z} 
                  size={target.size} 
                  speed={target.speed}
                  isPaused={isPaused}
                />
              )
            ))}
          </div>
          
          <GameOverlay 
            score={score}
            timeLeft={timeLeft}
            hits={hits}
            misses={misses}
            accuracy={accuracy}
            isPaused={isPaused}
            onGameOver={handleGameOver}
            onTogglePause={togglePause}
            onQuitGame={handleQuitGame}
          />
          
          <div 
            className="crosshair" 
            style={{ 
              left: `${mousePosition.x}px`, 
              top: `${mousePosition.y}px` 
            }}
          ></div>
          
          {isMobile && (
            <div className="mobile-controls">
              <button 
                className="mobile-shoot-button"
                onTouchEnd={handleMobileShoot}
              >
                FIRE
              </button>
            </div>
          )}
        </>
      ) : (
        <StartScreen onStartGame={handleStartGame} />
      )}
    </div>
  );
}

export default App;