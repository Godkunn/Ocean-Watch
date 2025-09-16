import React, { useState } from 'react';

const RegisterForm = ({ onRegister, onError, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'citizen'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    onError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        onRegister(data.user, data.token);
      } else {
        onError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      onError('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container neon-border">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <select name="role" value={formData.role} onChange={handleInputChange} required>
            <option value="citizen">Citizen</option>
            <option value="official">Official</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <button type="submit" className="neon-button" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-switch">
        <p>Already have an account? <span onClick={onSwitchMode}>Login now</span></p>
      </div>
    </div>
  );
};

export default RegisterForm;