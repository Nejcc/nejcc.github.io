<template>
<div class="col-sm-8">
    <div class="standard-buttons container-fluid">
    <div class="row button-row">
    <div class="col-xs-1">
    <button id="num-7" class="btn num" title="7" @click="pressButton(7)">
    7
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-8" class="btn num" title="8" @click="pressButton(8)">
    8
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-9" class="btn num" title="9" @click="pressButton(9)">
    9
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-clr" class="btn" title="clr" @click="buttonClearPress">
    CLR
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-enter" class="btn button-red" title="enter" @click="btnEntr">
    Entr
    </button>
    </div>
    </div>
    <div class="row button-row">
    <div class="col-xs-1">
    <button id="num-4" class="btn num" title="4" @click="pressButton(4)">
    4
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-5" class="btn num" title="5" @click="pressButton(5)">
    5
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-6" class="btn num" title="6" @click="pressButton(6)">
    6
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-pro" class="btn" title="pro" @click="btnProg">
    PRO
    </button>
    </div>
    <div class="col-xs-1">
    <button id="delete" class="btn button-red" title="Delete">
    DEL
    </button>
    </div>
    </div>
    <div class="row button-row">
    <div class="col-xs-1">
    <button id="num-1" class="btn num" title="1" @click="pressButton(1)">
    1
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-2" class="btn num" title="2" @click="pressButton(2)">
    2
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-3" class="btn num" title="3" @click="pressButton(3)">
    3
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-subtract" class="btn" title="Subtract">-</button>
    </div>
    <div class="col-xs-1">
    <button id="op-rset" class="btn button-red" title="rset" @click="btnReset">
    RSET
    </button>
    </div>
    </div>
    <div class="row button-row">
    <div class="col-xs-1">
    <button id="op-verb" class="btn" title="verb" @click="btnVerb">
    <small>VERB</small>
    </button>
    </div>
    <div class="col-xs-1">
    <button id="num-0" class="btn num" title="0" @click="pressButton(0)">
    0
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-noun" class="btn" title="noun" @click="btnNoun">
    <small>NOUN</small>
    </button>
    </div>
    <div class="col-xs-1">
    <button id="op-add" class="btn" title="Add">+</button>
    </div>
    <div class="col-xs-1">
    <button id="op-key-rel" class="btn" title="Key Rel" @click="btnRel">
    <small>Rel</small>
    </button>
    </div>
    </div>
    </div>
    </div>
    </template>

    <script>
export default {
    name: 'HelloWorld',
    data () {
        return {
            watch: {
                lcdVerb (newValue, oldValue) {
                    this.limitVariableLength(newValue, oldValue, 2, 'lcdVerb')
                },
                lcdNoun (newValue, oldValue) {
                    this.limitVariableLength(newValue, oldValue, 2, 'lcdNoun')
                },
                lcdProg (newValue, oldValue) {
                    this.limitVariableLength(newValue, oldValue, 2, 'lcdProg')
                },
                lcdRel (newValue, oldValue) {
                    this.limitVariableLength(newValue, oldValue, 4, 'lcdRel')
                },
            },
            methods: {
                pressButton (number) {
                    // console.log(number);

                    if (this.verb) {
                        this.lcdVerb = this.lcdVerb + number
                    }
                    if (this.noun) {
                        this.lcdNoun = this.lcdNoun + number
                    }
                    if (this.prog) {
                        this.lcdProg = this.lcdProg + number
                    }
                    if (this.rel) {
                        this.lcdRel = this.lcdRel + number
                    }
                },
                buttonClearPress () {
                    this.blinkLed(100, 1000, 'reset', 'progClasses').then(() => {
                        this.illuminateLed(1000, 'reset', 'progClasses').then(() => {
                            this.lcdVerb = '00'
                            this.lcdNoun = '00'
                        })
                    })
                },
                btnProg: function () {
                    this.verb = false
                    this.noun = false
                    this.prog = true
                    this.rel = false
                    this.lcdProg = ''
                    // this.lcd = this.lcd + 'P';
                },
                btnRel: function () {
                    this.verb = false
                    this.noun = false
                    this.prog = false
                    this.rel = true
                    this.lcdRel = ''
                    // this.lcd = this.lcd + 'R';
                },

                btnReset: function () {
                    this.lcdVerb = '00'
                    this.lcdNoun = '00'
                    this.lcdRel = '00'
                    this.classerror = ''
                    this.execute = ''

                    this.blinkLed(100, 1000, 'error', 'restClasses').then(() => {
                        this.illuminateLed(1000, 'error', 'restClasses').then(() => {

                        })
                    })
                }
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.btn {
    box-shadow: 0px 5px 10px #222222;
}

.btn:focus {
    outline: none;
}
.button-row div {
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    margin: 5px;
}

.btn:hover {
    box-shadow: 2px 1px 6px #000 !important;
}

.btn:focus,
.btn:active {
    outline: none !important;
}

.button-row .btn {
    width: 60px;
    height: 60px;
    background-color: #636363;

    background: -moz-radial-gradient(
        center,
        ellipse cover,
        rgba(99, 99, 99, 0.49) 0%,
        rgba(99, 99, 99, 0) 56%
);
    background: -webkit-radial-gradient(
        center,
        ellipse cover,
        rgba(99, 99, 99, 0.49) 0%,
        rgba(99, 99, 99, 0) 56%
);
    background: radial-gradient(
        ellipse at center,
        rgba(99, 99, 99, 0.49) 0%,
        rgba(99, 99, 99, 0) 56%
);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#7d636363', endColorstr='#00636363', GradientType=1);

    border: 3px solid #333;

    box-shadow: 1px 3px 13px #000000;
}

.buton-row .btn:active,
.buton-row .btn:focus {
    box-shadow: 2px 1px 6px #333;
}

small {
    font-size: 85%;
    color: #bbe4b1;
}

.button-row .btn {
    color: #bbe4b1;
}

.button-row .btn:hover {
    /* background-color: #858585; */
    background-color: #636363;

    background: -moz-radial-gradient(
        center,
        ellipse cover,
        rgba(150, 150, 150, 0.49) 0%,
        rgba(150, 150, 150, 0) 56%
);
    background: -webkit-radial-gradient(
        center,
        ellipse cover,
        rgba(150, 150, 150, 0.49) 0%,
        rgba(150, 150, 150, 0) 56%
);
    background: radial-gradient(
        ellipse at center,
        rgba(150, 150, 150, 0.49) 0%,
        rgba(150, 150, 150, 0) 56%
);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#7d969696', endColorstr='#00969696', GradientType=1);
    color: white !important;
}

.button-orange {
    background-color: #ff8400 !important;
}

.button-orange:hover {
    background-color: #ffa647 !important;
}

.button-blue {
    background-color: #0099ff !important;
}

.button-blue:hover {
    background-color: #33adff !important;
}

.button-off {
    background-color: #454545 !important;
}

.reset > span {
    color: #333333 !important;
    text-shadow: 1px 1px #333333;
}

.error > span {
    color: #333333 !important;
    text-shadow: 1px 1px #333333;
}

.lcd2 span {
    font-size: 16px;
    text-align: center;
    color: #b0b0b0;
    font-weight: 700;
}

.lcd1 span {
    font-size: 10px;
    text-align: center;
    margin-top: 0px;
    color: #333;
    /* position: absolute; */
}

.dis span {
    text-align: right;
    color: #2c8434 !important;
}


.calc-history hr {
    margin-top: 5px;
    margin-bottom: 5px;
}

</style>
