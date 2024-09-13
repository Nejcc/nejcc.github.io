const { createApp, ref, reactive, onMounted, nextTick, computed } = Vue;

createApp({
    components: {
        terminal: {
            template: `
                <div>
                    <div v-if="scene === 'terminal'" class="terminal" ref="terminal" @click="focusInput">
                        <div v-for="(line, index) in history" :key="index" class="line">
                            <template v-if="line.type === 'input'">
                                <span>{{ line.prompt }} {{ line.text }}</span>
                            </template>
                            <template v-else-if="line.type === 'output'">
                                <span :class="{'error': line.isError}">{{ line.text }}</span>
                            </template>
                        </div>
                        <div class="prompt">
                            <span>{{ prompt }}</span>
                            <div class="input-container">
                                <input
                                    class="input"
                                    v-model="currentInput"
                                    @input="onInput"
                                    @keydown="onKeydown"
                                    ref="input"
                                    autocomplete="off"
                                    spellcheck="false"
                                />
                                <span class="ghost-text">{{ ghostText }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="scene === 'editor'" class="editor-scene" @keydown="editorKeydown">
                        <div class="editor-header">
                            Nano - Editing {{ editingFilePath }}
                        </div>
                        <textarea
                            class="editor-textarea"
                            v-model="editorContent"
                            ref="editorTextarea"
                        ></textarea>
                        <div class="editor-bottom-bar" v-if="showBottomBar">
                            [q: close  w: write  f: find ...]
                            <input v-model="bottomBarInput" @keydown="handleBottomBarInput" />
                        </div>
                    </div>
                </div>
            `,
            setup() {
                const terminal = ref(null);
                const input = ref(null);
                const currentInput = ref('');
                const history = reactive([]);
                const commandHistory = reactive([]);
                const historyIndex = ref(-1);
                const username = 'user';
                const hostname = 'web';
                const currentDir = ref('/home/user');
                const prompt = computed(() => `${username}@${hostname}:${getShortPath(currentDir.value)}$`);
                const scene = ref('terminal');
                const aliases = reactive({});
                const editorContent = ref('');
                const editingFilePath = ref('');
                const ghostText = ref('');
                const availableCommands = [
                    'help', 'echo', 'clear', 'date', 'uname', 'ls', 'pwd', 'cd', 'mkdir',
                    'touch', 'cat', 'rm', 'alias', 'nano', 'tree', 'history'
                ];

                const unsavedChanges = ref(false);
                const showSearchPrompt = ref(false);
                const searchQuery = ref('');
                const lastSearchIndex = ref(0);
                const showBottomBar = ref(false);
                const bottomBarInput = ref('');

                const fileSystem = reactive({
                    '/': { type: 'dir', contents: {} },
                });

                const commandsInfo = {
                    help: 'Display information about builtin commands',
                    echo: 'Display a line of text',
                    clear: 'Clear the terminal screen',
                    date: 'Display or set the system date and time',
                    uname: 'Print system information',
                    ls: 'List directory contents',
                    pwd: 'Print name of current working directory',
                    cd: 'Change the shell working directory',
                    mkdir: 'Make directories',
                    touch: 'Change file timestamps or create empty files',
                    cat: 'Concatenate files and print on the standard output',
                    rm: 'Remove files or directories',
                    alias: 'Define or display aliases',
                    nano: 'Edit text files',
                    tree: 'List contents of directories in a tree-like format',
                    history: 'Display the command history'
                };

                // Helper functions
                const resolvePath = (path) => {
                    if (path.startsWith('~')) {
                        path = '/home/user' + path.slice(1);
                    }
                    if (path.startsWith('/')) {
                        return path;
                    } else {
                        return currentDir.value + '/' + path;
                    }
                };

                const normalizePath = (path) => {
                    const parts = path.split('/').filter(Boolean);
                    const stack = [];
                    for (let part of parts) {
                        if (part === '.') continue;
                        if (part === '..') {
                            stack.pop();
                        } else {
                            stack.push(part);
                        }
                    }
                    return '/' + stack.join('/');
                };

                const getNode = (path) => {
                    path = normalizePath(path);
                    if (path === '/') return fileSystem['/'];
                    const parts = path.split('/').filter(Boolean);
                    let node = fileSystem['/'];
                    for (let part of parts) {
                        if (node.contents && node.contents[part]) {
                            node = node.contents[part];
                        } else {
                            return null;
                        }
                    }
                    return node;
                };

                const setNode = (path, node) => {
                    path = normalizePath(path);
                    const parts = path.split('/').filter(Boolean);
                    const name = parts.pop();
                    const parentPath = '/' + parts.join('/');
                    const parentNode = getNode(parentPath);
                    if (parentNode && parentNode.contents) {
                        parentNode.contents[name] = node;
                        return true;
                    }
                    return false;
                };

                const getShortPath = (path) => {
                    return path.replace('/home/user', '~');
                };

                const updateAliasFile = () => {
                    const aliasFilePath = '/home/user/.alias';
                    const aliasContent = Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
                    let aliasFile = getNode(aliasFilePath);
                    if (!aliasFile) {
                        // Create .alias file if it doesn't exist
                        setNode(aliasFilePath, { type: 'file', content: '' });
                        aliasFile = getNode(aliasFilePath);
                    }
                    if (aliasFile && aliasFile.type === 'file') {
                        aliasFile.content = aliasContent;
                    }
                };

                const loadAliases = () => {
                    const aliasFilePath = '/home/user/.alias';
                    const aliasFile = getNode(aliasFilePath);
                    if (aliasFile && aliasFile.type === 'file') {
                        const aliasLines = aliasFile.content.split('\n');
                        aliasLines.forEach(line => {
                            const match = line.match(/^alias\s+(\w+)=['"]?(.+?)['"]?$/);
                            if (match) {
                                const name = match[1];
                                const value = match[2];
                                aliases[name] = value;
                            }
                        });
                    }
                };

                const initializeFileSystem = () => {
                    fileSystem['/'].contents['home'] = { type: 'dir', contents: {} };
                    fileSystem['/'].contents['home'].contents['user'] = { type: 'dir', contents: {} };
                    currentDir.value = '/home/user';
                    // Load aliases from ~/.alias if exists
                    loadAliases();
                };

                initializeFileSystem();

                const commands = {
                    help: (args) => {
                        if (args.length === 1 && args[0] === '--help') {
                            return `Usage: help\nDisplay information about builtin commands.`;
                        }
                        const lines = [];
                        lines.push('Available commands:');
                        for (let cmd of availableCommands) {
                            const desc = commandsInfo[cmd] || '';
                            lines.push(`  ${cmd.padEnd(10)} - ${desc}`);
                        }
                        return lines.join('\n');
                    },
                    echo: (args) => args.join(' '),
                    date: (args) => {
                        if (args.length === 1 && args[0] === '--help') {
                            return `Usage: date\nDisplay the current date and time.`;
                        }
                        return new Date().toString();
                    },
                    uname: () => 'Linux web-terminal 5.4.0-66-generic x86_64 GNU/Linux',
                    clear: () => {
                        history.splice(0, history.length);
                        return '';
                    },
                    pwd: () => currentDir.value,
                    ls: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: ls [path]\nList directory contents.`;
                        }
                        const path = args[0] ? resolvePath(args[0]) : currentDir.value;
                        const dir = getNode(path);
                        if (dir && dir.contents) {
                            const items = Object.keys(dir.contents);
                            return items.join('  ');
                        } else {
                            return `ls: cannot access '${args[0]}': No such file or directory`;
                        }
                    },
                    cd: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: cd [path]\nChange the shell working directory.`;
                        }
                        let path = args[0] ? resolvePath(args[0]) : '/home/user';
                        path = normalizePath(path);
                        const dir = getNode(path);
                        if (dir && dir.type === 'dir') {
                            currentDir.value = path;
                        } else {
                            return `cd: ${args[0]}: No such file or directory`;
                        }
                    },
                    mkdir: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: mkdir [directory]\nCreate a new directory.`;
                        }
                        if (!args[0]) return 'mkdir: missing operand';
                        const path = resolvePath(args[0]);
                        const normalizedPath = normalizePath(path);
                        const existingNode = getNode(normalizedPath);
                        if (existingNode) {
                            return `mkdir: cannot create directory '${args[0]}': File exists`;
                        } else {
                            setNode(normalizedPath, { type: 'dir', contents: {} });
                        }
                    },
                    touch: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: touch [file]\nCreate an empty file or update its timestamp.`;
                        }
                        if (!args[0]) return 'touch: missing file operand';
                        const path = resolvePath(args[0]);
                        const normalizedPath = normalizePath(path);
                        const existingNode = getNode(normalizedPath);
                        if (existingNode) {
                            if (existingNode.type === 'dir') {
                                return `touch: cannot touch '${args[0]}': Is a directory`;
                            }
                            // Update timestamp or do nothing
                        } else {
                            setNode(normalizedPath, { type: 'file', content: '' });
                        }
                    },
                    cat: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: cat [file]\nDisplay the contents of a file.`;
                        }
                        if (!args[0]) return 'cat: missing file operand';
                        const path = resolvePath(args[0]);
                        const normalizedPath = normalizePath(path);
                        const file = getNode(normalizedPath);
                        if (file && file.type === 'file') {
                            return file.content;
                        } else if (file && file.type === 'dir') {
                            return `cat: ${args[0]}: Is a directory`;
                        } else {
                            return `cat: ${args[0]}: No such file or directory`;
                        }
                    },
                    rm: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: rm [file]\nRemove a file.`;
                        }
                        if (!args[0]) return 'rm: missing operand';
                        const path = resolvePath(args[0]);
                        const normalizedPath = normalizePath(path);
                        const parts = normalizedPath.split('/').filter(Boolean);
                        const name = parts.pop();
                        const parentPath = '/' + parts.join('/');
                        const parentDir = getNode(parentPath);
                        if (parentDir && parentDir.contents && parentDir.contents[name]) {
                            delete parentDir.contents[name];
                        } else {
                            return `rm: cannot remove '${args[0]}': No such file or directory`;
                        }
                    },
                    alias: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: alias [name='value']\nDefine or display aliases.`;
                        }
                        if (args.length === 0) {
                            // List all aliases
                            return Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
                        } else {
                            // Set alias
                            const argStr = args.join(' ');
                            const match = argStr.match(/^(\w+)=['"]?(.+?)['"]?$/);
                            if (match) {
                                const name = match[1];
                                const value = match[2];
                                aliases[name] = value;
                                updateAliasFile();
                            } else {
                                return 'alias: invalid alias definition';
                            }
                        }
                    },
                    nano: async (args) => {
                        if (args.includes('--help')) {
                            return `Usage: nano [file]\nEdit text files.`;
                        }
                        if (!args[0]) return 'nano: missing file operand';
                        const path = resolvePath(args[0]);
                        const normalizedPath = normalizePath(path);
                        let file = getNode(normalizedPath);
                        if (!file) {
                            // Create the file if it doesn't exist
                            setNode(normalizedPath, { type: 'file', content: '' });
                            file = getNode(normalizedPath);
                        }
                        if (file.type !== 'file') {
                            return `nano: ${args[0]}: Not a file`;
                        }
                        scene.value = 'editor';
                        editingFilePath.value = normalizedPath;
                        editorContent.value = file.content;
                        unsavedChanges.value = false;
                        showBottomBar.value = false;
                        bottomBarInput.value = '';
                        await nextTick(() => {
                            const editorElement = document.querySelector('.editor-textarea');
                            if (editorElement) {
                                editorElement.focus();
                            }
                        });
                    },
                    tree: (args) => {
                        if (args.includes('--help')) {
                            return `Usage: tree\nList contents of directories in a tree-like format.`;
                        }
                        const output = [];
                        const indent = (level) => '│   '.repeat(level);
                        const drawTree = (node, level) => {
                            const keys = Object.keys(node.contents);
                            keys.forEach((key, index) => {
                                const isLast = index === keys.length - 1;
                                const prefix = isLast ? '└── ' : '├── ';
                                const item = node.contents[key];
                                output.push(indent(level) + prefix + key);
                                if (item.type === 'dir') {
                                    drawTree(item, level + 1);
                                }
                            });
                        };
                        const startNode = getNode(currentDir.value);
                        output.push(getShortPath(currentDir.value));
                        if (startNode && startNode.type === 'dir') {
                            drawTree(startNode, 0);
                        }
                        return output.join('\n');
                    },
                    history: () => {
                        return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
                    },
                };

                const handleCommand = async (inputText) => {
                    history.push({ type: 'input', text: inputText, prompt: prompt.value });
                    commandHistory.push(inputText);
                    historyIndex.value = commandHistory.length;
                    // Handle aliases
                    const [firstWord, ...rest] = inputText.trim().split(' ');
                    let commandLine = inputText;
                    if (aliases[firstWord]) {
                        commandLine = aliases[firstWord] + ' ' + rest.join(' ');
                    }
                    const [cmd, ...args] = commandLine.trim().split(' ');
                    if (commands[cmd]) {
                        const output = await commands[cmd](args);
                        if (output) {
                            history.push({ type: 'output', text: output, isError: output.startsWith(cmd) });
                        }
                    } else if (cmd !== '') {
                        history.push({ type: 'output', text: `${cmd}: command not found`, isError: true });
                    }
                    nextTick(() => {
                        if (terminal.value) {
                            terminal.value.scrollTop = terminal.value.scrollHeight;
                        }
                    });
                };

                const focusInput = () => {
                    if (scene.value === 'terminal' && input.value) {
                        input.value.focus();
                    }
                };

                const editorKeydown = (event) => {
                    if (event.ctrlKey && event.key === ':') {
                        // Open bottom bar
                        event.preventDefault();
                        showBottomBar.value = true;
                        bottomBarInput.value = '';
                        nextTick(() => {
                            const bottomBarInputElement = document.querySelector('.editor-bottom-bar input');
                            if (bottomBarInputElement) {
                                bottomBarInputElement.focus();
                            }
                        });
                    } else {
                        unsavedChanges.value = true;
                    }
                };

                const handleBottomBarInput = (event) => {
                    if (event.key === 'Enter') {
                        const input = bottomBarInput.value.trim();
                        if (input === 'w') {
                            saveFile();
                            showBottomBar.value = false;
                            focusEditor();
                        } else if (input === 'q') {
                            if (unsavedChanges.value) {
                                // Prompt user to save changes
                                showBottomBar.value = true;
                                bottomBarInput.value = 'wq';
                                handleBottomBarInput({ key: 'Enter' });
                            } else {
                                showBottomBar.value = false;
                                exitEditor();
                            }
                        } else if (input === 'wq') {
                            saveFile();
                            showBottomBar.value = false;
                            exitEditor();
                        } else if (input === 'f') {
                            showBottomBar.value = false;
                            showSearchPrompt.value = true;
                            searchQuery.value = '';
                            nextTick(() => {
                                const searchInput = document.querySelector('.editor-search-prompt input');
                                if (searchInput) {
                                    searchInput.focus();
                                }
                            });
                        } else {
                            // Invalid command
                            showBottomBar.value = false;
                            focusEditor();
                        }
                    }
                };

                const saveFile = () => {
                    const file = getNode(editingFilePath.value);
                    if (file && file.type === 'file') {
                        file.content = editorContent.value;
                        unsavedChanges.value = false;
                        history.push({ type: 'output', text: `[ File saved ]` });
                    }
                };

                const exitEditor = () => {
                    scene.value = 'terminal';
                    history.push({ type: 'output', text: `[ Exited nano ]` });
                    nextTick(() => {
                        if (terminal.value) {
                            terminal.value.scrollTop = terminal.value.scrollHeight;
                        }
                        focusInput();
                    });
                };

                const performSearch = () => {
                    showSearchPrompt.value = false;
                    const query = searchQuery.value;
                    const content = editorContent.value;
                    const index = content.indexOf(query, lastSearchIndex.value + 1);
                    if (index !== -1) {
                        lastSearchIndex.value = index;
                        const editorElement = document.querySelector('.editor-textarea');
                        if (editorElement) {
                            editorElement.focus();
                            editorElement.setSelectionRange(index, index + query.length);
                        }
                    } else {
                        alert('Not found');
                        lastSearchIndex.value = -1;
                    }
                };

                const onInput = () => {
                    updateGhostText();
                };

                const onKeydown = (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const inputText = currentInput.value;
                        currentInput.value = '';
                        ghostText.value = '';
                        handleCommand(inputText);
                    } else if (event.key === 'Tab') {
                        event.preventDefault();
                        if (ghostText.value) {
                            currentInput.value += ghostText.value;
                            ghostText.value = '';
                        }
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (historyIndex.value > 0) {
                            historyIndex.value--;
                            currentInput.value = commandHistory[historyIndex.value];
                        }
                    } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (historyIndex.value < commandHistory.length - 1) {
                            historyIndex.value++;
                            currentInput.value = commandHistory[historyIndex.value];
                        } else {
                            historyIndex.value = commandHistory.length;
                            currentInput.value = '';
                        }
                    }
                };

                const updateGhostText = () => {
                    const words = currentInput.value.trim().split(' ');
                    if (words.length === 1) {
                        const partialCmd = words[0];
                        const suggestion = availableCommands.find(cmd => cmd.startsWith(partialCmd) && cmd !== partialCmd);
                        if (suggestion) {
                            ghostText.value = suggestion.slice(partialCmd.length);
                        } else {
                            ghostText.value = '';
                        }
                    } else {
                        ghostText.value = '';
                    }
                };

                const focusEditor = () => {
                    nextTick(() => {
                        const editorElement = document.querySelector('.editor-textarea');
                        if (editorElement) {
                            editorElement.focus();
                        }
                    });
                };

                onMounted(() => {
                    nextTick(() => {
                        if (input.value) {
                            input.value.focus();
                        }
                    });
                });

                return {
                    terminal,
                    input,
                    currentInput,
                    history,
                    prompt,
                    handleCommand,
                    focusInput,
                    scene,
                    editorContent,
                    editorKeydown,
                    editingFilePath,
                    ghostText,
                    onInput,
                    onKeydown,
                    unsavedChanges,
                    showSearchPrompt,
                    searchQuery,
                    performSearch,
                    showBottomBar,
                    bottomBarInput,
                    handleBottomBarInput,
                    focusEditor
                };
            }
        }
    }
}).mount('#app');
