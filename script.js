// ✅ Replace this with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:abcd",
  databaseURL: "https://your-app.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const playerId = Math.random().toString(36).substring(2, 8); // Unique player ID
document.getElementById("gameInfo").innerText = `Your ID: ${playerId}`;

let targetWord = "";

// 🔄 Listen to word set in Firebase
db.ref("game/word").on("value", snapshot => {
  targetWord = (snapshot.val() || "").toUpperCase();
});

// 🔄 Listen for winner
db.ref("game/winner").on("value", snapshot => {
  const winner = snapshot.val();
  if (winner && winner !== playerId) {
    document.getElementById("status").textContent = `❌ You lost! Winner: ${winner}`;
    document.getElementById("guessInput").disabled = true;
  } else if (winner === playerId) {
    document.getElementById("status").textContent = `🎉 You won!`;
  }
});

function submitGuess() {
  const guess = document.getElementById("guessInput").value.toUpperCase();
  if (guess.length !== 5 || !targetWord) return;

  renderGuess(guess);

  if (guess === targetWord) {
    db.ref("game/winner").once("value", snap => {
      if (!snap.exists()) {
        db.ref("game/winner").set(playerId);
      }
    });
  }

  document.getElementById("guessInput").value = "";
}

function renderGuess(guess) {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";

    if (guess[i] === targetWord[i]) {
      tile.classList.add("correct");
    } else if (targetWord.includes(guess[i])) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }

    tile.textContent = guess[i];
    board.appendChild(tile);
  }
}
