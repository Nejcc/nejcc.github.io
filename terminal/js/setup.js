export function initializeSetup(lines, command, step) {
    if (command.toLowerCase() === 'yes') {
        step++;
        lines.push({ text: 'Starting TerminalOS setup...', type: 'info' });
        lines.push({ text: 'Please enter your desired username:', type: 'info' });
    } else if (command.toLowerCase() === 'no') {
        lines.push({ text: 'Setup aborted. TerminalOS will not be installed.', type: 'info' });
    } else {
        lines.push({ text: 'Invalid response. Please answer "yes" or "no".', type: 'error' });
    }
    return step;
}

export function initializeLoading(lines, username, rootPassword, callback) {
    lines.push({ text: 'Setting up your environment...', type: 'info' });

    setTimeout(() => {
        lines.push({ text: 'Creating user profile...', type: 'info' });
        localStorage.setItem('username', username);
        localStorage.setItem('rootPassword', rootPassword);
    }, 1000);

    setTimeout(() => {
        lines.push({ text: 'Finalizing setup...', type: 'info' });
    }, 2000);

    setTimeout(() => {
        lines.push({ text: 'Setup complete. Please log in.', type: 'info' });
        localStorage.setItem('setupComplete', true);
        callback(3); // Update step to login phase
    }, 3000);
}
