const { createApp } = Vue;

createApp({
    data() {
        return {
            playerName: '',
            keys: [],
            currentKey: '',
            correctKeys: [],
            wrongKeys: [],
            correctCount: 0,
            wrongCount: 0,
            timeLeft: 10,
            customTime: 10,
            gameInterval: null,
            wrongKey: '',
            isShiftPressed: false,
            isGameOver: false,
            gameStarted: false,
            currentLevel: 1,
            scoreboard: [],
            selectedColor: '#ffff00',
            selectedFont: 'Arial',
            keysToPress: 10,
        };
    },
    computed: {
        displayedKeys() {
            if (this.isShiftPressed) {
                return this.keys.map(row => 
                    row.map(key => ({
                        ...key,
                        display: this.getShiftedKey(key.char)
                    }))
                );
            } else {
                return this.keys;
            }
        },
        correctPercentage() {
            return (this.correctCount / (this.correctCount + this.wrongCount)) * 100;
        }
    },
    methods: {
        async loadKeys() {
            const response = await fetch('keys.json');
            this.keys = await response.json();
        },
        startGame() {
            if (this.playerName.trim() === '') {
                alert('Please enter your name');
                return;
            }
            this.keysToPress = 10 + (this.currentLevel - 1) * 3;
            this.timeLeft = this.keysToPress * 2;
            this.resetGame();
            this.gameStarted = true;
            this.nextKey();
            this.gameInterval = setInterval(this.tick, 1000);
        },
        resetGame() {
            this.correctCount = 0;
            this.wrongCount = 0;
            this.correctKeys = [];
            this.wrongKeys = [];
            this.wrongKey = '';
            this.isGameOver = false;
            clearInterval(this.gameInterval);
        },
        restartGame() {
            this.saveScore();
            this.resetGame();
            this.startGame();
        },
        nextLevel() {
            this.saveScore();
            this.currentLevel++;
            this.keysToPress = 10 + (this.currentLevel - 1) * 3;
            this.timeLeft = this.keysToPress * 2;
            this.resetGame();
            this.startGame();
        },
        nextKey() {
            let availableKeys = this.keys.flat().filter(key => !key.locked);
            const randomIndex = Math.floor(Math.random() * availableKeys.length);
            this.currentKey = availableKeys[randomIndex].char;
            this.wrongKey = '';
        },
        handleKeyPress(event) {
            if (this.timeLeft > 0) {
                const pressedKey = event.key;

                if (event.key === 'Shift') {
                    this.isShiftPressed = true;
                } else if (this.isShiftPressed) {
                    const shiftedKey = this.getShiftedKey(pressedKey);
                    this.processKeyPress(shiftedKey);
                    this.isShiftPressed = false;
                } else {
                    this.processKeyPress(pressedKey);
                }
            }
        },
        getShiftedKey(key) {
            const shiftKeys = {
                '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
                '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
            };
            return shiftKeys[key] || key.toUpperCase();
        },
        processKeyPress(pressedKey) {
            if (pressedKey === this.currentKey) {
                this.correctCount += 2;
                this.correctKeys.push(pressedKey);
                this.nextKey();
            } else {
                this.wrongCount++;
                this.wrongKeys.push(pressedKey);
                this.wrongKey = pressedKey;
                setTimeout(() => {
                    this.wrongKey = '';
                    this.nextKey();
                }, 500); // Highlight wrong key for 500ms
            }
        },
        tick() {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                clearInterval(this.gameInterval);
                this.isGameOver = true;
            }
        },
        toggleLock(key) {
            key.locked = !key.locked;
        },
        saveScore() {
            const newScore = { name: this.playerName, score: this.correctCount };
            this.scoreboard.push(newScore);
            this.scoreboard.sort((a, b) => b.score - a.score);
            if (this.scoreboard.length > 20) {
                this.scoreboard.pop();
            }
            localStorage.setItem('scoreboard', JSON.stringify(this.scoreboard));
        },
        loadScoreboard() {
            const savedScoreboard = localStorage.getItem('scoreboard');
            if (savedScoreboard) {
                this.scoreboard = JSON.parse(savedScoreboard);
            }
        },
        pressEffect(event) {
            const keyElement = event.target;
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 200);
        },
        getKeyStyle(key) {
            return {
                width: key.width ? key.width + 'px' : '60px',
                backgroundColor: key.char === this.currentKey ? this.selectedColor : '',
                fontFamily: this.selectedFont
            };
        }
    },
    async mounted() {
        await this.loadKeys();
        this.loadScoreboard();
        window.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.isShiftPressed = false;
            }
        });
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('keyup', this.handleKeyPress);
        clearInterval(this.gameInterval);
    }
}).mount('#app');
