// 1. Массив с цветами (8 пар)
const cardColors = [
    '#FF5733', '#FF5733', // Красный
    '#33FF57', '#33FF57', // Зеленый
    '#3357FF', '#3357FF', // Синий
    '#F3FF33', '#F3FF33', // Желтый
    '#FF33F3', '#FF33F3', // Розовый
    '#33FFF0', '#33FFF0', // Голубой
    '#A833FF', '#A833FF', // Фиолетовый
    '#FF9333', '#FF9333'  // Оранжевый
];

let chosenCards = [];
let board = document.getElementById('game-board');
let restartBtn = document.getElementById('restart-btn');

// 2. Функция перемешивания (Фишер-Йетс)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// 3. Создание игрового поля
function createBoard() {
    board.innerHTML = ''; // Очищаем поле от старых карточек
    chosenCards = [];
    
    let shuffledColors = shuffle([...cardColors]);

    for (let i = 0; i < shuffledColors.length; i++) {
        let card = document.createElement('div');
        card.classList.add('card');
        
        // Записываем цвет в память карточки (в data-атрибут)
        card.dataset.color = shuffledColors[i]; 
        
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    }
}

// 4. Логика переворота
function flipCard() {
    // Если карточка уже открыта, угадана или мы уже открываем две других — игнорируем клик
    if (this.classList.contains('flipped')  || this.classList.contains('matched') || chosenCards.length === 2) {
        return;
    }

    // При клике красим карточку в сохраненный цвет
    this.style.backgroundColor = this.dataset.color;
    this.classList.add('flipped');
    chosenCards.push(this);

    // Если открыто две карточки — проверяем их
    if (chosenCards.length === 2) {
        setTimeout(checkMatch, 600);
    }
}

// 5. Проверка совпадения
function checkMatch() {
    let card1 = chosenCards[0];
    let card2 = chosenCards[1];

    if (card1.dataset.color === card2.dataset.color) {
        // Если совпали
        card1.classList.add('matched');
        card2.classList.add('matched');
    } else {
        // Если не совпали — возвращаем исходный синий цвет рубашки
        card1.style.backgroundColor = '#007bff';
        card2.style.backgroundColor = '#007bff';
        
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    // Сбрасываем массив выбранных карт
    chosenCards = [];
}

// Привязываем кнопку перезапуска
restartBtn.addEventListener('click', createBoard);

// Запускаем игру первый раз
createBoard();