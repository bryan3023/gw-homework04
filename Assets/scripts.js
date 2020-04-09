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
  getNewQuestion:
    function() {
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
  getAvailableQuestions:
    function() {
      return this.questions.filter(
        q => -1 === this.currentGame.askedQuestions.indexOf(q.id));
    },


  /*
    Return true if the answer provided matches the correct answer
    for the current question.
   */
  isAnswerCorrect:
    function(answer) {
      let
        currentQuestion = this.questions.filter(q => q.id === this.getCurrentQuestionId())[0],
        correctAnswer = currentQuestion.answers.filter(a => a.correct)[0];

      return correctAnswer.text === answer;
    },


  /*
    Return the current (i.e., last) question from the list of
    those that have been asked.
   */
  getCurrentQuestionId:
    function() {
      let asked = this.currentGame.askedQuestions;
      return asked[asked.length - 1];
    },

  /*
    Return the final score of the game.
   */
  getScore:
    function() {
      return this.currentGame.countCorrectAnswers * this.gameParameters.pointsPerCorrectAnswer;
    },


  /*
   */
  increaseScore:
    function() {
      this.currentGame.countCorrectAnswers++;
    },

  startTimer:
    function(timerCallback) {

    },


  addPlayerToScoreboard:
    function(playerInitials) {
      console.log(this.scoreboard)
      this.scoreboard.push({
        initials: playerInitials,
        score: this.getScore()
      });
      this.saveScoreboard();
    },

  getScoreboard:
    function() {
      return this.scoreboard;
    },

  loadScoreboard:
    function() {
      if (!this.scoreboard) {
        this.scoreboard = [];
      }
      let localScoreboard = localStorage.getItem("Scoreboard");

      if (localScoreboard) {
        this.scoreboard = JSON.parse(localScoreboard);
      }
    },

  saveScoreboard:
    function() {
      console.log()
      localStorage.setItem("Scoreboard", JSON.stringify(this.scoreboard));
    },

  substractTimePenalty:
    function() {
      this.currentGame.timeRemaingSeconds -= this.gameParameters.incorrectPenaltySeconds;
    },

  reset:
    function() {
      this.currentGame.timeRemaingSeconds = this.gameParameters.countdownStartSeconds;
      this.currentGame.countCorrectAnswers = 0;
      this.currentGame.askedQuestions = [];
    }
};



let QuizController = {

  model: null,
  view: null,


  /*
    Quiz entry point. Initialize the state and show the welcome pane.
   */
  start:
    function() {
      this.model = QuizModel;
      this.view = QuizView;

      this.model.loadScoreboard();
      this.view.scoreboardPane.setScoreboard(this.model.getScoreboard());

      this.view.highscoreLink.setCallback(() => QuizView.showScoreboardPane());
      this.view.welcomePane.setCallback(() => QuizController.beginQuiz());
      this.view.questionsPane.setCallback(answer => QuizController.evaluateAnswer(answer));
      this.view.endQuizPane.setCallback(playerInitials => QuizController.updateScoreboard(playerInitials));
      this.view.scoreboardPane.setCallback(
        () => QuizView.welcomePane.show(),
        () => QuizController.clearScoreboard()
      );

      this.view.highscoreLink.show();
      this.view.welcomePane.show();
    },


  /*
    Start the timer nd 
   */
  beginQuiz:
    function() {
      this.model.reset();
      this.getNextQuestion();
    },

  evaluateAnswer:
    function(answer) {
      if (this.model.isAnswerCorrect(answer)) {
        this.view.setQuizStatus("Correct!");
        this.model.increaseScore();
      } else {
        this.view.setQuizStatus("Wrong!");
        this.model.substractTimePenalty();
      }
      this.getNextQuestion();
    },


  /*
    Get a new question and create a new question pane for it, providing an
    event listener to check answers. If there are no more questions, end the
    game.
   */
  getNextQuestion:
    function() {
      let question = this.model.getNewQuestion();
      if (question) {
        this.view.questionsPane.show(question);
      } else {
        this.endQuiz();
      }
    },

  endQuiz:
    function() {
      this.view.endQuizPane.show(this.model.getScore());
    },

  updateScoreboard:
    function(playerInitials) {
      this.model.addPlayerToScoreboard(playerInitials);
      this.view.scoreboardPane.show();
//      this.view.showScoreboardPane(this.model.getScoreboard());
    },
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
    show:
      function() {
        QuizView.getQuizHighScoresLink().addEventListener("click", () => {
          event.preventDefault();
          this.highscoreLinkCallback();
        });
      },

    setCallback:
      function(highscoreLinkCallback) {
        this.highscoreLinkCallback = highscoreLinkCallback;
      }
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
    show:
      function() {
        QuizView.getQuizHeader().textContent = this.title;
        QuizView.hideQuizStatus();
        QuizView.clearQuizContent();

        let
          content = QuizView.getQuizContent(),
          divTag = document.createElement("div");
      
        for (let paragraph of this.text) {
          let pTag = document.createElement("p");
          pTag.textContent = paragraph;
          content.appendChild(pTag)
        }
      
        divTag.addEventListener("click", () => {
          event.preventDefault();
          if (event.target.matches("button")) {
            this.beginQuizCallback();
          }
        });

        divTag.appendChild(QuizView.addButton("Begin", QuizView.classNavButton));
        content.appendChild(divTag);
      },

    setCallback:
      function(beginQuizCallback) {
        this.beginQuizCallback = beginQuizCallback;
      }
  },



  questionsPane: {
    answerButtonCallback: null,

    show:
      function(question) {
        QuizView.getQuizHeader().textContent = question.text;
        QuizView.clearQuizContent();

        let
          content = QuizView.getQuizContent(),
          divTag = document.createElement("div");
      
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

        content.appendChild(divTag);
      },

    setCallback:
      function(answerButtonCallback) {
        this.answerButtonCallback = answerButtonCallback;
      },
  },



  endQuizPane: {
    title: "All done!",
    text: "Your score was {0}.",

    submitInitialsCallback: null,

    show:
      function(score) {
        QuizView.getQuizHeader().textContent = this.title;
        QuizView.hideQuizStatus();
        QuizView.clearQuizContent();
  
        let
          content = QuizView.getQuizContent(),
          pTag = document.createElement("p");

        pTag.textContent = this.text.replace("{0}", score);
        content.appendChild(pTag);
        content.appendChild(this.addScoreBoardForm());  
      },

    setCallback:
      function(submitInitialsCallback) {
        this.submitInitialsCallback = submitInitialsCallback;
      },

    addScoreBoardForm:
      function(buttonCallback) {
        let
          formTag = document.createElement("form"),
          divTag = document.createElement("div"),
          labelTag = document.createElement("label"),
          inputTag = document.createElement("input");

        formTag.id = "quiz-scoreboard-form";
        formTag.className = "form-inline";

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
            let initials = event.target.form.elements["player-initials"].value;
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
    clearScoreboardCallback: null,

    show:
      function() {
        QuizView.getQuizHeader().textContent = this.title;
        QuizView.clearQuizContent();
  
        let
          content = QuizView.getQuizContent(),
          divTag = document.createElement("div");

        content.appendChild(this.addScoreboardTable());
        divTag.appendChild(QuizView.addButton("Go Back", QuizView.classNavButton));
        divTag.appendChild(QuizView.addButton("Clear Highscores", QuizView.classNavButton));
        content.append(divTag);

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
                break;
              default:
                alert("Invalid button");
                break;
            }
          }
        });
      },

    setCallback:
      function(restartQuizCallback, clearScoreboardCallback) {
        this.restartQuizCallback = restartQuizCallback;
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

    addScoreboardTableData:
      function(dataContent) {
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
  isEven:
  function(number) {
    return 0 === number % 2;
  }
  },


  classNavButton: "btn btn-info text-left mr-1",
  classAnswerButton: "btn btn-lg btn-block btn-info text-left",

  addButton:
    function(buttonText, buttonStyle) {
      let button = document.createElement("button");
    
      button.type = "submit";
      button.textContent = buttonText;
      button.value = buttonText;
      button.className = buttonStyle;

      return button;
    },


  clearQuizContent:
    function() {
      $("#quiz-content").empty();
    },

  hideQuizStatus:
    function() {
      $("#quiz-status").hide();
    },

  showQuizStatus:
    function() {
      $("#quiz-status").show();
    },

  setQuizStatus:
    function(text) {
      this.showQuizStatus();
      this.getQuizStatus().textContent = text;
    },

  getQuizHighScoresLink:
    function() {
      return document.querySelector("#quiz-high-scores");
    },

  getQuizHeader:
    function() {
      return document.querySelector("#quiz-header");
    },

  getQuizContent:
    function() {
      return document.querySelector("#quiz-content");
    },

  getQuizStatus:
    function() {
      return document.querySelector("#quiz-status");
    },


  /*
    Helper function to determine if a number is even. Used to create
    color banded rows.
   */
  isEven:
    function(number) {
      return 0 === number % 2;
    }
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