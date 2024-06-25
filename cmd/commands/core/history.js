export const historyCommand = {
    name: 'history',
    command: 'history',
    description: 'Show command history',
    shortHelp: 'Show command history',
    longHelp: 'Usage: history\n\nDisplay the list of commands entered in the terminal.',
    category: 'core',
    execute(args, output, currentScene) {
        currentScene.value = 'scene-history';
    }
};
