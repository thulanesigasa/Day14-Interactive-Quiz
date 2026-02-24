let allQuestions = {}; // To store the fetched JSON object
let questions = []; // Active array based on selected difficulty
let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const startView = document.getElementById('start-view');
const quizView = document.getElementById('quiz-view');
const scoreView = document.getElementById('score-view');

const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const activeDifficultyLabel = document.getElementById('active-difficulty-label');

const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-btn');

const currentQNumElement = document.getElementById('current-q-num');
const totalQNumElement = document.getElementById('total-q-num');
const progressBar = document.getElementById('progress-bar');

const finalScoreElement = document.getElementById('score-points');
const scoreMessageElement = document.getElementById('score-message');
const totalScoreElement = document.querySelector('.score-out-of');
const restartButton = document.getElementById('restart-btn');

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();

    // Bind difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            selectDifficulty(level);
        });
    });

    nextButton.addEventListener('click', handleNextButton);
    restartButton.addEventListener('click', showStartScreen);
});

async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        allQuestions = await response.json();

        // Ensure start screen is visible initially once loaded
        showStartScreen();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionTextElement.textContent = "Error loading questions. Please ensure you're using a local server (e.g., Live Server).";

        // Show quiz view with the error message
        startView.classList.add('hidden');
        quizView.classList.remove('hidden');
    }
}

function showStartScreen() {
    quizView.classList.add('hidden');
    scoreView.classList.add('hidden');
    startView.classList.remove('hidden');
}

function selectDifficulty(level) {
    if (!allQuestions[level]) return;

    questions = allQuestions[level];

    // Update Header
    let formattedLabel = level.charAt(0).toUpperCase() + level.slice(1);
    activeDifficultyLabel.textContent = `${formattedLabel} Quiz`;

    startQuiz();
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    totalQNumElement.textContent = questions.length;
    nextButton.classList.add('hidden');
    nextButton.innerHTML = 'Next Question <i data-feather="arrow-right"></i>';

    // View Management
    startView.classList.add('hidden');
    scoreView.classList.add('hidden');
    quizView.classList.remove('hidden');

    loadQuestion();
    feather.replace(); // Re-initialize icons if needed
}

function loadQuestion() {
    resetState();

    // Update Header and Progress
    currentQNumElement.textContent = currentQuestionIndex + 1;
    let progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    let currentQuestion = questions[currentQuestionIndex];
    questionTextElement.textContent = currentQuestion.question;

    currentQuestion.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-btn');
        // Store the index to check against the answer
        button.dataset.index = index;
        button.addEventListener('click', selectAnswer);
        optionsContainer.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hidden');
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    // Account for clicking icon inside button (though currently there are none initially, good practice)
    const btn = selectedBtn.closest('.option-btn');

    const selectedIndex = parseInt(btn.dataset.index);
    const correctIndex = questions[currentQuestionIndex].answer;

    if (selectedIndex === correctIndex) {
        btn.classList.add('correct');
        // Optional: add check icon
        btn.innerHTML += ' <i data-feather="check-circle"></i>';
        score++;
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i data-feather="x-circle"></i>';

        // Highlight the correct answer
        const options = optionsContainer.children;
        const correctBtn = options[correctIndex];
        correctBtn.classList.add('correct');
        correctBtn.innerHTML += ' <i data-feather="check-circle"></i>';
    }

    feather.replace(); // Render new icons inserted via innerHTML

    // Disable all options after selection
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    // Check if it's the last question to change the button text
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.innerHTML = 'View Results <i data-feather="bar-chart-2"></i>';
        feather.replace();
    }

    nextButton.classList.remove('hidden');
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showScore();
    }
}

function showScore() {
    quizView.classList.add('hidden');
    scoreView.classList.remove('hidden');

    // Finish progress bar
    progressBar.style.width = '100%';

    finalScoreElement.textContent = score;
    totalScoreElement.textContent = `/ ${questions.length}`;

    // Set dynamic message based on score
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) {
        scoreMessageElement.textContent = "Perfect Score! You're a Web Dev master! 🌟";
    } else if (percentage >= 80) {
        scoreMessageElement.textContent = "Great job! You know your stuff! 🚀";
    } else if (percentage >= 50) {
        scoreMessageElement.textContent = "Good effort! Keep learning! 📚";
    } else {
        scoreMessageElement.textContent = "Time to review some basics! You got this! 💪";
    }
}
