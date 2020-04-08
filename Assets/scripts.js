/*
  Implements the game along a simplistic model-view-controller pattern.
 */
"use strict";


let QuizModel = {

  Questions: [
    {
      Id: 0,
      Question: "Are null values and undefined values the same?",
      Answers: [
        {
          Text: "Yes"
        },
        {
          Text: "No",
          Correct: true        }
      ]
    }
  ],

  ScoreBoard: [],

  EndGamePane: {
    Title: "All done!",
    Text: [
      "Your score was {0}."
    ]
  },

  CurrentGame: {
    Timer: {
      CountdownStartSeconds: 90,
      IncorrectPenaltySeconds: 15,
      TimeRemaingSeconds: 90
    },
    Score: 0,
    AskedQuestions: []
  },


  getNewQuestion:
    function() {
      let
        available = this.getAvailableQuestions(),
        selected = available[available.length - 1];
    
      QuizModel.CurrentGame.AskedQuestions.push(selected.Id);
      return selected;
    },

  getAvailableQuestions:
    function() {
      return this.Questions.filter(
        q => -1 === this.CurrentGame.AskedQuestions.indexOf(q.Id));
    },

  isAnswerCorrect:
    function(answerIndex) {
      let current = this.Questions
        .filter(q => q.Id == getCurrentQuestionId())[0];
    
      return current.Answers[answerIndex].Correct;
    },

  getCurrentQuestionId:
    function() {
      let asked = this.CurrentGame.AskedQuestions;
      return asked[asked.length - 1];
    }
};



let QuizController = {

  model: null,
  view: null,

  start:
    function() {
      this.model = QuizModel;
      this.view = QuizView;

      this.view.showQuizWelcomePane();
    },

  beginQuiz:
    function() {
      let question = this.model.getNewQuestion();
      this.view.showQuestionPane(question);
    },

  evaluateAnswer:
    function(answerIndex) {
      if (this.model.isAnswerCorrect(answerIndex)) {
        this.view.setQuizStatus("Correct!");
      } else {
        this.view.setQuizStatus("Wrong!");
      }
    },


  saveScoreBoard:
    function() {
      localStorage.setItem("ScoreBoard", QuizModel.ScoreBoard);
    },

  loadScoreBoard:
    function() {
      QuizModel.ScoreBoard = localStorage.getItem("ScoreBoard");
      if (null === QuizModel.ScoreBoard) {
        QuizModel.ScoreBoard = [];
      }
    },

  resetScoreBoard:
    function() {
      QuizModel.ScoreBoard = [];
      this.saveScoreBoard();
    },

  addScore:
    function(initials) {
      QuizModel.ScoreBoard += {
        Initials: initials,
        Score: QuizModel.CurrentGame.Score
      }
      this.saveScoreBoard();
    },
  
  getQuestion:
    function() {
      let availableQuestions = QuizModel.Questions.filter(q => !q.Asked);

        chosenQuestion = availableQuestions[getRandomInt(0, availableQuestions.length - 1)];

      QuizModel.Questions.filter(q => q.Id === chosenQuestion.Id).Asked = true;
      return chosenQuestion;
    },

  endQuiz:
    function() {

    },

  resetQuiz:
    function() {
      QuizModel.CurrentGame.Score = 0;
    }

};


let QuizView = {

  WelcomePane: {
    Title: "Coding Quiz Challenge",
    Text: [
      "Welcome to the JavaScript coding quiz!",
      "Test your knowledge of JavaScript by seeing how many you can get right. You will have 90 seconds to complete the quiz, but you'll lose 15 for every wrong answer.",
      "Good luck!"
    ]
  },


  showQuizWelcomePane:
    function() {
      this.getQuizHeader().textContent = this.WelcomePane.Title;
    
      this.clearQuizContent();
    
      for (let paragraph of this.WelcomePane.Text) {
        let pTag = document.createElement("p");
        pTag.textContent = paragraph;
        this.getQuizContent().appendChild(pTag)
      }
    
      this.getQuizContent().appendChild(
        this.addQuizNavButton("Begin", "QuizController.beginQuiz()"));
    
      this.hideQuizStatus();
    },

  showQuestionPane:
    function(question) {
      this.getQuizHeader().textContent = question.Question;
    
      this.clearQuizContent();
    
      for (let i =0 ;i < question.Answers.length; i++) {
        let answerButton = this.addQuizOptionButton(question.Answers[i].Text, i);
        this.getQuizContent().appendChild(answerButton);
      }
    },

  addQuizNavButton:
    function(buttonText, onClickText) {
      let button = document.createElement("button");
    
      button.setAttribute("type", "button");
      button.setAttribute("class", "btn btn-info text-left mr-1");
      button.setAttribute("onclick", onClickText);
      button.textContent = buttonText;
    
      return button;
    },
    
  addQuizOptionButton:
    function(text, answerIndex) {
      let button = document.createElement("button");
    
      button.setAttribute("type", "button");
      button.setAttribute("class", "btn btn-lg btn-block btn-info text-left");
      button.setAttribute("onclick", `QuizController.evaluateAnswer(${answerIndex});`);
      button.textContent = text;
    
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