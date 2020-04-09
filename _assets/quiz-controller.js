"use strict";

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
        QuizController.updateScoreboard(playerInitials));
      this.view.scoreboardPane.setCallback(
        () => QuizView.welcomePane.show(),
        () => QuizController.refreshScoreboard(),
        () => QuizController.clearScoreboard()
      );
  
      this.view.highscoreLink.show();
      this.view.welcomePane.show();
    },
  
  
    /*
      Start the timer nd 
     */
    beginQuiz() {
      this.model.reset();
      this.startQuizTimer();
      this.getNextQuestion();
    },
  
    startQuizTimer() {
      this.timer = setInterval(
        () => {
          let timeRemaining = this.model.getTimeRemaining();
          this.model.tickTimeRemaining();
  
          if (timeRemaining > 0) {
            this.view.countdownTimer.show(timeRemaining);
          } else {
            this.stopQuizTimer;
            this.endQuiz();
          }
        },
        1000  
      );    
    },
  
    stopQuizTimer() {
      clearInterval(this.timer);
    },
  
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
      Get a new question and create a new question pane for it, providing an
      event listener to check answers. If there are no more questions, end the
      game.
     */
    getNextQuestion() {
      let question = this.model.getNewQuestion();
      if (question) {
        this.view.questionsPane.show(question);
      } else {
        this.endQuiz();
      }
    },
  
    endQuiz() {
      this.stopQuizTimer();
      this.view.endQuizPane.show(this.model.getScore());
    },
  
    updateScoreboard(playerInitials) {
      this.model.addPlayerToScoreboard(playerInitials);
      this.view.scoreboardPane.show();
    },
  
    refreshScoreboard() {
      this.view.scoreboardPane.setScoreboard(this.model.getScoreboard());    
    },
  
    clearScoreboard() {
      this.model.clearScoreboard();
      this.refreshScoreboard();
    }
  };
  

  
  QuizController.start();