function computerMove(board, winConditions, difficulty) {
  // Helper function to check if a move wins for a given player
  function checkWinForPlayer(board, player, winConditions) {
    for (let condition of winConditions) {
      if (
        board[condition[0]] === player &&
        board[condition[1]] === player &&
        board[condition[2]] === player
      ) {
        return true;
      }
    }
    return false;
  }

  // Helper function to find a winning move for a given player
  function findWinningMove(board, player, winConditions) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        let tempBoard = [...board];
        tempBoard[i] = player;
        if (checkWinForPlayer(tempBoard, player, winConditions)) {
          return i;
        }
      }
    }
    return null;
  }

  // Helper function to get all available moves
  function getAvailableMoves(board) {
    let moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        moves.push(i);
      }
    }
    return moves;
  }

  // Helper function to select a random move from available moves
  function getRandomMove(board) {
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) return null;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Helper function to find a fork (move creating two winning opportunities)
  function findForkMove(board, player, winConditions) {
    const availableMoves = getAvailableMoves(board);
    for (let move of availableMoves) {
      let tempBoard = [...board];
      tempBoard[move] = player;
      let winningMoves = 0;

      // Check how many winning opportunities this move creates
      for (let i = 0; i < tempBoard.length; i++) {
        if (tempBoard[i] === '') {
          let testBoard = [...tempBoard];
          testBoard[i] = player;
          if (checkWinForPlayer(testBoard, player, winConditions)) {
            winningMoves++;
          }
        }
      }
      // A fork is a move that creates 2+ winning opportunities
      if (winningMoves >= 2) {
        return move;
      }
    }
    return null;
  }

  // Easy: Random move
  if (difficulty === 'easy') {
    return getRandomMove(board);
  }

  // Medium: Check for win or block, with a 40% chance of random move
  if (difficulty === 'medium') {
    let optimalMove = findWinningMove(board, '2', winConditions); // Check if computer can win
    if (optimalMove !== null) return optimalMove;

    optimalMove = findWinningMove(board, '1', winConditions); // Check if player can win, block them
    if (optimalMove !== null) return optimalMove;

    // 40% chance to make a random move instead of optimal
    if (Math.random() < 0.4) {
      return getRandomMove(board);
    }

    // Otherwise, try to take the center or a corner
    const preferredMoves = [4, 0, 2, 6, 8]; // Center, then corners
    for (let move of preferredMoves) {
      if (board[move] === '') return move;
    }

    return getRandomMove(board);
  }

  // Hard: Play optimally with randomness in the opening move
  if (difficulty === 'hard') {
    let optimalMove = findWinningMove(board, '2', winConditions); // Check if computer can win
    if (optimalMove !== null) return optimalMove;

    optimalMove = findWinningMove(board, '1', winConditions); // Check if player can win, block them
    if (optimalMove !== null) return optimalMove;

    // Check for a fork opportunity for the computer
    optimalMove = findForkMove(board, '2', winConditions);
    if (optimalMove !== null) return optimalMove;

    // Check for a fork opportunity for the player, block it
    optimalMove = findForkMove(board, '1', winConditions);
    if (optimalMove !== null) return optimalMove;

    // Count the number of moves made (non-empty cells)
    const movesMade = board.filter(cell => cell !== '').length;

    // First move: Randomize between center and corners for variety
    if (movesMade === 1) { // Player has made 1 move, this is computer's first move
      const strongMoves = [4, 0, 2, 6, 8]; // Center and corners
      const availableStrongMoves = strongMoves.filter(move => board[move] === '');
      if (availableStrongMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStrongMoves.length);
        return availableStrongMoves[randomIndex];
      }
    }

    // After the first move, prioritize the center for optimal play
    if (board[4] === '') return 4;

    // Take a random available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => board[corner] === '');
    if (availableCorners.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCorners.length);
      return availableCorners[randomIndex];
    }

    // If no corners available, take a random move
    return getRandomMove(board);
  }

  return getRandomMove(board);
}