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
        answerQuestion(index) {
            if (index === this.currentQuestion.correctIndex) {
                this.correctAnswers++;
                this.currentQuestionIndex++;
                if (this.currentQuestionIndex >= this.questions.length) {
                    this.endGame();
                }
            } else {
                this.endGame();
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
        async endGame() {
            clearInterval(this.interval);
            this.gameOver = true;
            await this.savePlayerStats();
        },
        async savePlayerStats() {
            const playerStats = {
                name: this.playerName,
                correctAnswers: this.correctAnswers,
                time: this.formattedTime
            };
            try {
                let leaderboard = [];
                const response = await fetch('playerStats.json');
                if (response.ok) {
                    leaderboard = await response.json();
                }
                leaderboard.push(playerStats);
                leaderboard.sort((a, b) => {
                    if (a.correctAnswers === b.correctAnswers) {
                        return a.time.localeCompare(b.time);
                    }
                    return b.correctAnswers - a.correctAnswers;
                });
                const saveResponse = await fetch('playerStats.json', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(leaderboard)
                });
                if (!saveResponse.ok) {
                    throw new Error('Failed to save player stats');
                }
                this.leaderboard = leaderboard;
            } catch (error) {
                console.error('Error saving player stats:', error);
            }
        },
        async loadLeaderboard() {
            try {
                const response = await fetch('playerStats.json');
                if (!response.ok) {
                    throw new Error('Failed to load leaderboard');
                }
                const leaderboard = await response.json();
                this.leaderboard = leaderboard.sort((a, b) => {
                    if (a.correctAnswers === b.correctAnswers) {
                        return a.time.localeCompare(b.time);
                    }
                    return b.correctAnswers - a.correctAnswers;
                });
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            }
        }
    },
    mounted() {
        this.loadLeaderboard();
    }
}).mount('#app');
