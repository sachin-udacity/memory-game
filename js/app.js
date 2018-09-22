/* 
 * Project:             Memory Game App - MGA
 * Author:              Sachin
 * Date:                5-May-2018
 * Copyright 2018 - Grow with Google Scholarship Front End Nanodegree<2018>
 * TODO: 
 * Uncomment MGA.Helper.startGame()
 * 2:   Update ShortCut Icon
 * 3:   Levels - Beginer(large, 2 matches, timer display) , Intermediate (36) , Adv (small icon, 36, 3 matches)
 * 4:   Disallow select of <i>
 * 5:   Confirmation message box before restart
 * Add copyright at bottom
 * Only one register user can play from machine
 * Set debug to false before submission.
 */

'use strict';

// Class to hold Card
function Card(matchingId, icon) {
    this.matchingId = matchingId; // Matching Id will be identical for same card 
    this.icon = icon;
    this.html = null;
}


// Class to hold user info
function User() {
    this.userName = null;
    this.slackName = null;
    this.degreeTrack = null;
    this.isGuest = null;
    this.userId = null;
}


// Class to hold game stats
function GameStats() {
    this.timeElapsed = 0;
    this.moveCount = 0;
    this.score = 0;
}

// Static game rating chart
GameStats.RATING_CHART = [
    { levels: [12, 15, 18, 21, 24, 27] }, /*game level-1 removes first star after move count > 12 and likewise*/
    { levels: [18, 22, 27, 31, 36, 40] }, /*game level-2 */
    { levels: [27, 34, 41, 48, 54, 60] }  /*game level-3 */
];

// Class to hold input and output data for back-end service.
function ServiceModel() {
    this.input = null;
    this.output = null;
}


const MGA = {
    onRegisterUser: function (serviceModel) {
        try {
            if (serviceModel.output.Errors.length === 0) {
                MGA.UI.currentUser = {};
                MGA.UI.currentUser.userId = serviceModel.input.userId;
                serviceModel.input.userId = serviceModel.output.Id;
                MGA.saveIntoLocalStorage(serviceModel.input.gameLevel, serviceModel.input);
                MGA.UIHelper.reInitialize(true);
                MGA.UI.closeModalDialog('message-box-user');
            } else {
                if (serviceModel.output.Errors[0] === MGA.Consts.USER_EXISTS) {
                    MGA.UIHelper.configureUserDialog();
                }
            }
        } 
        catch(ex) {
            MGA.Helper.logError(ex);
        }
    },

    onLeaderBoardGet: function(serviceModel) {
        if (serviceModel.output.Errors.length === 0) {
            MGA.UIHelper.bindLeaderboard(serviceModel.output.Entries);
        }
    },

    onLeaderBoardRecordCreated: function(serviceModel) {
        if (serviceModel.output.Errors.length === 0) {
            MGA.UIHelper.configureGameDialog(serviceModel);
        }
    },

    getUserInfoFromLocalStorage: function () {
        let currentUser = null;
        if (localStorage[MGA.Consts.LAST_USER_INFO]) {
            currentUser = JSON.parse(localStorage[MGA.Consts.LAST_USER_INFO]);
        }
        return currentUser;
    },

    saveIntoLocalStorage: function (gameLevel, user) {
        localStorage[MGA.Consts.LAST_GAME_LEVEL] = gameLevel;
        localStorage[MGA.Consts.LAST_USER_INFO] = JSON.stringify(user);
    }
};

MGA.Strings = {
    INVALID_USER_NAME: 'Invalid UserName',
    USER_ALREADY_EXISTS: 'User already exists.'
}

MGA.Consts = {
    DECKS_SET: 2,
    DECK_CARDS_FONT_AWESOME: 1,
    DECK_CARDS_GOOGLE_FONTS: 2,
    TWO_CARDS_SET: 2,
    THREE_CARDS_SET: 3,
    LARGER_DECK: 36,
    EMPTY_STR: '',
    SECS_IN_MINUTES: 60,
    GAME_LEVEL_BEGINNER: 1,
    GAME_LEVEL_INTERMEDIATE: 2,
    GAME_LEVEL_ADVANCED: 3,
    DEBUG: 1,

    LAST_USER_INFO: 'Memory-Game-App-Last-User-Info',
    LAST_GAME_LEVEL: 'Memory-Game-App-Game-Level',
    USER_EXISTS: 'UserExists'
};

MGA.UI = {
    timer: null,
    totalCards: 16,
    cardsInSet: 2,
    totalCardsMatched: 0,
    activeDeck: -1,
    cardsDeck: [],
    lastCardClicked: null,
    lastToLastCardClicked: null,
    hidingInProgress: false,
    gameLevel: 1,
    currentUser: null,
    gameStats: null,
    isLeaderBoardOpen: false,

    bindPage: function () {
        try {
            MGA.UI.currentUser = MGA.getUserInfoFromLocalStorage();
            if (MGA.UI.currentUser) {
                MGA.UI.gameLevel = (localStorage[MGA.Consts.LAST_GAME_LEVEL] ? localStorage[MGA.Consts.LAST_GAME_LEVEL] : 1);
                MGA.UIHelper.bindUserInfoDialog(MGA.UI.gameLevel, MGA.UI.currentUser);
                MGA.UIHelper.enableMessageBoxDialogInputs(false);
            }
            MGA.UIHelper.reInitialize(false);            
            MGA.UI.showModalDialog('message-box-user');
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    restartGame: function (showDialog) {
        if (showDialog) {
            MGA.UIHelper.resetUserDialog();
            MGA.UI.showModalDialog('message-box-user');
        }
        MGA.UIHelper.reInitialize(true);
    },

    showModalDialog: function (dialogId) {
        try {
            let dialog = document.getElementById(dialogId);
            dialogPolyfill.registerDialog(dialog);
            if (dialog) {
                dialog.showModal();
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    closeModalDialog: function (dialogId) {
        try {
            let dialog = document.getElementById(dialogId);
            if (dialog) {
                dialog.close();
                // try setting the visibility, if close() is unable to hide the dialog
                let visibleDialog = $(`#${dialogId}:visible`);
                if (visibleDialog.length > 0) {
                    visibleDialog.hide();
                }
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    showErrorMessage: function (errorMsg) {
        try {
            $('#message-box-error').show();
            $('#message-box-error').text(errorMsg);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    hideErrorMessage: function () {
        try {
            $('#message-box-error').hide();
            $('#message-box-error').text(MGA.Strings.USER_ALREADY_EXISTS);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    }
};


MGA.UIHelper = {
    reInitialize: function (resetTimer) {
        try {
            // start game
            //MGA.Helper.startGame();
            // get leader board
            MGA.Helper.getLeaderBoard(MGA.onLeaderBoardGet);
            // reset data
            MGA.UIHelper.resetData();
            // reset moves
            MGA.UIHelper.updateMoves(MGA.UI.gameStats.moveCount);
            // reset ratings
            MGA.UIHelper.updateRatings(-1, true);
            // restart timer
            if (resetTimer) {
                MGA.UIHelper.updateTimer(); // reset
                MGA.UIHelper.startTimer();
            }
            // set game configuration
            MGA.UIHelper.setGameConfiguration();
            // creates deck of card.
            MGA.UIHelper.createDeckOfCard();
            // create html element for cards
            if (MGA.UI.cardsDeck.length > 0) {
                MGA.UIHelper.createCardsHtml();
            }
            // set deck size
            MGA.UIHelper.setDeckSize();
            // apply set specific class
            MGA.UIHelper.applyDeckSpecificClass();
            // reset dialogs
            MGA.UIHelper.resetDialogs();
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },
    
    setDeckSize: function(e) {
        try {
            const margins = 150;
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;
            let dim = (width > height ? height : width) - margins;            
            if (height < width) {
                dim = dim - $('header').height();
            } else {
                $('header').css('margin-bottom', '75px');                
            }
            $('ul#deck-cards').width(dim);
            $('ul#deck-cards').height(dim);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    applyDeckSpecificClass: function () {
        if (MGA.UI.totalCards === MGA.Consts.LARGER_DECK) {
            $('#deck-cards .card').removeClass('card-size-24x24').addClass('card-size-16x16');
        } else {
            $('#deck-cards .card').removeClass('card-size-16x16').addClass('card-size-24x24');
        }
    },

    setGameConfiguration: function () {
        let gameLevel = parseInt(MGA.UI.gameLevel);
        switch (gameLevel) {
            case MGA.Consts.GAME_LEVEL_BEGINNER:
                MGA.UI.totalCards = 16;//36;
                MGA.UI.cardsInSet = 2;
                break;
            case MGA.Consts.GAME_LEVEL_INTERMEDIATE:
                MGA.UI.totalCards = 36;
                MGA.UI.cardsInSet = 2;
                break;
            case MGA.Consts.GAME_LEVEL_ADVANCED:
                MGA.UI.totalCards = 36;
                MGA.UI.cardsInSet = 3;
                break;
            default:
                // do nothing
                break;
        }
    },

    resetData: function() {
        if (MGA.UI.gameStats) {
            delete MGA.UI.gameStats;
        }
        MGA.UI.gameStats = new GameStats();
        MGA.UI.totalCardsMatched = 0;
        MGA.UI.lastCardClicked = null;
        MGA.UI.lastToLastCardClicked = null;
        MGA.UI.hidingInProgress = false;
    },

    resetDialogs: function () {
        $('#message-box-game-progress-ring').removeClass('hidden');
        $('#message-box-body-game-score').addClass('hidden');
        $('#message-box-body-game-score').text('-');
        $('.message-box-body-game-score-container').removeClass('message-box-body-game-score-bkground');
    },

    enableMessageBoxDialogInputs: function(enable) {
        if (enable) {
            $('#message-box-input-user-name').removeAttr('disabled');
            $('#message-box-input-slack-handle').removeAttr('disabled');
            $('#message-box-input-degree-track').removeAttr('disabled');
        } else {
            $('#message-box-input-user-name').attr('disabled', 'disabled');
            $('#message-box-input-slack-handle').attr('disabled', 'disabled');
            $('#message-box-input-degree-track').attr('disabled', 'disabled');
        }
    },

    getUserInfoFromDialog: function() {
        let user = new User();
        user.userId = $('#message-box-input-user-id').val();
        user.userName = $('#message-box-input-user-name').val().trim();
        user.slackName = $('#message-box-input-slack-handle').val().trim();
        user.degreeTrack = $('#message-box-input-degree-track').val();
        return user;
    },

    startTimer: function () {
        // clear timer
        if (MGA.UI.timer) {
            clearInterval(MGA.UI.timer);
        }
        // start timer
        MGA.UI.timer = setInterval(function () {
            try {
                MGA.UI.gameStats.timeElapsed++;
                MGA.UIHelper.updateTimer();
            }
            catch (ex) {
                MGA.Helper.logError(ex);
            }
        }, 1000);
    },

    updateTimer: function() {
        let timeString = MGA.UIHelper.getTimeElapsedString();
        $('.timer').text(timeString);
    },

    bindUserInfoDialog: function (gameLevel, user) {
        $("#message-box-input-game-level").val(gameLevel);
        $("#message-box-input-user-name").val(user.userName);
        $("#message-box-input-slack-handle").val(user.slackName);
        $("#message-box-input-degree-track").val(user.degreeTrack);
    },

    bindLeaderboard: function(leaderboardEntries) {
        if (leaderboardEntries.length === 0) return;

        const leaderBoardListBeginner = $('.leaderboard-level-beginner');
        leaderBoardListBeginner.empty();
        const leaderBoardListIntermediate = $('.leaderboard-level-intermediate');
        leaderBoardListIntermediate.empty();
        const leaderBoardListAdvanced = $('.leaderboard-level-advanced');
        leaderBoardListAdvanced.empty();
        leaderboardEntries.forEach(function (entry) {
            let leaderBoardEntryHtml = MGA.UIHelper.getLeaderBoardEntryHtml(entry);
            switch (entry.GameLevel) {
                case MGA.Consts.GAME_LEVEL_BEGINNER:
                    leaderBoardListBeginner.append(leaderBoardEntryHtml);
                    break;
                case MGA.Consts.GAME_LEVEL_INTERMEDIATE:
                    leaderBoardListIntermediate.append(leaderBoardEntryHtml);
                    break;
                case MGA.Consts.GAME_LEVEL_ADVANCED:
                    leaderBoardListAdvanced.append(leaderBoardEntryHtml);
                    break;
                default:
                    // do nothing
                    break;
            }
        });
    },

    getLeaderBoardEntryHtml: function (entry) {
        return (`<div class="leaderboard-entry"><div class="lb-user">${entry.UserName}</div><div class="lb-track">${entry.DegreeTrack}</div><div class="lb-score">${entry.Score}</span></div>`);
    },

    resetUserDialog: function () {
        $("#btn-message-box-play").removeAttr('disabled');
        $('#message-box-user #message-box-progress-ring').addClass('hidden');
        $('#message-box-user #message-box-content').removeClass('hidden');
    },

    configureUserDialog: function () {
        MGA.UIHelper.enableMessageBoxDialogInputs(true);
        $("#btn-message-box-play").removeAttr('disabled');        
        $('#message-box-user #message-box-progress-ring').addClass('hidden');
        $('#message-box-user #message-box-content').removeClass('hidden');
        $('#message-box-error').removeClass('hidden');
    },

    configureGameDialog: function (serviceModel) {
        $('#message-box-game-progress-ring').addClass('hidden');
        $('#message-box-body-game-score').removeClass('hidden');
        $('#message-box-body-game-score').text(serviceModel.output.Score);
        $('.message-box-body-game-score-container').addClass('message-box-body-game-score-bkground');
    },

    getTimeElapsedString: function () {
        let timeElapsed = MGA.UI.gameStats.timeElapsed;
        let secs = timeElapsed;
        let mins = 0;
        if (timeElapsed >= MGA.Consts.SECS_IN_MINUTES) {
            mins = Math.floor(timeElapsed / MGA.Consts.SECS_IN_MINUTES);
            secs = timeElapsed - (MGA.Consts.SECS_IN_MINUTES * mins);
        }
        secs = secs.toString().padStart(2, 0);
        mins = mins.toString().padStart(2, 0);
        let timeString = `${mins}:${secs}`;
        return timeString;
    },

    createDeckOfCard: function () {
        // empty the existing cards
        MGA.UI.cardsDeck = [];
        // randomly pick list - font awesome or google font icon
        MGA.UI.activeDeck = MGA.Helper.generateRandomNumber(MGA.Consts.DECKS_SET);
        let icons = null;
        if (MGA.UI.activeDeck === MGA.Consts.DECK_CARDS_FONT_AWESOME) {
            icons = MGFonts.getFontAwesomeIcons();
        } else {
            icons = MGFonts.getGoogleFontIcons();
        }
        // now use the pick icons list to create deck by randomly selecting the cards.
        if (icons) {
            const totalCards = MGA.UI.totalCards;
            const cardsInSet = MGA.UI.cardsInSet;
            const totalUniqueCards = totalCards / cardsInSet;
            console.assert(icons.length > totalUniqueCards, 'Icons cannot be less than total unique cards required.');
            let randomLocationSet = new Set();
            let randomIconIndexSet = new Set();
            let totalUniqueCardsCreated = 0;
            let cardMatchingId = 1;
            while (totalUniqueCardsCreated < totalUniqueCards) {
                // add random icon from icons list at random array location.
                const randomIconIndex = MGA.Helper.generateRandomNumber((icons.length - 1), randomIconIndexSet);
                randomIconIndexSet.add(randomIconIndex);
                // create all cards inside set
                for (let i = 0; i < cardsInSet; ++i) {
                    let randomLocationForCard = MGA.Helper.generateRandomNumber(totalCards, randomLocationSet);
                    randomLocationSet.add(randomLocationForCard);
                    MGA.UI.cardsDeck[randomLocationForCard - 1] = new Card(cardMatchingId, icons[randomIconIndex]);
                }
                cardMatchingId++;
                totalUniqueCardsCreated++;
            }

            MGA.UnitTests.checkDecksCard();
        }
    },

    createCardsHtml: function () {
        const deck = $('.deck');
        deck.empty(); // remove existing cards.       
        for (let card of MGA.UI.cardsDeck) {
            let cardHtml = MGA.UIHelper.getCardHtml(card);
            deck.append(cardHtml);
        }
    },

    getCardHtml: function (card) {
        let cardHtml = null;
        if (MGA.UI.activeDeck === MGA.Consts.DECK_CARDS_FONT_AWESOME) {
            cardHtml = `<li class="card card-${card.matchingId}">
                            <i class ="${card.icon}"></i>
                        </li>`;
        } else {
            cardHtml = `<li class="card card-${card.matchingId}">
                            <i class ="material-icons">${card.icon}</i>
                        </li>`;
        }
        return cardHtml;
    },
     
    showCard: function (card) {
        card.addClass('open show');
    },

    hideCards: function (cards, delayTime) {
        delayTime = (delayTime ? delayTime : 0);
        //card.delay(delayTimeInSecs * 1000).removeClass("show");
        setTimeout(function () {
            for (let card of cards) {
                card.removeClass('open show');
            }
            MGA.UI.hidingInProgress = false;
            MGA.UI.lastCardClicked = null;
        }, delayTime);
    },

    verifyUpdateOnCardClickedInTwoCardsSetMatches: function (card) {
        if (MGA.UI.lastCardClicked !== null && MGA.UI.lastCardClicked !== card) {
            let cardMatchingClass = card.attr('class').toString();
            let lastCardMatchingClass = MGA.UI.lastCardClicked.attr('class').toString();
            if (cardMatchingClass === lastCardMatchingClass) {
                card.addClass('match');
                MGA.UI.lastCardClicked.addClass('match');
                MGA.UI.totalCardsMatched += MGA.Consts.TWO_CARDS_SET;
            } else {
                MGA.UI.hidingInProgress = true;
                MGA.UIHelper.hideCards([card, MGA.UI.lastCardClicked], 600);
            }
            // reset last cards
            MGA.UI.lastCardClicked = null;
            // update move count
            MGA.UIHelper.updateMoves(++MGA.UI.gameStats.moveCount);
            // update ratings
            MGA.UIHelper.updateRatings(MGA.UI.gameStats.moveCount);
        } else {
            MGA.UI.lastCardClicked = card;
        }
    },

    verifyUpdateCardClickedInThreeCardsSetMatches: function (card) {
        if (MGA.UI.lastCardClicked !== null && MGA.UI.lastToLastCardClicked !== null &&
            MGA.UI.lastCardClicked !== card && MGA.UI.lastToLastCardClicked !== card) {
            let cardMatchingClass = card.attr('class').toString();
            let lastCardMatchingClass = MGA.UI.lastCardClicked.attr('class').toString();
            let lastToLastCardMatchingClass = MGA.UI.lastToLastCardClicked.attr('class').toString();
            if (cardMatchingClass === lastCardMatchingClass &&
                lastCardMatchingClass === lastToLastCardMatchingClass) {
                card.addClass('match');
                MGA.UI.lastCardClicked.addClass('match');
                MGA.UI.lastToLastCardClicked.addClass('match');
                MGA.UI.totalCardsMatched += MGA.Consts.THREE_CARDS_SET;
            } else {
                MGA.UI.hidingInProgress = true;
                MGA.UIHelper.hideCards([card, MGA.UI.lastCardClicked, MGA.UI.lastToLastCardClicked], 600);
            }
            // reset last cards
            MGA.UI.lastToLastCardClicked = null;
            MGA.UI.lastCardClicked = null;
            // update move count
            MGA.UIHelper.updateMoves(++MGA.UI.gameStats.moveCount);
            // update ratings
            MGA.UIHelper.updateRatings(MGA.UI.gameStats.moveCount);
        } else {
            MGA.UI.lastToLastCardClicked = MGA.UI.lastCardClicked;
            MGA.UI.lastCardClicked = card;
        }
    }, 

    showCongratulationMessageIfSolved: function() {
        if (MGA.UI.totalCardsMatched === MGA.UI.totalCards) {
            // update the controls in message dialog box
            $('.message-box-game-moves').text(MGA.UI.gameStats.moveCount);
            let timeElapsedString = MGA.UIHelper.getTimeElapsedString();
            $('.message-box-game-time-elapsed').text(timeElapsedString);
            $('.message-box-game-rating').text(MGA.UI.gameStats.moveCount);
            clearInterval(MGA.UI.timer);
            MGA.UI.timer = null;
            MGA.UI.showModalDialog('message-box-game');
            MGA.Helper.insertIntoLeaderBoard(MGA.UI.gameLevel, MGA.UI.currentUser, MGA.UI.gameStats, MGA.onLeaderBoardRecordCreated);
        }
    },

    updateMoves: function (moveCount) {
        $('.moves').text(`${moveCount} Moves`);
    },

    updateRatings: function (moveCount, reset) {
        if (reset === true) {
            $('.stars li>i').removeClass('fa-star-o').addClass('fa-star');
            return;
        }

        let ratingLevels = GameStats.RATING_CHART[MGA.UI.gameLevel];
        let levelCount = ratingLevels.levels.length;
        for (let level = 0; level < levelCount; ++level) {
            if (moveCount === ratingLevels.levels[level]) {
                $('.stars li').eq(levelCount - (level + 1))
                    .find('i')
                    .removeClass('fa-star')
                    .addClass('fa-star-o');
                break;                
            }
        }
    }
};

MGA.Events = {
    bindEvents: function () {
        try {
            // resize event
            window.addEventListener("resize", MGA.Events.onWindowResize, false);
            // bind event when card is clicked.
            $('.deck').on('click', 'li', MGA.Events.onCardClicked);
            // bind event when restart is clicked.
            $('.restart').click(MGA.Events.onRestartClicked);
            $("#btn-message-box-play").click(MGA.Events.onMessageBoxPlayClicked);
            // bind event to message box start over button
            $('#btn-message-box-start-over').click(MGA.Events.onMessageBoxStartOverClicked);
            //bind event to message box cancel button
            $('#btn-message-box-cancel').click(MGA.Events.onMessageBoxCancelClicked);
            //bind event to message box check event
            $("#message-box-is-guest").change(MGA.Events.onMessageBoxIsGuestChanged);
            //bind event to leader board
            $("#btn-show-leaderboard").click(MGA.Events.onShowLeaderBoardClicked);
            $("#btn-leaderboard-section-close").click(MGA.Events.onCloseLeaderBoardClicked);
            $(document).click(MGA.Events.onCloseLeaderBoardClicked);            
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onWindowResize: function(e) {
        try {
            if (!MGA.Events.resizeSetTimeout) {
                // From MDN
                MGA.Events.resizeSetTimeout = setTimeout(function() {
                    MGA.Events.resizeSetTimeout = null;
                    MGA.UIHelper.setDeckSize();
                   // The actualResizeHandler will execute at a rate of 15fps
                   }, 66);
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },
    
    onCardClicked: function(e) {
        try {
            // continue only if hiding card is finished
            if (MGA.UI.hidingInProgress) {
                return;
            }

            // check if clicked card is already matched or opened.
            let card = $(e.currentTarget);
            if (card.hasClass('match') || card.hasClass('open')) {
                return;
            }

            // show card
            MGA.UIHelper.showCard(card);

            // check if card macthes on second click
            if (MGA.UI.cardsInSet === MGA.Consts.TWO_CARDS_SET) {
                MGA.UIHelper.verifyUpdateOnCardClickedInTwoCardsSetMatches(card);
            } else {
                MGA.UIHelper.verifyUpdateCardClickedInThreeCardsSetMatches(card);
            }

            // check if game is solved
            MGA.UIHelper.showCongratulationMessageIfSolved();
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onRestartClicked: function (e) {
        try {
            MGA.UI.restartGame(true);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onMessageBoxPlayClicked: function(e) {
        try {
            let isGuestBoxChecked = $("#message-box-is-guest").is(':checked');
            MGA.UI.gameLevel = $("#message-box-input-game-level").val();
            MGA.UIHelper.setGameConfiguration();
            if (isGuestBoxChecked === true) {
                //MGA.UIHelper.startTimer(); // start timer
                MGA.UI.closeModalDialog("message-box-user");
                MGA.UI.restartGame(false);
                return;
            }

            $("#message-box-content").addClass('hidden');
            $("#message-box-progress-ring").removeClass('hidden');
            $("#btn-message-box-play").attr('disabled', 'disabled');
            let gameLevel = $('#message-box-input-game-level').val();
            let user = MGA.UIHelper.getUserInfoFromDialog();
            if (user.userName === MGA.Consts.EMPTY_STR) {
                MGA.UI.showErrorMessage(MGA.Strings.INVALID_USER_NAME);
                MGA.UIHelper.configureUserDialog();
                return;
            }

            let lastUser = MGA.getUserInfoFromLocalStorage();
            if (lastUser !== null && user.userName === lastUser.userName) {
                user.userId = lastUser.userId;
            }
            MGA.Helper.registerUser(gameLevel, user, MGA.onRegisterUser);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onMessageBoxStartOverClicked: function (e) {
        try {
            MGA.UI.closeModalDialog('message-box-game');
            MGA.UI.restartGame(true);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onMessageBoxCancelClicked: function (e) {
        try {
            MGA.UI.closeModalDialog('message-box-game');
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onMessageBoxIsGuestChanged: function (e) {
        try {
            if (!MGA.UI.currentUser) {
                let isChecked = $(e.target).is(':checked');
                MGA.UI.hideErrorMessage();
                MGA.UIHelper.enableMessageBoxDialogInputs(!isChecked);
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    onShowLeaderBoardClicked: function (e) {
        try {
            $('.leaderboard-section').animate({
                right: 0 
            }, 1000);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }  
    },

    onCloseLeaderBoardClicked: function (e) {
        try {
            // close when clicked outside the leader board flyout
            // don't close if clicked inside leader board flyout and not close button
            const id = $(e.target).prop('id');
            if (id !== 'btn-leaderboard-section-close' &&
                ($(e.target).hasClass('leaderboard-section') === true ||
                $(e.target).parents('.leaderboard-section').length > 0 ||
                $(e.target).parents('.btn-show-leaderboard').length > 0 ||
                id === 'btn-show-leaderboard')
                && $(e.target).parents('.btn-leaderboard-section-close').length === 0) {     
                // don't close and return           
                return;
            }

            $('.leaderboard-section').animate({
                right: "-550px" 
            }, 300);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    }
};

MGA.Helper = {
    generateRandomNumber: function (max, toExcludeSet) {
        let randomNumber = Math.floor((Math.random() * max) + 1);
        if (toExcludeSet) {
            while (toExcludeSet.has(randomNumber)) {
                randomNumber = Math.floor((Math.random() * max) + 1);
            }
        }
        return randomNumber;
    },

    startGame: function () {
        let currentDate = new Date();
        this.postData(ServiceEndPoints.GameEndPoint, {
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        });
    },

    getLeaderBoard: function (onLeaderBoardGetCallback) {
        let currentDate = new Date();
        let serviceModel = new ServiceModel();
        serviceModel.input = {
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        };
        this.postData(ServiceEndPoints.LeaderBoardGetEndPoint, serviceModel, onLeaderBoardGetCallback);
    },

    registerUser: function (gameLevel, user, onRegisterUserCallback) {
        let currentDate = new Date();
        let serviceModel = new ServiceModel();
        serviceModel.input = {
            gameLevel: gameLevel,
            userId: user.userId,
            userName: user.userName,
            slackName: user.slackName,
            degreeTrack: user.degreeTrack,
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        };
        this.postData(ServiceEndPoints.UserEndPoint, serviceModel, onRegisterUserCallback);
    },

    insertIntoLeaderBoard: function (gameLevel, user, gameStats, onLeaderBoardRecordCreatedCallback) {
        let currentDate = new Date();
        let serviceModel = new ServiceModel();
        serviceModel.input = {
            userId: user.userId,
            gameLevel: gameLevel,
            moves: gameStats.moveCount,
            timeCompleted: gameStats.timeElapsed,
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        };
        this.postData(ServiceEndPoints.LeaderBoardInsertEndPoint, serviceModel, onLeaderBoardRecordCreatedCallback);
    },

    postData: function (url, serviceModel, onSuccessCallback) {
        $.ajax({
            type: 'get',
            url: url,
            data: serviceModel.input,
            dataType: 'jsonp',
            success: function (dataRetrieved) {
                serviceModel.output = dataRetrieved; // set output with data returned
                if ((dataRetrieved.Errors.length === 0) ||
                    (dataRetrieved.Errors.length === 1 && dataRetrieved.Errors[0] === MGA.Consts.USER_EXISTS)) {
                    if (onSuccessCallback) {
                        onSuccessCallback(serviceModel);
                    }
                } 
                MGA.Helper.logError(dataRetrieved.Errors);
            },
            error: function (e) {
                MGA.Helper.logError(e);
            }
        });
    },

    logError(ex) {
        if (MGA.Consts.DEBUG === 0) {
            return;
        }

        console.log(ex);
    }
};


MGA.UnitTests = {
    checkDecksCard: function () {
        let cardsMap = {};
        for (let card of MGA.UI.cardsDeck) {
            if (!cardsMap[card.icon]) {
                cardsMap[card.icon] = 1;
            } else {
                cardsMap[card.icon] += 1;
            }
        }

        for (let cardCount of Object.values(cardsMap)) {
            if (cardCount !== MGA.UI.cardsInSet) {
                console.assert(cardCount === MGA.UI.cardsInSet, 'Card count doesn\'t match');
            }
        }
    }
};


$(document).ready(function () {
    try {
        // bind page
        MGA.UI.bindPage();
        // bind events
        MGA.Events.bindEvents();
    }
    catch (ex) {
        MGA.Helper.logError(ex);
    }
});
