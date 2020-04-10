/*
  Implements part of an MVC pattern. See README.md in the root of
  this repo.
 */

 "use strict";


/*
  This object manages the state of the game.
 */
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


  // --- Question retrieval and evaluation methods ---

  /*
    See if there are any more questions available. If so, pick one at random,
    add it to the list of questions that have been asked, and return it. If
    there are no more questions, return null.
   */
  getNewQuestion() {
    let available = this.getAvailableQuestions();
    
    if (available.length) {
      let selected = available[this.getRandomInt(0, available.length - 1)];
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
    Return the ID of the current (i.e., last) question from the list of
    those that have been asked.
   */
  getCurrentQuestionId() {
    let asked = this.currentGame.askedQuestions;
    return asked[asked.length - 1];
  },


  // --- Player score methods ---

  /*
    Increment the raw score for correct answers.
   */
  increaseScore() {
    this.currentGame.countCorrectAnswers++;
  },


  /*
    Return the calculated final score of the game.
   */
  getScore() {
    return this.currentGame.countCorrectAnswers
      * this.gameParameters.pointsPerCorrectAnswer;
  },


  // --- Scoreboard retrieval and management methods ---

  /*
    Return the current scoreboard.
   */
  getScoreboard() {
    return this.scoreboard;
  },


  /*
    Add a player's initials and score to the scoreboard.
   */
  addPlayerToScoreboard(playerInitials) {
    this.scoreboard.push({
      initials: playerInitials,
      score: this.getScore()
    });
    this.saveScoreboard();
  },


  /*
    Retrieve the scoreboard from local storage. If it doesn't exist, create
    an empty on.
   */
  loadScoreboard() {
    let localScoreboard = localStorage.getItem("Scoreboard");

    if (localScoreboard) {
      this.scoreboard = JSON.parse(localScoreboard);
    } else {
      this.scoreboard = [];
    }
  },


  /*
    Sort the scoreboard so that rows are ordered by players' scores descending,
    then save it to local storage.
   */
  saveScoreboard() {
    let sortedScoreboard = this.scoreboard.sort(this.sortScoreboardScoreDescending);
    localStorage.setItem("Scoreboard", JSON.stringify(sortedScoreboard));
  },


  /*
    Remove the scoreboard from local storage and set it to be empty.
   */
  clearScoreboard() {
    localStorage.removeItem("Scoreboard");
    this.scoreboard = [];
  },


  /*
    If -1, player1 comes before player2. If 1, player1 comes after player2.
    If 0, the order will be unchanged.
   */
  sortScoreboardScoreDescending(player1, player2) {
    if (player1.score > player2.score) {
      return -1;
    }
    if (player1.score < player2.score) {
      return 1;
    }
    return 0;
  },


  // --- Quiz timer methods ---

  /*
    Get the current number of seconds remaining.
   */
  getTimeRemaining() {
    return this.currentGame.timeRemaingSeconds;
  },


  /*
    Decrement the timer on the next interval.
   */
  tickTimeRemaining() {
      this.currentGame.timeRemaingSeconds--;
  },


  /*
    Put a penalty on the timer for wrong answers.
   */
  substractTimePenalty() {
    this.currentGame.timeRemaingSeconds
      -= this.gameParameters.incorrectPenaltySeconds;
  },


  // -- Quiz stat reset method --

  /*
    Reset the current state to its defaults so the player can play again.
   */
  reset() {
    this.currentGame.timeRemaingSeconds = this.gameParameters.countdownStartSeconds;
    this.currentGame.countCorrectAnswers = 0;
    this.currentGame.askedQuestions = [];
  },


  // -- Helper method ---

  /*
    Return a random integer within an inclusive range.
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
