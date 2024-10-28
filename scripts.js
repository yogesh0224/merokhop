document.addEventListener("DOMContentLoaded", function () {
    const text = "Empowering Moms, Safeguarding Babies";
    const speed = 100; // typing speed in milliseconds
    let i = 0;

    function typeWriter() {
        if (i < text.length) {
            document.querySelector(".typewriter").innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();
});

let currentSlide = 0;
const slides = document.querySelectorAll('.card');
const totalSlides = slides.length;

function moveSlider(direction) {
    // Update the current slide index
    currentSlide += direction;

    // Loop around if at the beginning or end
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1; // Go to last slide
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0; // Go to first slide
    }
    updateSlider();
}

function updateSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    
    // Calculate the offset percentage
    const offset = (currentSlide / totalSlides) * 100; // Change to percentage
    sliderContainer.style.transform = `translateX(-${offset}%)`; // Apply the transform
}

// Optional: Auto slide feature
setInterval(() => {
    moveSlider(1);
}, 5000); // Change slide every 5 seconds

// faq section js starts from here //

document.addEventListener("DOMContentLoaded", function() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            const answer = item.querySelector(".faq-answer");
            const plusMinus = question.querySelector(".plus-minus");

            faqItems.forEach(i => {
                const ans = i.querySelector(".faq-answer");
                const pm = i.querySelector(".plus-minus");
                if (i !== item) {
                    ans.style.maxHeight = null;
                    pm.textContent = "+";
                }
            });

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                plusMinus.textContent = "+";
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                plusMinus.textContent = "-";
            }
        });
    });
});

// resources section js begins here

function scrollCarousel(direction) {
    const carousel = document.querySelector(".resources-carousel");
    const scrollAmount = carousel.clientWidth / 2;

    if (direction === 1) {
        carousel.scrollLeft += scrollAmount;
    } else {
        carousel.scrollLeft -= scrollAmount;
    }
}

// footer js starts here

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

