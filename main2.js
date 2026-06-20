// --- Configuration ---
const API_BASE = '/api';

const username = localStorage.getItem('username');
document.querySelector('.js-heading').innerHTML = `Welcome ${username} !`;

// --- API Helpers ---

async function refreshToken() {
    const refresh = localStorage.getItem('refresh');
    const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });
    
    if (!res.ok) throw new Error('Failed to refresh token');
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
    
    // Handle Token Refresh on 401
    if (res.status === 401 && retry) {
        const newAccess = await refreshToken();
        options.headers["Authorization"] = "Bearer " + newAccess;
        return fetchWithAuth(url, options, false);
    }
    return res;
}

// --- Logout Logic ---

document.querySelector('.js-logout').addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_BASE}/auth/logout/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: localStorage.getItem('refresh') })
        });
        
        if (res.ok) {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = 'landing.html';
        }
    } catch (e) {
        console.error("Logout failed", e);
    }
});

// --- Todo List Logic ---

document.querySelector('.js-date').addEventListener('change', rendertodolist);

async function rendertodolist() {
    const date = document.querySelector('.js-date').value;
    
    // Only fetch if date is empty as per your original logic
    if (date !== '') return;

    try {
        const res = await fetchWithAuth(`${API_BASE}/get/`);
        const data = await res.json();

        let innerHTML = '';
        data.forEach(item => {
            const [datePart, timePart] = item.date.split('T');
            const [year, month, day] = datePart.split('-');
            let [hours, minutes] = timePart.split(':');
            
            hours = parseInt(hours, 10);
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12 || 12;
            
            const formatted = `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
            
            innerHTML += `<tr>
                <td>${formatted}</td>
                <td colspan="4">${item.todo}</td>
                <td><a data-id="${item.id}" data-date="${item.date}" data-todo="${item.todo}" class="text-white inline-block js-edit text-2xl cursor-pointer hover:scale-150 transition">Edit</a></td>
                <td><a data-id="${item.id}" class="text-white text-2xl js-delete inline-block cursor-pointer hover:scale-150 transition">Delete</a></td>
            </tr>`;
        });

        document.querySelector('.js-tbody').innerHTML = innerHTML;
        attachTableEvents();
    } catch (e) {
        console.error("Fetch failed", e.message);
    }
}

function attachTableEvents() {
    // Delete Event
    document.querySelectorAll('.js-delete').forEach(del => {
        del.onclick = async () => {
            const id = del.dataset.id;
            await fetchWithAuth(`${API_BASE}/delete/${id}/`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            rendertodolist();
        };
    });

    // Edit Event
    document.querySelectorAll('.js-edit').forEach(ed => {
        ed.onclick = () => {
            localStorage.setItem('date', ed.dataset.date);
            localStorage.setItem('todo', ed.dataset.todo);
            localStorage.setItem('id', ed.dataset.id);
            window.location.href = 'edit.html';
        };
    });
}