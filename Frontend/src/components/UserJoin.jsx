import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserJoin.css';

export default function UserJoin() {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code || !username) {
      setError('Please enter both session code and username');
      return;
    }
    localStorage.setItem('username', username);
    navigate(`/session/${code}`);
  };

  return (
    <div className="user-join-container">
      <h2>Join Poll Session</h2>
      <form className="user-join-form" onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Session Code"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
      {error && <div className="user-join-error">{error}</div>}
    </div>
  );
} 