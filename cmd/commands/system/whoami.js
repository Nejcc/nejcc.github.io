export const whoamiCommand = {
    name: 'whoami',
    command: 'whoami',
    description: 'Display the current username',
    shortHelp: 'Display the current username',
    longHelp: 'Usage: whoami\n\nDisplay the username of the current user.',
    category: 'system',
    execute(args, output, username) {
        output.push({ type: 'info', text: username });
    }
};
