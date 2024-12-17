import React, { useState } from 'react';
import axios from 'axios';

const AddStudent = ({ classId, fetchStudents }) => {
    const [name, setName] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://localhost:3001/students', { name, class_id: classId }); 
        alert('Student added successfully');
        setName('');
        fetchStudents(); 
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student');
    }
};


    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Student Name" 
                required
            />
            <button type="submit">Add Student</button>
        </form>
    );
};

export default AddStudent;
