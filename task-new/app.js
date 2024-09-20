// app.js
const { createApp } = Vue;

createApp({
  data() {
    return {
      users: [], // All users
      currentUser: '', // Selected user
      // Default user setup
      defaultUser: {
        name: 'Default User',
        tasks: [],
        templates: [],
      },
      commonTasks: [
        { title: 'Email Correspondence', avgTime: 30 },
        { title: 'Team Meeting', avgTime: 60 },
        // Add more common tasks as needed
      ],
      arrivalTime: '',
      departureTime: '',
      selectedDate: new Date().toISOString().substr(0, 10), // Default to today's date
      totalEffectiveHours: 6,
      searchQuery: '',
      modalTitle: 'Add New Task',
      taskForm: {
        title: '',
        time: 0,
        description: '',
        tags: '',
        date: '',
        status: 'Open', // Default status
      },
      editingTaskIndex: null,
      // Template related data
      templateModalTitle: 'Add New Template',
      templateForm: {
        title: '',
        time: 0,
        description: '',
        tags: '',
      },
      editingTemplateIndex: null,
      // Alert related data
      alertMessage: '',
      alertType: 'success', // 'success', 'danger', 'warning', 'info'
      showAlert: false,
      // Add User Modal Data
      newUserName: '',
      addUserModalTitle: 'Add New User',
      // Filter Data
      filterStatus: 'All', // Default filter
      statusOptions: ['All', 'Open', 'In Progress', 'Completed', 'On Hold', 'In Review', 'Rejected', 'Approved'],
    };
  },
  computed: {
    // Get current user's tasks and templates
    currentUserData() {
      return this.users.find(user => user.name === this.currentUser) || this.defaultUser;
    },
    filteredTasks() {
      // Filter tasks based on the selected date and status
      return this.currentUserData.tasks.filter(task => {
        const dateMatch = task.date === this.selectedDate;
        const statusMatch = this.filterStatus === 'All' || task.status === this.filterStatus;
        return dateMatch && statusMatch;
      });
    },
    totalTime() {
      // Calculate the total time spent on tasks for the selected date and filter
      return this.filteredTasks.reduce((sum, task) => sum + task.time, 0);
    },
    remainingEffectiveTime() {
      // Calculate the remaining effective time
      return this.totalEffectiveHours * 60 - this.totalTime;
    },
    shiftDuration() {
      // Calculate the total shift duration based on arrival and departure times
      if (this.arrivalTime && this.departureTime) {
        const [startH, startM] = this.arrivalTime.split(':').map(Number);
        const [endH, endM] = this.departureTime.split(':').map(Number);
        const start = new Date();
        start.setHours(startH, startM, 0, 0);
        const end = new Date();
        end.setHours(endH, endM, 0, 0);
        return (end - start) / (1000 * 60); // Duration in minutes
      }
      return 0;
    },
    searchResults() {
      if (!this.searchQuery) return [];

      const query = this.searchQuery.toLowerCase();

      // Search across all users
      let results = [];
      this.users.forEach(user => {
        const userResults = user.tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query) ||
            task.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            task.status.toLowerCase().includes(query)
        ).map(task => ({ ...task, user: user.name }));
        results = results.concat(userResults);
      });

      return results;
    },
    groupedSearchResults() {
      return this.searchResults.reduce((groups, task) => {
        if (!groups[task.date]) {
          groups[task.date] = [];
        }
        groups[task.date].push(task);
        return groups;
      }, {});
    },
    // Advanced Statistics
    totalTasks() {
      return this.currentUserData.tasks.length;
    },
    averageTaskTime() {
      if (this.currentUserData.tasks.length === 0) return 0;
      const total = this.currentUserData.tasks.reduce((sum, task) => sum + task.time, 0);
      return Math.round(total / this.currentUserData.tasks.length);
    },
    tasksPerTag() {
      const tagCount = {};
      this.currentUserData.tasks.forEach(task => {
        task.tags.forEach(tag => {
          if (tag) {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        });
      });
      return tagCount;
    },
    tasksOverTime() {
      const result = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().substr(0, 10);
        result[dateStr] = this.currentUserData.tasks.filter(task => task.date === dateStr).length;
      }
      return result;
    },
  },
  methods: {
    // Alert Methods
    showAlertMethod(message, type = 'success') {
      this.alertMessage = message;
      this.alertType = type;
      this.showAlert = true;
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.showAlert = false;
      }, 5000);
    },
    closeAlert() {
      this.showAlert = false;
    },
    // User Management Methods
    addUserModal() {
      const modal = new bootstrap.Modal(this.$refs.addUserModal);
      modal.show();
    },
    saveNewUser() {
      const name = this.newUserName.trim();
      if (!name) {
        this.showAlertMethod('User name cannot be empty.', 'warning');
        return;
      }
      if (this.users.find(user => user.name === name)) {
        this.showAlertMethod('User already exists.', 'warning');
        return;
      }
      this.users.push({
        name,
        tasks: [],
        templates: [],
      });
      this.currentUser = name;
      this.newUserName = ''; // Reset input
      this.saveData();
      const modal = bootstrap.Modal.getInstance(this.$refs.addUserModal);
      modal.hide();
      this.showAlertMethod(`User "${name}" added and selected successfully.`, 'success');
    },
    deleteUser(index) {
      const user = this.users[index];
      if (confirm(`Are you sure you want to delete the user "${user.name}" and all their data?`)) {
        this.users.splice(index, 1);
        if (this.currentUser === user.name) {
          this.currentUser = this.users.length > 0 ? this.users[0].name : '';
        }
        this.saveData();
        this.showAlertMethod(`User "${user.name}" deleted successfully.`, 'success');
      }
    },
    switchUser(event) {
      this.currentUser = event.target.value;
    },
    // Task Modal Methods
    openTaskModal(task = null) {
      if (task) {
        // Edit existing task
        this.modalTitle = 'Edit Task';
        this.taskForm = {
          ...task,
          tags: task.tags.join(', '),
        };
        this.editingTaskIndex = this.currentUserData.tasks.indexOf(task);
      } else {
        // Add new task
        this.modalTitle = 'Add New Task';
        this.taskForm = {
          title: '',
          time: 0,
          description: '',
          tags: '',
          date: this.selectedDate,
          status: 'Open', // Default status
        };
        this.editingTaskIndex = null;
      }
      const modal = new bootstrap.Modal(this.$refs.taskModal);
      modal.show();
    },
    saveTask() {
      // Validation
      if (!this.taskForm.title.trim()) {
        this.showAlertMethod('Task title is required.', 'warning');
        return;
      }
      if (this.taskForm.time <= 0) {
        this.showAlertMethod('Task time must be greater than 0.', 'warning');
        return;
      }

      const tagsArray = this.taskForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const taskData = {
        title: this.taskForm.title,
        time: this.taskForm.time,
        description: this.taskForm.description,
        tags: tagsArray,
        date: this.taskForm.date || this.selectedDate,
        status: this.taskForm.status || 'Open',
        user: this.currentUser, // Associate task with current user
      };

      if (this.editingTaskIndex !== null) {
        // Update existing task
        this.currentUserData.tasks.splice(this.editingTaskIndex, 1, taskData);
        this.showAlertMethod(`Task "${taskData.title}" updated successfully.`, 'success');
      } else {
        // Add new task
        this.currentUserData.tasks.push(taskData);
        this.showAlertMethod(`Task "${taskData.title}" added successfully.`, 'success');
      }

      this.saveData();

      const modal = bootstrap.Modal.getInstance(this.$refs.taskModal);
      modal.hide();
    },
    addCommonTask(commonTask) {
      const taskData = {
        title: commonTask.title,
        time: commonTask.avgTime,
        description: '',
        tags: [],
        date: this.selectedDate,
        status: 'Open',
        user: this.currentUser,
      };
      this.currentUserData.tasks.push(taskData);
      this.saveData();
      this.showAlertMethod(`Common task "${commonTask.title}" added successfully.`, 'success');
    },
    deleteTask(index) {
      const task = this.filteredTasks[index];
      const taskIndex = this.currentUserData.tasks.indexOf(task);
      if (taskIndex > -1) {
        if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
          this.currentUserData.tasks.splice(taskIndex, 1);
          this.saveData();
          this.showAlertMethod(`Task "${task.title}" deleted successfully.`, 'success');
        }
      }
    },
    // Prefab (Template) Methods
    createPrefab(task) {
      const existingTemplate = this.currentUserData.templates.find(t => t.title === task.title && t.time === task.time);
      if (existingTemplate) {
        this.showAlertMethod('A template with the same title and time already exists.', 'warning');
        return;
      }

      const newTemplate = {
        title: task.title,
        time: task.time,
        description: task.description,
        tags: [...task.tags],
      };

      this.currentUserData.templates.push(newTemplate);
      this.saveData();
      this.showAlertMethod(`Template "${task.title}" created successfully.`, 'success');
    },
    openTemplateModal(template = null, index = null) {
      if (template) {
        // Edit existing template
        this.templateModalTitle = 'Edit Template';
        this.templateForm = {
          title: template.title,
          time: template.time,
          description: template.description,
          tags: template.tags.join(', '),
        };
        this.editingTemplateIndex = index;
      } else {
        // Add new template
        this.templateModalTitle = 'Add New Template';
        this.templateForm = {
          title: '',
          time: 0,
          description: '',
          tags: '',
        };
        this.editingTemplateIndex = null;
      }
      const modal = new bootstrap.Modal(this.$refs.templateModal);
      modal.show();
    },
    saveTemplate() {
      const tagsArray = this.templateForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const templateData = {
        title: this.templateForm.title,
        time: this.templateForm.time,
        description: this.templateForm.description,
        tags: tagsArray,
      };

      if (this.editingTemplateIndex !== null) {
        // Update existing template
        this.currentUserData.templates.splice(this.editingTemplateIndex, 1, templateData);
        this.showAlertMethod(`Template "${templateData.title}" updated successfully.`, 'success');
      } else {
        // Add new template
        this.currentUserData.templates.push(templateData);
        this.showAlertMethod(`Template "${templateData.title}" created successfully.`, 'success');
      }

      this.saveData();

      const modal = new bootstrap.Modal(this.$refs.templateModal);
      modal.hide();
    },
    addTaskFromTemplate(template) {
      const taskData = {
        title: template.title,
        time: template.time,
        description: template.description,
        tags: [...template.tags],
        date: this.selectedDate,
        status: 'Open',
        user: this.currentUser,
      };
      this.currentUserData.tasks.push(taskData);
      this.saveData();
      this.showAlertMethod(`Task "${template.title}" added from template.`, 'success');
    },
    deleteTemplate(index) {
      if (confirm('Are you sure you want to delete this template?')) {
        const deletedTemplate = this.currentUserData.templates.splice(index, 1)[0];
        this.saveData();
        this.showAlertMethod(`Template "${deletedTemplate.title}" deleted successfully.`, 'success');
      }
    },
    // Statistics Modal Methods
    openStatisticsModal() {
      const modal = new bootstrap.Modal(this.$refs.statisticsModal);
      modal.show();
    },
    // Settings Modal Methods
    openSettingsModal() {
      const modal = new bootstrap.Modal(this.$refs.settingsModal);
      modal.show();
    },
    exportTasks() {
      const data = {
        users: this.users,
        currentUser: this.currentUser,
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
      };

      // Create a temporary object for export
      const exportData = {
        allUsers: data,
      };

      // Prompt user to choose export type
      // Instead of using prompt, we'll provide options in the UI
      // For simplicity, we'll use a simple prompt here
      const exportType = prompt('Enter "all" to export all users or "current" to export only your tasks:', 'all');
      if (exportType === null) return; // Cancelled

      if (exportType.toLowerCase() === 'all') {
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskManagerData_AllUsers.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showAlertMethod('All users tasks exported successfully.', 'success');
      } else if (exportType.toLowerCase() === 'current') {
        const currentData = {
          users: this.users.filter(user => user.name === this.currentUser),
          arrivalTime: this.arrivalTime,
          departureTime: this.departureTime,
        };
        const currentDataStr = JSON.stringify(currentData, null, 2);
        const currentBlob = new Blob([currentDataStr], { type: 'application/json' });
        const currentUrl = URL.createObjectURL(currentBlob);
        const currentLink = document.createElement('a');
        currentLink.href = currentUrl;
        currentLink.download = `taskManagerData_${this.currentUser}.json`;
        currentLink.click();
        URL.revokeObjectURL(currentUrl);
        this.showAlertMethod('Current user tasks exported successfully.', 'success');
      } else {
        this.showAlertMethod('Invalid export type selected.', 'warning');
      }
    },
    importTasks(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.allUsers && importedData.allUsers.users && Array.isArray(importedData.allUsers.users)) {
              // Determine import type
              const importType = prompt('Enter "all" to import all users or "current" to import only your tasks:', 'all');
              if (importType === null) return; // Cancelled

              if (importType.toLowerCase() === 'all') {
                // Merge users
                importedData.allUsers.users.forEach(importedUser => {
                  const existingUser = this.users.find(user => user.name === importedUser.name);
                  if (existingUser) {
                    // Merge tasks
                    importedUser.tasks.forEach(task => {
                      if (!existingUser.tasks.find(t => t.title === task.title && t.date === task.date && t.status === task.status)) {
                        existingUser.tasks.push(task);
                      }
                    });
                    // Merge templates
                    importedUser.templates.forEach(template => {
                      if (!existingUser.templates.find(t => t.title === template.title && t.time === template.time)) {
                        existingUser.templates.push(template);
                      }
                    });
                  } else {
                    // Add new user
                    this.users.push(importedUser);
                  }
                });
                this.arrivalTime = importedData.allUsers.arrivalTime || this.arrivalTime;
                this.departureTime = importedData.allUsers.departureTime || this.departureTime;
                this.saveData();
                this.showAlertMethod('All users tasks imported successfully.', 'success');
              } else if (importType.toLowerCase() === 'current') {
                const currentUserData = importedData.allUsers.users.find(user => user.name === this.currentUser);
                if (currentUserData) {
                  // Merge tasks
                  currentUserData.tasks.forEach(task => {
                    if (!this.currentUserData.tasks.find(t => t.title === task.title && t.date === task.date && t.status === task.status)) {
                      this.currentUserData.tasks.push(task);
                    }
                  });
                  // Merge templates
                  currentUserData.templates.forEach(template => {
                    if (!this.currentUserData.templates.find(t => t.title === template.title && t.time === template.time)) {
                      this.currentUserData.templates.push(template);
                    }
                  });
                  this.arrivalTime = importedData.allUsers.arrivalTime || this.arrivalTime;
                  this.departureTime = importedData.allUsers.departureTime || this.departureTime;
                  this.saveData();
                  this.showAlertMethod('Current user tasks imported successfully.', 'success');
                } else {
                  this.showAlertMethod('No matching user found for current user in the imported data.', 'danger');
                }
              } else {
                this.showAlertMethod('Invalid import type selected.', 'warning');
              }
            } else {
              this.showAlertMethod('Invalid tasks data in the file.', 'danger');
            }
          } catch (error) {
            this.showAlertMethod('Error parsing the imported file.', 'danger');
          }
        };
        reader.readAsText(file);
      }
    },
    // Report Generation
    generateReport(format, scope) {
      if (format === 'txt') {
        this.generateTXTReport(scope);
      }
      // Removed PDF generation as per the requirement
    },
    generateTXTReport(scope) {
      let tasksToExport = [];

      if (scope === 'now') {
        tasksToExport = this.filteredTasks;
      } else if (scope === 'all') {
        // Export all tasks across all users
        this.users.forEach(user => {
          user.tasks.forEach(task => {
            tasksToExport.push({ ...task, user: user.name });
          });
        });
      }

      if (tasksToExport.length === 0) {
        this.showAlertMethod('No tasks available to export.', 'warning');
        return;
      }

      let reportContent = 'Task Report\n\n';
      tasksToExport.forEach((task, index) => {
        reportContent += `${index + 1}. ${scope === 'all' ? `[${task.user}] ` : ''}${task.title} - ${this.formatTime(
          task.time
        )} - Status: ${task.status}\n`;
        if (task.description) {
          reportContent += `Description: ${task.description}\n`;
        }
        if (task.tags.length > 0) {
          reportContent += `Tags: ${task.tags.join(', ')}\n`;
        }
        reportContent += `Date: ${task.date}\n`;
        reportContent += '\n';
      });
      const totalTime = scope === 'now' ? this.totalTime : this.users.reduce((sum, user) => sum + user.tasks.reduce((s, t) => s + t.time, 0), 0);
      reportContent += `Total Time Spent: ${this.formatTime(totalTime)}\n`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const link = document.createElement('a');

      const fileName = scope === 'now' ? 'Task_Report_Today.txt' : 'Task_Report_All.txt';
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      this.showAlertMethod(`TXT report "${fileName}" generated successfully.`, 'success');
    },
    // Utility Method
    formatTime(totalMinutes) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h:${minutes}m`;
    },
    // Data Persistence
    saveData() {
      const data = {
        users: this.users,
        currentUser: this.currentUser,
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
      };
      localStorage.setItem('taskManagerData', JSON.stringify(data));
    },
    loadData() {
      const data = JSON.parse(localStorage.getItem('taskManagerData'));
      if (data) {
        this.users = data.users || [];
        this.currentUser = data.currentUser || (this.users.length > 0 ? this.users[0].name : '');
        this.arrivalTime = data.arrivalTime || '';
        this.departureTime = data.departureTime || '';
      } else {
        // Initialize with default user
        this.users.push(this.defaultUser);
        this.currentUser = this.defaultUser.name;
        this.saveData();
      }
    },
    // Quick Status Change Method
    changeTaskStatus(task, newStatus) {
      const taskIndex = this.currentUserData.tasks.indexOf(task);
      if (taskIndex > -1) {
        this.currentUserData.tasks[taskIndex].status = newStatus;
        this.saveData();
        this.showAlertMethod(`Task "${task.title}" status updated to "${newStatus}".`, 'success');
      }
    },
  },
  watch: {
    arrivalTime() {
      this.saveData();
    },
    departureTime() {
      this.saveData();
    },
    users: {
      handler() {
        this.saveData();
      },
      deep: true,
    },
  },
  mounted() {
    this.loadData();
  },
}).mount('#app');
