/* src/js/auth.js */

const signInContainer = document.getElementById('signInContainer');
const signUpContainer = document.getElementById('signUpContainer');
const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');

if (switchToSignUp && switchToSignIn) {
    switchToSignUp.addEventListener('click', () => {
        signInContainer.classList.replace('block', 'hidden');
        signUpContainer.classList.replace('hidden', 'block');
    });

    switchToSignIn.addEventListener('click', () => {
        signUpContainer.classList.replace('block', 'hidden');
        signInContainer.classList.replace('hidden', 'block');
    });
}

// Helper tool to safely record a user globally in local storage
function recordUserGlobally(email, role) {
    let globalUsers = JSON.parse(localStorage.getItem('allRegisteredUsers')) || [];
    
    // Check if user already exists so we don't make duplicates
    const userExists = globalUsers.some(u => u.email.toUpperCase() === email.toUpperCase());
    
    if (!userExists) {
        globalUsers.push({
            email: email.toUpperCase(),
            role: role,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('allRegisteredUsers', JSON.stringify(globalUsers));
    }
}

// --- 📝 SECURED CREATE ACCOUNT SUBMISSION ---
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const role = document.getElementById('regRole').value;

    if (!email.includes('@')) return;

    if (role === 'admin' && !email.includes('admin')) {
        alert("Access Denied: Admin role requires an authorized administrative email.");
        return;
    }

    // Save current active session tokens
    localStorage.setItem('userEmail', email.toUpperCase());
    localStorage.setItem('userRole', role);

    // 💾 PERMANENT UPGRADE: Save user to the everlasting master log sheet
    recordUserGlobally(email, role);
    
    window.location.href = 'dashboard.html';
});

// --- 🔑 SECURED SIGN IN SUBMISSION ---
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();

    if (!email.includes('@')) return;

    const assignedRole = email.includes('admin') ? 'admin' : 'student';

    localStorage.setItem('userEmail', email.toUpperCase());
    localStorage.setItem('userRole', assignedRole);

    // 💾 PERMANENT UPGRADE: Save user to the everlasting master log sheet
    recordUserGlobally(email, assignedRole);
    
    window.location.href = 'dashboard.html';
});