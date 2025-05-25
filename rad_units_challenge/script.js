const questionsBank = [
    {
        question: "Which SI unit is used to measure absorbed dose?",
        options: ["Sievert", "Gray", "Becquerel", "Coulomb/kg"],
        correctAnswer: "Gray"
    },
    {
        question: "The Sievert (Sv) is the SI unit for:",
        options: ["Absorbed dose", "Equivalent dose", "Radioactivity", "Exposure"],
        correctAnswer: "Equivalent dose"
    },
    {
        question: "The SI unit for radioactivity is:",
        options: ["Becquerel", "Sievert", "Gray", "Coulomb/kg"],
        correctAnswer: "Becquerel"
    },
    {
        question: "What does 1 Becquerel represent?",
        options: ["1 J/kg", "1 decay/second", "1 C/kg", "1 Sievert"],
        correctAnswer: "1 decay/second"
    },
    {
        question: "The SI unit for exposure (air ionization) is:",
        options: ["Coulomb/kg", "Gray", "Sievert", "Becquerel"],
        correctAnswer: "Coulomb/kg"
    },
    {
        question: "How many Joules per kilogram are in 1 Gray?",
        options: ["1", "10", "100", "1000"],
        correctAnswer: "1"
    },
    {
        question: "Which quantity does the Gray (Gy) measure?",
        options: ["Absorbed dose", "Equivalent dose", "Radioactivity", "Exposure"],
        correctAnswer: "Absorbed dose"
    },
    {
        question: "Which SI unit is used to express the biological effect of radiation?",
        options: ["Sievert", "Gray", "Becquerel", "Coulomb/kg"],
        correctAnswer: "Sievert"
    },
    {
        question: "A dose of 2 Gy is equal to how many Joules absorbed per kg?",
        options: ["2 J/kg", "20 J/kg", "0.2 J/kg", "200 J/kg"],
        correctAnswer: "2 J/kg"
    },
    {
        question: "What does a reading of 1000 Bq mean?",
        options: ["1000 decays per minute", "1000 decays per second", "1000 J/kg", "1000 C/kg"],
        correctAnswer: "1000 decays per second"
    },
    {
        question: "What is the SI unit symbol for exposure?",
        options: ["C/kg", "Gy", "Sv", "Bq"],
        correctAnswer: "C/kg"
    },
    {
        question: "Which unit is used for activity concentration in SI?",
        options: ["Bq/kg", "Sv/kg", "Gy/kg", "C/kg"],
        correctAnswer: "Bq/kg"
    },
    {
        question: "Which of the following is a derived SI unit?",
        options: ["Gray", "Sievert", "Becquerel", "All of the above"],
        correctAnswer: "All of the above"
    },
    {
        question: "Which SI unit is equivalent to 1 J/kg?",
        options: ["1 Gray", "1 Sievert", "1 Becquerel", "1 C/kg"],
        correctAnswer: "1 Gray"
    },
    {
        question: "Which SI unit is used for effective dose?",
        options: ["Sievert", "Gray", "Becquerel", "Coulomb/kg"],
        correctAnswer: "Sievert"
    },
    {
        question: "The SI unit for measuring the rate of nuclear decay is:",
        options: ["Becquerel", "Gray", "Sievert", "Coulomb/kg"],
        correctAnswer: "Becquerel"
    },
    {
        question: "Which of the following is NOT an SI unit?",
        options: ["Gray", "Sievert", "Becquerel", "Rem"],
        correctAnswer: "Rem"
    },
    {
        question: "Which SI unit replaced the traditional unit 'rad'?",
        options: ["Gray", "Sievert", "Becquerel", "Coulomb/kg"],
        correctAnswer: "Gray"
    },
    {
        question: "Which SI unit replaced the traditional unit 'rem'?",
        options: ["Sievert", "Gray", "Becquerel", "Coulomb/kg"],
        correctAnswer: "Sievert"
    },
    {
        question: "Which SI unit replaced the traditional unit 'Curie'?",
        options: ["Becquerel", "Sievert", "Gray", "Coulomb/kg"],
        correctAnswer: "Becquerel"
    }
];

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let timeLimitPerQuestion = 0;
let difficulty = 'practice';
let allowTime = false;

const questionElement = document.querySelector('.question');
const optionsContainer = document.querySelector('.options-container');
const feedbackElement = document.querySelector('.feedback');
const nextButton = document.querySelector('.next-button');
const restartButton = document.querySelector('.restart-button');
const scoreElement = document.querySelector('.score-value');
const progressElement = document.querySelector('.progress');
const timerElement = document.querySelector('.timer');
const badgeContainer = document.querySelector('.badge-container');
const difficultySelect = document.getElementById('difficulty');

// Sound references
const audioCorrect = document.getElementById('audio-correct');
const audioIncorrect = document.getElementById('audio-incorrect');
const audioComplete = document.getElementById('audio-complete');
const audioTick = document.getElementById('audio-tick');
const audioTimeup = document.getElementById('audio-timeup');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setupGame() {
    questions = questionsBank.map(q => ({
        ...q,
        options: [...q.options]
    }));
    shuffleArray(questions);
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = score;
    badgeContainer.innerHTML = '';
    restartButton.style.display = "none";
    nextButton.style.display = "";
    feedbackElement.textContent = "";
    setDifficulty();
    loadQuestion();
}

function setDifficulty() {
    difficulty = difficultySelect.value;
    if (difficulty === "practice") {
        allowTime = false;
        timeLimitPerQuestion = 0;
    } else if (difficulty === "medium") {
        allowTime = true;
        timeLimitPerQuestion = 20;
    } else if (difficulty === "hard") {
        allowTime = true;
        timeLimitPerQuestion = 12;
    }
}

difficultySelect.addEventListener('change', setupGame);

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    shuffleArray(currentQuestion.options);

    questionElement.textContent = currentQuestion.question;
    optionsContainer.innerHTML = "";
    feedbackElement.textContent = "";
    progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    currentQuestion.options.forEach((option, idx) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.setAttribute('tabindex', 0);
        optionElement.dataset.idx = idx;
        optionElement.addEventListener('click', () => checkAnswer(option));
        optionsContainer.appendChild(optionElement);
    });

    nextButton.disabled = true;
    timerElement.style.display = allowTime ? "" : "none";
    if (allowTime) {
        startTimer();
    } else {
        timerElement.textContent = "";
    }
    // Keyboard accessibility: support 1-4/A-D
    document.onkeydown = function(e) {
        if (nextButton.disabled) {
            const key = e.key.toLowerCase();
            let idx = -1;
            if (key >= '1' && key <= String(currentQuestion.options.length)) {
                idx = parseInt(key) - 1;
            } else if (key >= 'a' && key <= 'd') {
                idx = key.charCodeAt(0) - 'a'.charCodeAt(0);
            }
            if (idx >= 0 && idx < currentQuestion.options.length) {
                checkAnswer(currentQuestion.options[idx]);
            }
        }
    };
}

function playSound(audio) {
    try {
        audio.currentTime = 0;
        audio.play();
    } catch(e) { /* ignore play errors */ }
}

function checkAnswer(selectedOption, timedOut = false) {
    stopTimer();
    const currentQuestion = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');

    options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.style.pointerEvents = 'none';
    });

    if (timedOut) {
        playSound(audioTimeup);
        feedbackElement.textContent = "⏰ Time's up! The correct answer is " + currentQuestion.correctAnswer;
        options.forEach(option => {
            if (option.textContent === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
    } else if (selectedOption === currentQuestion.correctAnswer) {
        playSound(audioCorrect);
        options.forEach(option => {
            if (option.textContent === selectedOption) {
                option.classList.add('correct');
            }
        });
        feedbackElement.textContent = "✓ Correct!";
        score++;
        scoreElement.textContent = score;
    } else {
        playSound(audioIncorrect);
        options.forEach(option => {
            if (option.textContent === selectedOption) {
                option.classList.add('incorrect');
            }
            if (option.textContent === currentQuestion.correctAnswer) {
                option.classList.add('correct');
            }
        });
        feedbackElement.textContent = "✗ Incorrect. The correct answer is " + currentQuestion.correctAnswer;
    }
    nextButton.disabled = false;
    document.onkeydown = null;
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        playSound(audioComplete);
        showResultsAndBadge();
        questionElement.textContent = "Quiz Completed!";
        optionsContainer.innerHTML = "";
        progressElement.textContent = "";
        nextButton.style.display = "none";
        restartButton.style.display = "";
        document.onkeydown = null;
    }
}

function showResultsAndBadge() {
    feedbackElement.textContent = `Your final score is ${score} out of ${questions.length}`;
    // Badge/Certificate logic
    let badgeLevel = "";
    let badgeText = "";
    let certText = "";
    let percent = (score / questions.length) * 100;
    if (percent === 100) {
        badgeLevel = "gold";
        badgeText = "🏆 Gold Badge: Radiation Master!";
        certText = "Certificate of Excellence: You aced the RadUnits Challenge!";
    } else if (percent >= 80) {
        badgeLevel = "silver";
        badgeText = "🥈 Silver Badge: Radiation Scholar!";
        certText = "Certificate of Achievement: Great job!";
    } else if (percent >= 60) {
        badgeLevel = "bronze";
        badgeText = "🥉 Bronze Badge: Radiation Learner!";
        certText = "Certificate of Completion: Keep practicing!";
    } else {
        badgeLevel = "";
        badgeText = "Keep practicing to earn a badge!";
        certText = "";
    }
    let html = "";
    if (badgeLevel) {
        html += `<div class="badge ${badgeLevel}">${badgeText}</div><br/>`;
        html += `<div class="certificate">${certText}</div>`;
    } else {
        html += `<div class="badge">${badgeText}</div>`;
    }
    badgeContainer.innerHTML = html;
}

function startTimer() {
    stopTimer();
    timeLeft = timeLimitPerQuestion;
    timerElement.textContent = `⏳ Time: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `⏳ Time: ${timeLeft}s`;
        if (timeLeft <= 5 && timeLeft > 0) {
            playSound(audioTick);
        }
        if (timeLeft <= 0) {
            stopTimer();
            checkAnswer(null, true);
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

nextButton.addEventListener('click', loadNextQuestion);
restartButton.addEventListener('click', setupGame);

setupGame();
