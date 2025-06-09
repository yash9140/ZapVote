import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import ResultsChart from './ResultsChart';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const socket = io(apiUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default function PollSession() {
  const { code } = useParams();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timer, setTimer] = useState('00:00:00');
  const timerRef = useRef();
  const username = localStorage.getItem('username') || 'anonymous';

  useEffect(() => {
    // Fetch session info
    axios.get(`${apiUrl}/api/session/${code}`)
      .then(res => {
        setPoll(res.data.poll);
        setStartTime(new Date(res.data.startedAt));
      })
      .catch(() => setError('Session not found'));

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      socket.emit('joinSession', { code, user: username });
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to server. Please try again.');
    });

    socket.on('sessionJoined', ({ poll }) => setPoll(poll));
    socket.on('updateResults', setResults);
    socket.on('error', (err) => setError(err));

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('sessionJoined');
      socket.off('updateResults');
      socket.off('error');
    };
  }, [code, username]);

  useEffect(() => {
    if (!startTime) return;
    timerRef.current = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - new Date(startTime)) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const handleVote = (option) => {
    socket.emit('submitVote', { code, user: username, option });
    setVoted(true);
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!poll) return <div>Loading poll...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>{poll.question}</h2>
      <div>Session Code: {code}</div>
      <div>Timer: {timer}</div>
      {!voted ? (
        <div>
          {poll.options.map(opt => (
            <button key={opt} onClick={() => handleVote(opt)}>{opt}</button>
          ))}
        </div>
      ) : (
        <div>
          <h4>Thank you for voting!</h4>
        </div>
      )}
      <ResultsChart options={poll.options} results={results} />
    </div>
  );
} 