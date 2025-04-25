const gameState = {
  currentPlayer: '1',
  board: ['', '', '', '', '', '', '', '', ''],
  gameActive: true,
  gameHistory: [],
  lastStartingPlayer: '2',
  score1: 0,
  score2: 0,
  player1Name: 'Player 1',
  player2Name: 'Player 2',
  player1Icon: '😊',
  player2Icon: '❤️',
  gameMode: 'twoPlayers',
  difficulty: 'medium',
  computerMoveTimeout: null,
};

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Cache DOM elements
const domElements = {
  splashScreen: document.getElementById('splash-screen'),
  gameContainer: document.getElementById('game-container'),
  player1NameInput: document.getElementById('player-1-name'),
  player2NameInput: document.getElementById('player-2-name'),
  player1EmojiSelection: document.getElementById('player-1-emoji-selection'),
  player2EmojiSelection: document.getElementById('player-2-emoji-selection'),
  player2Input: document.getElementById('player-2-input'),
  difficultySelection: document.getElementById('difficulty-selection'),
  gameDifficultySelection: document.getElementById('game-difficulty-selection'),
  gameDifficultySelect: document.getElementById('game-difficulty'),
  startGameBtn: document.getElementById('start-game'),
  status: document.getElementById('status'),
  cells: document.querySelectorAll('.cell'),
  playAgainBtn: document.getElementById('play-again'),
  backToMenuBtn: document.getElementById('back-to-menu'),
  resetScoresBtn: document.getElementById('reset-scores'),
  historyList: document.getElementById('history-list'),
  player1Labels: document.querySelectorAll('#player-1-label'),
  player2Labels: document.querySelectorAll('#player-2-label'),
  score1Elements: document.querySelectorAll('#score-1'),
  score2Elements: document.querySelectorAll('#score-2'),
  winLine: document.getElementById('win-line'),
};

// Load saved state from localStorage
function loadSavedState() {
  const savedState = localStorage.getItem('ticTacTussleState');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    gameState.score1 = parsedState.score1 || 0;
    gameState.score2 = parsedState.score2 || 0;
    gameState.player1Name = parsedState.player1Name || 'Player 1';
    gameState.player2Name = parsedState.player2Name || 'Player 2';
    gameState.gameHistory = parsedState.gameHistory || [];
    domElements.player1NameInput.value = gameState.player1Name;
    domElements.player2NameInput.value = gameMode === 'twoPlayers' ? gameState.player2Name : '';
    updateScoreboard();
    updateScoreDisplay();
  }
}

// Save state to localStorage
function saveState() {
  const stateToSave = {
    score1: gameState.score1,
    score2: gameState.score2,
    player1Name: gameState.player1Name,
    player2Name: gameState.player2Name,
    gameHistory: gameState.gameHistory,
  };
  localStorage.setItem('ticTacTussleState', JSON.stringify(stateToSave));
}

// Function to trigger the computer's move
function triggerComputerMove() {
  if (!gameState.gameActive || gameState.gameMode !== 'vsComputer' || gameState.currentPlayer !== '2') return;

  if (gameState.computerMoveTimeout) {
    clearTimeout(gameState.computerMoveTimeout);
  }

  gameState.computerMoveTimeout = setTimeout(() => {
    if (!gameState.gameActive || gameState.currentPlayer !== '2') return;

    const moveIndex = computerMove(gameState.board, winConditions, gameState.difficulty);
    if (moveIndex !== null) {
      const cell = domElements.cells[moveIndex];
      if (cell && gameState.board[moveIndex] === '') {
        cell.click();
      }
    }
  }, 500);
}

// Update Player 1 UI based on game mode
function updatePlayer1UI() {
  const player1Buttons = domElements.player1EmojiSelection.querySelectorAll('.emoji-btn');
  player1Buttons.forEach(button => {
    button.classList.remove('selected');
    button.disabled = false;
    if (button.getAttribute('data-emoji') === gameState.player1Icon) {
      button.classList.add('selected');
    }
  });
}

// Update Player 2 UI based on game mode
function updatePlayer2UI() {
  const player2Buttons = domElements.player2EmojiSelection.querySelectorAll('.emoji-btn');

  if (gameState.gameMode === 'vsComputer') {
    domElements.player2NameInput.value = 'Computer';
    domElements.player2NameInput.disabled = true;
    player2Buttons.forEach(button => {
      button.style.display = 'none';
    });
    gameState.player2Icon = '🤖';
  } else {
    domElements.player2NameInput.value = gameState.player2Name;
    domElements.player2NameInput.disabled = false;
    const defaultEmoji = domElements.player2EmojiSelection.getAttribute('data-default-emoji');
    if (!gameState.player2Icon || gameState.player2Icon === '🤖') {
      gameState.player2Icon = defaultEmoji;
    }
    player2Buttons.forEach(button => {
      button.style.display = 'inline-flex';
      button.disabled = false;
      button.classList.remove('selected');
      if (button.getAttribute('data-emoji') === gameState.player2Icon) {
        button.classList.add('selected');
      }
    });
  }
}

// Update difficulty UI visibility and state
function updateDifficultyUI() {
  domElements.difficultySelection.style.display = gameState.gameMode === 'vsComputer' ? 'block' : 'none';
  domElements.gameDifficultySelection.style.display = gameState.gameMode === 'vsComputer' ? 'block' : 'none';
  domElements.gameDifficultySelect.value = gameState.difficulty;
}

// Main function to update UI based on game mode
function updateGameModeUI() {
  updatePlayer1UI();
  updatePlayer2UI();
  updateDifficultyUI();
  updateEmojiAvailability();
  updateDifficultySelectorState();
}

// Function to update the availability of emojis in both selections
function updateEmojiAvailability() {
  const player1Buttons = domElements.player1EmojiSelection.querySelectorAll('.emoji-btn');
  const player2Buttons = domElements.player2EmojiSelection.querySelectorAll('.emoji-btn');
  const player1Selected = gameState.player1Icon;
  const player2Selected = gameState.player2Icon;

  player1Buttons.forEach(button => {
    button.disabled = button.getAttribute('data-emoji') === player2Selected;
  });

  if (gameState.gameMode !== 'vsComputer') {
    player2Buttons.forEach(button => {
      if (button.style.display !== 'none') {
        button.disabled = button.getAttribute('data-emoji') === player1Selected;
      }
    });
  }
}

// Function to update the disabled state of the in-game difficulty selector
function updateDifficultySelectorState() {
  domElements.gameDifficultySelect.disabled = gameState.gameActive;
}

// Store the last valid selection for each player to revert if needed
let lastPlayer1Icon = gameState.player1Icon;
let lastPlayer2Icon = gameState.player2Icon;

// Handle game mode selection
document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    gameState.gameMode = e.target.value;
    updateGameModeUI();
  });
});

// Handle difficulty selection
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    gameState.difficulty = e.target.value;
    domElements.gameDifficultySelect.value = gameState.difficulty;
  });
});

// Handle in-game difficulty selection
domElements.gameDifficultySelect.addEventListener('change', (e) => {
  if (!gameState.gameActive) {
    gameState.difficulty = e.target.value;
    document.querySelector(`input[name="difficulty"][value="${gameState.difficulty}"]`).checked = true;
  }
});

// Handle emoji selection for Player 1
domElements.player1EmojiSelection.querySelectorAll('.emoji-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const selectedEmoji = e.target.getAttribute('data-emoji');
    if (selectedEmoji === gameState.player2Icon) {
      alert('That emoji is already selected by Player 2. Please choose a different one.');
      return;
    }

    e.target.parentElement.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    e.target.classList.add('selected');
    gameState.player1Icon = selectedEmoji;
    lastPlayer1Icon = selectedEmoji;
    updateEmojiAvailability();
  });
});

// Handle emoji selection for Player 2
domElements.player2EmojiSelection.querySelectorAll('.emoji-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const selectedEmoji = e.target.getAttribute('data-emoji');
    if (selectedEmoji === gameState.player1Icon) {
      alert('That emoji is already selected by Player 1. Please choose a different one.');
      return;
    }

    e.target.parentElement.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    e.target.classList.add('selected');
    gameState.player2Icon = selectedEmoji;
    lastPlayer2Icon = selectedEmoji;
    updateEmojiAvailability();
  });
});

domElements.startGameBtn.addEventListener('click', startGame);
domElements.cells.forEach(cell => cell.addEventListener('click', handleCellClick));
domElements.playAgainBtn.addEventListener('click', playAgain);
domElements.backToMenuBtn.addEventListener('click', backToMenu);
domElements.resetScoresBtn.addEventListener('click', resetScores);

function startGame() {
  const name1 = domElements.player1NameInput.value.trim();
  const name2 = domElements.player2NameInput.value.trim();

  if (!name1 || (!name2 && gameState.gameMode === 'twoPlayers')) {
    alert('Please enter names for all players.');
    return;
  }

  gameState.player1Name = name1;
  gameState.player2Name = gameState.gameMode === 'vsComputer' ? 'Computer' : name2;

  domElements.player1Labels.forEach(el => {
    el.textContent = gameState.player1Name;
  });
  domElements.player2Labels.forEach(el => {
    el.textContent = gameState.player2Name;
  });

  domElements.status.textContent = `${gameState.currentPlayer === '1' ? gameState.player1Name : gameState.player2Name}'s turn`;

  domElements.splashScreen.style.display = 'none';
  domElements.gameContainer.style.display = 'flex';
  updateDifficultySelectorState();
  saveState();

  if (gameState.gameMode === 'vsComputer' && gameState.currentPlayer === '2') {
    triggerComputerMove();
  }
}

function handleCellClick(e) {
  const index = e.target.getAttribute('data-index');
  if (gameState.board[index] !== '' || !gameState.gameActive) return;

  gameState.board[index] = gameState.currentPlayer;
  e.target.textContent = gameState.currentPlayer === '1' ? gameState.player1Icon : gameState.player2Icon;

  const winResult = checkWin();
  if (winResult) {
    const winnerName = gameState.currentPlayer === '1' ? gameState.player1Name : gameState.player2Name;
    const result = `${winnerName} wins!`;
    domElements.status.textContent = result;
    gameState.gameActive = false;
    drawWinLine(winResult.condition);
    if (gameState.gameMode === 'twoPlayers' || (gameState.gameMode === 'vsComputer' && gameState.currentPlayer === '1')) {
      triggerConfetti();
    }
    if (gameState.currentPlayer === '1') {
      gameState.score1++;
      updateScoreDisplay();
    } else {
      gameState.score2++;
      updateScoreDisplay();
    }
    addToHistory(result);
    updateDifficultySelectorState();
    saveState();
    return;
  }

  if (gameState.board.every(cell => cell !== '')) {
    const result = "It's a draw!";
    domElements.status.textContent = result;
    gameState.gameActive = false;
    addToHistory(result);
    updateDifficultySelectorState();
    saveState();
    return;
  }

  gameState.currentPlayer = gameState.currentPlayer === '1' ? '2' : '1';
  domElements.status.textContent = `${gameState.currentPlayer === '1' ? gameState.player1Name : gameState.player2Name}'s turn`;

  if (gameState.gameMode === 'vsComputer' && gameState.currentPlayer === '2') {
    triggerComputerMove();
  }
}

function checkWin() {
  for (let condition of winConditions) {
    if (
      gameState.board[condition[0]] === gameState.currentPlayer &&
      gameState.board[condition[1]] === gameState.currentPlayer &&
      gameState.board[condition[2]] === gameState.currentPlayer
    ) {
      return { condition };
    }
  }
  return null;
}

// Draw the winning line with animation
function drawWinLine(condition) {
  const cellSize = window.innerWidth <= 600 ? 90 : 100; // Match CSS variables
  const gap = window.innerWidth <= 600 ? 4 : 5;

  const firstIndex = condition[0];
  const lastIndex = condition[2];
  const firstRow = Math.floor(firstIndex / 3); // Row of the first cell
  const firstCol = firstIndex % 3; // Column of the first cell
  const lastRow = Math.floor(lastIndex / 3); // Row of the last cell
  const lastCol = lastIndex % 3; // Column of the last cell

  // Calculate start and end coordinates (center of cells)
  const x1 = firstCol * (cellSize + gap) + cellSize / 2;
  const y1 = firstRow * (cellSize + gap) + cellSize / 2;
  const x2 = lastCol * (cellSize + gap) + cellSize / 2;
  const y2 = lastRow * (cellSize + gap) + cellSize / 2;

  // Calculate line length and angle
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

  // Apply styles to draw the line
  domElements.winLine.style.width = `${length}px`;
  domElements.winLine.style.height = `4px`;
  domElements.winLine.style.left = `${x1}px`;
  domElements.winLine.style.top = `${y1}px`;
  domElements.winLine.style.transform = `rotate(${angle}deg)`;
  domElements.winLine.style.transformOrigin = '0 0';
}

function addToHistory(result) {
  gameState.gameHistory.push(result);
  gameState.gameHistory = gameState.gameHistory.slice(-5);
  updateScoreboard();
}

function updateScoreboard() {
  domElements.historyList.innerHTML = '';
  gameState.gameHistory.forEach((result) => {
    const li = document.createElement('li');
    li.textContent = result;
    domElements.historyList.prepend(li);
  });
}

function updateScoreDisplay() {
  domElements.score1Elements.forEach(el => {
    el.textContent = gameState.score1;
  });
  domElements.score2Elements.forEach(el => {
    el.textContent = gameState.score2;
  });
}

function playAgain() {
  gameState.board = ['', '', '', '', '', '', '', '', ''];
  gameState.currentPlayer = gameState.lastStartingPlayer === '1' ? '2' : '1';
  gameState.lastStartingPlayer = gameState.currentPlayer;
  gameState.gameActive = true;
  domElements.status.textContent = `${gameState.currentPlayer === '1' ? gameState.player1Name : gameState.player2Name}'s turn`;
  domElements.cells.forEach(cell => {
    cell.textContent = '';
  });
  domElements.winLine.style.width = '0';
  domElements.winLine.style.height = '0';
  domElements.winLine.style.transform = 'none';
  updateDifficultySelectorState();

  if (gameState.gameMode === 'vsComputer' && gameState.currentPlayer === '2') {
    triggerComputerMove();
  }
}

function backToMenu() {
  gameState.board = ['', '', '', '', '', '', '', '', ''];
  gameState.currentPlayer = gameState.lastStartingPlayer === '1' ? '2' : '1';
  gameState.gameActive = true;
  domElements.splashScreen.style.display = 'flex';
  domElements.gameContainer.style.display = 'none';
  updateGameModeUI();
}

function resetScores() {
  gameState.gameHistory = [];
  gameState.score1 = 0;
  gameState.score2 = 0;
  updateScoreDisplay();
  updateScoreboard();
  updateDifficultySelectorState();
  saveState();
}

// Initialize the game
loadSavedState();
updateGameModeUI();