const board = document.querySelector('#gameTable');
const modalContainer = document.querySelector('#modal-container');
const modalMessage = document.querySelector('#modal-message');
const resetButton = document.querySelector('#reset');

resetButton.onclick = () => { 
    //check for animation to drop pieces out before reset
    const pieces = document.querySelectorAll('.piece');
    pieces.forEach((piece) => {
      piece.addEventListener("transitionend", () => {
        location.reload();
      });
      piece.classList.add("fall-out");
    });
  }

const RED_TURN = 1;
const BLACK_TURN = 2;

// 0 = empty 1 = red 2 = black
const pieces = [
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
];

let playerTurn = RED_TURN; // 1 =red 2 = black
let hoverColumn = -1;
let animating = false;

for (let i = 0; i < 42; i++) {
   let cell = document.createElement('div');
   cell.className = "cell";
   board.appendChild(cell);

   cell.onmouseenter = () => {
        onMouseEnterColumn(i % 7);
   } 
   //eventlistener for hovering over div
   // divs 0 to 41 % 7 = 0 to 6 which column we are in

    cell.onclick = () => {
     if(!animating) { //stop from spam placing
        onColumnClick(i % 7);
     }
  }

}

function onColumnClick(column) {
    let openRow = pieces.filter( (_, index) => index % 7 === column).lastIndexOf(0);
    if(openRow === -1){
        //no space in column
        return;
    }
    pieces[(openRow * 7) + column] = playerTurn;
    let cell = board.children[(openRow * 7) + column];

    let piece = document.createElement('div');
    piece.className = 'piece';
    piece.dataset.player = playerTurn;
    piece.dataset.placed = true;
    cell.appendChild(piece);

    let unplaced = document.querySelector("[data-placed='false']");
    let unplacedY = unplaced.getBoundingClientRect().y;
    let placedY = piece.getBoundingClientRect().y;
    let yDiff = unplacedY - placedY;

    animating = true;
    removeUnplaced();
    let animation = piece.animate(
        [
            { transform: `translateY(${yDiff}px)`, offset: 0},
            { transform: `translateY(0px)`, offset: .5},
            { transform: `translateY(${yDiff / 20}px)`, offset: .75},
            { transform: `translateY(0px)`, offset: 1}
        ],
        {
            duration: 400,
            easing: "linear",
            iterations: 1
        }
    )
    animation.addEventListener('finish', checkGameEnd)
}

function checkGameEnd() {
    animating = false;    
    
    //check tie
    if(!pieces.includes(0)){
        modalContainer.style.display = "block";
        modalMessage.textContent = "Tie";
    }

    //check if current player win
    if(playerWin(playerTurn, pieces)){
        modalContainer.style.display = "block";
        modalMessage.textContent = `${playerTurn === RED_TURN ? "Red" : "Black"} WON !`;
        const winnerColor = playerTurn === RED_TURN ? "red" : "black";
        modalMessage.style.color = winnerColor;
    }

    if(playerTurn === RED_TURN){
        playerTurn = BLACK_TURN;
    } else{
        playerTurn = RED_TURN;
    }
    updateHover();
}

function updateHover(){
    removeUnplaced();

    //add hover piece
    if(pieces[hoverColumn] === 0) {
   let cell = board.children[hoverColumn];
   let piece = document.createElement('div');
   piece.className = 'piece';
   piece.dataset.player = playerTurn;
   piece.dataset.placed = false;
   cell.appendChild(piece);
    }
}

function removeUnplaced(){
    let unplaced = document.querySelector("[data-placed='false']");
    if(unplaced) {
        unplaced.parentElement.removeChild(unplaced);
    }
}

function onMouseEnterColumn(column) {
    hoverColumn = column
    if(!animating){ // ingore hover when animating 
        updateHover();
    }
}

function playerWin(playerTurn, pieces){
    for (let index = 0; index < 42; index++) {
        //Check horizontal win at starting index
        if(
            index % 7 < 4 &&
            pieces[index] === playerTurn &&
            pieces[index + 1] === playerTurn &&
            pieces[index + 2] === playerTurn &&
            pieces[index + 3] === playerTurn 
            ) {
                return true;
        }
        //Check vertical win at starting index
        if(
            index < 21 &&
            pieces[index] === playerTurn &&
            pieces[index + 7] === playerTurn &&
            pieces[index + 14] === playerTurn &&
            pieces[index + 21] === playerTurn 
            ) {
                return true;
        }
        //Check diagonal win at starting index
        if(
            index % 7 < 4 &&
            index < 18 &&
            pieces[index] === playerTurn &&
            pieces[index + 8] === playerTurn &&
            pieces[index + 16] === playerTurn &&
            pieces[index + 24] === playerTurn 
            ) {
                return true;
        }
        //Check diagonal win(other direction) at starting index
        if(
            index % 7 >= 3 &&
            index < 21 &&
            pieces[index] === playerTurn &&
            pieces[index + 6] === playerTurn &&
            pieces[index + 12] === playerTurn &&
            pieces[index + 18] === playerTurn 
            ) {
                return true;
        }

    }
    return false;
}