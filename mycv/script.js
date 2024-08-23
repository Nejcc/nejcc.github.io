// script.js
const { createApp, nextTick } = Vue;

createApp({
    data() {
        return {
            displayedText: '',
            isTyping: false,
            currentStep: 0,
            currentIndex: 0,
            showIntro: true,
            hasShownIntro: false,
            currentInput: '',
            suggestedCommand: '',
            commandHistory: [],
            historyIndex: -1,
            commands: [],
            availableCommands: [
                { name: 'help', description: 'Displays the list of available commands and their descriptions.' },
                { name: 'about', description: 'Provides information about who I am and what I do.' },
                { name: 'skills', description: 'Lists my technical skills and proficiencies.' },
                { name: 'experience', description: 'Details my professional experience.' },
                { name: 'projects', description: 'Showcases my portfolio projects.' },
                { name: 'contact', description: 'Displays my contact information.' },
                { name: 'languages', description: 'Lists languages I speak and my proficiency level.' },
                { name: 'certifications', description: 'Displays my certifications.' },
                { name: 'clear', description: 'Clears the terminal screen.' },
                { name: 'show profile', description: 'Displays the profile.txt content as ASCII art.' }
            ],
            profileContent: '',
            currentStory: [
                { "text": "Hi!...", "delay": 1000 },
                { "text": "I am nobody...", "delay": 1000 },
                { "text": "But I have something unique for you...", "delay": 1000 },
                { "text": "In this journey, \n you will not just discover \n who I am, \n but also learn the rules \n I live by...", "delay": 1000 },
                { "text": "Follow the instructions carefully.", "delay": 1000 }
            ],
        };
    },
    computed: {
        ghostedSuggestion() {
            return this.suggestedCommand.slice(this.currentInput.length);
        }
    },
    mounted() {
        this.loadProfile();
        if (!this.hasShownIntro) {
            this.typeText();
        } else {
            this.switchToTerminal();
        }
    },
    updated() {
        nextTick(() => {
            this.scrollToBottom();
        });
    },
    methods: {
        async loadProfile() {
            try {
                const response = await fetch('profile.txt');
                if (response.ok) {
                    this.profileContent = await response.text();
                } else {
                    console.error('Failed to load profile.txt');
                }
            } catch (error) {
                console.error('Error loading profile.txt:', error);
            }
        },
        typeText() {
            if (this.currentStep < this.currentStory.length) {
                const currentTextObj = this.currentStory[this.currentStep];
                this.displayedText = '';
                this.currentIndex = 0;
                this.isTyping = true;
                this.typeCharacter(currentTextObj.text);
            } else {
                setTimeout(() => {
                    this.switchToTerminal();
                }, 1000);
            }
        },
        typeCharacter(text) {
            if (this.currentIndex < text.length) {
                this.displayedText += text[this.currentIndex];
                this.currentIndex++;
                setTimeout(() => this.typeCharacter(text), 50); // Adjust typing speed here
            } else {
                this.isTyping = false;
                this.currentStep++;
                setTimeout(this.typeText, this.currentStory[this.currentStep - 1]?.delay || 1000);
            }
        },
        skipIntro() {
            this.switchToTerminal();
        },
        switchToTerminal() {
            this.showIntro = false;
            this.hasShownIntro = true;
            this.animateTerminalMessage("You made it! This is my world, if you get lost just write 'help' and I will try my best to help you navigate through my mind.");
        },
        animateTerminalMessage(message) {
            let index = 0;
            this.isTyping = true;
            const interval = setInterval(() => {
                if (index < message.length) {
                    if (this.commands.length === 0 || this.commands[this.commands.length - 1].response || this.commands[this.commands.length - 1].input === '') {
                        this.commands.push({ input: '', response: '' });
                    }
                    this.commands[this.commands.length - 1].input += message[index];
                    index++;
                } else {
                    clearInterval(interval);
                    this.isTyping = false;
                    if (this.commands.length === 0 || this.commands[this.commands.length - 1].response) {
                        this.commands.push({ input: '', response: '' }); // Ensures only one prompt is added
                    }
                }
            }, 50);
        },
        handleCommand() {
            const command = this.currentInput.trim();
            let response = '';

            switch (command.toLowerCase()) {
                case 'help':
                    response = this.getHelpMessage();
                    break;
                case 'about':
                    response = 'I am Nejc, a CTO, Software Architect, and AI & Tech Consultant. I specialize in solving problems through design, providing awesome UX experiences, and mentoring future tech leaders.';
                    break;
                case 'skills':
                    response = 'Technical skills:\n- PHP & Laravel\n- Vue.js\n- TailwindCSS\n- MySQL\n- RESTful APIs\n- Git & Version Control\n- Computerized System Validation (CSV)\n- Infor Enterprise Resource Planning (ERP)';
                    break;
                case 'experience':
                    response = 'Experience:\n- Professional Services Consultant at Arbolus (2024-Present)\n- CEO at After.si (2024-Present)\n- CTO at Kitio internacional (2020-Present)\n- Various leadership and mentoring roles since 2018';
                    break;
                case 'projects':
                    response = 'Key Projects:\n1. Thrusty ship - https://www.thrustyship.com\n2. SilverEngine solutions - https://silverengine.net\n3. Openpentest - https://openpentest.com';
                    break;
                case 'contact':
                    response = 'Contact:\n- Email: nejc.cotic@gmail.com\n- LinkedIn: www.linkedin.com/in/nejccotic';
                    break;
                case 'languages':
                    response = 'Languages:\n- Slovenian (Native)\n- English (Professional Working)\n- Italian (Limited Working)\n- Croatian (Limited Working)';
                    break;
                case 'certifications':
                    response = 'Certifications:\n- PHP & MySQL\n- HTML, CSS, JS';
                    break;
                case 'clear':
                    this.commands = [];
                    this.currentInput = '';
                    this.suggestedCommand = '';
                    return;
                case 'show profile':
                    response = `<pre>${this.profileContent}</pre>`;
                    break;
                default:
                    response = `Command not found: ${command}`;
                    break;
            }

            this.commands.push({ input: command, response: response });
            this.commandHistory.push(command); // Add command to history
            this.currentInput = '';
            this.suggestedCommand = '';
            this.historyIndex = -1; // Reset history index
        },
        getHelpMessage() {
            let helpMessage = "<strong>Available commands:</strong><br>";
            this.availableCommands.forEach(cmd => {
                helpMessage += `<span style="color: #00ff00;">${cmd.name}</span> - ${cmd.description}<br>`;
            });
            return helpMessage;
        },
        suggestCommand() {
            if (this.currentInput.trim() === '') {
                this.suggestedCommand = '';
                return;
            }

            const match = this.availableCommands.find(cmd => cmd.name.startsWith(this.currentInput.trim().toLowerCase()));
            if (match) {
                this.suggestedCommand = match.name;
            } else {
                this.suggestedCommand = '';
            }
        },
        completeSuggestion() {
            if (this.suggestedCommand) {
                this.currentInput = this.suggestedCommand;
                this.suggestedCommand = '';
            }
        },
        navigateHistory(direction) {
            if (direction === -1 && this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else if (direction === 1 && this.historyIndex > 0) {
                this.historyIndex--;
            }

            if (this.historyIndex >= 0 && this.historyIndex < this.commandHistory.length) {
                this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            }
        },
        scrollToBottom() {
            nextTick(() => {
                const terminal = this.$el.querySelector('#terminal');
                if (terminal) {
                    terminal.scrollTop = terminal.scrollHeight;
                }
            });
        },
        formatResponse(response) {
            return response.replace(/\n/g, '<br>');
        }
    }
}).mount('#app');
