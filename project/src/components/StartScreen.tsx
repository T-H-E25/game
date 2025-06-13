import React, { useState } from 'react';
import { Target, Clock, Trophy, Zap, Users, Home } from 'lucide-react';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: (difficulty: string, gameMode: string) => void;
  userType?: 'free' | 'member' | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, userType }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedMode, setSelectedMode] = useState('2d');

  const handleBackToWelcome = () => {
    localStorage.removeItem('sh1tshot-visited');
    localStorage.removeItem('sh1tshot-user-type');
    window.location.reload();
  };

  return (
    <div className="start-screen">
      <div className="start-content">
        <div className="game-logo">
          <Target size={40} />
          <h1>SH!TSHOT Target Challenge</h1>
        </div>

        {userType && (
          <div className="user-status">
            <div className={`status-badge ${userType}`}>
              {userType === 'free' ? <Zap size={16} /> : <Users size={16} />}
              <span>Playing as {userType === 'free' ? 'Free Player' : 'Member'}</span>
            </div>
            <button 
              className="change-user-type"
              onClick={handleBackToWelcome}
              title="Change user type"
            >
              <Home size={16} />
              Change Mode
            </button>
          </div>
        )}
        
        <p className="game-description">
          Test your aim! Shoot the moving targets for maximum points.
          Be quick and accurate to achieve the highest score!
        </p>
        
        <div className="game-options">
          <div className="option-section">
            <h3>Select Difficulty</h3>
            <div className="option-buttons">
              <button 
                className={`option-button ${selectedDifficulty === 'easy' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
              >
                <Clock size={18} />
                Easy
              </button>
              <button 
                className={`option-button ${selectedDifficulty === 'medium' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('medium')}
              >
                <Clock size={18} />
                Medium
              </button>
              <button 
                className={`option-button ${selectedDifficulty === 'hard' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
              >
                <Clock size={18} />
                Hard
              </button>
            </div>
          </div>
          
          <div className="option-section">
            <h3>Game Mode</h3>
            <div className="option-buttons">
              <button 
                className={`option-button ${selectedMode === '2d' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('2d')}
              >
                <Target size={18} />
                Classic 2D
              </button>
              <button 
                className={`option-button ${selectedMode === '3d' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('3d')}
              >
                <Trophy size={18} />
                3D Challenge
              </button>
            </div>
          </div>
        </div>
        
        <div className="instructions">
          <h3>How to Play</h3>
          <ul>
            <li>Point and shoot at the targets on screen</li>
            <li>Hit the center bullseye for maximum points</li>
            <li>Miss penalties will reduce your score</li>
            <li>Try to hit as many targets as possible before time runs out</li>
          </ul>
        </div>
        
        <button 
          className="start-button"
          onClick={() => onStartGame(selectedDifficulty, selectedMode)}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartScreen;