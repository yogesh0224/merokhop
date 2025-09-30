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

// Initialize Swiper Slider
const swiper = new Swiper('.vaccine-slider', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    },
});

// Scheduler and Notification Logic
const schedulerForm = document.getElementById('scheduler-form');
const scheduleResult = document.getElementById('schedule-result');
const saveBtn = document.getElementById('save-schedule');
const loadBtn = document.getElementById('load-schedule');
const resetBtn = document.getElementById('reset-schedule');
const scheduleBtn = document.querySelector('#scheduler-form .schedule-btn');
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
        if (!error || !scheduleBtn) {
            console.error('Required elements not found');
            return;
        }
        dobValue = new Date(dobInput.value);
        const today = new Date('2025-09-30T12:11:00+0545');
        if (!dobValue || isNaN(dobValue.getTime()) || dobValue > today) {
            error.textContent = 'Please enter a valid past date of birth.';
            return;
        }
        error.textContent = '';
        scheduleBtn.disabled = true;
        scheduleBtn.textContent = 'Generating...';

        // Simulate processing delay
        setTimeout(() => {
            let html = '<table><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr>';
            const scheduleData = [];
            vaccineSchedule.forEach(v => {
                const dueDate = new Date(dobValue);
                dueDate.setDate(dobValue.getDate() + v.ageDays);
                let statusClass = '';
                let status = 'Upcoming';
                if (dueDate < today) {
                    status = 'Past';
                    statusClass = 'status-past';
                } else if (dueDate.toDateString() === today.toDateString()) {
                    status = 'Due Today';
                    statusClass = 'status-due';
                }
                scheduleData.push({ vaccine: v.vaccine, dose: `Dose ${v.dose}`, dueDate: dueDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }), status, originalDate: dueDate });
                html += `<tr><td>${v.vaccine}</td><td>${v.dose}</td><td>${dueDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</td><td class="${statusClass}">${status}</td></tr>`;
            });
            html += '</table>';
            scheduleResult.innerHTML = `<p class="schedule-summary">Generated schedule for child born on ${dobValue.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</p>${html}`;
            scheduleResult.style.display = 'block';
            savedSchedule = scheduleData;
            scheduleBtn.disabled = false;
            scheduleBtn.textContent = 'Generate Schedule';
            updateNotifications();
        }, 500);
    });

    saveBtn.addEventListener('click', () => {
        if (!savedSchedule || !dobValue) {
            alert('No schedule to save.');
            return;
        }
        const dataToSave = { schedule: savedSchedule, dob: dobValue.toISOString() };
        localStorage.setItem('vaccineSchedule', JSON.stringify(dataToSave));
        alert('Schedule saved successfully!');
    });

    loadBtn.addEventListener('click', () => {
        const saved = localStorage.getItem('vaccineSchedule');
        if (saved) {
            const data = JSON.parse(saved);
            savedSchedule = data.schedule;
            dobValue = new Date(data.dob);
            let html = '<table><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr>';
            savedSchedule.forEach(v => {
                let statusClass = '';
                if (v.status === 'Past') statusClass = 'status-past';
                else if (v.status === 'Due Today') statusClass = 'status-due';
                else statusClass = 'status-upcoming';
                html += `<tr><td>${v.vaccine}</td><td>${v.dose}</td><td>${v.dueDate}</td><td class="${statusClass}">${v.status}</td></tr>`;
            });
            html = `<p class="schedule-summary">Loaded schedule for child born on ${dobValue.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</p>${html}`;
            scheduleResult.innerHTML = html;
            scheduleResult.style.display = 'block';
            updateNotifications();
        } else {
            alert('No saved schedule found.');
        }
    });

    resetBtn.addEventListener('click', () => {
        scheduleResult.innerHTML = '';
        scheduleResult.style.display = 'none';
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
    const today = new Date('2025-09-30T12:11:00+0545');
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const upcoming = savedSchedule.filter(item => {
        const dueDate = new Date(item.originalDate);
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && dueDate > today;
    });

    if (upcoming.length > 0) {
        const nextDue = upcoming.reduce((closest, current) => {
            return (new Date(current.originalDate) - today) < (new Date(closest.originalDate) - today) ? current : closest;
        });
        const daysUntil = Math.ceil((new Date(nextDue.originalDate) - today) / (1000 * 60 * 60 * 24));
        notificationArea.textContent = `Reminder: Your child’s ${nextDue.vaccine} (${nextDue.dose}) is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}! (${today.toLocaleString('en-NG', { timeZone: 'Asia/Kathmandu' })} NPT)`;
        notificationArea.classList.add('active');
        setTimeout(() => {
            if (notificationArea.classList.contains('active')) {
                notificationArea.classList.remove('active');
                notificationArea.textContent = '';
            }
        }, 10000);
    } else {
        notificationArea.textContent = 'No vaccines due this month. Check back next month! (Last checked: ' + today.toLocaleString('en-NG', { timeZone: 'Asia/Kathmandu' }) + ' NPT)';
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
            let statusClass = '';
            if (v.status === 'Past') statusClass = 'status-past';
            else if (v.status === 'Due Today') statusClass = 'status-due';
            else statusClass = 'status-upcoming';
            html += `<tr><td>${v.vaccine}</td><td>${v.dose}</td><td>${v.dueDate}</td><td class="${statusClass}">${v.status}</td></tr>`;
        });
        html = `<p class="schedule-summary">Loaded schedule for child born on ${dobValue.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</p>${html}`;
        scheduleResult.innerHTML = html;
        scheduleResult.style.display = 'block';
        updateNotifications();
    }
    // Initialize Swiper after DOM is fully loaded
    if (typeof Swiper !== 'undefined') {
        new Swiper('.vaccine-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
        });
    }
});

// Authentication Logic (for auth.html)
const toggleButtons = document.querySelectorAll('.toggle-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.querySelector('#login-form .auth-btn');
const registerBtn = document.querySelector('#register-form .auth-btn');
let isLoading = false;

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
        if (isLoading) return;
        isLoading = true;
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            isLoading = false;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            isLoading = false;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            return;
        }

        // Simulate API call
        setTimeout(() => {
            error.textContent = '';
            document.getElementById('login-success').textContent = 'Login successful! Redirecting... (Demo)';
            loginForm.reset();
            isLoading = false;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            setTimeout(() => {
                document.getElementById('login-success').textContent = '';
                // Redirect or update UI here in production
            }, 2000);
        }, 1000);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const error = document.getElementById('register-error');
        if (isLoading) return;
        isLoading = true;
        registerBtn.disabled = true;
        registerBtn.textContent = 'Registering...';

        if (!name || name.length < 2) {
            error.textContent = 'Please enter a valid name.';
            isLoading = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            isLoading = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            isLoading = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
            return;
        }
        if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match.';
            isLoading = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
            return;
        }

        // Simulate API call
        setTimeout(() => {
            error.textContent = '';
            document.getElementById('register-success').textContent = 'Registration successful! Redirecting... (Demo)';
            registerForm.reset();
            isLoading = false;
            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
            setTimeout(() => {
                document.getElementById('register-success').textContent = '';
                // Redirect or update UI here in production
            }, 2000);
        }, 1000);
    });
}