# Memory Game Project

Udacity Front End NanoDegree - Project 2 Submission

## To play the game
Launch the index.html file present in root folder using Google chrome and follow the instructions below

Game supports user registration and updates to leaderboard.


## Rules of the game

1. Game can be played with or without online registration.

    a. Enter name to continue with registration.
    Once registration is done details will be stored on device using local storage.

    ![Game Welcome Screen](img/help-doc/game-welcome.png?raw=true "Game Welcome Screen")

    ![Game Register User](img/help-doc/game-register-user.png?raw=true "Game Register User")

    b. Or click on "Continue as a guest" to play in guest mode.
    Scores will not be stored in guest mode.

    ![Game In Guest Mode](img/help-doc/game-start-as-guest.png?raw=true "Game In Guest Mode")

2.  Select the game level from beginner, intermediate and advanced. Once selected click on "Play" to start the game.

    Click on cards to match them and refer to rules below to win the game.

    **a. Beginner level** - There are 8 unique sets of card inside deck of 16. Each unique set have two cards.

    **To Win** - Match all 8 unique sets.

    ![Game Beginner Level](img/help-doc/game-level-beginner.png?raw=true "Game Beginner Level")


    **b. Intermediate level** - There are 18 unique sets of card inside deck of 36. Each unique set have two cards.

    **To Win** - Match all 18 unique sets.

    ![Game Intermediate Level](img/help-doc/game-level-intermediate.png?raw=true "Game Intermediate Level")

    **c. Advanced level** - There are 12 unique sets of card inside deck of 36. Each unique set have three cards.

    **To Win** - Match all 12 unique sets.

    ![Game Advanced Level](img/help-doc/game-level-advanced.png?raw=true "Game Advanced Level")

    In case you need to restart, it can be done using restart button present alongside active timer display.

3. On user win, system will display a congratulation message dialog.
    a. In case game is not played in guest mode, system will try to update the leaderboard also.

    ![Calculating Score](img/help-doc/game-score-calculation.png?raw=true "Calculating Score")

    ![Congratulation Message](img/help-doc/game-over.png?raw=true "Congratulation Message")


4. On succesful update, user can see the score inside the leader board.
    Click on LeaderBoard icon near Memory Game heading to display leaderboard.

     ![LeaderBoard Side Panel](img/help-doc/game-leaderboard.png?raw=true "LeaderBoard Side Panel")

## Dependencies

This application have following dependencies on third party and all but one are needed to successfully run this game.

1. Google font family Material Icons
	https://fonts.googleapis.com/icon?family=Material+Icons
2. Font Awesome for Icons
	https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css

* data.js inside js holds the font awesome and google material icons

3. jQuery library for JS
	https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
4. Service running at memory-game.gear.host

* serviceconfig.js inside js folder holds the service endpoint

## Limitations
1. User registration is hosted on free server - memory-game.gear.host and is not highly reliable in terms of response. You will see errors in console regarding the same.
2. User registration is tied to specific device and same user information like name cannot be shared across devices.
3. Service is served over http and will not work over https until unless it is moved to https due to browser security policy.
