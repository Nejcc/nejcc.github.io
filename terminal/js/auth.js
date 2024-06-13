export function verifyUsername(inputUsername, storedUsername, lines) {
    if (inputUsername === storedUsername) {
        lines.push({ text: 'Username correct. Please enter your password:', type: 'info' });
        return true;
    } else {
        lines.push({ text: 'Invalid username. Please try again.', type: 'error' });
        return false;
    }
}

export function verifyPassword(inputPassword, storedPassword, lines) {
    if (inputPassword === storedPassword) {
        lines.push({ text: 'Login successful. Welcome to TerminalOS!', type: 'info' });
        localStorage.setItem('isLoggedIn', true);
        return true;
    } else {
        lines.push({ text: 'Invalid password. Please try again.', type: 'error' });
        return false;
    }
}
