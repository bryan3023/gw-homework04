 /*
  Implements part of an MVC pattern. See README.md in the root of
  this repo.
 */

"use strict;"

/*
  This object is organized into a collection of sub-objects, each of which is a
  component on the page.

  At minimum, each component has a show() methods, which renders it on the
  page. Many also have a setCallback() method, which sets any callbacks used by
  event listeners.

  Below these components are a few shared properties and methods for rendering
  to the screen.
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


  /*
    The countdown timer in the upper right corner.
   */
  countdownTimer: {
    /*
      Update the timer with the current time remaining.
     */
    show(timeRemaingSeconds) {
      let timer = document.querySelector("#quiz-timer");
      timer.textContent = timeRemaingSeconds;
    }
  },


  /*
    The pane players see before starting a new quiz.
   */
  welcomePane: {
    title: "Coding Quiz Challenge",
    text: [
      "Welcome to the JavaScript coding quiz!",
      "Test your knowledge of JavaScript by seeing how many you can get right. You will have 90 seconds to complete the quiz, but you'll lose 15 for every wrong answer.",
      "Good luck!"
    ],

  
    /*
      Callback to start a new quiz.
     */
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


  /*
    The pane used to render each question on the page.
   */
  questionsPane: {
    /*
      Callback to evaluate the player's answer.
     */
    answerButtonCallback: null,


    /*
      Render the pane on the page. Expects a question object.
     */
    show(question) {
      let
        answers = this.randomizedAnswers(question.answers),
        divTag = document.createElement("div");

      QuizView.header.textContent = question.text;
      QuizView.clear(QuizView.content);
    
      for (let answer of answers) {
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


    /*
      Given a set of answers, create a copy and then build a randomized array
      of those answers.
     */
    randomizedAnswers(answers) {
      let
        copy = answers.slice(0),
        randomizedAnswers = [];

      while (randomizedAnswers.length !== answers.length) {
        let answerIndex = getRandomInt(0, copy.length - 1);
        randomizedAnswers.push(copy[answerIndex]);
        copy.splice(answerIndex, 1);
      }

      return randomizedAnswers;
    }
  },


  /*
    The pane shown after a quiz is complete, allowing players to enter their
    initials to add their results to the scoreboard.
   */
  endQuizPane: {
    title: "All done!",
    text: "Your score was {0}.",


    /*
      Callback to add the player's results to the scoreboard.
     */
    submitInitialsCallback: null,


    /*
      Render the quiz results pane to the page. Expects the player's
      calculated score.
     */
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


    /*
      Return a form for players to submit their initials.
     */
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


  /*
    The "Highscores" pane that shows a player's position to others.
   */
  scoreboardPane: {
    title: "Highscores",
    scoreboard: null,


    /*
      Callback to return back to the welcome pane.
     */
    restartQuizCallback: null,
  
  
    /*
      Callback to update the scoreboard with newer results.
     */
    refreshScoreboardCallback: null,
  
  
    /*
      Callback to remove all entries from the scoreboard.
     */
    clearScoreboardCallback: null,

  
    /*
      Render the scoreboard pane on the page.
     */
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


    /*
      Return a table of players' ranks, initials, and scores.
     */
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


    /*
      Return an individual <td> element for the scoreboard table.
     */
    addScoreboardTableData(dataContent) {
      let tdTag = document.createElement("td");
      tdTag.textContent = dataContent;
      return tdTag;
    },


    /*
      Set the pane's scoreboard to a new value.
     */
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


  /*
    The area below the main content of the quiz. Used to provide
    players feedback.
   */
  statusBar: {
    /*
      Based on the player's answer, show a message that disappears
      after 1 second.
     */
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
    }
  },


  // -- Shared methods and properties ---

  /*
    Return a button with the specified text and style. The value
    will always match the text.
   */
  addButton(buttonText, buttonStyle) {
    let button = document.createElement("button");
  
    button.type = "submit";
    button.textContent = buttonText;
    button.value = buttonText;
    button.className = buttonStyle;

    return button;
  },


  /*
    Remove all elements below the specified root.
   */
  clear(elementRoot) {
    while (elementRoot.lastElementChild) {
      elementRoot.removeChild(elementRoot.lastElementChild);
    }
  },


  /*
    Properties to conveniently access key parts of the page.
   */
  header: document.querySelector("#quiz-header"),
  content: document.querySelector("#quiz-content"),


  /*
    We use two styles of buttons in this app. These properties make it
    easier to specify what we want.
   */
  classNavButton: "btn btn-info text-left mr-1",
  classAnswerButton: "btn btn-lg btn-block btn-info text-left",
};