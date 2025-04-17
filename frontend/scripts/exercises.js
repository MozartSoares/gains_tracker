import { getExercises, createExercise, updateExercise, deleteExercise as apiDeleteExercise, getUser } from './api.js';
import { Exercise, muscleGroups, equipment } from '../models/exercise.js';
import { checkPageAuth } from './auth.js';

const exerciseTable = document.getElementById('exerciseTable');
const exerciseTableBody = document.getElementById('exerciseTableBody');
const filterButtons = document.querySelectorAll('.filter-btn');
const muscleGroupSelect = document.getElementById('muscleGroup');
const equipmentSelect = document.getElementById('equipment');
const createExerciseBtn = document.getElementById('createExercise');
const emptyState = document.getElementById('emptyState');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const emptyStateBtn = document.getElementById('emptyStateBtn');
const exerciseModal = document.getElementById('exerciseModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelExerciseBtn = document.getElementById('cancelExercise');
const exerciseForm = document.getElementById('exerciseForm');
const muscleGroupCheckboxes = document.getElementById('muscleGroupCheckboxes');
const exerciseEquipmentSelect = document.getElementById('exerciseEquipment');

let currentFilter = '';
let currentMuscleGroup = '';
let currentEquipment = '';
let exercises = [];

let isEditMode = false;
let currentExercise = null;

async function initExercisesPage() {
  // Check if user is authenticated
  const isAuthenticated = checkPageAuth('exercises-section', 'Exercise Library');
  if (!isAuthenticated) {
    return; // Stop initialization if not authenticated
  }

  populateFilterOptions();
  setupEventListeners();
  await loadExercises();
}

function populateFilterOptions() {
  muscleGroups.forEach((group) => {
    const option = document.createElement('option');
    option.value = group;
    option.textContent = group;
    muscleGroupSelect.appendChild(option);
  });

  equipment.forEach((item) => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    equipmentSelect.appendChild(option);
  });

  muscleGroups.forEach((group) => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `muscle-${group.toLowerCase().replace(/\s+/g, '-')}`;
    checkbox.name = 'muscleGroups';
    checkbox.value = group;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = group;

    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    muscleGroupCheckboxes.appendChild(checkboxDiv);
  });

  equipment.forEach((item) => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    exerciseEquipmentSelect.appendChild(option);
  });
}

function setupEventListeners() {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      filterExercises();
    });
  });

  muscleGroupSelect.addEventListener('change', () => {
    currentMuscleGroup = muscleGroupSelect.value;
    filterExercises();
  });

  equipmentSelect.addEventListener('change', () => {
    currentEquipment = equipmentSelect.value;
    filterExercises();
  });

  createExerciseBtn.addEventListener('click', openExerciseModal);
  emptyStateBtn.addEventListener('click', openExerciseModal);

  closeModalBtn.addEventListener('click', closeExerciseModal);
  cancelExerciseBtn.addEventListener('click', closeExerciseModal);

  window.addEventListener('click', (e) => {
    if (e.target === exerciseModal) {
      closeExerciseModal();
    }
  });

  exerciseForm.addEventListener('submit', handleExerciseSubmit);
}

async function loadExercises() {
  try {
    showLoading(true);
    const exerciseData = await getExercises();
    exercises = exerciseData;
    filterExercises();
    showLoading(false);
  } catch (error) {
    showError('Failed to load exercises. Please try again later.');
    console.error('Error loading exercises:', error);
  }
}

function filterExercises() {
  let filteredExercises = [...exercises];

  if (currentFilter === 'default') {
    filteredExercises = filteredExercises.filter((exercise) => !exercise.userId);
  } else if (currentFilter === 'me') {
    const user = getUser();
    const { userId } = user;
    if (userId) {
      filteredExercises = filteredExercises.filter((exercise) => exercise.userId === userId);
    } else {
      renderExercises([]);
      return;
    }
  }

  if (currentMuscleGroup) {
    filteredExercises = filteredExercises.filter(
      (exercise) => exercise.muscleGroups && exercise.muscleGroups.includes(currentMuscleGroup)
    );
  }

  if (currentEquipment) {
    filteredExercises = filteredExercises.filter((exercise) => exercise.equipment === currentEquipment);
  }

  renderExercises(filteredExercises);
}

function renderExercises(exerciseList) {
  exerciseTableBody.innerHTML = '';

  if (exerciseList.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  const user = getUser();
  const { userId, name } = user;
  exerciseList.forEach((exercise) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = exercise.name;
    nameCell.className = 'exercise-name';
    row.appendChild(nameCell);

    const muscleGroupsCell = document.createElement('td');
    muscleGroupsCell.textContent = exercise.muscleGroups && exercise.muscleGroups.join(', ');
    row.appendChild(muscleGroupsCell);

    const equipmentCell = document.createElement('td');
    equipmentCell.textContent = exercise.equipment;
    row.appendChild(equipmentCell);

    const creatorCell = document.createElement('td');
    if (!exercise.userId) {
      creatorCell.textContent = 'Default';
    } else if (userId && exercise.userId === userId) {
      creatorCell.textContent = name;
    } else {
      creatorCell.textContent = 'Another User';
    }
    row.appendChild(creatorCell);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';

    const useBtn = document.createElement('button');
    useBtn.className = 'action-btn use-btn';
    useBtn.innerHTML = '<i class="fas fa-plus-circle"></i>';
    useBtn.title = 'Add to Workout';
    useBtn.addEventListener('click', () => addToWorkout(exercise));
    actionsCell.appendChild(useBtn);

    if (exercise.userId && userId && exercise.userId === userId) {
      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.innerHTML = '<i class="fas fa-edit"></i>';
      editBtn.title = 'Edit Exercise';
      editBtn.addEventListener('click', () => editExercise(exercise));
      actionsCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.title = 'Delete Exercise';
      deleteBtn.addEventListener('click', () => deleteExercise(exercise));
      actionsCell.appendChild(deleteBtn);
    }

    row.appendChild(actionsCell);
    exerciseTableBody.appendChild(row);
  });
}

function showLoading(loading) {
  if (loading) {
    exerciseTableBody.innerHTML = `
      <tr class="loading-row">
        <td colspan="5" class="text-center">
          <div class="loading-spinner"></div>
          <p>Loading exercises...</p>
        </td>
      </tr>
    `;
  }
}

function showError(message) {
  exerciseTableBody.innerHTML = `
    <tr class="error-row">
      <td colspan="5" class="text-center">
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${message}</p>
          <button class="retry-btn" onclick="location.reload()">Retry</button>
        </div>
      </td>
    </tr>
  `;
}

function showEmptyState() {
  exerciseTable.style.display = 'none';
  emptyState.style.display = 'flex';

  if (currentFilter === 'me') {
    emptyStateMessage.textContent = "You haven't created any custom exercises yet.";
    emptyStateBtn.textContent = 'Create Your First Exercise';
  } else if (currentMuscleGroup || currentEquipment) {
    emptyStateMessage.textContent = 'No exercises match your current filters.';
    emptyStateBtn.textContent = 'Clear Filters';
    emptyStateBtn.onclick = clearFilters;
  } else {
    emptyStateMessage.textContent = 'No exercises found in the database.';
    emptyStateBtn.textContent = 'Create New Exercise';
    emptyStateBtn.onclick = openExerciseModal;
  }
}

function hideEmptyState() {
  exerciseTable.style.display = 'table';
  emptyState.style.display = 'none';
}

function clearFilters() {
  currentFilter = '';
  currentMuscleGroup = '';
  currentEquipment = '';

  filterButtons.forEach((btn) => btn.classList.remove('active'));
  document.getElementById('allExercises').classList.add('active');
  muscleGroupSelect.value = '';
  equipmentSelect.value = '';

  filterExercises();
}

function openExerciseModal() {
  isEditMode = false;
  currentExercise = null;
  exerciseForm.reset();
  document.querySelector('.modal-title').textContent = 'Create New Exercise';
  exerciseModal.style.display = 'block';
}

function closeExerciseModal() {
  exerciseModal.style.display = 'none';
}

async function handleExerciseSubmit(e) {
  e.preventDefault();

  const formData = new FormData(exerciseForm);
  const name = formData.get('name');
  const description = formData.get('description');
  const isPublic = formData.get('isPublic') === 'on';
  const selectedEquipment = formData.get('equipment');

  const selectedMuscleGroups = [];
  document.querySelectorAll('input[name="muscleGroups"]:checked').forEach((checkbox) => {
    selectedMuscleGroups.push(checkbox.value);
  });

  if (!name || !description || selectedMuscleGroups.length === 0 || !selectedEquipment) {
    alert('Please fill in all required fields and select at least one muscle group.');
    return;
  }

  try {
    const exerciseData = {
      name,
      description,
      muscleGroups: selectedMuscleGroups,
      equipment: selectedEquipment,
      isPrivate: !isPublic,
    };

    let resultExercise;

    if (isEditMode && currentExercise) {
      resultExercise = await updateExercise(currentExercise.id, exerciseData);

      const index = exercises.findIndex((ex) => ex.id === currentExercise.id);
      if (index !== -1) {
        exercises[index] = resultExercise;
      }
    } else {
      resultExercise = await createExercise(exerciseData);

      exercises.push(resultExercise);
    }

    closeExerciseModal();
    filterExercises();

    alert(isEditMode ? 'Exercise updated successfully!' : 'Exercise created successfully!');
  } catch (error) {
    console.error('Error with exercise:', error);
    alert(`Failed to ${isEditMode ? 'update' : 'create'} exercise. Please try again.`);
  }
}

function addToWorkout(exercise) {
  alert(`Feature coming soon: Add ${exercise.name} to your workout`);
}

function editExercise(exercise) {
  isEditMode = true;
  currentExercise = exercise;

  document.getElementById('exerciseName').value = exercise.name;
  document.getElementById('exerciseDescription').value = exercise.description;

  document.querySelectorAll('input[name="muscleGroups"]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  if (exercise.muscleGroups && exercise.muscleGroups.length) {
    exercise.muscleGroups.forEach((group) => {
      const checkbox = document.querySelector(`input[value="${group}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }

  document.getElementById('exerciseEquipment').value = exercise.equipment;

  document.getElementById('isPublic').checked = !exercise.isPrivate;

  document.querySelector('.modal-title').textContent = 'Edit Exercise';

  exerciseModal.style.display = 'block';
}

async function deleteExercise(exercise) {
  if (confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
    try {
      await apiDeleteExercise(exercise.id);

      exercises = exercises.filter((ex) => ex.id !== exercise.id);

      filterExercises();

      alert('Exercise deleted successfully!');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise. Please try again.');
    }
  }
}

document.addEventListener('DOMContentLoaded', initExercisesPage);
