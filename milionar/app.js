const { createApp } = Vue;

createApp({
    data() {
        return {
            questions: [],
            currentQuestionIndex: 0,
            correctAnswers: 0,
            timer: 0,
            gameStarted: false,
            gameOver: false,
            interval: null,
            selectedLanguage: 'en',
            playerName: '',
            selectedAnswerIndex: null,
            confirmingAnswer: false,
            confirmationMessage: '',
            answerFeedback: '',
            questionVisible: false,
            correctAnswer: false,
            flicker: false,
            prizeLevels: [
                '£1,000,000', '£500,000', '£250,000', '£125,000', '£64,000',
                '£32,000', '£16,000', '£8,000', '£4,000', '£2,000',
                '£1,000', '£500', '£300', '£200', '£100',
                '£50', '£20', '£10', '£5', '£1'
            ],
            leaderboard: []
        };
    },
    computed: {
        currentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },
        formattedTime() {
            const hours = String(Math.floor(this.timer / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((this.timer % 3600) / 60)).padStart(2, '0');
            const seconds = String(this.timer % 60).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        },
        confirmationMessageText() {
            const messages = {
                en: "Are you sure this is your final answer?",
                si: "Ali ste prepričani, da je to vaš končni odgovor?"
            };
            return messages[this.selectedLanguage];
        }
    },
    methods: {
        async startGame() {
            try {
                this.questions = await this.loadQuestions();
                this.currentQuestionIndex = 0;
                this.correctAnswers = 0;
                this.timer = 0;
                this.gameStarted = true;
                this.gameOver = false;
                this.questionVisible = false;
                this.answerFeedback = '';
                this.selectedAnswerIndex = null;
                this.correctAnswer = false;
                this.interval = setInterval(() => {
                    this.timer++;
                }, 1000);
            } catch (error) {
                console.error("Error starting game:", error);
            }
        },
        async loadQuestions() {
            const questions = [];
            for (let i = 1; i <= 20; i++) {
                try {
                    const response = await fetch(`questions/${this.selectedLanguage}/${i}.json`);
                    if (!response.ok) {
                        throw new Error(`Failed to load questions/${this.selectedLanguage}/${i}.json`);
                    }
                    const questionSet = await response.json();
                    const randomQuestion = questionSet[Math.floor(Math.random() * questionSet.length)];
                    questions.push(randomQuestion);
                } catch (error) {
                    console.error("Error loading questions:", error);
                }
            }
            return questions;
        },
        selectPrize(index) {
            if (this.currentQuestionIndex === 19 - index) {
                this.questionVisible = true;
            }
        },
        selectAnswer(index) {
            this.selectedAnswerIndex = index;
            this.confirmationMessage = this.confirmationMessageText;
            this.confirmingAnswer = true;
        },
        confirmAnswer(isConfirmed) {
            if (isConfirmed) {
                this.evaluateAnswer();
                this.confirmingAnswer = false;
            } else {
                this.confirmingAnswer = false;
                this.selectedAnswerIndex = null;
            }
        },
        evaluateAnswer() {
            const correctIndex = this.currentQuestion.correctIndex;
            this.flicker = true;
            setTimeout(() => {
                this.flicker = false;
                if (this.selectedAnswerIndex === correctIndex) {
                    this.correctAnswer = true;
                    this.answerFeedback = `<span class="text-green-500 font-bold">Correct!</span> ${this.currentQuestion.explanation}`;
                    this.$nextTick(() => {
                        document.querySelectorAll('.option-button')[this.selectedAnswerIndex].classList.add('correct');
                    });
                    this.correctAnswers++;
                } else {
                    this.correctAnswer = false;
                    this.answerFeedback = `<span class="text-red-500 font-bold">Incorrect.</span> ${this.currentQuestion.explanation}`;
                    this.$nextTick(() => {
                        document.querySelectorAll('.option-button')[this.selectedAnswerIndex].classList.add('incorrect');
                    });
                    setTimeout(() => {
                        this.endGame();
                    }, 3000); // Delay to show incorrect answer before ending game
                }
            }, 1500); // Delay to show flicker effect
        },
        nextQuestion() {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex >= this.questions.length) {
                this.endGame();
            } else {
                this.questionVisible = false;
                this.answerFeedback = '';
                this.correctAnswer = false;
                this.selectedAnswerIndex = null;
            }
        },
        restartGame() {
            if (this.gameStarted) {
                this.endGame();
            }
            this.gameStarted = false;
            this.gameOver = false;
            clearInterval(this.interval);
        },
        getOptionLetter(index) {
            return String.fromCharCode(65 + index);
        },
        endGame() {
            clearInterval(this.interval);
            this.gameOver = true;
            this.savePlayerStats();
        },
        savePlayerStats() {
            const playerStats = {
                name: this.playerName,
                correctAnswers: this.correctAnswers,
                time: this.formattedTime
            };
            let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            leaderboard.push(playerStats);
            leaderboard.sort((a, b) => {
                if (a.correctAnswers === b.correctAnswers) {
                    return a.time.localeCompare(b.time);
                }
                return b.correctAnswers - a.correctAnswers;
            });
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
            this.leaderboard = leaderboard;
        },
        loadLeaderboard() {
            const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
            this.leaderboard = leaderboard.sort((a, b) => {
                if (a.correctAnswers === b.correctAnswers) {
                    return a.time.localeCompare(b.time);
                }
                return b.correctAnswers - a.correctAnswers;
            });
        }
    },
    mounted() {
        this.loadLeaderboard();
    }
}).mount('#app');
