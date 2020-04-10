/*
  Implements part of an MVC pattern. See README.md in the root of
  this repo.
 */

"use strict";


/*
  This object initialized the game and reponds to events wired into
  the view.
 */
let QuizController = {

  model: null,
  view: null,
  timer: null,


  /*
    Quiz entry point. Initialize state, wire in the callbacks, and show the
    welcome pane.
   */
  start() {
    this.model = QuizModel;
    this.view = QuizView;

    this.model.loadScoreboard();

    this.view.highscoreLink.setCallback(() => {
      QuizController.stopQuizTimer();
      QuizView.scoreboardPane.show()
    });
    this.view.welcomePane.setCallback(() => QuizController.beginQuiz());
    this.view.questionsPane.setCallback(answer =>
      QuizController.evaluateAnswer(answer));
    this.view.endQuizPane.setCallback(playerInitials =>
      QuizController.submitInitials(playerInitials));
    this.view.scoreboardPane.setCallback(
      () => QuizView.welcomePane.show(),
      () => QuizController.refreshScoreboard(),
      () => QuizController.clearScoreboard()
    );

    this.view.highscoreLink.show();
    this.view.welcomePane.show();
  },


  /*
    Set up a new game and show the first question.
   */
  beginQuiz() {
    this.model.reset();
    this.startQuizTimer();
    this.getNextQuestion();
  },


  /*
    Stop the clock and show the results.
   */
  endQuiz() {
    this.stopQuizTimer();
    this.view.endQuizPane.show(this.model.getScore());
  },


  /*
    Request a new question and show it. If there are no more
    questions, end the game.
   */
  getNextQuestion() {
    let question = this.model.getNewQuestion();
    if (question) {
      this.view.questionsPane.show(question);
    } else {
      this.endQuiz();
    }
  },


  /*
    Evaluate a player's answer, provide feedback, and move on to
    the next question.
   */
  evaluateAnswer(answer) {
    if (this.model.isAnswerCorrect(answer)) {
      this.model.increaseScore();
      this.view.statusBar.show("Correct!");
    } else {
      this.model.substractTimePenalty();
      this.view.statusBar.show("Wrong!");
    }
    this.getNextQuestion();
  },


  /*
    Start the timer and update the countdown. When the time ends,
    stop the game.
   */
  startQuizTimer() {
    this.timer = setInterval(
      () => {
        let timeRemaining = this.model.getTimeRemaining();
        this.model.tickTimeRemaining();

        if (timeRemaining >= 0) {
          this.view.countdownTimer.show(timeRemaining);
        } else {
          this.stopQuizTimer();
          this.endQuiz();
        }
      },
      1000  
    );    
  },


  /*
    Stop the timer.
   */
  stopQuizTimer() {
    clearInterval(this.timer);
  },


  /*
    Add a player's initials to the scoreboard and move to the
    scoreboard pane so they can see where they rank.
   */
  submitInitials(playerInitials) {
    this.model.addPlayerToScoreboard(playerInitials);
    this.view.scoreboardPane.show();
  },


  /*
    Provide the latest results to the scoreboard pane.
   */
  refreshScoreboard() {
    this.view.scoreboardPane.setScoreboard(this.model.getScoreboard());    
  },


  /*
    Clear all results from the scoreboard.
   */
  clearScoreboard() {
    this.model.clearScoreboard();
    this.refreshScoreboard();
  }
};


QuizController.start();
