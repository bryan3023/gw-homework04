# gw-homework04

## Synopsis

This is the homework deliverable for lesson 4 on Web APIs.

This solution is a mulitple choice quiz game designed to test your knowledge of basic JavaScript. You will have 90 seconds to answer 20 questions, but you incur a 15 second penalty for every wrong answer.

After you're done, you'll be given an opportunity to add your initials to the scoreboard. You'll then be able to see where you ran relative to other players - but only locally within that browser. If you wish, you can clear the scoreboard.

[Try it now!](https://bryan3023.github.io/gw-homework04/)

## Implementation Overview

This project involved a lot more moving pieces than any of the previous ones. In order to make it manageable, I needed to find a way to keep every thing as well-organized. I did some research and settled on a version of the model-view-controller (MVC) pattern as [described here](https://www.sitepoint.com/mvc-design-pattern-javascript/).

A lot of what was described was beyond my current skill level with JavaScript (and thus a good clue on where I should explore in the future). My very simplified implementation breaks the program into three main objects:

- **QuizModel** - this is responsible for the logical state of the game, including persisting high scores to local storage.
- **QuizView** - this is responsible for providing the user interface for the game.
- **QuizController** - this is responsible for initializing the game and then responding to events to affect changes in both the model and the view.

The **QuizController** is probably the best starting for point reading the solution.

Starting with this pattern, I tried to work within the following constraints:

- Only the **QuizModel** is allowed to directly change any values related to the game's state.

- Only the **QuizView** is allowed to access the DOM.

- Neither the **QuizModel** or the **QuizView** can interact with the **QuizController**.

- The **QuizController** interacts with the **QuizModel** and the **QuizView** on via:

  a. Callback functions it wires into the **QuizView**.

  b. Interface methods provided by both objects.

- The **QuizModel** and the **QuizView** cannot interact with each other.

It still took some discipline, but overall this worked well. I believe I could improve the solution if I had a better understanding of JavaScript's object/class model, and I also suspect I could implement the callbacks more cleanly than I did.