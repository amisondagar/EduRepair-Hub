/* src/js/app.js */

// Stealth layout engine configuration to mask scroll tracks cleanly
document.documentElement.style.setProperty('scrollbar-width', 'none');

let CURRENT_USER = {
    email: localStorage.getItem('userEmail') || "AMI@UNIVERSITY.EDU",
    role: localStorage.getItem('userRole') || "student"
};

// Persistent Local Database Array Initializer
let ticketsDatabase = JSON.parse(localStorage.getItem('globalTicketsGrid')) || [
    { id: "TK-902", title: "Broken AC unit in Lab 3", category: "Electrical HVAC", urgency: "High", description: "The cooling compressor is making loud buzzing noises and failing to cycle cooling routines.", status: "pending" },
    { id: "TK-411", title: "Projector lens distortion in Block-C", category: "AV Equipment", urgency: "Medium", description: "Heavy magenta color shifts display across project screen canvases.", status: "progress" }
];

const userDisplayEmail = document.getElementById('userDisplayEmail');
const studentView = document.getElementById('studentView');
const adminView = document.getElementById('adminView');
const logoutBtn = document.getElementById('logoutBtn');
const studentTicketsGrid = document.getElementById('studentTicketsGrid');
const adminTicketsContainer = document.getElementById('adminTicketsContainer');
const reportModal = document.getElementById('reportModal');
const ticketForm = document.getElementById('ticketForm');

let toggleRoleBtn = null;

// --- 🔒 SECURITY LAYER: ADMIN NAVIGATION SWITCHER ---
function injectRoleTogglerButton() {
    // Basic students are strictly denied access to viewport structural switches
    if (CURRENT_USER.role !== 'admin') {
        const existingBtn = document.getElementById('toggleRoleBtn');
        if (existingBtn) existingBtn.remove();
        return;
    }

    if (!userDisplayEmail || document.getElementById('toggleRoleBtn')) return;
    
    toggleRoleBtn = document.createElement('button');
    toggleRoleBtn.id = 'toggleRoleBtn';
    toggleRoleBtn.className = "text-[10px] font-mono font-black bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-cyan-400 uppercase hover:bg-cyan-500/20 transition-all cursor-pointer outline-none mr-2";
    toggleRoleBtn.textContent = `Role: ADMIN VIEW 🔄`;
    
    userDisplayEmail.parentNode.insertBefore(toggleRoleBtn, userDisplayEmail);

    toggleRoleBtn.addEventListener('click', () => {
        const isCurrentlyViewingAdmin = !adminView.classList.contains('hidden');
        
        if (isCurrentlyViewingAdmin) {
            // Allows Administrators to inspect the live Student View Parallax
            toggleRoleBtn.textContent = `Role: STUDENT VIEW 🔄`;
            adminView.classList.replace('block', 'hidden');
            studentView.classList.replace('hidden', 'block');
            renderStudentTickets();
        } else {
            // Reverts Administrator focus back to Core Dispatch Counters
            toggleRoleBtn.textContent = `Role: ADMIN VIEW 🔄`;
            studentView.classList.replace('block', 'hidden');
            adminView.classList.replace('hidden', 'block');
            renderAdminDashboard();
        }
    });
}

function renderActiveView() {
    if (userDisplayEmail) userDisplayEmail.textContent = CURRENT_USER.email;

    if (CURRENT_USER.role === 'admin') {
        if (studentView) studentView.classList.replace('block', 'hidden');
        if (adminView) adminView.classList.replace('hidden', 'block');
        renderAdminDashboard();
    } else {
        if (adminView) adminView.classList.replace('block', 'hidden');
        if (studentView) studentView.classList.replace('hidden', 'block');
        renderStudentTickets();
    }
}

// --- 🚪 CLEAN SNEAK LOGOUT ACTION TRACKER ---
logoutBtn?.addEventListener('click', () => {
    // Strip session state signatures only; leaves 'globalTicketsGrid' and master records completely intact
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
});

function initScrollParallaxEngine() {
    const scrollElements = document.querySelectorAll('.scroll-element');
    const spinningGear = document.getElementById('spinningGear');

    window.addEventListener('scroll', () => {
        if (studentView.classList.contains('hidden')) return;
        const scrolledY = window.scrollY;

        scrollElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-scroll-speed') || 0);
            const yOffset = -(scrolledY * speed * 0.15);
            element.style.transform = `translate3d(0px, ${yOffset}px, 0px)`;
        });

        if (spinningGear) {
            spinningGear.style.transform = `translate3d(0px, ${-(scrolledY * 0.4)}px, 0px) rotate(${scrolledY * 0.15}deg)`;
        }
    });
}

function renderStudentTickets() {
    if (!studentTicketsGrid) return;
    studentTicketsGrid.innerHTML = "";

    ticketsDatabase.forEach(ticket => {
        const isProgress = ticket.status === 'progress' || ticket.status === 'resolved';
        const isResolved = ticket.status === 'resolved';

        studentTicketsGrid.innerHTML += `
            <div class="tilt-card border border-white/10 bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl space-y-6 transition-all duration-200" data-tilt>
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h4 class="text-xl font-black tracking-tight text-white uppercase">${ticket.title}</h4>
                        <p class="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-wider">${ticket.category}</p>
                    </div>
                    <span class="text-[10px] font-black bg-white/5 border border-white/10 px-2.5 py-1 rounded text-slate-400">${ticket.id}</span>
                </div>
                <div class="relative flex items-center justify-between w-full px-2 py-4">
                    <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-700/50 z-0"></div>
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 z-0 transition-all duration-500" style="width: ${isResolved ? '100%' : isProgress ? '50%' : '0%'}"></div>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="w-4 h-4 rounded-full border-4 border-slate-900 shadow-md bg-cyan-400 animate-pulse"></div>
                        <span class="text-[9px] font-black uppercase tracking-widest text-cyan-400 mt-2">Reported</span>
                    </div>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="w-4 h-4 rounded-full border-4 border-slate-900 shadow-md ${isProgress ? 'bg-amber-400' : 'bg-slate-600'}"></div>
                        <span class="text-[9px] font-black uppercase tracking-widest ${isProgress ? 'text-amber-400' : 'text-slate-500'} mt-2">In Progress</span>
                    </div>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="w-4 h-4 rounded-full border-4 border-slate-900 shadow-md ${isResolved ? 'bg-emerald-400' : 'bg-slate-600'}"></div>
                        <span class="text-[9px] font-black uppercase tracking-widest ${isResolved ? 'text-emerald-400' : 'text-slate-500'} mt-2">Resolved</span>
                    </div>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">${ticket.description}</p>
            </div>
        `;
    });
    attachTiltEffects();
}

function renderAdminDashboard() {
    if (!adminTicketsContainer) return;
    adminTicketsContainer.innerHTML = "";

    const totalEl = document.getElementById('metricTotal');
    const progressEl = document.getElementById('metricProgress');
    const resolvedEl = document.getElementById('metricResolved');

    if (totalEl) totalEl.textContent = ticketsDatabase.length.toString();
    if (progressEl) progressEl.textContent = ticketsDatabase.filter(t => t.status === 'progress').length.toString();
    if (resolvedEl) resolvedEl.textContent = ticketsDatabase.filter(t => t.status === 'resolved').length.toString();

    ticketsDatabase.forEach(ticket => {
        adminTicketsContainer.innerHTML += `
            <div class="bg-slate-800/40 border border-white/5 backdrop-blur-md p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h4 class="text-lg font-bold text-white uppercase">${ticket.title}</h4>
                    <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">${ticket.category} • Status: <span class="text-cyan-400 font-bold uppercase">${ticket.status}</span></p>
                    <p class="text-sm text-slate-300 mt-2">${ticket.description}</p>
                </div>
                <div class="flex items-center gap-3">
                    <select class="status-updater px-3 py-2 text-xs font-bold bg-slate-700 border border-white/10 rounded-xl text-white outline-none cursor-pointer" data-id="${ticket.id}">
                        <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Reported</option>
                        <option value="progress" ${ticket.status === 'progress' ? 'selected' : ''}>In Progress</option>
                        <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button class="delete-ticket-btn px-3 py-2 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 transition-all cursor-pointer outline-none" data-id="${ticket.id}">
                        🗑️ Purge Log
                    </button>
                </div>
            </div>
        `;
    });

    document.querySelectorAll('.status-updater').forEach(select => {
        select.addEventListener('change', (e) => {
            const ticketId = e.target.getAttribute('data-id');
            const target = ticketsDatabase.find(t => t.id === ticketId);
            if (target) {
                target.status = e.target.value;
                localStorage.setItem('globalTicketsGrid', JSON.stringify(ticketsDatabase));
                renderAdminDashboard();
            }
        });
    });

    document.querySelectorAll('.delete-ticket-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticketId = e.target.getAttribute('data-id');
            ticketsDatabase = ticketsDatabase.filter(t => t.id !== ticketId);
            localStorage.setItem('globalTicketsGrid', JSON.stringify(ticketsDatabase));
            renderAdminDashboard();
        });
    });
}

function attachTiltEffects() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const box = card.getBoundingClientRect();
            const x = e.clientX - box.left - (box.width / 2);
            const y = e.clientY - box.top - (box.height / 2);
            card.style.transform = `rotateX(${-(y / box.height) * 15}deg) rotateY(${(x / box.width) * 15}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
        });
    });
}

// --- 🎯 STAGE-ISOLATED PROFESSIONAL CATEGORY REWRITE LOGIC ---
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.openReportModalBtn');
    if (!btn) return;

    if (reportModal) reportModal.classList.replace('hidden', 'flex');

    const categorySelect = document.getElementById('ticketCategory');
    if (!categorySelect) return;

    const parentSection = btn.closest('section');
    const isStage1 = parentSection && (parentSection.textContent.includes("Stage 01") || parentSection.textContent.includes("Structural"));

    categorySelect.innerHTML = "";

    if (isStage1) {
        // High-Fidelity Custom Structural Stage 1 Selection Options
        categorySelect.innerHTML = `
            <option value="Furniture / Seating">Furniture / Seating</option>
            <option value="Plumbing Defect">Plumbing Defect</option>
            <option value="Electrical Outage">Electrical Outage</option>
        `;
    } else {
        // High-Fidelity Custom Laboratory Stage 2 Selection Options
        categorySelect.innerHTML = `
            <option value="Lab Systems">Lab Systems</option>
            <option value="AV Equipment">AV Equipment</option>
            <option value="Electrical HVAC">Electrical HVAC</option>
        `;
    }
});

document.getElementById('closeReportModalBtn')?.addEventListener('click', () => {
    if (reportModal) reportModal.classList.replace('flex', 'hidden');
});

ticketForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = document.getElementById('ticketTitle')?.value || "Rapid Fix Notice";
    const catVal = document.getElementById('ticketCategory')?.value || "General Maintenance";
    const descVal = document.getElementById('ticketDescription')?.value || "Malfunction log entry reported.";

    ticketsDatabase.unshift({
        id: `TK-${Math.floor(100 + Math.random() * 900)}`,
        title: titleVal,
        category: catVal,
        description: descVal,
        status: "pending"
    });
    
    localStorage.setItem('globalTicketsGrid', JSON.stringify(ticketsDatabase));
    
    ticketForm.reset();
    if (reportModal) reportModal.classList.replace('flex', 'hidden');
    
    if (adminView && !adminView.classList.contains('hidden')) {
        renderAdminDashboard();
    } else {
        renderStudentTickets();
    }
});

if (document.getElementById('studentView') || document.getElementById('adminView')) {
    injectRoleTogglerButton();
    renderActiveView();
    initScrollParallaxEngine();
}