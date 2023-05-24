class ConnectFour {
  constructor() {
    this.board = document.querySelector('#gameTable');
    this.modalContainer = document.querySelector('#modal-container');
    this.modalMessage = document.querySelector('#modal-message');
    this.resetButton = document.querySelector('#reset');
    
    this.resetButton.onclick = () => {
      this.resetGame();
    };

    this.RED_TURN = 1;
    this.BLACK_TURN = 2;
    
    this.pieces = [
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0
    ];
    
    this.gameOver = false; 
    this.playerTurn = this.RED_TURN;
    this.hoverColumn = -1;
    this.animating = false;
    
    for (let i = 0; i < 42; i++) {
      let cell = document.createElement('div');
      cell.className = "cell";
      this.board.appendChild(cell);
      
      cell.onmouseenter = () => {
        this.onMouseEnterColumn(i % 7);
      }
      
      cell.onclick = () => {
        if (!this.animating) {
          this.onColumnClick(i % 7);
        }
      }
    }
    
    this.timerElement = document.getElementById("timer");
    this.timerElement.innerHTML = `Drop a Piece to Begin`;
    this.intervalId = null;
  }
  
  resetGame() {
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach((piece) => {
      piece.addEventListener("transitionend", () => {
        location.reload();
      });
      piece.classList.add("fall-out");
    });
    this.gameOver = false; // Reset game status
  }    
  
  onColumnClick(column) {
    this.startTimer();
    let openRow = this.pieces.filter((_, index) => index % 7 === column).lastIndexOf(0);
    if (openRow === -1) {
      return;
    }
    this.pieces[(openRow * 7) + column] = this.playerTurn;
    let cell = this.board.children[(openRow * 7) + column];
    
    let piece = document.createElement('div');
    piece.className = 'piece';
    piece.dataset.player = this.playerTurn;
    piece.dataset.placed = true;
    cell.appendChild(piece);

    let unplaced = document.querySelector("[data-placed='false']");
    if (unplaced) {
      let unplacedY = unplaced.getBoundingClientRect().y;
      let placedY = piece.getBoundingClientRect().y;
      let yDiff = unplacedY - placedY;

      this.animating = true;
      this.removeUnplaced();
      let animation = piece.animate(
        [
          { transform: `translateY(${yDiff}px)`, offset: 0 },
          { transform: `translateY(0px)`, offset: 0.5 },
          { transform: `translateY(${yDiff / 20}px)`, offset: 0.75 },
          { transform: `translateY(0px)`, offset: 1 },
        ],
        {
          duration: 400,
          easing: 'linear',
          iterations: 1,
        }
      );
      animation.addEventListener('finish', () => {
        this.checkGameEnd();
      });
    } else {
      this.checkGameEnd();
    }
  }

  checkGameEnd() {
    this.animating = false;

    if (!this.pieces.includes(0)) {
      this.displayModal("Tie");
    }

    if (this.playerWin(this.playerTurn, this.pieces)) {
      let winnerColor = this.playerTurn === this.RED_TURN ? "red" : "black";
      this.displayModal(`${winnerColor.toUpperCase()} WON !`, winnerColor);
    }

    this.playerTurn = this.playerTurn === this.RED_TURN ? this.BLACK_TURN : this.RED_TURN;
    this.updateHover();

    if (!this.gameOver) { // Only update the timer if the game is not over
      this.startTimer();
    }
  }

  playerWin(playerTurn, pieces) {
    for (let index = 0; index < 42; index++) {
      if (
        index % 7 < 4 &&//Check horizontal win at starting index
        pieces[index] === playerTurn &&
        pieces[index + 1] === playerTurn &&
        pieces[index + 2] === playerTurn &&
        pieces[index + 3] === playerTurn
      ) {
        this.highlightPieces([index, index + 1, index + 2, index + 3]);
        clearInterval(this.intervalId);
        return true;
      }

      if (
        index < 21 &&//Check vertical win at starting index
        pieces[index] === playerTurn &&
        pieces[index + 7] === playerTurn &&
        pieces[index + 14] === playerTurn &&
        pieces[index + 21] === playerTurn
      ) {
        this.highlightPieces([index, index + 7, index + 14, index + 21]);
        clearInterval(this.intervalId);
        return true;
      }

      if (
        index % 7 < 4 &&//Check diagonal win (top left to bottom right)
        index < 18 &&
        pieces[index] === playerTurn &&
        pieces[index + 8] === playerTurn &&
        pieces[index + 16] === playerTurn &&
        pieces[index + 24] === playerTurn
      ) {
        this.highlightPieces([index, index + 8, index + 16, index + 24]);
        clearInterval(this.intervalId);
        return true;
      }

      if (
        index % 7 >= 3 &&//Check diagonal win (top right to bottom left)
        index < 21 &&
        pieces[index] === playerTurn &&
        pieces[index + 6] === playerTurn &&
        pieces[index + 12] === playerTurn &&
        pieces[index + 18] === playerTurn
      ) {
        this.highlightPieces([index, index + 6, index + 12, index + 18]);
        clearInterval(this.intervalId);
        return true;
      }
    }

    return false;
}

  highlightPieces(indices) {
    indices.forEach(index => {
      this.board.children[index].firstChild.dataset.highlighted = true;
    });
  }

  displayModal(message, color) {
    this.modalContainer.style.display = "block";
    this.modalMessage.textContent = message;
    if (color) {
      this.modalMessage.style.color = color;
    }
    this.gameOver = true; // Set game status to "game over"
  }

  updateHover() {
    this.removeUnplaced();
    if (this.pieces[this.hoverColumn] === 0) {
      let cell = this.board.children[this.hoverColumn];
      let piece = document.createElement('div');
      piece.className = 'piece';
      piece.dataset.player = this.playerTurn;
      piece.dataset.placed = false;
      cell.appendChild(piece);
    }
  }

  removeUnplaced() {
    let unplaced = document.querySelector("[data-placed='false']");
    if (unplaced) {
      unplaced.parentElement.removeChild(unplaced);
    }
  }

  onMouseEnterColumn(column) {
    this.hoverColumn = column;
    if (!this.animating) {
      this.updateHover();
    }
  }

  startTimer() {
    let seconds = 10;
    let countdown = seconds;
    this.timerElement.innerHTML = `auto move in: ${countdown} s`;

    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      countdown--;
      if (!this.gameOver) { // Only update the timer if the game is not over
        this.timerElement.innerHTML = `auto move in: ${countdown} s`;
      }

      if (countdown <= 0) {
        clearInterval(this.intervalId);
        if (!this.gameOver) { // Only make a random move if the game is not over
          this.makeRandomMove();
        }
      }
    }, 1000);
  }

  makeRandomMove() {
    const validCols = this.getOpenCols();
    if (validCols.length === 0) {
      return;
    }
    const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
    this.onColumnClick(randomCol);
  }

  getOpenCols() {
    const openCols = [];
    for (let column = 0; column < 7; column++) {
      const openCol = this.pieces.filter((_, index) => index % 7 === column).lastIndexOf(0);
      if (openCol !== -1) {
        openCols.push(column);
      }
    }
    return openCols;
  }
  
}

const game = new ConnectFour();
