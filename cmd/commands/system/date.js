export const dateCommand = {
    name: 'date',
    command: 'date',
    description: 'Display the current date and time',
    shortHelp: 'Display the current date and time',
    longHelp: 'Usage: date\n\nDisplay the current date and time in the terminal.',
    category: 'system',
    execute(args, output) {
        output.push({ type: 'info', text: new Date().toString() });
    }
};
