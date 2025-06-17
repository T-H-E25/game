import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useGameData } from './useGameData';

export const useGameLogic = (difficulty: string) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  
  const { isAuthenticated } = useAuth();
  const { submitGameSession } = useGameData();
  
  // Set game parameters based on difficulty
  const getGameParameters = () => {
    switch (difficulty) {
      case 'easy':
        return {
          gameDuration: 60,
          hitPoints: 10,
          missPoints: -5,
        };
      case 'hard':
        return {
          gameDuration: 45,
          hitPoints: 15,
          missPoints: -10,
        };
      case 'medium':
      default:
        return {
          gameDuration: 60,
          hitPoints: 10,
          missPoints: -5,
        };
    }
  };
  
  const { gameDuration, hitPoints, missPoints } = getGameParameters();
  
  // Start the game
  const startGame = useCallback((gameMode: string = '2d') => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setAccuracy(0);
    setTimeLeft(gameDuration);
    setIsGameActive(true);
    setIsPaused(false);
    setGameStartTime(new Date());
  }, [gameDuration]);
  
  // End the game
  const endGame = useCallback(async (gameMode: string = '2d') => {
    setIsGameActive(false);
    setIsPaused(false);
    
    // Submit game session for authenticated users
    if (isAuthenticated && gameStartTime) {
      try {
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - gameStartTime.getTime()) / 1000);
        
        await submitGameSession({
          score,
          hits,
          misses,
          accuracy,
          difficulty,
          game_mode: gameMode,
          duration_seconds: durationSeconds,
          start_time: gameStartTime.toISOString(),
          end_time: endTime.toISOString(),
        });
        
        console.log('Game session submitted successfully');
      } catch (error) {
        console.error('Failed to submit game session:', error);
        // Don't show error to user, just log it
      }
    }
  }, [isAuthenticated, gameStartTime, score, hits, misses, accuracy, difficulty, submitGameSession]);
  
  // Pause/Resume the game
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  // Quit the game
  const quitGame = useCallback(() => {
    setIsGameActive(false);
    setIsPaused(false);
  }, []);
  
  // Register a hit
  const registerHit = useCallback(() => {
    if (isPaused) return;
    setScore(prev => prev + hitPoints);
    setHits(prev => prev + 1);
  }, [hitPoints, isPaused]);
  
  // Register a miss
  const registerMiss = useCallback(() => {
    if (isPaused) return;
    setScore(prev => Math.max(0, prev + missPoints));
    setMisses(prev => prev + 1);
  }, [missPoints, isPaused]);
  
  // Update accuracy
  useEffect(() => {
    if (hits + misses > 0) {
      setAccuracy(Math.round((hits / (hits + misses)) * 100));
    } else {
      setAccuracy(0);
    }
  }, [hits, misses]);
  
  // Timer logic
  useEffect(() => {
    let timer: number;
    
    if (isGameActive && timeLeft > 0 && !isPaused) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      // Don't automatically end here - let the component handle it
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, timeLeft, isPaused]);
  
  return {
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
  };
};