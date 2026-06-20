// --- Configuration ---
// No hardcoded IP needed; this will be relative to your domain/VPS IP
const API_BASE = '/api';

// --- Selectors ---
const loginBtn = document.querySelector('.js-login');
const signupBtn = document.querySelector('.js-signup');
const usernameInput = document.querySelector('.js-username');
const passwordInput = document.querySelector('.js-password');

// --- Event Listeners ---

// Handle Sign Up Navigation
signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signup.html';
});

// Handle Login Request
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const res = await fetch(`${API_BASE}/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            alert("Error: " + JSON.stringify(errData));
            throw new Error('Login failed');
        }

        // Success handling
        const data = await res.json();
        
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('username', username);
        
        console.log('Logged in successfully');
        window.location.href = 'main.html';

    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
});