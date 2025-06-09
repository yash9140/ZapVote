import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PollHistory.css';

export default function PollHistory() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
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
        setError(err.response?.data?.message || 'Failed to fetch poll history');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [navigate]);

  const handleJoinPoll = (pollId) => {
    navigate(`/poll/${pollId}`);
  };

  if (loading) {
    return <div className="loading">Loading poll history...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="poll-history">
      <h2>Poll History</h2>
      {polls.length === 0 ? (
        <p>No polls found</p>
      ) : (
        <div className="polls-grid">
          {polls.map(poll => (
            <div key={poll._id} className="poll-card">
              <h3>{poll.question}</h3>
              <p>Created by: {poll.createdBy}</p>
              <p>Status: {poll.status}</p>
              <p>Created: {new Date(poll.createdAt).toLocaleString()}</p>
              {poll.status === 'active' && (
                <button 
                  onClick={() => handleJoinPoll(poll._id)}
                  className="join-btn"
                >
                  Join Poll
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 