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
    options.headers = { ...options.headers, "Authorization": "Bearer " + accessToken };
    
    let res = await fetch(url, options);
    
    if (res.status === 401 && retry) {
        const newAccess = await refreshToken();
        options.headers["Authorization"] = "Bearer " + newAccess;
        return fetchWithAuth(url, options, false);
    }
    return res;
}

// --- UI Rendering ---

function formatDateTime(datetimeString) {
    const [datePart, timePart] = datetimeString.split('T');
    const [year, month, day] = datePart.split('-');
    let [hours, minutes] = timePart.split(':');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = (parseInt(hours, 10) % 12) || 12;
    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
}

async function rendertodolist() {
    const date = document.querySelector('.js-date').value;
    const url = date === '' ? `${API_BASE}/get/` : `${API_BASE}/search/?date=${date}`;

    try {
        const res = await fetchWithAuth(url);
        const data = await res.json();

        let innerHTML = '';
        data.forEach(item => {
            innerHTML += `<tr>
                <td>${formatDateTime(item.date)}</td>
                <td colspan="4">${item.todo}</td>
                <td><a data-id="${item.id}" data-date="${item.date}" data-todo="${item.todo}" class="text-white inline-block js-edit text-2xl cursor-pointer hover:scale-110 transition">Edit</a></td>
                <td><a data-id="${item.id}" class="text-white text-2xl js-delete inline-block cursor-pointer hover:scale-110 transition">Delete</a></td>
            </tr>`;
        });

        document.querySelector('.js-tbody').innerHTML = innerHTML;
        attachTableEventListeners();
    } catch (e) {
        console.error(e.message);
    }
}

function attachTableEventListeners() {
    document.querySelectorAll('.js-delete').forEach(btn => {
        btn.onclick = async () => {
            await fetchWithAuth(`${API_BASE}/delete/${btn.dataset.id}/`, { method: 'DELETE' });
            rendertodolist();
        };
    });

    document.querySelectorAll('.js-edit').forEach(btn => {
        btn.onclick = () => {
            localStorage.setItem('date', btn.dataset.date);
            localStorage.setItem('todo', btn.dataset.todo);
            localStorage.setItem('id', btn.dataset.id);
            window.location.href = 'edit.html';
        };
    });
}

// --- Initial Setup ---

document.querySelector('.js-date').addEventListener('change', rendertodolist);

document.querySelectorAll('.js-logout').forEach(btn => {
    btn.addEventListener('click', async () => {
        await fetch(`${API_BASE}/auth/logout/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: localStorage.getItem('refresh') })
        });
        localStorage.clear();
        window.location.href = 'landing.html';
    });
});

rendertodolist();