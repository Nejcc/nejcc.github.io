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
            pointsPerCorrect: 10, // Points awarded per correct key press
            log: [], // Log of key presses
            layoutVerified: false, // Track if the keyboard layout is verified
            layoutCheckKeys: ['z', 'y', ';', ':', '+', "'"], // Keys to check for layout verification
            pressedLayoutKeys: [], // Keys pressed for layout verification
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
        },
        allKeysPressed() {
            return this.layoutCheckKeys.every(key => this.pressedLayoutKeys.includes(key));
        }
    },
    methods: {
        async loadKeys(layout) {
            const response = await fetch(`${layout}.json`);
            this.keys = await response.json();
        },
        startGame() {
            if (!this.layoutVerified) {
                return;
            }
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
            this.log = [];
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
            if (!this.layoutVerified) {
                this.checkLayout(event.key.toLowerCase());
                return;
            }
            if (this.timeLeft > 0) {
                const pressedKey = event.key.toLowerCase();

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
            if (pressedKey === this.currentKey.toLowerCase()) {
                this.correctCount++;
                this.correctKeys.push(pressedKey);
                this.log.push({ requested: this.currentKey, clicked: pressedKey, result: 'Correct' });
                this.nextKey();
                this.addPoints();
            } else {
                this.wrongCount++;
                this.wrongKeys.push(pressedKey);
                this.wrongKey = pressedKey;
                this.log.push({ requested: this.currentKey, clicked: pressedKey, result: 'Wrong' });
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
                this.showLogModal();
            }
        },
        toggleLock(key) {
            key.locked = !key.locked;
        },
        saveScore() {
            const newScore = { name: this.playerName, score: this.correctCount * this.pointsPerCorrect };
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
        },
        addPoints() {
            const points = this.correctCount * this.pointsPerCorrect;
            this.$set(this.scoreboard, this.scoreboard.length - 1, { name: this.playerName, score: points });
        },
        showLogModal() {
            const logModal = new bootstrap.Modal(document.getElementById('logModal'));
            logModal.show();
        },
        async checkLayout(key) {
            if (this.layoutCheckKeys.includes(key) && !this.pressedLayoutKeys.includes(key)) {
                this.pressedLayoutKeys.push(key);
            }
            if (this.allKeysPressed) {
                this.layoutVerified = true;
                let layout = 'english';
                if (this.pressedLayoutKeys.includes('z') && this.pressedLayoutKeys.includes('y') && this.pressedLayoutKeys.includes('+')) {
                    layout = 'slovenian';
                }
                await this.loadKeys(layout);
            }
        },
        checkKeyPressed(key) {
            return this.pressedLayoutKeys.includes(key);
        }
    },
    async mounted() {
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
