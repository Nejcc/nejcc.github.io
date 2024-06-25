// commands/editor.js

import { fileSystem } from '../filesystem.js';

export const editorCommand = {
    name: 'nano',
    command: 'nano',
    description: 'Edit a file using nano-like editor',
    shortHelp: 'Edit a file using nano-like editor',
    longHelp: 'Usage: nano <file>\n\nOpens a file in a nano-like editor for editing.',
    category: 'filesystem',
    execute(args, output, currentScene, input, state) {
        if (args.length < 1) {
            output.push({ type: 'error', text: 'Usage: nano <file>' });
            return;
        }
        const path = args[0];
        try {
            const content = fileSystem.readFile(path);
            state.editorContent = content;
            state.currentFile = path;
            state.currentScene = 'scene-editor'; // Switch to editor scene
            render(state); // Render the updated state
        } catch (error) {
            output.push({ type: 'error', text: error.message });
        }
    }
};
