const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const hint = document.getElementById("hint");
const attempts = document.getElementById("attempts");
const newGameBtn = document.getElementById("newGameBtn");

let secretNumber = 0;
let attemptCount = 0;

function newGame() {
  secretNumber = Math.floor(Math.random() * 50) + 1;
  attemptCount = 0;
  attempts.textContent = "Attempts: 0";
  hint.textContent = "Make your first guess.";
  guessForm.reset();
  guessInput.focus();
}

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const guess = Number(guessInput.value);

  if (!Number.isInteger(guess) || guess < 1 || guess > 50) {
    hint.textContent = "Enter a valid number from 1 to 50.";
    return;
  }

  attemptCount += 1;
  attempts.textContent = `Attempts: ${attemptCount}`;

  if (guess === secretNumber) {
    hint.textContent = `Correct! ${secretNumber} was the secret number.`;
    return;
  }

  hint.textContent = guess < secretNumber ? "Too low. Try a higher number." : "Too high. Try a lower number.";
  guessInput.select();
});

newGameBtn.addEventListener("click", newGame);

newGame();
