(function() {
    'use strict';

    // Initialize external libraries
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-in-out'
        });
    } else {
        console.warn('AOS not loaded');
    }

    if (typeof Swiper !== 'undefined') {
        new Swiper('.vaccine-slider', {
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
    } else {
        console.warn('Swiper not loaded');
    }

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

    // Smooth Scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            if (window.innerWidth <= 768 && navMenu) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
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

    // Site Search (simple filter)
    const siteSearch = document.getElementById('site-search');
    if (siteSearch) {
        siteSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('section').forEach(section => {
                const text = section.textContent.toLowerCase();
                section.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }

    // Modal Functionality with focus trap
    document.addEventListener('click', (e) => {
        const modalTrigger = e.target.closest('[data-modal]');
        if (modalTrigger) {
            e.preventDefault();
            const modalId = modalTrigger.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                const focusable = modal.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])');
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                firstFocusable.focus();
                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab' && e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else if (e.key === 'Tab') {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                });
            }
        } else if (e.target.matches('.close-modal') || !e.target.closest('.modal-content')) {
            e.target.closest('.modal')?.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
        }
    });

    // FAQ Accordion (close others)
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-question').forEach(q => q.setAttribute('aria-expanded', 'false'));
            document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
            if (!isExpanded) {
                question.setAttribute('aria-expanded', 'true');
                question.nextElementSibling.style.display = 'block';
            }
        });
    });

    // Scheduler Logic
    const schedulerForm = document.getElementById('scheduler-form');
    if (schedulerForm) {
        const scheduleResult = document.getElementById('schedule-result');
        const saveBtn = document.getElementById('save-schedule');
        const loadBtn = document.getElementById('load-schedule');
        const resetBtn = document.getElementById('reset-schedule');
        const exportBtn = document.getElementById('export-schedule');
        const scheduleBtn = schedulerForm.querySelector('.schedule-btn');
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
            const dobInput = document.getElementById('dob');
            dobValue = new Date(dobInput.value);
            const today = new Date('2025-10-14T08:24:00+0545');
            if (!dobValue || isNaN(dobValue.getTime()) || dobValue > today) {
                errorEl.textContent = 'Please enter a valid past date of birth.';
                return;
            }
            errorEl.textContent = '';
            scheduleBtn.disabled = true;
            scheduleBtn.textContent = 'Generating...';

            let tableHTML = '<table class="schedule-table"><thead><tr><th>Vaccine</th><th>Dose</th><th>Due Date</th><th>Status</th></tr></thead><tbody>';
            const scheduleData = [];
            vaccineSchedule.forEach(v => {
                const dueDate = new Date(dobValue);
                dueDate.setDate(dobValue.getDate() + v.ageDays);
                const { label: status, class: statusClass } = getStatus(dueDate, today);
                scheduleData.push({ vaccine: v.vaccine, dose: `Dose ${v.dose}`, dueDate: formatDate(dueDate), status, originalDate: dueDate });
                tableHTML += `<tr><td>${v.vaccine}</td><td>Dose ${v.dose}</td><td>${formatDate(dueDate)}</td><td class="${statusClass}">${status}</td></tr>`;
            });
            tableHTML += '</tbody></table>';
            scheduleResult.innerHTML = `<p class="schedule-summary">Schedule for child born on ${formatDate(dobValue)}</p>${tableHTML}`;
            scheduleResult.style.display = 'block';
            savedSchedule = scheduleData;
            scheduleBtn.disabled = false;
            scheduleBtn.textContent = 'Generate Schedule';
            updateNotifications(scheduleData, today);
        });

        saveBtn.addEventListener('click', () => {
            if (!savedSchedule || !dobValue) return alert('No schedule to save.');
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
                document.getElementById('dob').value = dobValue.toISOString().split('T')[0];
                schedulerForm.dispatchEvent(new Event('submit'));
            } else {
                alert('No saved schedule found.');
            }
        });

        resetBtn.addEventListener('click', () => {
            scheduleResult.innerHTML = '';
            scheduleResult.style.display = 'none';
            document.getElementById('dob').value = '';
            errorEl.textContent = '';
            notificationArea.style.display = 'none';
            savedSchedule = null;
            dobValue = null;
        });

        exportBtn.addEventListener('click', () => {
            if (!savedSchedule) return alert('No schedule to export.');
            const icsContent = generateICS(savedSchedule, dobValue);
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vaccine_schedule_${formatDate(new Date())}.ics`;
            a.click();
            URL.revokeObjectURL(url);
        });

        function getStatus(dueDate, today) {
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return { label: 'Past', class: 'status-past' };
            if (diffDays === 0) return { label: 'Due Today', class: 'status-due' };
            return { label: 'Upcoming', class: 'status-upcoming' };
        }

        function formatDate(date) {
            return date.toLocaleDateString('en-NP', { day: '2-digit', month: 'long', year: 'numeric' });
        }

        function updateNotifications(scheduleData, today) {
            if (!scheduleData.length) return;
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
                notificationArea.textContent = `Reminder: Your child’s ${nextDue.vaccine} ${nextDue.dose} is due in ${daysUntil} day${daysUntil > 1 ? 's' : ''} on ${formatDate(nextDue.originalDate)}.`;
                notificationArea.classList.add('active');
            } else {
                notificationArea.classList.remove('active');
            }
        }

        function generateICS(scheduleData, dob) {
            const cal = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Mero Khop//Vaccine Scheduler//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH'
            ];
            scheduleData.forEach(event => {
                cal.push(
                    'BEGIN:VEVENT',
                    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@merokhop.com`,
                    `DTSTART:${formatICSDate(event.originalDate)}`,
                    `DTEND:${formatICSDate(new Date(event.originalDate.getTime() + 3600000))}`, // 1 hour event
                    `SUMMARY:${event.vaccine} ${event.dose}`,
                    `DESCRIPTION:Vaccine due date for child born on ${formatDate(dob)}.`,
                    'CLASS:PUBLIC',
                    'BEGIN:VALARM',
                    'TRIGGER:-P1D', // 1 day before
                    'ACTION:DISPLAY',
                    'DESCRIPTION:Reminder: Vaccine due tomorrow!',
                    'END:VALARM',
                    'END:VEVENT'
                );
            });
            cal.push('END:VCALENDAR');
            return cal.join('\n');
        }

        function formatICSDate(date) {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1) + 'Z';
        }
    }

    // Auth Logic
    if (document.querySelector('.auth-toggle')) {
        document.querySelectorAll('.toggle-btn, .toggle-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetForm = btn.dataset.form;
                document.querySelectorAll('.auth-form').forEach(form => form.classList.toggle('active', form.id === `${targetForm}-form`));
                document.querySelectorAll('.toggle-btn').forEach(t => {
                    t.classList.toggle('active', t.dataset.form === targetForm);
                    t.setAttribute('aria-selected', t.dataset.form === targetForm ? 'true' : 'false');
                });
            });
        });

        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggle.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        });

        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');

            if (!email || !password) {
                errorEl.textContent = 'Please fill in all fields.';
                return;
            }

            // Mock login with basic validation
            if (email === 'user@example.com' && password === 'password123') {
                errorEl.textContent = '';
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                alert('Login successful! Redirecting...');
                window.location.href = 'index.html';
            } else {
                errorEl.textContent = 'Invalid email or password.';
            }
        });

        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            const emailError = document.getElementById('register-error');
            const confirmError = document.getElementById('confirm-error');

            if (!name || !email || !password || !confirm) {
                emailError.textContent = 'Please fill in all fields.';
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailError.textContent = 'Please enter a valid email address.';
                return;
            }

            if (password.length < 8) {
                confirmError.textContent = 'Password must be at least 8 characters.';
                return;
            }

            if (password !== confirm) {
                confirmError.textContent = 'Passwords do not match.';
                return;
            }

            // Mock registration
            emailError.textContent = '';
            confirmError.textContent = '';
            alert('Registration successful! Please login.');
            document.querySelector('[data-form="login"]').click();
        });
    }

    // Check login status and update UI
    if (localStorage.getItem('isLoggedIn') === 'true' && document.querySelector('.btn-primary')) {
        const loginBtn = document.querySelector('.btn-primary');
        const userEmail = localStorage.getItem('userEmail');
        loginBtn.textContent = `Logout (${userEmail})`;
        loginBtn.href = '#';
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            alert('Logged out successfully!');
            window.location.reload();
        });
    }
})();