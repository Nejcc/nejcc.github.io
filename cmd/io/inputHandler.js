import { fileSystem } from '../filesystem.js';

export const handleInput = (event, state, commands) => {
    const { input, output, history, historyIndex, currentScene, selectedHistoryIndex, prompt, hostname, username, suggestions } = state;

    if (event.key === 'Enter') {
        if (currentScene.value === 'scene-history') {
            if (selectedHistoryIndex.value !== -1) {
                input.value = history.value[selectedHistoryIndex.value];
                currentScene.value = 'scene-terminal';
                processCommand(input.value, state, commands);
                input.value = '';
            } else {
                const index = parseInt(input.value, 10) - 1;
                if (!isNaN(index) && index >= 0 && index < history.value.length) {
                    input.value = history.value[index];
                    currentScene.value = 'scene-terminal';
                    processCommand(input.value, state, commands);
                    input.value = '';
                }
            }
        } else {
            history.value.push(input.value);
            processCommand(input.value, state, commands);
            input.value = '';
        }
        historyIndex.value = -1;
        selectedHistoryIndex.value = -1;
        suggestions.value = '';
    } else if (event.key === 'ArrowUp') {
        if (currentScene.value === 'scene-history') {
            if (selectedHistoryIndex.value > 0) {
                selectedHistoryIndex.value--;
            } else if (selectedHistoryIndex.value === -1) {
                selectedHistoryIndex.value = history.value.length - 1;
            }
        } else if (history.value.length > 0) {
            if (historyIndex.value === -1) {
                historyIndex.value = history.value.length - 1;
            } else if (historyIndex.value > 0) {
                historyIndex.value--;
            }
            input.value = history.value[historyIndex.value];
        }
    } else if (event.key === 'ArrowDown') {
        if (currentScene.value === 'scene-history') {
            if (selectedHistoryIndex.value < history.value.length - 1) {
                selectedHistoryIndex.value++;
            }
        } else if (history.value.length > 0) {
            if (historyIndex.value < history.value.length - 1) {
                historyIndex.value++;
                input.value = history.value[historyIndex.value];
            } else {
                historyIndex.value = -1;
                input.value = '';
            }
        }
    } else if (event.key === 'Tab') {
        event.preventDefault();
        if (suggestions.value) {
            const inputParts = input.value.split(' ');
            const base = inputParts[inputParts.length - 1];
            const remainingPart = suggestions.value.substring(base.length);
            input.value += remainingPart;
            suggestions.value = '';
        } else {
            const inputParts = input.value.split(' ');
            if (inputParts[0] === 'cd' && inputParts.length === 2) {
                try {
                    const directories = fileSystem.listDirectory('.');
                    const matches = directories.filter(dir => dir.startsWith(inputParts[1]));
                    if (matches.length === 1) {
                        input.value = inputParts[0] + ' ' + matches[0];
                    } else if (matches.length > 1) {
                        const matchedPart = matches[0].substring(inputParts[1].length);
                        suggestions.value = matchedPart;
                    }
                } catch (error) {
                    // Handle errors if necessary
                }
            }
        }
    } else if (event.ctrlKey && event.key === 'c') {
        if (currentScene.value === 'scene-history') {
            currentScene.value = 'scene-terminal';
            input.value = '';
            selectedHistoryIndex.value = -1;
        }
    } else {
        suggestions.value = '';
        const inputParts = input.value.split(' ');
        if (inputParts[0] === 'cd' && inputParts.length === 2) {
            try {
                const directories = fileSystem.listDirectory('.');
                const matches = directories.filter(dir => dir.startsWith(inputParts[1]));
                if (matches.length > 0) {
                    const matchedPart = matches[0].substring(inputParts[1].length);
                    suggestions.value = matchedPart;
                }
            } catch (error) {
                // Handle errors if necessary
            }
        }
    }
};

const processCommand = (command, state, commands) => {
    const { output, prompt, hostname, username, currentScene } = state;

    if (command.trim() === '') return;

    const resolvedCommand = fileSystem.getAlias(command);
    output.value.push({ type: 'command', prompt, text: resolvedCommand });

    const args = resolvedCommand.split(' ');
    const cmd = args[0];
    const flags = args.slice(1);

    if (commands[cmd]) {
        if (flags.includes('--help')) {
            output.value.push({ type: 'info', text: commands[cmd].longHelp });
        } else if (cmd === 'help') {
            output.value.push(...formatHelpOutput(commands));
        } else {
            commands[cmd].execute(flags, output.value, currentScene, hostname, username);
        }
    } else {
        output.value.push({ type: 'error', text: `Unknown command: ${cmd}` });
    }
};

const formatHelpOutput = (commands) => {
    const categories = {};

    Object.values(commands).forEach(cmd => {
        if (!categories[cmd.category]) {
            categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
    });

    const helpOutput = [];
    helpOutput.push({ type: 'info-header', text: 'Available commands:' });

    Object.keys(categories).forEach(category => {
        helpOutput.push({ type: 'info-header', text: `\n${category.charAt(0).toUpperCase() + category.slice(1)} commands:` });
        categories[category].forEach(cmd => {
            const paddedName = `-- [${cmd.name}] `.padEnd(16, ' ');  // Adjust padding as needed
            helpOutput.push({ type: 'info', text: `${paddedName} - ${cmd.description}` });
        });
    });

    return helpOutput;
};
