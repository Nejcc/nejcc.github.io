const { createApp } = Vue;

createApp({
    data() {
        return {
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            showHelp: false,
            showStatistics: false,
            showStartScreen: true,
            playerName: '',
            currentPlayerId: null,
            players: {},
            editingName: false,
            showingPlayerSelector: false,
            showingNewPlayerInput: false,
            newPlayerNameInput: '',
            isPulsing: false,
            showExplanation: false,
            selectedAnswerIndex: null,
            totalScore: 0,
            level: 1,
            points: 0,
            gamesPlayed: 0,
            bestScore: 0,
            averageScore: 0,
            achievements: [],
            scoreHistory: []
        };
    },
    computed: {
        currentQuestion() {
            return this.questions[this.currentQuestionIndex] || {};
        },
        totalQuestions() {
            return this.questions.length;
        },
        selectedAnswer() {
            return this.userAnswers[this.currentQuestionIndex];
        },
        correctAnswers() {
            return this.questions.reduce((count, question, index) => {
                return count + (this.userAnswers[index] === question.correctAnswer ? 1 : 0);
            }, 0);
        },
        incorrectAnswers() {
            return this.totalQuestions - this.correctAnswers;
        },
        scorePercentage() {
            return this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        },
        starsEarned() {
            const percentage = this.scorePercentage;
            if (percentage >= 90) return 5;
            if (percentage >= 75) return 4;
            if (percentage >= 60) return 3;
            if (percentage >= 50) return 2;
            return 1;
        },
        levelProgress() {
            return (this.points % 1000) / 10; // Progress to next level (every 1000 points = level up)
        }
    },
    methods: {
        async loadQuestions() {
            try {
                const response = await fetch('questions.json');
                this.questions = await response.json();
                this.userAnswers = new Array(this.questions.length).fill(null);
            } catch (error) {
                console.error('Napaka pri nalaganju vprašanj:', error);
                alert('Napaka pri nalaganju vprašanj. Preverite, da datoteka questions.json obstaja.');
            }
        },
        selectAnswer(answerIndex) {
            if (this.userAnswers[this.currentQuestionIndex] !== null) {
                return; // Already answered
            }
            
            this.selectedAnswerIndex = answerIndex;
            this.isPulsing = true;
            this.userAnswers[this.currentQuestionIndex] = answerIndex;
            
            // Pulse animation for 2 seconds, then show border and explanation
            setTimeout(() => {
                this.isPulsing = false;
                
                // Show explanation modal after border appears
                setTimeout(() => {
                    this.showExplanation = true;
                }, 500);
            }, 2000);
        },
        nextQuestion() {
            if (this.currentQuestionIndex < this.totalQuestions - 1) {
                this.currentQuestionIndex++;
                this.showHelp = false;
                this.resetQuestionState();
            }
        },
        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.showHelp = false;
                this.resetQuestionState();
            }
        },
        resetQuestionState() {
            this.isPulsing = false;
            this.showExplanation = false;
            this.selectedAnswerIndex = null;
            this.showHelp = false;
        },
        finishExam() {
            const score = this.scorePercentage;
            const pointsEarned = this.correctAnswers * 10 + (this.scorePercentage >= 90 ? 50 : 0);
            
            this.totalScore += pointsEarned;
            this.points += pointsEarned;
            this.gamesPlayed++;
            
            // Calculate level
            this.level = Math.floor(this.points / 1000) + 1;
            
            // Update best score
            if (score > this.bestScore) {
                this.bestScore = score;
            }
            
            // Update average score
            const scores = this.scoreHistory.map(s => s.score);
            scores.push(score);
            this.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            
            // Save to score history
            this.scoreHistory.push({
                playerName: this.playerName || 'Anonimen igralec',
                score: score,
                date: new Date().toLocaleDateString('sl-SI'),
                points: pointsEarned
            });
            
            // Keep only last 10 games
            if (this.scoreHistory.length > 10) {
                this.scoreHistory = this.scoreHistory.slice(-10);
            }
            
            // Check achievements
            this.checkAchievements(score);
            
            // Save to localStorage
            this.savePlayerData();
            
            this.showStatistics = true;
            this.showHelp = false;
            this.fireConfetti();
        },
        fireConfetti() {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
        },
        restartExam() {
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.questions.length).fill(null);
            this.showStatistics = false;
            this.showHelp = false;
            this.showStartScreen = false;
        },
        startExam() {
            this.showStartScreen = false;
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.questions.length).fill(null);
        },
        goToStartScreen() {
            this.showStartScreen = true;
            this.showStatistics = false;
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.questions.length).fill(null);
        },
        checkAchievements(score) {
            const newAchievements = [];
            
            // Achievement: First game
            if (this.gamesPlayed === 1 && !this.achievements.includes('first_game')) {
                newAchievements.push({ id: 'first_game', name: 'Prva igra', description: 'Dokončal si svojo prvo igro!' });
            }
            
            // Achievement: Perfect score
            if (score === 100 && !this.achievements.includes('perfect_score')) {
                newAchievements.push({ id: 'perfect_score', name: 'Popolno', description: 'Odgovoril si na vsa vprašanja pravilno!' });
            }
            
            // Achievement: 90%+
            if (score >= 90 && !this.achievements.includes('excellent')) {
                newAchievements.push({ id: 'excellent', name: 'Odlično', description: 'Dosegel si več kot 90%!' });
            }
            
            // Achievement: 10 games
            if (this.gamesPlayed === 10 && !this.achievements.includes('persistent')) {
                newAchievements.push({ id: 'persistent', name: 'Vztrajnost', description: 'Odigral si 10 iger!' });
            }
            
            // Achievement: Level 5
            if (this.level >= 5 && !this.achievements.includes('level_5')) {
                newAchievements.push({ id: 'level_5', name: 'Moстер', description: 'Dosegel si level 5!' });
            }
            
            newAchievements.forEach(ach => {
                if (!this.achievements.includes(ach.id)) {
                    this.achievements.push(ach.id);
                }
            });
            
            return newAchievements;
        },
        loadProgress() {
            // Load all players
            const savedPlayers = localStorage.getItem('examPlayers');
            if (savedPlayers) {
                this.players = JSON.parse(savedPlayers);
            }
            
            // Load current player ID
            const savedCurrentPlayer = localStorage.getItem('currentPlayerId');
            if (savedCurrentPlayer && this.players[savedCurrentPlayer]) {
                this.currentPlayerId = savedCurrentPlayer;
                this.loadPlayerData(savedCurrentPlayer);
            } else {
                // Load legacy single player data or create new
                const saved = localStorage.getItem('examProgress');
                if (saved) {
                    const progress = JSON.parse(saved);
                    if (progress.playerName) {
                        // Create player from legacy data
                        const playerId = this.createPlayerId(progress.playerName);
                        this.currentPlayerId = playerId;
                        this.playerName = progress.playerName;
                        this.loadPlayerDataFromLegacy(progress, playerId);
                    } else {
                        // First time user
                        this.initNewPlayer();
                    }
                } else {
                    this.initNewPlayer();
                }
            }
        },
        createPlayerId(name) {
            return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        initNewPlayer() {
            const playerId = this.createPlayerId('Nov igralec');
            this.currentPlayerId = playerId;
            this.playerName = '';
            this.resetPlayerStats();
            this.savePlayerData();
        },
        loadPlayerData(playerId) {
            const player = this.players[playerId];
            if (player) {
                this.playerName = player.name || '';
                this.points = player.points || 0;
                this.level = player.level || 1;
                this.gamesPlayed = player.gamesPlayed || 0;
                this.bestScore = player.bestScore || 0;
                this.averageScore = player.averageScore || 0;
                this.achievements = player.achievements || [];
                this.scoreHistory = player.scoreHistory || [];
                this.totalScore = player.totalScore || 0;
            }
        },
        loadPlayerDataFromLegacy(progress, playerId) {
            const player = {
                id: playerId,
                name: progress.playerName,
                points: progress.points || 0,
                level: progress.level || 1,
                gamesPlayed: progress.gamesPlayed || 0,
                bestScore: progress.bestScore || 0,
                averageScore: progress.averageScore || 0,
                achievements: progress.achievements || [],
                scoreHistory: progress.scoreHistory || [],
                totalScore: progress.totalScore || 0
            };
            this.players[playerId] = player;
            this.loadPlayerData(playerId);
            this.saveAllPlayers();
        },
        resetPlayerStats() {
            this.points = 0;
            this.level = 1;
            this.gamesPlayed = 0;
            this.bestScore = 0;
            this.averageScore = 0;
            this.achievements = [];
            this.scoreHistory = [];
            this.totalScore = 0;
        },
        savePlayerData() {
            if (!this.currentPlayerId) {
                this.initNewPlayer();
                return;
            }
            
            this.players[this.currentPlayerId] = {
                id: this.currentPlayerId,
                name: this.playerName,
                points: this.points,
                level: this.level,
                gamesPlayed: this.gamesPlayed,
                bestScore: this.bestScore,
                averageScore: this.averageScore,
                achievements: this.achievements,
                scoreHistory: this.scoreHistory,
                totalScore: this.totalScore
            };
            
            this.saveAllPlayers();
        },
        saveAllPlayers() {
            localStorage.setItem('examPlayers', JSON.stringify(this.players));
            if (this.currentPlayerId) {
                localStorage.setItem('currentPlayerId', this.currentPlayerId);
            }
        },
        savePlayerName() {
            this.editingName = false;
            if (!this.playerName.trim()) {
                this.playerName = '';
            }
            this.savePlayerData();
        },
        addNewPlayer() {
            this.showingNewPlayerInput = true;
            this.newPlayerNameInput = '';
            this.$nextTick(() => {
                const input = document.querySelector('input[type="text"][v-model="newPlayerNameInput"]');
                if (input) {
                    input.focus();
                }
            });
        },
        saveNewPlayer() {
            if (this.newPlayerNameInput && this.newPlayerNameInput.trim()) {
                // Save current player first
                this.savePlayerData();
                
                const playerId = this.createPlayerId(this.newPlayerNameInput.trim());
                this.currentPlayerId = playerId;
                this.playerName = this.newPlayerNameInput.trim();
                this.resetPlayerStats();
                this.savePlayerData();
                this.showingPlayerSelector = false;
                this.showingNewPlayerInput = false;
                this.newPlayerNameInput = '';
            }
        },
        switchPlayer(playerId) {
            this.savePlayerData(); // Save current player first
            this.currentPlayerId = playerId;
            this.loadPlayerData(playerId);
            this.saveAllPlayers();
            this.showingPlayerSelector = false;
        },
        getPlayerList() {
            return Object.values(this.players).sort((a, b) => {
                // Sort by points descending
                return (b.points || 0) - (a.points || 0);
            });
        },
        editPlayerName() {
            this.editingName = true;
            // Auto-focus on input after Vue updates
            this.$nextTick(() => {
                const input = document.querySelector('input[type="text"][v-model="playerName"]');
                if (input) {
                    input.focus();
                    input.select();
                }
            });
        },
        getTopScores() {
            return this.scoreHistory
                .slice()
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
        }
    },
    mounted() {
        this.loadQuestions();
        this.loadProgress();
    }
}).mount('#app');

