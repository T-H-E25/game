import React, { useEffect, useState, useRef } from 'react';
import './Target.css';

interface TargetProps {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  isPaused?: boolean;
}

interface Target3DProps extends TargetProps {
  z: number;
}

export const Target: React.FC<TargetProps> = ({ id, x, y, size, speed, isPaused = false }) => {
  const [position, setPosition] = useState({ x, y });
  const [direction, setDirection] = useState({ x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 });
  const requestRef = useRef<number>();

  useEffect(() => {
    if (isPaused) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }

    const moveTarget = () => {
      setPosition(prev => {
        const newX = prev.x + direction.x * speed;
        const newY = prev.y + direction.y * speed;
        
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;
        
        // Get actual viewport dimensions
        const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
        const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
        
        // Bounce off edges
        if (newX <= 0 || newX >= viewportWidth - size) {
          newDirectionX = -direction.x;
        }
        
        if (newY <= 0 || newY >= viewportHeight - size) {
          newDirectionY = -direction.y;
        }
        
        if (newDirectionX !== direction.x || newDirectionY !== direction.y) {
          setDirection({ x: newDirectionX, y: newDirectionY });
        }
        
        return {
          x: Math.max(0, Math.min(viewportWidth - size, newX)),
          y: Math.max(0, Math.min(viewportHeight - size, newY))
        };
      });
      
      requestRef.current = requestAnimationFrame(moveTarget);
    };
    
    requestRef.current = requestAnimationFrame(moveTarget);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [direction, size, speed, isPaused]);

  return (
    <div
      id={`target-${id}`}
      className="target"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="target-ring outer"></div>
      <div className="target-ring middle"></div>
      <div className="target-ring inner"></div>
      <div className="target-ring bullseye"></div>
    </div>
  );
};

export const Target3D: React.FC<Target3DProps> = ({ id, x, y, z, size, speed, isPaused = false }) => {
  const [position, setPosition] = useState({ x, y, z });
  const [direction, setDirection] = useState({ 
    x: Math.random() > 0.5 ? 1 : -1, 
    y: Math.random() > 0.5 ? 1 : -1,
    z: Math.random() > 0.5 ? 1 : -1 
  });
  const requestRef = useRef<number>();
  
  // Calculate visual size based on z position (perspective)
  const visualSize = size * (1 - position.z / 1000);
  
  useEffect(() => {
    if (isPaused) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }

    const moveTarget = () => {
      setPosition(prev => {
        const newX = prev.x + direction.x * speed;
        const newY = prev.y + direction.y * speed;
        const newZ = prev.z + direction.z * speed / 2;
        
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;
        let newDirectionZ = direction.z;
        
        // Get actual viewport dimensions
        const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
        const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
        
        // Bounce off edges
        if (newX <= 0 || newX >= viewportWidth - visualSize) {
          newDirectionX = -direction.x;
        }
        
        if (newY <= 0 || newY >= viewportHeight - visualSize) {
          newDirectionY = -direction.y;
        }
        
        if (newZ <= 100 || newZ >= 800) {
          newDirectionZ = -direction.z;
        }
        
        if (newDirectionX !== direction.x || newDirectionY !== direction.y || newDirectionZ !== direction.z) {
          setDirection({ x: newDirectionX, y: newDirectionY, z: newDirectionZ });
        }
        
        return {
          x: Math.max(0, Math.min(viewportWidth - visualSize, newX)),
          y: Math.max(0, Math.min(viewportHeight - visualSize, newY)),
          z: Math.max(100, Math.min(800, newZ))
        };
      });
      
      requestRef.current = requestAnimationFrame(moveTarget);
    };
    
    requestRef.current = requestAnimationFrame(moveTarget);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [direction, visualSize, speed, isPaused]);

  // Calculate opacity based on z position
  const opacity = 1 - (position.z / 1000);

  return (
    <div
      id={`target-${id}`}
      className="target target-3d"
      style={{
        width: `${visualSize}px`,
        height: `${visualSize}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: opacity,
        transform: `perspective(1000px) translateZ(${-position.z}px)`
      }}
    >
      <div className="target-ring outer"></div>
      <div className="target-ring middle"></div>
      <div className="target-ring inner"></div>
      <div className="target-ring bullseye"></div>
    </div>
  );
};