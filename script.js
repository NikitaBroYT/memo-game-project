class MemoryGame {
    constructor() {
        this.themesArray = [
            "😀", "🐱", "🍏", "⚽", "🚗", "🚀", "🔥", "👑",
            "👻", "🍕", "💎", "🎨", "🎸", "👾", "🌵", "🐼",
            "🌍", "🍿", "💡", "🛸"
        ];

        this.board = document.getElementById("game-board");
        this.sizeSelect = document.getElementById("size-select");
        this.timerText = document.getElementById("timer");
        this.movesText = document.getElementById("moves");
        this.bestScoreText = document.getElementById("best-score");
        this.quoteBox = document.getElementById("quote-box");

        this.chosenCards = [];
        this.moves = 0;
        this.seconds = 0;
        this.timerInterval = null;
        this.isGameStarted = false;

        this.initTheme();
        this.loadBestScore();
    }

    initTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.getElementById("theme-toggle").addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updateTimer() {
        this.seconds++;
        let mins = Math.floor(this.seconds / 60);
        let secs = this.seconds % 60;
        this.timerText.innerText =
            (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
    }

    resetStats() {
        clearInterval(this.timerInterval);
        this.seconds = 0;
        this.moves = 0;
        this.isGameStarted = false;
        this.timerText.innerText = "00:00";
        this.movesText.innerText = "0";
        this.quoteBox.innerText = "";
    }

    loadBestScore() {
        const size = this.sizeSelect.value;
        const localRecord = localStorage.getItem(`best_score_${size}`);
        this.bestScoreText.innerText = localRecord ? localRecord : "--:--";
    }

    createBoard() {
        this.board.innerHTML = "";
        this.chosenCards = [];
        this.resetStats();
        this.loadBestScore();

        let size = parseInt(this.sizeSelect.value);
        let totalCards = size * size;
        let pairsCount = totalCards / 2;

        let selectedItems = this.themesArray.slice(0, pairsCount);
        let gameValues = [...selectedItems, ...selectedItems];
        let shuffledValues = this.shuffle(gameValues);

        this.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`; 
        this.board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        for (let i = 0; i < shuffledValues.length; i++) {
            let card = document.createElement("div");
            card.classList.add("card");
            card.dataset.value = shuffledValues[i];
            card.dataset.index = i;
            card.innerText = shuffledValues[i];
            card.addEventListener("click", (e) => this.flipCard(e.target));
            this.board.appendChild(card);
        }
    }

    flipCard(cardElement) {
        if (cardElement.classList.contains("flipped") || cardElement.classList.contains("matched") || this.chosenCards.length === 2) {
            return;
        }

        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }

        cardElement.classList.add("flipped");
        cardElement.style.color = "var(--text-color)";
        this.chosenCards.push(cardElement);

        if (this.chosenCards.length === 2) {
            this.moves++;
            this.movesText.innerText = this.moves;
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        let [card1, card2] = this.chosenCards;

        if (card1.dataset.value === card2.dataset.value && card1.dataset.index !== card2.dataset.index) {
            card1.classList.add("matched");
            card2.classList.add("matched");
            this.checkWin();
        } else {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            card1.style.color = "transparent";
            card2.style.color = "transparent";
        }
        this.chosenCards = [];
    }

    checkWin() {
        let size = parseInt(this.sizeSelect.value);
        let totalCards = size * size;
        let allMatched = document.querySelectorAll(".card.matched").length === totalCards;

        if (allMatched) {
            clearInterval(this.timerInterval);
            this.saveRecord();
            this.fetchCelebrationQuote();
        }
    }

    saveRecord() {
        const size = this.sizeSelect.value;
        const currentRecord = localStorage.getItem(`best_score_${size}`);
        const currentTimeStr = this.timerText.innerText;

        if (!currentRecord || currentTimeStr < currentRecord) {
            localStorage.setItem(`best_score_${size}`, currentTimeStr);
            this.bestScoreText.innerText = currentTimeStr + " (Новый рекорд!)";
        }
    }

    async fetchCelebrationQuote() {
        try {
            this.quoteBox.innerText = "Загрузка победной цитаты...";
            
            // Запрашиваем собственный локальный JSON-файл асинхронно
            const response = await fetch("./quotes.json");
            
            if (response.ok) {
                const quotes = await response.json();
                // Выбираем случайную цитату из нашего списка
                const randomIndex = Math.floor(Math.random() * quotes.length);
                const randomQuote = quotes[randomIndex];
                
                this.quoteBox.innerText = `"${randomQuote.text}" — ${randomQuote.author}`;
            } else {
                this.quoteBox.innerText = "Поздравляем с победой! Прекрасный результат!";
            }
        } catch (error) {
            this.quoteBox.innerText = "Поздравляем с победой! Рекорд зафиксирован.";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new MemoryGame();
    document.getElementById("restart-btn").addEventListener("click", () => game.createBoard());
    document.getElementById("size-select").addEventListener("change", () => game.createBoard());
    game.createBoard();
});