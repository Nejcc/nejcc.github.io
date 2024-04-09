const app = Vue.createApp({
    data() {
        return {
            importStatus: '',
            workStart: '08:00',
            workEnd: '16:00',
            tasks: [],
            categories: ['Communication', 'Break', 'Preparation', 'Meeting', 'Other'],
            newTask: { name: '', duration: 5, description: '', category: '' },
            currentDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
            viewDate: new Date().toISOString().slice(0, 10),
            workHours: {start: '08:00', end: '16:00'},
            predefinedTasks: [
                { name: 'Check emails', duration: 5, description: 'Checking all received emails', category: 'Communication' },
                { name: 'Micropis', duration: 5, description: 'Quick micro-break', category: 'Parther support' },
                { name: 'Prepare for work', duration: 10, description: 'Getting ready for work tasks', category: 'Preparation' },
            ],
        };
    },
    computed: {
        sortedTasks() {
            return this.tasks.slice().sort((a, b) => b.timestamp - a.timestamp);
        },
        effectiveWorkHours() {
            return 6; // Consider making this adjustable if your application needs flexibility
        },
        productivityPercentage() {
            // The logic remains similar but consider using raw values for computation
            const totalHoursSpentOnTasks = this.totalTasksDuration;
            return (totalHoursSpentOnTasks / this.effectiveWorkHours) * 100;
        },
        productivityMessage() {
            // Similar logic but use the computed percentage directly
            const percentage = this.productivityPercentage;
            if (percentage > 100) return 'Congratulations! You are exceeding the average effective work hours!';
            else if (percentage === 100) return 'Great job! You’ve met the average effective work hours.';
            else return `You are at ${percentage.toFixed(2)}% of the average effective work hours. Keep it up!`;
        },
        totalNumberOfTasks() {
            return this.tasks.length;
        },
        totalWorkDuration() {
            const start = new Date(`1970/01/01 ${this.workHours.start}`);
            const end = new Date(`1970/01/01 ${this.workHours.end}`);
            return (end - start) / 3600000; // milliseconds to hours
        },
        totalTasksDuration() {
            return this.tasks.reduce((sum, task) => sum + parseInt(task.duration), 0) / 60; // minutes to hours
        },
        freeTime() {
            const lunchBreak = 0.5;
            const shortBreaks = 0.5;
            return this.totalWorkDuration - (this.totalTasksDuration + lunchBreak + shortBreaks);
        },
    },
    methods: {


        parseDuration(input) {
            let totalMinutes = 0;

            // Match formats: "1h 10m", "1:10", or "01:10"
            const mixedMatch = input.match(/(\d+)[h:](\d+)/);
            if (mixedMatch) {
                totalMinutes = parseInt(mixedMatch[1], 10) * 60 + parseInt(mixedMatch[2], 10);
                return totalMinutes;
            }

            // Existing patterns
            const hoursMatch = input.match(/(\d+)\s*h/);
            const minutesMatch = input.match(/(\d+)\s*m/);

            if (hoursMatch) {
                totalMinutes += parseInt(hoursMatch[1], 10) * 60;
            }

            if (minutesMatch) {
                totalMinutes += parseInt(minutesMatch[1], 10);
            }

            // Direct number input (assumed to be minutes)
            if (!hoursMatch && !minutesMatch && !isNaN(input)) {
                totalMinutes = parseInt(input, 10);
            }

            return totalMinutes;
        },


        formatDuration(minutes) {
            if (minutes < 60) {
                return `${minutes}m`;
            } else {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
            }
        },

        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        // Existing methods...

        importTasks(event) {
            const file = event.target.files[0];
            if (!file) {
                console.log("No file selected.");
                return; // Exit if no file is selected
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    let allData = JSON.parse(localStorage.getItem('taskManagerData')) || {};

                    // Iterate over each date in the imported data
                    Object.keys(importedData).forEach((date) => {
                        const dateTasks = importedData[date].tasks;

                        if (date === this.viewDate) {
                            // Merge tasks for the viewDate without duplicates
                            dateTasks.forEach(importedTask => {
                                if (!this.tasks.some(task => task.name === importedTask.name)) {
                                    this.tasks.push({ ...importedTask, isEditing: false });
                                }
                            });
                        }

                        // Ensure there's an entry for this date in allData
                        if (!allData[date]) {
                            allData[date] = { tasks: [], workHours: importedData[date].workHours };
                        }

                        // Merge tasks for all dates without duplicates
                        dateTasks.forEach(task => {
                            if (!allData[date].tasks.some(t => t.name === task.name)) {
                                allData[date].tasks.push(task);
                            }
                        });
                    });

                    // Save the updated allData back to localStorage
                    localStorage.setItem('taskManagerData', JSON.stringify(allData));

                    // Ensure the current tasks displayed are up to date
                    this.loadTasksForDate(this.viewDate); // Reload tasks for the current viewDate

                    alert("Import successful!");
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    alert("There was an error processing the imported file.");
                } finally {
                    // Clear the file input so the same file can be selected again if needed
                    event.target.value = '';
                }
            };
            reader.readAsText(file);
        },

        exportData(format, scope) {
            let dataToExport = {};
            let filenamePrefix = ""; // Initialize filename prefix

            if (scope === 'current') {
                // Export data for the current viewDate only
                dataToExport[this.viewDate] = {
                    tasks: this.tasks,
                    workHours: this.workHours
                };
                filenamePrefix = this.viewDate; // Prefix with the viewDate for current day export
            } else if (scope === 'all') {
                // Export all data from localStorage
                dataToExport = JSON.parse(localStorage.getItem('taskManagerData')) || {};
                filenamePrefix = "all"; // Use a general prefix for exporting all data
            }

            // Determine the filename based on the format and scope
            const filename = format === 'json' ? `${filenamePrefix}-tasks.json` : `${filenamePrefix}-tasks.txt`;

            // Call the downloadFile method with the constructed filename
            if (format === 'json') {
                this.downloadFile(JSON.stringify(dataToExport, null, 2), filename, 'application/json');
            } else if (format === 'text') {
                let textData = this.convertTasksToText(dataToExport);
                this.downloadFile(textData, filename, 'text/plain');
            }
        },


        convertTasksToText(data) {
            let textData = '';
            const separator = "-------------------\n"; // Define your separator line

            const appendStatisticsForDay = (dayData) => {
                const totalWorkDuration = this.formatNumber((new Date(`1970/01/01 ${dayData.workHours.end}`) - new Date(`1970/01/01 ${dayData.workHours.start}`)) / 3600000);
                const totalTasksDuration = this.formatNumber(dayData.tasks.reduce((sum, task) => sum + parseInt(task.duration), 0) / 60);
                const effectiveWorkHours = 6; // Assuming 6 effective hours as per your app logic
                const freeTime = this.formatNumber(effectiveWorkHours - totalTasksDuration);
                const totalNumberOfTasks = dayData.tasks.length;

                return `\nStatistics:\n- Total Work Duration: ${totalWorkDuration} hours\n` +
                    `- Time Spent on All Tasks: ${totalTasksDuration} hours\n` +
                    `- Free Time: ${freeTime} hours\n` +
                    `- Total Number of Tasks: ${totalNumberOfTasks}\n`;
            };

            Object.keys(data).forEach((date, index, array) => {
                textData += `Date: ${date}\nWork Hours: Start - ${data[date].workHours.start}, End - ${data[date].workHours.end}\nTasks:\n`;
                data[date].tasks.forEach(task => {
                    textData += `- ${task.name}, Duration: ${task.duration} minutes, Description: ${task.description}\n`;
                });
                // Append statistics for the day
                textData += appendStatisticsForDay(data[date]);
                // Add the separator after each day except the last one
                if (index < array.length - 1) {
                    textData += separator;
                }
            });

            return textData;
        },


        downloadFile(data, filename, type) {
            const datePrefix = new Date().toISOString().slice(0, 10); // Gets the current date in yyyy-mm-dd format
            const prefixedFilename = `${datePrefix}-${filename}`;

            const blob = new Blob([data], {type});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = prefixedFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        addPredefinedTask(task) {
            const taskWithTimestamp = { ...task, timestamp: Date.now(), isEditing: false };
            this.tasks.push(taskWithTimestamp);
            this.saveTasks();
        },
        addTask() {
            if (this.newTask.name) {
                // Convert duration to string for regex matching
                const durationAsString = this.newTask.duration.toString();
                const durationInMinutes = this.parseDuration(durationAsString);

                const taskWithTimestamp = {
                    ...this.newTask,
                    duration: durationInMinutes,
                    timestamp: Date.now(), // Add current timestamp
                    isEditing: false
                };
                this.tasks.push(taskWithTimestamp);
                // Reset newTask ensuring duration is treated as a string in future
                this.newTask = { name: '', duration: '5', description: '', category: 'Other' };
                this.saveTasks();
            }
        },

        deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                const taskIndex = this.tasks.findIndex(t => t.timestamp === taskId);
                if (taskIndex > -1) {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks(); // Persist the change
                }
            }
        },

        toggleEdit(taskId) {
            const task = this.tasks.find(t => t.timestamp === taskId);
            if (task) {
                task.isEditing = !task.isEditing;
                task.duration = this.formatDuration(task.duration);
            }
        },

        formatNumber(number, decimals = 2) {
            return number.toFixed(decimals);
        },

        saveTaskEdits(taskId) {
            const task = this.tasks.find(t => t.timestamp === taskId);
            if (task) {
                task.isEditing = false;
                task.duration = this.parseDuration(task.duration);
                this.saveTasks(); // Save all tasks to localStorage
            }
        },

        saveTasks() {
            // Retrieve the existing data or initialize an empty object
            let allData = JSON.parse(localStorage.getItem('taskManagerData')) || {};

            // Parse each task's duration before saving
            const parsedTasks = this.tasks.map(task => ({
                ...task,
                duration: this.parseDuration(task.duration.toString()) // Ensure duration is a string for regex matching
            }));

            // Update or create the entry for the current day with parsed tasks
            allData[this.viewDate] = {
                tasks: parsedTasks,
                workHours: this.workHours
            };

            // Save back to localStorage
            localStorage.setItem('taskManagerData', JSON.stringify(allData));
        },
        loadTasksForDate(date) {
            let allData = JSON.parse(localStorage.getItem('taskManagerData')) || {};
            if (allData[date]) {
                this.tasks = allData[date].tasks || [];
                this.workHours = allData[date].workHours || {start: '08:00', end: '16:00'};
            } else {
                this.tasks = [];
                this.workHours = {start: '08:00', end: '16:00'}; // Reset to default or keep as last loaded
            }
        }
    },
    mounted() {
        this.loadTasksForDate(this.currentDate); // Load tasks for today on application mount
    },
}).mount('#app');