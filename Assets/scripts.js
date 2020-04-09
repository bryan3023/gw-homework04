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
console.log(this.scoreboard)
alert(localScoreboard)
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
    Game entry point. Initialize the state and show the welcome pane, providing an
    event to begin the quiz.
   */
  start:
    function() {
      this.model = QuizModel;
      this.view = QuizView;

      this.model.loadScoreboard();

      this.view.welcomePane.setListeners(() => QuizController.beginQuiz());
      this.view.setHighScoreLink(() => QuizController.getScoreboardPane());

      this.view.welcomePane.show();
    },


  /*
    Start the timer nd 
   */
  beginQuiz:
    function() {
      this.model.reset();
      this.model.startTimer(() => {
        event.preventDefault();
        QuizController.endQuiz();
      });
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
        this.view.showQuestionPane(question,
          answer => QuizController.evaluateAnswer(answer));
      } else {
        this.endQuiz();
      }
    },

  endQuiz:
    function() {
      this.view.showQuizDonePane(this.model.getScore(),
        playerInitials => QuizController.updateScoreboard(playerInitials));
    },

  updateScoreboard:
    function(playerInitials) {
      this.model.addPlayerToScoreboard(playerInitials);
      this.view.showScoreboardPane(this.model.getScoreboard());
    },

  getScoreboardPane:
    function() {
      this.view.showScoreboardPane(this.model.getScoreboard());
    }
};


let QuizView = {

  welcomePane: {
    title: "Coding Quiz Challenge",
    text: [
      "Welcome to the JavaScript coding quiz!",
      "Test your knowledge of JavaScript by seeing how many you can get right. You will have 90 seconds to complete the quiz, but you'll lose 15 for every wrong answer.",
      "Good luck!"
    ],

    beginListener: null,

    show:
      function() {
        QuizView.getQuizHeader().textContent = this.title;
        QuizView.hideQuizStatus();
        QuizView.clearQuizContent();

        let content = QuizView.getQuizContent();
      
        for (let paragraph of this.text) {
          let pTag = document.createElement("p");
          pTag.textContent = paragraph;
          content.appendChild(pTag)
        }
      
        let divTag = document.createElement("div");
        divTag.addEventListener("click", () => {
          event.preventDefault();
          if (event.target.matches("button")) {
            this.beginListener();
          }
        });

        divTag.appendChild(QuizView.addQuizNavButton("Begin", null)
        );
        content.appendChild(divTag);
      },

    setListeners:
      function(beginCallback) {
        this.beginListener = beginCallback;
      }
  },

  endGamePane: {
    title: "All done!",
    text: "Your score was {0}."
  },

  scoreboardPane: {
    title: "Highscores"
  },


  showQuizWelcomePane:
    function(beginCallback) {
      this.getQuizHeader().textContent = this.welcomePane.title;    
      this.clearQuizContent();
    
      for (let paragraph of this.welcomePane.text) {
        let pTag = document.createElement("p");
        pTag.textContent = paragraph;
        this.getQuizContent().appendChild(pTag)
      }
    
      this.getQuizContent().appendChild(
        this.addQuizNavButton("Begin", beginCallback)
      );
    
      this.hideQuizStatus();
    },

  showQuestionPane:
    function(question, answerCallback) {
      this.getQuizHeader().textContent = question.text;
      this.clearQuizContent();
    
      for (let answer of question.answers) {
        let answerButton = this.addQuizAnswerButton(answer.text, answerCallback);
        this.getQuizContent().appendChild(answerButton);
      }
    },

  showQuizDonePane:
    function(score, updateScoreboardCallback) {
      this.getQuizHeader().textContent = this.endGamePane.title;
      this.clearQuizContent();

      let pTag = document.createElement("p");
      pTag.textContent = this.endGamePane.text.replace("{0}", score);
      this.getQuizContent().appendChild(pTag);
      this.getQuizContent().appendChild(
        this.addScoreBoardForm(updateScoreboardCallback)
      );
    },

  showScoreboardPane:
    function(scoreboard) {
      this.getQuizHeader().textContent = this.scoreboardPane.title;
      this.clearQuizContent();

      this.getQuizContent().appendChild(this.addScoreboardTable(scoreboard));
      this.getQuizContent().appendChild(this.addQuizNavButton("Go Back", null));
      this.getQuizContent().appendChild(this.addQuizNavButton("Clear Highscores", null));
    },

  setHighScoreLink:
    function(scoreboardCallback) {
      this.getQuizHighScoresLink().addEventListener("click", scoreboardCallback);
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

      divTag.appendChild(this.addQuizNavButton("Submit", () => {
        event.preventDefault();
        let initials = event.target.form.elements["player-initials"].value;
        buttonCallback(initials);
      }));

      formTag.appendChild(divTag);

      return formTag;
    },

  addScoreboardTable(scoreboard) {
    let
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

  addQuizNavButton:
    function(buttonText, buttonCallback) {
      let button = this.addQuizButton(buttonText);
    
      button.className = "btn btn-info text-left mr-1";
      if (buttonCallback) {
        button.addEventListener("click", () => buttonCallback());
      }
      return button;
    },
    
  addQuizAnswerButton:
    function(buttonText, buttonCallback) {
      let button = this.addQuizButton(buttonText);
    
      button.className = "btn btn-lg btn-block btn-info text-left";
      button.addEventListener("click", () => {
        event.preventDefault();
        buttonCallback(button.value)
      });
    
      return button;
    },
    
  addQuizButton:
    function(buttonText) {
      let button = document.createElement("button");
    
      button.type = "submit";
      button.textContent = buttonText;
      button.value = buttonText;

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