// Randomise questions - NOTE: We are using only one set (radiationQuestions), so the randomiser is mostly bypassed.
let questionSet = 1;

function randomiser(min, max) {
    // We are forcing set 1 (the specialized radiation questions)
    return 1;
}

function randomQuestions(qSet) {
    questionSet = qSet;
};
randomQuestions(randomiser(1, 3));


// Start of Audio and Splash Screen Logic (as provided)
let sound = 1;
const audioOn = document.querySelector('span.on');
const audioOff = document.querySelector('span.off');
const musicAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/music4a.mp3');
musicAudio.volume = 0.2;
musicAudio.loop = true;

const correctEasyAnswerAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/easyAnswer.mp3');
correctEasyAnswerAudio.volume = 0.2;
const correctHardAnswerAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/hardAnswer.mp3');
correctEasyAnswerAudio.volume = 0.2;
const WrongAnswerAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/wrongAnswer.mp3');
WrongAnswerAudio.volume = 0.2;
const winAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/theWin.mp3');
winAudio.volume = 0.2;
const waitAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/theWait2.mp3');
waitAudio.volume = 0.2;
const audienceAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/audience2.mp3');
audienceAudio.volume = 0.7;
const fifty50Audio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/5050b.mp3');
fifty50Audio.volume = 0.7;
const friendAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/friend.mp3');
friendAudio.volume = 0.3;
const phoneAudio = new Audio('https://mwaistell.site/projects/WhoWantsToBeAMillionaire/phone.mp3');
phoneAudio.volume = 0.2;

audioOn.addEventListener('click', function() {
    sound = 1;
    audioOn.classList.add('chosen');
    audioOff.classList.remove('chosen');
});

audioOff.addEventListener('click', function() {
    sound = 0;
    audioOff.classList.add('chosen');
    audioOn.classList.remove('chosen');
});


// Start the game
const splash = document.querySelector('#splash');
const gameStartButton = document.querySelector('#playButton');
const splashContainer = document.querySelector('.centralContent');
const sRight = document.querySelector('.sRight');
const sLeft = document.querySelector('.sLeft');

gameStartButton.addEventListener('click', function() {

    sRight.classList.add('animateRight');
    sLeft.classList.add('animateLeft');

    if (sound === 1) {
        musicAudio.play();
    }

    var fadeEffect = setInterval(function () {

        if (!splashContainer.style.opacity) {
            splashContainer.style.opacity = 1;
        }
        if (splashContainer.style.opacity > 0) {
            splashContainer.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
            setInterval(function () {
                splash.remove();
            }, 1000);
        }

    }, 100);

});


// --- RADIATION BIOLOGY QUESTION DATA (New Content) ---
const radiationQuestions = [
    // --- £100 (Type 1: Cellular Biology) ---
    {
        "Question": "Which cellular component is considered the most sensitive to radiation damage?",
        "A": "Mitochondria",
        "B": "DNA",
        "C": "Ribosome",
        "D": "Water",
        "Answer": "B",
        "Type": "Cellular Biology",
        "TypeNumber": 1
    },
    // --- £200 (Type 2: Units & Measurement) ---
    {
        "Question": "Which SI unit is used to measure **Absorbed Dose**?",
        "A": "Sievert (Sv)",
        "B": "Becquerel (Bq)",
        "C": "Coulombs/kg (C/kg)",
        "D": "Gray (Gy)",
        "Answer": "D",
        "Type": "Units & Measurement",
        "TypeNumber": 2
    },
    // --- £300 (Type 1: Cellular Biology) ---
    {
        "Question": "What is the most radioresistant phase of the cell cycle?",
        "A": "M phase",
        "B": "G1 phase",
        "C": "S phase",
        "D": "G2 phase",
        "Answer": "C",
        "Type": "Cellular Biology",
        "TypeNumber": 1
    },
    // --- £500 (Type 3: Radiobiology Principles) ---
    {
        "Question": "The Law of Bergonie and Tribondeau states that tissue radiosensitivity is increased by what factor?",
        "A": "Increased differentiation of cells",
        "B": "Increased mitotic activity",
        "C": "Higher RBE",
        "D": "Lower LET",
        "Answer": "B",
        "Type": "Radiobiology Principles",
        "TypeNumber": 3
    },
    // --- £1,000 (Safe Haven) (Type 4: Monitoring & Devices) ---
    {
        "Question": "Which radiation monitoring device contains **Lithium Fluoride (LiF)** crystals?",
        "A": "GM Counter",
        "B": "OSLs",
        "C": "Film badges",
        "D": "TLDs",
        "Answer": "D",
        "Type": "Monitoring & Devices",
        "TypeNumber": 4
    },
    // --- £2,000 (Type 5: Cellular Interaction) ---
    {
        "Question": "An **Indirect Effect** from ionizing radiation primarily occurs on which molecule?",
        "A": "DNA",
        "B": "Protein",
        "C": "H₂O",
        "D": "Lipid",
        "Answer": "C",
        "Type": "Cellular Interaction",
        "TypeNumber": 5
    },
    // --- £4,000 (Type 6: Quality Factors) ---
    {
        "Question": "What is the Quality Factor (QF) for **Alpha Particles**?",
        "A": "1",
        "B": "2",
        "C": "10",
        "D": "20",
        "Answer": "D",
        "Type": "Quality Factors",
        "TypeNumber": 6
    },
    // --- £8,000 (Type 7: Acute Syndromes) ---
    {
        "Question": "Which phase of the acute radiation syndromes occurs immediately following total body exposure?",
        "A": "Latent phase",
        "B": "Prodromal phase",
        "C": "Manifest phase",
        "D": "Recovery phase",
        "Answer": "B",
        "Type": "Acute Syndromes",
        "TypeNumber": 7
    },
    // --- £16,000 (Type 8: Cell Survival Curves) ---
    {
        "Question": "The variable $D_q$ on a cell survival curve represents which cellular capability?",
        "A": "Extrapolation number",
        "B": "Width of the shoulder region (repair)",
        "C": "Dose after which 37% of cells survive",
        "D": "Tumor Lethal Dose (TLD)",
        "Answer": "B",
        "Type": "Cell Survival Curves",
        "TypeNumber": 8
    },
    // --- £32,000 (Safe Haven) (Type 9: Safety & Dose Limits) ---
    {
        "Question": "What is the whole body annual dose limit for a radiation worker (in SI units)?",
        "A": "10 mSv/yr",
        "B": "50 mSv/yr",
        "C": "150 mSv/yr",
        "D": "5 Sv/yr",
        "Answer": "B",
        "Type": "Safety & Dose Limits",
        "TypeNumber": 9
    },
    // --- £64,000 (Type 9: Safety & Dose Limits) ---
    {
        "Question": "What is the formula to calculate a radiation worker's **cumulative** dose limit?",
        "A": "5 mSv x Age",
        "B": "50 mSv / Age",
        "C": "10 mSv x Age",
        "D": "10 mSv x Years Worked",
        "Answer": "C",
        "Type": "Safety & Dose Limits",
        "TypeNumber": 9
    },
    // --- £125,000 (Type 4: Monitoring & Devices) ---
    {
        "Question": "Areas where the dose may exceed **1 mSv per hour** require what sign to be posted?",
        "A": "Caution—Radioactive Materials",
        "B": "Caution—Radiation Area",
        "C": "Caution—High Radiation Area",
        "D": "Caution—Very High Radiation Area",
        "Answer": "C",
        "Type": "Safety & Regulations",
        "TypeNumber": 4
    },
    // --- £250,000 (Type 7: Acute Syndromes) ---
    {
        "Question": "What is the **TD 5/5** (Tolerance Dose) for the Whole Lens of the Eye?",
        "A": "10 cGy",
        "B": "100 cGy",
        "C": "1,000 cGy (10 Gy)",
        "D": "4,500 cGy (45 Gy)",
        "Answer": "C",
        "Type": "Tolerance Doses",
        "TypeNumber": 7
    },
    // --- £500,000 (Type 3: Radiobiology Principles) ---
    {
        "Question": "Which of the four R's of radiobiology is described by *hypoxic tumor cells becoming more radiosensitive*?",
        "A": "Repair of sublethal damage",
        "B": "Reassortment/Redistribution",
        "C": "Repopulation",
        "D": "Reoxygenation",
        "Answer": "D",
        "Type": "Radiobiology Modifiers",
        "TypeNumber": 3
    },
    // --- £1,000,000 (Type 9: Safety & Dose Limits) ---
    {
        "Question": "The agency that issues licenses to facilities utilizing radiation producing equipment and radioactive isotopes is the:",
        "A": "NCRP",
        "B": "ICRP",
        "C": "NRC",
        "D": "EPA",
        "Answer": "C",
        "Type": "Safety & Regulations",
        "TypeNumber": 9
    }
];


import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const app = createApp({
    name: 'Questions',
    data(){
        // Force loading of the specialized radiationQuestions set (questionSet == 1)
        if (questionSet == 1) {
            return{
                questions: radiationQuestions, // INJECTING NEW DATA HERE
                items: [{prize: 100}, {prize: 200}, {prize: 300}, {prize: 500}, {prize: 1000}, {prize: 2000}, {prize: 4000}, {prize: 8000}, {prize: 16000}, {prize: 32000}, {prize: 64000}, {prize: 125000}, {prize: 250000}, {prize: 500000}, {prize: 1000000}]
            }
        } else {
            // Fallback: If for some reason questionSet isn't 1, provide the structure
            // NOTE: This prevents randomizer issues from crashing the app, though it's not the goal.
             return{
                questions: radiationQuestions,
                items: [{prize: 100}, {prize: 200}, {prize: 300}, {prize: 500}, {prize: 1000}, {prize: 2000}, {prize: 4000}, {prize: 8000}, {prize: 16000}, {prize: 32000}, {prize: 64000}, {prize: 125000}, {prize: 250000}, {prize: 500000}, {prize: 1000000}]
            }
        }
    },
    state: {
        questionNumber: 0,
    },
    methods: {

        // build the game functionality
        buildGame() {

            let questions = document.querySelectorAll('.questions');
            let questionNumber = 0;
            // Updated prizes to match standard Millionaire track, 15 levels.
            let prizes = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
            // Safe prizes correspond to $1,000, $32,000, and $1,000,000
            let safePrizes = [1000, 32000, 1000000];
            let progress = document.querySelectorAll('.progress');
            let infoPanel = document.querySelector('#infoPanel');
            let safePrize = '£0';
            let nextQuestion;
            let questionDifficulty = 1;
            const takeTheMoneyButton = document.querySelector('#takeTheMoney');
            let randA;
            const pfClose = document.querySelector('#phoneAfriendBG .closeButton');
            const aaClose = document.querySelector('#askAudienceBG .closeButton');

            setTimeout(function() {
                let current = document.querySelector('.progress.active.current');
                let currentPrize = current.querySelector('.prize').innerHTML;

                infoPanel.innerHTML = 'For <div class="potentialPrize">' + currentPrize + '</div> select the correct answer from the 4 choices below';
            }, 1);


            // check what the current question should be
            function checkQuestion() {

                questions.forEach(function(e, i) {
                    if (i == questionNumber) {
                        e.classList.add('active');
                    }
                });

            };
            checkQuestion();


            // check what progress level the player is at
            function checkProgress() {

                progress.forEach(function(e, i) {

                    e.classList.add('active');

                    if (e.querySelector('.qNum').innerHTML == questionNumber + 1) {
                        e.classList.add('current');
                    }
                    
                    // Check against the updated safe prize values
                    if (e.querySelector('.prize').innerHTML == '£1000' || e.querySelector('.prize').innerHTML == '£32000' || e.querySelector('.prize').innerHTML == '£1000000') {
                        e.classList.add('safe');
                    }

                });

            };
            checkProgress();


            // update the game after each correct question answer
            function updateGame() {

                questionNumber++;
                questionDifficulty++;

                let current = document.querySelector('.progress.active.current');
                let currentPrize = current.querySelector('.prize').innerHTML;
                current.classList.remove('current');

                let active = document.querySelector('.questions.active');
                active.classList.remove('active');

                takeTheMoneyButton.classList.add('active');

                checkQuestion();

                checkProgress();

                current = document.querySelector('.progress.active.current');
                currentPrize = current.querySelector('.prize').innerHTML;

                // 14 is the index for the final question
                if (questionNumber != 14) {
                    infoPanel.innerHTML = 'For <div class="potentialPrize">' + currentPrize + '</div> select the correct answer from the 4 choices below or';
                } else {
                    infoPanel.innerHTML = 'This is it the final question, for <div class="potentialPrize">' + currentPrize + '</div> Select your answer from the 4 choices below or';
                }

            };


            // Answer selected functionality
            function answerClick() {

                questions.forEach(function(q) {

                    let answer = q.querySelectorAll('.answer');
                    let currentQuestion = q.querySelector('.correctAnswer');

                    answer.forEach(function(e, i) {

                        e.addEventListener('click', function() {

                            e.classList.add('clicked');

                            takeTheMoneyButton.classList.remove('active');

                            answer.forEach(function(a, i) {
                                a.classList.add('disabled');
                            });

                            if (sound === 1) {
                                waitAudio.play();
                            }

                            setTimeout(function() {

                                // Check if correct and NOT the final question (index 14)
                                if (e.querySelector('.questionLetter').innerHTML == currentQuestion.innerHTML && questionNumber != 14) {

                                    e.classList.add('right');

                                    let current = document.querySelector('.progress.current');
                                    current.classList.add('answered');

                                    setTimeout(function() {
                                        if (sound === 1) {
                                            correctEasyAnswerAudio.play();
                                        }
                                    }, 200);

                                    setTimeout(function() {
                                        infoPanel.innerHTML = "Well done that's the correct answer <button class='next'>Next Question</button>";

                                        nextQuestion = document.querySelector('.next');

                                        nextQuestion.addEventListener('click', function() {

                                            updateGame();

                                            answer.forEach(function(a, i) {
                                                a.classList.remove('disabled');
                                            });

                                        });

                                    }, 1000);

                                    let storeSafePrize = document.querySelector('.progress.safe.current.answered');

                                    if (storeSafePrize) {
                                        safePrize = storeSafePrize.querySelector('.prize').innerHTML;
                                    }

                                    if (sound === 1) {
                                        musicAudio.play();
                                    }

                                } else if (questionNumber == 14 && e.querySelector('.questionLetter').innerHTML == currentQuestion.innerHTML) {
                                    // Player wins the million! (Index 14)
                                    let current = document.querySelector('.progress.active.current');
                                    let currentPrize = current.querySelector('.prize').innerHTML;
                                    const removeQuestion = document.querySelector('.questions.active');
                                    
                                    // Mark the last question as answered
                                    current.classList.add('answered'); 
                                    
                                    infoPanel.classList.add('bigTakeover');
                                    infoPanel.innerHTML = "Congratulations you've just won <div class='potentialPrize'>" + currentPrize + "</div> Well done. <button class='restart'>Play again</button>";

                                    removeQuestion.remove();

                                    let restartButton = document.querySelector('.restart');
                                    restartButton.addEventListener('click', function() {
                                        history.go(0);
                                    });

                                    if (sound === 1) {
                                        musicAudio.pause();
                                        winAudio.play();
                                    }


                                } else {
                                    // Wrong Answer

                                    e.classList.add('wrong');
                                    
                                    // Find and highlight the correct answer
                                    answer.forEach(function(a) {
                                        if (a.querySelector('.questionLetter').innerHTML == currentQuestion.innerHTML) {
                                            a.classList.add('right');
                                        }
                                    });

                                    if (sound === 1) {
                                        musicAudio.pause();

                                        setTimeout(function() {
                                            WrongAnswerAudio.play();
                                        }, 200);
                                    }

                                    setTimeout(function() {
                                        infoPanel.innerHTML = "I'm very sorry that's incorrect, you leave with <div class='leaveWith'></div> <button class='restart'>Play again</button>";

                                        let leaveWith = document.querySelector('.leaveWith');
                                        leaveWith.innerHTML = safePrize;

                                        let restartButton = document.querySelector('.restart');
                                        restartButton.addEventListener('click', function() {
                                            history.go(0);
                                        });

                                    }, 5000); // Increased timeout to see the correct answer highlight

                                }

                            }, 5000);


                        });

                    });
                });

            };
            answerClick();


            // take the money functionality
            function takeTheMoneyClick() {

                const currentQuestion = document.querySelector('.questions.active');
                const currentAnswers = currentQuestion.querySelectorAll('.answer');
                const correctAnswer = currentQuestion.querySelector('.correctAnswer').innerHTML;
                
                // Find the previous safe haven prize (answered and safe)
                const previousSafe = document.querySelector('.progress.answered.safe:not(.current)');
                const takeHomeValue = previousSafe ? previousSafe.querySelector('.prize').innerHTML : '£0';
                
                const lifeLines = document.querySelectorAll('.lifeLine');

                takeTheMoneyButton.remove();

                currentAnswers.forEach(function(a, i) {

                    if (a.querySelector('.questionLetter').innerHTML == correctAnswer) {
                        a.classList.add('right');
                    } else {
                        a.classList.add('disabled');
                    }

                });

                lifeLines.forEach(function(l, i) {
                    l.classList.add('disabled');
                });

                infoPanel.classList.add('bigTakeover');

                let bigTakeover = document.querySelector('.bigTakeover');
                bigTakeover.innerHTML = "You chose to take the money, congratulations you leave with <div class='leaveWith'></div> <button class='restart'>Play again</button>";

                if (questionNumber < 5) {
                    if (sound === 1) {
                        correctEasyAnswerAudio.play();
                    }
                } else if (questionNumber >= 5 && questionNumber < 10) {
                    if (sound === 1) {
                        correctHardAnswerAudio.play();
                    }
                } else {
                    if (sound === 1) {
                        winAudio.play();
                    }
                }

                const leaveWith = document.querySelector('.leaveWith');
                leaveWith.innerHTML = takeHomeValue;

                let restartButton = document.querySelector('.restart');
                restartButton.addEventListener('click', function() {
                    history.go(0);
                });

            };

            takeTheMoneyButton.addEventListener('click', function(ttm) {
                if (questionNumber > 0) { // Only allow taking money after the first question
                    takeTheMoneyClick();
                }
            });


            // 50/50 funtionality
            function Fifty50() {
                const lifeLine1 = document.querySelector('.ll1');
                let llArray = []

                lifeLine1.addEventListener('click', function(e) {

                    lifeLine1.classList.add('disabled');

                    if (sound === 1) {
                        fifty50Audio.play();
                    }

                    setTimeout(function() {

                        let currentQuestion = document.querySelector('.questions.active');

                        const currentCorrectAnswer = currentQuestion.querySelector('.correctAnswer');
                        const currentAnswers = currentQuestion.querySelectorAll('.answer');

                        currentAnswers.forEach(function(a) {

                            if (a.querySelector('.questionLetter').innerHTML == currentCorrectAnswer.innerHTML) {
                                a.classList.add('ll1a');
                            }

                        });

                        let rn = randomiser(1, 3);
                        let currentAnswer = currentQuestion.querySelectorAll('.answer:not(.ll1a)');

                        for (let i = 0; i < currentAnswer.length; i++) {

                            if (i + 1 == rn) {
                                currentAnswer[i].classList.add('ll1b');
                            }

                        };

                        let removeAnswers = currentQuestion.querySelectorAll('.answer:not(.ll1a, .ll1b)');

                        removeAnswers.forEach(function(d) {
                            d.classList.add('disabled');
                        });

                    }, 1700);

                });
            };
            Fifty50();


            // phone a friend functionality
            function phoneAfriend() {

                const lifeLine2 = document.querySelector('.ll2');
                const friends = document.querySelector('.friends');
                const friend = friends.querySelectorAll('.friend');

                lifeLine2.addEventListener('click', function(e) {

                    lifeLine2.classList.add('disabled');

                    const currentQuestion = document.querySelector('.questions.active');
                    const correctAnswer = currentQuestion.querySelector('.correctAnswer').innerHTML;
                    const currentAnswers = currentQuestion.querySelectorAll('.answer:not(.disabled)');
                    // Fetch the correct category number from the question data
                    const currentQuestionType = currentQuestion.querySelector('.answerTypeNumber').innerHTML;
                    let friendInfo = document.querySelector('.friendInfo');

                    friend.forEach(function(f) {
                        let fName = f.querySelector('.fName');

                        f.addEventListener('click', function() {

                            if (sound === 1) {
                                phoneAudio.play();
                            }

                            f.classList.add('selected');

                            friend.forEach(function(fc) {

                                fc.classList.add('disabled');

                                if (fc.classList.contains('selected')) {


                                    const fSelectedName = fc.querySelector('.fName').innerHTML;
                                    const fSelectedNumber = fc.querySelector('.fTypeNumber').innerHTML;
                                    const fCorrect = "I believe the answer is <div class='fAnswer'>" + correctAnswer + "</div>";
                                    let answersRest = [];

                                    // Updated randomizer to match the 1-6 range provided in the original friend logic description
                                    randA = randomiser(1, 6);

                                    function friendChance(chance) {
                                        // Original logic: chance 5 (83.33%), chance 3 (50%), chance 1 (16.67%)
                                        if (randA <= chance) {

                                            setTimeout(function() {
                                                friendInfo.innerHTML = fCorrect;
                                                highlightFriendsAnswer();
                                                pfClose.classList.add('active');
                                            }, 2000);

                                        } else {

                                            for (let i = 0; i < currentAnswers.length; i++) {

                                                if (currentAnswers[i].querySelector('.questionLetter').innerHTML != correctAnswer) {
                                                    answersRest.push(currentAnswers[i].querySelector('.questionLetter').innerHTML);
                                                }

                                            };
                                            
                                            // Fallback for 50/50 case where only 1 wrong answer remains
                                            if (answersRest.length === 0) {
                                                // If all remaining answers are correct (shouldn't happen with correct logic) or only correct remains, just give the correct answer.
                                                // For robustness, we will assume this is a scenario where the friend is forced to guess correctly if no wrong answer exists.
                                                var wrongAnswer = correctAnswer;
                                            } else {
                                                let randomGuess = randomiser(0, answersRest.length - 1);
                                                var wrongAnswer = answersRest[randomGuess];
                                            }
                                            

                                            const fIncorrect = "I believe the answer is <div class='fAnswer'>" + wrongAnswer + "</div>";

                                            setTimeout(function() {
                                                friendInfo.innerHTML = fIncorrect;
                                                highlightFriendsAnswer();
                                                pfClose.classList.add('active');
                                            }, 2000);

                                        }
                                    };

                                    // All-Rounder RSO Fuller (Number 99 in HTML) gets a 50% chance (3/6)
                                    if (fSelectedNumber == 99) {
                                        friendChance(3);
                                        setTimeout(function() {
                                            fc.classList.add('clicked5050');
                                        }, 2000);
                                    // Expert Colleagues get 83% chance (5/6)
                                    } else if (fSelectedNumber == currentQuestionType) {
                                        friendChance(5);
                                        setTimeout(function() {
                                            fc.classList.add('clickedCorrect');
                                        }, 2000);

                                    } else {
                                        // Non-expert Colleagues get 16% chance (1/6)
                                        friendChance(1);
                                        setTimeout(function() {
                                            fc.classList.add('clickedWrong');
                                        }, 2000);
                                    }


                                    function highlightFriendsAnswer() {

                                        currentAnswers.forEach(function(ca) {

                                            const fAnswer = document.querySelector('.fAnswer');

                                            if (ca.querySelector('.questionLetter').innerHTML == fAnswer.innerHTML) {
                                                ca.classList.add('friendsAnswer');
                                            }

                                        });

                                    }


                                } else {
                                    // fc.classList.add('disabled');
                                }

                            });

                        });

                    });

                    const askAudienceOverlay = document.querySelector('#phoneAfriendBG');
                    askAudienceOverlay.style.display = 'flex';

                });

                pfClose.addEventListener('click', function(e) {

                    const askAudienceOverlay = document.querySelector('#phoneAfriendBG');
                    askAudienceOverlay.style.display = 'none';

                    if (sound === 1) {
                        friendAudio.pause();
                        musicAudio.play();
                    }

                });

            };
            phoneAfriend();


            // ask the audience functionality
            function AskAudience() {
                let lifeLine3 = document.querySelector('.ll3');

                lifeLine3.addEventListener('click', function(e) {

                    lifeLine3.classList.add('disabled');

                    const currentQuestion = document.querySelector('.questions.active');
                    let currentAnswer = currentQuestion.querySelectorAll('.answer');
                    const currentCorrectAnswer = currentQuestion.querySelector('.correctAnswer').innerHTML;
                    let aaBars = document.querySelectorAll('.aaQ');

                    currentAnswer.forEach(function(ca, i) {
                        if (ca.classList.contains('disabled')) {
                            aaBars[i].classList.add('disabled');
                        }
                    });

                    let A = 'A';
                    let B = 'B';
                    let C = 'C';
                    let D = 'D';

                    let Anum = 0;
                    let Bnum = 0;
                    let Cnum = 0;
                    let Dnum = 0;

                    let correctLetter;
                    let restLetters = [];
                    let correctNum;
                    let restNum = [];
                    let aaEnabledBars = document.querySelectorAll('.aaQ:not(.disabled)');
                    let aaDisabledBars = document.querySelectorAll('.aaQ.disabled');
                    let aaDisabledLeftOver = 0;

                    if (sound === 1) {
                        audienceAudio.play();
                    }

                    for (let i = 0; i < aaBars.length; ++i) {
                        let barsLetter = aaBars[i].querySelector('.aaLetter');

                        if (barsLetter.innerHTML == currentCorrectAnswer) {
                            correctLetter = barsLetter.innerHTML;
                            correctNum = 0;
                        } else {
                            restLetters.push(barsLetter.innerHTML);
                            restNum.push(0);
                        }

                    }

                    for (let i = 0; i < 100; i++) {
                        // Use questionDifficulty to make correct bar harder on later questions
                        if (questionDifficulty <= 2) {
                            randA = randomiser(1, 7);
                        } else if (questionDifficulty > 2 && questionDifficulty <= 7) {
                            randA = randomiser(1, 6);
                        } else if (questionDifficulty > 7 && questionDifficulty < 11) {
                            randA = randomiser(1, 5);
                        } else {
                            randA = randomiser(1, 4.2);
                        }


                        if (randA == 1) {
                            restNum[0]++;
                        } else if (randA == 2) {
                            restNum[1]++;
                        } else if (randA == 3) {
                            restNum[2]++;
                        } else {
                            correctNum++;
                        }

                    }

                    aaBars.forEach(function(cb){

                        let aaBarLetter = cb.querySelector('.aaLetter');
                        let aaBar = cb.querySelector('.aaBars');
                        let aaPercentage = cb.querySelector('.percentage');

                        for (let i = 0; i < restLetters.length; i++) {

                            if (aaBarLetter.innerHTML == restLetters[i]) {

                                if (cb.classList.contains('disabled')) {
                                    aaDisabledLeftOver = aaDisabledLeftOver + restNum[i];

                                    aaPercentage.innerHTML = 0;
                                    aaBar.style.height = 0;
                                }

                                if (!cb.classList.contains('disabled')) {

                                    setTimeout(function() {
                                        aaBar.style.height = restNum[i] + '%';
                                        aaPercentage.innerHTML = restNum[i];
                                    }, 4000);

                                }

                            }

                        }

                        if (aaBarLetter.innerHTML == correctLetter) {

                            setTimeout(function() {
                                correctNum = correctNum + aaDisabledLeftOver;

                                aaBar.style.height = correctNum + '%';
                                aaPercentage.innerHTML = correctNum;
                            }, 4000);


                        }

                    });

                    setTimeout(function() {
                        aaClose.classList.add('active');
                    }, 5000);

                    const askAudienceOverlay = document.querySelector('#askAudienceBG');
                    askAudienceOverlay.style.display = 'flex';

                });


                aaClose.addEventListener('click', function(e) {

                    const askAudienceOverlay = document.querySelector('#askAudienceBG');
                    askAudienceOverlay.style.display = 'none';

                });
            };
            AskAudience();

        },

    },
    mounted() {

        // build the game once everything is mounted
        this.buildGame()

    }

}).mount('#game');
