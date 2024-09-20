// app.js
const { createApp } = Vue;

createApp({
  data() {
    return {
      tasks: [], // All tasks
      templates: [], // All templates
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
    };
  },
  computed: {
    filteredTasks() {
      // Filter tasks based on the selected date
      return this.tasks.filter(
        (task) => task.date === this.selectedDate
      );
    },
    totalTime() {
      // Calculate the total time spent on tasks for the selected date
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

      return this.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
      );
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
      return this.tasks.length;
    },
    averageTaskTime() {
      if (this.tasks.length === 0) return 0;
      const total = this.tasks.reduce((sum, task) => sum + task.time, 0);
      return Math.round(total / this.tasks.length);
    },
    tasksPerTag() {
      const tagCount = {};
      this.tasks.forEach(task => {
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
        result[dateStr] = this.tasks.filter(task => task.date === dateStr).length;
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
    // Task Modal Methods
    openTaskModal(task = null) {
      if (task) {
        // Edit existing task
        this.modalTitle = 'Edit Task';
        this.taskForm = {
          ...task,
          tags: task.tags.join(', '),
        };
        this.editingTaskIndex = this.tasks.indexOf(task);
      } else {
        // Add new task
        this.modalTitle = 'Add New Task';
        this.taskForm = {
          title: '',
          time: 0,
          description: '',
          tags: '',
          date: this.selectedDate,
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
      };

      if (this.editingTaskIndex !== null) {
        // Update existing task
        this.tasks.splice(this.editingTaskIndex, 1, taskData);
        this.showAlertMethod(`Task "${taskData.title}" updated successfully.`, 'success');
      } else {
        // Add new task
        this.tasks.push(taskData);
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
      };
      this.tasks.push(taskData);
      this.saveData();
      this.showAlertMethod(`Common task "${commonTask.title}" added successfully.`, 'success');
    },
    deleteTask(index) {
      const task = this.filteredTasks[index];
      const taskIndex = this.tasks.indexOf(task);
      if (taskIndex > -1) {
        if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
          this.tasks.splice(taskIndex, 1);
          this.saveData();
          this.showAlertMethod(`Task "${task.title}" deleted successfully.`, 'success');
        }
      }
    },
    // Prefab (Template) Methods
    createPrefab(task) {
      const existingTemplate = this.templates.find(t => t.title === task.title && t.time === task.time);
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

      this.templates.push(newTemplate);
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
        this.templates.splice(this.editingTemplateIndex, 1, templateData);
        this.showAlertMethod(`Template "${templateData.title}" updated successfully.`, 'success');
      } else {
        // Add new template
        this.templates.push(templateData);
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
      };
      this.tasks.push(taskData);
      this.saveData();
      this.showAlertMethod(`Task "${template.title}" added from template.`, 'success');
    },
    deleteTemplate(index) {
      if (confirm('Are you sure you want to delete this template?')) {
        const deletedTemplate = this.templates.splice(index, 1)[0];
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
      const dataStr = JSON.stringify({
        tasks: this.tasks,
        templates: this.templates,
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
      }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'taskManagerData.json';
      link.click();
      URL.revokeObjectURL(url);
      this.showAlertMethod('Tasks exported successfully.', 'success');
    },
    importTasks(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.tasks && Array.isArray(importedData.tasks)) {
              this.tasks = importedData.tasks;
              this.templates = importedData.templates || [];
              this.arrivalTime = importedData.arrivalTime || '';
              this.departureTime = importedData.departureTime || '';
              this.saveData();
              this.showAlertMethod('Tasks imported successfully.', 'success');
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
        tasksToExport = this.tasks;
      }

      if (tasksToExport.length === 0) {
        this.showAlertMethod('No tasks available to export.', 'warning');
        return;
      }

      let reportContent = 'Task Report\n\n';
      tasksToExport.forEach((task, index) => {
        reportContent += `${index + 1}. ${task.title} - ${this.formatTime(
          task.time
        )}\n`;
        if (task.description) {
          reportContent += `Description: ${task.description}\n`;
        }
        if (task.tags.length > 0) {
          reportContent += `Tags: ${task.tags.join(', ')}\n`;
        }
        reportContent += `Date: ${task.date}\n`;
        reportContent += '\n';
      });
      const totalTime = scope === 'now' ? this.totalTime : this.tasks.reduce((sum, task) => sum + task.time, 0);
      reportContent += `Total Time Spent: ${this.formatTime(totalTime)}\n`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = scope === 'now' ? 'Task_Report_Today.txt' : 'Task_Report_All.txt';
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
        tasks: this.tasks,
        templates: this.templates,
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
      };
      localStorage.setItem('taskManagerData', JSON.stringify(data));
    },
    loadData() {
      const data = JSON.parse(localStorage.getItem('taskManagerData'));
      if (data) {
        this.tasks = data.tasks || [];
        this.templates = data.templates || [];
        this.arrivalTime = data.arrivalTime || '';
        this.departureTime = data.departureTime || '';
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
    tasks: {
      handler() {
        this.saveData();
      },
      deep: true,
    },
    templates: {
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
