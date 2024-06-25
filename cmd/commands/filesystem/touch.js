import { fileSystem } from '../../filesystem.js';

export const touchCommand = {
    name: 'touch',
    command: 'touch',
    description: 'Create a new file',
    shortHelp: 'Create a new file',
    longHelp: 'Usage: touch [file]\n\nCreate a new file with the specified name.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const path = args[0];
            if (!path) throw new Error('No file specified');
            fileSystem.createFile(path);
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
