import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading } = useAuth();

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearMessages();
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }

        // Strong password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(formData.password)) {
          setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
          return false;
        }
      }
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    try {
      clearMessages();
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    clearMessages();

    try {
      if (mode === 'signin') {
        await signInWithEmail(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        const result = await signUpWithEmail(formData.email, formData.password, formData.displayName);
        if (result?.user) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          setMode('signin');
        }
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccess('Password reset link sent to your email!');
        setMode('signin');
      }
    } catch (err: any) {
      let errorMessage = err.message || 'An error occurred';
      
      // Handle specific Supabase errors
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message?.includes('Email already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (err.message?.includes('weak_password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    });
    clearMessages();
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-header">
          <h2 className="auth-title">
            {mode === 'signin' && 'Welcome Back!'}
            {mode === 'signup' && 'Join SH!TSHOT'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin' && 'Sign in to access your member features'}
            {mode === 'signup' && 'Create your account to track progress and compete'}
            {mode === 'reset' && 'Enter your email to receive a reset link'}
          </p>
        </div>

        {mode !== 'reset' && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => handleModeChange('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => handleModeChange('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {mode !== 'reset' && (
          <>
            <button
              className="google-sign-in"
              onClick={handleGoogleSignIn}
              disabled={loading || isSubmitting}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <div className="google-icon" />
              )}
              Continue with Google
            </button>

            <div className="divider">or</div>
          </>
        )}

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">
                Display Name (Optional)
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                className="form-input"
                placeholder="How should we call you?"
                value={formData.displayName}
                onChange={handleInputChange}
              />
            </div>
          )}

          {mode !== 'reset' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="loading-spinner" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Link'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'signin' && (
            <div className="auth-link">
              Forgot your password?
              <button onClick={() => handleModeChange('reset')}>
                Reset it here
              </button>
            </div>
          )}
          
          {mode === 'reset' && (
            <div className="auth-link">
              Remember your password?
              <button onClick={() => handleModeChange('signin')}>
                Sign in instead
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div className="auth-link">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;