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

const currentStageNumElement = document.getElementById('current-stage-num');
const currentQNumElement = document.getElementById('current-q-num');
const stageQTotalElement = document.getElementById('stage-q-total');
const progressBar = document.getElementById('progress-bar');

const scoreTitle = document.getElementById('score-title');
const scoreIcon = document.getElementById('score-icon');
const finalScoreElement = document.getElementById('score-points');
const scoreMessageElement = document.getElementById('score-message');
const totalScoreElement = document.querySelector('.score-out-of');

const nextStageBtn = document.getElementById('next-stage-btn');
const retryStageBtn = document.getElementById('retry-stage-btn');
const restartButton = document.getElementById('restart-btn');

const QUESTIONS_PER_STAGE = 5;
const PASSING_SCORE = 3;

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
    nextStageBtn.addEventListener('click', () => {
        currentStage++;
        startStage();
    });
    retryStageBtn.addEventListener('click', () => {
        startStage(); // Re-runs same stage
    });
    restartButton.addEventListener('click', showStartScreen);
});

async function fetchQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        allQuestions = await response.json();

        showStartScreen();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionTextElement.textContent = "Error loading questions. Please ensure you're using a local server (e.g., Live Server).";

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
    currentStage = 0;
    score = 0; // This will act as total cumulative score
    stageQTotalElement.textContent = QUESTIONS_PER_STAGE;
    startStage();
}

function startStage() {
    stageScore = 0; // Reset just for this 5-question block
    currentQuestionIndex = currentStage * QUESTIONS_PER_STAGE;

    currentStageNumElement.textContent = currentStage + 1;

    // View Management
    startView.classList.add('hidden');
    scoreView.classList.add('hidden');
    quizView.classList.remove('hidden');

    nextButton.classList.add('hidden');
    nextButton.innerHTML = 'Next Question <i data-feather="arrow-right"></i>';

    loadQuestion();
    feather.replace();
}

function loadQuestion() {
    resetState();

    // Progress calculation for the current stage block (1 to 5)
    let qRelIndex = currentQuestionIndex % QUESTIONS_PER_STAGE;
    currentQNumElement.textContent = qRelIndex + 1;
    let progressPercentage = (qRelIndex / QUESTIONS_PER_STAGE) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    let currentQuestion = questions[currentQuestionIndex];
    questionTextElement.textContent = currentQuestion.question;

    currentQuestion.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-btn');
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
    const btn = selectedBtn.closest('.option-btn');

    const selectedIndex = parseInt(btn.dataset.index);
    const correctIndex = questions[currentQuestionIndex].answer;

    if (selectedIndex === correctIndex) {
        btn.classList.add('correct');
        btn.innerHTML += ' <i data-feather="check-circle"></i>';
        stageScore++;
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i data-feather="x-circle"></i>';

        // Highlight the correct answer
        const options = optionsContainer.children;
        const correctBtn = options[correctIndex];
        correctBtn.classList.add('correct');
        correctBtn.innerHTML += ' <i data-feather="check-circle"></i>';
    }

    feather.replace();

    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    let qRelIndex = currentQuestionIndex % QUESTIONS_PER_STAGE;
    if (qRelIndex === QUESTIONS_PER_STAGE - 1) {
        nextButton.innerHTML = 'View Stage Results <i data-feather="bar-chart-2"></i>';
        feather.replace();
    }

    nextButton.classList.remove('hidden');
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex % QUESTIONS_PER_STAGE === 0 || currentQuestionIndex >= questions.length) {
        showStageResults();
    } else {
        loadQuestion();
    }
}

function showStageResults() {
    quizView.classList.add('hidden');
    scoreView.classList.remove('hidden');
    progressBar.style.width = '100%';

    nextStageBtn.classList.add('hidden');
    retryStageBtn.classList.add('hidden');

    const totalStages = Math.ceil(questions.length / QUESTIONS_PER_STAGE);
    const isLastStage = (currentStage === totalStages - 1) || (currentQuestionIndex >= questions.length);

    if (stageScore >= PASSING_SCORE) {
        // Passed
        score += stageScore; // Save to total

        if (isLastStage) {
            scoreTitle.innerHTML = `Quiz <span class="mil-accent">Completed!</span>`;
            scoreIcon.setAttribute('data-feather', 'award');
            scoreIcon.style.color = 'var(--accent-color)';

            finalScoreElement.textContent = score;
            totalScoreElement.textContent = `/ ${questions.length}`;
            scoreMessageElement.textContent = `You finished all stages! Incredible work.`;
        } else {
            scoreTitle.innerHTML = `Stage ${currentStage + 1} <span class="mil-accent" style="color: var(--correct-color);">Passed!</span>`;
            scoreIcon.setAttribute('data-feather', 'check-circle');
            scoreIcon.style.color = 'var(--correct-color)';

            finalScoreElement.textContent = stageScore;
            totalScoreElement.textContent = `/ ${QUESTIONS_PER_STAGE}`;
            scoreMessageElement.textContent = "Great job! Ready for the next 5?";

            nextStageBtn.classList.remove('hidden');
        }
    } else {
        // Failed
        scoreTitle.innerHTML = `Stage ${currentStage + 1} <span class="mil-accent" style="color: var(--incorrect-color);">Failed</span>`;
        scoreIcon.setAttribute('data-feather', 'x-circle');
        scoreIcon.style.color = 'var(--incorrect-color)';

        finalScoreElement.textContent = stageScore;
        totalScoreElement.textContent = `/ ${QUESTIONS_PER_STAGE}`;
        scoreMessageElement.textContent = `You need at least ${PASSING_SCORE} out of ${QUESTIONS_PER_STAGE} to proceed.`;

        retryStageBtn.classList.remove('hidden');
    }

    feather.replace();
}
