/**
 * Authentication UI logic for login and registration
 */
import { registerUser, loginUser, logoutUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  initTabs();

  initPasswordToggles();

  initFormHandlers();

  initFormValidation();
});

/**
 * Check if user is already logged in and update UI accordingly
 */
function checkAuthStatus() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (user && token) {
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
      authContainer.innerHTML = `
        <div class="logged-in-message">
          <h2>You are already logged in</h2>
          <p>Welcome back, ${user.name}!</p>
          <button id="logoutBtn" class="btn btn-primary">Logout</button>
        </div>
      `;

      document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }

    setTimeout(updateHeaderLoggedIn, 150);
  }
}

/**
 * Update the header login button to show username and logout
 */
function updateHeaderLoggedIn() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  const loginItem = document.getElementById('loginItem');
  if (loginItem) {
    const loginLink = loginItem.querySelector('a');
    loginLink.innerHTML = `<i class="fas fa-user"></i> ${user.name} | Logout`;
    loginLink.href = '/pages/login/';
  }
}

/**
 * Initialize tab switching between login and register forms
 */
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach((t) => t.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`${target}-form`).classList.add('active');
    });
  });
}

/**
 * Initialize password visibility toggles
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const passwordField = button.previousElementSibling;
      const icon = button.querySelector('i');

      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

/**
 * Initialize form submit handlers
 */
function initFormHandlers() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();

  const inputs = event.target.querySelectorAll('input[required]');
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });

  if (!isValid) return;

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  showLoadingState(event.target);

  try {
    await loginUser({ email, password });

    window.location.href = '/index.html';
  } catch (error) {
    console.error('Login error:', error);

    const errorMessage = error.message || 'Failed to login. Please check your credentials and try again.';

    const formElement = event.target;
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = errorMessage;
    errorElement.style.color = 'var(--danger-color)';
    errorElement.style.marginBottom = 'var(--spacing-md)';
    errorElement.style.padding = 'var(--spacing-sm)';
    errorElement.style.backgroundColor = 'rgba(255, 0, 110, 0.1)';
    errorElement.style.borderRadius = 'var(--border-radius)';

    const existingError = formElement.querySelector('.form-error');
    if (existingError) {
      formElement.removeChild(existingError);
    }

    formElement.insertBefore(errorElement, formElement.firstChild);

    resetLoadingState(event.target);
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(event) {
  event.preventDefault();

  const inputs = event.target.querySelectorAll('input[required]');
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });

  if (!isValid) return;

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAgreement = document.getElementById('termsAgreement').checked;

  if (password !== confirmPassword) {
    showError('confirmPassword', 'Passwords do not match');
    return;
  }

  if (!termsAgreement) {
    showError('termsAgreement', 'You must agree to the Terms of Service and Privacy Policy');
    return;
  }

  showLoadingState(event.target);

  try {
    await registerUser({ name, email, password });

    window.location.href = '/index.html';
  } catch (error) {
    console.error('Registration error:', error);

    const errorMessage = error.message || 'Failed to register. Please try again.';

    const formElement = event.target;
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = errorMessage;
    errorElement.style.color = 'var(--danger-color)';
    errorElement.style.marginBottom = 'var(--spacing-md)';
    errorElement.style.padding = 'var(--spacing-sm)';
    errorElement.style.backgroundColor = 'rgba(255, 0, 110, 0.1)';
    errorElement.style.borderRadius = 'var(--border-radius)';

    const existingError = formElement.querySelector('.form-error');
    if (existingError) {
      formElement.removeChild(existingError);
    }

    formElement.insertBefore(errorElement, formElement.firstChild);

    resetLoadingState(event.target);
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    await logoutUser();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Initialize form validation for both forms
 */
function initFormValidation() {
  const inputs = document.querySelectorAll('input[required]');

  inputs.forEach((input) => {
    input.addEventListener('blur', () => {
      validateInput(input);
    });

    input.addEventListener('input', () => {
      clearError(input.id);
    });
  });
}

/**
 * Validate a single input field
 */
function validateInput(input) {
  const id = input.id;
  const value = input.value.trim();

  if (!value) {
    showError(id, 'This field is required');
    return false;
  }

  if (input.type === 'email' && !isValidEmail(value)) {
    showError(id, 'Please enter a valid email address');
    return false;
  }

  if ((id === 'registerPassword' || id === 'loginPassword' || id === 'confirmPassword') && value.length < 5) {
    showError(id, 'Password must be at least 5 characters');
    return false;
  }

  clearError(id);
  return true;
}

/**
 * Show error message for an input
 */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  clearError(inputId);

  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'var(--danger-color)';
  errorElement.style.fontSize = '0.8rem';
  errorElement.style.marginTop = '5px';

  input.classList.add('error');
  input.style.borderColor = 'var(--danger-color)';

  const parent = input.closest('.form-group') || input.parentNode;
  parent.appendChild(errorElement);
}

/**
 * Clear error message for an input
 */
function clearError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.classList.remove('error');
  input.style.borderColor = '';

  const parent = input.closest('.form-group') || input.parentNode;
  const errorElement = parent.querySelector('.error-message');
  if (errorElement) {
    parent.removeChild(errorElement);
  }
}

/**
 * Show loading state on form submit
 */
function showLoadingState(form) {
  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.originalText = submitButton.textContent;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  }
}

/**
 * Reset loading state after form submission
 */
function resetLoadingState(form) {
  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton && submitButton.originalText) {
    submitButton.disabled = false;
    submitButton.textContent = submitButton.originalText;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export const isLoggedIn = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Render login required message in a container
 * @param {HTMLElement} container - The container to render the message
 * @param {string} pageName - The name of the page requiring authentication
 */
export const renderLoginRequired = (container, pageName) => {
  container.innerHTML = `
    <div class="auth-required">
      <div class="auth-required-content">
        <i class="fas fa-lock auth-icon"></i>
        <h2>Restricted Access</h2>
        <p>To access the ${pageName} page and enjoy exclusive features, you need to log in or create an account.</p>
        <div class="auth-buttons">
          <a href="/pages/login/" class="btn primary-btn">
            <i class="fas fa-sign-in-alt"></i> Log In
          </a>
          <a href="/pages/login/" class="btn secondary-btn">
            <i class="fas fa-user-plus"></i> Create Account
          </a>
        </div>
      </div>
    </div>
  `;
};
/*
 * @param {string} pageContainerSelector - The selector for the page container to render login message if not authenticated
 * @param {string} pageName - The name of the page requiring authentication
 * @returns {boolean} True if user is authenticated
 */
export const checkPageAuth = (pageContainerSelector, pageName) => {
  const isAuthenticated = isLoggedIn();
  const pageContainer = document.querySelector(`.${pageContainerSelector}`);

  if (!isAuthenticated && pageContainer) {
    // Hide all content inside page container
    const contentElements = pageContainer.querySelectorAll('.container > *');
    contentElements.forEach((element) => {
      element.style.display = 'none';
    });

    // Add the login required message
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    renderLoginRequired(authContainer, pageName);

    const container = pageContainer.querySelector('.container');
    if (container) {
      container.appendChild(authContainer);
    } else {
      // If no container, append directly to section
      pageContainer.appendChild(authContainer);
    }
  }

  return isAuthenticated;
};
