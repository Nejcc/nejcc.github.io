class FileSystem {
    constructor() {
        this.root = {
            type: 'directory',
            name: '/',
            children: {},
            parent: null
        };
        this.currentDir = this.root;
        this.createDefaultDirectories();
    }

    createDefaultDirectories() {
        this.makeDirectory('/home');
        this.makeDirectory('/home/user');
        this.makeDirectory('/var');
        this.makeDirectory('/tmp');
        this.makeDirectory('/etc');
        this.createFile('/home/user/.aliases', 'cls=clear\n');
    }

    resolvePath(path) {
        const parts = path.split('/').filter(part => part);
        let node = path.startsWith('/') ? this.root : this.currentDir;
        for (const part of parts) {
            if (part === '..') {
                node = node.parent || this.root;
            } else if (part !== '.' && part) {
                if (node.type !== 'directory' || !node.children[part]) {
                    throw new Error(`No such file or directory: ${path}`);
                }
                node = node.children[part];
            }
        }
        return node;
    }

    listDirectory(path = '.') {
        const dir = this.resolvePath(path);
        if (dir.type !== 'directory') {
            throw new Error(`${path} is not a directory`);
        }
        return Object.keys(dir.children).map(name => `${dir.children[name].type === 'directory' ? 'd' : '-'} ${name}`);
    }

    listDirectoryDetailed(path = '.') {
        const dir = this.resolvePath(path);
        if (dir.type !== 'directory') {
            throw new Error(`${path} is not a directory`);
        }
        return Object.values(dir.children).map(child => {
            const type = child.type === 'directory' ? 'd' : '-';
            const size = child.type === 'file' ? child.content.length : '-';
            return `${type} ${child.name} ${size}`;
        });
    }

    changeDirectory(path) {
        const newDir = this.resolvePath(path);
        if (newDir.type !== 'directory') {
            throw new Error(`${path} is not a directory`);
        }
        this.currentDir = newDir;
    }

    makeDirectory(path) {
        const parts = path.split('/').filter(part => part);
        let node = path.startsWith('/') ? this.root : this.currentDir;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!node.children[part]) {
                node.children[part] = { type: 'directory', name: part, children: {}, parent: node };
            }
            node = node.children[part];
            if (node.type !== 'directory') {
                throw new Error(`Not a directory: ${parts.slice(0, i + 1).join('/')}`);
            }
        }
    }

    createFile(path, content = '') {
        const parts = path.split('/').filter(part => part);
        const fileName = parts.pop();
        const dir = this.resolvePath(parts.join('/'));
        if (dir.type !== 'directory') {
            throw new Error(`Not a directory: ${parts.join('/')}`);
        }
        dir.children[fileName] = { type: 'file', name: fileName, content, parent: dir };
    }

    readFile(path) {
        const file = this.resolvePath(path);
        if (file.type !== 'file') {
            throw new Error(`${path} is not a file`);
        }
        return file.content;
    }

    writeFile(path, content) {
        const file = this.resolvePath(path);
        if (file.type !== 'file') {
            throw new Error(`${path} is not a file`);
        }
        file.content = content;
    }

    getCurrentDirectory() {
        let node = this.currentDir;
        const path = [];
        while (node && node.name !== '/') {
            path.unshift(node.name);
            node = node.parent;
        }
        return '/' + path.join('/');
    }

    getAlias(command) {
        try {
            const aliasesContent = this.readFile('/home/user/.aliases');
            const aliases = aliasesContent.split('\n').reduce((acc, line) => {
                const [alias, cmd] = line.split('=');
                if (alias && cmd) {
                    acc[alias.trim()] = cmd.trim();
                }
                return acc;
            }, {});
            return aliases[command] || command;
        } catch {
            return command;
        }
    }
}

export const fileSystem = new FileSystem();
