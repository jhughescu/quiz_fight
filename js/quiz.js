let questionBankSet = null;
let questionBanks = {};
let quizzes = {};
let nseq = [3, 2, 1, 'GO'];
let nseq2 = null;
let players = {
    count: 0,
//    list: ['player2', 'player1']
};
let playerList = ['player2', 'player1'];
let platforms = {
    current: null,
    list: ['tabletop', 'wallmounted']
};
let gameTypes = {
    1: 'versus',
    2: 'oneplayer'
};
let cpuLevel = 0;
let autoplay = false;
// the default is for player2 (the lower screen) to be the main player in vs mode
const clearMainDebug = function (prop) {
    $('#debug').find('#' + prop).html('');
}
const addToMainDebug = function (prop, val, showProp) {
    if ($('#debug').find('#' + prop).length > 0) {
        $('#debug').find('#' + prop).append('<span>' + (showProp ? '<b>' + prop+ '</b>: ' : '') + val + '</span>')
    } else {
        console.log('no debug div for ' + prop);
    }
};
const resetUserAnswerSummary = function () {
    localStorage.removeItem('userAnswerReport');
//    localStorage.removeItem
}
const showUserAnswerSummary = function () {
    let db = $('#debug');
    let s = localStorage.getItem('userAnswerReport');
//    console.log(s);
    if (s === 'null' || s === null) {

        db.find('#reset').hide();
    } else {
        s = JSON.parse(s);
        let t = s.average / 1000;
        t = Math.round(t * 100) / 100;
        let p = s.aPerc;
        let str = `<b>timeToAnswer:</b> ${t} seconds<br><b>correct:</b> ${(Math.round(p * 100) / 100)}%`;
        clearMainDebug('userInfo');
        addToMainDebug('userInfo', str, false);
        db.find('#reset').show();
        db.find('#reset').off();
        db.find('#reset').on('click', function () {
            resetUserAnswerSummary();
            showUserAnswerSummary();
        });
    }
//    console.log('dunne');
};
const flipGo = function () {
    let cd = $('#countdown');
    cd.toggleClass('flipped');
    console.log('flipper')
};
const blinkV1 = function (cd, s) {
    var p = cd.find('p');
    p.hide();
    p.html(s);
    if (typeof(s) === 'string') {
        cd.addClass(s.toLowerCase());
    }
    setTimeout(function () {
        p.show();
    }, 300);
};
const spinnerV1 = function (cd) {
    cd.toggleClass('flipped')
    cd.removeClass('normal');
    setTimeout(function () {
        cd.toggleClass('normal');
    }, 500);
    if (nseq2.length > 0) {
        setTimeout(function () {
            countdown()
        }, 1200);
    } else {
        setTimeout(function () {
            cd.fadeOut(200);
            setTimeout(function () {
                startQuiz();
            }, 500);
        }, 1500)
    }
};
const countdownV1 = function () {
    let cd = $('#countdown');
    cd.hide();
    cd.fadeIn(200);
    cd.removeClass('go');
    blink(cd, nseq2.shift());
    spinner(cd);
};
const theCountdownV1 = function () {
    $('#countdownwrapper').show();
    nseq2 = nseq.slice()
    countdown();
};
const Countdown = function () {
//    console.log('I AM THE COUNTDOWN');
    let int = null;
    let self = {}
    let ao = [3, 2, 1, 'GO'];
    let a = null;

    let cdw = $('#countdownwrapper');
    let cd = $('#countdown');
    let p = cd.find('p');
    const d = 1200
    const go = function () {
//        cdw.show();
//        cd.show();
        a = ao.slice(0);
//        console.log('GO');
//        console.log(a);
        clearInterval(int);
        setTimeout(function () {
            down();
            int = setInterval(down, d);
        }, 500);
    };
    const down = function () {
        let n = a.shift();
//        console.log(a);
//        console.log(n);
        cdw.show();
        cd.show();
        p.html(n);
        if (typeof(n) === 'string') {
            cd.addClass('go');
        } else {
            cd.removeClass('go');
        }
        cd.css({transform: 'rotate(' + (a.length%2 === 0 ? 0 : 180) + 'deg)'});
//        cd.delay(400).css({transform: 'rotate(180deg)'}, 0);
//        cd.toggleClass('flipped');
//        cd.removeClass('normal');
        if (a.length === 0) {
            clearInterval(int);
            setTimeout(function () {
                startQuiz();
            }, d);
        }
        cdw.delay(800).fadeOut(200)
    }
    self.go = go;
    return self;
};
const preload = function (a) {
    $(a).each(function() {
        (new Image()).src = this;
        console.log()
    });
};
const allReady = function () {
    let ar = false;
//    console.log(`${players.count} players`);
//    console.log(`cpuLevel: ${cpuLevel}`);
//    console.log(`platforms.current: ${platforms.current}`);
    if (players.count === 1) {
        if (cpuLevel > 0) {
            ar = true;
        }
    }
    if (players.count === 2) {
        if (platforms.current !== null) {
            ar = true;
        }
    }
    return ar;
}
const ready = function (boo) {
    if (boo !== false) {
        boo = allReady();
    }
//    console.log(`ready? ${boo}`);
    var bSet = players.count > 1 ? $('.start') : $('#start' + playerList[0]);
    boo ? $('#rotator').hide() : '';
//    debugger;
    boo ? bSet.show() : bSet.hide();
//    boo ? console.log('yes!') : console.log('no!!');
};
const setCpuLevel = function (n) {
    let s = 0;
    if (n > 0) {
        s = 0.2 + (0.6 * (n / 3));
    }
    console.log(`set cpu level to ${s}, n: ${n}`);
    cpuLevel =  s;
    if (q1) {
        q1.setSkillLevel(s);
    }
    $('.star').removeClass('selected');
    for (var i = 0; i < n; i++) {
        $($('.star')[i]).addClass('selected');
    };
    if (n > 0) {
        ready(true);
    }
};
const StartButtonv1 = function (d) {
    let self = {
        div: $('#' + d),
        roll: $('#' + d).find('.button')
    };
    const clickDefault = function () {
        console.log('I clicked');
    }
    const onClick = function (f) {
        self.div.on('click', f);
        activate(false);
    }
    const activate = function (boo) {
        console.log('act ' + boo)
        if (boo) {
            self.div.removeClass('inactive');
            self.roll.removeClass('inactive');
        } else {
            self.div.addClass('inactive');
            self.roll.addClass('inactive');
        }
    }
    const select = function (boo) {

    }
    self.div.show();
    onClick(clickDefault);
    activate(true);
    return self;
}
class NewButton {
    constructor(id) {
        this.carname = id;
        this.div = $('#' + id);
        this.but = $('#' + id).find('.button');
    }
    getDiv() {
        return this.div;
    }
    activate(boo) {
        if (boo) {
            this.div.removeClass('inactive');
            this.but.removeClass('inactive');
        } else {
            this.but.css({'opacity': '0.2'});
            this.div.addClass('inactive');
            this.but.addClass('inactive');
        }
    }
    reveal(boo) {
//        console.log(`show ${boo}`);
        if (boo) {
            this.div.show();
        } else {
            this.div.hide();
        }
    }
}

class StartButton extends NewButton {
    constructor(id) {
        super(id);
    }
//    show() {
//        console.log(this.getDiv());
//        return ', it is a ' + this.model;
//    }
}
const setup = function () {
    let platformType = 0;
    let pre = [
        'assets/wallmountedselected.png',
        'assets/tabletopselected.png'
    ];
    players.count = 0;
    const getMainPlayer = function () {
        return playerList[1];
    };
    const setOrientation = function () {
        let mainO = parseInt(playerList[0].replace(/[a-z]/gm, ''));
        let wm = $('#typewallmounted').find('.button');
//        console.log(mainO);
//        console.log(wm);
        // wallmounted is not possible in upside down mode (1)
        if (mainO === 1) {
            wm.addClass('inactive');
            setPlatformType(1);
//            wm.css('opacity', 0.5);
        } else {
            wm.removeClass('inactive');
            setPlatformType(0);
        }
    };
    const setPlatformType = function (t) {
        let cSet = platforms.list.join(' ');
        platformType = t;
//        console.log(t);
        if (t > 1) {
            $('#playzone').find('.' + getMainPlayer()).removeClass('upsidedown');
        } else {
            $('#playzone').find('.' + getMainPlayer()).addClass('upsidedown');
        }
        $('.screentype').removeClass('selected');
        platforms.current = platforms.list[platformType - 1];
        //
        $('#' + getMainPlayer()).find('.qZone, .overlay').removeClass(cSet);
        $('#start' + getMainPlayer()).removeClass(cSet);
        $('.typeselect').removeClass(cSet);
        $('#winbanner').removeClass(cSet);
        //
        $('#' + getMainPlayer()).find('.qZone, .overlay').addClass(platforms.current);
        $('#start' + getMainPlayer()).addClass(platforms.current);
        $('.typeselect').addClass(platforms.current);
        $('#winbanner').addClass(platforms.current);
        //
        $('#type' + platformType).addClass('selected');
        ready(players.count > 0);
    };
    const setPlatformTypeV1 = function (t) {
        platformType = t;
//        console.log(t);
        if (t > 1) {
            $('#playzone').find('.player1').removeClass('upsidedown');
        } else {
            $('#playzone').find('.player1').addClass('upsidedown');
        }
        $('.screentype').removeClass('selected');
        platforms.current = platforms.list[platformType - 1];
        $('#player1').find('.qZone, .overlay').removeClass(platforms.list.join(' '));
        $('#player1').find('.qZone, .overlay').addClass(platforms.current);
        $('#startplayer1').removeClass(platforms.list.join(' '));
        $('#startplayer1').addClass(platforms.current);
        $('#type' + platformType).addClass('selected');
        ready(players.count > 0);
    };
    const setGameType = function (id) {
        let pc = players.count;
        if (typeof(id) === 'number') {
            if (gameTypes.hasOwnProperty(id)) {
                id = gameTypes[id];
            } else {
                alert(`no gameType with id ${id}`);
            }
        }
        ready(false);
        console.log(`setGameType: ${id}`);
        players.count = 0;
        $('.typeselect').removeClass('selected');
        $('.typeselect').removeClass('inactive');
        $('.start').removeClass('selected');
        $('#' + id).addClass('selected');
        $('#' + id).addClass('inactive');
        if (id === 'versus') {
            $('#cpudifficulty').addClass('inactive');
            $('.screentypes').show();
            if (pc !== 2) {
//                setPlatformType(0);
            }
            q1.setAutoComplete(false);
            q2.setAutoComplete(false);
            players.count = 2;
            ready(platformType > 0);
        } else {
            $('#cpudifficulty').removeClass('inactive');
            $('.screentypes').hide();
            setPlatformType(2);
            q1.setAutoComplete(true);
            q2.setAutoComplete(false);
//            q2.setAutoComplete(true);
            players.count = 1;
            ready(cpuLevel > 0);
        }
    };
    const autoLaunch = function () {
        setTimeout(function () {
            setGameType('oneplayer');
        }, 2000);
        setTimeout(function () {
            setCpuLevel(3);
        }, 4000);
        setTimeout(function () {
            go();
        }, 5000);
    };
    setPlatformType(1);
    setCpuLevel(0);
    preload(pre);
    if (!countdown) {
//        console.log('NOT the final countdown')
        countdown = new Countdown();
    }
    $('#cpudifficulty').addClass('inactive');
    $('.screentypes').show();
    $('.star').off('click');
    $('.star').on('click', function () {
        $('.star').removeClass('selected');
        let n = parseInt($(this).attr('id').replace(/[a-z]/gm, ''));
        setCpuLevel(n);
//        let screen = 0;
//        for (var i = 0; i < n; i++) {
//            $($('.star')[i]).addClass('selected');
//        };
//        ready(true);
    });
    $('.screentype').off('click');
    $('.screentype').on('click', function () {
        setPlatformType($(this).attr('id').replace(/[a-z]/gm, ''));
    });
    $('.typeselect').removeClass('selected');
    $('.typeselect').off('click');
    $('.typeselect').on('click', function () {
        let id = $(this).attr('id');
        setGameType(id);

    });
    $('.start').removeClass('selected inactive startselected');
    $('.start').find('.text').find('span').show();
//    $('.start').find('.text').show();
    $('.start').off('click');
    $('.start').on('click', function () {
//        alert('woa')
        $(this).addClass('selected inactive startselected');
        $(this).find('.text').find('span').hide();
        if ($('#intro').find('.startselected').length >= players.count) {
            go();
        }

    });
    $('#rotator').off('click');
    $('#rotator').on('click', function () {
        $($('#topping').find('.content')).toggleClass('flipped');
        let u = $('#topping').find('.content').css('transform').indexOf('-1', 0) === -1;
//        let a = players.list.slice(0);
//        let a = playerList.slice(0);
//        a = a.sort(function () {return u ? -1 : 1});
//        playerList = playerList.sort(function () {return u ? -1 : 1});
//        playerList = a.slice(0);
//        console.log(u);
        playerList.reverse();
        setOrientation();
        console.log(playerList);
    });
    $('#countdownwrapper').hide();
//    $('.start').hide();
//    let sp1 = new StartButton('startplayer1');
//    let sp2 = new StartButton('startplayer2');
//    sp1.reveal(true);
//    sp2.reveal(true);
//    sp1.activate(false);
//    sp2.activate(false);
//    console.log('setup')
//    console.log(sp1.show());

//    $('.content').hide();
//    $('#playagain').hide();
//    $('#playagain').addClass('inactive');
//    $('#cpudifficulty').addClass('inactive');
    addToMainDebug('timestamp', ts.timestamp.datetime, true);
    showUserAnswerSummary();
    showIntro(true);
    showTopping(true);
    $('.content').show();
//    endgame();
//    autoLaunch();
    if (autoplay) {

        let aTimes = [2000, 3000, 6000];
        aTimes = [200, 300, 400];
        setTimeout(function () {
            setGameType(2);
        }, aTimes[0]);
        setTimeout(function () {
//            setCpuLevel(Math.ceil(Math.random() * 3));
//            setCpuLevel(3);
            setCpuLevel(4);
        }, aTimes[1]);
        setTimeout(function () {
            go();
        }, aTimes[2]);
    }
};
const showIntro = function (t) {
    if (!t) {
        $('#intro').hide();
        $('#topping').find('.bg').hide();
    } else {
        $('#intro').show();
        $('#topping').find('.bg').show();
    }
}
const showTopping = function (t) {
    if (!t) {
        $('#topping').hide();
    } else {
        $('#topping').show();
    }
}
const storeAggregate = function (id, val) {
    let ls = localStorage.getItem(id);

    if (ls !== null) {
        ls = JSON.parse(ls);
        console.log(ls);
        if (ls.hasOwnProperty(val)) {
            ls[val] += 1;
        } else {
            ls[val] = 1;
        }
    } else {
        ls = {};
        ls[val] = 1;
    }
    ls = JSON.stringify(ls);
    localStorage.setItem(id, ls);
};
const Timestamp = function () {
//    let d = new Date();
//    let s = `${d.toDateString()} ${d.toTimeString()}`;
    let self = {timestamp: timestamp};
    return self;
}
const addAllQuestionBanks = function () {
//    console.log(questionBankSet);
    questionBankSet.forEach(q => {
//        console.log(`make new QB: ${q}`);
        questionBanks[q] = new QuestionBank(q)
    });
}
const showQuestionBanks = function () {
    console.log(questionBanks);
};
const Button = function (id) {
    let self = {
        id: id,
        el: null
    };
    if ($('.' + id).length > 0) {
        self.el = $($('.' + id)[0]);
        self.el.on('mouseover', function () {
            self.el.addClass('over');
        });
        self.el.on('mouseout', function () {
            self.el.removeClass('over');
        });
    }
//    console.log(self)
    return self;
};
const QuestionBank = function (type) {
    var self = {
        id: 0,
        title: type,
        ready: false
    }
    function StringToXMLDom(sXML) {
        var xmlDoc = null;
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(sXML, "text/xml");
        } else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(sXML);
        }
        return xmlDoc;
    }
    function processQuestionSet (response) {
        var xmlData, tmp, tag, qo, curr, qa;
        qo = {};
        qa = [];
        xmlData = StringToXMLDom(response);
        if (xmlData) {
            tmp = xmlData.getElementsByTagName("question");
            for (var i = 0; i < tmp.length; i++) {
                for (var j = 0; j < tmp[i].childNodes.length; j++) {
                    tag = tmp[i].childNodes[j];
                    if (tag.tagName) {
                        if (tag.tagName === 'text') {
                            curr = {
                                id: 0,
                                bank: type,
                                question: tag.textContent
                            };
                        }
                        if (tag.tagName === 'options') {
                            curr.options = tag.textContent.replace(/^\s*\n/gm, '').replace(/\n\s*$(?!\n)/gm, '').replace(/  /g, '').split('\n');
                        }
                        if (tag.tagName === 'answer') {
                            curr.answer = tag.textContent;
                        }
                        if (curr.hasOwnProperty('question') && curr.hasOwnProperty('options') && curr.hasOwnProperty('answer')) {
                            curr.id = qa.length;
                            qa.push(curr);
                        }
                        qo['question_' + i] = curr;
                    }
                }
            }
        }
        self.qSet = qa;
        self.ready = true;
        copyQuestionSet();
        return qo;
    }
    function copyQuestionSet () {
        self.qSetCopy = self.qSet.slice();
    }
    function loadXML (src, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/xml");
        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4 && xobj.status === 200) {
//                callback(xobj.responseText);
                processQuestionSet(xobj.responseText);
            }
        }
        xobj.open("GET", src, true);
        xobj.setRequestHeader("Access-Control-Allow-Origin", "*");
        xobj.send(null);
    }
    function StringToXMLDom (sXML) {
        var xmlDoc = null;
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(sXML, "text/xml");
        } else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(sXML);
        }
        return xmlDoc;
    }
    function getQuestion () {
//        console.log(`${self.qSetCopy.length} questions to start with`);
        var q = self.qSetCopy.splice(Math.floor(Math.random() * self.qSetCopy.length), 1)[0];
//        console.log(`${self.qSetCopy.length} questions remaining`);
        if (self.qSetCopy.length === 0) {
//            console.log('reset the copied bank');
            copyQuestionSet();
        }
        return q;
    }
    self.getQuestion = getQuestion;
    loadXML('xml/' + type.replace(/ /gm, '_') + '.xml');
    questionBanks[type] = self;
    for (var i in questionBanks) {
        self.id++;
    }
//    console.log(self);
    return self;
};
const rSort = function () {
    let r = Math.floor(Math.random() * 3) - 1;
//    console.log(r);
    return r;
}
const getQuestionSet = function (id) {
    var i;
    let s = questionBanks[id].qSet.slice();
    for (i = 0; i < 100; i++) {
        s.sort(rSort);
        s.reverse();
    }
    i = [];
    s.forEach(q => {
        i.push(q.id);
    });
//    console.log(i);
//    console.log(s);

    return s;
};
const ImportSVG = function (id) {
    function renderSVG (id, t) {
        $(`.${id}`).html(t);
    }
    function loadData (id) {
        fetch(`assets/${id}.txt`)
            .then((response) => response.text())
            .then((text) => renderSVG(id, text));
    }
    loadData(id);
};

const Quiz = function (t) {
    let autoPlay = false;
    this.setAutoplay = function (boo) {
        autoPlay = boo;
        console.log(`autoplay to ${autoplay}`);
    };
    let q = null;
    let typeMap = {
        1: {id: 1, type: 'single'},
        2: {id: 2, type: 'multi'}
    }
    let self = {
        id: t.replace('r', 'r '),
        autoComplete: false,
        autoInt: null,
        title: t,
        type: null,
        currentQuestions: null,
        questionBanks: {},
        q: null,
        qID: null,
        aDelay: {min: 400, max: 5000},

//        aDelay: {min: 50, max: 60},
//        aDelay: {min: 2000, max: 5000},
        score: 0,
        scorePending: null,
        rival: null,
        questionDiv: null,
        optionsDiv: null,
        questionDiv: document.getElementById(t).querySelector('.question'),
        optionsDiv: document.getElementById(t).querySelectorAll('.option'),
        progressBar: null,
        progressing: null,
        active: false,
        buttonScore: $('#' + t).find('.moveon'),
        buttonSteal: $('#' + t).find('.pushback'),
        timers: {askQ: 0},
        skill: 0.4
    };
    let delays = {
        overlay: 1200,
        autoAnswer: {min: 1500, max: 7000}
    };
//    delays = {
//        overlay: 200,
//        autoAnswer: {min: 300, max: 400}
//    };
    let questionReport = null;
    let aTime = null;
    function go () {
        // start the game with settings applied
        $('#' + t).show();
        self.askQuestion();
    }
    function getSpecificDelay (d, skilled) {
        var dr = 2000, ds, r;
        if (delays.hasOwnProperty(d)) {
            if (typeof(delays[d]) === 'number') {
                dr = delays[d];
            } else {
                ds = delays[d];
                r = Math.random();
                dr = (r * (ds.max - ds.min)) * (skilled ? (1 - self.skill) : 1);
                dr = ds.min + dr;
                dr = Math.round(dr);
            }
        } else {
            console.log('no delay set with name ' + d + ', returning default (2000)');
        }
        return dr;
    }
    function reset () {
        self.score = 0;
        self.scorePending = 0;
        advancePlayer();
        self.resetProgress();
        self.getQuestionSequence();
        self.activateOptions(false);
        self.showOverlay(false);
        $('#' + t).hide();
        $('#losebanner').removeClass(t);
        $('#winbanner').removeClass(t);
        $('div').removeClass('defeat').removeClass('dunne').removeClass('inactive');
        $('.tickcontainer').remove();
        console.log('RESET');
        let selff = Object.assign({}, self);
        delete selff.rival;
        console.log(JSON.stringify({score: selff.score}));
    }
    function getQuestionSequence () {
        var s = [];
        questionBankSet.forEach(b => {
            s.push(questionBanks[b].getQuestion());
        });
        self.currentQuestions = s;
        return s;
    }
    function drawHeaderArrow (boo) {
        let ha = $('#' + t).find('.headerarrow');
        let s = self.score;
        let td = $($('.buttons').find('.topic_button')[s]);
        let ac = td.css('background-color');
        let p = $('#' + t);
        if (boo) {
            let d = self.score > 0 ? td.offset() : td.position();
            let adj = null;

            d = td.offset();
            let css = {
                display: boo ? 'inline-block' : 'none',
                'border-top-color': (boo ? ac : 'white'),
                'border-left-width': td.width() / 2,
                'border-right-width': td.width() / 2,
                left: (d.left - p.position().left - adj) + 'px',
                left: p.width() / 2 + 'px'
            };
            if (self.score > 0) {
                css.left = (d.left - p.position().left) + 'px';
            } else {
                if (t === 'player2') {
                    css.left = '0px';
                } else {
                    css.left = '0px';
                }
            }
            ha.css(css);
            ha.animate({'border-top-width': '30px'}, 200);
        } else {
            if (!isFinalQuestion()) {
                ha.animate({'border-top-width': '0px'}, 200);
            }
        }
    }
    function advancePlayer () {
        if (self.iWon()) {
            return;
        }

        let s = self.score;
        let td = $($('.race').find('td')[s]);
        //
        //
        //
//        console.error('intermittent issue occurs here, problem finding "left" of td.offset() below:');
        //
        //
        //
        let x = td.offset().left - (td.width() / 2);
        let gap = x - $('#' + t).position().left;
        if (self.score === 0) {
            x = td.offset().left;
        }
        if (isFinalQuestion()) {
            x = $($('.race').find('td')[self.score - 1]).offset().left;
        }
        $('#'+ t).animate({
            left: x + 'px'
        }, 300, function () {
            $('#'+ t).find('.underlay').find('.header').css({
                'background-color': $($('.buttons').find('.topic_button')[s]).css('background-color'),
                'background-color': 'white',
            });
            drawHeaderArrow(true);
            if (gap < 0) {
                // player is being pushed back, set up new question:
                self.setNewQuestionBank(questionBankSet[self.score]);
                if (self.score > 0) {
                    self.askQuestion();
                }
            }
        });
    }
    function setQuizType (n) {
        // single or multi subject - multi changes subject (question bank) on correct answer
        if (typeof(n) !== 'number') {
            alert('setQueizType requires a number');
        } else if (!typeMap.hasOwnProperty(n)) {
            alert(`typeMap has no definition for type ${n}`);
        } else {
            self.type = typeMap[n];
        }
    }
    function resizePlayer () {
        $('#' + t).css({
            width: ($('.topic_button').width() * 2 + 1) + 'px',
            padding: '30px 0px'
        });
    }
    function setAutoComplete (boo) {
        self.autoComplete = boo;
    }
    function isFinalQuestion () {
        return self.getWinTotal() - self.score === 1;
    }
    function pushbackAvailable () {
        return self.score > 0 && (self.rival.score - self.score > 1);
    }
    function moveonAvailable () {
        return true;
    }
    function importSVGs () {
        new ImportSVG('moveonfront');
        new ImportSVG('moveonback');
        new ImportSVG('moveonshadow');
        new ImportSVG('pushbackfront');
        new ImportSVG('pushbackback');
        new ImportSVG('pushbackshadow');
    }
    function autoAnswer () {
        let a = null;
        let c = null;
        self.q.options.forEach((o, i) => {
            if (o === self.q.answer) {
                c = i;
            }
        });
        a = Math.random() < self.skill ? c : Math.floor(Math.random() * 4);
        let boo = self.onOption(a);
        amendAnswerReport(boo ? 'correct' : 'incorrect');
    }
    function amendQuestionReport (q) {
        // build the question aggregate lists for localStorage (dev method, can be removed in deployment)
        let id = q.bank.replace(/ /gm, '_');
        let qr = questionReport;
        let qrls = localStorage.getItem('questionReport');
        if (qrls !== null) {
            qr = JSON.parse(qrls);
        }
        if (qr === null) {
            qr = {};
            qr[id] = {index: []};
            qr[id].index[q.id] = 1;
        } else {
            if (qr.hasOwnProperty(id)) {
                if (typeof(qr[id].index[q.id]) === 'number') {
                    qr[id].index[q.id] += 1;
                } else {
                    qr[id].index[q.id] = 1;
                }
            } else {
                qr[id] = {index: []};
                qr[id].index[q.id] = 1;
            }
        }
        questionReport = qr;
        localStorage.setItem('questionReport', JSON.stringify(questionReport));

    }
    let aTimeAv = null;
    function amendAnswerReport (type, val) {
        let l = `skill_${self.skill.toString().replace('.', '_')}`;
        let answerReport = localStorage.getItem('answerReport');
        if (answerReport === null) {
            answerReport = {};
        } else {
            answerReport = JSON.parse(answerReport);
        }
        if (!answerReport.hasOwnProperty(l)) {
            answerReport[l] = {};
        }
        if (!answerReport[l].hasOwnProperty('correct')) {
            answerReport[l] = {correct: 0, incorrect: 0, correctPerc: 0};
        }
        if (type === 'aTime') {
            // time to answer; store average
            if (!answerReport[l].hasOwnProperty('timeToAnswer')) {
                answerReport[l].timeToAnswer = {total: 0, count: 0, av: 0};
            }
            let tta = answerReport[l].timeToAnswer;
            tta.count += 1;
            tta.total = tta.total + val;
            tta.av = tta.total / tta.count;
            answerReport[l].avTime = tta.av;
        }
        if (type === 'correct' || type === 'incorrect') {
            let ar = answerReport[l];
            ar[type] += 1;
            ar.correctPerc = ar.correct / (ar.correct + ar.incorrect) * 100;
        }
        let summary = {
//            correctPercentage: answerReport[l].correctPerc,
//            timeToAnswer: answerReport[l].avTime
        };
        Object.entries(answerReport).forEach((v, k) => {
            summary[v[0]] = {
                correctPercentage: v[1].correctPerc,
                timeToAnswer: v[1].avTime
            };
        });
        localStorage.setItem('answerReport', JSON.stringify(answerReport));
        localStorage.setItem('answerReportSummary', JSON.stringify(summary));
    }
    function amendUserAnswerReport (n) {
        let d = new Date();
        let t = d.getTime();
        let gap = null;
        let write = true;
        let id = 'userAnswerReport';
        let av = localStorage.getItem(id);
        if (av === null) {
            av = {average: 0, total: 0, count: 0, aCount: 0, aCorrect: 0, aIncorrect: 0, aPerc: 0};
        } else {
            av = JSON.parse(av);
        }
        if (typeof(n) === 'number') {
            // this is a timer update
            if (n === 0) {
                aTime = t;
            } else {
                gap = t - aTime;
                if (gap > (av.average * 2) && av.average > 0) {
                    write = false;
                }
                av.count += 1;
                av.total += gap;
                av.average = av.total / av.count;
            }
        }
        if (typeof(n) === 'boolean') {
            // this is a correct/incorrect answer response
            av.aCount += 1;
            av[n ? 'aCorrect' : 'aIncorrect'] += 1;
            av.aPerc = (av.aCorrect / av.aCount) * 100;
        }
        if (write) {
            console.log('write ' + id + 'Summary')
            localStorage.setItem(id, JSON.stringify(av));
            localStorage.setItem(id + 'Summary', JSON.stringify({timeToAnswer: av.average, correctPercentage: av.aPerc}));
        } else {
            console.log('outlier, not writing (average is ' + av.average + ', gap is ' + gap + ')');
        }
    }
    self.setSkillLevel = function (n) {
        if (typeof(n) !== 'number') {
            alert('skill must be a number');
        } else if (n < 0 || n > 1) {
            alert('skill must be a decimal between 0 and 1');
        } else {
            self.skill = n;
        }
    };
    self.setAutoComplete = setAutoComplete;
    self.setQuizType = setQuizType;
    self.reset = reset;
    self.go = go;
    self.getSpecificDelay = getSpecificDelay;
    self.getDelay = function () {
        return self.aDelay.min;
    };
    self.getGap = function () {
        return self.score - self.rival.score;
    };
    self.setRival = function (q) {
        self.rival = q;
    };
    self.setNewQuestionBank = function (id) {
        self.qID = id;
        self.currentQuestions = getQuestionSet(id);
        self.questionBanks[id] = self.currentQuestions;

    };
    self.activateOptions = function (boo) {
        self.active = boo;
        if (boo) {
            $('#' + t).find('.option').removeClass('inactive');
//            $('#' + t).find('#qZone').show();
        } else {
            $('#' + t).find('.option').addClass('inactive');
//            $('#' + t).find('#qZone').hide();
        }
        $('#' + t).find('.option').removeClass('reveal');
        $('#' + t).find('.option').removeClass('selected');
    };
    self.askQuestion = function () {
        var s, a, i;
        self.q = self.currentQuestions.shift();
        if (self.iWon()) {
            console.log('i won, so stop here')
            return;
        }
        if (!self.q) {
            self.currentQuestions = getQuestionSet(self.qID);
            self.askQuestion();
        } else {
            s = '<span>' + self.q.question + '</span>';
            for (i = 0; i < 100; i++) {
                self.q.options.reverse();
                self.q.options.sort(rSort);
            }
            self.q.options.forEach((o, id) => {
                self.optionsDiv[id].innerHTML = '<span>' + o + '</span>';
            });
            if (self.questionDiv) {
                self.questionDiv.innerHTML = s;
            }
        }
        $('#' + t).find('.option').addClass('blank');
        self.activateOptions(false);
        setTimeout(function () {
            $('#' + t).find('.option').removeClass('blank');
            self.activateOptions(true);
        }, 1000);
        $('#' + t).find('.question').addClass('blank');
        setTimeout(function () {
            $('#' + t).find('.question').removeClass('blank');
            resizePlayer();
        }, 500);

        amendQuestionReport(self.q);
        if (self.autoComplete) {
            clearTimeout(self.autoInt);
            let aTime = self.getSpecificDelay('autoAnswer', true);
            amendAnswerReport('aTime', aTime);
            self.autoInt = setTimeout(autoAnswer, aTime);
        } else {
            amendUserAnswerReport(0);
        }
    };
    self.addToDebug = function (f) {
//        if ($('#' + t).find('.' + f.replace('self.', '')).length === 0) {
//            $('#' + t).find('.debug').append('<p class="' + f.replace('self.', '') + '"></p>');
//        }
//        $('#' + t).find('.' + f.replace('self.', '')).html(f.replace('self.', '') + ': ' + eval(f));
    };
    self.showScore = function () {
        self.progressBar = $($('#' + t).find('.bar')[self.score]);
    };
    self.updateScorePending = function (s) {
        if (typeof(s) === 'number') {
            if (s >= 0) {
                if (self.scorePending === null) {
                    self.scorePending = self.score;
                }
                self.scorePending = s;
                self.addToDebug('self.scorePending');
            }
        }
    };
    self.updateScore = function (s) {
        if (typeof(s) === 'number') {
            if (s >= 0 && s <= self.getWinTotal()) {
                self.score = s;
                self.scorePending = s;
                console.log(`score AND scorePending for ${t} to ${s} (${typeof(s)}) range = 0 - ${self.getWinTotal()} (${typeof(self.getWinTotal())})`);
                self.showScore();
                self.addToDebug('self.score');
            } else {
                console.error(`attempt to set score/scorePending (${s}) outside permitted range (0 - ${self.getWinTotal()})`);
                console.log(`score AND scorePending for ${t} attempted change to ${s} (${typeof(s)}) range = 0 - ${self.getWinTotal()} (${typeof(self.getWinTotal())})`);
                debugger;
            }
        }
    };
    function resetOverlay () {
        $('#' + t).find('.overlay').css({
            left: ($('#' + t).find('.underlay').position().left + 1) + 'px',
            display: 'none'
        });
    }
    function onOverlayComplete () {
        //
    }
    self.showOverlay = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        if (boo) {
            olay.show();
            if (moveonAvailable()) {
                self.buttonScore.show();
                self.buttonScore.animate({left: '470px'}, 50).animate({left: '440px'}, 500);
                if (self.autoComplete) {
                    self.scoreOrSteal();
                }
            } else {
                self.buttonScore.hide();
            }
            if (pushbackAvailable()) {
                setTimeout(function () {
                    self.buttonSteal.show();
                        self.buttonSteal.animate({left: '-130px'}, 50).animate({left: '-100px'}, 500);
                    }, 300);
            } else {
                self.buttonSteal.hide();
            }
            onOverlayComplete();
        } else {
            olay.hide();
            self.buttonScore.hide();
            self.buttonSteal.hide();
        }
    }
    self.showOverlayv1 = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        let l = null;
        if ((ulay.offset().left + ulay.width() + 20 + olay.width()) < $('body').width()) {
            l = ulay.position().left + ulay.width() + 30;
        } else {
            l = ulay.position().left - olay.width() - 30;
        }
        if (boo) {
            let r = Math.random() > 0.45;
            olay.show();
            olay.animate({
                left: l + 'px'
            }, {
                duration: r ? 1600 : 500,
                specialEasing: {
                  left: r ? "easeOutBounce" : "easeOutSine"
                },
                complete: onOverlayComplete
            });
        } else {
            olay.animate({
                left: (ulay.position().left + 5) + 'px'
            }, 300, function () {
                resetOverlay();
            });
        }
    };
    self.submit = function (boo) {
        if (self.active) {
            self.activateOptions(false);
            if (boo) {
                if (self.iWon()) {
                    console.log('i won')
                }
                if (isFinalQuestion()) {
                    self.scoreFunk();
                } else {
                    setTimeout(function () {
                        self.showOverlay(true);
                    }, self.getSpecificDelay('overlay'));
                }
                if (self.rival.score === 0) {
                    $('#' + t).find('.steal').addClass('inactive');
                } else {
                    $('#' + t).find('.steal').removeClass('inactive');
                }
            } else {
                self.showCorrect();
                self.timers.askQ = setTimeout(self.askQuestion, 3000);
            }
        }
        if (self.autoComplete) {
            self.showCorrect();
        } else {
            amendUserAnswerReport(1);
            amendUserAnswerReport(boo);
            showUserAnswerSummary();
        }
    };
    self.nextQuestion = function () {
        if (!self.iWon()) {
            if (self.type.id === 2) {
                self.setNewQuestionBank(questionBankSet[self.score]);
            }
            self.askQuestion();
        }
    };
    self.getWinTotal = function () {
        return $('.race').find('td').length;
    };
    self.iWon = function (log) {
        let won = self.score === self.getWinTotal();
        if (self.score > self.getWinTotal()) {
            console.log(won, self.score, self.getWinTotal());
        }
        if (log) {
            console.log(won, self.score, self.getWinTotal(), typeof(self.score), typeof(self.getWinTotal()));
        }
        if (self.score >= self.getWinTotal()) {
            console.log('WIN', won, self.score, self.getWinTotal());
        }
        return won;
    };

    self.resetProgress = function () {
        $('#arrow-' + t).css({
            left: '-40px',
            width: '0px'
        });
    };
    self.showProgress = function (boo) {
        if (!boo) {
            self.progressBar = $($('#' + t).find('.bar')[self.score - (boo ? 0 : (self.progressing ? 0 : 1))]);
        }
        self.progressBar.stop();
        self.progressing = true;
        self.progressBar.animate({
            width: boo ? '100%' : '0%'
        }, {
            duration: self.getDelay(),
            specialEasing: {
                width: 'swing'
            },
            complete: function () {
                self.progressing = false;
                self.updateScore(self.scorePending);
                if (boo) {
                    if (!self.iWon()) {
        //                    self.nextQuestion();
                    } else {
                        self.rival.defeat();
                        self.victory();
                    }
                }
            }
        });
    };
    self.renderTick = function () {
        let s = self.score;
        let tick = t + 'tick' + s;
        let str = '<div class="tickcontainer tickcontainer' + t + '" id="' + tick + '"><div class="tick"></div></div>';
        $($('.race').find('td')[s - 1]).find('.ticker').append(str);
        $('#' + tick).find('.tick').animate(
            {
                width: '36px',
                height: '36px',
                top: '18px',
                left: '18px'
            }
        );
    };
    self.shrinkTick = function (s) {
        $('#' + t + 'tick' + s).find('.tick').animate(
            {
                width: '0px',
                height: '0px',
                top: '36px',
                left: '36px'
            }, 300, function () {
                $('#' + t + 'tick' + s).remove();
            }
        );
    };
    self.playerReverse = function () {
        advancePlayer();

    };
    self.showProgress2 = function (boo) {
        let s = boo ? self.score : self.scorePending - 1;
        s < 0 ? s = 0 : '';
        self.iWon(true);
        console.log(`s is ${s} and there are ${$('.race').find('td').length} tds`);
        if ($($('.race').find('td')[s]).position() === undefined) {
            console.log(`s is ${s} and there are ${$('.race').find('td').length} tds`);
            console.log(`boo ${boo}`);
            console.log(`self.score ${self.score}`);
            console.log(`self.scorePending ${self.scorePending}`);
            console.error(`illegal attempt to find left value for non-existant td`);
            debugger;
            return;
        } else {

        }
        let w = ($($('.race').find('td')[0]).width() / 2) + $($('.race').find('td')[s]).position().left + 40;
        self.progressBar.stop();
        self.progressing = true;
        $('#arrow-' + t).css({
            left: '0px'
        });
        if (!boo) {
            self.shrinkTick(self.score);
        }
        $('#arrow-' + t).animate(
            {
                width: (w + 20) + 'px'
            }, {
                duration: self.getDelay(),
                specialEasing: {
                    width: 'easeInQuart'
                },
                complete: function () {
                    self.progressing = false;
                    self.updateScore(self.scorePending);
                    $('#arrow-' + t).find('img').addClass('big');
                    setTimeout(function () {
                        $('#arrow-' + t).css({width: w + 'px'});
                    }, 50);
                    setTimeout(function () {
                        $('#arrow-' + t).find('img').removeClass('big');
                    }, 100);

                    if (boo) {
                        self.renderTick();
                        if (self.iWon()) {
                            self.rival.defeat();
                            self.victory();
                        }
                    } else {
                        setTimeout(self.playerReverse, self.getDelay() * 1.1);
                    }
                }
            }
        );
    };
    self.showCorrect = function () {
        const op = $('#' + t).find('.option');
        for (var i = 0; i < op.length; i++) {
            if ($($(op[i]).find('span')[0]).html() === self.q.answer) {
                $(op[i]).addClass('reveal');

                break;
            }
        }
    };
    self.victory = function () {
        $('#' + t).find('.option').removeClass('inactive');
        $('#' + t).find('.option').addClass('inactive');
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
        let o = {
            player1: {
                mid: {top: '-20px'},
                end: {top: '0px'}
            },
            player2: {
                mid: {bottom: '-20px'},
                end: {bottom: '0px'}
            }
        };
        setTimeout(function () {
            $('#winbanner').addClass(t);
            $('#winbanner').animate(o[t].mid, 300, function () {
                $('#winbanner').css(o[t].end);
            });
        }, 1000);
        self.dunne();
        storeAggregate(t, 'win');
        setTimeout(window.endgame, 5000);
    };
    self.defeat = function () {
        clearTimeout(self.autoInt);
        $('#' + t).find('.option').addClass('defeat');
        $('#' + t).find('.td').addClass('defeat');
        $('#losebanner').addClass(t);
        self.dunne();
    };
    self.endTimers = function () {
        console.log('endTimers');
        Object.keys(self.timers).forEach(t => {
            clearTimeout(t);
        });
    };
    self.dunne = function () {
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
        self.endTimers();
    };
    self.scoreFunk = function () {
        console.log(`scoreFunk, self.scorePending: ${self.scorePending}, type: ${typeof(self.scorePending)}`);
        self.updateScorePending(self.scorePending + 1);
        self.showOverlay(false);
        self.showProgress2(true);
        setTimeout(self.nextQuestion, self.getDelay() * 1.3);
        setTimeout(advancePlayer, self.getDelay() * 1.1);
        drawHeaderArrow(false);
    };
    self.stealFunk = function () {
        self.rival.onSteal();
        self.showOverlay(false);
        self.nextQuestion();
    };
    self.onSteal = function () {
        self.updateScorePending(self.scorePending - 1);
        self.showProgress2(false);
        self.showOverlay(false);
    };
    self.scoreOrSteal = function () {
        let agression = 0.7;
        let button = self.buttonScore;
        let funk = self.scoreFunk;;
        if (Math.random() < agression && pushbackAvailable()) {
            button =  self.buttonSteal;
            funk = self.stealFunk;
        }
        clearTimeout(self.autoInt);
        self.autoInt = setTimeout(function () {
            button.addClass('oover');
            clearTimeout(self.autoInt);
            self.autoInt = setTimeout(function () {
                button.removeClass('oover');
                clearTimeout(self.autoInt);
                self.autoInt = setTimeout(funk, 100);
            }, 400);
        }, 1000);
    }
    self.getQuestionSequence = getQuestionSequence;
    self.onOption = function (i) {
        var boo = self.q.options[i] === self.q.answer;
        self.submit(boo);
        if (boo) {
            $($('#' + t).find('.option')[i]).addClass('reveal');
        } else {
            $($('#' + t).find('.option')[i]).addClass('selected');
        }
        return boo;
    }
    let os = $('#' + t).find('.option');
    for (var i = 0; i < os.length; i++) {
        $(os[i]).attr('id', t + '_option_' + i);
    }
    $('#' + t).find('.option').click(function (ev) {
        self.onOption(parseInt(ev.target.id.split('_').reverse()[0]));
    });
    self.buttonScore.on('click', function () {
        self.scoreFunk();
    });
    self.buttonSteal.on('click', function () {
        self.stealFunk();
    });


    $('.imgbutton').hover(function () {
        $(this).addClass('oover');
    }, function () {
        $(this).removeClass('oover');
    });


//    resizePlayer();
    document.getElementsByTagName('body')[0].onresize = function () {
        resizePlayer();
    }
    new Button('moveon');
    new Button('pushback');
    self.showScore();
    drawHeaderArrow(true);
    // defaults:
    setQuizType(1);
    importSVGs();
    self.showOverlay(false);
//    getQuestionSequence();
    quizzes[t] = self;
//    go();
//    self.console = {
//        log: function (a, b, c) {
//            window.theConsole.log(t, a);
//        }
//    }
    return self;
};

const QuizV1 = function (t) {
    let autoPlay = false;
    this.setAutoplay = function (boo) {
        autoPlay = boo;
        console.log(`autoplay to ${autoplay}`);
    };
    let q = null;
    let typeMap = {
        1: {id: 1, type: 'single'},
        2: {id: 2, type: 'multi'}
    }
    let self = {
        id: t.replace('r', 'r '),
        autoComplete: false,
        autoInt: null,
        title: t,
        type: null,
        currentQuestions: null,
        questionBanks: {},
        q: null,
        qID: null,
        aDelay: {min: 400, max: 5000},

//        aDelay: {min: 50, max: 60},
//        aDelay: {min: 2000, max: 5000},
        score: 0,
        scorePending: null,
        rival: null,
        questionDiv: null,
        optionsDiv: null,
        questionDiv: document.getElementById(t).querySelector('.question'),
        optionsDiv: document.getElementById(t).querySelectorAll('.option'),
        progressBar: null,
        progressing: null,
        active: false,
        buttonScore: $('#' + t).find('.moveon'),
        buttonSteal: $('#' + t).find('.pushback'),
        timers: {askQ: 0},
        skill: 0.4
    };
    let delays = {
        overlay: 1200,
        autoAnswer: {min: 1500, max: 7000}
    };
//    delays = {
//        overlay: 200,
//        autoAnswer: {min: 300, max: 400}
//    };
    let questionReport = null;
    let aTime = null;
    function go () {
        // start the game with settings applied
        $('#' + t).show();
        self.askQuestion();
//        console.log(`${t} go`)
    }
    function getSpecificDelay (d, skilled) {
//        console.log(1 - self.skill);
        var dr = 2000, ds, r;
        if (delays.hasOwnProperty(d)) {
            if (typeof(delays[d]) === 'number') {
                dr = delays[d];
            } else {
                ds = delays[d];
                r = Math.random();
                dr = (r * (ds.max - ds.min)) * (skilled ? (1 - self.skill) : 1);
                dr = ds.min + dr;
                dr = Math.round(dr);
//                console.log(self.skill, dr);
            }
        } else {
            console.log('no delay set with name ' + d + ', returning default (2000)');
        }
        return dr;
    }
    function reset () {
        self.score = 0;
        self.scorePending = 0;
        advancePlayer();
        self.resetProgress();
        self.getQuestionSequence();
//        console.log('the reset');
//        self.askQuestion();
        self.activateOptions(false);
        self.showOverlay(false);
        $('#' + t).hide();
        $('#losebanner').removeClass(t);
        $('#winbanner').removeClass(t);
        $('div').removeClass('defeat').removeClass('dunne').removeClass('inactive');
        $('.tickcontainer').remove();
        console.log('RESET');
        let selff = Object.assign({}, self);
        delete selff.rival;
        console.log(JSON.stringify({score: selff.score}));
    }
    function getQuestionSequence () {
        var s = [];
        questionBankSet.forEach(b => {
//            console.log(b);
            s.push(questionBanks[b].getQuestion());
        });
//        console.log(s.length === 8);
        self.currentQuestions = s;
//        console.log(s);
        return s;
    }
    function drawHeaderArrow (boo) {
        let ha = $('#' + t).find('.headerarrow');
        let s = self.score;
        let td = $($('.buttons').find('.topic_button')[s]);
        let ac = td.css('background-color');
        let p = $('#' + t);
        if (boo) {
            let d = self.score > 0 ? td.offset() : td.position();
            let adj = null;

            d = td.offset();
            let css = {
                display: boo ? 'inline-block' : 'none',
                'border-top-color': (boo ? ac : 'white'),
                'border-left-width': td.width() / 2,
                'border-right-width': td.width() / 2,
                left: (d.left - p.position().left - adj) + 'px',
                left: p.width() / 2 + 'px'
            };
            if (self.score > 0) {
                css.left = (d.left - p.position().left) + 'px';
            } else {
                if (t === 'player2') {
                    css.left = '0px';
                } else {
                    css.left = '0px';
//                    css.left = p.width() / 2 + 'px';
                }
            }
            ha.css(css);
            ha.animate({'border-top-width': '30px'}, 200);
        } else {
            if (!isFinalQuestion()) {
                ha.animate({'border-top-width': '0px'}, 200);
            }
        }
    }
    function advancePlayer () {
        if (self.iWon()) {
//            console.log('no more');
            return;
        }

        let s = self.score;
        let td = $($('.race').find('td')[s]);
//        console.log(`advP s is ${s} and there are ${$('.race').find('td').length} tds`);
        //
        //
        //
//        console.error('intermittent issue occurs here, problem finding "left" of td.offset() below:');
        //
        //
        //
        let x = td.offset().left - (td.width() / 2);
        let gap = x - $('#' + t).position().left;
//        console.log(`advancePlayer, gap: ${gap}`);
        if (self.score === 0) {
            x = td.offset().left;
        }
        if (isFinalQuestion()) {
            x = $($('.race').find('td')[self.score - 1]).offset().left;
        }
        $('#'+ t).animate({
            left: x + 'px'
        }, 300, function () {
            $('#'+ t).find('.underlay').find('.header').css({
                'background-color': $($('.buttons').find('.topic_button')[s]).css('background-color'),
                'background-color': 'white',
            });
            drawHeaderArrow(true);
            if (gap < 0) {
                // player is being pushed back, set up new question:
                self.setNewQuestionBank(questionBankSet[self.score]);
//                console.log('the advancePlayer method calls self.askQuestion!!');
                if (self.score > 0) {
                    self.askQuestion();
                } else {
//                    console.log('no, not doing that, we have reset');
                }
            }
        });
    }
    function setQuizType (n) {
        // single or multi subject - multi changes subject (question bank) on correct answer
        if (typeof(n) !== 'number') {
            alert('setQueizType requires a number');
        } else if (!typeMap.hasOwnProperty(n)) {
            alert(`typeMap has no definition for type ${n}`);
        } else {
            self.type = typeMap[n];
//            console.log(`${t} quiz type set to ${self.type.type}`)
        }
    }
    function resizePlayer () {
        $('#' + t).css({
            width: ($('.topic_button').width() * 2 + 1) + 'px',
            padding: '30px 0px'
        });
//        $('#' + t).show();
    }
    function setAutoComplete (boo) {
        self.autoComplete = boo;
//        console.log(`autoComplete to ${boo}`);
    }
    function isFinalQuestion () {
//        console.log(self.getWinTotal(), self.score);
        return self.getWinTotal() - self.score === 1;
    }
    function pushbackAvailable () {
//        return true;
//        return self.score > 0 && self.rival.score > 1;
        return self.score > 0 && (self.rival.score - self.score > 1);
    }
    function moveonAvailable () {
        return true;
    }
    function importSVGs () {
        new ImportSVG('moveonfront');
        new ImportSVG('moveonback');
        new ImportSVG('moveonshadow');
        new ImportSVG('pushbackfront');
        new ImportSVG('pushbackback');
        new ImportSVG('pushbackshadow');
    }
    function autoAnswer () {
        let a = null;
        let c = null;
        self.q.options.forEach((o, i) => {
            if (o === self.q.answer) {
                c = i;
            }
        });
        a = Math.random() < self.skill ? c : Math.floor(Math.random() * 4);
        let boo = self.onOption(a);
        amendAnswerReport(boo ? 'correct' : 'incorrect');
    }
    function amendQuestionReport (q) {
        // build the question aggregate lists for localStorage (dev method, can be removed in deployment)
//        console.log('amendQuestionReport:');
//        console.log(q);
        let id = q.bank.replace(/ /gm, '_');
        let qr = questionReport;
        let qrls = localStorage.getItem('questionReport');
        if (qrls !== null) {
            qr = JSON.parse(qrls);
//            console.log('stored version:');
//            console.log(qr);
        }
        if (qr === null) {
            qr = {};
            qr[id] = {index: []};
            qr[id].index[q.id] = 1;
        } else {
            if (qr.hasOwnProperty(id)) {
                if (typeof(qr[id].index[q.id]) === 'number') {
                    qr[id].index[q.id] += 1;
                } else {
                    qr[id].index[q.id] = 1;
                }
            } else {
                qr[id] = {index: []};
                qr[id].index[q.id] = 1;
            }
        }
        questionReport = qr;
//        console.log(questionReport);
        localStorage.setItem('questionReport', JSON.stringify(questionReport));
//        localStorage.setItem('questionReportV1', JSON.stringify(questionReport));

    }
    let aTimeAv = null;
    function amendAnswerReport (type, val) {
        let l = `skill_${self.skill.toString().replace('.', '_')}`;
        let answerReport = localStorage.getItem('answerReport');
        if (answerReport === null) {
            answerReport = {};
        } else {
            answerReport = JSON.parse(answerReport);
        }
        if (!answerReport.hasOwnProperty(l)) {
            answerReport[l] = {};
        }
        if (!answerReport[l].hasOwnProperty('correct')) {
            answerReport[l] = {correct: 0, incorrect: 0, correctPerc: 0};
        }
        if (type === 'aTime') {
            // time to answer; store average
            if (!answerReport[l].hasOwnProperty('timeToAnswer')) {
                answerReport[l].timeToAnswer = {total: 0, count: 0, av: 0};
            }
            let tta = answerReport[l].timeToAnswer;
            tta.count += 1;
            tta.total = tta.total + val;
            tta.av = tta.total / tta.count;
            answerReport[l].avTime = tta.av;
        }
        if (type === 'correct' || type === 'incorrect') {
            let ar = answerReport[l];
            ar[type] += 1;
            ar.correctPerc = ar.correct / (ar.correct + ar.incorrect) * 100;
        }
        let summary = {
//            correctPercentage: answerReport[l].correctPerc,
//            timeToAnswer: answerReport[l].avTime
        };
        Object.entries(answerReport).forEach((v, k) => {
//            console.log(v);
            summary[v[0]] = {
                correctPercentage: v[1].correctPerc,
                timeToAnswer: v[1].avTime
            };
        });
        localStorage.setItem('answerReport', JSON.stringify(answerReport));
        localStorage.setItem('answerReportSummary', JSON.stringify(summary));
    }
    function amendUserAnswerReport (n) {
//        console.log(`aur: ${n}, ${typeof(n)}`);
        let d = new Date();
        let t = d.getTime();
        let gap = null;
        let write = true;
        let id = 'userAnswerReport';
        let av = localStorage.getItem(id);
        if (av === null) {
            av = {average: 0, total: 0, count: 0, aCount: 0, aCorrect: 0, aIncorrect: 0, aPerc: 0};
        } else {
            av = JSON.parse(av);
        }
        if (typeof(n) === 'number') {
            // this is a timer update
            if (n === 0) {
                aTime = t;
            } else {
                gap = t - aTime;
                if (gap > (av.average * 2) && av.average > 0) {
                    write = false;
                }
                av.count += 1;
                av.total += gap;
                av.average = av.total / av.count;
            }
        }
        if (typeof(n) === 'boolean') {
            // this is a correct/incorrect answer response
            av.aCount += 1;
            av[n ? 'aCorrect' : 'aIncorrect'] += 1;
            av.aPerc = (av.aCorrect / av.aCount) * 100;
        }
        if (write) {
            console.log('write ' + id + 'Summary')
            localStorage.setItem(id, JSON.stringify(av));
            localStorage.setItem(id + 'Summary', JSON.stringify({timeToAnswer: av.average, correctPercentage: av.aPerc}));
        } else {
            console.log('outlier, not writing (average is ' + av.average + ', gap is ' + gap + ')');
        }
    }
    self.setSkillLevel = function (n) {
        if (typeof(n) !== 'number') {
            alert('skill must be a number');
        } else if (n < 0 || n > 1) {
            alert('skill must be a decimal between 0 and 1');
        } else {
            self.skill = n;
        }
    };
    self.setAutoComplete = setAutoComplete;
    self.setQuizType = setQuizType;
    self.reset = reset;
    self.go = go;
    self.getSpecificDelay = getSpecificDelay;
    self.getDelay = function () {
        return self.aDelay.min;
    };
    self.getGap = function () {
        return self.score - self.rival.score;
    };
    self.setRival = function (q) {
        self.rival = q;
    };
    self.setNewQuestionBank = function (id) {
//        console.log(`setNewQuestionBank: ${id}`);
//        let o = localStorage.getItem('_stuff');
        self.qID = id;
        self.currentQuestions = getQuestionSet(id);
//        console.log(self.currentQuestions);
        /*
        let mid = self.currentQuestions[0].id;
        if (o === null) {
            o = [];
            o[mid] = 1;
        } else {
            o = o.split(',');
            if (isNaN(parseInt(o[mid]))) {
                o[mid] = 1;
            } else {
                o[mid] = parseInt(o[mid]) + 1;
            }
        }
        localStorage.setItem('_stuff', o.toString());
        */
        self.questionBanks[id] = self.currentQuestions;

    };
    self.activateOptions = function (boo) {
//        console.log(boo);
//        debugger;
        self.active = boo;
        if (boo) {
            $('#' + t).find('.option').removeClass('inactive');
//            $('#' + t).find('#qZone').show();
        } else {
            $('#' + t).find('.option').addClass('inactive');
//            $('#' + t).find('#qZone').hide();
        }
        $('#' + t).find('.option').removeClass('reveal');
        $('#' + t).find('.option').removeClass('selected');
    };
    self.askQuestion = function () {
//        console.log('ask me ask me ask me');
        var s, a, i;
        self.q = self.currentQuestions.shift();
//        console.log(self.q);

        if (self.iWon()) {
            console.log('i won, so stop here')
            return;
        }
        if (!self.q) {
            self.currentQuestions = getQuestionSet(self.qID);
            self.askQuestion();
        } else {
            s = '<span>' + self.q.question + '</span>';
            for (i = 0; i < 100; i++) {
                self.q.options.reverse();
                self.q.options.sort(rSort);
            }
            self.q.options.forEach((o, id) => {
                self.optionsDiv[id].innerHTML = '<span>' + o + '</span>';
            });
            if (self.questionDiv) {
                self.questionDiv.innerHTML = s;
            }
        }
        $('#' + t).find('.option').addClass('blank');
        self.activateOptions(false);
        setTimeout(function () {
            $('#' + t).find('.option').removeClass('blank');
            self.activateOptions(true);
        }, 1000);
        $('#' + t).find('.question').addClass('blank');
        setTimeout(function () {
            $('#' + t).find('.question').removeClass('blank');
            resizePlayer();
        }, 500);

        amendQuestionReport(self.q);
        if (self.autoComplete) {
            clearTimeout(self.autoInt);
            let aTime = self.getSpecificDelay('autoAnswer', true);
            amendAnswerReport('aTime', aTime);
            self.autoInt = setTimeout(autoAnswer, aTime);
        } else {
            amendUserAnswerReport(0);
        }
    };
    self.addToDebug = function (f) {
//        if ($('#' + t).find('.' + f.replace('self.', '')).length === 0) {
//            $('#' + t).find('.debug').append('<p class="' + f.replace('self.', '') + '"></p>');
//        }
//        $('#' + t).find('.' + f.replace('self.', '')).html(f.replace('self.', '') + ': ' + eval(f));
    };
    self.showScore = function () {
        self.progressBar = $($('#' + t).find('.bar')[self.score]);
    };
    self.updateScorePending = function (s) {
        if (typeof(s) === 'number') {
            if (s >= 0) {
                if (self.scorePending === null) {
                    self.scorePending = self.score;
                }
                self.scorePending = s;
//                console.log(`scorePending for ${t} to ${self.scorePending}`);
                self.addToDebug('self.scorePending');
            }
        }
    };
    self.updateScore = function (s) {
        if (typeof(s) === 'number') {
            if (s >= 0) {
                self.score = s;
                self.scorePending = s;
                console.log(`score AND scorePending for ${t} to ${s}`);
                self.showScore();
                self.addToDebug('self.score');
            }
        }
    };
    function resetOverlay () {
        $('#' + t).find('.overlay').css({
            left: ($('#' + t).find('.underlay').position().left + 1) + 'px',
            display: 'none'
        });
    }
    function onOverlayComplete () {
        //
    }
    self.showOverlay = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        if (boo) {
            olay.show();
            if (moveonAvailable()) {
                self.buttonScore.show();
                self.buttonScore.animate({left: '470px'}, 50).animate({left: '440px'}, 500);
                if (self.autoComplete) {
                    self.scoreOrSteal();
                }
            } else {
                self.buttonScore.hide();
            }
            if (pushbackAvailable()) {
                setTimeout(function () {
                    self.buttonSteal.show();
                        self.buttonSteal.animate({left: '-130px'}, 50).animate({left: '-100px'}, 500);
                    }, 300);
            } else {
                self.buttonSteal.hide();
            }
            onOverlayComplete();
        } else {
            olay.hide();
            self.buttonScore.hide();
            self.buttonSteal.hide();
        }
    }
    self.showOverlayv1 = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        let l = null;
        if ((ulay.offset().left + ulay.width() + 20 + olay.width()) < $('body').width()) {
            l = ulay.position().left + ulay.width() + 30;
        } else {
            l = ulay.position().left - olay.width() - 30;
        }
        if (boo) {
            let r = Math.random() > 0.45;
            olay.show();
            olay.animate({
                left: l + 'px'
            }, {
                duration: r ? 1600 : 500,
                specialEasing: {
                  left: r ? "easeOutBounce" : "easeOutSine"
                },
                complete: onOverlayComplete
            });
        } else {
            olay.animate({
                left: (ulay.position().left + 5) + 'px'
            }, 300, function () {
                resetOverlay();
            });
        }
    };
    self.submit = function (boo) {
        if (self.active) {
            self.activateOptions(false);
            if (boo) {
//                console.log(self.iWon())
                if (self.iWon()) {
                    console.log('i won')
                }
                if (isFinalQuestion()) {
                    self.scoreFunk();
                } else {
                    setTimeout(function () {
                        self.showOverlay(true);
                    }, self.getSpecificDelay('overlay'));
                }
                if (self.rival.score === 0) {
                    $('#' + t).find('.steal').addClass('inactive');
                } else {
                    $('#' + t).find('.steal').removeClass('inactive');
                }
            } else {
                self.showCorrect();
                self.timers.askQ = setTimeout(self.askQuestion, 3000);
            }
        }
        if (self.autoComplete) {
            self.showCorrect();
        } else {
            amendUserAnswerReport(1);
            amendUserAnswerReport(boo);
            showUserAnswerSummary();
        }
    };
    self.nextQuestion = function () {
//        console.log('next q, have I won ? ' + self.iWon());
//        console.log(t + ': done, done, on to the next one')
        if (!self.iWon()) {
            if (self.type.id === 2) {
                self.setNewQuestionBank(questionBankSet[self.score]);
            }
            self.askQuestion();
        }
    };
    self.getWinTotal = function () {
//        return 2;
//        return $('#' + t).find('.bar').length;
        if (t === 'player2') {
//            console.log($('#' + t));
//            console.log($('#race'));
//            console.log($('#race').find('td'));
        }
        return $('.race').find('td').length;
    };
    self.iWon = function (log) {
        let won = self.score === self.getWinTotal();
        if (self.score > self.getWinTotal()) {
            console.log(won, self.score, self.getWinTotal());
        }
        if (log) {
            console.log(won, self.score, self.getWinTotal(), typeof(self.score), typeof(self.getWinTotal()));
        }
        if (self.score >= self.getWinTotal()) {
            console.log('WIN', won, self.score, self.getWinTotal());
        }
        return won;
    };

    self.resetProgress = function () {
        $('#arrow-' + t).css({
            left: '-40px',
            width: '0px'
        });
    };
    self.showProgress = function (boo) {
        if (!boo) {
            self.progressBar = $($('#' + t).find('.bar')[self.score - (boo ? 0 : (self.progressing ? 0 : 1))]);
        }
        self.progressBar.stop();
        self.progressing = true;
        self.progressBar.animate({
            width: boo ? '100%' : '0%'
        }, {
            duration: self.getDelay(),
            specialEasing: {
                width: 'swing'
            },
            complete: function () {
                self.progressing = false;
                self.updateScore(self.scorePending);
                if (boo) {
                    if (!self.iWon()) {
        //                    self.nextQuestion();
                    } else {
                        self.rival.defeat();
                        self.victory();
                    }
                }
            }
        });
    };
    self.renderTick = function () {
        let s = self.score;
        let tick = t + 'tick' + s;
        let str = '<div class="tickcontainer tickcontainer' + t + '" id="' + tick + '"><div class="tick"></div></div>';
        $($('.race').find('td')[s - 1]).find('.ticker').append(str);
        $('#' + tick).find('.tick').animate(
            {
                width: '36px',
                height: '36px',
                top: '18px',
                left: '18px'
            }
        );
    };
    self.shrinkTick = function (s) {
        $('#' + t + 'tick' + s).find('.tick').animate(
            {
                width: '0px',
                height: '0px',
                top: '36px',
                left: '36px'
            }, 300, function () {
                $('#' + t + 'tick' + s).remove();
            }
        );
    };
    self.playerReverse = function () {
        advancePlayer();

    };
    self.showProgress2 = function (boo) {
        let s = boo ? self.score : self.scorePending - 1;
        s < 0 ? s = 0 : '';
        self.iWon(true);
        if ($($('.race').find('td')[s]).position() === undefined) {
            console.log(`s is ${s} and there are ${$('.race').find('td').length} tds`);
            console.log(`boo ${boo}`);
            console.log(`self.score ${self.score}`);
            console.log(`self.scorePending ${self.scorePending}`);
        }
        let w = ($($('.race').find('td')[0]).width() / 2) + $($('.race').find('td')[s]).position().left + 40;
        self.progressBar.stop();
        self.progressing = true;
        $('#arrow-' + t).css({
            left: '0px'
        });
        if (!boo) {
            self.shrinkTick(self.score);
        }
        $('#arrow-' + t).animate(
            {
                width: (w + 20) + 'px'
            }, {
                duration: self.getDelay(),
                specialEasing: {
                    width: 'easeInQuart'
                },
                complete: function () {
                    self.progressing = false;
                    self.updateScore(self.scorePending);
                    $('#arrow-' + t).find('img').addClass('big');
                    setTimeout(function () {
                        $('#arrow-' + t).css({width: w + 'px'});
                    }, 50);
                    setTimeout(function () {
                        $('#arrow-' + t).find('img').removeClass('big');
                    }, 100);

                    if (boo) {
                        self.renderTick();
                        if (self.iWon()) {
                            self.rival.defeat();
                            self.victory();
                        }
                    } else {
                        setTimeout(self.playerReverse, self.getDelay() * 1.1);
                    }
                }
            }
        );
    };
    self.showCorrect = function () {
        const op = $('#' + t).find('.option');
        for (var i = 0; i < op.length; i++) {
            if ($($(op[i]).find('span')[0]).html() === self.q.answer) {
                $(op[i]).addClass('reveal');

                break;
            }
        }
    };
    self.victory = function () {
//        console.log('Vic Tory');
        $('#' + t).find('.option').removeClass('inactive');
        $('#' + t).find('.option').addClass('inactive');
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
        let o = {
            player1: {
                mid: {top: '-20px'},
                end: {top: '0px'}
            },
            player2: {
                mid: {bottom: '-20px'},
                end: {bottom: '0px'}
            }
        };
        setTimeout(function () {
            $('#winbanner').addClass(t);
            $('#winbanner').animate(o[t].mid, 300, function () {
                $('#winbanner').css(o[t].end);
            });
        }, 1000);
        self.dunne();
        storeAggregate(t, 'win');
        setTimeout(window.endgame, 5000);
    };
    self.defeat = function () {
        clearTimeout(self.autoInt);
        $('#' + t).find('.option').addClass('defeat');
        $('#' + t).find('.td').addClass('defeat');
        $('#losebanner').addClass(t);
        self.dunne();
//        console.log(`${t} loses`);
    };
    self.endTimers = function () {
        console.log('endTimers');
        Object.keys(self.timers).forEach(t => {
            clearTimeout(t);
        });
    };
    self.dunne = function () {
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
        self.endTimers();
    };
    self.scoreFunk = function () {
        console.log(`scoreFunk, self.scorePending: ${self.scorePending}, type: ${typeof(self.scorePending)}`);
        self.updateScorePending(self.scorePending + 1);
        self.showOverlay(false);
        self.showProgress2(true);
        setTimeout(self.nextQuestion, self.getDelay() * 1.3);
        setTimeout(advancePlayer, self.getDelay() * 1.1);
        drawHeaderArrow(false);
    };
    self.stealFunk = function () {
        self.rival.onSteal();
        self.showOverlay(false);
        self.nextQuestion();
//        setTimeout(advancePlayer, self.getDelay() * 1.3);
//        self.scoreFunk();
    };
    self.onSteal = function () {
        self.updateScorePending(self.scorePending - 1);
        self.showProgress2(false);
        self.showOverlay(false);
    };
    self.scoreOrSteal = function () {
        let agression = 0.7;
        let button = self.buttonScore;
        let funk = self.scoreFunk;;
        if (Math.random() < agression && pushbackAvailable()) {
            button =  self.buttonSteal;
            funk = self.stealFunk;
        }
        clearTimeout(self.autoInt);
        self.autoInt = setTimeout(function () {
            button.addClass('oover');
            clearTimeout(self.autoInt);
            self.autoInt = setTimeout(function () {
                button.removeClass('oover');
                clearTimeout(self.autoInt);
                self.autoInt = setTimeout(funk, 100);
            }, 400);
        }, 1000);
    }
    self.getQuestionSequence = getQuestionSequence;
    self.onOption = function (i) {
        var boo = self.q.options[i] === self.q.answer;
        self.submit(boo);
        if (boo) {
            $($('#' + t).find('.option')[i]).addClass('reveal');
        } else {
            $($('#' + t).find('.option')[i]).addClass('selected');
        }
        return boo;
    }
    let os = $('#' + t).find('.option');
    for (var i = 0; i < os.length; i++) {
        $(os[i]).attr('id', t + '_option_' + i);
    }
    $('#' + t).find('.option').click(function (ev) {
        self.onOption(parseInt(ev.target.id.split('_').reverse()[0]));
    });
    self.buttonScore.on('click', function () {
        self.scoreFunk();
    });
    self.buttonSteal.on('click', function () {
        self.stealFunk();
    });


    $('.imgbutton').hover(function () {
        $(this).addClass('oover');
    }, function () {
        $(this).removeClass('oover');
    });


//    resizePlayer();
    document.getElementsByTagName('body')[0].onresize = function () {
        resizePlayer();
    }
    new Button('moveon');
    new Button('pushback');
//    console.log($('.topic_button').width());
    self.showScore();
    drawHeaderArrow(true);
    // defaults:
    setQuizType(1);
    importSVGs();
    self.showOverlay(false);
//    getQuestionSequence();
    quizzes[t] = self;
//    go();
    window.console = {
        log: function (a, b, c) {
            window.theConsole.log(t, a);
        }
    }
    return self;
};
const checkQuestions = function () {
    let i, a, qr = true;
//    console.log(questionBankSet);
    a = Object.values(questionBanks);
    for (i = 0; i < a.length; i++) {
        if (!a[i].ready) {
            qr = false;
            break;
        }
    }
    if (qr) {
        quizReady();
    } else {
        setTimeout(checkQuestions, 10);
    }
};
const checkQuestionBankSet = function () {
    if (questionBankSet) {
        questionBankSet.forEach(s => {
//            new QuestionBank(s);
        });
        checkQuestions();
    } else {
        setTimeout(checkQuestionBankSet, 100);
    }
};
let q1 = null;
let q2 = null;
checkQuestionBankSet();
let ts = new Timestamp();
let countdown = null;
const reset = function () {
    setup();
    for (var i in quizzes) {
        quizzes[i].reset();
    }
};
const restart = function (pa) {
    pa.addClass('inactive');
    pa.fadeOut();
    setTimeout(reset, 1000);
};
const endgame = function () {
//    console.log('endgame');
    let pa = $('#playagain');
    showTopping(true);
//    showContent(false);
    $('.content').hide();
    pa.show();
//    pa = pa.find('.button');
//    console.log(pa);
    pa.removeClass('inactive');
    pa.off('click');
    pa.on('click', function () {
        restart(pa);
    })
    if (autoplay) {
        setTimeout(function () {
            restart(pa);
        }, 1000);
    };
//    pa.show();
};
const go = function () {
    console.log('GO!');
    showIntro(false);
//    showTopping(false);
//    theCountdown();
    countdown.go();
    for (var i in quizzes) {
//        quizzes[i].go();
    }
};
const startQuiz = function () {
    showTopping(false);
    for (var i in quizzes) {
        quizzes[i].go();
    }
};
const setAutoplay = function (boo) {
//    console.log(boo);
    autoplay = boo;
}
window.reset = reset;
window.endgame = endgame;
window.go = go;
window.setup = setup;
//reset();
//window.theConsole = window.console;
//window.consoleNO = {
//    log: function (s) {
//
//    }
//}
