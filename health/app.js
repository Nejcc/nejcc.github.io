const { createApp } = Vue;
const { createI18n } = VueI18n;

// Function to load locale messages from JSON files
const loadLocaleMessages = async () => {
    const locales = ['en', 'si'];
    const messages = {};
    for (const locale of locales) {
        const response = await fetch(`./i18n/${locale}/${locale}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${locale}/${locale}.json`);
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
                    vitals: {},
                    currentTab: 'home', // Track the current tab
                    currentLocale: localStorage.getItem('locale') || 'en', // Track the current locale
                    critical: false, // Track if the condition is critical
                    showSmsPanel: false, // Track if the SMS panel is shown
                    smsMessage: '', // SMS message content
                    location: null, // GPS location
                    address: '', // Address derived from GPS location
                    mapUrl: '', // URL for the map
                    settings: { // Personal settings
                        doctorNumber: localStorage.getItem('doctorNumber') || '',
                        medicalIdNumber: localStorage.getItem('medicalIdNumber') || '',
                        bloodType: localStorage.getItem('bloodType') || '',
                        name: localStorage.getItem('name') || '',
                        lastname: localStorage.getItem('lastname') || '',
                        sex: localStorage.getItem('sex') || '',
                        dateOfBirth: localStorage.getItem('dateOfBirth') || '',
                        doctorGender: localStorage.getItem('doctorGender') || 'male',
                        knownConditions: JSON.parse(localStorage.getItem('knownConditions')) || [],
                        additionalInfo: localStorage.getItem('additionalInfo') || ''
                    },
                    conditionsList: [
                        'asma', 'heart_problems', 'low_blood_sugar', 'epileptic'
                    ],
                    emergencyLevel: 0 // Progress bar for emergency severity
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
                        this.critical = false; // Reset critical status
                        this.emergencyLevel = 0; // Reset emergency level
                    } catch (error) {
                        console.error(error.message);
                        alert(`Failed to load ${qrd} questions.`);
                    }
                },
                selectOption(option) {
                    this.steps.push(this.currentQuestion.text + ": " + option.short);
                    if (option.next) {
                        this.currentQuestion = this.questions[option.next];
                    } else {
                        this.currentQuestion = null;
                    }
                    // Check if the condition is critical
                    if (option.short.toLowerCase().includes('severe') || option.short.toLowerCase().includes('critical')) {
                        this.critical = true;
                        this.emergencyLevel = 100;
                    } else {
                        this.emergencyLevel += 20; // Increase emergency level
                    }
                },
                submitInput() {
                    this.currentQuestion.input_fields.forEach(field => {
                        this.steps.push(`${field.label}: ${this.vitals[field.label]} ${field.unit}`);
                    });
                    if (this.currentQuestion.next) {
                        this.currentQuestion = this.questions[this.currentQuestion.next];
                    } else {
                        this.currentQuestion = null;
                    }
                    this.vitals = {};
                    this.emergencyLevel += 10; // Increase emergency level
                },
                reset() {
                    this.currentTab = 'home';
                    this.steps = [];
                    this.userInput = '';
                    this.vitals = {};
                    this.critical = false; // Reset critical status
                    this.emergencyLevel = 0; // Reset emergency level
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
                },
                callEmergency() {
                    const phoneNumber = this.$t('emergency_phone_number');
                    window.location.href = `tel:${phoneNumber}`;
                },
                showSmsPanel() {
                    this.prepareSmsMessage();
                    this.showSmsPanel = true;
                },
                hideSmsPanel() {
                    this.showSmsPanel = false;
                    this.smsMessage = '';
                },
                prepareSmsMessage() {
                    this.smsMessage = 'Emergency! Details:\n';
                    this.smsMessage += `Name: ${this.settings.name} ${this.settings.lastname}\n`;
                    this.smsMessage += `Sex: ${this.settings.sex}\n`;
                    this.smsMessage += `Date of Birth: ${this.settings.dateOfBirth}\n`;
                    this.smsMessage += `Medical ID: ${this.settings.medicalIdNumber}\n`;
                    this.smsMessage += `Blood Type: ${this.settings.bloodType}\n`;
                    this.smsMessage += `Known Conditions: ${this.settings.knownConditions.join(', ')}\n`;
                    this.smsMessage += `Additional Information: ${this.settings.additionalInfo}\n`;
                    this.steps.forEach(step => {
                        this.smsMessage += `${step.split(': ')[0]}: ${step.split(': ')[1]}\n`;
                    });
                    if (this.location) {
                        this.smsMessage += `Location: ${this.location.lat}, ${this.location.lng}\nAddress: ${this.address}`;
                    }
                },
                sendSms() {
                    const phoneNumber = this.$t('emergency_phone_number');
                    const smsBody = encodeURIComponent(this.smsMessage);
                    window.location.href = `sms:${phoneNumber}?body=${smsBody}`;
                    this.hideSmsPanel();
                },
                getGpsLocation() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(position => {
                            this.location = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            this.mapUrl = `https://www.google.com/maps?q=${this.location.lat},${this.location.lng}`;
                            this.fetchAddress();
                        }, error => {
                            console.error(error);
                        });
                    } else {
                        alert('Geolocation is not supported by this browser.');
                    }
                },
                async fetchAddress() {
                    try {
                        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.location.lat}&lon=${this.location.lng}`);
                        this.address = response.data.display_name;
                        this.prepareSmsMessage();
                    } catch (error) {
                        console.error('Error fetching address:', error);
                    }
                },
                quickEmergency(type) {
                    this.steps.push(`Quick Emergency for ${type === 'self' ? 'myself' : 'someone else'}`);
                    this.critical = true;
                    this.emergencyLevel = 100; // Set emergency level to max
                    this.getGpsLocation();
                },
                saveSettings() {
                    Object.keys(this.settings).forEach(key => {
                        if (key === 'knownConditions') {
                            localStorage.setItem(key, JSON.stringify(this.settings[key]));
                        } else {
                            localStorage.setItem(key, this.settings[key]);
                        }
                    });
                    alert(this.$t('settingsSaved'));
                }
            },
            watch: {
                critical(newVal) {
                    if (newVal) {
                        this.getGpsLocation();
                    }
                }
            }
        }).use(i18n).mount('#app');
    } catch (error) {
        console.error('Error loading locale messages or QRD questions:', error);
    }
})();
