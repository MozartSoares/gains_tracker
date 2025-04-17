import {
  getExercises,
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getUser,
} from './api.js';
import { workoutDurations, setRanges, repRanges } from '../models/index.js';
import { checkPageAuth } from './auth.js';

const workoutTable = document.getElementById('workoutTable');
const workoutTableBody = document.getElementById('workoutTableBody');
const filterButtons = document.querySelectorAll('.filter-btn');
const createWorkoutBtn = document.getElementById('createWorkout');
const emptyState = document.getElementById('emptyState');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const emptyStateBtn = document.getElementById('emptyStateBtn');
const workoutModal = document.getElementById('workoutModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelWorkoutBtn = document.getElementById('cancelWorkout');
const workoutForm = document.getElementById('workoutForm');
const workoutDurationSelect = document.getElementById('workoutDuration');
const exerciseList = document.getElementById('exerciseList');
const addExerciseBtn = document.getElementById('addExerciseBtn');

let currentFilter = '';
let workouts = [];
let exercises = [];
let editingWorkoutId = null;
let exerciseEntryCount = 0;

async function initWorkoutsPage() {
  const isAuthenticated = checkPageAuth('workouts-section', 'Workout Library');
  if (!isAuthenticated) {
    return;
  }

  populateFilterOptions();
  await Promise.all([loadExercises(), fetchWorkouts()]);
  setupEventListeners();
  renderWorkouts();
}

function populateFilterOptions() {
  workoutDurations.forEach((duration) => {
    const option = document.createElement('option');
    option.textContent = `${duration} minutes`;
    workoutDurationSelect.appendChild(option);
  });

  populateSetRepsOptions(0);
}

async function loadExercises() {
  try {
    exercises = await getExercises();
    const exerciseSelect = document.querySelector('.exercise-select');
    populateExerciseOptions(exerciseSelect);
  } catch (error) {
    console.error('Error loading exercises:', error);
    const exerciseSelect = document.querySelector('.exercise-select');
    const errorOption = document.createElement('option');
    errorOption.textContent = 'Error loading exercises';
    errorOption.disabled = true;
    exerciseSelect.appendChild(errorOption);
  }
}

async function fetchWorkouts() {
  try {
    workoutTableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="5" class="text-center">
          <div class="loading-spinner"></div>
          <p>Loading workouts...</p>
        </td>
      </tr>
    `;

    workouts = await getWorkouts();
    renderWorkouts();
  } catch (error) {
    console.error('Error fetching workouts:', error);
    workoutTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">
          <p>Error loading workouts. Please try again later.</p>
        </td>
      </tr>
    `;
  }
}

function populateExerciseOptions(selectElement) {
  exercises.forEach((exercise) => {
    const option = document.createElement('option');
    option.value = exercise;
    option.textContent = exercise.name;
    selectElement.appendChild(option);
  });
}

function populateSetRepsOptions(index) {
  const setsSelect = document.querySelector(`select[name="exercises[${index}][sets]"]`);
  setRanges.forEach((sets) => {
    const option = document.createElement('option');
    option.value = sets;
    option.textContent = sets;
    setsSelect.appendChild(option);
  });

  const repsSelect = document.querySelector(`select[name="exercises[${index}][reps]"]`);
  repRanges.forEach((reps) => {
    const option = document.createElement('option');
    option.value = reps;
    option.textContent = reps;
    repsSelect.appendChild(option);
  });
}

function setupEventListeners() {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
    });
  });

  createWorkoutBtn.addEventListener('click', openWorkoutModal);
  emptyStateBtn.addEventListener('click', openWorkoutModal);

  closeModalBtn.addEventListener('click', closeWorkoutModal);
  cancelWorkoutBtn.addEventListener('click', closeWorkoutModal);

  window.addEventListener('click', (e) => {
    if (e.target === workoutModal) {
      closeWorkoutModal();
    }
  });

  addExerciseBtn.addEventListener('click', addExerciseEntry);

  workoutForm.addEventListener('submit', handleWorkoutSubmit);
}

function renderWorkouts() {
  const filteredWorkouts = filterWorkouts();

  if (filteredWorkouts.length === 0) {
    showEmptyState();
    return;
  }

  workoutTable.style.display = 'table';
  emptyState.style.display = 'none';

  workoutTableBody.innerHTML = '';

  filteredWorkouts.forEach((workout) => {
    const row = document.createElement('tr');

    const durationInMinutes = Math.floor(workout.duration / 60);

    const user = getUser();
    const { userId, name } = user;
    const isOwner = userId && workout.userId === userId;

    row.innerHTML = `
      <td>
        <div class="exercise-name">${workout.name}</div>
      </td>
      <td>${durationInMinutes} minutes</td>
      <td>${workout.exercises.length} exercises</td>
      <td>${workout.userId ? (isOwner ? name : 'another user') : 'system'}</td>
      <td class="actions-cell">
        <button class="action-btn start-btn" data-id="${workout.id}" aria-label="Start workout">
          <i class="fas fa-play"></i>
        </button>
        ${
          isOwner
            ? `
          <button class="action-btn edit-btn" data-id="${workout.id}" aria-label="Edit workout">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${workout.id}" aria-label="Delete workout">
            <i class="fas fa-trash"></i>
          </button>
        `
            : ''
        }
      </td>
    `;

    const startBtn = row.querySelector('.start-btn');
    startBtn.addEventListener('click', () => startWorkout(workout.id));

    if (isOwner) {
      const editBtn = row.querySelector('.edit-btn');
      const deleteBtn = row.querySelector('.delete-btn');

      editBtn.addEventListener('click', () => editWorkout(workout.id));
      deleteBtn.addEventListener('click', () => confirmDeleteWorkout(workout.id));
    }

    workoutTableBody.appendChild(row);
  });
}

function filterWorkouts() {
  const user = getUser();
  const { userId } = user;
  let filtered = [...workouts];

  if (currentFilter === 'me') {
    if (userId) {
      filtered = filtered.filter((workout) => workout.userId === userId);
    } else {
      filtered = [];
    }
  } else if (currentFilter === 'default') {
    filtered = filtered.filter((workout) => !workout.userId);
  }

  return filtered;
}

function addExerciseEntry() {
  const newIndex = exerciseEntryCount;
  exerciseEntryCount++;

  const exerciseEntry = document.createElement('div');
  exerciseEntry.className = 'exercise-entry';

  exerciseEntry.innerHTML = `
    <div class="exercise-row">
      <select name="exercises[${newIndex}][exercise]" class="form-select exercise-select" required aria-label="Select exercise">
        <option value="">Select Exercise</option>
      </select>
      <button type="button" class="remove-exercise-btn" aria-label="Remove exercise">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="exercise-details">
      <div class="exercise-detail">
        <label for="exercise${newIndex}Sets">Sets</label>
        <select id="exercise${newIndex}Sets" name="exercises[${newIndex}][sets]" class="form-select" aria-label="Number of sets">
        </select>
      </div>
      <div class="exercise-detail">
        <label for="exercise${newIndex}Reps">Reps</label>
        <select id="exercise${newIndex}Reps" name="exercises[${newIndex}][reps]" class="form-select" aria-label="Number of repetitions">
        </select>
      </div>
      <div class="exercise-detail">
        <label for="exercise${newIndex}Weight">Weight (kg)</label>
        <input type="number" id="exercise${newIndex}Weight" name="exercises[${newIndex}][weight]" class="form-input" min="0" step="0.5" aria-label="Weight in kilograms">
      </div>
    </div>
  `;

  exerciseList.appendChild(exerciseEntry);

  const exerciseSelect = exerciseEntry.querySelector('.exercise-select');
  populateExerciseOptions(exerciseSelect);

  populateSetRepsOptions(newIndex);

  const removeBtn = exerciseEntry.querySelector('.remove-exercise-btn');
  removeBtn.addEventListener('click', () => {
    exerciseEntry.remove();
  });
}

function showEmptyState() {
  workoutTable.style.display = 'none';
  emptyState.style.display = 'flex';

  if (currentFilter === 'me') {
    emptyStateMessage.textContent = "You haven't created any custom workouts yet.";
    emptyStateBtn.textContent = 'Create Your First Workout';
    emptyStateBtn.onclick = openWorkoutModal;
  } else {
    emptyStateMessage.textContent = 'No workouts found in the database.';
    emptyStateBtn.textContent = 'Create New Workout';
    emptyStateBtn.onclick = openWorkoutModal;
  }
}

function openWorkoutModal() {
  workoutForm.reset();
  editingWorkoutId = null;

  document.querySelector('.modal-title').textContent = 'Create New Workout';
  document.querySelector('.btn-submit').textContent = 'Save Workout';

  while (exerciseList.children.length > 1) {
    exerciseList.removeChild(exerciseList.lastChild);
  }

  exerciseEntryCount = 1;

  workoutModal.style.display = 'flex';
}

async function editWorkout(workoutId) {
  try {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) {
      console.error('Workout not found');
      return;
    }

    editingWorkoutId = workoutId;

    document.querySelector('.modal-title').textContent = 'Edit Workout';
    document.querySelector('.btn-submit').textContent = 'Update Workout';

    document.getElementById('workoutName').value = workout.name;
    document.getElementById('workoutDescription').value = workout.description || '';
    document.getElementById('workoutDuration').value = workout.duration;
    document.getElementById('isPublic').checked = workout.isPublic;

    while (exerciseList.children.length > 0) {
      exerciseList.removeChild(exerciseList.lastChild);
    }

    exerciseEntryCount = 0;
    workout.exercises.forEach((exercise, index) => {
      addExerciseEntry();

      const entry = exerciseList.children[index];
      entry.querySelector('.exercise-select').value = exercise.exercise;
      entry.querySelector(`select[name="exercises[${index}][sets]"]`).value = exercise.sets;
      entry.querySelector(`select[name="exercises[${index}][reps]"]`).value = exercise.reps;
      entry.querySelector(`input[name="exercises[${index}][weight]"]`).value =
        exercise.weight || '';
    });

    workoutModal.style.display = 'flex';
  } catch (error) {
    console.error('Error loading workout for editing:', error);
    alert('Could not load workout details. Please try again.');
  }
}

function closeWorkoutModal() {
  workoutModal.style.display = 'none';
}

async function handleWorkoutSubmit(e) {
  e.preventDefault();

  try {
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const formData = new FormData(workoutForm);
    const workoutData = {
      name: formData.get('name'),
      description: formData.get('description'),
      duration: parseInt(formData.get('duration')),
      isPublic: formData.get('isPublic') === 'on',
      exercises: [],
    };

    const exerciseEntries = exerciseList.querySelectorAll('.exercise-entry');
    exerciseEntries.forEach((entry, index) => {
      const exerciseId = entry.querySelector('.exercise-select').value;

      const exerciseObj = exercises.find((ex) => ex.id === exerciseId);

      const sets = parseInt(entry.querySelector(`select[name="exercises[${index}][sets]"]`).value);
      const reps = parseInt(entry.querySelector(`select[name="exercises[${index}][reps]"]`).value);
      const weightInput = entry.querySelector(`input[name="exercises[${index}][weight]"]`);

      workoutData.exercises.push({
        exercise: exerciseObj,
        sets,
        reps,
        weight: weightInput.value ? parseFloat(weightInput.value) : null,
      });
    });

    if (workoutData.exercises.length === 0) {
      alert('Please add at least one exercise to your workout');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    let result;
    if (editingWorkoutId) {
      result = await updateWorkout(editingWorkoutId, workoutData);
    } else {
      result = await createWorkout(workoutData);
    }

    await fetchWorkouts();

    closeWorkoutModal();
    alert(editingWorkoutId ? 'Workout updated successfully!' : 'Workout created successfully!');
  } catch (error) {
    console.error('Error saving workout:', error);
    alert('Error saving workout. Please try again.');
  } finally {
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = false;
    submitBtn.textContent = editingWorkoutId ? 'Update Workout' : 'Save Workout';
  }
}

function startWorkout(workoutId) {
  alert('Starting workout functionality coming soon!');
}

async function confirmDeleteWorkout(workoutId) {
  if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
    try {
      await deleteWorkout(workoutId);
      workouts = workouts.filter((w) => w.id !== workoutId);
      renderWorkouts();
      alert('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Error deleting workout. Please try again.');
    }
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', initWorkoutsPage);
