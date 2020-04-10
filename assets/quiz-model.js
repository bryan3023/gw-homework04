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
      text: "What is the term for combining two strings into one?",
      answers: [
        { text: "Magic" },
        { text: "String summing" },
        { text: "Concatenation", correct: true },
        { text: "Putting shit together" }
      ]
    },
    {
      id: 2,
      text: "What is the differnence between \"==\" and \"===\"?",
      answers: [
        { text: "\"===\" tells JavaScript you really mean it." },
        { text: "Both test for equality of value, but \"===\" also tests equality of type.", correct: true },
        { text: "\"==\" tests for equality of numeric values. \"===\" tests equality of strings." },
        { text: "\"===\" first tests for equality, then assigns the right value to the left variable." }
      ]
    },
    {
      id: 3,
      text: "The function to convert a value to an integer is:",
      answers: [
        { text: "parseFloat()" },
        { text: "toInteger()" },
        { text: "covertToInteger()" },
        { text: "parseInt()", correct: true }
      ]
    },
    {
      id: 4,
      text: "Which of the following is not a JavaScript data type?",
      answers: [
        { text: "Object" },
        { text: "Number" },
        { text: "Float", correct: true },
        { text: "Boolean" }
      ]
    },
    {
      id: 5,
      text: "Which of the following is not a special numerical value?",
      answers: [
        { text: "Ludicrous", correct: true },
        { text: "Infinity" },
        { text: "Negative infinity" },
        { text: "NaN" }
      ]
    },
    {
      id: 6,
      text: "Which company developed JavaScript?",
      answers: [
        { text: "Microsoft" },
        { text: "Netscape", correct: true },
        { text: "Google" },
        { text: "Sun Mirosystems" }
      ]
    },
    {
      id: 7,
      text: "An undeclared variable is the same as an undefined variable.",
      answers: [
        { text: "true" },
        { text: "false", correct: true }
      ]
    },
    {
      id: 8,
      text: "Which of the following is not a type of loop supported in JavaScript?",
      answers: [
        { text: "for" },
        { text: "do...while" },
        { text: "while" },
        { text: "foreach", correct: true }
      ]
    },
    {
      id: 9,
      text: "Which of the following will return a string?",
      answers: [
        { text: "prompt()", correct: true },
        { text: "alert()" },
        { text: "messageBox()" },
        { text: "confirm()" }
      ]
    },
    {
      id: 10,
      text: "How would you add an element to the end of an array?",
      answers: [
        { text: "array.pop(element)" },
        { text: "array.append(element)" },
        { text: "array += element" },
        { text: "array.push(element)", correct: true}
      ]
    },
    {
      id: 11,
      text: "What statement should you add to a switch clause to prevent falling through to the next case?",
      answers: [
        { text: "exit" },
        { text: "return" },
        { text: "break", correct: true },
        { text: "stop" }
      ]
    },
    {
      id: 12,
      text: "Which standards body manages the development of JavaScript?",
      answers: [
        { text: "ANSI" },
        { text: "ECMA", correct: true },
        { text: "NIST" },
        { text: "W3C" }
      ]
    },
    {
      id: 13,
      text: "What is the name of the object used to get information about the users browser?",
      answers: [
        { text: "navigator", correct: true },
        { text: "browser" },
        { text: "mosaic" },
        { text: "explorer" }
      ]
    },
    {
      id: 14,
      text: "What method would you use to respond to events on a page?",
      answers: [
        { text: "addEventHandler()" },
        { text: "onEvent()" },
        { text: "addEventListener()", correct: true },
        { text: "whenSomethingHappens()" }
      ]
    },
    {
      id: 15,
      text: "What is it that allows a parent element to respond to events from its children?",
      answers: [
        { text: "event fencing" },
        { text: "event bubbling" },
        { text: "event capture" },
        { text: "event delegation", correct: true }
      ]
    },
    {
      id: 16,
      text: "Which of the following is NOT a logical boolean operator?",
      answers: [
        { text: "&&" },
        { text: "~", correct: true },
        { text: "!" },
        { text: "||" }
      ]
    },
    {
      id: 17,
      text: "querySelector(\".name\") will return results based on what?",
      answers: [
        { text: "Class name", correct: true },
        { text: "Element name" },
        { text: "Child element name"},
        { text: "Id name" }
      ]
    },
    {
      id: 18,
      text: "How would you write a single-line comment in JavaScript?",
      answers: [
        { text: "# comment" },
        { text: "/* comment */" },
        { text: "(* comment *)" },
        { text: "// comment", correct: true }
      ]
    },
    {
      id: 19,
      text: "Which of the following is NOT a function for working with timers in JavaScript?",
      answers: [
        { text: "setTimeout()" },
        { text: "createTimeout()", correct: true },
        { text: "setInterval()" },
        { text: "clearInterval()" }
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
      let selected = available[getRandomInt(0, available.length - 1)];
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
      * this.gameParameters.pointsPerCorrectAnswer
      * this.currentGame.timeRemaingSeconds;
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
  }
};
