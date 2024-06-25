import { fileSystem } from '../../filesystem.js';

export const llCommand = {
    name: 'll',
    command: 'll',
    description: 'List directory contents in detail',
    shortHelp: 'List directory contents in detail',
    longHelp: 'Usage: ll\n\nList the contents of the current directory in detail. Equivalent to ls -la.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const contents = fileSystem.listDirectoryDetailed();
            output.push({ type: 'info', text: contents.join('\n') });
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
