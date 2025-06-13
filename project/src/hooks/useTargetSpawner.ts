import { useState, useEffect, useCallback } from 'react';

interface Target {
  id: string;
  x: number;
  y: number;
  z?: number;
  size: number;
  speed: number;
}

export const useTargetSpawner = (difficulty: string, isGameActive: boolean, isPaused: boolean = false, gameMode: string = '2d') => {
  const [targets, setTargets] = useState<Target[]>([]);
  
  // Get spawn parameters based on difficulty
  const getSpawnParameters = () => {
    // Use smaller target sizes for better gameplay
    switch (difficulty) {
      case 'easy':
        return {
          maxTargets: 3,
          targetSize: { min: 30, max: 50 },
          targetSpeed: { min: 0.6, max: 1.2 },
          spawnInterval: 2000,
        };
      case 'hard':
        return {
          maxTargets: 5,
          targetSize: { min: 20, max: 35 },
          targetSpeed: { min: 1.2, max: 2 },
          spawnInterval: 1000,
        };
      case 'medium':
      default:
        return {
          maxTargets: 4,
          targetSize: { min: 25, max: 40 },
          targetSpeed: { min: 0.8, max: 1.5 },
          spawnInterval: 1500,
        };
    }
  };
  
  const { maxTargets, targetSize, targetSpeed, spawnInterval } = getSpawnParameters();
  
  // Generate a random target
  const generateTarget = useCallback((): Target => {
    let size = Math.floor(Math.random() * (targetSize.max - targetSize.min + 1)) + targetSize.min;
    
    // Make 3D targets 10% larger to compensate for perspective scaling
    if (gameMode === '3d') {
      size = Math.floor(size * 1.1);
    }
    
    const speed = Math.random() * (targetSpeed.max - targetSpeed.min) + targetSpeed.min;
    
    // Calculate position with padding to avoid edges and ensure targets stay within viewport
    const safeMargin = size * 2;
    
    // Get actual visible area
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    
    // Calculate safe area for spawning targets
    const maxWidth = viewportWidth - (safeMargin * 2);
    const maxHeight = viewportHeight - (safeMargin * 2);
    
    const x = Math.random() * maxWidth + safeMargin;
    const y = Math.random() * maxHeight + safeMargin;
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      z: Math.random() * 700 + 100, // For 3D targets
      size,
      speed,
    };
  }, [targetSize, targetSpeed, gameMode]);
  
  // Spawn a new target
  const spawnTarget = useCallback(() => {
    if (targets.length < maxTargets && !isPaused) {
      setTargets(prev => [...prev, generateTarget()]);
    }
  }, [targets.length, maxTargets, generateTarget, isPaused]);
  
  // Remove a target
  const removeTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(target => target.id !== id));
  }, []);
  
  // Automatically spawn targets when game is active
  useEffect(() => {
    let spawnTimer: number;
    
    if (isGameActive && !isPaused) {
      // Spawn initial targets
      if (targets.length === 0) {
        const initialTargets = Array(Math.min(2, maxTargets))
          .fill(null)
          .map(() => generateTarget());
        setTargets(initialTargets);
      }
      
      // Set up interval for spawning more targets
      spawnTimer = window.setInterval(() => {
        if (targets.length < maxTargets) {
          spawnTarget();
        }
      }, spawnInterval);
    } else if (!isGameActive) {
      // Clear targets when game is not active
      setTargets([]);
    }
    
    return () => {
      if (spawnTimer) clearInterval(spawnTimer);
    };
  }, [isGameActive, isPaused, targets.length, maxTargets, spawnInterval, generateTarget, spawnTarget]);
  
  return {
    targets,
    spawnTarget,
    removeTarget,
  };
};