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
    console.log(self)
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
const Quiz = function (t) {
    let q = null;
    let typeMap = {
        1: {id: 1, type: 'single'},
        2: {id: 2, type: 'multi'}
    }
    let self = {
        id: t.replace('r', 'r '),
        autoComplete: false,
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
        buttonScore: $('#' + t).find('.score'),
        buttonSteal: $('#' + t).find('.steal')
    };
    function reset () {
        self.score = 0;
        self.scorePending = 0;
        advancePlayer();
        self.resetProgress();
        self.getQuestionSequence();
        self.askQuestion();
        self.showOverlay(false);
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
//            let adj = self.score > 0 ? 0 : $($('#river').find('table')[0]).position().left;
            let adj = self.score > 0 ? 0 : $('#playzone').position().left;
//            console.log(adj);
//            adj = 30;
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
            ha.animate({'border-top-width': '0px'}, 200);
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
        });
        if (s > 25) {
            resetOverlay();
            $('#'+ t).find('.underlay').delay(0).animate({
                'left' : ($($('.race').find('td')[s]).width() * -1) + 'px'
            }, 300, function () {
                self.showOverlay(false);
            });
        }
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
    }
    function isFinalQuestion () {
//        console.log(self.getWinTotal(), self.score);
        return self.getWinTotal() - self.score === 1;
    }
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
//        let o = localStorage.getItem('_stuff');
        self.qID = id;
        self.currentQuestions = getQuestionSet(id);
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
    };
    self.askQuestion = function () {
//        console.log('auto ' + self.autoComplete, t);
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
            setTimeout(self.submit, 2000);
        }
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
        if (self.autoComplete) {
//            console.log(`self.iWon() ${self.iWon()}`);
//            console.log(`isFinalQuestion() ${isFinalQuestion()}`);
            if (!isFinalQuestion()) {
//                console.log('this is not the final question, run the timeout');
//                setTimeout(self.onScore, 1000);
            }
        }
    }
    self.showOverlay = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        if (boo) {
            olay.show();
            onOverlayComplete();
        } else {
            olay.hide();
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
//        console.log(`submit ${boo}`);
//        console.log(`submit ${isFinalQuestion()}`)
        if (self.autoComplete) {
            boo = true;
        }
        if (self.active) {
            self.activateOptions(false);
            if (boo) {
//                console.log(self.iWon())
                if (self.iWon()) {
                    console.log('i won')
                }
                self.showOverlay(true);
                if (self.rival.score === 0) {
                    $('#' + t).find('.steal').addClass('inactive');
                } else {
                    $('#' + t).find('.steal').removeClass('inactive');
                }
            } else {
                self.wronger();
            }
        }
        if (self.autoComplete) {
            self.wronger();
        }
        if (isFinalQuestion()) {
//            self.showProgress2(true);
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
    self.showProgress2 = function (boo) {
        var w = ($($('.race').find('td')[0]).width() / 2) + $($('.race').find('td')[self.score]).position().left + 40;
        if (!boo) {
            self.progressBar = $($('#' + t).find('.bar')[self.score - (boo ? 0 : (self.progressing ? 0 : 1))]);
        }
        self.progressBar.stop();
        self.progressing = true;
        $('#arrow-' + t).css({
            left: '0px'
        });
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
                        if (!self.iWon()) {
                            //
                        } else {
                            self.rival.defeat();
                            self.victory();
                        }
                    }
                }
            }
        );
    };
    self.wronger = function () {
        const op = $('#' + t).find('.option');
        for (var i = 0; i < op.length; i++) {
            if ($($(op[i]).find('span')[0]).html() === self.q.answer) {
                $(op[i]).addClass('reveal');
                if (!self.autoComplete) {
                    setTimeout(self.askQuestion, 3000);
                }
                break;
            }
        }
    };
    self.victory = function () {
        console.log('Vic Tory');
        $('#' + t).find('.option').removeClass('inactive');
        $('#' + t).find('.option').addClass('inactive');
//        $('#' + t).find('.option').addClass('victory');
//        $('#' + t).find('.td').addClass('victory');
        $('#' + t).find('.question').addClass('dunne')
        $('#' + t).find('.option').addClass('dunne')
        var f, i = 0, r = 0;
        setInterval(function () {
            r += 20;
            f = Math.round(((Math.sin(r * Math.PI / 180) + 1) / 2) * $('#' + t).find('.bar').length);
            $('#' + t).find('.bar').removeClass('victory');
            $($('#' + t).find('.bar')[f]).addClass('victory');
//            $($('#' + t).find('.bar')[i]).addClass('victory');
            i = i < $('#' + t).find('.bar').length ? i + 1 : 0;
        }, 75);
        self.dunne();
    };
    self.defeat = function () {
        $('#' + t).find('.option').addClass('defeat');
        $('#' + t).find('.td').addClass('defeat');
        self.dunne();
    };
    self.dunne = function () {
        $('#' + t).find('.question').addClass('dunne');
        $('#' + t).find('.option').addClass('dunne');
    };
    self.onScore = function () {
        console.log('onScore');
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
    self.getQuestionSequence = getQuestionSequence;

    $('#' + t).find('.option').on('click', function () {
        self.submit($($(this).find('span')[0]).html() === self.q.answer);
//        console.log($($(this).find('span')[0]).html(), self.q.answer);
        if ($($(this).find('span')[0]).html() === self.q.answer) {
            $(this).addClass('reveal')
        }
    });
    self.buttonScore.on('click', function () {
        self.onScore();
    });
    self.buttonSteal.on('click', function () {
        self.rival.updateScorePending(self.rival.scorePending - 1);
        self.rival.showProgress(false);
        self.showOverlay(false);
        setTimeout(self.nextQuestion, self.getDelay() * 1.3);
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
