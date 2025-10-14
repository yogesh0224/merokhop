(function() {
    'use strict';

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-in-out'
        });
    } else {
        console.warn('AOS library not loaded.');
    }

    // Initialize Swiper
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
        console.warn('Swiper library not loaded.');
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

    // Modal Functionality
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
        } else if (e.target.matches('.close-modal') || !e.target.closest('.modal-content')) {
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
        }
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-question').forEach(q => {
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.style.display = 'none';
            });
            if (!isExpanded) {
                question.setAttribute('aria-expanded', 'true');
                question.nextElementSibling.style.display = 'block';
            }
        });
    });

    // Scheduler Logic
    const schedulerForm = document.querySelector('.scheduler-form');
    if (schedulerForm) {
        const dobInput = document.getElementById('dob');
        const scheduleResult = document.getElementById('schedule-result');
        const calendarContainer = document.querySelector('.calendar-container');
        const saveBtn = document.getElementById('save-schedule');
        const loadBtn = document.getElementById('load-schedule');
        const resetBtn = document.getElementById('reset-schedule');
        const exportBtn = document.getElementById('export-schedule');
        const generateBtn = document.getElementById('generate-schedule');
        const errorEl = document.getElementById('schedule-error');
        const notificationArea = document.getElementById('notification-area');

        if (dobInput) {
            flatpickr(dobInput, {
                dateFormat: 'F j, Y',
                maxDate: new Date('2025-10-14T09:10:00+0545'),
                onChange: () => errorEl.textContent = ''
            });
        }

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

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const dob = dobInput ? dobInput.value : '';
                if (!dob) {
                    if (errorEl) errorEl.textContent = 'Please select a valid date of birth.';
                    return;
                }
                dobValue = new Date(dob);
                const today = new Date('2025-10-14T09:10:00+0545');
                if (dobValue > today) {
                    if (errorEl) errorEl.textContent = 'Date of birth cannot be in the future.';
                    return;
                }
                if (errorEl) errorEl.textContent = '';
                if (generateBtn) {
                    generateBtn.disabled = true;
                    generateBtn.textContent = 'Generating...';
                }

                const scheduleData = vaccineSchedule.map(v => {
                    const dueDate = new Date(dobValue);
                    dueDate.setDate(dobValue.getDate() + v.ageDays);
                    const { label: status, class: statusClass } = getStatus(dueDate, today);
                    return { vaccine: v.vaccine, dose: `Dose ${v.dose}`, dueDate: formatDate(dueDate), status, originalDate: dueDate };
                });

                if (calendarContainer) {
                    let calendarHTML = '<div class="calendar-grid">';
                    scheduleData.forEach(item => {
                        calendarHTML += `<div class="calendar-event ${item.status.toLowerCase().replace(' ', '-')}" data-date="${item.originalDate.toISOString().split('T')[0]}">
                            <span class="event-vaccine">${item.vaccine} ${item.dose}</span>
                            <span class="event-status ${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span>
                        </div>`;
                    });
                    calendarHTML += '</div>';
                    calendarContainer.innerHTML = calendarHTML;
                }
                if (scheduleResult) scheduleResult.style.display = 'block';
                savedSchedule = scheduleData;
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generate Schedule';
                }
                if (notificationArea) updateNotifications(scheduleData, today);
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (!savedSchedule || !dobValue) {
                    alert('No schedule to save.');
                    return;
                }
                const dataToSave = { schedule: savedSchedule, dob: dobValue.toISOString() };
                localStorage.setItem('vaccineSchedule', JSON.stringify(dataToSave));
                alert('Schedule saved successfully!');
            });
        }

        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                const saved = localStorage.getItem('vaccineSchedule');
                if (saved) {
                    const data = JSON.parse(saved);
                    savedSchedule = data.schedule;
                    dobValue = new Date(data.dob);
                    if (dobInput) dobInput.value = formatDate(dobValue);
                    if (generateBtn) generateBtn.click();
                } else {
                    alert('No saved schedule found.');
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (scheduleResult) scheduleResult.style.display = 'none';
                if (calendarContainer) calendarContainer.innerHTML = '';
                if (dobInput) dobInput.value = '';
                if (errorEl) errorEl.textContent = '';
                if (notificationArea) notificationArea.style.display = 'none';
                savedSchedule = null;
                dobValue = null;
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                if (!savedSchedule) {
                    alert('No schedule to export.');
                    return;
                }
                const icsContent = generateICS(savedSchedule, dobValue);
                const blob = new Blob([icsContent], { type: 'text/calendar' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vaccine_schedule_${formatDate(new Date('2025-10-14T09:10:00+0545'))}.ics`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

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
            if (!scheduleData.length || !notificationArea) return;
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
                    `DTEND:${formatICSDate(new Date(event.originalDate.getTime() + 3600000))}`,
                    `SUMMARY:${event.vaccine} ${event.dose}`,
                    `DESCRIPTION:Vaccine due date for child born on ${formatDate(dob)}.`,
                    'CLASS:PUBLIC',
                    'BEGIN:VALARM',
                    'TRIGGER:-P1D',
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
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            if (loginError) {
                if (!email || !password) {
                    loginError.textContent = 'Please fill in all fields.';
                    return;
                }
                // Mock authentication
                if (email === 'test@example.com' && password === 'password123') {
                    loginError.textContent = 'Login successful! Redirecting...';
                    loginError.style.color = 'var(--success-color)';
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    loginError.textContent = 'Invalid email or password.';
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            if (registerError) {
                if (!name || !email || !password) {
                    registerError.textContent = 'Please fill in all fields.';
                    return;
                }
                if (password.length < 6) {
                    registerError.textContent = 'Password must be at least 6 characters.';
                    return;
                }
                registerError.textContent = 'Registration successful! Please log in.';
                registerError.style.color = 'var(--success-color)';
                setTimeout(() => {
                    if (document.querySelector('[data-tab="login"]')) {
                        document.querySelector('[data-tab="login"]').click();
                    }
                }, 1000);
            }
        });
    }

    // Ensure tab switching works on link clicks
    document.querySelectorAll('.auth-link a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = link.getAttribute('data-tab') || link.textContent.toLowerCase().replace(' here', '');
            document.querySelector(`[data-tab="${targetTab}"]`).click();
        });
    });
})();