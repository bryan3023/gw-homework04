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


/*
  This object is organized into a collection of sub-objects, each of which is a
  component on te back. Each component has, at minimum:

  - A show() method that renders it and sets any event listeners.
  - A setCallback() method, which sets any callbacks used by event listeners.

  Below this components are a collection of shared methods for rendering to the
  screen.
 */
let QuizView = {


  /*
    The "View High Scores" link in the upper left corner.
   */
  highscoreLink: {
    /*
      Callback to bring up the highscore board
     */
    highscoreLinkCallback: null,


    /*
      The link is always shown with the header bar, so this only wires the event.
     */
    show() {
      let highscoreLink = document.querySelector("#quiz-high-scores");

      highscoreLink.addEventListener("click", () => {
        event.preventDefault();
        this.highscoreLinkCallback();
      });
    },

    setCallback(highscoreLinkCallback) {
      this.highscoreLinkCallback = highscoreLinkCallback;
    }
  },


  countdownTimer: {
    show(timeRemaingSeconds) {
      let timer = document.querySelector("#quiz-timer");
      timer.textContent = timeRemaingSeconds;
    },

    setCallback() {}
  },

  /*
   */
  welcomePane: {
    title: "Coding Quiz Challenge",
    text: [
      "Welcome to the JavaScript coding quiz!",
      "Test your knowledge of JavaScript by seeing how many you can get right. You will have 90 seconds to complete the quiz, but you'll lose 15 for every wrong answer.",
      "Good luck!"
    ],

    beginQuizCallback: null,

    /*
      Render the welcome pane on the screen.
     */
    show() {
      let divTag = document.createElement("div");

      QuizView.header.textContent = this.title;
      QuizView.clear(QuizView.content);
      
      for (let paragraph of this.text) {
        let pTag = document.createElement("p");
        pTag.textContent = paragraph;
        QuizView.content.appendChild(pTag)
      }
    
      divTag.addEventListener("click", () => {
        event.preventDefault();
        if (event.target.matches("button")) {
          this.beginQuizCallback();
        }
      });

      divTag.appendChild(QuizView.addButton("Begin", QuizView.classNavButton));
      QuizView.content.appendChild(divTag);
    },

    setCallback(beginQuizCallback) {
      this.beginQuizCallback = beginQuizCallback;
    }
  },



  questionsPane: {
    answerButtonCallback: null,

    show(question) {
      let divTag = document.createElement("div");

      QuizView.header.textContent = question.text;
      QuizView.clear(QuizView.content);
    
      for (let answer of question.answers) {
        let answerButton = QuizView.addButton(answer.text, QuizView.classAnswerButton);
        divTag.appendChild(answerButton);
      }

      divTag.addEventListener("click", () => {
        event.preventDefault();
        if (event.target.matches("button")) {
          let answer = event.target.value;
          this.answerButtonCallback(answer);
        }
      });

      QuizView.content.appendChild(divTag);
    },

    setCallback(answerButtonCallback) {
      this.answerButtonCallback = answerButtonCallback;
    },
  },



  endQuizPane: {
    title: "All done!",
    text: "Your score was {0}.",

    submitInitialsCallback: null,

    show(score) {
      let pTag = document.createElement("p");

      QuizView.header.textContent = this.title;
      QuizView.clear(QuizView.content);

      pTag.textContent = this.text.replace("{0}", score);
      QuizView.content.appendChild(pTag);
      QuizView.content.appendChild(this.addScoreBoardForm());  
    },

    setCallback(submitInitialsCallback) {
      this.submitInitialsCallback = submitInitialsCallback;
    },

    addScoreBoardForm() {
      let
        formTag = document.createElement("form"),
        divTag = document.createElement("div"),
        labelTag = document.createElement("label"),
        inputTag = document.createElement("input");

      formTag.id = "quiz-scoreboard-form";
      formTag.className = "form-inline";
      formTag.autocomplete = "off";

      divTag.className = "form-group w-100";

      labelTag.textContent = "Enter your initials: ";
      labelTag.className = "col-form-label";
      labelTag.htmlFor = "player-initials"

      inputTag.id = "player-initials";
      inputTag.type = "text";
      inputTag.className = "form-control mx-0 mx-md-3"

      divTag.appendChild(labelTag);
      divTag.appendChild(inputTag);
      divTag.appendChild(QuizView.addButton("Submit", QuizView.classNavButton));

      divTag.addEventListener("click", () => {
        event.preventDefault();
        if (event.target.matches("button")) {
          let initials = event.target.form.elements["player-initials"].value.trim();
          this.submitInitialsCallback(initials);
        }
      });

      formTag.appendChild(divTag);

      return formTag;
    }
  },


  scoreboardPane: {
    title: "Highscores",
    scoreboard: null,

    restartQuizCallback: null,
    refreshScoreboardCallback: null,
    clearScoreboardCallback: null,

    show() {
      let divTag = document.createElement("div");

      this.refreshScoreboardCallback();
      QuizView.header.textContent = this.title;
      QuizView.clear(QuizView.content);

      QuizView.content.appendChild(this.addScoreboardTable());
      divTag.appendChild(QuizView.addButton("Go Back", QuizView.classNavButton));
      divTag.appendChild(QuizView.addButton("Clear Highscores", QuizView.classNavButton));
      QuizView.content.append(divTag);

      divTag.addEventListener("click", () => {
        event.preventDefault();

        if (event.target.matches("button")) {
          let button = event.target.value;

          switch (button) {
            case "Go Back":
              this.restartQuizCallback();
              break;
            case "Clear Highscores":
              this.clearScoreboardCallback();
              this.show();
              break;
            default:
              console.log("Invalid button value: %s", button);
              break;
          }
        }
      });
    },

    setCallback(restartQuizCallback, refreshScoreboardCallback,
        clearScoreboardCallback) {
      this.restartQuizCallback = restartQuizCallback;
      this.refreshScoreboardCallback = refreshScoreboardCallback;
      this.clearScoreboardCallback = clearScoreboardCallback;
    },

    addScoreboardTable() {
      let
        scoreboard = this.scoreboard,
        tableTag = document.createElement("table"),
        tbodyTag = document.createElement("tbody");
      
      tableTag.classList = "table";

      for (let i = 0; i < scoreboard.length; i++) {
        let trTag = document.createElement("tr");

        if (this.isEven(i)) {
          trTag.classList = "table-info";
        }

        trTag.appendChild(this.addScoreboardTableData(i + 1));
        trTag.appendChild(this.addScoreboardTableData(scoreboard[i].initials));
        trTag.appendChild(this.addScoreboardTableData(scoreboard[i].score));

        tbodyTag.appendChild(trTag)
      }

      tableTag.appendChild(tbodyTag);

      return tableTag;
    },

    addScoreboardTableData(dataContent) {
      let tdTag = document.createElement("td");
      tdTag.textContent = dataContent;
      return tdTag;
    },


    setScoreboard(scoreboard) {
      this.scoreboard = scoreboard;
    },

    /*
      Helper function to determine if a number is even. Used to create
      color banded rows.
     */
    isEven(number) {
      return (0 === number % 2);
    }
  },

  statusBar: {
    show(message) {
      let
        divStatus = document.querySelector("#quiz-status"),
        success = message === "Correct!",
        divTag = document.createElement("div");

      divTag.className = success ?
        "alert alert-success" :
        "alert alert-danger";
      divTag.setAttribute("role", "alert");
      divTag.textContent = message;
      divStatus.appendChild(divTag);

      setTimeout(() => QuizView.clear(divStatus), 1000);
    },

    setCallback() {
      /* no callbacks */
    },
  },


  classNavButton: "btn btn-info text-left mr-1",
  classAnswerButton: "btn btn-lg btn-block btn-info text-left",

  addButton(buttonText, buttonStyle) {
    let button = document.createElement("button");
  
    button.type = "submit";
    button.textContent = buttonText;
    button.value = buttonText;
    button.className = buttonStyle;

    return button;
  },


  clear(elementRoot) {
    while (elementRoot.lastElementChild) {
      elementRoot.removeChild(elementRoot.lastElementChild);
    }
  },

  getQuizHeader() {
    return document.querySelector("#quiz-header");
  },

  header: document.querySelector("#quiz-header"),
  content: document.querySelector("#quiz-content"),
};

/*
  Return a random integer within an inclusive range.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



QuizController.start();