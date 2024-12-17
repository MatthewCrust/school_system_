import React, { useState } from 'react';
import axios from 'axios';

const AddClass = ({ fetchClasses }) => {
    const [className, setClassName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/classes', { name: className });
            alert('Class added successfully');
            setClassName('');
            fetchClasses();
        } catch (error) {
            console.error('Error adding class:', error);
            alert('Failed to add class');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={className} 
                onChange={(e) => setClassName(e.target.value)} 
                placeholder="Class Name" 
                required
            />
            <button type="submit">Add Class</button>
        </form>
    );
};

export default AddClass;
