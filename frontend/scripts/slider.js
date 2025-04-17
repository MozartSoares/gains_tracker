/**
 * Testimonial slider functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  initTestimonialSlider();
});

/**
 * Initialize the testimonial slider with controls
 */
function initTestimonialSlider() {
  const slider = document.getElementById('testimonialSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.testimonial-slide');
  if (slides.length <= 1) return;

  const prevButton = document.getElementById('prevSlide');
  const nextButton = document.getElementById('nextSlide');

  let currentSlide = 0;
  const totalSlides = slides.length;

  function updateSliderPosition() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  slides.forEach((slide, index) => {
    slide.style.transform = `translateX(${index * 100}%)`;
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      updateSliderPosition();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      updateSliderPosition();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (isElementInViewport(slider)) {
      if (e.key === 'ArrowLeft') {
        currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        updateSliderPosition();
      } else if (e.key === 'ArrowRight') {
        currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        updateSliderPosition();
      }
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    if (touchStartX - touchEndX > swipeThreshold) {
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    } else if (touchEndX - touchStartX > swipeThreshold) {
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    }

    updateSliderPosition();
  }

  let slideInterval = setInterval(() => {
    if (document.hasFocus() && isElementInViewport(slider)) {
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      updateSliderPosition();
    }
  }, 5000);

  slider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });

  slider.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      if (document.hasFocus() && isElementInViewport(slider)) {
        currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        updateSliderPosition();
      }
    }, 5000);
  });
}

/**
 * Check if an element is in the viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}
