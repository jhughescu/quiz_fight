let questionBankSet = null;
let questionBanks = {};
let quizzes = {};

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
        skill: 0.4
    };
    let delays = {
        overlay: 1200,
        autoAnswer: {min: 1500, max: 5000}
    };
    function getDelay (d) {
        var dr = 2000, ds, r;
        if (delays.hasOwnProperty(d)) {
            if (typeof(delays[d]) === 'number') {
                dr = delays[d];
            } else {
                ds = delays[d];
                r = Math.random();
                dr = ds.min + Math.round(r * (ds.max - ds.min));
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
        self.askQuestion();
        self.showOverlay(false);
        $('#losebanner').removeClass(t);
        $('#winbanner').removeClass(t);
        $('div').removeClass('defeat').removeClass('dunne').removeClass('inactive');
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
            let adj = self.score > 0 ? 0 : $('#playzone').position().left;
            d = td.offset();
            ha.css({
                display: boo ? 'inline-block' : 'none',
                'border-top-color': (boo ? ac : 'white'),
                'border-left-width': td.width() / 2,
                'border-right-width': td.width() / 2,
                left: (d.left - p.position().left - adj) + 'px'
            });
            ha.animate({'border-top-width': '30px'}, 200);
        } else {
            if (!isFinalQuestion()) {
                ha.animate({'border-top-width': '0px'}, 200);
            }
        }
    }
    function advancePlayer () {
        if (self.iWon()) {
            console.log('no more');
            return;
        }
        let s = self.score;
        let td = $($('.race').find('td')[s]);
        let x = td.offset().left - (td.width() / 2);
        let gap = x - $('#' + t).position().left;
        console.log(`advancePlayer, gap: ${gap}`);
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
                self.askQuestion();
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
        $('#' + t).show();
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
        self.onOption(a);
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
        self.active = boo;
        if (boo) {
            $('#' + t).find('.option').removeClass('inactive');
        } else {
            $('#' + t).find('.option').addClass('inactive');
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
        if (self.autoComplete) {
            clearTimeout(self.autoInt);
            self.autoInt = setTimeout(autoAnswer, getDelay('autoAnswer'));
        }
    };
    self.addToDebug =  function (f) {
        if ($('#' + t).find('.' + f.replace('self.', '')).length === 0) {
            $('#' + t).find('.debug').append('<p class="' + f.replace('self.', '') + '"></p>');
        }
        $('#' + t).find('.' + f.replace('self.', '')).html(f.replace('self.', '') + ': ' + eval(f));
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
//                console.log(`score AND scorePending for ${t} to ${s}`);
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
                    }, getDelay('overlay'));
                }
                if (self.rival.score === 0) {
                    $('#' + t).find('.steal').addClass('inactive');
                } else {
                    $('#' + t).find('.steal').removeClass('inactive');
                }
            } else {
                self.showCorrect();
                setTimeout(self.askQuestion, 3000);
            }
        }
        if (self.autoComplete) {
            self.showCorrect();
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
    self.iWon = function () {
        let won = self.score === self.getWinTotal();
//        console.log(won, self.score, self.getWinTotal());
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
        let w = ($($('.race').find('td')[0]).width() / 2) + $($('.race').find('td')[s]).position().left + 40;
        if (!boo) {
//            self.progressBar = $($('#' + t).find('.bar')[self.score - (boo ? 0 : (self.progressing ? 0 : 1))]);
        }
//        console.log(`s is ${s}`);
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
        console.log(`${t} wins`);
    };
    self.defeat = function () {
        clearTimeout(self.autoInt);
        $('#' + t).find('.option').addClass('defeat');
        $('#' + t).find('.td').addClass('defeat');
        $('#losebanner').addClass(t);
        self.dunne();
        console.log(`${t} loses`);
    };
    self.dunne = function () {
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
    };
    self.scoreFunk = function () {
//        console.log('onScore');
        self.updateScorePending(self.scorePending + 1);
        self.showOverlay(false);
//        self.showProgress(true);
//        debugger;
        self.showProgress2(true);
        setTimeout(self.nextQuestion, self.getDelay() * 1.3);
        setTimeout(advancePlayer, self.getDelay() * 1.1);
        drawHeaderArrow(false);
//        console.log('onscore', isFinalQuestion())
//        console.log(self.getGap())
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
//let t = new Template2();
//console.log(ts);
const reset = function () {
    for (var i in quizzes) {
        quizzes[i].reset();
    }
}
window.reset = reset;
reset();
