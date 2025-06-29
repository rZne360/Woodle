const firebaseConfig = {
  apiKey: "AIzaSyD_TBfmoZaYVGTQtblDMsUsNi_odpQKfQ4",
  authDomain: "woodle-3eaa5.firebaseapp.com",
  databaseURL: "https://woodle-3eaa5-default-rtdb.firebaseio.com",
  projectId: "woodle-3eaa5",
  storageBucket: "woodle-3eaa5.firebasestorage.app",
  messagingSenderId: "1058533729670",
  appId: "1:1058533729670:web:d3275a6d307f97313ff807"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const playerId = Math.random().toString(36).substring(2, 8);
let targetWord = "";
let currentRow = 0;
let currentGuess = "";

const board = document.getElementById("gameBoard");
const status = document.getElementById("status");

// Create grid
for (let r = 0; r < 6; r++) {
  const row = document.createElement("div");
  row.classList.add("row");
  row.setAttribute("id", `row-${r}`);
  for (let c = 0; c < 5; c++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.setAttribute("id", `row-${r}-col-${c}`);
    row.appendChild(tile);
  }
  board.appendChild(row);
}

// Get word from Firebase
db.ref("game/word").on("value", snap => {
  targetWord = (snap.val() || "").toUpperCase();
});

db.ref("game/winner").on("value", snap => {
  const winner = snap.val();
  if (winner && winner !== playerId) {
    status.textContent = `❌ You lost! Winner: ${winner}`;
  } else if (winner === playerId) {
    status.textContent = `🎉 You WON!`;
  }
});

// Typing input
document.addEventListener("keydown", e => {
  if (status.textContent.includes("won") || status.textContent.includes("lost")) return;

  if (e.key === "Enter") {
    if (currentGuess.length === 5) {
      checkGuess(currentGuess.toUpperCase());
    }
  } else if (e.key === "Backspace") {
    if (currentGuess.length > 0) {
      currentGuess = currentGuess.slice(0, -1);
      updateRow();
    }
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    if (currentGuess.length < 5) {
      currentGuess += e.key;
      updateRow();
    }
  }
});

function updateRow() {
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-col-${i}`);
    tile.textContent = currentGuess[i] || "";
  }
}

function checkGuess(guess) {
  const row = document.getElementById(`row-${currentRow}`);
  const letters = targetWord.split("");
  const guessLetters = guess.split("");

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-col-${i}`);
    if (guess[i] === targetWord[i]) {
      tile.classList.add("correct");
      letters[i] = null;
      guessLetters[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`row-${currentRow}-col-${i}`);
    if (!tile.classList.contains("correct")) {
      if (guessLetters[i] && letters.includes(guessLetters[i])) {
        tile.classList.add("present");
        letters[letters.indexOf(guessLetters[i])] = null;
      } else {
        tile.classList.add("absent");
      }
    }
  }

  if (guess === targetWord) {
    db.ref("game/winner").once("value", snap => {
      if (!snap.exists()) {
        db.ref("game/winner").set(playerId);
      }
    });
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow >= 6) {
    status.textContent = `💀 You ran out of tries! Word was: ${targetWord}`;
  }
}
