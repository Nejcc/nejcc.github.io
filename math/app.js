const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            playerName: '',
            players: JSON.parse(localStorage.getItem('players')) || [],
            currentPlayer: JSON.parse(localStorage.getItem('currentPlayer')) || null,
            currentExam: null,
            exampleType: '',
            examResults: null,
            level: 0,
            timer: 60,
            interval: null,
            currentQuestionIndex: 0,
        };
    },
    computed: {
        sortedPlayers() {
            return [...this.players].sort((a, b) => b.score - a.score || b.level - a.level);
        },
        timerWidth() {
            return `${(this.timer / 60) * 100}%`;
        },
        currentQuestion() {
            return this.currentExam.questions[this.currentQuestionIndex];
        }
    },
    methods: {
        addPlayer() {
            if (this.playerName.trim()) {
                const newPlayer = { id: Date.now(), name: this.playerName.trim(), score: 0, level: 1 };
                this.players.push(newPlayer);
                this.savePlayers();
                this.setCurrentPlayer(newPlayer);
                this.playerName = '';
            }
        },
        savePlayers() {
            localStorage.setItem('players', JSON.stringify(this.players));
        },
        setCurrentPlayer(player) {
            this.currentPlayer = player;
            localStorage.setItem('currentPlayer', JSON.stringify(player));
        },
        logout() {
            this.currentPlayer = null;
            localStorage.removeItem('currentPlayer');
        },
        selectExampleType(player) {
            this.setCurrentPlayer(player);
            this.currentExam = null;
            this.examResults = null;
            this.currentQuestionIndex = 0;
        },
        startExam(type) {
            this.exampleType = type;
            this.generateExam();
            this.startTimer();
        },
        generateExam() {
            const numberOfQuestions = 5 + this.currentPlayer.level;
            const operations = this.getOperations(this.exampleType);
            this.currentExam = {
                questions: Array.from({ length: numberOfQuestions }, () => {
                    const num1 = Math.floor(Math.random() * (10 + this.currentPlayer.level));
                    const num2 = Math.floor(Math.random() * (10 + this.currentPlayer.level));
                    const operation = operations[0];
                    const correctAnswer = this.solve(num1, num2, operation);
                    const options = this.generateOptions(correctAnswer);
                    const text = `${num1} ${operation} ${num2}`;
                    return { text, answer: null, correctAnswer, options };
                })
            };
            console.log('Generated Exam:', this.currentExam);
        },
        getOperations(type) {
            const operations = {
                'addition': ['+'],
                'subtraction': ['-'],
                'multiplication': ['*'],
                'division': ['/']
            };
            return operations[type];
        },
        generateOptions(correctAnswer) {
            let options = new Set([correctAnswer]);
            while (options.size < 4) {
                const option = correctAnswer + Math.floor(Math.random() * 21 - 10); // Random number between -10 and 10
                if (option >= 0) { // Ensure positive options
                    options.add(option);
                }
            }
            return Array.from(options).sort(() => Math.random() - 0.5);
        },
        solve(num1, num2, operation) {
            switch (operation) {
                case '+': return num1 + num2;
                case '-': return num1 - num2;
                case '*': return num1 * num2;
                case '/': return num2 !== 0 ? num1 / num2 : 0;
            }
        },
        selectAnswer(option) {
            this.currentQuestion.answer = option;
            this.nextQuestion();
        },
        nextQuestion() {
            if (this.currentQuestionIndex < this.currentExam.questions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.submitExam();
            }
        },
        submitExam() {
            clearInterval(this.interval); // Stop the timer
            let score = 0;
            const correctSound = document.getElementById('correct-sound');
            const incorrectSound = document.getElementById('incorrect-sound');
            const questions = this.currentExam.questions.map(question => {
                const isCorrect = question.answer === question.correctAnswer;
                if (isCorrect) {
                    score++;
                    correctSound.play();
                } else {
                    incorrectSound.play();
                }
                return { ...question, isCorrect };
            });
            this.currentPlayer.score += score;
            this.currentPlayer.level++;
            this.savePlayers();
            this.examResults = { questions, score };
            this.currentExam = null;
            this.currentQuestionIndex = 0;
            this.saveResults();
        },
        finishExam() {
            this.currentPlayer = null;
            this.examResults = null;
            localStorage.removeItem('currentPlayer');
        },
        saveResults() {
            // Simulate saving to results.json by saving to localStorage
            localStorage.setItem('players', JSON.stringify(this.players));
        },
        nextPlayer() {
            this.finishExam();
            const nextPlayerIndex = this.players.findIndex(player => player.id === this.currentPlayer.id) + 1;
            this.setCurrentPlayer(this.players[nextPlayerIndex % this.players.length]);
        },
        newExample() {
            this.examResults = null;
            this.currentQuestionIndex = 0;
        },
        startTimer() {
            this.timer = 60; // Set the timer to 60 seconds
            this.interval = setInterval(() => {
                if (this.timer > 0) {
                    this.timer--;
                } else {
                    clearInterval(this.interval);
                    this.submitExam();
                }
            }, 1000);
        }
    },
    mounted() {
        // Placeholder to load players and results from JSON file
    }
});

app.mount('#app');
