import { updatePrediction, navigateHistory } from './utils.js';
import { initializeSetup, initializeLoading } from './setup.js';
import { verifyUsername, verifyPassword } from './auth.js';
import { processCommand } from './commands.js';

const { createApp } = Vue;

createApp({
    data() {
        return {
            lines: this.initializeLines(),
            currentCommand: '',
            ghostText: '',
            commands: ['yes', 'no', 'help', 'echo', 'clear', 'exit', 'time', 'date', 'ping', 'history', 'wget', 'sudo factory-reset'],
            history: JSON.parse(localStorage.getItem('terminalHistory')) || [],
            historyIndex: -1,
            step: this.initializeStep(),
            username: '',
            rootPassword: '',
            inputHidden: false,
        };
    },
    computed: {
        terminalOutput() {
            return this.lines.map(line => `<div class="${line.type}">${line.text}</div>`).join('');
        },
        prompt() {
            return this.inputHidden ? 'Password: ' : '$ ';
        }
    },
    methods: {
        initializeLines() {
            const setupComplete = localStorage.getItem('setupComplete');
            if (setupComplete) {
                return [
                    { text: 'Please log in.', type: 'info' },
                    { text: 'Username:', type: 'info' }
                ];
            } else {
                return [
                    { text: 'Welcome to TerminalOS!', type: 'info' },
                    { text: '  _____                  _                _   ____   _____ ', type: 'ascii' },
                    { text: ' |_   _|_ _ _ __   ___  | |_ ___    ___  | |_|  _ \\ |_   _|', type: 'ascii' },
                    { text: '   | |/ _` | \'_ \\ / _ \\ | __/ _ \\  / _ \\ | __| | | | | |  ', type: 'ascii' },
                    { text: '   | | (_| | | | |  __/ | || (_) ||  __/ | |_| |_| | | |  ', type: 'ascii' },
                    { text: '   |_|\\__,_|_| |_|\\___|  \\__\\___/  \\___|  \\__|____/  |_|  ', type: 'ascii' },
                    { text: '', type: 'info' },
                    { text: 'Do you want to install TerminalOS? (yes/no)', type: 'info' }
                ];
            }
        },
        initializeStep() {
            return localStorage.getItem('setupComplete') ? 3 : 0;
        },
        executeCommand() {
            const command = this.currentCommand.trim();
            if (command) {
                if (!this.inputHidden) {
                    this.lines.push({ text: `$ ${command}`, type: 'command' });
                } else {
                    this.lines.push({ text: '$ [hidden]', type: 'command' });
                }
                this.handleCommand(command);
                if (this.step >= 3) {
                    this.history.push(command);
                    localStorage.setItem('terminalHistory', JSON.stringify(this.history));
                }
                this.historyIndex = this.history.length;
                this.currentCommand = '';
                this.ghostText = '';
            }
        },
        handleCommand(command) {
            switch (this.step) {
                case 0:
                case 1:
                case 2:
                    this.setupProcess(command);
                    break;
                case 3:
                case 4:
                    this.loginProcess(command);
                    break;
                default:
                    this.inputHidden = false;
                    processCommand(command, this.lines);
            }
        },
        setupProcess(command) {
            switch (this.step) {
                case 0:
                    this.step = initializeSetup(this.lines, command, this.step);
                    break;
                case 1:
                    this.username = command;
                    this.step++;
                    this.lines.push({ text: 'Please set your root password:', type: 'info' });
                    this.inputHidden = true;
                    break;
                case 2:
                    this.rootPassword = command;
                    this.inputHidden = false;
                    this.step++;
                    initializeLoading(this.lines, this.username, this.rootPassword, (newStep) => {
                        this.step = newStep;
                    });
                    break;
            }
        },
        loginProcess(command) {
            const storedUsername = localStorage.getItem('username');
            const storedPassword = localStorage.getItem('rootPassword');
            switch (this.step) {
                case 3:
                    if (verifyUsername(command, storedUsername, this.lines)) {
                        this.step++;
                        this.inputHidden = true;
                    }
                    break;
                case 4:
                    if (verifyPassword(command, storedPassword, this.lines)) {
                        this.inputHidden = false;
                        this.step = 5;
                        this.lines.length = 0;
                        this.showAvailableCommands();
                    }
                    break;
            }
        },
        updatePrediction() {
            this.ghostText = updatePrediction(this.currentCommand, this.commands, this.history);
        },
        insertPrediction() {
            if (this.ghostText) {
                this.currentCommand += this.ghostText;
                this.ghostText = '';
            }
        },
        navigateHistory(direction) {
            const result = navigateHistory(direction, this.history, this.historyIndex, this.currentCommand);
            this.historyIndex = result.historyIndex;
            this.currentCommand = result.currentCommand;
        },
        showAvailableCommands() {
            this.lines.push({ text: 'Welcome to TerminalOS!', type: 'info' });
            this.lines.push({ text: '  _____                  _                _   ____   _____ ', type: 'ascii' });
            this.lines.push({ text: ' |_   _|_ _ _ __   ___  | |_ ___    ___  | |_|  _ \\ |_   _|', type: 'ascii' });
            this.lines.push({ text: '   | |/ _` | \'_ \\ / _ \\ | __/ _ \\  / _ \\ | __| | | | | |  ', type: 'ascii' });
            this.lines.push({ text: '   | | (_| | | | |  __/ | || (_) ||  __/ | |_| |_| | | |  ', type: 'ascii' });
            this.lines.push({ text: '   |_|\\__,_|_| |_|\\___|  \\__\\___/  \\___|  \\__|____/  |_|  ', type: 'ascii' });
            this.lines.push({ text: '', type: 'info' });
            this.lines.push({ text: 'Login successful. Welcome to TerminalOS!', type: 'info' });
            this.lines.push({ text: 'Available commands: help, echo [message], clear, exit, time, date, ping [address], history, wget [url], sudo factory-reset, reboot, whoami, ifconfig, pwd, cd, mkdir, rmdir, touch, rm, ll', type: 'info' });
        }
    }
}).mount('#app');
