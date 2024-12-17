import React, { useState, useEffect } from 'react';
import AddClass from './AddClass';
import AddStudent from './AddStudent';
import AddGrade from './AddGrade';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./TeacherDashboard.css"

function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [average, setAverage] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to be logged in.');
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3001/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { role } = response.data;
        if (role === 'student') {
          alert('Access Denied');
          navigate('/');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error verifying user role:', error);
        alert('Failed to verify user. Please log in again.');
        navigate('/login');
      }
    };

    checkRole();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      fetchClasses();
    }
  }, [loading]);

  useEffect(() => {
    if (selectedStudent) {
      fetchGrades(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`/classes/${classId}/students`);
      setStudents(response.data);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchGrades = async (studentId) => {
    try {
        const gradesResponse = await axios.get(`http://localhost:3001/grades?student_id=${studentId}`);
        setGrades(gradesResponse.data);

        const averageResponse = await axios.get(`http://localhost:3001/students/${studentId}/average`);
        const average = averageResponse.data.average || 0;
        setAverage(Number(average));
    } catch (error) {
        console.error('Error fetching grades:', error);
    }
};


  

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    fetchStudents(classId);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await axios.delete(`http://localhost:3001/grades/${gradeId}`);
      alert('Grade deleted successfully');
      fetchGrades(selectedStudent);
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Failed to delete grade');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`http://localhost:3001/students/${studentId}`);
      alert('Student deleted successfully');
      fetchStudents(selectedClass);
      if (selectedStudent === studentId) {
        setSelectedStudent(null);
        setGrades([]);
        setAverage(0);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      await axios.put(`http://localhost:3001/students/${studentId}/approve`);
      
      await axios.put(`http://localhost:3001/users/${studentId}/approve`);

      alert('Student approved successfully');
      fetchStudents(selectedClass);
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Failed to approve student');
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <AddClass fetchClasses={fetchClasses} />
      <h2>Select a Class</h2>
      <select onChange={(e) => handleClassSelect(e.target.value)} value={selectedClass || ''}>
        <option value="" disabled>Select Class</option>
        {classes.map(cls => (
          <option key={cls.id} value={cls.id}>{cls.name}</option>
        ))}
      </select>

      {selectedClass && (
        <>
          <h2>Students in Class</h2>
          <AddStudent classId={selectedClass} fetchStudents={() => fetchStudents(selectedClass)} />
          <ul>
            {students.map(student => (
              <li key={student.id}>
                {student.name}
                {student.is_approved === 0 && (
                  <button onClick={() => handleApproveStudent(student.id)}>Approve</button>
                )}
                <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                <button onClick={() => handleStudentSelect(student.id)}>Show Grades</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedStudent && (
        <>
          <h2>Grades for {students.find(s => s.id === selectedStudent)?.name}</h2>
          <AddGrade studentId={selectedStudent} fetchGrades={() => fetchGrades(selectedStudent)} />
          <ul>
            {grades.map(grade => (
              <li key={grade.id}>
                Grade: {grade.grade}, Weight: {grade.weight}, Description: {grade.description}
                <button onClick={() => handleDeleteGrade(grade.id)}>Delete</button>
              </li>
            ))}
          </ul>
          <h3>Average Grade: {average.toFixed(2)}</h3>
        </>
      )}
    </div>
  );
}

export default TeacherDashboard;
