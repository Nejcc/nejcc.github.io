import { fileSystem } from '../../filesystem.js';

export const lsCommand = {
    name: 'ls',
    command: 'ls',
    description: 'List directory contents',
    shortHelp: 'List directory contents',
    longHelp: 'Usage: ls [options] [directory]\n\nList the contents of the specified directory or the current directory if none is specified. Options: -la for detailed listing.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const path = args.find(arg => !arg.startsWith('-')) || '.';
            if (args.includes('-la')) {
                const contents = fileSystem.listDirectoryDetailed(path);
                output.push({ type: 'info', text: contents.join('\n') });
            } else {
                const contents = fileSystem.listDirectory(path);
                output.push({ type: 'info', text: contents.join('\n') });
            }
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
