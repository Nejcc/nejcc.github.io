export const clearCommand = {
    name: 'clear',
    command: 'clear',
    description: 'Clear the terminal',
    shortHelp: 'Clear the terminal',
    longHelp: 'Usage: clear\n\nClear the terminal screen.',
    category: 'core',
    execute(args, output) {
        output.length = 0;
    }
};
