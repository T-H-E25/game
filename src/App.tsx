import React, { useState, useEffect, useRef } from 'react';
import { Target, Target3D } from './components/Target';
import GameOverlay from './components/GameOverlay';
import StartScreen from './components/StartScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { useGameLogic } from './hooks/useGameLogic';
import { useTargetSpawner } from './hooks/useTargetSpawner';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useAuth } from './hooks/useAuth';
import './App.css';

type UserType = 'free' | 'member' | null;
type AppScreen = 'welcome' | 'start' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userType, setUserType] = useState<UserType>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameMode, setGameMode] = useState('2d');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [crosshairState, setCrosshairState] = useState('default'); // 'default', 'near-target', 'on-target'
  
  // Use refs for performance optimization
  const proximityCheckRef = useRef<number>();
  const targetCacheRef = useRef<Array<{id: string, x: number, y: number, radius: number}>>([]);
  const lastProximityCheck = useRef<number>(0);
  
  const { isAuthenticated, user, loading: authLoading } = useAuth();

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

  const { targets, spawnTarget, removeTarget } = useTargetSpawner(difficulty, gameStarted, isPaused, gameMode);
  const { playShootSound, playHitSound, playMissSound } = useSoundEffects();

  useEffect(() => {
    // Don't check localStorage while auth is loading
    if (authLoading) return;

    // Check if user has visited before
    const hasVisited = localStorage.getItem('sh1tshot-visited');
    const savedUserType = localStorage.getItem('sh1tshot-user-type') as UserType;
    
    if (hasVisited && savedUserType) {
      // If user was previously a member but is no longer authenticated, show welcome screen
      if (savedUserType === 'member' && !isAuthenticated) {
        setCurrentScreen('welcome');
        return;
      }
      
      setUserType(savedUserType);
      setCurrentScreen('start');
    }
  }, [authLoading, isAuthenticated]);

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

  const handleSelectUserType = (selectedUserType: UserType) => {
    // If selecting member type but not authenticated, the WelcomeScreen will handle auth
    if (selectedUserType === 'member' && !isAuthenticated) {
      return; // Let WelcomeScreen handle the authentication flow
    }

    setUserType(selectedUserType);
    localStorage.setItem('sh1tshot-visited', 'true');
    localStorage.setItem('sh1tshot-user-type', selectedUserType || '');
    setCurrentScreen('start');
  };

  const handleStartGame = (selectedDifficulty, selectedMode) => {
    setDifficulty(selectedDifficulty);
    setGameMode(selectedMode);
    startGame(selectedMode);
    setGameStarted(true);
    setCurrentScreen('game');
  };

  // Optimized proximity checking with caching and throttling
  const updateTargetCache = () => {
    const cache = [];
    for (const target of targets) {
      const targetElement = document.getElementById(`target-${target.id}`);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        cache.push({
          id: target.id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          radius: rect.width / 2
        });
      }
    }
    targetCacheRef.current = cache;
  };

  const checkCrosshairProximityOptimized = (x, y) => {
    if (!gameStarted || isPaused || targets.length === 0) {
      setCrosshairState('default');
      return;
    }

    // Throttle proximity checks to every 16ms (60fps)
    const now = performance.now();
    if (now - lastProximityCheck.current < 16) {
      return;
    }
    lastProximityCheck.current = now;

    // Update target cache
    updateTargetCache();

    let closestDistance = Infinity;
    let isOnTarget = false;

    for (const cachedTarget of targetCacheRef.current) {
      // Calculate distance from crosshair to target center
      const distance = Math.sqrt(
        Math.pow(cachedTarget.x - x, 2) + Math.pow(cachedTarget.y - y, 2)
      );
      
      // Check if crosshair is directly on target
      if (distance <= cachedTarget.radius) {
        isOnTarget = true;
        break;
      }
      
      // Track closest target for near-target detection
      if (distance < closestDistance) {
        closestDistance = distance;
      }
    }

    // Update crosshair state only if changed
    const newState = isOnTarget ? 'on-target' : 
                     closestDistance <= 80 ? 'near-target' : 'default';
    
    if (newState !== crosshairState) {
      setCrosshairState(newState);
    }
  };

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Update position immediately for smooth movement
    setMousePosition({ x, y });
    
    // Schedule proximity check for next frame
    if (proximityCheckRef.current) {
      cancelAnimationFrame(proximityCheckRef.current);
    }
    proximityCheckRef.current = requestAnimationFrame(() => {
      checkCrosshairProximityOptimized(x, y);
    });
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      
      // Update position immediately for smooth movement
      setMousePosition({ x, y });
      
      // Schedule proximity check for next frame
      if (proximityCheckRef.current) {
        cancelAnimationFrame(proximityCheckRef.current);
      }
      proximityCheckRef.current = requestAnimationFrame(() => {
        checkCrosshairProximityOptimized(x, y);
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
    
    // Check if any target was hit using cached positions
    let hit = false;
    
    for (const cachedTarget of targetCacheRef.current) {
      // Calculate distance from click to target center
      const distance = Math.sqrt(
        Math.pow(cachedTarget.x - x, 2) + Math.pow(cachedTarget.y - y, 2)
      );
      
      // Check if click is within target radius
      if (distance <= cachedTarget.radius) {
        hit = true;
        playHitSound();
        registerHit();
        removeTarget(cachedTarget.id);
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
    
    // Check if any target was hit using cached positions
    let hit = false;
    
    for (const cachedTarget of targetCacheRef.current) {
      // Calculate distance from current position to target center
      const distance = Math.sqrt(
        Math.pow(cachedTarget.x - x, 2) + Math.pow(cachedTarget.y - y, 2)
      );
      
      // Check if position is within target radius
      if (distance <= cachedTarget.radius) {
        hit = true;
        playHitSound();
        registerHit();
        removeTarget(cachedTarget.id);
        spawnTarget();
        break;
      }
    }
    
    if (!hit) {
      playMissSound();
      registerMiss();
    }
  };

  const handleGameOver = async () => {
    await endGame(gameMode);
    setGameStarted(false);
    setCurrentScreen('start');
  };

  const handleQuitGame = () => {
    quitGame();
    setGameStarted(false);
    setCurrentScreen('start');
  };

  useEffect(() => {
    if (currentScreen === 'game') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (proximityCheckRef.current) {
        cancelAnimationFrame(proximityCheckRef.current);
      }
    };
  }, [currentScreen, gameStarted, isPaused, targets.length, crosshairState]);

  // Show loading screen while authentication is being checked
  if (authLoading) {
    return (
      <div className="game-container">
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-header">
              <div className="brand-logo">
                <Target size={60} />
              </div>
              <h1 className="brand-title">SH!TSHOT</h1>
              <p className="welcome-subtitle">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onSelectUserType={handleSelectUserType} />;
      
      case 'start':
        return <StartScreen onStartGame={handleStartGame} userType={userType} />;
      
      case 'game':
        return (
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
              className={`crosshair ${crosshairState}`}
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
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`game-container ${currentScreen === 'game' ? 'game-active' : ''}`}
      onClick={currentScreen === 'game' ? handleShoot : undefined}
      onTouchEnd={currentScreen === 'game' ? handleShoot : undefined}
    >
      {renderCurrentScreen()}
    </div>
  );
}

export default App;