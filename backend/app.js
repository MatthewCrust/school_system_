const express = require('express');
const bodyParser = require('body-parser');
const { queryDatabase } = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const verifyTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }
    next();
};

//Add grades for student
app.post('/grades', async (req, res) => {
    const { student_id, grade, weight, description } = req.body;

    if (!student_id || !grade || !weight || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        await queryDatabase(
            'INSERT INTO grades (student_id, grade, weight, description) VALUES (?, ?, ?, ?)',
            [student_id, grade, weight, description]
        );

        res.status(201).json({ message: 'Grade added successfully.' });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Fetch grades for student
app.get('/grades', async (req, res) => {
    const { student_id } = req.query;
    if (!student_id) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    try {
        const grades = await queryDatabase(
            'SELECT * FROM grades WHERE student_id = ?',
            [student_id]
        );
        res.status(200).json(grades);
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.put('/students/:studentId/approve', async (req, res) => {
    const { studentId } = req.params;
    try {
        await queryDatabase(
            'UPDATE students SET is_approved = 1 WHERE id = ?',
            [studentId]
        );

        res.status(200).json({ message: 'Student approved successfully' });
    } catch (error) {
        console.error('Error approving student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Approve students
app.put('/users/:studentId/approve', async (req, res) => {
    const { studentId } = req.params;
    try {
        await queryDatabase(
            'UPDATE users SET is_approved = 1 WHERE id = ? AND role = "student"',
            [studentId]
        );

        res.status(200).json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Grade average
app.get('/students/:studentId/average', async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await queryDatabase(
            'SELECT IFNULL(AVG(grade), 0) AS average FROM grades WHERE student_id = ?',
            [studentId]
        );

        res.status(200).json({ average: result[0].average });
    } catch (error) {
        console.error('Error calculating average grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Delete grade
app.delete('/grades/:gradeId', async (req, res) => {
    const { gradeId } = req.params;

    try {
        const result = await queryDatabase('DELETE FROM grades WHERE id = ?', [gradeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        res.status(200).json({ message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Error deleting grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Delete student
app.delete('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        await queryDatabase('DELETE FROM grades WHERE student_id = ?', [studentId]);

        const result = await queryDatabase('DELETE FROM students WHERE id = ?', [studentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Get user id
app.get('/user', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const userId = decoded.userId;
        const role = decoded.role;

        res.json({ userId, role });
    } catch (error) {
        console.error('Error decoding token:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});


// Fetch User Role
app.get('/user/role/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [user] = await queryDatabase('SELECT role FROM users WHERE id = ?', [userId]);

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ role: user.role });
    } catch (error) {
        console.error('Error fetching user role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Student
app.post('/students', async (req, res) => {
    try {
        const { name, class_id } = req.body;
        if (!name || !class_id) return res.status(400).json({ error: 'Name and class_id are required' });

        await queryDatabase('INSERT INTO students (name, class_id) VALUES (?, ?)', [name, class_id]);
        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch Classes
app.get('/classes', async (_, res) => {
    try {
        const classes = await queryDatabase('SELECT id, name FROM classes');
        res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Class
app.post('/classes', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Class name is required' });

        await queryDatabase('INSERT INTO classes (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Class created successfully' });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch Students in Class
app.get('/classes/:classId/students', async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await queryDatabase('SELECT * FROM students WHERE class_id = ?', [classId]);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register a User
app.post('/register', async (req, res) => {
    const { username, password, role, class_id } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await queryDatabase(
            'INSERT INTO users (username, password, role, class_id, is_approved) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, role, class_id || null, role === 'student' ? false : true]
        );
        
        if (role === 'student' && class_id) {
            await queryDatabase(
                'INSERT INTO students (name, class_id, is_approved) VALUES (?, ?, ?)',
                [username, class_id, 0]
            );
        }

        res.status(201).json({ message: 'User registered successfully. Await teacher approval if you are a student.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [user] = await queryDatabase('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || !user.is_approved) {
            return res.status(400).json({ error: 'Invalid credentials or approval pending' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve a User
app.post('/approve/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await queryDatabase('UPDATE users SET is_approved = TRUE WHERE id = ?', [userId]);
        res.json({ message: 'User approved' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
