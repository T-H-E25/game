import React from 'react';
import { Target, Users, Zap, Trophy, BarChart3, Clock, Star, CheckCircle } from 'lucide-react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onSelectUserType: (userType: 'free' | 'member') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectUserType }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="brand-logo">
            <Target size={60} />
          </div>
          <h1 className="brand-title">SH!TSHOT</h1>
          <p className="welcome-subtitle">Target Challenge</p>
          <p className="welcome-description">
            Experience the ultimate target shooting game with precision aiming, 
            dynamic targets, and intense gameplay. Choose your path and start shooting!
          </p>
        </div>

        <div className="user-options">
          <div 
            className="user-option free" 
            onClick={() => onSelectUserType('free')}
          >
            <div className="option-icon">
              <Zap size={48} />
            </div>
            <h3 className="option-title">Play Free</h3>
            <p className="option-description">
              Jump right into the action! Play instantly without any signup required.
            </p>
            <ul className="option-features">
              <li>
                <CheckCircle className="feature-icon" />
                Instant play access
              </li>
              <li>
                <CheckCircle className="feature-icon" />
                All game modes available
              </li>
              <li>
                <CheckCircle className="feature-icon" />
                Session-based scoring
              </li>
              <li>
                <CheckCircle className="feature-icon" />
                No registration needed
              </li>
            </ul>
          </div>

          <div 
            className="user-option member" 
            onClick={() => onSelectUserType('member')}
          >
            <div className="option-icon">
              <Users size={48} />
            </div>
            <h3 className="option-title">Join as Member</h3>
            <p className="option-description">
              Sign up to track progress, compete on leaderboards, and unlock achievements.
            </p>
            <ul className="option-features">
              <li>
                <Trophy className="feature-icon" />
                Global leaderboards
              </li>
              <li>
                <BarChart3 className="feature-icon" />
                Progress tracking
              </li>
              <li>
                <Clock className="feature-icon" />
                Game history
              </li>
              <li>
                <Star className="feature-icon" />
                Achievements & badges
              </li>
            </ul>
          </div>
        </div>

        <div className="welcome-footer">
          <p>Choose your preferred way to play • You can always change this later</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;