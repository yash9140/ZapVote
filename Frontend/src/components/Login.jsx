import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = "https://zapvote.onrender.com";
      console.log('API URL:', apiUrl); // Debug log

      const res = await axios.post(
        `${apiUrl}/api/auth/login`,
        { username, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/join');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Invalid credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  );
}