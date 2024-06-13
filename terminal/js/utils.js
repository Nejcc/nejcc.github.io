export function updatePrediction(currentCommand, commands, history) {
    const allCommands = [...commands, ...history].reverse(); // Include history for suggestions
    for (let cmd of allCommands) {
        if (cmd.startsWith(currentCommand)) {
            return cmd.slice(currentCommand.length);
        }
    }
    return '';
}

export function navigateHistory(direction, history, historyIndex, currentCommand) {
    if (direction === 'up') {
        if (historyIndex > 0) {
            historyIndex--;
            currentCommand = history[historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            currentCommand = '';
        }
    } else if (direction === 'down') {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            currentCommand = history[historyIndex];
        } else if (historyIndex === history.length - 1) {
            historyIndex = history.length;
            currentCommand = '';
        }
    }
    return { historyIndex, currentCommand };
}
