const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

app.use(cors());
app.use(bodyParser.json());

// Helper: Load and save users
function loadUsers() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function saveUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { username, email, mobile, password } = req.body;
    let users = loadUsers();
    if (users.find(u => u.username === username || u.email === email || u.mobile === mobile)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    users.push({ username, email, mobile, password, score: 0 });
    saveUsers(users);
    res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    let users = loadUsers();
    let user = users.find(u => u.username === identifier || u.email === identifier || u.mobile === identifier);
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, user: { username: user.username, email: user.email, mobile: user.mobile, score: user.score } });
});

// OTP endpoint (demo: always 123456)
app.post('/api/send-otp', (req, res) => {
    // Validate input for registration or login
    const { mobile, identifier } = req.body;
    // Registration OTP: mobile is present
    if (mobile !== undefined) {
        // Validate mobile, username, email from body if present
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error: 'Invalid mobile number' });
        }
        // Optionally, check for username/email in body for registration
        const { username, email } = req.body;
        if (username && !/^\w{3,}$/.test(username)) {
            return res.status(400).json({ error: 'Invalid username' });
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }
    }
    // Login OTP: identifier is present
    if (identifier !== undefined) {
        // identifier can be username, email, or mobile
        if (!/^\w{3,}$/.test(identifier) && !/^\S+@\S+\.\S+$/.test(identifier) && !/^\d{10}$/.test(identifier)) {
            return res.status(400).json({ error: 'Invalid login identifier' });
        }
    }
    // In real app, generate and send OTP
    res.json({ otp: '123456' });
});

// Quiz score endpoint
app.post('/api/score', (req, res) => {
    const { username, score } = req.body;
    let users = loadUsers();
    let user = users.find(u => u.username === username);
    if (user) {
        user.score = score;
        saveUsers(users);
        return res.json({ success: true });
    }
    res.status(404).json({ error: 'User not found' });
});

// Admin: get all users and scores
app.get('/api/users', (req, res) => {
    let users = loadUsers();
    res.json(users.map(u => ({ username: u.username, email: u.email, mobile: u.mobile, score: u.score })));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
