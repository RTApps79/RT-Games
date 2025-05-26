// ------------ Data: RadUnits Challenge Questions --------------
const questionsBank = [
    // ... (same as your provided questions)
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

// For matching and flashcards, re-use the same data structure
const radUnitsVocabulary = questionsBank.map(q => ({
    term: q.correctAnswer,
    definition: q.question.replace(/\?$/,'').replace(/^Which /i, "The ").replace(/^What /i, "The ") + ": " + q.correctAnswer
}));

// ------------ State Variables --------------
let currentGameMode = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 0;
let timeLimitPerQuestion = 0;
let allowTime = false;
let shuffledVocabulary = [];
let currentFlashcardIndex = 0;
let matchingPairs = [];
let selectedMatchingCard = null;
let currentAudioQuestion = null;

// ------------ DOM Elements --------------
const badgeContainer = document.getElementById('badge-container');
const timerElement = document.getElementById('timer');

// Multiple choice
const mcGame = document.getElementById('multiple-choice-game');
const mcQuestion = document.getElementById('mc-question');
const mcOptions = document.getElementById('mc-options');
const mcFeedback = document.getElementById('mc-feedback');
const mcNextBtn = document.getElementById('mc-next');
const mcRestartBtn = document.getElementById('mc-restart');
const mcScore = document.getElementById('mc-score');
const difficultySelect = document.getElementById('difficulty');
const mcProgress = mcGame.querySelector('.progress');

// Matching
const matchingGame = document.getElementById('matching-game');
const matchingTerms = document.getElementById('matching-terms');
const matchingDefinitions = document.getElementById('matching-definitions');
const matchingFeedback = document.getElementById('matching-feedback');
const matchingScore = document.getElementById('matching-score');

// Flashcards
const flashcardsGame = document.getElementById('flashcards-game');
const flashcardTerm = document.getElementById('flashcard-term');
const flashcardDef = document.getElementById('flashcard-definition');
const flashcardScore = document.getElementById('flashcard-score');

// Audio
const audioGame = document.getElementById('audio-quiz-game');
const audioDef = document.getElementById('audio-definition');
const audioAnswer = document.getElementById('audio-answer');
const audioFeedback = document.getElementById('audio-feedback');
const audioScore = document.getElementById('audio-score');

// Sound
const audioCorrect = document.getElementById('audio-correct');
const audioIncorrect = document.getElementById('audio-incorrect');
const audioComplete = document.getElementById('audio-complete');
const audioTick = document.getElementById('audio-tick');
const audioTimeup = document.getElementById('audio-timeup');

// ------------ Utility --------------
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function playSound(audio) {
    try { audio.currentTime = 0; audio.play(); } catch(e) { }
}
function hideAllGames() {
    document.querySelectorAll('.game-container').forEach(div => div.style.display = 'none');
    badgeContainer.innerHTML = '';
    timerElement.textContent = '';
}
function updateBadge(score, total) {
    let badgeLevel = "", badgeText = "", certText = "";
    let percent = (score / total) * 100;
    if (percent === 100) {
        badgeLevel = "gold"; badgeText = "🏆 Gold Badge: Radiation Master!"; certText = "Certificate of Excellence: You aced the RadUnits Challenge!";
    } else if (percent >= 80) {
        badgeLevel = "silver"; badgeText = "🥈 Silver Badge: Radiation Scholar!"; certText = "Certificate of Achievement: Great job!";
    } else if (percent >= 60) {
        badgeLevel = "bronze"; badgeText = "🥉 Bronze Badge: Radiation Learner!"; certText = "Certificate of Completion: Keep practicing!";
    } else {
        badgeLevel = ""; badgeText = "Keep practicing to earn a badge!"; certText = "";
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

// ------------ Game Mode Switching --------------

window.startGame = function(mode) {
    currentGameMode = mode;
    hideAllGames();
    if (mode === 'multiple-choice') {
        mcGame.style.display = '';
        setupGame();
    } else if (mode === 'matching') {
        matchingGame.style.display = '';
        setupMatching();
    } else if (mode === 'flashcards') {
        flashcardsGame.style.display = '';
        setupFlashcards();
    } else if (mode === 'audio-quiz') {
        audioGame.style.display = '';
        setupAudioQuiz();
    }
};

// ------------ Multiple Choice Mode --------------

function setupGame() {
    questions = questionsBank.map(q => ({
        ...q,
        options: [...q.options]
    }));
    shuffleArray(questions);
    currentQuestionIndex = 0;
    score = 0;
    updateBadge(score, questions.length);
    mcScore.textContent = `Score: ${score} / ${questions.length}`;
    mcRestartBtn.style.display = "none";
    mcNextBtn.style.display = "";
    mcFeedback.textContent = "";
    setDifficulty();
    loadMCQuestion();
}
function setDifficulty() {
    const diff = difficultySelect.value;
    if (diff === "practice") { allowTime = false; timeLimitPerQuestion = 0; }
    else if (diff === "medium") { allowTime = true; timeLimitPerQuestion = 20; }
    else if (diff === "hard") { allowTime = true; timeLimitPerQuestion = 12; }
}
difficultySelect.addEventListener('change', setupGame);

function loadMCQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    shuffleArray(currentQuestion.options);

    mcQuestion.textContent = currentQuestion.question;
    mcOptions.innerHTML = "";
    mcFeedback.textContent = "";
    mcProgress.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    currentQuestion.options.forEach((option, idx) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.setAttribute('tabindex', 0);
        optionElement.dataset.idx = idx;
        optionElement.addEventListener('click', () => checkMCAnswer(option));
        mcOptions.appendChild(optionElement);
    });
    mcNextBtn.disabled = true;
    timerElement.style.display = allowTime ? "" : "none";
    if (allowTime) startMCTimer();
    else timerElement.textContent = "";

    document.onkeydown = function(e) {
        if (mcNextBtn.disabled) {
            const key = e.key.toLowerCase();
            let idx = -1;
            if (key >= '1' && key <= String(currentQuestion.options.length)) {
                idx = parseInt(key) - 1;
            } else if (key >= 'a' && key <= 'd') {
                idx = key.charCodeAt(0) - 'a'.charCodeAt(0);
            }
            if (idx >= 0 && idx < currentQuestion.options.length) {
                checkMCAnswer(currentQuestion.options[idx]);
            }
        }
    };
}
function checkMCAnswer(selectedOption, timedOut = false) {
    stopMCTimer();
    const currentQuestion = questions[currentQuestionIndex];
    const options = mcOptions.querySelectorAll('.option');

    options.forEach(option => {
        option.classList.remove('correct', 'incorrect');
        option.style.pointerEvents = 'none';
    });

    if (timedOut) {
        playSound(audioTimeup);
        mcFeedback.textContent = "⏰ Time's up! The correct answer is " + currentQuestion.correctAnswer;
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
        mcFeedback.textContent = "✓ Correct!";
        score++;
        mcScore.textContent = `Score: ${score} / ${questions.length}`;
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
        mcFeedback.textContent = "✗ Incorrect. The correct answer is " + currentQuestion.correctAnswer;
    }
    mcNextBtn.disabled = false;
    document.onkeydown = null;
}
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadMCQuestion();
    } else {
        playSound(audioComplete);
        mcFeedback.textContent = `Your final score is ${score} out of ${questions.length}`;
        updateBadge(score, questions.length);
        mcQuestion.textContent = "Quiz Completed!";
        mcOptions.innerHTML = "";
        mcProgress.textContent = "";
        mcNextBtn.style.display = "none";
        mcRestartBtn.style.display = "";
        document.onkeydown = null;
    }
}
mcNextBtn.addEventListener('click', nextQuestion);
mcRestartBtn.addEventListener('click', setupGame);
let mcTimer = null;
function startMCTimer() {
    stopMCTimer();
    timeLeft = timeLimitPerQuestion;
    timerElement.textContent = `⏳ Time: ${timeLeft}s`;
    mcTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `⏳ Time: ${timeLeft}s`;
        if (timeLeft <= 5 && timeLeft > 0) playSound(audioTick);
        if (timeLeft <= 0) {
            stopMCTimer();
            checkMCAnswer(null, true);
        }
    }, 1000);
}
function stopMCTimer() {
    if (mcTimer) clearInterval(mcTimer);
    mcTimer = null;
}

// ------------ Matching Pairs Mode --------------
function setupMatching() {
    shuffledVocabulary = questionsBank.map(q => ({
        term: q.correctAnswer,
        definition: q.question
    }));
    shuffleArray(shuffledVocabulary);

    const pairs = shuffledVocabulary.map(v => ({
    term: v.term,
    definition: v.definition,
    termId: crypto.randomUUID(),
    matched: false
}));
const termsData = pairs.map(p => ({
    id: p.termId,
    text: p.term,
    type: 'term',
    matched: false
}));
const definitionsData = pairs.map(p => ({
    id: crypto.randomUUID(),
    text: p.definition,
    type: 'definition',
    matched: false,
    correctTermId: p.termId
}));
shuffleArray(termsData);
shuffleArray(definitionsData);
matchingPairs = { terms: termsData, definitions: definitionsData };
    matchingScore.textContent = `Score: 0 / ${pairs.length}`;

    matchingTerms.innerHTML = '';
    matchingDefinitions.innerHTML = '';
    matchingFeedback.textContent = '';
    badgeContainer.innerHTML = '';

    matchingPairs.terms.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.text;
        div.classList.add('match-card');
        div.draggable = true;
        div.dataset.id = item.id;
        div.dataset.type = item.type;
        div.addEventListener('dragstart', dragStartMatching);
        matchingTerms.appendChild(div);
    });
    matchingPairs.definitions.forEach(item => {
        const div = document.createElement('div');
        div.textContent = item.text;
        div.classList.add('match-card');
        div.dataset.id = item.id;
        div.dataset.type = item.type;
        div.dataset.correctTermId = item.correctTermId;
        div.addEventListener('dragover', dragOverMatching);
        div.addEventListener('drop', dropMatching);
        matchingDefinitions.appendChild(div);
    });
    score = 0;
}
function dragStartMatching(event) {
    selectedMatchingCard = event.target;
    event.dataTransfer.setData('text/plain', event.target.dataset.id);
}
function dragOverMatching(event) {
    event.preventDefault();
}
function dropMatching(event) {
    event.preventDefault();
    const draggedTermId = event.dataTransfer.getData('text/plain');
    const droppedOnDefinitionCard = event.target;
    const draggedTermCard = matchingTerms.querySelector(`.match-card[data-id="${draggedTermId}"][data-type="term"]`);

    if (draggedTermCard && droppedOnDefinitionCard.dataset.type === 'definition') {
        if (droppedOnDefinitionCard.dataset.correctTermId === draggedTermId) {
            droppedOnDefinitionCard.style.backgroundColor = '#d4edda';
            draggedTermCard.style.backgroundColor = '#d4edda';
            draggedTermCard.draggable = false;
            droppedOnDefinitionCard.removeEventListener('dragover', dragOverMatching);
            droppedOnDefinitionCard.removeEventListener('drop', dropMatching);
            score++;
            matchingScore.textContent = `Score: ${score} / ${matchingPairs.terms.length}`;
            matchingFeedback.textContent = 'Match found!';
            matchingFeedback.className = 'answer-feedback correct';
            playSound(audioCorrect);
            // Check for game end
            if (score === matchingPairs.terms.length) {
                matchingFeedback.textContent = 'All matches correct! Well done!';
                updateBadge(score, matchingPairs.terms.length);
            }
        } else {
            droppedOnDefinitionCard.style.backgroundColor = '#f8d7da';
            matchingFeedback.textContent = 'Incorrect match. Try again.';
            matchingFeedback.className = 'answer-feedback incorrect';
            playSound(audioIncorrect);
            setTimeout(() => { droppedOnDefinitionCard.style.backgroundColor = '#f9f9f9'; }, 500);
        }
    }
    selectedMatchingCard = null;
}
window.checkMatching = function() {
    if (score === matchingPairs.terms.length) {
        matchingFeedback.textContent = 'All matches correct! Well done!';
        matchingFeedback.className = 'answer-feedback correct';
        updateBadge(score, matchingPairs.terms.length);
    } else {
        matchingFeedback.textContent = `You have ${score} correct matches. Keep going!`;
        matchingFeedback.className = 'answer-feedback';
    }
};

// ------------ Flashcards Mode --------------
function setupFlashcards() {
    shuffledVocabulary = questionsBank.map(q => ({
        term: q.correctAnswer,
        definition: q.question
    }));
    shuffleArray(shuffledVocabulary);
    currentFlashcardIndex = 0;
    score = 0;
    flashcardScore.textContent = `Card: ${currentFlashcardIndex + 1} / ${shuffledVocabulary.length}`;
    showFlashcard();
}
function showFlashcard() {
    if (currentFlashcardIndex >= shuffledVocabulary.length) {
        flashcardTerm.textContent = 'Flashcards Finished!';
        flashcardDef.style.display = 'none';
        updateBadge(shuffledVocabulary.length, shuffledVocabulary.length);
        return;
    }
    const currentCard = shuffledVocabulary[currentFlashcardIndex];
    flashcardTerm.textContent = currentCard.term;
    flashcardDef.textContent = currentCard.definition;
    flashcardDef.style.display = 'none';
    flashcardScore.textContent = `Card: ${currentFlashcardIndex + 1} / ${shuffledVocabulary.length}`;
}
window.toggleDefinition = function() {
    flashcardDef.style.display = flashcardDef.style.display === 'none' ? 'block' : 'none';
};
window.nextFlashcard = function() {
    currentFlashcardIndex++;
    showFlashcard();
};

// ------------ Audio Quiz Mode --------------
let recognition;
let recognizing = false;
function setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        const audioQuizButton = Array.from(document.querySelectorAll('.game-mode-button')).find(button => button.textContent === 'Audio Quiz');
        if (audioQuizButton) {
            audioQuizButton.disabled = true;
            audioQuizButton.textContent = 'Audio Quiz (Not Supported)';
        }
        return null;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
        recognizing = true;
        audioFeedback.textContent = 'Listening... Say the term.';
        audioFeedback.className = 'answer-feedback';
    };
    recognition.onresult = (event) => {
        recognizing = false;
        const spokenText = event.results[0][0].transcript.trim().toLowerCase();
        checkAudioAnswer(spokenText);
    };
    recognition.onerror = (event) => {
        recognizing = false;
        audioFeedback.textContent = `Error: ${event.error}. Try again.`;
        audioFeedback.className = 'answer-feedback incorrect';
    };
    recognition.onend = () => {
        recognizing = false;
        if (audioFeedback.textContent === 'Listening... Say the term.') {
             audioFeedback.textContent = 'No speech detected.';
             audioFeedback.className = 'answer-feedback incorrect';
        }
    };
    return recognition;
}
function setupAudioQuiz() {
    shuffledVocabulary = questionsBank.map(q => ({
        term: q.correctAnswer,
        definition: q.question
    }));
    shuffleArray(shuffledVocabulary);
    currentQuestionIndex = 0;
    score = 0;
    audioScore.textContent = `Score: ${score} / ${shuffledVocabulary.length}`;
    audioDef.textContent = '';
    audioFeedback.textContent = '';
    audioAnswer.value = '';
    badgeContainer.innerHTML = '';
    setupSpeechRecognition();
    loadAudioQuestion();
}
function loadAudioQuestion() {
    audioAnswer.value = '';
    audioFeedback.textContent = '';
    if (currentQuestionIndex >= shuffledVocabulary.length) {
        audioDef.textContent = 'Quiz Finished! Your final score is shown below.';
        document.querySelector('#audio-quiz-game button:nth-child(3)').style.display = 'none'; // Play Definition
        audioAnswer.style.display = 'none';
        document.querySelector('#audio-quiz-game button:nth-child(5)').style.display = 'none'; // Check Answer
        document.querySelector('#audio-quiz-game button:nth-child(6)').style.display = 'none'; // Next Question
        updateBadge(score, shuffledVocabulary.length);
        return;
    }
    currentAudioQuestion = shuffledVocabulary[currentQuestionIndex];
    audioDef.textContent = currentAudioQuestion.definition;
    audioAnswer.style.display = '';
    document.querySelector('#audio-quiz-game button:nth-child(3)').style.display = '';
    document.querySelector('#audio-quiz-game button:nth-child(5)').style.display = '';
    document.querySelector('#audio-quiz-game button:nth-child(6)').style.display = '';
    audioScore.textContent = `Score: ${score} / ${shuffledVocabulary.length}`;
}
window.speakDefinition = function() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (synth.speaking) synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(currentAudioQuestion.definition);
    utterThis.onend = () => {
        if (recognition && !recognizing) {
            try { recognition.start(); } catch (e) {
                audioFeedback.textContent = "Microphone busy or recognition failed to start. Try again.";
                audioFeedback.className = 'answer-feedback incorrect';
            }
        }
    };
    utterThis.onerror = (event) => {
        audioFeedback.textContent = 'Speech synthesis error.';
        audioFeedback.className = 'answer-feedback incorrect';
    };
    synth.speak(utterThis);
};
window.checkAudioAnswer = function(spokenText = '') {
    const userAnswer = spokenText || audioAnswer.value.trim().toLowerCase();
    const correctAnswer = currentAudioQuestion.term.toLowerCase();
    if (!userAnswer) {
        audioFeedback.textContent = 'Please type or say your answer.';
        audioFeedback.className = 'answer-feedback incorrect';
        return;
    }
    if (userAnswer === correctAnswer) {
        audioFeedback.textContent = 'Correct!';
        audioFeedback.className = 'answer-feedback correct';
        playSound(audioCorrect);
        score++;
        audioScore.textContent = `Score: ${score} / ${shuffledVocabulary.length}`;
    } else {
        audioFeedback.textContent = `Incorrect. You said "${userAnswer}". The correct answer is: "${currentAudioQuestion.term}"`;
        audioFeedback.className = 'answer-feedback incorrect';
        playSound(audioIncorrect);
    }
};
window.nextAudioQuestion = function() {
    currentQuestionIndex++;
    loadAudioQuestion();
};

// ------------ Initial Setup --------------
document.addEventListener('DOMContentLoaded', () => {
    hideAllGames();
    badgeContainer.innerHTML = '';
});
