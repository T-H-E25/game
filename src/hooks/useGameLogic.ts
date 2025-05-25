import { useState, useEffect, useCallback } from 'react';

export const useGameLogic = (difficulty: string) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
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
  const startGame = useCallback(() => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setAccuracy(0);
    setTimeLeft(gameDuration);
    setIsGameActive(true);
  }, [gameDuration]);
  
  // End the game
  const endGame = useCallback(() => {
    setIsGameActive(false);
  }, []);
  
  // Register a hit
  const registerHit = useCallback(() => {
    setScore(prev => prev + hitPoints);
    setHits(prev => prev + 1);
  }, [hitPoints]);
  
  // Register a miss
  const registerMiss = useCallback(() => {
    setScore(prev => Math.max(0, prev + missPoints));
    setMisses(prev => prev + 1);
  }, [missPoints]);
  
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
    
    if (isGameActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      endGame();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, timeLeft, endGame]);
  
  return {
    score,
    timeLeft,
    hits,
    misses,
    accuracy,
    startGame,
    endGame,
    registerHit,
    registerMiss,
  };
};