import { fileSystem } from '../../filesystem.js';

export const cdCommand = {
    name: 'cd',
    command: 'cd',
    description: 'Change directory',
    shortHelp: 'Change directory',
    longHelp: 'Usage: cd [directory]\n\nChange the current working directory to the specified directory.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const path = args[0] || '/';
            fileSystem.changeDirectory(path);
            //output.push({ type: 'info', text: `Changed directory to ${fileSystem.getCurrentDirectory()}` });
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
