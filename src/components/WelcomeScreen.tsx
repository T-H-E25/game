import React, { useState } from 'react';
import { Target, Users, Zap, Trophy, BarChart3, Clock, Star, CheckCircle, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onSelectUserType: (userType: 'free' | 'member') => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectUserType }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleMemberAction = () => {
    if (isAuthenticated) {
      // User is already signed in, go directly to member mode
      onSelectUserType('member');
    } else {
      // Show sign up modal for new users
      setAuthMode('signup');
      setShowAuthModal(true);
    }
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onSelectUserType('member');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
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
    );
  }

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
            onClick={handleMemberAction}
          >
            <div className="option-icon">
              <Users size={48} />
            </div>
            <h3 className="option-title">
              {isAuthenticated ? 'Continue as Member' : 'Join as Member'}
            </h3>
            <p className="option-description">
              {isAuthenticated 
                ? `Welcome back, ${user?.user_metadata?.display_name || user?.email?.split('@')[0]}! Continue with your member benefits.`
                : 'Sign up to track progress, compete on leaderboards, and unlock achievements.'
              }
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

        {!isAuthenticated && (
          <div className="welcome-footer">
            <p>
              Already have an account?
              <button 
                onClick={handleSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e63946',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: 'inherit',
                  padding: '0 0.5rem',
                }}
              >
                <LogIn size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                Sign in here
              </button>
            </p>
          </div>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;