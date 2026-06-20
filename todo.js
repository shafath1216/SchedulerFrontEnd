// --- Configuration ---
const API_BASE = '/api';

// --- API Helpers ---

async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    
    const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });
    
    if (!res.ok) throw new Error('failed to get token');
    
    const data = await res.json();
    localStorage.setItem('access', data.access);
    return data.access;
}

async function fetchWithAuth(url, options = {}, retry = true) {
    const accessToken = localStorage.getItem('access');
    
    options.headers = {
        ...options.headers,
        "Authorization": "Bearer " + accessToken
    };
    
    let res = await fetch(url, options);
    
    if (res.status === 401 && retry) {
        const newAccess = await refreshToken();
        options.headers["Authorization"] = "Bearer " + newAccess;
        return fetchWithAuth(url, options, false);
    }
    
    return res;
}

// --- Add Todo Logic ---

document.querySelector('.js-add').addEventListener('click', async (e) => {
    e.preventDefault();

    const date = document.querySelector('.js-date').value;
    const todo = document.querySelector('.js-todo').value;

    try {
        const res = await fetchWithAuth(`${API_BASE}/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, todo })
        });

        if (!res.ok) throw new Error('Failed to add');

        const data = await res.json();
        console.log(data.message);
        window.location.href = 'main.html';
        
    } catch (e) {
        console.log(e.message);
        alert("Error: " + e.message);
    }
});
