import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [classId, setClassId] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/register', {
        username,
        password,
        role,
        class_id: role === 'student' ? classId : null,
      });
      alert('Registered successfully. Await approval if you are a student.');
      navigate('/');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      {role === 'student' && (
        <input
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          placeholder="Class ID"
        />
      )}
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
