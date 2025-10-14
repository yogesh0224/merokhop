(function() {
    'use strict';

    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-in-out'
    });

    // Initialize Swiper with error handling
    function initSwiper() {
        if (typeof Swiper === 'undefined') {
            console.error('Swiper library failed to load. Please check your internet connection or CDN URL.');
            return;
        }

        const swiper = new Swiper('.vaccine-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: { delay: 3000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }

    // Defer Swiper initialization to ensure library is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initSwiper();
    });

    // Navbar Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 768 && navMenu) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Theme Toggle
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

    // Modal Functionality
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

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answer = question.nextElementSibling;
            document.querySelectorAll('.faq-question').forEach(q => {
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.style.display = 'none';
            });
            if (!isExpanded) {
                question.setAttribute('aria-expanded', 'true');
                answer.style.display = 'block';
            }
        });
    });

    // Scheduler Logic
    const schedulerForm = document.getElementById('scheduler-form');
    if (schedulerForm) {
        const dobInput = document.getElementById('dob');
        const scheduleResult = document.getElementById('schedule-result');
        const scheduleBody = document.getElementById('schedule-body');
        const saveBtn = document.getElementById('save-schedule');
        const loadBtn = document.getElementById('load-schedule');
        const resetBtn = document.getElementById('reset-schedule');
        const exportBtn = document.getElementById('export-schedule');
        const errorEl = document.getElementById('schedule-error');
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

        schedulerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const dob = dobInput.value;
            if (!dob) {
                errorEl.textContent = 'Please select a date of birth.';
                return;
            }
            dobValue = new Date(dob);
            const today = new Date('2025-10-14T18:55:00+0545'); // Updated to current time
            if (dobValue > today) {
                errorEl.textContent = 'Date of birth cannot be in the future.';
                return;
            }
            errorEl.textContent = '';
            generateSchedule(today);
        });

        function generateSchedule(today) {
            scheduleBody.innerHTML = '';
            const scheduleData = vaccineSchedule.map(v => {
                const dueDate = new Date(dobValue);
                dueDate.setDate(dobValue.getDate() + v.ageDays);
                const status = getStatus(dueDate, today);
                return { vaccine: v.vaccine, dose: `Dose ${v.dose}`, dueDate: dueDate.toLocaleDateString('en-NP', { day: '2-digit', month: 'long', year: 'numeric' }), status, originalDate: dueDate };
            });

            scheduleData.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.vaccine}</td>
                    <td>${item.dose}</td>
                    <td>${item.dueDate}</td>
                    <td class="${item.status.toLowerCase().replace(' ', '-')}">${item.status}</td>
                `;
                scheduleBody.appendChild(row);
            });

            scheduleResult.style.display = 'block';
            savedSchedule = scheduleData;
            updateNotifications(scheduleData, today);
        }

        function getStatus(dueDate, today) {
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return 'Past';
            if (diffDays === 0) return 'Due Today';
            return 'Upcoming';
        }

        function updateNotifications(scheduleData, today) {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const upcoming = scheduleData.filter(item => {
                const dueDate = new Date(item.originalDate);
                return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && dueDate > today;
            });
            if (upcoming.length > 0) {
                const nextDue = upcoming.reduce((closest, current) => {
                    return (new Date(current.originalDate) - today) < (new Date(closest.originalDate) - today) ? current : closest;
                });
                const daysUntil = Math.ceil((new Date(nextDue.originalDate) - today) / (1000 * 60 * 60 * 24));
                notificationArea.textContent = `Reminder: ${nextDue.vaccine} ${nextDue.dose} is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''} on ${nextDue.dueDate}.`;
                notificationArea.style.display = 'block';
            } else {
                notificationArea.style.display = 'none';
            }
        }

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
                dobInput.value = dobValue.toISOString().split('T')[0];
                generateSchedule(new Date('2025-10-14T18:55:00+0545')); // Updated to current time
            } else {
                alert('No saved schedule found.');
            }
        });

        resetBtn.addEventListener('click', () => {
            scheduleResult.style.display = 'none';
            scheduleBody.innerHTML = '';
            dobInput.value = '';
            errorEl.textContent = '';
            notificationArea.style.display = 'none';
            savedSchedule = null;
            dobValue = null;
        });

        exportBtn.addEventListener('click', () => {
            if (!savedSchedule) {
                alert('No schedule to export.');
                return;
            }
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Mero Khop//Vaccine Scheduler//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH'
            ];
            savedSchedule.forEach(event => {
                icsContent.push(
                    'BEGIN:VEVENT',
                    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@merokhop.com`,
                    `DTSTART:${event.originalDate.toISOString().replace(/[-:]/g, '').slice(0, -5)}Z`,
                    `DTEND:${new Date(event.originalDate.getTime() + 3600000).toISOString().replace(/[-:]/g, '').slice(0, -5)}Z`,
                    `SUMMARY:${event.vaccine} ${event.dose}`,
                    `DESCRIPTION:Vaccine due date for child born on ${dobValue.toLocaleDateString('en-NP', { day: '2-digit', month: 'long', year: 'numeric' })}.`,
                    'CLASS:PUBLIC',
                    'BEGIN:VALARM',
                    'TRIGGER:-P1D',
                    'ACTION:DISPLAY',
                    'DESCRIPTION:Reminder: Vaccine due tomorrow!',
                    'END:VALARM',
                    'END:VEVENT'
                );
            });
            icsContent.push('END:VCALENDAR');
            const blob = new Blob([icsContent.join('\n')], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vaccine_schedule_${new Date().toISOString().split('T')[0]}.ics`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Auth Functionality
    const authTabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    if (authTabs.length && tabPanes.length) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-password-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const forgotError = document.getElementById('forgot-error');

    // Password Toggle Functionality
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });

    // Form Validation and Submission (Basic Example)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;
            if (!email || !password) {
                loginError.textContent = 'Please fill in all fields.';
                return;
            }
            loginError.textContent = 'Logging in... (Mock response)';
            // Add actual login logic here
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('#register-name').value;
            const email = registerForm.querySelector('#register-email').value;
            const password = registerForm.querySelector('#register-password').value;
            const confirmPassword = registerForm.querySelector('#confirm-password').value;
            if (!name || !email || !password || !confirmPassword) {
                registerError.textContent = 'Please fill in all fields.';
                return;
            }
            if (password !== confirmPassword) {
                registerError.textContent = 'Passwords do not match.';
                return;
            }
            if (password.length < 8) {
                registerError.textContent = 'Password must be at least 8 characters.';
                return;
            }
            registerError.textContent = 'Registering... (Mock response)';
            // Add actual registration logic here
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = forgotForm.querySelector('#forgot-email').value;
            if (!email) {
                forgotError.textContent = 'Please enter your email.';
                return;
            }
            forgotError.textContent = 'Reset link sent... (Mock response)';
            // Add actual password reset logic here
        });
    }
})();