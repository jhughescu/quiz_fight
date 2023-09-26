const Quiz = function (t) {
    let autoPlay = false;
    this.setAutoplay = function (boo) {
        autoPlay = boo;
        self.console.log(`autoplay to ${autoplay}`);
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
            self.console.log('no delay set with name ' + d + ', returning default (2000)');
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
        self.console.log('RESET');
        let selff = Object.assign({}, self);
        delete selff.rival;
        self.console.log(JSON.stringify({score: selff.score}));
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
            self.console.log('write ' + id + 'Summary')
            localStorage.setItem(id, JSON.stringify(av));
            localStorage.setItem(id + 'Summary', JSON.stringify({timeToAnswer: av.average, correctPercentage: av.aPerc}));
        } else {
            self.console.log('outlier, not writing (average is ' + av.average + ', gap is ' + gap + ')');
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
            self.console.log('i won, so stop here')
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
            if (s >= 0) {
                self.score = s;
                self.scorePending = s;
                self.console.log(`score AND scorePending for ${t} to ${s}`);
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
                if (self.iWon()) {
                    self.console.log('i won')
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
            self.console.log(won, self.score, self.getWinTotal());
        }
        if (log) {
            self.console.log(won, self.score, self.getWinTotal(), typeof(self.score), typeof(self.getWinTotal()));
        }
        if (self.score >= self.getWinTotal()) {
            self.console.log('WIN', won, self.score, self.getWinTotal());
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
            self.console.log(`s is ${s} and there are ${$('.race').find('td').length} tds`);
            self.console.log(`boo ${boo}`);
            self.console.log(`self.score ${self.score}`);
            self.console.log(`self.scorePending ${self.scorePending}`);
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
        self.console.log('endTimers');
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
        self.console.log(`scoreFunk, self.scorePending: ${self.scorePending}, type: ${typeof(self.scorePending)}`);
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
    window.console = {
        log: function (a, b, c) {
            window.theConsole.log(t, a);
        }
    }
    return self;
};
