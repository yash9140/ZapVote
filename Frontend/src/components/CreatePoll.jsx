import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreatePoll.css';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      console.log('API URL:', apiUrl); // Debug log

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
      navigate('/admin');
    } catch (err) {
      console.error('Error creating poll:', err); // Debug log
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to create poll'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-poll">
      <h2>Create New Poll</h2>
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
  );
} 