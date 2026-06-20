// --- Configuration ---
const API_BASE = '/api';

// --- Event Listener ---
document.querySelector('.js-signup').addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.querySelector('.js-username').value;
    const password = document.querySelector('.js-password').value;

    console.log("Attempting registration for:", username);

    try {
        const res = await fetch(`${API_BASE}/auth/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Registration error:", errorData);
            alert("Registration failed: " + JSON.stringify(errorData));
            throw new Error('Error in registration');
        } else {
            const data = await res.json();
            console.log("Registration successful:", data);
            
            // Store tokens if your register endpoint returns them
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('access', data.access);
            
            window.location.href = 'landing.html';
        }
    } catch (e) {
        console.error("Fetch error:", e);
        alert("Error: " + e.message);
    }
});
