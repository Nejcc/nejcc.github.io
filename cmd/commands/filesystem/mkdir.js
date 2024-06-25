import { fileSystem } from '../../filesystem.js';

export const mkdirCommand = {
    name: 'mkdir',
    command: 'mkdir',
    description: 'Make directory',
    shortHelp: 'Make directory',
    longHelp: 'Usage: mkdir [directory]\n\nCreate a new directory with the specified name.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const path = args[0];
            if (!path) throw new Error('No directory specified');
            fileSystem.makeDirectory(path);
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
