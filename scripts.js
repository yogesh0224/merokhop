(function () {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
        });
    }

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const root = document.documentElement;
            const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', newTheme);
            themeToggle.innerHTML = `<i class="fas fa-${newTheme === 'light' ? 'moon' : 'sun'}"></i>`;
            localStorage.setItem('theme', newTheme);
        });
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'light' ? 'moon' : 'sun'}"></i>`;
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
            }
        });
    }

    // Dropdown Toggle
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const menu = toggle.nextElementSibling;
            if (menu) {
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
            }
        });
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 768) {
                    const navMenu = document.querySelector('.nav-menu');
                    if (navMenu) navMenu.classList.remove('active');
                    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
                }
            }
        });
    });

    // Vaccine Swiper
    const vaccineSwiperElement = document.querySelector('.vaccine-swiper');
    if (vaccineSwiperElement && typeof Swiper !== 'undefined') {
        new Swiper('.vaccine-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            autoplay: { delay: 5000, disableOnInteraction: false },
            breakpoints: { 768: { slidesPerView: 3, spaceBetween: 30 } },
            effect: 'coverflow',
            coverflowEffect: { rotate: 30, stretch: 0, depth: 100, modifier: 1, slideShadows: true },
            keyboard: { enabled: true },
            a11y: { enabled: true },
        });
    }

    // Testimonials Swiper
    const testimonialsSwiperElement = document.querySelector('.testimonials-swiper');
    if (testimonialsSwiperElement && typeof Swiper !== 'undefined') {
        new Swiper('.testimonials-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            autoplay: { delay: 7000, disableOnInteraction: false },
            keyboard: { enabled: true },
            a11y: { enabled: true },
        });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question?.querySelector('.plus-minus i');
        if (question && answer && icon) {
            question.addEventListener('click', () => {
                const isOpen = question.getAttribute('aria-expanded') === 'true';
                document.querySelectorAll('.faq-item').forEach(i => {
                    const ans = i.querySelector('.faq-answer');
                    const q = i.querySelector('.faq-question');
                    const ic = i.querySelector('.plus-minus i');
                    if (ans && q && ic) {
                        ans.style.maxHeight = null;
                        q.setAttribute('aria-expanded', 'false');
                        ic.classList.remove('fa-minus');
                        ic.classList.add('fa-plus');
                    }
                });
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    question.setAttribute('aria-expanded', 'true');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            });
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        }
    });

    // FAQ Search
    const faqSearch = document.getElementById('faq-search');
    if (faqSearch) {
        faqSearch.addEventListener('input', e => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question');
                if (question) {
                    const questionText = question.textContent.toLowerCase();
                    item.style.display = questionText.includes(searchTerm) ? 'block' : 'none';
                }
            });
        });
    }

    // Resource Filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            const filter = btn.getAttribute('data-filter');
            document.querySelectorAll('.resource-card').forEach(card => {
                const category = card.getAttribute('data-category');
                card.style.display = filter === 'all' || category === filter ? 'block' : 'none';
            });
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Child Vaccine Schedule Data
    const vaccineSchedule = [
        { vaccine: 'BCG', ageDays: 0, dose: 1, description: 'At birth' },
        { vaccine: 'Pentavalent (DPT-HepB-Hib)', ageDays: 42, dose: 1, description: '6 weeks' },
        { vaccine: 'OPV', ageDays: 42, dose: 1, description: '6 weeks' },
        { vaccine: 'PCV', ageDays: 42, dose: 1, description: '6 weeks' },
        { vaccine: 'Rotavirus', ageDays: 42, dose: 1, description: '6 weeks' },
        { vaccine: 'Pentavalent (DPT-HepB-Hib)', ageDays: 70, dose: 2, description: '10 weeks' },
        { vaccine: 'OPV', ageDays: 70, dose: 2, description: '10 weeks' },
        { vaccine: 'PCV', ageDays: 70, dose: 2, description: '10 weeks' },
        { vaccine: 'Rotavirus', ageDays: 70, dose: 2, description: '10 weeks' },
        { vaccine: 'Pentavalent (DPT-HepB-Hib)', ageDays: 98, dose: 3, description: '14 weeks' },
        { vaccine: 'OPV', ageDays: 98, dose: 3, description: '14 weeks' },
        { vaccine: 'fIPV', ageDays: 98, dose: 1, description: '14 weeks' },
        { vaccine: 'PCV', ageDays: 270, dose: 3, description: '9 months' },
        { vaccine: 'fIPV', ageDays: 270, dose: 2, description: '9 months' },
        { vaccine: 'MR (Measles-Rubella)', ageDays: 270, dose: 1, description: '9 months' },
        { vaccine: 'JE (Japanese Encephalitis)', ageDays: 365, dose: 1, description: '12 months' },
        { vaccine: 'MR (Measles-Rubella)', ageDays: 456, dose: 2, description: '15 months' },
        { vaccine: 'Typhoid', ageDays: 456, dose: 1, description: '15 months' },
    ];

// Scheduler Logic
const schedulerForm = document.getElementById('scheduler-form');
if (schedulerForm) {
    const dobInput = document.getElementById('dob');
    const tableBody = document.getElementById('schedule-body');
    const scheduleTable = document.getElementById('schedule-table');
    const error = document.getElementById('dob-error'); // This might be null if not found
    const submitBtn = schedulerForm.querySelector('.schedule-btn');
    const spinner = schedulerForm.querySelector('.loading-overlay');

    function validateForm() {
        const isValid = dobInput.value;
        if (error) { // Check if error element exists before accessing textContent
            error.textContent = isValid ? '' : 'Please select a valid date.';
        }
        submitBtn.disabled = !isValid;
    }

    dobInput.addEventListener('input', validateForm);
    validateForm();

    schedulerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!dobInput || !tableBody || !scheduleTable || !spinner) return;

        if (error) error.textContent = '';
        submitBtn.disabled = true;
        spinner.style.display = 'flex';

        const dob = new Date(dobInput.value);
        if (isNaN(dob.getTime())) {
            if (error) error.textContent = 'Please enter a valid date.';
            submitBtn.disabled = false;
            spinner.style.display = 'none';
            return;
        }

        const today = new Date();
        tableBody.innerHTML = '';

        vaccineSchedule.forEach(vaccine => {
            const dueDate = new Date(dob);
            dueDate.setDate(dob.getDate() + vaccine.ageDays);
            const status = dueDate < today ? 'past' : dueDate.toDateString() === today.toDateString() ? 'due' : 'upcoming';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vaccine.vaccine}</td>
                <td>Dose ${vaccine.dose}</td>
                <td>${vaccine.description}</td>
                <td>${dueDate.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                <td><span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
            `;
            tableBody.appendChild(row);
        });

        scheduleTable.style.display = 'table';
        submitBtn.disabled = false;
        spinner.style.display = 'none';
    });
}

    // Notification Subscription
    const notificationForm = document.getElementById('notification-form');
    if (notificationForm) {
        const emailInput = document.getElementById('email');
        const status = document.getElementById('notification-status');
        const submitBtn = notificationForm.querySelector('.notify-btn');
        const spinner = notificationForm.querySelector('.loading-overlay');

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function validateForm() {
            submitBtn.disabled = !validateEmail(emailInput.value);
        }

        emailInput.addEventListener('input', validateForm);
        validateForm();

        notificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!emailInput || !status || !submitBtn || !spinner) return;

            status.textContent = '';
            submitBtn.disabled = true;
            spinner.style.display = 'flex';

            if (!validateEmail(emailInput.value)) {
                status.textContent = 'Please enter a valid email address.';
                status.style.color = 'var(--error-color)';
                submitBtn.disabled = false;
                spinner.style.display = 'none';
                return;
            }

            // Simulate backend response
            await new Promise(resolve => setTimeout(resolve, 1000));
            status.textContent = 'Subscribed successfully! You’ll receive reminders soon.';
            status.style.color = 'var(--success-color)';
            localStorage.setItem('email', emailInput.value);
            emailInput.value = '';
            submitBtn.disabled = false;
            spinner.style.display = 'none';

            if (Notification.permission === 'granted') {
                new Notification('Mero Khop Reminder', {
                    body: 'You’ve been subscribed for vaccine reminders!',
                    icon: 'https://via.placeholder.com/150'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Mero Khop Reminder', {
                            body: 'You’ve been subscribed for vaccine reminders!',
                            icon: 'https://via.placeholder.com/150'
                        });
                    }
                });
            }
        });
    }

    // Auth Form Toggle
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (toggleButtons && loginForm && registerForm) {
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const formType = button.getAttribute('data-form');
                loginForm.style.display = formType === 'login' ? 'flex' : 'none';
                registerForm.style.display = formType === 'register' ? 'flex' : 'none';
                document.getElementById('login-error').textContent = '';
                document.getElementById('register-error').textContent = '';
            });
        });
    }

    // Login Form Validation
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
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
            alert('Login successful! (Demo: This will be handled by Django backend.)');
            loginForm.reset();
        });
    }

    // Register Form Validation
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
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
            alert('Registration successful! (Demo: This will be handled by Django backend.)');
            registerForm.reset();
        });
    }

    // Dynamic Year for Copyright
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Back to Top
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
})();