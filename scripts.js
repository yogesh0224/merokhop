// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Dropdown Toggle
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const menu = toggle.nextElementSibling;
        menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth',
        });
        if (window.innerWidth <= 768) {
            document.querySelector('.nav-menu').classList.remove('active');
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
        }
    });
});

// Vaccine Swiper
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

// Testimonials Swiper
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

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question.querySelector('.plus-minus i');

    question.addEventListener('click', () => {
        const isOpen = question.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-item').forEach(i => {
            i.querySelector('.faq-answer').style.maxHeight = null;
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            i.querySelector('.plus-minus i').classList.remove('fa-minus');
            i.querySelector('.plus-minus i').classList.add('fa-plus');
        });

        if (!isOpen) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            question.setAttribute('aria-expanded', 'true');
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-minus');
        }
    });
});

// FAQ Search
document.getElementById('faq-search').addEventListener('input', e => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        item.style.display = question.includes(searchTerm) ? 'block' : 'none';
    });
});

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
document.getElementById('scheduler-form').addEventListener('submit', function (e) {
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

// Notification Subscription
document.getElementById('notification-form').addEventListener('submit', function (e) {
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