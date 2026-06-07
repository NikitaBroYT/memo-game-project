class MemoryGame {
    constructor() {
        this.cardPacks = {
            emoji: ['😀', '🐱', '🍏', '⚽', '🚗', '🚀', '🔥', '👑', '👻', '🍕', '💎', '🎨', '🎸', '👾', '🌵', '🐼', '🌍', '🍿', '💡', '🛸', '👑', '🦊', '🍉', '🎈', '⚡', '⛄', '⚓', '🛸', '🛰️', '🚲', '🚕', '🚁'],
            minecraft: ['💎', '🟩', '🧱', '🪵', '⚔️', '🍎', '🐷', '🧟', '👁️', '🏹', '🧪', '🔥', '🪓', '🥖', '🐮', '🐑', '🕸️', '🌋', '🧭', '🔔', '🗺️', '🥚', '🍪', '🎒', '🛡️', '📦', '⛏️', '🥩', '🌾', '🍉', '🦴', '🎣'],
            poker: ['♠️', '♥️', '♦️', '♣️', '🃏', '👑', '👑', '🏰', '🛡️', '⚔️', '💰', '🌟', '🔑', '🔓', '💎', '🎲', '🎯', '🎸', '🎨', '🧩', '🍿', '🥤', '🍕', '🍩', '🍫', '🍧', '🍦', '🍹', '🍷', '🥂', '🥃', '🍸']
        };

        this.currentPack = localStorage.getItem('selected_pack') || 'emoji';
        this.currentShirt = localStorage.getItem('selected_shirt') || 'blue';

        this.board = document.getElementById('game-board');
        this.sizeSelect = document.getElementById('size-select');
        this.timerText = document.getElementById('timer');
        this.movesText = document.getElementById('moves');
        this.bestScoreText = document.getElementById('best-score');
        this.quoteBox = document.getElementById('quote-box');
        this.comboText = document.getElementById('combo-text');

        this.timeLimitText = document.getElementById('time-limit');
        this.movesLimitText = document.getElementById('moves-limit');
        this.hardModeBtn = document.getElementById('hard-mode-btn');

        this.chosenCards = [];
        this.moves = 0;
        this.seconds = 0;
        this.timerInterval = null;
        this.isGameStarted = false;

        this.comboCount = 0;
        this.isSoundEnabled = localStorage.getItem('sound_enabled') === 'true';
        this.isHardModeUnlocked = localStorage.getItem('hard_mode_unlocked') === 'true';
        this.isHardModeActive = false;

        this.initTheme();
        this.initSoundToggle();
        this.initHardMode();
        this.initShop();
        this.loadBestScore();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    initSoundToggle() {
        const btn = document.getElementById('sound-toggle');
        if (btn) {
            btn.innerText = this.isSoundEnabled ? '🔊' : '🔇';
            btn.addEventListener('click', () => {
                this.isSoundEnabled = !this.isSoundEnabled;
                localStorage.setItem('sound_enabled', this.isSoundEnabled);
                btn.innerText = this.isSoundEnabled ? '🔊' : '🔇';
                if (this.isSoundEnabled) this.playSound(440, 'sine', 0.05);
            });
        }
    }

    playSound(frequency, type = 'sine', duration = 0.1) {
        if (!this.isSoundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) { console.log("Звук заблокирован"); }
    }

    playSystemSound(event) {
        if (event === 'flip') this.playSound(600, 'sine', 0.08);
        if (event === 'match') { this.playSound(523.25, 'triangle', 0.15); setTimeout(() => this.playSound(659.25, 'triangle', 0.15), 100); }
        if (event === 'error') this.playSound(180, 'sawtooth', 0.25);
        if (event === 'combo') this.playSound(880, 'sine', 0.2);
        if (event === 'click') this.playSound(700, 'sine', 0.05);
    }

    initHardMode() {
        if (!this.hardModeBtn) return;
        if (this.isHardModeUnlocked) {
            this.hardModeBtn.classList.remove('locked');
            this.hardModeBtn.innerText = 'Обычный';
            this.hardModeBtn.title = 'Включить хардмод';
        }

        this.hardModeBtn.addEventListener('click', () => {
            if (!this.isHardModeUnlocked) return;
            this.isHardModeActive = !this.isHardModeActive;
            if (this.isHardModeActive) {
                this.hardModeBtn.classList.add('active');
                this.hardModeBtn.innerText = '🔥 ХАРДМОД';
            } else {
                this.hardModeBtn.classList.remove('active');
                this.hardModeBtn.innerText = 'Обычный';
            }
            this.createBoard();
        });
    }

    getHardModeLimits(size) {
        if (size === 4) return { time: 45, moves: 25 };
        if (size === 6) return { time: 150, moves: 75 };
        return { time: 300, moves: 160 };
    }

    initShop() {
        const modal = document.getElementById('shop-modal');
        const openBtn = document.getElementById('shop-btn');
        const closeBtn = document.getElementById('close-shop');
        const viewport = document.querySelector('.shop-viewport');
        const thumb = document.getElementById('shop-thumb');
        const container = document.querySelector('.shop-scrollbar-container');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                if (localStorage.getItem('hard_mode_win') === 'true') {
                    const redShirt = document.getElementById('red-shirt-item');
                    if (redShirt) {
                        redShirt.classList.remove('locked');
                        redShirt.querySelector('.item-preview').innerText = '';
                        redShirt.querySelector('.item-status').innerText = localStorage.getItem('selected_shirt') === 'red' ? 'Выбрано' : 'Доступно';
                    }
                }
                if (modal) {
                    modal.classList.remove('hidden');
                    setTimeout(() => this.updateShopScrollbar(), 50);
                }
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
        }
        if (modal) {
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
        }

        if (viewport) {
            viewport.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    viewport.scrollLeft += e.deltaY * 1.2;
                }
            });

            viewport.addEventListener('scroll', () => {
                this.updateShopScrollbar();

                const tabs = document.querySelectorAll('.tab-btn');
                const cardsSection = document.getElementById('cards-section');
                if (cardsSection && tabs.length >= 2) {
                    if (viewport.scrollLeft >= cardsSection.offsetWidth / 2) {
                        tabs[0].classList.remove('active');
                        tabs[1].classList.add('active');
                    } else {
                        tabs[1].classList.remove('active');
                        tabs[0].classList.add('active');
                    }
                }
            });
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const target = document.getElementById(e.target.dataset.target);
                if (target && viewport) {
                    const targetScrollLeft = e.target.dataset.target === 'cards-section' ? 0 : target.offsetLeft - 25;
                    viewport.scrollLeft = targetScrollLeft;
                }
            });
        });

        let isDragging = false;
        let startX;

        if (thumb && container && viewport) {
            thumb.addEventListener('mousedown', (e) => {
                isDragging = true;
                thumb.classList.add('dragging');
                startX = e.pageX - thumb.offsetLeft;
                e.preventDefault();
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                let maxLeft = container.offsetWidth - thumb.offsetWidth;
                let left = e.pageX - startX;

                if (left < 0) left = 0;
                if (left > maxLeft) left = maxLeft;

                thumb.style.left = left + 'px';

                let scrollPercent = left / maxLeft;
                let maxScroll = viewport.scrollWidth - viewport.clientWidth;
                viewport.scrollLeft = scrollPercent * maxScroll;
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    thumb.classList.remove('dragging');
                }
            });
        }

        document.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('locked')) return;

                this.playSystemSound('click');

                const type = item.dataset.type;
                const id = item.dataset.id;

                if (type === 'pack') {
                    this.currentPack = id;
                    localStorage.setItem('selected_pack', id);
                } else {
                    this.currentShirt = id;
                    localStorage.setItem('selected_shirt', id);
                }

                document.querySelectorAll(`.shop-item[data-type="${type}"]`).forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.item-status').innerText = 'Доступно';
                });
                item.classList.add('active');
                item.querySelector('.item-status').innerText = 'Выбрано';

                this.createBoard();
            });
        });
    }

    updateShopScrollbar() {
        const viewport = document.querySelector('.shop-viewport');
        const thumb = document.getElementById('shop-thumb');
        const container = document.querySelector('.shop-scrollbar-container');
        if (!viewport || !thumb || !container) return;

        let maxScroll = viewport.scrollWidth - viewport.clientWidth;
        if (maxScroll <= 0) return;

        let scrollPercent = viewport.scrollLeft / maxScroll;
        let maxLeft = container.offsetWidth - thumb.offsetWidth;
        thumb.style.left = (scrollPercent * maxLeft) + 'px';
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updateTimer() {
        if (this.isHardModeActive) {
            this.seconds--;
            if (this.seconds <= 0) {
                this.gameOver("Время истекло!");
                return;
            }
        } else {
            this.seconds++;
        }
        this.renderTimer();
    }

    renderTimer() {
        if (!this.timerText) return;
        let absSecs = Math.abs(this.seconds);
        let mins = Math.floor(absSecs / 60);
        let secs = absSecs % 60;
        this.timerText.innerText = (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
    }

    resetStats() {
        clearInterval(this.timerInterval);
        this.moves = 0;
        this.comboCount = 0;
        this.isGameStarted = false;
        if (this.movesText) this.movesText.innerText = '0';
        if (this.comboText) {
            this.comboText.innerText = '';
            this.comboText.classList.remove('show');
        }
        if (this.quoteBox) this.quoteBox.innerText = '';

        let size = parseInt(this.sizeSelect.value);
        if (this.isHardModeActive) {
            let limits = this.getHardModeLimits(size);
            this.seconds = limits.time;
            if (this.timeLimitText) this.timeLimitText.innerText = ` / макс: ${limits.time}с`;
            if (this.movesLimitText) this.movesLimitText.innerText = ` / макс: ${limits.moves}`;
        } else {
            this.seconds = 0;
            if (this.timeLimitText) this.timeLimitText.innerText = '';
            if (this.movesLimitText) this.movesLimitText.innerText = '';
        }
        this.renderTimer();
    }

    loadBestScore() {
        if (!this.bestScoreText) return;
        const size = this.sizeSelect.value;
        const modeSuffix = this.isHardModeActive ? '_hard' : '';
        const localRecord = localStorage.getItem(`best_score_${size}${modeSuffix}`);
        this.bestScoreText.innerText = localRecord ? localRecord : '--:--';
    }

    createBoard() {
        if (!this.board || !this.sizeSelect) return;
        this.board.innerHTML = '';
        this.chosenCards = [];
        this.resetStats();
        this.loadBestScore();

        let size = parseInt(this.sizeSelect.value);
        let totalCards = size * size;
        let pairsCount = totalCards / 2;

        let activeArray = this.cardPacks[this.currentPack];
        let selectedItems = activeArray.slice(0, pairsCount);
        let gameValues = this.shuffle([...selectedItems, ...selectedItems]);

        // ПРАВКА: Принудительное управление сеткой через JS
        this.board.style.display = 'grid';
        this.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        this.board.style.gap = size > 6 ? '2px' : '5px'; // Уменьшили зазор для 8х8

        for (let i = 0; i < gameValues.length; i++) {
            let card = document.createElement('div');
            card.classList.add('card');
            if (this.currentShirt === 'red') card.classList.add('red-pack');
            card.dataset.value = gameValues[i];
            card.dataset.index = i;
            card.innerText = gameValues[i];

            // Скрываем контент до flip
            card.style.fontSize = '0px';

            card.addEventListener('click', (e) => this.flipCard(e.target));
            this.board.appendChild(card);
        }
    }

    flipCard(cardElement) {
        if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched') || this.chosenCards.length === 2) {
            return;
        }

        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }

        this.playSystemSound('flip');
        cardElement.classList.add('flipped');

        let size = parseInt(this.sizeSelect.value);
        // Динамический размер шрифта для того, чтобы всё влезло
        cardElement.style.fontSize = size >= 8 ? '16px' : (size === 6 ? '24px' : '32px');

        this.chosenCards.push(cardElement);

        if (this.chosenCards.length === 2) {
            this.moves++;
            if (this.movesText) this.movesText.innerText = this.moves;

            if (this.isHardModeActive) {
                let limits = this.getHardModeLimits(size);
                if (this.moves > limits.moves) {
                    setTimeout(() => this.gameOver("Лимит ходов превышен!"), 500);
                    return;
                }
            }
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        let [card1, card2] = this.chosenCards;

        if (card1.dataset.value === card2.dataset.value && card1.dataset.index !== card2.dataset.index) {
            card1.classList.add('matched', 'pulse');
            card2.classList.add('matched', 'pulse');

            this.comboCount++;
            if (this.comboCount >= 2) {
                if (this.comboText) {
                    this.comboText.innerText = `🔥 КОМБО Х${this.comboCount}!`;
                    this.comboText.classList.add('show');
                }
                this.playSystemSound('combo');
            } else {
                this.playSystemSound('match');
            }
            this.checkWin();
        } else {
            card1.classList.add('shake');
            card2.classList.add('shake');
            this.playSystemSound('error');
            this.comboCount = 0;
            if (this.comboText) this.comboText.classList.remove('show');

            setTimeout(() => {
                card1.classList.remove('flipped', 'shake');
                card2.classList.remove('flipped', 'shake');
                card1.style.fontSize = '0px';
                card2.style.fontSize = '0px';
            }, 400);
        }
        this.chosenCards = [];
    }

    gameOver(reason) {
        clearInterval(this.timerInterval);
        this.playSystemSound('error');
        if (this.quoteBox) this.quoteBox.innerText = `❌ Проигрыш: ${reason}`;
        document.querySelectorAll('.card').forEach(c => c.style.pointerEvents = 'none');
    }

    checkWin() {
        let size = parseInt(this.sizeSelect.value);
        let totalCards = size * size;
        let allMatched = document.querySelectorAll('.card.matched').length === totalCards;

        if (allMatched) {
            clearInterval(this.timerInterval);

            if (!this.isHardModeUnlocked) {
                this.isHardModeUnlocked = true;
                localStorage.setItem('hard_mode_unlocked', 'true');
                if (this.hardModeBtn) {
                    this.hardModeBtn.classList.remove('locked');
                    this.hardModeBtn.innerText = 'Обычный';
                }
            }

            if (this.isHardModeActive) {
                localStorage.setItem('hard_mode_win', 'true');
            }

            this.saveRecord();
            this.fetchCelebrationQuote();
        }
    }

    saveRecord() {
        if (!this.sizeSelect || !this.timerText) return;
        const size = this.sizeSelect.value;
        const modeSuffix = this.isHardModeActive ? '_hard' : '';
        const currentRecord = localStorage.getItem(`best_score_${size}${modeSuffix}`);
        const currentTimeStr = this.timerText.innerText;

        if (!this.isHardModeActive) {
            if (!currentRecord || currentTimeStr < currentRecord) {
                localStorage.setItem(`best_score_${size}`, currentTimeStr);
                if (this.bestScoreText) this.bestScoreText.innerText = currentTimeStr + " (Новый рекорд!)";
            }
        } else {
            if (!currentRecord || currentTimeStr > currentRecord) {
                localStorage.setItem(`best_score_${size}_hard`, currentTimeStr);
                if (this.bestScoreText) this.bestScoreText.innerText = currentTimeStr + " (Хард Рекорд!)";
            }
        }
    }

    async fetchCelebrationQuote() {
        if (!this.quoteBox) return;
        try {
            this.quoteBox.innerText = "Загрузка победной цитаты...";
            const response = await fetch("./quotes.json");
            if (response.ok) {
                const quotes = await response.json();
                const randomIndex = Math.floor(Math.random() * quotes.length);
                const randomQuote = quotes[randomIndex];
                this.quoteBox.innerText = `"${randomQuote.text}" — ${randomQuote.author}`;
                if (this.isHardModeActive) {
                    this.quoteBox.innerText += " 🏆 Ачивка: Красная рубашка разблокирована в магазине!";
                }
            } else {
                this.quoteBox.innerText = "Поздравляем с победой!";
            }
        } catch (error) {
            this.quoteBox.innerText = "Поздравляем с победой!";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new MemoryGame();
    const restartBtn = document.getElementById("restart-btn");
    const sizeSelect = document.getElementById("size-select");

    if (restartBtn) restartBtn.addEventListener("click", () => game.createBoard());
    if (sizeSelect) sizeSelect.addEventListener("change", () => game.createBoard());

    game.createBoard();
});