// Initialize AOS
AOS.init({ duration: 1000, once: true });

// Navbar Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
        if (window.innerWidth <= 768) navMenu.classList.remove('active');
    });
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    });
}

// Modal Functionality
document.querySelectorAll('[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById(link.getAttribute('data-modal'));
        if (modal) modal.style.display = 'block';
    });
});

document.querySelectorAll('.close-modal').forEach(close => {
    close.addEventListener('click', () => {
        close.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isOpen = answer.style.display === 'block';
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        if (!isOpen) answer.style.display = 'block';
    });
});

// Scheduler and Notification Logic
const schedulerForm = document.getElementById('scheduler-form');
const scheduleResult = document.getElementById('schedule-result');
const saveBtn = document.getElementById('save-schedule');
const loadBtn = document.getElementById('load-schedule');
const resetBtn = document.getElementById('reset-schedule');
const error = document.getElementById('schedule-error');
const notificationArea = document.getElementById('notification-area');

const vaccineSchedule = [
    { vaccine: 'BCG', ageDays: 0, dose: 1 },
    { vaccine: 'Pentavalent', ageDays: 42, dose: 1 },
    { vaccine: 'OPV', ageDays: 42, dose: 1 },
    { vaccine: 'PCV', ageDays: 42, dose: 1 },
    { vaccine: 'Pentavalent', ageDays: 70, dose: 2 },
    { vaccine: 'OPV', ageDays: 70, dose: 2 },
    { vaccine: 'PCV', ageDays: 70, dose: 2 },
    { vaccine: 'Pentavalent', ageDays: 98, dose: 3 },
    { vaccine: 'OPV', ageDays: 98, dose: 3 },
    { vaccine: 'MR', ageDays: 270, dose: 1 },
    { vaccine: 'JE', ageDays: 365, dose: 1 },
    { vaccine: 'MR', ageDays: 456, dose: 2 },
    { vaccine: 'Typhoid', ageDays: 456, dose: 1 }
];

let savedSchedule = null;
let dobValue = null;

if (schedulerForm) {
    schedulerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dobInput = document.getElementById('dob');
        if (!error) {
            console.error('Error element not found');
            return;
        }
        dobValue = new Date(dobInput.value);
        if (!dobValue || isNaN(dobValue.getTime())) {
            error.textContent = 'Please enter a valid date of birth.';
            return;
        }
        error.textContent = '';
        const today = new Date();
        let html = '<table><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr>';
        const scheduleData = [];
        vaccineSchedule.forEach(v => {
            const dueDate = new Date(dobValue);
            dueDate.setDate(dobValue.getDate() + v.ageDays);
            const status = dueDate < today ? 'Past' : dueDate.toDateString() === today.toDateString() ? 'Due Today' : 'Upcoming';
            scheduleData.push({ vaccine: v.vaccine, dose: `Dose ${v.dose}`, dueDate: dueDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }), status, originalDate: dueDate });
            html += `<tr><td>${v.vaccine}</td><td>Dose ${v.dose}</td><td>${dueDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</td><td>${status}</td></tr>`;
        });
        html += '</table>';
        scheduleResult.innerHTML = html;
        scheduleResult.style.display = 'block';
        saveBtn.style.display = 'inline-block';
        loadBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        savedSchedule = scheduleData;
        updateNotifications();
    });

    saveBtn.addEventListener('click', () => {
        if (!savedSchedule || !dobValue) {
            alert('No schedule to save.');
            return;
        }
        const dataToSave = { schedule: savedSchedule, dob: dobValue.toISOString() };
        localStorage.setItem('vaccineSchedule', JSON.stringify(dataToSave));
        alert('Schedule and reminders saved successfully!');
    });

    loadBtn.addEventListener('click', () => {
        const saved = localStorage.getItem('vaccineSchedule');
        if (saved) {
            const data = JSON.parse(saved);
            savedSchedule = data.schedule;
            dobValue = new Date(data.dob);
            let html = '<table><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr>';
            savedSchedule.forEach(v => {
                html += `<tr><td>${v.vaccine}</td><td>${v.dose}</td><td>${v.dueDate}</td><td>${v.status}</td></tr>`;
            });
            html += '</table>';
            scheduleResult.innerHTML = html;
            scheduleResult.style.display = 'block';
            saveBtn.style.display = 'inline-block';
            loadBtn.style.display = 'inline-block';
            resetBtn.style.display = 'inline-block';
            updateNotifications();
        } else {
            alert('No saved schedule found.');
        }
    });

    resetBtn.addEventListener('click', () => {
        scheduleResult.innerHTML = '';
        scheduleResult.style.display = 'none';
        saveBtn.style.display = 'none';
        loadBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        document.getElementById('dob').value = '';
        if (error) error.textContent = '';
        notificationArea.style.display = 'none';
        notificationArea.textContent = '';
        savedSchedule = null;
        dobValue = null;
    });
}

// Enhanced Notification Logic
function updateNotifications() {
    if (!savedSchedule || !dobValue) return;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const upcoming = savedSchedule.find(item => {
        const dueDate = new Date(item.originalDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && dueDate > today;
    });

    if (upcoming) {
        const daysUntil = Math.ceil((upcoming.originalDate - today) / (1000 * 60 * 60 * 24));
        notificationArea.textContent = `Reminder: Your child’s ${upcoming.vaccine} (${upcoming.dose}) is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}!`;
        notificationArea.classList.add('active');
        setTimeout(() => {
            if (notificationArea.classList.contains('active')) {
                notificationArea.classList.remove('active');
                notificationArea.textContent = '';
            }
        }, 10000); // Notification disappears after 10 seconds
    } else {
        notificationArea.textContent = 'No vaccines due this month. Check back next month!';
        notificationArea.classList.add('active');
        setTimeout(() => notificationArea.classList.remove('active'), 5000);
    }
}

// Poll for notifications every hour
setInterval(() => {
    if (savedSchedule && dobValue) updateNotifications();
}, 3600000); // 1 hour in milliseconds

// Check notifications on page load
window.addEventListener('load', () => {
    const saved = localStorage.getItem('vaccineSchedule');
    if (saved) {
        const data = JSON.parse(saved);
        savedSchedule = data.schedule;
        dobValue = new Date(data.dob);
        const dobInput = document.getElementById('dob');
        dobInput.value = dobValue.toISOString().split('T')[0];
        let html = '<table><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr>';
        savedSchedule.forEach(v => {
            html += `<tr><td>${v.vaccine}</td><td>${v.dose}</td><td>${v.dueDate}</td><td>${v.status}</td></tr>`;
        });
        html += '</table>';
        scheduleResult.innerHTML = html;
        scheduleResult.style.display = 'block';
        saveBtn.style.display = 'inline-block';
        loadBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        updateNotifications();
    }
});

// Auth Toggle and Validation (unchanged)
const toggleButtons = document.querySelectorAll('.toggle-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
if (toggleButtons && loginForm && registerForm) {
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loginForm.style.display = btn.dataset.form === 'login' ? 'block' : 'none';
            registerForm.style.display = btn.dataset.form === 'register' ? 'block' : 'none';
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const error = document.getElementById('login-error');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            return;
        }
        error.textContent = '';
        alert('Login successful! (Demo)');
        loginForm.reset();
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const error = document.getElementById('register-error');
        if (!name || name.length < 2) {
            error.textContent = 'Please enter a valid name.';
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            return;
        }
        if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match.';
            return;
        }
        error.textContent = '';
        alert('Registration successful! (Demo)');
        registerForm.reset();
    });
}