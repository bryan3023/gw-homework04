/*
  Implements the game along a simplistic model-view-controller
  pattern. The program is organized along the following
  guidelines:
   - Neither the model nor the controller can access the DOM.
   - Neither the model nor the view can directly interact with the controller.
   - The view cannot directly interact with the model or vice versa.
   - The controller should only interact with the model and view via
     provided methods.
 */

"use strict";


let QuizModel = {

  questions: [
    {
      id: 0,
      text: "Are null values and undefined values the same?",
      answers: [
        { text: "Yes" },
        { text: "No", correct: true }
      ]
    },
    {
      id: 1,
      text: "test",
      answers: [
        { text: "a" },
        { text: "b", correct: true }
      ]
    }
  ],


  /*
    Objects in the format:
      { initials: "BCF", score: 10}
   */ 
  scoreboard: [],

  gameParameters: {
    countdownStartSeconds: 90,
    incorrectPenaltySeconds: 15,
    pointsPerCorrectAnswer: 5
  },

  currentGame: {
    timeRemaingSeconds: 90,
    countCorrectAnswers: 0,
    askedQuestions: []
  },


  /*
    If available, return a new question and append its ID to the list of those
    that have been asked. If there are no more questions, return null.
   */
  getNewQuestion() {
      let
        available = this.getAvailableQuestions();
      
      if (0 !== available.length) {
        let selected = available[available.length - 1];
        this.currentGame.askedQuestions.push(selected.id);
        return selected;
      } else {
        return null;
      }
    },


  /*
    From the list of available questions, return those that haven't
    been asked yet.
   */
  getAvailableQuestions() {
      return this.questions.filter(
        q => -1 === this.currentGame.askedQuestions.indexOf(q.id));
    },


  /*
    Return true if the answer provided matches the correct answer
    for the current question.
   */
  isAnswerCorrect(answer) {
      let
        currentQuestion = this.questions.filter(q => q.id === this.getCurrentQuestionId())[0],
        correctAnswer = currentQuestion.answers.filter(a => a.correct)[0];

      return correctAnswer.text === answer;
    },


  /*
    Return the current (i.e., last) question from the list of
    those that have been asked.
   */
  getCurrentQuestionId() {
      let asked = this.currentGame.askedQuestions;
      return asked[asked.length - 1];
    },

  /*
    Return the final score of the game.
   */
  getScore() {
    return this.currentGame.countCorrectAnswers
      * this.gameParameters.pointsPerCorrectAnswer;
  },


  /*
   */
  increaseScore() {
    this.currentGame.countCorrectAnswers++;
  },


  addPlayerToScoreboard(playerInitials) {
    this.scoreboard.push({
      initials: playerInitials,
      score: this.getScore()
    });
    this.saveScoreboard();
  },

  getScoreboard() {
    return this.scoreboard;
  },

  sortScoreboardScoreDescending(player1, player2) {
    if (player1.score > player2.score) {
      return -1;
    }
    if (player1.score < player2.score) {
      return 1;
    }
    return 0;
  },

  loadScoreboard() {
    if (!this.scoreboard) {
      this.scoreboard = [];
    }
    let localScoreboard = localStorage.getItem("Scoreboard");

    if (localScoreboard) {
      this.scoreboard = JSON.parse(localScoreboard);
    }
  },

  saveScoreboard() {
    let sortedScoreboard = this.scoreboard.sort(this.sortScoreboardScoreDescending);
    localStorage.setItem("Scoreboard", JSON.stringify(sortedScoreboard));
  },

  clearScoreboard() {
    localStorage.removeItem("Scoreboard");
    this.scoreboard = [];
  },

  getTimeRemaining() {
    return this.currentGame.timeRemaingSeconds;
  },

  tickTimeRemaining() {
      this.currentGame.timeRemaingSeconds--;
  },

  substractTimePenalty() {
    this.currentGame.timeRemaingSeconds
      -= this.gameParameters.incorrectPenaltySeconds;
  },

  reset() {
      this.currentGame.timeRemaingSeconds = this.gameParameters.countdownStartSeconds;
      this.currentGame.countCorrectAnswers = 0;
      this.currentGame.askedQuestions = [];
    }
};
