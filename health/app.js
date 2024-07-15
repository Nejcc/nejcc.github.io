const { createApp } = Vue;
const { createI18n } = VueI18n;

// Function to load locale messages from JSON files
const loadLocaleMessages = async () => {
    const locales = ['en', 'es', 'de', 'fr', 'si', 'hr', 'it', 'ru', 'uk'];
    const messages = {};
    for (const locale of locales) {
        const response = await fetch(`./i18n/${locale}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${locale}.json`);
        }
        messages[locale] = await response.json();
    }
    return messages;
};

(async () => {
    try {
        const messages = await loadLocaleMessages();

        const i18n = createI18n({
            locale: localStorage.getItem('locale') || 'en', // set locale
            fallbackLocale: 'en', // set fallback locale
            messages, // set locale messages
        });

        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                createApp({
                    data() {
                        return {
                            questions: data,
                            currentQuestion: null,
                            steps: [],
                            userInput: '',
                            currentTab: 'home', // Track the current tab
                            currentLocale: localStorage.getItem('locale') || 'en' // Track the current locale
                        };
                    },
                    created() {
                        this.currentQuestion = this.questions.start;
                        i18n.global.locale = this.currentLocale; // Set the initial locale
                    },
                    methods: {
                        startInstructions() {
                            this.currentTab = 'instructions';
                            this.currentQuestion = this.questions.start;
                        },
                        selectOption(option) {
                            this.steps.push(this.currentQuestion.text + ": " + option.short);
                            if (option.next) {
                                this.currentQuestion = this.questions[option.next];
                            } else {
                                this.currentQuestion = null;
                            }
                        },
                        submitInput() {
                            this.steps.push(this.currentQuestion.text + ": " + this.userInput + " bpm");
                            if (this.currentQuestion.next) {
                                this.currentQuestion = this.questions[this.currentQuestion.next];
                            } else {
                                this.currentQuestion = null;
                            }
                            this.userInput = '';
                        },
                        reset() {
                            this.currentTab = 'home';
                            this.currentQuestion = this.questions.start;
                            this.steps = [];
                            this.userInput = '';
                        },
                        setLocale(locale) {
                            this.currentLocale = locale;
                            i18n.global.locale = locale;
                            localStorage.setItem('locale', locale);
                        },
                        clearLocalStorage() {
                            localStorage.clear();
                            alert(this.$t('clearDataMessage'));
                            this.reset();
                        }
                    }
                }).use(i18n).mount('#app');
            });
    } catch (error) {
        console.error('Error loading locale messages:', error);
    }
})();
