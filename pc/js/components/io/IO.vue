<template>
    <div>
        <h1>Test</h1>
    </div>
</template>

<script>
    import IO from "../IO.js";
    //copy this impor

    export default {
        date() {
            return {

                lcd: '',
                lcdVerb: '00',
                lcdNoun: '00',
                lcdProg: '01',
                lcdRel: '0000',
                calc: '',

                execute: '',
                output: '',

                // bank1: '',
                // bank2: '',
                // bank3: '',
                // bank4: '',

                registerA: '',
                registerB: '',
                registerLR: '',
                registerEB: '',
                registerFB: '',
                registerPC: '',
                registerBB: '',
                registerZero: '',

                verb: false,
                noun: false,
                prog: false,
                rel: false,

                classerror: '',

                progClasses: {},
                errorClasses: {},
                tempClasses: {},
                velClasses: {},
                stbyClasses: {},
                relClasses: {},
                restClasses: {},
                trackerClasses: {},

                watch: {
                    lcdVerb(newValue, oldValue) {
                        this.limitVariableLength(newValue, oldValue, 2, "lcdVerb");
                    },
                    lcdNoun(newValue, oldValue) {
                        this.limitVariableLength(newValue, oldValue, 2, "lcdNoun");
                    },
                    lcdProg(newValue, oldValue) {
                        this.limitVariableLength(newValue, oldValue, 2, "lcdProg");
                    },
                    lcdRel(newValue, oldValue) {
                        this.limitVariableLength(newValue, oldValue, 4, "lcdRel");
                    },
                },
                methods: {
                    limitVariableLength(newValue, oldValue, maxLength, variableName) {
                        if (newValue.length > maxLength) {
                            //Set variableName of this object to the old value which should be less than maxLength
                            Vue.set(this, variableName, oldValue);
                        }
                    },
                    // created: {
                    //     setInterval(() => this.tempError = 'error', 1000);
                    // },
                    pressButton(number) {
                        // console.log(number);

                        if (this.verb) {
                            this.lcdVerb = this.lcdVerb + number;
                        }
                        if (this.noun) {
                            this.lcdNoun = this.lcdNoun + number;
                        }
                        if (this.prog) {
                            this.lcdProg = this.lcdProg + number;
                        }
                        if (this.rel) {
                            this.lcdRel = this.lcdRel + number;
                        }
                    },

                    buttonClearPress() {
                        this.blinkLed(100, 1000, 'reset', 'progClasses').then(() => {
                            this.illuminateLed(1000, 'reset', 'progClasses').then(() => {
                                this.lcdVerb = '00';
                                this.lcdNoun = '00';
                            });
                        });
                    },

                    blinkLed(pulseInterval, duration, className, classVariableName) {
                        return new Promise((resolve, reject) => {
                            let newClassObject = {};
                            newClassObject[className] = true;

                            Vue.set(this, classVariableName, newClassObject);

                            let blinkingInterval = setInterval(() => {
                                newClassObject[className] = !newClassObject[className];

                                Vue.set(this, classVariableName, newClassObject);
                            }, pulseInterval);

                            setTimeout(() => {
                                clearInterval(blinkingInterval);
                                Vue.set(this, classVariableName, {});
                                resolve();
                            }, duration);
                        });
                    },

                    illuminateLed(duration, className, classVariableName) {
                        return new Promise((resolve, reject) => {
                            let newClassObject = {};
                            newClassObject[className] = true;

                            Vue.set(this, classVariableName, newClassObject);

                            setTimeout(() => {
                                Vue.set(this, classVariableName, {});
                                resolve();
                            }, duration);
                        });
                    },


                    blinkStby() {
                        this.progClasses = {reset: true};

                        let blinkingInterval = setInterval(() => {
                            this.progClasses.reset = !this.progClasses.reset;
                        }, 100);

                        setTimeout(() => {
                            clearInterval(blinkingInterval);
                            this.progClasses = {reset: true};
                            setTimeout(() => {
                                this.progClasses = {};
                            }, 600);
                        }, 1000);
                    },

                    btnEntr: function () {

                        this.blinkLed(100, 3000, 'reset', 'progClasses').then(() => {
                            this.illuminateLed(1000, 'reset', 'progClasses').then(() => {

                                console.log(this.lcdProg);

                                IO.send();
                                //now? bettr
                                // how to inport this class now in  numpad.js?
                                //this will work i hope
                                //hmm i will not know what is what couse i will have same methods
                                //why this function is not accessable
                                //  mabye because is not on the file ? idk ?
                                // do i need to have vue logic  in APP.js ? no

                                if (this.lcdProg == '19') {
                                    console.log('19');
                                    //load
                                    if (this.lcdVerb == '15') {
                                        console.log('18');
                                        //bank A
                                        if (this.lcdNoun == '01') {
                                            console.log('01');
                                            console.log(this.registerA);
                                            this.lcdRel = this.registerA;
                                        }
                                        else if (this.lcdNoun == '02') {
                                            console.log('Load');
                                            this.lcdRel = this.registerB;
                                        }
                                    }
                                    //store
                                    else if (this.lcdVerb == '24') {
                                        console.log('24');
                                        //bank a
                                        if (this.lcdNoun == '01') {
                                            console.log(' noun 01');
                                            console.log(this.lcdRel);
                                            this.registerA = this.lcdRel;
                                        }
                                        else if (this.lcdNoun == '02') {
                                            console.log('noun 02');
                                            this.registerB = this.lcdRel;
                                        }
                                        else if (this.lcdNoun == '24') {
                                            console.log('noun 24');
                                            if (this.lcdRel == '01')
                                                this.registerA = this.registerA++;
                                            else if (this.lcdRel == '02')
                                                this.registerA = this.registerA--;
                                            else
                                                this.registerA = this.lcdRel
                                        }
                                        else if (this.lcdNoun == '25') {
                                            console.log('noun 25');
                                            if (this.lcdRel == '01')
                                                this.registerB = this.registerB++;
                                            else if (this.lcdRel == '02')
                                                this.registerB = this.registerB--;
                                            else
                                                this.registerB = this.lcdRel
                                        }
                                        this.lcdRel = '0000';
                                    }
                                    else if (this.lcdVerb == '35') {
                                        //Swoitch bank A and B
                                        if (this.lcdNoun == '00') {
                                            this.registerPC = this.registerA;
                                            this.registerA = this.registerB;
                                            this.registerB = this.registerPC;
                                        }

                                    }
                                    else {
                                        console.log('error');
                                        this.blinkLed(100, 1000, 'reset', 'errorClasses').then(() => {
                                            this.illuminateLed(1000, 'reset', 'errorClasses').then(() => {
                                                this.lcdVerb = '00';
                                                this.lcdNoun = '00';
                                            });
                                        });
                                    }

                                }
                                else {
                                    console.log('error');

                                    this.illuminateLed(3000, 'error', 'errorClasses').then(() => {
                                        this.lcdVerb = '00';
                                        this.lcdNoun = '00';
                                    });

                                }
                                console.log('End calcualtion');

                                //Clear display
                                this.lcdNoun = '00';
                                this.lcdVerb = '00';
                                // this.lcdRel = '0000';
                            });
                        });


                    },
                    btnVerb: function () {

                        this.illuminateLed(5000, 'reset', 'velClasses').then(() => {

                        });

                        if (this.lcdVerb == '00')
                            this.lcdVerb = '';

                        this.verb = true;
                        this.noun = false;
                        this.prog = false;
                        this.rel = false;


                        this.lcd = this.lcd + this.lcdVerb;

                    },
                    btnNoun: function () {

                        this.illuminateLed(5000, 'reset', 'velClasses').then(() => {

                        });

                        if (this.lcdNoun == '00')
                            this.lcdNoun = '';

                        this.verb = false;
                        this.noun = true;
                        this.prog = false;
                        this.rel = false;
                        this.lcd = this.lcd + this.lcdNoun;

                    },
                    btnProg: function () {
                        this.verb = false;
                        this.noun = false;
                        this.prog = true;
                        this.rel = false;
                        this.lcdProg = '';
                        // this.lcd = this.lcd + 'P';
                    },
                    btnRel: function () {
                        this.verb = false;
                        this.noun = false;
                        this.prog = false;
                        this.rel = true;
                        this.lcdRel = '';
                        // this.lcd = this.lcd + 'R';
                    },

                    btnReset: function () {
                        this.lcdVerb = '00';
                        this.lcdNoun = '00';
                        this.lcdRel = '00';
                        this.classerror = '';
                        this.execute = '';

                        this.blinkLed(100, 1000, 'error', 'restClasses').then(() => {
                            this.illuminateLed(1000, 'error', 'restClasses').then(() => {

                            });
                        });
                    }
                }
            }
</script>
<styles scoped>
    this
</styles>