import { getUserLocation, getWeatherData } from './api.js';

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }, 100);
};

document.addEventListener('DOMContentLoaded', () => {
  const checkWeatherBtn = document.getElementById('check-weather');
  const loadingSpinner = document.getElementById('loading');
  const weatherResult = document.getElementById('weather-result');

  const cardioContainer = document.querySelector('.cardio-container');
  if (cardioContainer) {
    const comingSoonSection = document.createElement('div');
    comingSoonSection.className = 'coming-soon-section';
    comingSoonSection.innerHTML = `
      <h2>Coming Soon</h2>
      <p>We're working on new features to help with your cardio workouts:</p>
      <ul>
        <li><i class="fas fa-route"></i> Running route suggestions based on weather</li>
        <li><i class="fas fa-heartbeat"></i> Heart rate zone calculator</li>
        <li><i class="fas fa-fire"></i> Calorie burn estimator</li>
        <li><i class="fas fa-chart-line"></i> Cardio progress tracker</li>
      </ul>
    `;
    cardioContainer.insertAdjacentElement('afterend', comingSoonSection);
  }

  checkWeatherBtn.addEventListener('click', checkWeatherConditions);

  async function checkWeatherConditions() {
    try {
      showLoading(true);

      const location = await getUserLocation();

      const weatherData = await getWeatherData(location.latitude, location.longitude);

      const assessment = assessWeatherForCardio(weatherData);

      displayWeatherResults(assessment, weatherData);
    } catch (error) {
      console.error('Error checking weather conditions:', error);
      showError(error.message);
    } finally {
      showLoading(false);
    }
  }

  function assessWeatherForCardio(weatherData) {
    const current = weatherData.current;

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const precipitation = current.precipitation;
    const cloudCover = current.cloud_cover;
    const windSpeed = current.wind_speed_10m;

    let score = 100;
    const issues = [];

    if (temp < 5) {
      score -= 30;
      issues.push('Temperature is too cold for comfortable cardio');
    } else if (temp < 10) {
      score -= 10;
      issues.push('Temperature is cool, wear appropriate layers');
    } else if (temp > 30) {
      score -= 40;
      issues.push('Temperature is too hot, high risk of heat exhaustion');
    } else if (temp > 25) {
      score -= 20;
      issues.push('Temperature is warm, stay hydrated and consider early morning/evening workout');
    }

    if (humidity > 80) {
      score -= 25;
      issues.push("High humidity reduces body's cooling efficiency");
    } else if (humidity > 70) {
      score -= 15;
      issues.push('Moderately high humidity, will feel warmer than it is');
    } else if (humidity < 20) {
      score -= 10;
      issues.push('Very dry air, stay well hydrated');
    }

    if (precipitation > 5) {
      score -= 40;
      issues.push('Heavy rain, outdoor cardio not recommended');
    } else if (precipitation > 0.5) {
      score -= 20;
      issues.push('Light rain, consider indoor alternatives');
    }

    if (windSpeed > 15) {
      score -= 25;
      issues.push('Strong winds will make cardio more difficult');
    } else if (windSpeed > 10) {
      score -= 10;
      issues.push('Moderate winds, may affect performance');
    }

    let condition;
    let icon;
    let description;

    if (score >= 80) {
      condition = 'good';
      icon = 'fa-thumbs-up';
      description = 'Great conditions for cardio!';
    } else if (score >= 50) {
      condition = 'neutral';
      icon = 'fa-meh';
      description = 'Acceptable conditions for cardio with some precautions.';
    } else {
      condition = 'bad';
      icon = 'fa-thumbs-down';
      description = 'Poor conditions for outdoor cardio. Consider indoor alternatives.';
    }

    return {
      score,
      condition,
      icon,
      description,
      issues,
    };
  }

  function displayWeatherResults(assessment, weatherData) {
    const current = weatherData.current;

    const html = `
      <div class="result-header">
        <i class="fas ${assessment.icon} result-icon ${assessment.condition}-condition"></i>
        <div>
          <h3 class="result-title ${assessment.condition}-condition">${getConditionText(assessment.condition)}</h3>
          <p class="result-description">${assessment.description}</p>
        </div>
      </div>
      
      ${
        assessment.issues.length > 0
          ? `
        <div class="weather-issues">
          <h4>Considerations:</h4>
          <ul>
            ${assessment.issues.map((issue) => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }
      
      <div class="weather-data">
        <div class="weather-info">
          <span>Temperature</span>
          <span>${current.temperature_2m}°C</span>
        </div>
        <div class="weather-info">
          <span>Humidity</span>
          <span>${current.relative_humidity_2m}%</span>
        </div>
        <div class="weather-info">
          <span>Precipitation</span>
          <span>${current.precipitation} mm</span>
        </div>
        <div class="weather-info">
          <span>Wind Speed</span>
          <span>${current.wind_speed_10m} km/h</span>
        </div>
        <div class="weather-info">
          <span>Cloud Cover</span>
          <span>${current.cloud_cover}%</span>
        </div>
      </div>
      
      <button id="check-again" class="btn check-again-btn">
        <i class="fas fa-sync-alt"></i> Check Again
      </button>
    `;

    weatherResult.innerHTML = html;

    document.getElementById('check-again').addEventListener('click', checkWeatherConditions);
  }

  function getConditionText(condition) {
    switch (condition) {
      case 'good':
        return 'Good to Go!';
      case 'neutral':
        return 'Proceed with Caution';
      case 'bad':
        return 'Not Recommended';
      default:
        return 'Unknown';
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.style.display = 'block';
      weatherResult.innerHTML = '';
    } else {
      loadingSpinner.style.display = 'none';
    }
  }

  function showError(message) {
    weatherResult.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <button id="try-again" class="btn check-again-btn">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;

    document.getElementById('try-again').addEventListener('click', checkWeatherConditions);
  }
});
