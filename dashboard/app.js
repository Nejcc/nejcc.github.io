const { createApp } = Vue;

createApp({
  data() {
    return {
      searchTerm: '',
      showAddForm: false,
      showSettingsModal: false,
      showEditModal: false,
      editLinkData: {},
      editLinkIndex: null,
      newLink: {
        url: '',
        title: '',
        description: '',
        categories: '',
        tags: '',
      },
      links: []
    };
  },
  created() {
    // Load links from localStorage when the app is created
    const storedLinks = localStorage.getItem('homelabLinks');
    if (storedLinks) {
      this.links = JSON.parse(storedLinks);
    }
  },
  computed: {
    filteredLinks() {
      return this.links.filter(link => {
        return link.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          link.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          link.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          link.categories.some(category => category.toLowerCase().includes(this.searchTerm.toLowerCase()));
      });
    }
  },
  methods: {
    handleSearch() {
      if (this.filteredLinks.length === 0 && this.searchTerm) {
        console.log('No results found. Consider adding a new link.');
      }
    },
    addLink() {
      const link = {
        ...this.newLink,
        categories: this.newLink.categories.split(',').map(c => c.trim()),
        tags: this.newLink.tags.split(',').map(t => t.trim()),
        usageCount: 0
      };
      this.links.push(link);
      this.updateLocalStorage();
      this.resetNewLinkForm();
    },
    addLinkFromSearch() {
      this.newLink.url = this.searchTerm;
      this.newLink.title = this.searchTerm;
      this.showAddForm = true;
    },
    resetNewLinkForm() {
      this.newLink = { url: '', title: '', description: '', categories: '', tags: '' };
      this.showAddForm = false;
      this.searchTerm = ''; // Clear search term when the form is closed
    },
    incrementUsageAndOpenLink(index) {
      // Increment usage count
      this.links[index].usageCount += 1;
      this.updateLocalStorage();

      // Open link in a new tab
      window.open(this.links[index].url, '_blank');
    },
    editLink(index) {
      this.editLinkData = { ...this.links[index] };
      this.editLinkIndex = index;
      this.showEditModal = true;
    },
    saveEdit() {
      this.links[this.editLinkIndex] = { ...this.editLinkData };
      this.updateLocalStorage();
      this.closeEditModal();
    },
    deleteLink(index) {
      this.links.splice(index, 1);
      this.updateLocalStorage();
      this.closeEditModal();
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editLinkData = {};
      this.editLinkIndex = null;
    },
    exportJSON() {
      const dataStr = JSON.stringify(this.links, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'homelab_links.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },
    importJSON(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const importedData = JSON.parse(e.target.result);
        this.links = importedData;
        this.updateLocalStorage();
      };

      reader.readAsText(file);
    },
    updateLocalStorage() {
      localStorage.setItem('homelabLinks', JSON.stringify(this.links));
    },
    goToDashboard() {
      this.searchTerm = '';
      this.showAddForm = false;
    },
    openSettingsModal() {
      this.showSettingsModal = true;
    },
    closeSettingsModal() {
      this.showSettingsModal = false;
    }
  }
}).mount('#app');
