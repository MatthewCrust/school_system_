import React, { useState } from 'react';
import axios from 'axios';

const AddGrade = ({ studentId, fetchGrades }) => {
    const [grade, setGrade] = useState('');
    const [weight, setWeight] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/grades', {
                student_id: studentId,
                grade,
                weight,
                description,
            });
            alert('Grade added successfully');
            setGrade('');
            setWeight('');
            setDescription('');
            fetchGrades();
        } catch (error) {
            console.error('Error adding grade:', error);
            alert('Failed to add grade');
        }
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="number" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)} 
                placeholder="Grade" 
                required
            />
            <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                placeholder="Weight" 
                required
            />
            <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Description" 
                required
            />
            <button type="submit">Add Grade</button>
        </form>
    );
};

export default AddGrade;
