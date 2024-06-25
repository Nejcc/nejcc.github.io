export const hostnameCommand = {
    name: 'hostname',
    command: 'hostname',
    description: 'Display the hostname',
    shortHelp: 'Display the hostname',
    longHelp: 'Usage: hostname\n\nDisplay the hostname of the terminal.',
    category: 'system',
    execute(args, output, hostname) {
        output.push({ type: 'info', text: hostname });
    }
};
