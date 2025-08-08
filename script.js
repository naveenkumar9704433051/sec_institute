function showMessage(msg) {
    const area = document.getElementById('message-area');
    if (!area) return;
    area.textContent = msg;
    area.style.display = 'block';
    setTimeout(() => { area.style.display = 'none'; }, 3500);
}
// --- SOC Quiz Logic ---
// --- SOC Quiz Logic (server-based) ---
document.addEventListener('DOMContentLoaded', function() {
    const quizForm = document.getElementById('soc-quiz');
    if (!quizForm) return;
    quizForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // Correct answers
        const answers = {
            q1: ['a'],
            q2: ['a', 'b', 'd'],
            q3: ['a', 'c'],
            q4: ['a']
        };
        let score = 0;
        let total = 4;
        // Q1
        const q1 = Array.from(quizForm.querySelectorAll('input[name="q1"]:checked')).map(i => i.value);
        if (q1.length === 1 && q1[0] === 'a') score++;
        // Q2
        const q2 = Array.from(quizForm.querySelectorAll('input[name="q2"]:checked')).map(i => i.value).sort();
        if (JSON.stringify(q2) === JSON.stringify(['a','b','d'])) score++;
        // Q3
        const q3 = Array.from(quizForm.querySelectorAll('input[name="q3"]:checked')).map(i => i.value).sort();
        if (JSON.stringify(q3) === JSON.stringify(['a','c'])) score++;
        // Q4
        const q4 = Array.from(quizForm.querySelectorAll('input[name="q4"]:checked')).map(i => i.value);
        if (q4.length === 1 && q4[0] === 'a') score++;
        // Show result
        document.getElementById('quiz-result').innerHTML = `<strong>Your Score: ${score} / ${total}</strong>`;
        // Save score to user profile on server
        let userKey = sessionStorage.getItem('currentUserName') || '';
        if (userKey) {
            try {
                await fetch('http://localhost:3000/api/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userKey, score })
                });
            } catch (e) { /* ignore error for demo */ }
        }
    });
});
// Toggle between login and register forms
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
    resetForms();
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    resetForms();
});

function resetForms() {
    document.getElementById('register-form').reset();
    document.getElementById('login-form').reset();
    document.getElementById('otp-section-register').classList.add('hidden');
    document.getElementById('otp-section-login').classList.add('hidden');
    document.getElementById('register-btn').classList.add('hidden');
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('send-otp-register').classList.remove('hidden');
    document.getElementById('send-otp-login').classList.remove('hidden');
}

// OTP generation (for demo, just random 6-digit)
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

let currentRegisterOTP = '';
let currentLoginOTP = '';



// Registration OTP flow (server-based)
document.getElementById('send-otp-register').addEventListener('click', async function() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const mobile = document.getElementById('register-mobile').value.trim();
    // Send all registration fields to server for validation before OTP
    try {
        const res = await fetch('http://localhost:3000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, mobile })
        });
        if (!res.ok) {
            const data = await res.json();
            showMessage(data.error || 'Error sending OTP');
            return;
        }
        currentRegisterOTP = '123456';
        showMessage('Your registration OTP is: 123456');
        document.getElementById('otp-section-register').classList.remove('hidden');
        document.getElementById('register-btn').classList.remove('hidden');
        document.getElementById('send-otp-register').classList.add('hidden');
    } catch (e) { showMessage('Error sending OTP'); }
});

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const mobile = document.getElementById('register-mobile').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const otp = document.getElementById('register-otp').value;
    if (password !== confirm) { showMessage('Passwords do not match!'); return; }
    if (otp !== currentRegisterOTP) { showMessage('Invalid OTP!'); return; }
    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, mobile, password })
        });
        if (!res.ok) {
            const data = await res.json();
            showMessage(data.error || 'Registration failed');
            return;
        }
    showMessage('Registration successful! Please login.');
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        resetForms();
    } catch (e) { showMessage('Registration error'); }
});

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Login OTP flow (server-based)
document.getElementById('send-otp-login').addEventListener('click', async function() {
    const identifier = document.getElementById('login-identifier').value.trim();
    if (!identifier) { showMessage('Please enter your username, email, or mobile number.'); return; }
    if (identifier === ADMIN_USERNAME) {
        showMessage('OTP is not required for admin. Please enter your password and click Login.');
        document.getElementById('otp-section-login').classList.add('hidden');
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('send-otp-login').classList.add('hidden');
        return;
    }
    try {
        const res = await fetch('http://localhost:3000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });
        if (!res.ok) {
            const data = await res.json();
            showMessage(data.error || 'Error sending OTP');
            return;
        }
        currentLoginOTP = '123456';
        showMessage('Your login OTP is: 123456');
        document.getElementById('otp-section-login').classList.remove('hidden');
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('send-otp-login').classList.add('hidden');
    } catch (e) { showMessage('Error sending OTP'); }
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const otp = document.getElementById('login-otp').value;
    if (identifier === ADMIN_USERNAME) {
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('currentUserName', 'Admin');
            window.location.href = 'home.html';
            resetForms();
        } else {
            showMessage('Invalid admin password!');
        }
        return;
    }
    if (otp !== currentLoginOTP) { showMessage('Invalid OTP!'); return; }
    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        if (!res.ok) {
            const data = await res.json();
            showMessage(data.error || 'Login failed');
            return;
        }
        const data = await res.json();
        sessionStorage.setItem('currentUserName', data.user.username);
        window.location.href = 'home.html';
        resetForms();
    } catch (e) { showMessage('Login error'); }
});
