<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
    <link rel="stylesheet" href="css/app.css">
    <title>AGC</title>
</head>
<body>
<div class="container mt-5">
    <div class="row ">
        <div class="col-lg-3 col-sm-12">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti dignissimos in, maiores nobis officia
            pariatur
            reiciendis tempore. Corporis eveniet minima provident quis quos ullam ut? Ad cum fuga illo quos?
        </div>

        <div class="col-lg-6 col-sm-12">
            <div class="row panel-bg">
                <div class="col-12">
                    <div class="row">
                        <div class="col-6">
                            <div class="row sub-panel">
                                <div class="col-6 p-0">
                                    <div class="lcd-pad-large">Uplink <br>Acty</div>
                                    <div class="lcd-pad my-1">NO ATT</div>
                                    <div class="lcd-pad my-1">STBY</div>
                                    <div class="lcd-pad my-1">KEY REL</div>
                                    <div class="lcd-pad my-1">OPR ERR</div>
                                    <div class="lcd-pad-large my-1"> DAP NOT IN CONTROL</div>
                                    <div class="lcd-pad-large"> PRIORITY <br>DISPLAY</div>
                                </div>
                                <div class="col-6 p-0">
                                    <div class="lcd-pad">TEMP</div>
                                    <div class="lcd-pad-large my-1">GIMBAL <br>LOCK</div>
                                    <div class="lcd-pad my-1">PROG</div>
                                    <div class="lcd-pad my-1">RESTART</div>
                                    <div class="lcd-pad my-1">TRACKER</div>
                                    <div class="lcd-pad my-1">ALT</div>
                                    <div class="lcd-pad">VEL</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="row sub-panel computer">
                                <div class="row">
                                    <div class="col-6">
                                        <div class="lcd-pad-large">CMPTR <br> ACTY</div>
                                    </div>
                                    <div class="col-6">
                                        <div class="row">
                                            <div class="col-12 text-left ">
                                                <span>PROG</span>
                                            </div>
                                            <div class="col-12 text-left  digit">
                                                00
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="row">
                                            <div class="col-12 text-left ">VERB</div>
                                            <div class="col-12 text-left  digit">
                                                00
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="row">
                                            <div class="col-12 text-left ">NOUN</div>
                                            <div class="col-12 text-left  digit">
                                                00
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <div class="text-left digit">
                                            000000
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="text-left digit">
                                            000000
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="text-left  digit">
                                            000000
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div id="row standard-buttons">
                        <?php include('partials/numpad.php'); ?>
                    </div>
                </div>
            </div>
            <!--            <div class="row mt-5">-->
            <!--                <div class="col-7">-->
            <!--                    <div id="row standard-buttons">-->
            <!--                        <div class="row button-row justify-content-between">-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-7" class="btn num" title="7" @click="pressButton(7)">-->
            <!--                                    7-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-8" class="btn num" title="8" @click="pressButton(8)">-->
            <!--                                    8-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-9" class="btn num" title="9" @click="pressButton(9)">-->
            <!--                                    9-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-clr" class="btn" title="clr" @click="buttonClearPress">-->
            <!--                                    CLR-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-enter" class="btn button-red" title="enter" @click="btnEntr">-->
            <!--                                    Entr-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="row button-row justify-content-between">-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-4" class="btn num" title="4" @click="pressButton(4)">-->
            <!--                                    4-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-5" class="btn num" title="5" @click="pressButton(5)">-->
            <!--                                    5-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-6" class="btn num" title="6" @click="pressButton(6)">-->
            <!--                                    6-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-pro" class="btn" title="pro" @click="btnProg">-->
            <!--                                    PRO-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="delete" class="btn button-red" title="Delete">-->
            <!--                                    DEL-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="row button-row justify-content-between">-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-1" class="btn num" title="1" @click="pressButton(1)">-->
            <!--                                    1-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-2" class="btn num" title="2" @click="pressButton(2)">-->
            <!--                                    2-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-3" class="btn num" title="3" @click="pressButton(3)">-->
            <!--                                    3-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-subtract" class="btn" title="Subtract">-</button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-rset" class="btn button-red" title="rset" @click="btnReset">-->
            <!--                                    RSET-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="row button-row justify-content-between">-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-verb" class="btn" title="verb" @click="btnVerb">-->
            <!--                                    <small>VERB</small>-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="num-0" class="btn num" title="0" @click="pressButton(0)">-->
            <!--                                    0-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-noun" class="btn" title="noun" @click="btnNoun">-->
            <!--                                    <small>NOUN</small>-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-add" class="btn" title="Add">+</button>-->
            <!--                            </div>-->
            <!--                            <div class="col-xs-1">-->
            <!--                                <button id="op-key-rel" class="btn" title="Key Rel" @click="btnRel">-->
            <!--                                    <small>Rel</small>-->
            <!--                                </button>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--                <div class="col-5">-->
            <!--                    <div class="row">-->
            <!--                        <div class="col-6">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">-->
            <!--                                    <span>prog</span>-->
            <!--                                    00-->
            <!--                                </div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="col-6">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">00</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                    <div class="row">-->
            <!--                        <div class="col-6">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">00</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="col-6">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">00</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                    <div class="row">-->
            <!--                        <div class="col-12">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">0000000</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="col-12">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">0000000</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                        <div class="col-12">-->
            <!--                            <div class="lcd">-->
            <!--                                <div class="lcd-data text-center">0000000</div>-->
            <!--                            </div>-->
            <!--                        </div>-->
            <!--                    </div>-->
            <!--                </div>-->
            <!--            </div>-->
        </div>
        <div class="col-lg-3 col-sm-12"> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti dignissimos
            in, maiores
            nobis officia pariatur
            reiciendis tempore. Corporis eveniet minima provident quis quos ullam ut? Ad cum fuga illo quos?
        </div>
    </div>
</div>

</body>
</html>