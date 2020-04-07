/*
  Implements the game along a simplistic model-view-controller pattern.
 */
"use strict";

let QuizModel = {
  Questions: [
    {
      Id: 0,
      Question: "",
      Answers: [],
      Asked: false
    }
  ],

  ScoreBoard: [],

  Welcome: {
    Title: "Coding Quiz Challenge",
    Text: [],
    Buttons: "Start"
  },

  EndGame: {
    Title: "All done!",
    Text: [
      "Your score was {0}."
    ]
  },

  CurrentGame: {
    Timer: {
      CountdownStartSeconds: 60,
      IncorrectPenaltySeconds: 15
    },
    Score: 0
  }
};

let QuizController = {
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
      QuizModel.Questions = QuizModel.Questions.map(q => q.Asked = false);
      QuizModel.CurrentGame.Score = 0;
    }

};

let QuizView = {

};

/*
  Return a random integeer within an inclusive range.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addQuizNavButton(buttonText, onclickText) {
  let button = document.createElement("button");

  button.setAttribute("type", "button");
  button.setAttribute("class", "btn btn-info text-left");
  button.setAttribute("onclick", "onclickText");
  button.textContent = buttonText;

  return button;

}

function addQuizOptionButton(text, answerId) {
  let button = document.createElement("button");

  button.setAttribute("type", "button");
  button.setAttribute("class", "btn btn-lg btn-block btn-info text-left");
  button.setAttribute("onclick", "alert(answerId);")
  button.textContent = text;

  return button;
}

console.log('hello')

function clearQuizContent() {
  $("#quiz-content").empty();
}

function hideQuizStatus() {
  $("#quiz-status").hide();
}

clearQuizContent();
hideQuizStatus();

function showQuizWelcomePane() {
  let
    header = document.querySelector("#quiz-header");

  header.textContent = QuizModel.Welcome.Title;
}

showQuizWelcomePane();


document.querySelector("#quiz-content").appendChild(addQuizOptionButton("testing", 5))