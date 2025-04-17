/**
 * Animations and UI effects for Gains Tracker
 */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();

  initHoverEffects();

  initCustomAnimations();
});

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.feature-card, .cta-content, [data-aos]');

  if (animatedElements.length === 0) return;

  animatedElements.forEach((el) => {
    if (!el.classList.contains('animated')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    }
  });

  function checkInView() {
    animatedElements.forEach((el) => {
      if (isElementInViewport(el) && !el.classList.contains('animated')) {
        const delay = el.getAttribute('data-aos-delay') || 0;

        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.classList.add('animated');
        }, delay);
      }
    });
  }

  checkInView();

  window.addEventListener('scroll', checkInView);
}

/**
 * Initialize hover effects for interactive elements
 */
function initHoverEffects() {
  const cards = document.querySelectorAll('.feature-card');

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.feature-icon i');
      if (icon) {
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
      }
    });

    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.feature-icon i');
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
    });
  });
}

/**
 * Initialize custom animations specific to certain elements
 */
function initCustomAnimations() {
  const heroTitle = document.querySelector('.hero-title');

  if (heroTitle && !heroTitle.classList.contains('animated-text')) {
    const text = heroTitle.textContent;
    heroTitle.innerHTML = '';
    heroTitle.classList.add('animated-text');

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        heroTitle.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
  }

  const ctaButtons = document.querySelectorAll('.hero-cta .btn-primary, .cta-section .btn-primary');

  ctaButtons.forEach((button) => {
    setInterval(() => {
      button.classList.add('pulse-animation');
      setTimeout(() => {
        button.classList.remove('pulse-animation');
      }, 1000);
    }, 5000);
  });
}

/**
 * Utility function to check if an element is in the viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}

document.head.insertAdjacentHTML(
  'beforeend',
  `
  <style>
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(58, 134, 255, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(58, 134, 255, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(58, 134, 255, 0);
      }
    }
    
    .pulse-animation {
      animation: pulse 1s ease-out;
    }
  </style>
`
);
