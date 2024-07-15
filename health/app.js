const { createApp } = Vue;
const { createI18n } = VueI18n;

// Function to load locale messages from JSON files
const loadLocaleMessages = async () => {
    const locales = ['en', 'si'];
    const messages = {};
    for (const locale of locales) {
        const response = await fetch(`./i18n/${locale}/questions.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${locale}/questions.json`);
        }
        messages[locale] = await response.json();
    }
    return messages;
};

// Function to load QRD questions from JSON files
const loadQRDQuestions = async (locale, qrd) => {
    const response = await fetch(`./i18n/${locale}/questions/${qrd}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ${qrd}.json`);
    }
    return await response.json();
};

(async () => {
    try {
        const messages = await loadLocaleMessages();

        const i18n = createI18n({
            locale: localStorage.getItem('locale') || 'en', // set locale
            fallbackLocale: 'en', // set fallback locale
            messages, // set locale messages
        });

        createApp({
            data() {
                return {
                    questions: null,
                    currentQuestion: null,
                    steps: [],
                    userInput: '',
                    currentTab: 'home', // Track the current tab
                    currentLocale: localStorage.getItem('locale') || 'en' // Track the current locale
                };
            },
            created() {
                i18n.global.locale = this.currentLocale; // Set the initial locale
            },
            methods: {
                async selectQRD(qrd) {
                    try {
                        this.questions = await loadQRDQuestions(this.currentLocale, qrd);
                        this.currentQuestion = this.questions.start;
                        this.currentTab = 'instructions';
                    } catch (error) {
                        console.error(error.message);
                        alert(`Failed to load ${qrd} questions.`);
                    }
                },
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
    } catch (error) {
        console.error('Error loading locale messages or QRD questions:', error);
    }
})();
