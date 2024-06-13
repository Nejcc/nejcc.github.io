export const availablePackages = {
    'net-tools': {
        commands: ['ifconfig'],
    },
    'coreutils': {
        commands: ['date', 'time'],
    },
    'network-tools': {
        commands: ['ping'],
    },
};

export let installedPackages = JSON.parse(localStorage.getItem('installedPackages')) || [];

export function installPackage(packageName, lines) {
    if (availablePackages[packageName]) {
        if (!installedPackages.includes(packageName)) {
            installedPackages.push(packageName);
            localStorage.setItem('installedPackages', JSON.stringify(installedPackages));
            lines.push({ text: `Package ${packageName} installed successfully.`, type: 'info' });
        } else {
            lines.push({ text: `Package ${packageName} is already installed.`, type: 'info' });
        }
    } else {
        lines.push({ text: `Package ${packageName} not found.`, type: 'error' });
    }
}

export function removePackage(packageName, lines) {
    if (installedPackages.includes(packageName)) {
        installedPackages = installedPackages.filter(pkg => pkg !== packageName);
        localStorage.setItem('installedPackages', JSON.stringify(installedPackages));
        lines.push({ text: `Package ${packageName} removed successfully.`, type: 'info' });
    } else {
        lines.push({ text: `Package ${packageName} is not installed.`, type: 'error' });
    }
}

export function listPackages(lines) {
    lines.push({ text: 'Available packages:', type: 'info' });
    for (let packageName in availablePackages) {
        lines.push({ text: `- ${packageName}`, type: 'default' });
    }
}

export function isCommandAvailable(command) {
    for (let packageName of installedPackages) {
        if (availablePackages[packageName].commands.includes(command)) {
            return true;
        }
    }
    return false;
}

export function getInstalledPackages() {
    return installedPackages;
}
