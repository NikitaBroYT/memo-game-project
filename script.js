const cardColors = [
    '#FF0000', '#FF0000',
    '#00FF00', '#00FF00',
    '#FFFF00', '#FFFF00',
    '#FF00FF', '#FF00FF',
    '#00FFFF', '#00FFFF',
    '#800080', '#800080',
    '#FFA500', '#FFA500',
    '#000000', '#000000'
];

let chosenCards = [];
let board = document.getElementById('game-board');
let restartBtn = document.getElementById('restart-btn');

let timerText = document.getElementById('timer');
let movesText = document.getElementById('moves');

let moves = 0;
let seconds = 0;
let timerInterval = null;
let isGameStarted = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function updateTimer() {
    seconds++;
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timerText.innerText = 
        (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
}

function resetStats() {
    clearInterval(timerInterval);
    seconds = 0;
    moves = 0;
    isGameStarted = false;
    timerText.innerText = '00:00';
    movesText.innerText = '0';
}

function createBoard() {
    board.innerHTML = '';
    chosenCards = [];
    resetStats();
    
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
    if (this.classList.contains('flipped') || this.classList.contains('matched') || chosenCards.length === 2) {
        return;
    }

    if (!isGameStarted) {
        isGameStarted = true;
        timerInterval = setInterval(updateTimer, 1000);
    }

    this.style.backgroundColor = this.dataset.color;
    this.classList.add('flipped');
    chosenCards.push(this);

    if (chosenCards.length === 2) {
        moves++;
        movesText.innerText = moves;
        setTimeout(checkMatch, 600);
    }
}

function checkMatch() {
    let card1 = chosenCards[0];
    let card2 = chosenCards[1];

    if (card1.dataset.color === card2.dataset.color) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        let allMatched = document.querySelectorAll('.card.matched').length === cardColors.length;
        if (allMatched) {
            clearInterval(timerInterval);
            alert('Победа! Ходов: ' + moves + ', Время: ' + timerText.innerText);
        }
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