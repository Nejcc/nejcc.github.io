const app = Vue.createApp({
    data() {
        return {
            chatMessages: [
                { type: 'assistant', text: 'Hello! How can I assist you today? Type "help" to see available commands.', isFormatted: false }
            ],
            userInput: '',
            database: null,
            suggestion: '',
            isThinking: false,
            commandHistory: [],
            historyIndex: -1,
            commands: [
                'help',
                'list users',
                'add user, Name, email@example.com',
                'list clients',
                'list packages',
                'list stores',
                'query store',
                'query client'
            ]
        };
    },
    mounted() {
        this.loadDatabase();
    },
    methods: {
        async loadDatabase() {
            try {
                const response = await fetch('database.json');
                this.database = await response.json();
                console.log('Database loaded:', this.database);
            } catch (error) {
                console.error('Error loading database:', error);
                this.addMessage("Error loading database. Some features may not work properly.", 'assistant', false);
            }
        },
        async sendMessage() {
            if (this.userInput.trim() === '') return;

            const currentInput = this.userInput.trim();
            this.addMessage(currentInput, 'user', false);
            this.commandHistory.unshift(currentInput);
            this.historyIndex = -1;
            
            this.userInput = '';
            this.suggestion = '';

            this.isThinking = true;
            this.$nextTick(this.scrollToBottom);

            setTimeout(async () => {
                this.isThinking = false;
                await this.processUserInput(currentInput);
            }, 1000);
        },
        async processUserInput(input) {
            const lowerInput = input.toLowerCase();
            const isTableView = lowerInput.includes('--table');
            const command = isTableView ? lowerInput.replace('--table', '').trim() : lowerInput;

            const commandFunctions = {
                'help': this.showHelp,
                'list users': () => this.listItems('users', isTableView),
                'add user': () => this.addUser(input),
                'list clients': () => this.listItems('clients', isTableView),
                'list packages': () => this.listItems('packages', isTableView),
                'list stores': () => this.listItems('stores', isTableView),
                'query store': () => this.queryRelationship('store', input),
                'query client': () => this.queryRelationship('client', input)
            };

            const matchedCommand = Object.keys(commandFunctions).find(cmd => command.startsWith(cmd));

            if (matchedCommand) {
                await commandFunctions[matchedCommand]();
            } else {
                this.addMessage("I'm sorry, I didn't understand that command. Type 'help' to see available commands.", 'assistant', false);
            }

            this.$nextTick(this.scrollToBottom);
        },
        showHelp() {
            const helpText = `
<h3>Available Commands:</h3>
<ul>
    <li><code>help</code>: Show this help message</li>
    <li><code>list users [--table]</code>: Display all users</li>
    <li><code>add user, Name, email@example.com</code>: Add a new user</li>
    <li><code>list clients [--table]</code>: Display all clients</li>
    <li><code>list packages [--table]</code>: Display all packages</li>
    <li><code>list stores [--table]</code>: Display all stores</li>
    <li><code>query store [store_id]</code>: Get details about a store and its client</li>
    <li><code>query client [client_id]</code>: Get details about a client and their stores</li>
</ul>
<p>Add <code>--table</code> to list commands for table view.</p>`;
            this.addMessage(helpText, 'assistant', true);
        },
        async listItems(itemType, isTableView) {
            this.addMessage(`Retrieving ${itemType} data...`, 'assistant', false);
            await this.showEllipsisAnimation();

            if (this.database && this.database[itemType]) {
                const items = this.database[itemType];
                let content;

                if (isTableView) {
                    const headers = Object.keys(items[0]);
                    const tableRows = items.map(item => 
                        `<tr>${headers.map(header => `<td>${item[header]}</td>`).join('')}</tr>`
                    ).join('');
                    content = `
<h3>Table of ${itemType}:</h3>
<table>
    <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
    ${tableRows}
</table>`;
                } else {
                    const itemList = items.map(item => `<li>${Object.values(item).join(' - ')}</li>`).join('');
                    content = `
<h3>List of ${itemType}:</h3>
<ul class="user-list">
    ${itemList}
</ul>`;
                }
                this.addMessage(content, 'assistant', true);
            } else {
                this.addMessage(`I'm sorry, I couldn't retrieve the ${itemType} list at the moment.`, 'assistant', false);
            }
        },
        async addUser(input) {
            const parts = input.split(',');
            if (parts.length === 3) {
                const [_, name, email] = parts.map(part => part.trim());
                if (this.database && this.database.users) {
                    this.addMessage("Adding user to the database...", 'assistant', false);
                    await this.showEllipsisAnimation();
                    const newId = this.database.users.length + 1;
                    this.database.users.push({ id: newId, name, email });
                    this.addMessage(`User <strong>${name}</strong> has been added with email <code>${email}</code>.`, 'assistant', true);
                } else {
                    this.addMessage("I'm sorry, I couldn't add the user at the moment.", 'assistant', false);
                }
            } else {
                this.addMessage("To add a user, please use the format: <code>add user, Name, email@example.com</code>", 'assistant', true);
            }
        },
        async queryRelationship(type, input) {
            const parts = input.split(' ');
            if (parts.length !== 3) {
                this.addMessage(`Invalid query format. Use: query ${type} [id]`, 'assistant', false);
                return;
            }

            const id = parseInt(parts[2]);
            if (isNaN(id)) {
                this.addMessage(`Invalid ${type} ID. Please provide a number.`, 'assistant', false);
                return;
            }

            this.addMessage(`Querying ${type} data...`, 'assistant', false);
            await this.showEllipsisAnimation();

            if (type === 'store') {
                this.queryStore(id);
            } else if (type === 'client') {
                this.queryClient(id);
            }
        },
        queryStore(storeId) {
            const store = this.database.stores.find(s => s.id === storeId);
            if (!store) {
                this.addMessage(`Store with ID ${storeId} not found.`, 'assistant', false);
                return;
            }

            const client = this.database.clients.find(c => c.id === store.client_id);
            const content = `
<h3>Store Information:</h3>
<ul>
    <li><strong>Store ID:</strong> ${store.id}</li>
    <li><strong>Store Name:</strong> ${store.name}</li>
    <li><strong>Location:</strong> ${store.location}</li>
    <li><strong>Client Name:</strong> ${client ? client.name : 'N/A'}</li>
    <li><strong>Client Contact:</strong> ${client ? client.contact : 'N/A'}</li>
</ul>`;
            this.addMessage(content, 'assistant', true);
        },
        queryClient(clientId) {
            const client = this.database.clients.find(c => c.id === clientId);
            if (!client) {
                this.addMessage(`Client with ID ${clientId} not found.`, 'assistant', false);
                return;
            }

            const stores = this.database.stores.filter(s => s.client_id === clientId);
            let storeList = stores.map(s => `<li>${s.name} (ID: ${s.id}) - ${s.location}</li>`).join('');

            const content = `
<h3>Client Information:</h3>
<ul>
    <li><strong>Client ID:</strong> ${client.id}</li>
    <li><strong>Client Name:</strong> ${client.name}</li>
    <li><strong>Contact:</strong> ${client.contact}</li>
</ul>
<h4>Associated Stores:</h4>
<ul>
    ${storeList || '<li>No stores associated with this client.</li>'}
</ul>`;
            this.addMessage(content, 'assistant', true);
        },
        addMessage(text, type, isFormatted) {
            this.chatMessages.push({ type, text, isFormatted });
            this.$nextTick(this.scrollToBottom);
        },
        async showEllipsisAnimation() {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1500);
            });
        },
        scrollToBottom() {
            const container = this.$refs.chatContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },
        updateSuggestion() {
            const input = this.userInput.toLowerCase();
            const matchingCommand = this.commands.find(cmd => cmd.toLowerCase().startsWith(input) && cmd.toLowerCase() !== input);
            this.suggestion = matchingCommand ? matchingCommand.slice(input.length) : '';
        },
        completeInput() {
            if (this.suggestion) {
                this.userInput += this.suggestion;
                this.suggestion = '';
            }
        },
        navigateHistory(direction) {
            if (direction === -1 && this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else if (direction === 1 && this.historyIndex > -1) {
                this.historyIndex--;
            }

            if (this.historyIndex > -1 && this.historyIndex < this.commandHistory.length) {
                this.userInput = this.commandHistory[this.historyIndex];
            } else if (this.historyIndex === -1) {
                this.userInput = '';
            }
        }
    }
});

app.mount('#app');