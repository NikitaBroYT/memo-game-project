const cardColors = [
    '#FF5733', '#FF5733',
    '#33FF57', '#33FF57',
    '#3357FF', '#3357FF',
    '#F3FF33', '#F3FF33',
    '#FF33F3', '#FF33F3',
    '#33FFF0', '#33FFF0',
    '#A833FF', '#A833FF',
    '#FF9333', '#FF9333'
];

let chosenCards = [];
let board = document.getElementById('game-board');
let restartBtn = document.getElementById('restart-btn');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function createBoard() {
    board.innerHTML = '';
    chosenCards = [];
    
    let shuffledColors = shuffle([...cardColors]);

    for (let i = 0; i < shuffledColors.length; i++) {
        let card = document.createElement('div');
        card.classList.add('card');

        card.dataset.color = shuffledColors[i]; 
        
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    }
}

function flipCard() {
    if (this.classList.contains('flipped')  || this.classList.contains('matched') || chosenCards.length === 2) {
        return;
    }

    this.style.backgroundColor = this.dataset.color;
    this.classList.add('flipped');
    chosenCards.push(this);

    if (chosenCards.length === 2) {
        setTimeout(checkMatch, 600);
    }
}

function checkMatch() {
    let card1 = chosenCards[0];
    let card2 = chosenCards[1];

    if (card1.dataset.color === card2.dataset.color) {
        card1.classList.add('matched');
        card2.classList.add('matched');
    } else {
        card1.style.backgroundColor = '#007bff';
        card2.style.backgroundColor = '#007bff';
        
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    chosenCards = [];
}

restartBtn.addEventListener('click', createBoard);

createBoard();