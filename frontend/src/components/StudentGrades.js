import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentGrades.css';  // Import the CSS file

function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You need to be logged in to view your grades.');
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const studentId = decodedToken.userId;

        const gradesResponse = await axios.get(`http://localhost:3001/grades?student_id=${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setGrades(gradesResponse.data);

        const averageResponse = await axios.get(`http://localhost:3001/students/${studentId}/average`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedAverage = averageResponse.data.average || 0;
        setAverage(Number(fetchedAverage));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grades or average:', error);
        alert('Failed to fetch grades.');
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading) {
    return <div className="loading">Loading grades...</div>;
  }

  return (
    <div>
      <h1>Your Grades</h1>
      <h3>Average Grade: {average.toFixed(2)}</h3>
      <ul>
        {grades.length === 0 ? (
          <li className="no-grades">No grades available</li>
        ) : (
          grades.map((grade) => (
            <li key={grade.id}>
              Grade: {grade.grade}, Weight: {grade.weight}, Description: {grade.description}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default StudentGrades;
