import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 테스트용 계정
  const TEST_USER = {
    email: 'test@test.com',
    password: '123456'
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // 테스트용 로그인 검증
        if (formData.email === TEST_USER.email && formData.password === TEST_USER.password) {
          // 로그인 성공 시 localStorage에 간단한 토큰 저장
          localStorage.setItem('isLoggedIn', 'true');
          // home 페이지로 이동
          navigate('/home');
        } else {
          setErrors({ submit: 'Invalid email or password' });
        }
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({ submit: 'Login failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Section */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-hero">
              <div className="login-hero-text">
                <h1>GoFinance</h1>
                <p>The most popular peer to peer lending at SEA</p>
              </div>
              <button className="read-more-btn">
                Read More
              </button>
            </div>
            {/* Decorative circles */}
            <div className="decorative-circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Hello Again!</h2>
              <p>Welcome Back</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-fields">
                {/* Email Field */}
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Email Address"
                      aria-label="Email Address"
                    />
                    <i className="input-icon fas fa-envelope"></i>
                  </div>
                  {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Password"
                      aria-label="Password"
                    />
                    <i className="input-icon fas fa-lock"></i>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <p className="error-message">{errors.password}</p>}
                </div>
              </div>

              {errors.submit && <p className="submit-error">{errors.submit}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="forgot-password">
              <button>Forgot Password?</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;