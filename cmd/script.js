import { createApp, ref, computed } from 'https://cdn.jsdelivr.net/npm/vue@3.2.31/dist/vue.esm-browser.js';
import { handleInput } from './io/inputHandler.js';
import { helpCommand } from './commands/core/help.js';
import { clearCommand } from './commands/core/clear.js';
import { historyCommand } from './commands/core/history.js';
import { echoCommand } from './commands/system/echo.js';
import { dateCommand } from './commands/system/date.js';
import { hostnameCommand } from './commands/system/hostname.js';
import { whoamiCommand } from './commands/system/whoami.js';
import { lsCommand } from './commands/filesystem/ls.js';
import { cdCommand } from './commands/filesystem/cd.js';
import { mkdirCommand } from './commands/filesystem/mkdir.js';
import { touchCommand } from './commands/filesystem/touch.js';
import { catCommand } from './commands/filesystem/cat.js';
import { pwdCommand } from './commands/filesystem/pwd.js';
import { llCommand } from './commands/filesystem/ll.js';
import { fileSystem } from './filesystem.js';
import { editorCommand } from './commands/editor.js';

const commands = {
    help: helpCommand,
    clear: clearCommand,
    history: historyCommand,
    echo: echoCommand,
    date: dateCommand,
    hostname: hostnameCommand,
    whoami: whoamiCommand,
    ls: lsCommand,
    cd: cdCommand,
    mkdir: mkdirCommand,
    touch: touchCommand,
    cat: catCommand,
    pwd: pwdCommand,
    ll: llCommand,
    nano: editorCommand
};

createApp({
    setup() {
        const username = 'user';
        const hostname = 'localhost';
        const input = ref('');
        const output = ref([]);
        const history = ref([]);
        const historyIndex = ref(-1);
        const currentScene = ref('scene-terminal'); // Track the current scene
        const selectedHistoryIndex = ref(-1);
        const suggestions = ref('');

        const currentDir = ref(fileSystem.getCurrentDirectory());

        const prompt = computed(() => {
            const currentDirPath = currentDir.value.replace('/home/user', '~');
            return `${username}@${hostname}:${currentDirPath}$`;
        });

        const isCommandValid = (cmd) => Object.keys(commands).includes(cmd.split(' ')[0]);

        const bestMatch = computed(() => {
            const matches = Object.keys(commands).filter(cmd => cmd.startsWith(input.value));
            return matches.length > 0 ? matches[0] : '';
        });

        const handleInputWrapper = (event) => {
            handleInput(event, { input, output, history, historyIndex, currentScene, selectedHistoryIndex, prompt, hostname, username, suggestions }, commands);
            currentDir.value = fileSystem.getCurrentDirectory();
        };

        return {
            input,
            output,
            prompt,
            currentScene,
            currentDir,
            history,
            historyIndex,
            selectedHistoryIndex,
            suggestions,
            isCommandValid,
            handleInput: handleInputWrapper,
            bestMatch
        };
    }
}).mount('#app');
