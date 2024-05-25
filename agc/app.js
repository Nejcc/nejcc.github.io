const { createApp } = Vue;

createApp({
    data() {
        return {
            cpuConfig: null,
            ramConfig: null,
            romConfig: null,
            registers: {},
            memory: {},
            rom: {},
            codeInput: "",
            instructions: [],
            instructionIndex: 0,
            codeLines: [],
            files: ['file1.agc'],
            selectedFile: "",
            running: false,
            currentRamBank: 0,
            currentRomBank: 0,
            cpus: [],
            rams: [],
            roms: [],
            selectedCpu: "",
            selectedRam: "",
            selectedRom: "",
            clocks: [],
            updatedMemoryAddresses: {},
            memoryGrid: [],
            cpuGrid: [],
            registerUpdateCounts: {}
        };
    },
    methods: {
        runAllCode() {
            this.instructions = this.parseCode(this.codeInput);
            this.codeLines = this.filterCodeLines(this.codeInput);
            this.instructionIndex = 0;
            this.running = true;
            this.executeInstructions();
        },
        runNextInstruction() {
            if (this.instructions.length === 0) {
                this.instructions = this.parseCode(this.codeInput);
                this.codeLines = this.filterCodeLines(this.codeInput);
                this.instructionIndex = 0;
            }
            if (this.instructionIndex < this.instructions.length) {
                const instruction = this.instructions[this.instructionIndex];
                this.processInstruction(instruction);
                this.instructionIndex++;
            }
        },
        stop() {
            this.running = false;
        },
        loadFileContent() {
            fetch(`agc/${this.selectedFile}`)
                .then(response => response.text())
                .then(text => {
                    this.codeInput = text;
                    this.codeLines = this.filterCodeLines(text);
                })
                .catch(error => console.error('Error loading file:', error));
        },
        loadRomConfig() {
            fetch(`rom/${this.selectedRom}`)
                .then(response => response.json())
                .then(data => {
                    this.romConfig = data;
                    this.rom = {};
                    for (let bank = 0; bank < data.memory_size; bank++) {
                        this.rom[bank] = data[`BANK${bank}`] || {};
                    }
                })
                .catch(error => console.error('Error loading ROM configuration:', error));
        },
        loadCpuConfig() {
            fetch(`cpu/${this.selectedCpu}`)
                .then(response => response.json())
                .then(data => {
                    this.cpuConfig = data;
                    this.registers = { ...data.registers };
                    this.clocks = data.clocks ? data.clocks.map(clock => ({ ...clock, value: clock.initialValue })) : [];
                    this.resetRegisterUpdateCounts();
                    this.updateCpuGrid();
                })
                .catch(error => console.error('Error loading CPU configuration:', error));
        },
        loadRamConfig() {
            fetch(`ram/${this.selectedRam}`)
                .then(response => response.json())
                .then(data => {
                    this.ramConfig = data;
                    this.memory = {};
                    for (let bank = 0; bank < data.memory_size; bank++) {
                        this.memory[bank] = {};
                        for (let i = 0; i < data.bank_sizes[bank]; i++) {
                            this.memory[bank][i.toString(8).padStart(4, '0')] = "0000";
                        }
                    }
                    this.updateMemoryGrid();
                })
                .catch(error => console.error('Error loading RAM configuration:', error));
        },
        parseCode(code) {
            const lines = code.split('\n');
            const instructions = [];
            const labels = {};
            let currentAddress = 0;

            for (const line of lines) {
                let trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) continue;

                const commentIndex = trimmedLine.indexOf('#');
                if (commentIndex !== -1) {
                    trimmedLine = trimmedLine.slice(0, commentIndex).trim();
                }

                const parts = trimmedLine.split(/\s+/);

                if (parts[0].endsWith(':')) {
                    labels[parts[0].slice(0, -1)] = currentAddress;
                    continue;
                }

                if (parts[0] === 'SETLOC') {
                    currentAddress = parseInt(parts[1], 8);
                    continue;
                }

                if (parts.length === 2 && /^[0-7]+$/.test(parts[1])) {
                    this.memory[this.currentRamBank][parts[0]] = parts[1];
                    continue;
                }

                for (let i = 0; i < parts.length; i++) {
                    const instruction = {
                        type: parts[i],
                        args: parts.slice(i + 1),
                        address: currentAddress
                    };
                    instructions.push(instruction);
                    if (parts[i] === 'TC' || parts[i] === 'HANG' || parts[i] === 'BANK') break;
                }
                currentAddress++;
            }

            for (const instruction of instructions) {
                if (labels[instruction.args[0]]) {
                    instruction.args[0] = labels[instruction.args[0]];
                }
            }

            return instructions;
        },
        filterCodeLines(code) {
            const lines = code.split('\n');
            const filteredLines = [];

            for (let line of lines) {
                let trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) continue;

                const commentIndex = trimmedLine.indexOf('#');
                if (commentIndex !== -1) {
                    trimmedLine = trimmedLine.slice(0, commentIndex).trim();
                }

                if (trimmedLine) {
                    filteredLines.push(trimmedLine);
                }
            }

            return filteredLines;
        },
        executeInstructions() {
            if (this.running && this.instructionIndex < this.instructions.length) {
                const instruction = this.instructions[this.instructionIndex];
                this.processInstruction(instruction);
                this.instructionIndex++;
                this.updateClocks();
                setTimeout(this.executeInstructions, 500);
            }
        },
        processInstruction(instruction) {
            const { type, args } = instruction;
            console.log(`DEBUG: Executing ${type} with args ${args} at bank ${this.currentRamBank}`);
            switch (type) {
                case 'CA':
                    this.registers['A'] = this.memory[this.currentRamBank][args[0]];
                    this.incrementRegisterUpdateCount('A');
                    break;
                case 'CS':
                    this.registers['A'] = (parseInt(this.registers['A'], 8) - parseInt(this.memory[this.currentRamBank][args[0]], 8)).toString(8).padStart(4, '0');
                    this.incrementRegisterUpdateCount('A');
                    break;
                case 'AD':
                    this.registers['A'] = (parseInt(this.registers['A'], 8) + parseInt(this.memory[this.currentRamBank][args[0]], 8)).toString(8).padStart(4, '0');
                    this.incrementRegisterUpdateCount('A');
                    break;
                case 'TS':
                    this.memory[this.currentRamBank][args[0]] = this.registers['A'];
                    this.updatedMemoryAddresses[`${this.currentRamBank}:${args[0]}`] = true;
                    this.updateMemoryGrid();
                    break;
                case 'TC':
                    const jumpAddress = parseInt(args[0], 8);
                    if (!isNaN(jumpAddress)) {
                        this.instructionIndex = jumpAddress;
                    } else {
                        const labelIndex = this.instructions.findIndex(instr => instr.address === args[0]);
                        if (labelIndex !== -1) {
                            this.instructionIndex = labelIndex;
                        }
                    }
                    break;
                case 'EXTEND':
                    console.log("DEBUG: EXTEND instruction encountered");
                    break;
                case 'SETLOC':
                    console.log("DEBUG: SETLOC instruction encountered");
                    break;
                case 'BANK':
                    this.currentRamBank = parseInt(args[0], 8);
                    console.log(`DEBUG: BANK switched to ${this.currentRamBank}`);
                    break;
                case 'HANG':
                    console.log("DEBUG: HANG instruction encountered, stopping execution");
                    this.running = false;
                    break;
                default:
                    console.log(`DEBUG: Unknown instruction type: ${type}`);
            }
            this.registers['PC'] = (parseInt(this.registers['PC'], 8) + 1).toString(8).padStart(4, '0');
            this.registers['Z'] = this.registers['PC'];
            this.incrementRegisterUpdateCount('PC');
            this.incrementRegisterUpdateCount('Z');
            this.updateCpuGrid();
        },
        updateClocks() {
            if (!this.cpuConfig) return;
            this.clocks.forEach(clock => {
                clock.value = (parseInt(clock.value, 8) + parseInt(clock.increment, 8)).toString(8).padStart(4, '0');
            });
        },
        resetRegisters() {
            this.registers = Object.keys(this.registers).reduce((acc, key) => {
                acc[key] = "0000";
                return acc;
            }, {});

            this.memory = {
                0: {},
                1: {},
                2: {},
                3: {}
            };
            this.rom = {
                0: {},
                1: {},
                2: {},
                3: {}
            };
            this.instructionIndex = 0;
            this.codeInput = "";
            this.codeLines = [];
            this.selectedFile = "";
            this.running = false;
            this.currentRamBank = 0;
            this.currentRomBank = 0;
            if (this.cpuConfig) {
                this.clocks = this.cpuConfig.clocks ? this.cpuConfig.clocks.map(clock => ({ ...clock, value: clock.initialValue })) : [];
            }
            this.updatedMemoryAddresses = {};
            this.resetRegisterUpdateCounts();
            this.updateMemoryGrid();
            this.updateCpuGrid();
        },
        resetRegisterUpdateCounts() {
            this.registerUpdateCounts = Object.keys(this.registers).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {});
        },
        incrementRegisterUpdateCount(register) {
            if (this.registerUpdateCounts[register] !== undefined) {
                this.registerUpdateCounts[register]++;
            }
        },
        updateMemoryGrid() {
            this.memoryGrid = [];
            for (const bank in this.memory) {
                for (const address in this.memory[bank]) {
                    this.memoryGrid.push({
                        bank,
                        address,
                        value: this.memory[bank][address],
                        updateClass: this.getUpdateClass(this.updatedMemoryAddresses[`${bank}:${address}`] || 0)
                    });
                }
            }
        },
        updateCpuGrid() {
            this.cpuGrid = [];
            for (const [key, value] of Object.entries(this.registers)) {
                this.cpuGrid.push({
                    key,
                    value,
                    updateClass: this.getUpdateClass(this.registerUpdateCounts[key] || 0)
                });
            }
        },
        getUpdateClass(count) {
            if (count === 0) return '';
            if (count <= 1) return 'updated-1';
            if (count <= 2) return 'updated-2';
            if (count <= 3) return 'updated-3';
            if (count <= 4) return 'updated-4';
            return 'updated-5';
        }
    },
    watch: {
        selectedCpu(newCpu) {
            if (newCpu) {
                this.resetRegisters();
                this.loadCpuConfig();
            }
        },
        selectedRam(newRam) {
            if (newRam) {
                this.resetRegisters();
                this.loadRamConfig();
            }
        },
        selectedRom(newRom) {
            if (newRom) {
                this.resetRegisters();
                this.loadRomConfig();
            }
        }
    },
    mounted() {
        this.codeLines = this.filterCodeLines(this.codeInput);
        fetch('conf/cpu.json')
            .then(response => response.json())
            .then(data => {
                this.cpus = data;
            });
        fetch('conf/ram.json')
            .then(response => response.json())
            .then(data => {
                this.rams = data;
            });
        fetch('conf/rom.json')
            .then(response => response.json())
            .then(data => {
                this.roms = data;
            });
    }
}).mount('#app');
