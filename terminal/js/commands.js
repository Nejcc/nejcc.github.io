import { installPackage, removePackage, listPackages, isCommandAvailable } from './packages.js';
import { pwd, cd, mkdir, rmdir, touch, rm, ll } from './filesystem.js';

export function processCommand(command, lines) {
    const parts = command.split(' ');
    const baseCommand = parts[0];
    const args = parts.slice(1).join(' ');

    if (baseCommand === 'apt') {
        handleAptCommand(args, lines);
        return;
    }

    if (!isCommandAvailable(baseCommand) && !['help', 'clear', 'echo', 'exit', 'history', 'wget', 'sudo', 'reboot', 'whoami', 'ifconfig', 'pwd', 'cd', 'mkdir', 'rmdir', 'touch', 'rm', 'll'].includes(baseCommand)) {
        lines.push({ text: `Command not found: ${command}`, type: 'error' });
        lines.push({ text: `You may need to install a package containing the command. Use "apt install [package-name]"`, type: 'info' });
        return;
    }

    switch (baseCommand) {
        case 'help':
            showAvailableCommands(lines);
            break;
        case 'echo':
            lines.push({ text: args, type: 'default' });
            break;
        case 'clear':
            lines.length = 0;
            break;
        case 'exit':
            lines.push({ text: 'Goodbye!', type: 'info' });
            break;
        case 'time':
            lines.push({ text: new Date().toLocaleTimeString(), type: 'info' });
            break;
        case 'date':
            lines.push({ text: new Date().toLocaleDateString(), type: 'info' });
            break;
        case 'ping':
            ping(args, lines);
            break;
        case 'history':
            showHistory(lines);
            break;
        case 'wget':
            wget(args, lines);
            break;
        case 'sudo':
            if (args === 'factory-reset') {
                factoryReset(lines);
            } else {
                lines.push({ text: `Command not found: ${command}`, type: 'error' });
            }
            break;
        case 'reboot':
            reboot(lines);
            break;
        case 'whoami':
            whoami(lines);
            break;
        case 'ifconfig':
            ifconfig(lines);
            break;
        case 'pwd':
            pwd(lines);
            break;
        case 'cd':
            cd(args, lines);
            break;
        case 'mkdir':
            mkdir(args, lines);
            break;
        case 'rmdir':
            rmdir(args, lines);
            break;
        case 'touch':
            touch(args, lines);
            break;
        case 'rm':
            rm(args, lines);
            break;
        case 'll':
            ll(lines);
            break;
        default:
            lines.push({ text: `Command not found: ${command}`, type: 'error' });
    }
}

function handleAptCommand(args, lines) {
    const parts = args.split(' ');
    const subCommand = parts[0];
    const packageName = parts[1];

    switch (subCommand) {
        case 'install':
            if (packageName) {
                installPackage(packageName, lines);
            } else {
                lines.push({ text: 'Usage: apt install [package-name]', type: 'error' });
            }
            break;
        case 'remove':
            if (packageName) {
                removePackage(packageName, lines);
            } else {
                lines.push({ text: 'Usage: apt remove [package-name]', type: 'error' });
            }
            break;
        case 'list':
            listPackages(lines);
            break;
        default:
            lines.push({ text: 'Usage: apt [install|remove|list] [package-name]', type: 'error' });
    }
}

function showAvailableCommands(lines) {
    lines.push({ text: 'Available commands: help, echo [message], clear, exit, time, date, ping [address], history, wget [url], sudo factory-reset, reboot, whoami, ifconfig, pwd, cd, mkdir, rmdir, touch, rm, ll', type: 'info' });
}

function ping(address, lines) {
    if (!address) {
        lines.push({ text: 'Usage: ping [address]', type: 'error' });
        return;
    }

    lines.push({ text: `PING ${address} with 32 bytes of data:`, type: 'info' });
    let count = 0;
    const pingInterval = setInterval(() => {
        if (count < 4) {
            const latency = Math.floor(Math.random() * 100);
            lines.push({ text: `Reply from ${address}: bytes=32 time=${latency}ms TTL=64`, type: 'default' });
            count++;
        } else {
            clearInterval(pingInterval);
            lines.push({ text: `Ping statistics for ${address}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`, type: 'info' });
        }
    }, 1000);
}

function showHistory(lines) {
    lines.push({ text: 'Command history:', type: 'info' });
    const history = JSON.parse(localStorage.getItem('terminalHistory')) || [];
    history.forEach((entry, index) => {
        lines.push({ text: `${index + 1}: ${entry}`, type: 'default' });
    });
}

function wget(url, lines) {
    if (!url) {
        lines.push({ text: 'Usage: wget [url]', type: 'error' });
        return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            lines.push({ text: data, type: 'default' });
        })
        .catch(error => {
            if (error.message.includes('Failed to fetch')) {
                lines.push({ text: `Error fetching ${url}: CORS policy may be blocking the request.`, type: 'error' });
            } else {
                lines.push({ text: `Error fetching ${url}: ${error.message}`, type: 'error' });
            }
        });
}

function factoryReset(lines) {
    localStorage.removeItem('username');
    localStorage.removeItem('rootPassword');
    localStorage.removeItem('setupComplete');
    localStorage.removeItem('terminalHistory');
    localStorage.removeItem('fileSystem');
    localStorage.removeItem('installedPackages');
    lines.push({ text: 'Factory reset complete. Please refresh the page to reinstall TerminalOS.', type: 'info' });
}

function reboot(lines) {
    lines.push({ text: 'Rebooting...', type: 'info' });
    setTimeout(() => {
        localStorage.setItem('isLoggedIn', false);
        location.reload();
    }, 1000);
}

function whoami(lines) {
    const username = localStorage.getItem('username');
    lines.push({ text: username || 'unknown', type: 'info' });
}

function ifconfig(lines) {
    lines.push({ text: 'eth0      Link encap:Ethernet  HWaddr 00:1A:2B:3C:4D:5E', type: 'info' });
    lines.push({ text: '          inet addr:192.168.1.2  Bcast:192.168.1.255  Mask:255.255.255.0', type: 'info' });
    lines.push({ text: '          inet6 addr: fe80::21a:2bff:fe3c:4d5e/64 Scope:Link', type: 'info' });
    lines.push({ text: '          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1', type: 'info' });
    lines.push({ text: '          RX packets:123456 errors:0 dropped:0 overruns:0 frame:0', type: 'info' });
    lines.push({ text: '          TX packets:123456 errors:0 dropped:0 overruns:0 carrier:0', type: 'info' });
    lines.push({ text: '          collisions:0 txqueuelen:1000', type: 'info' });
    lines.push({ text: '          RX bytes:123456789 (123.4 MB)  TX bytes:123456789 (123.4 MB)', type: 'info' });
    lines.push({ text: '', type: 'info' });
    lines.push({ text: 'lo        Link encap:Local Loopback', type: 'info' });
    lines.push({ text: '          inet addr:127.0.0.1  Mask:255.0.0.0', type: 'info' });
    lines.push({ text: '          inet6 addr: ::1/128 Scope:Host', type: 'info' });
    lines.push({ text: '          UP LOOPBACK RUNNING  MTU:65536  Metric:1', type: 'info' });
    lines.push({ text: '          RX packets:123456 errors:0 dropped:0 overruns:0 frame:0', type: 'info' });
    lines.push({ text: '          TX packets:123456 errors:0 dropped:0 overruns:0 carrier:0', type: 'info' });
    lines.push({ text: '          collisions:0 txqueuelen:1', type: 'info' });
    lines.push({ text: '          RX bytes:123456789 (123.4 MB)  TX bytes:123456789 (123.4 MB)', type: 'info' });
}
