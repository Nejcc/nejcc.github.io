import { fileSystem } from '../../filesystem.js';

export const catCommand = {
    name: 'cat',
    command: 'cat',
    description: 'Display file contents',
    shortHelp: 'Display file contents',
    longHelp: 'Usage: cat [file]\n\nDisplay the contents of the specified file.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const path = args[0];
            if (!path) throw new Error('No file specified');
            const content = fileSystem.readFile(path);
            output.push({ type: 'info', text: content });
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
