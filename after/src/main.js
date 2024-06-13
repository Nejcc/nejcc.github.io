import Navbar from './components/Navbar.vue';
import HomePage from './pages/Home.vue';
import ServicesPage from './pages/Services.vue';
import AboutPage from './pages/About.vue';
import ContactPage from './pages/Contact.vue';

const translations = {
    en: {
        navbar: {
            home: "Home",
            services: "Services",
            about: "About",
            contact: "Contact"
        },
        welcome: {
            title: "Welcome to After.si",
            description: "Your trusted partner for business solutions, financial advising, job seeking assistance, web development, and custom application development.",
            more_info: "Learn More"
        },
        services: {
            title: "Our Services",
            business_solutions: "Business Solutions",
            financial_advising: "Financial Advising",
            job_seeking_help: "Job Seeking Help",
            web_development: "Web Development",
            custom_app_dev: "Custom Application Development"
        },
        about: {
            title: "About Us",
            description: "At After.si, we are committed to providing top-notch business solutions and services tailored to meet your needs. Our team of experts specializes in financial advising, job seeking assistance, web development, and custom application development. We aim to empower our clients to achieve their goals through innovative and effective solutions."
        },
        contact: {
            title: "Contact Us",
            name: "Name",
            email: "Email",
            message: "Message",
            submit: "Submit"
        }
    },
    sl: {
        navbar: {
            home: "Domov",
            services: "Storitve",
            about: "O nas",
            contact: "Kontakt"
        },
        welcome: {
            title: "Dobrodošli na After.si",
            description: "Vaš zaupanja vreden partner za poslovne rešitve, finančno svetovanje, pomoč pri iskanju zaposlitve, spletni razvoj in razvoj aplikacij po meri.",
            more_info: "Izvedite več"
        },
        services: {
            title: "Naše storitve",
            business_solutions: "Poslovne rešitve",
            financial_advising: "Finančno svetovanje",
            job_seeking_help: "Pomoč pri iskanju zaposlitve",
            web_development: "Spletni razvoj",
            custom_app_dev: "Razvoj aplikacij po meri"
        },
        about: {
            title: "O nas",
            description: "Na After.si smo zavezani zagotavljanju vrhunskih poslovnih rešitev in storitev, prilagojenih vašim potrebam. Naša ekipa strokovnjakov se specializira za finančno svetovanje, pomoč pri iskanju zaposlitve, spletni razvoj in razvoj aplikacij po meri. Naš cilj je, da svojim strankam omogočimo dosego ciljev s pomočjo inovativnih in učinkovitih rešitev."
        },
        contact: {
            title: "Kontaktirajte nas",
            name: "Ime",
            email: "E-pošta",
            message: "Sporočilo",
            submit: "Pošlji"
        }
    }
};

const app = Vue.createApp({
    data() {
        return {
            activePanel: 'home',
            language: 'en',
            translations: translations,
        };
    },
    computed: {
        t() {
            return this.translations[this.language];
        }
    },
    methods: {
        setActivePanel(panel) {
            this.activePanel = panel;
        },
        switchLanguage(lang) {
            this.language = lang;
        }
    },
    template: `
    <div>
      <navbar :t="t" @switch-panel="setActivePanel" @switch-language="switchLanguage"></navbar>
      <home-page v-if="activePanel === 'home'" :t="t"></home-page>
      <services-page v-if="activePanel === 'services'" :t="t"></services-page>
      <about-page v-if="activePanel === 'about'" :t="t"></about-page>
      <contact-page v-if="activePanel === 'contact'" :t="t"></contact-page>
    </div>
  `
});

app.component('navbar', Navbar);
app.component('home-page', HomePage);
app.component('services-page', ServicesPage);
app.component('about-page', AboutPage);
app.component('contact-page', ContactPage);

app.mount('#app');
