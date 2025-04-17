import { Exercise, Workout } from '../models/index.js';
const API_URL = 'https://gains-tracker-14tn.onrender.com/api';

const getBearerToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    alert(res.message);
  }

  const res = await response.json();
  const user = res.data;

  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    alert(res.message);
  }

  const data = await response.json();
  const { token, name, email, userId } = data.data;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ name, email, userId }));
};

export const logoutUser = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login/';
};

// me | default
export const getExercises = async (param = '') => {
  const response = await fetch(`${API_URL}/exercises?${param}`, {
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    alert(res.message);
  }

  const res = await response.json();
  const exercises = res.data;

  const exercisesArray = exercises.map((exercise) => new Exercise(exercise));

  return exercisesArray;
};

export const createExercise = async (exerciseData) => {
  const response = await fetch(`${API_URL}/exercises`, {
    method: 'POST',
    body: JSON.stringify(exerciseData),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    alert(res.message);
  }

  const res = await response.json();
  const exercise = res.data;
  return new Exercise(exercise);
};

export const updateExercise = async (exerciseId, exerciseData) => {
  const response = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(exerciseData),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to update exercise');
  }

  const res = await response.json();
  const exercise = res.data;
  return new Exercise(exercise);
};

export const deleteExercise = async (exerciseId) => {
  const response = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to delete exercise');
  }

  return true;
};

export const getWorkouts = async () => {
  const response = await fetch(`${API_URL}/workouts`, {
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to get workouts');
  }

  const res = await response.json();
  const workouts = res.data;
  const workoutsArray = workouts.map((workout) => new Workout(workout));
  return workoutsArray;
};

export const createWorkout = async (workoutData) => {
  const response = await fetch(`${API_URL}/workouts`, {
    method: 'POST',
    body: JSON.stringify(workoutData),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to create workout');
  }

  const res = await response.json();
  const workout = res.data;
  return new Workout(workout);
};

export const updateWorkout = async (workoutId, workoutData) => {
  const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
    method: 'PUT',
    body: JSON.stringify(workoutData),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to update workout');
  }

  const res = await response.json();
  const workout = res.data;
  return new Workout(workout);
};

export const deleteWorkout = async (workoutId) => {
  const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
    },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message || 'Failed to delete workout');
  }

  return true;
};

export const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};
