const root = {
    type: 'directory',
    children: {
        home: {
            type: 'directory',
            children: {
                user: {
                    type: 'directory',
                    children: {}
                }
            }
        },
        var: {
            type: 'directory',
            children: {}
        },
        bin: {
            type: 'directory',
            children: {}
        }
    }
};

let currentPath = '/home/user';
let fileSystem = JSON.parse(localStorage.getItem('fileSystem')) || root;

function getNode(path) {
    if (path === '/') return fileSystem;

    const parts = path.split('/').filter(part => part !== '');
    let node = fileSystem;
    for (let part of parts) {
        if (node && node.children && node.children[part]) {
            node = node.children[part];
        } else {
            return null;
        }
    }
    return node;
}

function updateFileSystem() {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
}

function resolvePath(path) {
    if (path.startsWith('/')) {
        return path === '/' ? '/' : path.replace(/\/$/, ''); // Absolute path
    } else {
        return currentPath === '/' ? `/${path}` : `${currentPath}/${path}`; // Relative path
    }
}

export function pwd(lines) {
    lines.push({ text: currentPath, type: 'info' });
}

export function cd(path, lines) {
    let targetPath;
    if (path === '..') {
        targetPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    } else if (path === '/') {
        targetPath = '/';
    } else {
        targetPath = resolvePath(path);
    }
    const node = getNode(targetPath);

    if (node && node.type === 'directory') {
        currentPath = targetPath;
    } else {
        lines.push({ text: `Directory not found: ${path}`, type: 'error' });
    }
}

export function mkdir(path, lines) {
    const resolvedPath = resolvePath(path);
    const parts = resolvedPath.split('/');
    const dirName = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parentNode = getNode(parentPath);

    if (parentNode && parentNode.type === 'directory') {
        if (!parentNode.children[dirName]) {
            parentNode.children[dirName] = {
                type: 'directory',
                children: {}
            };
            updateFileSystem();
            lines.push({ text: `Directory created: ${resolvedPath}`, type: 'info' });
        } else {
            lines.push({ text: `Directory already exists: ${resolvedPath}`, type: 'error' });
        }
    } else {
        lines.push({ text: `Parent directory not found: ${parentPath}`, type: 'error' });
    }
}

export function rmdir(path, lines) {
    const resolvedPath = resolvePath(path);
    const node = getNode(resolvedPath);
    const parts = resolvedPath.split('/');
    const dirName = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parentNode = getNode(parentPath);

    if (node && node.type === 'directory') {
        if (Object.keys(node.children).length === 0) {
            delete parentNode.children[dirName];
            updateFileSystem();
            lines.push({ text: `Directory removed: ${resolvedPath}`, type: 'info' });
        } else {
            lines.push({ text: `Directory not empty: ${resolvedPath}`, type: 'error' });
        }
    } else {
        lines.push({ text: `Directory not found: ${resolvedPath}`, type: 'error' });
    }
}

export function touch(path, lines) {
    const resolvedPath = resolvePath(path);
    const parts = resolvedPath.split('/');
    const fileName = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parentNode = getNode(parentPath);

    if (parentNode && parentNode.type === 'directory') {
        if (!parentNode.children[fileName]) {
            parentNode.children[fileName] = {
                type: 'file',
                content: ''
            };
            updateFileSystem();
            lines.push({ text: `File created: ${resolvedPath}`, type: 'info' });
        } else {
            lines.push({ text: `File already exists: ${resolvedPath}`, type: 'error' });
        }
    } else {
        lines.push({ text: `Parent directory not found: ${parentPath}`, type: 'error' });
    }
}

export function rm(path, lines) {
    const resolvedPath = resolvePath(path);
    const node = getNode(resolvedPath);
    const parts = resolvedPath.split('/');
    const name = parts.pop();
    const parentPath = parts.join('/') || '/';
    const parentNode = getNode(parentPath);

    if (node) {
        delete parentNode.children[name];
        updateFileSystem();
        lines.push({ text: `Removed: ${resolvedPath}`, type: 'info' });
    } else {
        lines.push({ text: `File or directory not found: ${resolvedPath}`, type: 'error' });
    }
}

export function ll(lines) {
    const node = getNode(currentPath);
    if (node && node.type === 'directory') {
        const contents = Object.keys(node.children);
        if (contents.length === 0) {
            lines.push({ text: 'Directory is empty', type: 'info' });
        } else {
            contents.forEach(item => {
                const itemType = node.children[item].type === 'directory' ? 'dir' : 'file';
                lines.push({ text: `${itemType}\t${item}`, type: 'info' });
            });
        }
    } else {
        lines.push({ text: `Error reading directory: ${currentPath}`, type: 'error' });
    }
}

// Initialize the file system if it is not already initialized
if (!localStorage.getItem('fileSystem')) {
    updateFileSystem();
}
