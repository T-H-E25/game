import React, { useEffect } from 'react';
import { Timer, Target, Trophy, X, Pause, Play, Home } from 'lucide-react';
import './GameOverlay.css';

interface GameOverlayProps {
  score: number;
  timeLeft: number;
  hits: number;
  misses: number;
  accuracy: number;
  isPaused: boolean;
  onGameOver: () => void;
  onTogglePause: () => void;
  onQuitGame: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ 
  score, 
  timeLeft, 
  hits, 
  misses, 
  accuracy, 
  isPaused,
  onGameOver,
  onTogglePause,
  onQuitGame
}) => {
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameOver();
    }
  }, [timeLeft, onGameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="game-overlay">
      <div className="game-stats">
        <div className="stat-item">
          <Trophy size={20} />
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <Timer size={20} />
          <span className="stat-value">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="game-stats secondary">
        <div className="stat-item">
          <Target size={18} />
          <span className="stat-value">{hits}</span>
        </div>
        <div className="stat-item">
          <X size={18} />
          <span className="stat-value">{misses}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
      </div>
      
      <div className="game-controls">
        <button 
          className="control-button pause" 
          onClick={onTogglePause}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
        <button 
          className="control-button quit" 
          onClick={onQuitGame}
          title="Quit Game"
        >
          <Home size={20} />
        </button>
      </div>
      
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>Game Paused</h2>
            <div className="pause-buttons">
              <button className="pause-button resume" onClick={onTogglePause}>
                <Play size={18} style={{ marginRight: '0.5rem' }} />
                Resume Game
              </button>
              <button className="pause-button quit" onClick={onQuitGame}>
                <Home size={18} style={{ marginRight: '0.5rem' }} />
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {timeLeft <= 0 && (
        <div className="game-over-screen">
          <div className="game-over-content">
            <h2>Game Over</h2>
            <div className="final-stats">
              <div className="final-stat">
                <span className="final-stat-label">Score</span>
                <span className="final-stat-value">{score}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Hits</span>
                <span className="final-stat-value">{hits}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Misses</span>
                <span className="final-stat-value">{misses}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Accuracy</span>
                <span className="final-stat-value">{accuracy}%</span>
              </div>
            </div>
            <button className="play-again-button" onClick={onGameOver}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverlay;