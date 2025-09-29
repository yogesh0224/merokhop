// Initialize AOS
console.log('Initializing AOS...');
try {
    AOS.init({
        duration: 1000,
        once: true,
    });
    console.log('AOS initialized successfully.');
} catch (error) {
    console.error('AOS initialization failed:', error);
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
            console.log('Menu toggled:', navMenu.classList.contains('active'));
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
            console.log('Dropdown toggled:', menu.classList.contains('active'));
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
            });
            if (window.innerWidth <= 768) {
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) navMenu.classList.remove('active');
                document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
            }
            console.log('Smooth scrolling to:', this.getAttribute('href'));
        }
    });
});

// Vaccine Swiper
const vaccineSwiperElement = document.querySelector('.vaccine-swiper');
if (vaccineSwiperElement) {
    console.log('Initializing Vaccine Swiper...');
    try {
        const vaccineSwiper = new Swiper('.vaccine-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
        });
        console.log('Vaccine Swiper initialized successfully.');
    } catch (error) {
        console.error('Vaccine Swiper initialization failed:', error);
    }
}

// Testimonials Swiper
const testimonialsSwiperElement = document.querySelector('.testimonials-swiper');
if (testimonialsSwiperElement) {
    console.log('Initializing Testimonials Swiper...');
    try {
        const testimonialsSwiper = new Swiper('.testimonials-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            autoplay: {
                delay: 7000,
                disableOnInteraction: false,
            },
        });
        console.log('Testimonials Swiper initialized successfully.');
    } catch (error) {
        console.error('Testimonials Swiper initialization failed:', error);
    }
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
            console.log('FAQ accordion toggled:', question.textContent, isOpen ? 'closed' : 'opened');
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
        console.log('FAQ search term:', searchTerm);
    });
}

// Resource Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.resource-card').forEach(card => {
            const category = card.getAttribute('data-category');
            card.style.display = filter === 'all' || category === filter ? 'block' : 'none';
        });
        console.log('Resource filter applied:', filter);
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
    console.log('Initializing Scheduler Form...');
    schedulerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const dobInput = document.getElementById('dob').value;
        if (!dobInput) {
            alert('Please enter the date of birth.');
            return;
        }
        const dob = new Date(dobInput);
        const today = new Date();
        const tableBody = document.getElementById('schedule-body');
        tableBody.innerHTML = '';

        vaccineSchedule.forEach(item => {
            const dueDate = new Date(dob.getTime() + item.ageDays * 24 * 60 * 60 * 1000);
            const dueDateStr = dueDate.toLocaleDateString();
            let status = 'Upcoming';
            let rowClass = 'upcoming';
            if (dueDate < today) {
                status = 'Past';
                rowClass = 'past';
            } else if (Math.abs(dueDate - today) < 7 * 24 * 60 * 60 * 1000) {
                status = 'Due Soon';
                rowClass = 'due';
            }

            const row = `
                <tr class="${rowClass}">
                    <td>${item.vaccine}</td>
                    <td>${item.dose}</td>
                    <td>${item.description}</td>
                    <td>${dueDateStr}</td>
                    <td>${status}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        document.getElementById('schedule-table').style.display = 'table';
    });
}

// Notification Subscription
const notificationForm = document.getElementById('notification-form');
if (notificationForm) {
    console.log('Initializing Notification Form...');
    notificationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Please enter your email.');
            return;
        }
        localStorage.setItem('subscribedEmail', email);
        document.getElementById('notification-status').textContent = 'Subscribed successfully! You will receive vaccine reminders.';

        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('Subscription Confirmed', 'You will receive vaccine reminders.');
                }
            });
        } else {
            showNotification('Subscription Confirmed', 'You will receive vaccine reminders.');
        }
    });
}

// Browser Notification
function showNotification(title, body) {
    new Notification(title, { body });
}

// Simulate Reminder
setTimeout(() => {
    if (Notification.permission === 'granted') {
        showNotification('Vaccine Reminder', 'Check your schedule for upcoming vaccines!');
    }
}, 5000);

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

// Auth Form Toggle
const toggleButtons = document.querySelectorAll('.toggle-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
if (toggleButtons && loginForm && registerForm) {
    console.log('Initializing Auth Form Toggle...');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const formType = button.getAttribute('data-form');
            loginForm.style.display = formType === 'login' ? 'flex' : 'none';
            registerForm.style.display = formType === 'register' ? 'flex' : 'none';
            document.getElementById('login-error').textContent = '';
            document.getElementById('register-error').textContent = '';
            console.log('Toggled to form:', formType);
        });
    });
}

// Login Form Validation
if (loginForm) {
    console.log('Initializing Login Form Validation...');
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const error = document.getElementById('login-error');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            console.warn('Invalid email:', email);
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            console.warn('Invalid password length.');
            return;
        }

        error.textContent = '';
        alert('Login successful! (Demo: This will be handled by Django backend.)');
        loginForm.reset();
        console.log('Login form submitted successfully (demo).');
    });
}

// Register Form Validation
if (registerForm) {
    console.log('Initializing Register Form Validation...');
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const error = document.getElementById('register-error');

        if (!name || name.length < 2) {
            error.textContent = 'Please enter a valid name.';
            console.warn('Invalid name:', name);
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error.textContent = 'Please enter a valid email.';
            console.warn('Invalid email:', email);
            return;
        }
        if (!password || password.length < 6) {
            error.textContent = 'Password must be at least 6 characters.';
            console.warn('Invalid password length.');
            return;
        }
        if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match.';
            console.warn('Passwords do not match.');
            return;
        }

        error.textContent = '';
        alert('Registration successful! (Demo: This will be handled by Django backend.)');
        registerForm.reset();
        console.log('Register form submitted successfully (demo).');
    });
}