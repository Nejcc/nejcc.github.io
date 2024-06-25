import { fileSystem } from '../../filesystem.js';

export const pwdCommand = {
    name: 'pwd',
    command: 'pwd',
    description: 'Print working directory',
    shortHelp: 'Print working directory',
    longHelp: 'Usage: pwd\n\nPrint the current working directory.',
    category: 'filesystem',
    execute(args, output) {
        try {
            const currentDir = fileSystem.getCurrentDirectory();
            output.push({ type: 'info', text: currentDir });
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
