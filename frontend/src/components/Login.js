import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful');

      if (response.data.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (response.data.role === 'student') {
        navigate('/student/grades');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={goToRegister}>Register</button>
    </div>
  );
}

export default Login;
