import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import ResultsChart from './ResultsChart';
import { io } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function AdminDashboard() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [polls, setPolls] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [results, setResults] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const fetchPolls = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('API URL:', apiUrl); // Debug log

      const response = await axios.get(`${apiUrl}/api/poll/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setPolls(response.data);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError(err.response?.data?.message || 'Failed to fetch polls');
    }
  }, [navigate]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  useEffect(() => {
    if (!activeSession) return;
    if (!socketRef.current) {
      socketRef.current = io(apiUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    }
    const socket = socketRef.current;
    socket.emit('joinSession', { code: activeSession.code, user: 'admin' });
    socket.on('updateResults', setResults);
    return () => {
      socket.off('updateResults', setResults);
    };
  }, [activeSession]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!question.trim()) {
      setError('Please enter a question');
      setIsLoading(false);
      return;
    }

    if (options.some(opt => !opt.trim())) {
      setError('Please fill in all options');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('API URL:', apiUrl); // Debug log

      // Create the poll
      const response = await axios.post(
        `${apiUrl}/api/poll/create`,
        {
        question,
          options,
          duration
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Poll created:', response.data); // Debug log
      
      // Automatically start a session for the new poll
      const sessionResponse = await axios.post(
        `${apiUrl}/api/session/start`,
        { pollId: response.data._id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Session started:', sessionResponse.data); // Debug log
      
      // Update the active session state
      setActiveSession({
        code: sessionResponse.data.code,
        question: sessionResponse.data.question,
        pollId: response.data._id
      });

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setDuration(60);
      
      // Refresh the polls list
      fetchPolls();
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to create poll and start session'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async (pollId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Starting session with API URL:', apiUrl);
      
      const response = await axios.post(
        `${apiUrl}/api/session/start`,
        { pollId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setActiveSession({
        code: response.data.code,
        question: response.data.question,
        pollId
      });
    } catch (error) {
      console.error('Error starting session:', error);
      setError(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handleEndSession = async (pollId) => {
    setError('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Ending session for poll:', pollId); // Debug log

      const response = await axios.post(
        `${apiUrl}/api/session/end`,
        { pollId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Session ended successfully:', response.data); // Debug log
      setActiveSession(null);
      await fetchPolls(); // Refresh the polls list
    } catch (err) {
      console.error('Error ending session:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Failed to end session';
      setError(errorMessage);
      // If the session is already ended or not found, clear the active session
      if (err.response?.status === 404) {
        setActiveSession(null);
        await fetchPolls(); // Refresh the polls list
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleCopyCode = () => {
    if (activeSession?.code) {
      navigator.clipboard.writeText(activeSession.code)
        .then(() => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          setCopySuccess('Failed to copy');
        });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
      <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {activeSession && (
        <div className="active-session">
          <h3>Active Session</h3>
          <div className="session-info">
            <p><strong>Question:</strong> {activeSession.question}</p>
            <div className="session-code">
              <p><strong>Session Code:</strong> {activeSession.code}</p>
              <button 
                onClick={handleCopyCode}
                className="copy-button"
              >
                {copySuccess || 'Copy Code'}
              </button>
            </div>
            <p className="session-instructions">Share this code with participants to join the poll</p>
          </div>
          <div className="live-results-section" style={{ margin: '2rem 0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Live Results</h3>
            <ResultsChart options={polls.find(p => p._id === activeSession.pollId)?.options || []} results={results} />
          </div>
          <button 
            className="end-session-btn"
            onClick={() => handleEndSession(activeSession.pollId)}
          >
            End Session
          </button>
        </div>
      )}

      <div className="create-poll-section">
        <h3>Create New Poll</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question:</label>
      <input
              type="text"
        value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Options:</label>
            {options.map((option, index) => (
              <div key={index} className="option-input">
        <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  disabled={isLoading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={isLoading}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              disabled={isLoading}
              className="add-option-btn"
            >
              Add Option
            </button>
          </div>

          <div className="form-group">
            <label>Duration (seconds):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="10"
              max="300"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="polls-section">
        <h3>Recent Polls</h3>
        {polls.length === 0 ? (
          <p>No polls found</p>
        ) : (
          <div className="polls-flex">
            {polls.map(poll => (
              <div key={poll._id} className="poll-card">
                <h4>{poll.question}</h4>
                <p>Status: {poll.status}</p>
                <p>Created: {new Date(poll.createdAt).toLocaleString()}</p>
                {poll.status === 'active' && !activeSession && (
                  <button
                    onClick={() => handleStartSession(poll._id)}
                    disabled={isLoading}
                    className="start-session-btn"
                  >
                    Start Session
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 