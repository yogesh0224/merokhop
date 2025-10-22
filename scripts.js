// AOS Initialization
function initAOS() {
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-in-out'
    });
}

// Navbar Toggle
function initNavbar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }
}

// Smooth Scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                const navMenu = document.querySelector('.nav-menu');
                const menuToggle = document.querySelector('.menu-toggle');
                if (window.innerWidth <= 768 && navMenu) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
}

// Theme Toggle
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.dataset.theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.dataset.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }
}

// Modal Handling
function initModals() {
    document.addEventListener('click', (e) => {
        const modalTrigger = e.target.closest('[data-modal]');
        if (modalTrigger) {
            e.preventDefault();
            const modalId = modalTrigger.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                const focusable = modal.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
                const firstFocusable = focusable[0];
                if (firstFocusable) firstFocusable.focus();
                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstFocusable) {
                        e.preventDefault();
                        focusable[focusable.length - 1].focus();
                    } else if (e.key === 'Tab' && document.activeElement === focusable[focusable.length - 1]) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                });
            }
        } else if (e.target.classList.contains('close-modal') || !e.target.closest('.modal-content')) {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            });
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            });
        }
    });
}

// FAQ Toggle
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            question.setAttribute('aria-expanded', !isExpanded);
            const answer = question.nextElementSibling;
            answer.style.display = isExpanded ? 'none' : 'block';
        });
    });
}

// Scheduler Functionality
function initScheduler() {
    const schedulerForm = document.getElementById('scheduler-form');
    const scheduleResult = document.getElementById('schedule-result');
    const scheduleBody = document.getElementById('schedule-body');
    const notificationArea = document.getElementById('notification-area');
    const saveButton = document.getElementById('save-schedule');
    const loadButton = document.getElementById('load-schedule');
    const resetButton = document.getElementById('reset-schedule');
    const exportButton = document.getElementById('export-schedule');
    const errorDiv = document.getElementById('schedule-error');
    if (!schedulerForm || !scheduleResult || !scheduleBody || !notificationArea) return;
    const vaccineSchedule = [
        { name: 'BCG', dose: 'At birth', months: 0 },
        { name: 'Pentavalent (DPT-HepB-Hib)', dose: '1st', months: 1.5 },
        { name: 'OPV', dose: '1st', months: 1.5 },
        { name: 'PCV', dose: '1st', months: 1.5 },
        { name: 'Pentavalent (DPT-HepB-Hib)', dose: '2nd', months: 2.5 },
        { name: 'OPV', dose: '2nd', months: 2.5 },
        { name: 'PCV', dose: '2nd', months: 2.5 },
        { name: 'Pentavalent (DPT-HepB-Hib)', dose: '3rd', months: 3.5 },
        { name: 'OPV', dose: '3rd', months: 3.5 },
        { name: 'fIPV', dose: '1st', months: 3.5 },
        { name: 'MR', dose: '1st', months: 9 },
        { name: 'PCV', dose: 'Booster', months: 9 },
        { name: 'fIPV', dose: '2nd', months: 9 },
        { name: 'JE', dose: '1st (endemic)', months: 12 },
        { name: 'MR', dose: '2nd', months: 15 },
        { name: 'TCV', dose: '1st', months: 15 }
    ];
    function showToast(message) {
        notificationArea.textContent = message;
        notificationArea.style.display = 'block';
        setTimeout(() => {
            notificationArea.style.display = 'none';
            notificationArea.textContent = '';
        }, 3000);
    }
    function calculateDueDate(dob, months) {
        const due = new Date(dob);
        due.setMonth(dob.getMonth() + months);
        return due.toISOString().split('T')[0];
    }
    function getStatus(dueDate) {
        const today = new Date('2025-10-22');
        const due = new Date(dueDate);
        if (due < today) return 'past';
        if (due.toDateString() === today.toDateString()) return 'due-today';
        return 'upcoming';
    }
    schedulerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dobInput = document.getElementById('dob');
        const dob = new Date(dobInput.value);
        if (!dobInput.value || isNaN(dob.getTime()) || dob > new Date('2025-10-22')) {
            errorDiv.textContent = 'Please enter a valid date of birth (not in the future).';
            return;
        }
        errorDiv.textContent = '';
        scheduleBody.innerHTML = '';
        vaccineSchedule.forEach(vaccine => {
            const dueDate = calculateDueDate(dob, vaccine.months);
            const status = getStatus(dueDate);
            const row = document.createElement('tr');
            row.classList.add(status);
            row.innerHTML = `
                <td>${vaccine.name}</td>
                <td>${vaccine.dose}</td>
                <td>${dueDate}</td>
                <td>${status.replace('-', ' ').toUpperCase()}</td>
            `;
            scheduleBody.appendChild(row);
        });
        scheduleResult.style.display = 'block';
        showToast('Schedule generated successfully!');
    });
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const tableData = Array.from(scheduleBody.children).map(row => ({
                vaccine: row.children[0].textContent,
                dose: row.children[1].textContent,
                dueDate: row.children[2].textContent,
                status: row.children[3].textContent
            }));
            localStorage.setItem('vaccineSchedule', JSON.stringify(tableData));
            showToast('Schedule saved successfully!');
        });
    }
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            const savedData = localStorage.getItem('vaccineSchedule');
            if (savedData) {
                const tableData = JSON.parse(savedData);
                scheduleBody.innerHTML = '';
                tableData.forEach(data => {
                    const row = document.createElement('tr');
                    row.classList.add(data.status.toLowerCase().replace(' ', '-'));
                    row.innerHTML = `
                        <td>${data.vaccine}</td>
                        <td>${data.dose}</td>
                        <td>${data.dueDate}</td>
                        <td>${data.status}</td>
                    `;
                    scheduleBody.appendChild(row);
                });
                scheduleResult.style.display = 'block';
                showToast('Schedule loaded successfully!');
            } else {
                showToast('No saved schedule found.');
            }
        });
    }
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            schedulerForm.reset();
            scheduleResult.style.display = 'none';
            scheduleBody.innerHTML = '';
            showToast('Schedule reset successfully!');
        });
    }
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const tableData = Array.from(scheduleBody.children).map(row => ({
                vaccine: row.children[0].textContent,
                dose: row.children[1].textContent,
                dueDate: row.children[2].textContent
            }));
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//MeroKhop//VaccineScheduler//EN',
                ...tableData.map(data => [
                    'BEGIN:VEVENT',
                    `SUMMARY:${data.vaccine} - ${data.dose}`,
                    `DTSTART;VALUE=DATE:${data.dueDate.replace(/-/g, '')}`,
                    `DESCRIPTION:${data.vaccine} (${data.dose}) due on ${data.dueDate}`,
                    'END:VEVENT'
                ].join('\n')),
                'END:VCALENDAR'
            ].join('\n');
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vaccine-schedule.ics';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Schedule exported to calendar!');
        });
    }
}

// Auth Form Handling
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-password-form');
    const tabs = document.querySelectorAll('.tab-btn');
    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    if (tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
                document.getElementById(tab.dataset.tab).style.display = 'block';
            });
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            if (!email || !password) {
                errorDiv.textContent = 'Please fill in all fields.';
                return;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                errorDiv.textContent = 'Please enter a valid email.';
                return;
            }
            errorDiv.textContent = '';
            showToast('Login successful!');
            loginForm.reset();
        });
    }
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('register-terms').checked;
            const errorDiv = document.getElementById('register-error');
            if (!name || !email || !password || !confirmPassword || !terms) {
                errorDiv.textContent = 'Please fill in all fields and agree to the terms.';
                return;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                errorDiv.textContent = 'Please enter a valid email.';
                return;
            }
            if (password.length < 8) {
                errorDiv.textContent = 'Password must be at least 8 characters.';
                return;
            }
            if (password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match.';
                return;
            }
            errorDiv.textContent = '';
            showToast('Registration successful!');
            registerForm.reset();
        });
    }
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const errorDiv = document.getElementById('forgot-error');
            if (!email) {
                errorDiv.textContent = 'Please enter your email.';
                return;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                errorDiv.textContent = 'Please enter a valid email.';
                return;
            }
            errorDiv.textContent = '';
            showToast('Reset link sent to your email!');
            forgotForm.reset();
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            });
        });
    }
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });
}

// Initialize All Features
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initNavbar();
    initSmoothScroll();
    initTheme();
    initModals();
    initFAQ();
    initScheduler();
    initAuth();
});