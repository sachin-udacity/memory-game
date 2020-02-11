/*
 * Project:             Memory Game App - MGA
 * Author:              Sachin
 * Date:                5-May-2018
 * Copyright 2018 - Grow with Google Scholarship Front End Nanodegree<2018>
 * Game Levels - Beginer(2 matches) , Intermediate (36, 2 matches) , Adv (36, 3 matches)
 * data.js holds the font awesome and google material icons
 * serviceconfig.js holds the service endpoint
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


// Class for service callback and related helper functions
const MGA = {
    // successful user registration callback
    onRegisterUser: function (serviceModel) {
        try {
            if (serviceModel.output.Errors.length === 0) {
                MGA.UI.currentUser = {};
                MGA.UI.currentUser.userId = serviceModel.input.userId;
                serviceModel.input.userId = serviceModel.output.Id;
                MGA.saveIntoLocalStorage(serviceModel.input.gameLevel, serviceModel.input);
                MGA.UIHelper.reInitialize(true, true);                
                MGA.UI.closeModalDialog('message-box-user');
            } else {
                if (serviceModel.output.Errors[0] === MGA.Consts.USER_EXISTS) {
                    MGA.UIHelper.configureUserDialog();
                    MGA.UI.showErrorMessage(MGA.Strings.USER_ALREADY_EXISTS);
                }
            }
        }
        catch(ex) {
            MGA.Helper.logError(ex);
        }
    },

    // successful leader board retrieval callback
    onLeaderBoardGet: function(serviceModel) {
        if (serviceModel.output.Errors.length === 0) {
            MGA.UIHelper.bindLeaderboard(serviceModel.output.Entries);
        }
    },

    // successful leader board insert callback
    onLeaderBoardRecordCreated: function(serviceModel) {
        if (serviceModel.output.Errors.length === 0) {
            MGA.UIHelper.configureGameDialog(serviceModel.output.Score);
        }
    },

    // get user information from local storage
    getUserInfoFromLocalStorage: function () {
        let currentUser = null;
        if (localStorage[MGA.Consts.LAST_USER_INFO]) {
            currentUser = JSON.parse(localStorage[MGA.Consts.LAST_USER_INFO]);
        }
        return currentUser;
    },

    // save information into local storage
    saveIntoLocalStorage: function (gameLevel, user) {
        localStorage[MGA.Consts.LAST_GAME_LEVEL] = gameLevel;
        localStorage[MGA.Consts.LAST_USER_INFO] = JSON.stringify(user);
    }
};


// Class holds all user messages
MGA.Strings = {
    INVALID_USER_NAME: 'Invalid UserName',
    USER_ALREADY_EXISTS: 'User already exists.'
}

// Class holds all game constants
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
    DEBUG: 0,

    LAST_USER_INFO: 'Memory-Game-App-Last-User-Info',
    LAST_GAME_LEVEL: 'Memory-Game-App-Game-Level',
    USER_EXISTS: 'UserExists'
};

// Class to deal with user interface function
MGA.UI = {
    timer: null,
    isGuest: false,
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

    // bind page at startup
    bindPage: function () {
        try {
            MGA.UI.currentUser = MGA.getUserInfoFromLocalStorage();
            if (MGA.UI.currentUser) {
                MGA.UI.gameLevel = (localStorage[MGA.Consts.LAST_GAME_LEVEL] ? localStorage[MGA.Consts.LAST_GAME_LEVEL] : 1);
                MGA.UIHelper.bindUserInfoDialog(MGA.UI.gameLevel, MGA.UI.currentUser);
                MGA.UIHelper.enableMessageBoxDialogInputs(false);
            }
            MGA.UIHelper.reInitialize(false, true);
            MGA.UI.showModalDialog('message-box-user');
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // restarts the game after resetting the UI
    restartGame: function (showDialog, startTimer) {
        if (showDialog) {
            MGA.UIHelper.resetUserDialog();
            MGA.UI.showModalDialog('message-box-user');
        }
        MGA.UIHelper.reInitialize(true, startTimer);
    },

    // Update UI in case registration failed.
    onRegisterUserFailed: function (e) {
        try {
            $('#message-box-user-wait-msg').text("Unable to register (Reason: Free service host doesn't support Cross Origin request). Please wait, continuing as guest...");
            setTimeout(function () {
                try {
                    MGA.UI.closeModalDialog('message-box-user');
                    MGA.UIHelper.reInitialize(true, true);
                }
                catch (ex) {
                    MGA.Helper.logError(ex);
                }
            }, 3000);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // show the user and game finish dialog
    showModalDialog: function (dialogId) {
        try {
            let dialog = document.getElementById(dialogId);
            if (dialog) {
                dialog.style.display = 'flex';
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // closes the user and game finish dialog
    closeModalDialog: function (dialogId) {
        try {
            let dialog = document.getElementById(dialogId);
            if (dialog) {
                dialog.style.display = 'none';
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // show error message control with passed error msg.
    showErrorMessage: function (errorMsg) {
        try {
            $('#message-box-error').show();
            $('#message-box-error').text(errorMsg);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // hide error message control.
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

// Holds helper function for UI layer
MGA.UIHelper = {

    // reintialize the UI and retrieve the leader board
    reInitialize: function (resetTimer, startTimer) {
        try {
            // start game
            MGA.Helper.startGame();
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
                if (startTimer) {
                    MGA.UIHelper.startTimer();
                } else {
                    MGA.UIHelper.stopTimer();
                }
            }
            // set game configuration
            MGA.UIHelper.setGameConfiguration();
            // creates deck of card.
            MGA.UIHelper.createDeckOfCard();
            // create html element for cards
            if (MGA.UI.cardsDeck.length > 0) {
                MGA.UIHelper.createCardsHtml();
            }
            // apply set specific class
            MGA.UIHelper.applyDeckSpecificClass();
            // reset dialogs
            MGA.UIHelper.resetDialogs();
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // update card class based on game level.
    applyDeckSpecificClass: function () {
        if (MGA.UI.totalCards === MGA.Consts.LARGER_DECK) {
            $('#deck-cards .card').removeClass('card-size-smaller-deck').addClass('card-size-larger-deck');
        } else {
            $('#deck-cards .card').removeClass('card-size-larger-deck').addClass('card-size-smaller-deck');
        }
    },

    // initialize game config like total cards and number of carsd in unique set based on game level
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

    // resets the game stats
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

    // resets the modal dialogs
    resetDialogs: function () {
        $('#message-box-user-wait-msg').text("Please wait starting the game ...");
        $('#message-box-error').addClass('hidden');
        $('#message-box-game-progress-ring').removeClass('hidden');
        $('#message-box-body-game-score').addClass('hidden');
        $('#message-box-body-game-score').text('-');
        $('.message-box-body-game-score-container').removeClass('message-box-body-game-score-bkground');
        MGA.UI.hideErrorMessage();
    },

    // based on whether game is played as guest or not, function will be called to disable/enable other controls.
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

    // gets info from the dialog
    getUserInfoFromDialog: function() {
        let user = new User();
        user.userId = $('#message-box-input-user-id').val();
        user.userName = $('#message-box-input-user-name').val().trim();
        user.slackName = $('#message-box-input-slack-handle').val().trim();
        user.degreeTrack = $('#message-box-input-degree-track').val();
        return user;
    },

    // set isguest flag
    setIsGuest: function() {
        let isGuestBoxChecked = $("#message-box-is-guest").is(':checked');
        MGA.UI.isGuest = isGuestBoxChecked;
        return isGuestBoxChecked;
    },

    // use to start the game timer
    startTimer: function () {
        // clear and stop timer
        MGA.UIHelper.stopTimer();
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

    // updates the displayed html time element
    updateTimer: function() {
        let timeString = MGA.UIHelper.getTimeElapsedString();
        $('.timer').text(timeString);
    },

    // stops the timer
    stopTimer: function() {
        if (MGA.UI.timer) {
            clearInterval(MGA.UI.timer);
            MGA.UI.timer = null;
        }
    },

    // initialize the user info dialog at startup
    bindUserInfoDialog: function (gameLevel, user) {
        $("#message-box-input-game-level").val(gameLevel);
        $("#message-box-input-user-name").val(user.userName);
        $("#message-box-input-slack-handle").val(user.slackName);
        $("#message-box-input-degree-track").val(user.degreeTrack);
    },

    // intitiaze side bar for leaderboard based on server response.
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

    // creates a leader board html element
    getLeaderBoardEntryHtml: function (entry) {
        return (`<li class="leaderboard-entry-container">
                    <div class="leaderboard-entry">
                        <div class="lb-user">${entry.UserName}</div>
                        <div class="lb-score">${entry.Score}</span>
                    </div>
                 </li>`);
    },

    // resets the dialogs to initial state.
    resetUserDialog: function () {
        $("#btn-message-box-play").removeAttr('disabled');
        $('#message-box-user #message-box-progress-ring').addClass('hidden');
        $('#message-box-user #message-box-content').removeClass('hidden');
    },

    // configure startup dialog after progress complete like user registration or after leaderboard update.
    configureUserDialog: function () {
        MGA.UIHelper.enableMessageBoxDialogInputs(true);
        $("#btn-message-box-play").removeAttr('disabled');
        $('#message-box-user #message-box-progress-ring').addClass('hidden');
        $('#message-box-user #message-box-content').removeClass('hidden');
        $('#message-box-error').removeClass('hidden');
    },

    // configure game finish dialog after progress complete like user registration or after leaderboard update.
    configureGameDialog: function (score) {
        $('#message-box-game-progress-ring').addClass('hidden');
        $('#message-box-body-game-score').removeClass('hidden');
        $('#message-box-body-game-score').text(score);
        $('.message-box-body-game-score-container').addClass('message-box-body-game-score-bkground');
    },

    // forms formatted time string for display.
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
        let timeString = `${mins}m:${secs}s`;
        return timeString;
    },

    // create html deck of cards based on user inputs.
    // deck can be created out of font-awesome or google material icon
    // which are randomly selected inside the function.
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

    // create html elements for card
    createCardsHtml: function () {
        const deck = $('.deck');
        deck.empty(); // remove existing cards.
        for (let card of MGA.UI.cardsDeck) {
            let cardHtml = MGA.UIHelper.getCardHtml(card);
            deck.append(cardHtml);
        }
    },

    // create html card element.
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

    // shows card
    showCard: function (card) {
        card.addClass('open show');
    },

    // hide card.
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

    // verify and update the deck on card click for Beginner and Intermediate level
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

    // verify and update the deck on card click for Advanced Level
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

    // displays congratulation message if game is solved.
    showCongratulationMessageIfSolved: function() {
        if (MGA.UI.totalCardsMatched === MGA.UI.totalCards) {
            // update the controls in message dialog box
            $('.message-box-game-moves').text(MGA.UI.gameStats.moveCount);
            let timeElapsedString = MGA.UIHelper.getTimeElapsedString();
            $('.message-box-game-time-elapsed').text(timeElapsedString);
            MGA.UIHelper.copyRatings(MGA.UI.gameStats.moveCount, true);
            MGA.UIHelper.stopTimer();
            MGA.UI.showModalDialog('message-box-game');
            if (MGA.UI.isGuest === false) {
                MGA.Helper.insertIntoLeaderBoard(MGA.UI.gameLevel, MGA.UI.currentUser, MGA.UI.gameStats, MGA.onLeaderBoardRecordCreated);
            } else {
                MGA.UIHelper.gameFinished();
            }
        }
    },

    // update the move display
    updateMoves: function (moveCount) {
        $('.moves').text(`${moveCount} Moves`);
    },

    // update the ratings display
    updateRatings: function (moveCount, reset) {
        // empties all stars
        if (reset === true) {
            $('.score-panel .stars li>i').removeClass('fa-star-o').addClass('fa-star');
                return;
        }

        // fill the remaining ones based on move count and game level.
        let ratingLevels = GameStats.RATING_CHART[parseInt(MGA.UI.gameLevel) - 1];
        let levelCount = ratingLevels.levels.length;
        for (let level = 0; level < levelCount; ++level) {
            if (moveCount === ratingLevels.levels[level]) {
                $('.score-panel .stars li').eq(levelCount - (level + 1))
                    .find('i')
                    .removeClass('fa-star')
                    .addClass('fa-star-o');
                break;
            }
        }
        // minimum rating is one star.
        if ($('.score-panel .stars li>i.fa-star').length === 0) {
            $('.score-panel .stars li').eq(0)
                        .find('i')
                        .removeClass('fa-star-o')
                        .addClass('fa-star');
        }
    },

    // clone the ratings from main display to dialog box.
    copyRatings: function () {
        $('.message-box-game-rating.stars li').empty();
        $('.message-box-game-rating.stars').append($('.stars li').clone());
    },

    // display game over dialog in case user is playing in guest mode.
    gameFinished: function() {
        // added time out just for demo purpose.
        setTimeout(function() {
            try {
                const score = MGA.Helper.calculateScore();
                MGA.UIHelper.configureGameDialog(score);
            }
            catch (ex) {
                MGA.Helper.logError(ex);
            }
        }, 3000);
    }
};

MGA.Events = {
    // subscribe to page events
    bindEvents: function () {
        try {
            // bind event when card is clicked.
            $('.deck').on('click', 'li', MGA.Events.onCardClicked);
            // bind event when restart is clicked.
            $('.restart i').click(MGA.Events.onRestartClicked);
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

    // handles card click
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

    // handle restart button click
    onRestartClicked: function (e) {
        try {
            MGA.UI.restartGame(true, false);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // handles game play click
    onMessageBoxPlayClicked: function(e) {
        try {
            // check if it is played in guest mode and skips the user registation/validation.
            const isGuest = MGA.UIHelper.setIsGuest();
            MGA.UI.gameLevel = $("#message-box-input-game-level").val();
            MGA.UIHelper.setGameConfiguration();
            if (isGuest === true) {
                MGA.UI.closeModalDialog("message-box-user");
                MGA.UI.restartGame(false, true);
                return;
            }

            // configure startup dialog box
            $("#message-box-content").addClass('hidden');
            $("#message-box-progress-ring").removeClass('hidden');
            $("#btn-message-box-play").attr('disabled', 'disabled');
            let gameLevel = $('#message-box-input-game-level').val();
            let user = MGA.UIHelper.getUserInfoFromDialog();
            if (user.userName === MGA.Consts.EMPTY_STR) {
                MGA.UIHelper.configureUserDialog();
                MGA.UI.showErrorMessage(MGA.Strings.INVALID_USER_NAME);
                return;
            }

            // get existing user info from local storage
            let lastUser = MGA.getUserInfoFromLocalStorage();
            if (lastUser !== null && user.userName === lastUser.userName) {
                user.userId = lastUser.userId;
            }

            // pass the info retrieved from above to service to check if new user needs to be created or
            // existing user is still valid. Validation is done based on unique stored inside local storage.
            MGA.Helper.registerUser(gameLevel, user, MGA.onRegisterUser, MGA.UI.onRegisterUserFailed);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // handles start over button click
    onMessageBoxStartOverClicked: function (e) {
        try {
            MGA.UI.closeModalDialog('message-box-game');
            MGA.UIHelper.setIsGuest();
            MGA.UI.restartGame(true, false);
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // handles message box cancel click
    onMessageBoxCancelClicked: function (e) {
        try {
            MGA.UI.closeModalDialog('message-box-game');
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // handles is guest checkbox change.
    onMessageBoxIsGuestChanged: function (e) {
        try {
            if (!MGA.UI.currentUser) {
                let isChecked = $(e.target).is(':checked');
                MGA.UI.gameStats.isGuest = isChecked;
                MGA.UI.hideErrorMessage();
                MGA.UIHelper.enableMessageBoxDialogInputs(!isChecked);
            }
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // handles show leader board button click
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

    // handles close leader board click
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
    // genearates random number if not present in input set.
    generateRandomNumber: function (max, toExcludeSet) {
        let randomNumber = Math.floor((Math.random() * max) + 1);
        if (toExcludeSet) {
            while (toExcludeSet.has(randomNumber)) {
                randomNumber = Math.floor((Math.random() * max) + 1);
            }
        }
        return randomNumber;
    },

    // starts the game
    startGame: function () {
        let currentDate = new Date();
        let serviceModel = new ServiceModel();
        serviceModel.input = {
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        };
        this.postData(ServiceEndPoints.GameEndPoint, serviceModel);
    },

    // score calculating routine
    calculateScore: function() {
        const timeElapsed = MGA.UI.gameStats.timeElapsed;
        const timeInMins = Math.floor(timeElapsed/60);
        const timeInSecs = timeElapsed - (timeInMins * 60);
        const gameLevel = parseInt(MGA.UI.gameLevel);
        let score = 0;
        const moves = MGA.UI.gameStats.moveCount;
        switch(gameLevel) {
            case MGA.Consts.GAME_LEVEL_BEGINNER:
                score = 1000 - (moves * 9 + timeInMins * 6 + timeInSecs);
                break;
            case MGA.Consts.GAME_LEVEL_INTERMEDIATE:
                score = 3000 - (moves * 12 + timeInMins * 9 + timeInSecs);
                break;
            case MGA.Consts.GAME_LEVEL_ADVANCED:
                score = 5000 - (moves * 18 + timeInMins * 10 + timeInSecs);
                break;
            default:
                // do nothing
                break;
        }

        if (score <= 0)
            score = 99; // Minimum

        return score;
    },

    // call service to retrieve leader board
    getLeaderBoard: function (onLeaderBoardGetCallback) {
        let currentDate = new Date();
        let serviceModel = new ServiceModel();
        serviceModel.input = {
            time: currentDate.toLocaleString(),
            timeInfo: currentDate.toString()
        };
        this.postData(ServiceEndPoints.LeaderBoardGetEndPoint, serviceModel, onLeaderBoardGetCallback);
    },

    // call service to register new user or validate existing one
    registerUser: function (gameLevel, user, onRegisterUserCallback, onRegisterUserFailedCallback) {
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
        this.postData(ServiceEndPoints.UserEndPoint, serviceModel, onRegisterUserCallback, onRegisterUserFailedCallback);
    },

    // call service to enter the new leader board entry
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

    // generic function to handle service interaction
    postData: function (url, serviceModel, onSuccessCallback, onErrorCallback) {
        try {
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
                },
                error: function (e) {
                    if (onErrorCallback) {
                        onErrorCallback(e);
                    }
                    MGA.Helper.logError(e);
                }
            });
        }
        catch (ex) {
            MGA.Helper.logError(ex);
        }
    },

    // logs to console in case of DEBUG = 0 mode
    logError(ex) {
        if (MGA.Consts.DEBUG === 0) {
            return;
        }

        console.log(ex);
    }
};

// class to validate the deck creation
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


// function called on document load
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
