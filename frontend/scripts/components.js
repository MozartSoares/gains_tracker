/**
 * Component loader - Loads header and footer components
 */
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header-placeholder', '/components/header.html');
  loadComponent('footer-placeholder', '/components/footer.html');

  setTimeout(setActiveNavLink, 100);

  setTimeout(checkUserLoginStatus, 150);
});

/**
 * Loads an HTML component into a target element
 */
function loadComponent(targetId, componentPath) {
  const targetElement = document.getElementById(targetId);

  if (!targetElement) return;

  fetch(componentPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      targetElement.innerHTML = html;

      if (targetId === 'header-placeholder') {
        setupMobileMenu();
      }
    })
    .catch((error) => {
      console.error('Error loading component:', error);
    });
}

/**
 * Sets up the mobile menu toggle functionality
 */
function setupMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.main-nav') && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  }
}

/**
 * Sets the active class on the navigation link that matches the current page
 */
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    link.classList.remove('active');

    const linkPath = link.getAttribute('href');

    if (
      linkPath === currentPath ||
      (currentPath === '/' && linkPath === '/index.html') ||
      (currentPath !== '/' && linkPath !== '/index.html' && currentPath.includes(linkPath))
    ) {
      link.classList.add('active');
    }
  });
}

/**
 * Check if user is logged in and update header accordingly
 */
function checkUserLoginStatus() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (user && token) {
    const loginItem = document.getElementById('loginItem');
    if (loginItem) {
      const loginLink = loginItem.querySelector('a');
      if (loginLink) {
        loginLink.innerHTML = `<i class="fas fa-user"></i> ${user.name} | Logout`;
        loginLink.href = '/pages/login/';
      }
    }
  }
}
