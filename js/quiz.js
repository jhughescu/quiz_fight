let questionBankSet = null;
let questionBanks = {};

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
    if ($('#' + id).length > 0) {
        self.el = $($('#' + id)[0]);
        self.el.on('mouseover', function () {
            self.el.addClass('over');
        });
        self.el.on('mouseout', function () {
            self.el.removeClass('over');
        });
    }
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
        title: t,
        type: null,
        currentQuestions: null,
        questionBanks: {},
        q: null,
        qID: null,
        aDelay: {min: 500, max: 5000},
        score: 0,
        scorePending: null,
        rival: null,
        questionDiv: null,
        optionsDiv: null,
        questionDiv: document.getElementById(t).querySelector('.question'),
        optionsDiv: document.getElementById(t).querySelectorAll('.option'),
        progressBar: null,
        progressing: null,
        active: false
    };
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
    function advancePlayer () {
        let s = self.score;
        let x = $($('.race').find('td')[s]).offset().left;
        $('#'+ t).animate({
            left: x + 'px'
        }, 300, function () {
            $('#'+ t).find('.underlay').find('.header').css({
                'background-color': $($('.buttons').find('.topic_button')[s]).css('background-color')
            });

        });
        if (s > 2) {
            resetOverlay();
            $('#'+ t).find('.underlay').delay(300).animate({
                'left' : ($($('.race').find('td')[s]).width() * -1) + 'px'
            }, 600, function () {
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
    self.setQuizType = setQuizType;
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
        var s, a;
        self.q = self.currentQuestions.shift();
        if (!self.q) {
            self.currentQuestions = getQuestionSet(self.qID);
            self.askQuestion();
        } else {
            s = '<span>' + self.q.question + '</span>';
            self.q.options.reverse();
            self.q.options.sort(rSort);
            self.q.options.sort(rSort);
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
    };
    self.showScore = function () {
//        document.getElementById(t).querySelector('.score').innerHTML = self.id + ' score: ' + self.score;
//        self.progressBar = $($('#' + t).find('.bar')[self.score - 1]);
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
    self.showOverlay = function (boo) {
        let olay = $('#' + t).find('.overlay');
        let ulay = $('#' + t).find('.underlay');
        let l = null;
        console.log(`${t} showOverlay ${$('#' + t).position()} ${$('#' + t).offset()}`);
        console.log($('#' + t).position().left);
        console.log($('#' + t).offset().left);
        console.log($($('#' + t)[0]).css('transform'));
        if ((ulay.offset().left + ulay.width() + 20 + olay.width()) < $('body').width()) {
            l = ulay.position().left + ulay.width() + 20;
        } else {
            l = ulay.position().left - olay.width() - 30;
        }
        if (boo) {
            olay.show();
            olay.animate({
                left: l + 'px'
            }, {
                duration: 1600,
                specialEasing: {
                  left: "easeOutBounce"
                }});
        } else {
            olay.animate({
                left: (ulay.position().left + 5) + 'px'
            }, 300, function () {
                resetOverlay();
            });
//            resetOverlay();
        }
    };
    self.submit = function (boo) {
//        console.log(`submit ${boo}`)
        if (self.active) {
            self.activateOptions(false);
            if (boo) {
                self.showOverlay(true);
                if (self.rival.score === 0) {
                    $('#' + t).find('.steal').addClass('inactive');
                } else {
                    $('#' + t).find('.steal').removeClass('inactive');
                }
            } else {
//                self.askQuestion();
                self.wronger();
            }
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
        return $('#' + t).find('.bar').length;
    };
    self.iWon = function () {
        let won = self.score === self.getWinTotal();
//        console.log(won, self.score, self.getWinTotal());
        return won;
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
        var w = $($('.race').find('td')[0]).width() + $($('.race').find('td')[self.score]).position().left;
        if (!boo) {
            self.progressBar = $($('#' + t).find('.bar')[self.score - (boo ? 0 : (self.progressing ? 0 : 1))]);
        }
        self.progressBar.stop();
        self.progressing = true;
        $('#arrow-' + t).animate(
            {
                width: w + 'px'
            }, {
                duration: self.getDelay(),
                specialEasing: {
                    width: 'easeOutQuart'
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
            }
        );
    };
    self.wronger = function () {
        const op = $('#' + t).find('.option');
        for (var i = 0; i < op.length; i++) {
            if ($($(op[i]).find('span')[0]).html() === self.q.answer) {
                $(op[i]).addClass('reveal');
                setTimeout(self.askQuestion, 3000);
                break;
            }
        }
    };
    self.victory = function () {
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
        self.updateScorePending(self.scorePending + 1);
        self.showOverlay(false);
//        self.showProgress(true);
        self.showProgress2(true);
        setTimeout(self.nextQuestion, self.getDelay() * 1.3);
        setTimeout(advancePlayer, self.getDelay() * 1.1);
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
    $('#' + t).find('.score').on('click', function () {
        self.onScore();
    });
    $('#' + t).find('.steal').on('click', function () {
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
    // defaults:
    setQuizType(1);
//    getQuestionSequence();
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
