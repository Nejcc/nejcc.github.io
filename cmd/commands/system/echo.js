export const echoCommand = {
    name: 'echo',
    command: 'echo',
    description: 'Echo the input text',
    shortHelp: 'Echo the input text',
    longHelp: 'Usage: echo [text]\n\nEcho the input text back to the terminal.',
    category: 'system',
    execute(args, output) {
        output.value.push({ type: 'info', text: args.join(' ') });
    }
};
