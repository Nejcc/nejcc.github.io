export const helpCommand = {
    name: 'help',
    command: 'help',
    description: 'Display this help message',
    shortHelp: 'Display this help message',
    longHelp: 'Usage: help\n\nDisplays a list of available commands and their descriptions.',
    category: 'core',
    execute(args, output) {
        // Help output is dynamically generated in the main script, no need to handle here
    }
};
