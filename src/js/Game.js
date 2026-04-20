class Game {
    constructor(text) {
        this.text = text;
        this.state = 'idle'; // idle | running | paused | finished
        this.currentPos = 0;
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.startTime = null;
        this.statsInterval = null;

        this.overlay = document.getElementById('overlay');
        this.modal = document.getElementById('modal-pause');
        this.typingArea = document.getElementById('typing-area');
        this.progressBar = document.getElementById('progress-bar');

        this.keyboard = new KeyboardHandler();
        this.keyboard.onChar = (char) => this.handleChar(char);

        this.keyboard.start();
        this.renderText();
        this.bindGameEvents();
    }

    bindGameEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state === 'running') this.pause();
                else if (this.state === 'paused') this.resume();
            }
        });

        document.getElementById('btn-restart').addEventListener('click', () => this.restart());
        document.getElementById('btn-modal-restart').addEventListener('click', () => {
            this.hideResultModal();
            this.restart();
        });
    }

    start() {
        this.state = 'running';
        this.startTime = Date.now();
        this.keyboard.start();
        this.statsInterval = setInterval(() => this.updateStats(), 1000);
    }

    pause() {
        if (this.state !== 'running') return;
        this.state = 'paused';
        this.keyboard.stop();
        clearInterval(this.statsInterval);
        this.showPauseOverlay();
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'running';
        this.keyboard.start();
        this.statsInterval = setInterval(() => this.updateStats(), 1000);
        this.hidePauseOverlay();
    }

    finish() {
        this.state = 'finished';
        this.keyboard.stop();
        clearInterval(this.statsInterval);
        this.showResultModal();
    }

    restart() {
        clearInterval(this.statsInterval);
        this.keyboard.start();
        this.state = 'idle';
        this.currentPos = 0;
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.startTime = null;
        this.progressBar.style.width = '0%';
        document.getElementById('live-wpm').textContent = '0 зн/мин';
        document.getElementById('live-accuracy').textContent = '100%';
        this.renderText();
    }

    showResultModal() {
        const elapsedMin = (Date.now() - this.startTime) / 60000;
        const wpm = Math.round(this.currentPos / elapsedMin);
        const accuracy = this.totalKeystrokes > 0
            ? Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100)
            : 100;

        document.getElementById('final-wpm').textContent = wpm;
        document.getElementById('final-accuracy').textContent = accuracy;
        document.getElementById('result-modal').classList.remove('hidden');
    }

    hideResultModal() {
        document.getElementById('result-modal').classList.add('hidden');
    }

    showPauseOverlay() {
        this.overlay.style.visibility = 'visible';
        this.modal.style.display = 'block';
    }

    hidePauseOverlay() {
        this.overlay.style.visibility = 'hidden';
        this.modal.style.display = 'none';
    }

    updateProgress() {
        const percent = (this.currentPos / this.text.length) * 100;
        this.progressBar.style.width = percent + '%';
    }

    updateStats() {
        if (!this.startTime) return;

        const elapsedMin = (Date.now() - this.startTime) / 60000;
        const wpm = elapsedMin > 0 ? Math.round(this.currentPos / elapsedMin) : 0;
        const accuracy = this.totalKeystrokes > 0
            ? Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100)
            : 100;

        document.getElementById('live-wpm').textContent = wpm + ' зн/мин';
        document.getElementById('live-accuracy').textContent = accuracy + '%';
    }

    renderText() {
        this.typingArea.innerHTML = '';
        for (let i = 0; i < this.text.length; i++) {
            const span = document.createElement('span');
            span.classList.add('letter');
            span.textContent = this.text[i] === ' ' ? '\u00A0' : this.text[i];
            this.typingArea.appendChild(span);
        }
        this.updateCursor();
    }

    updateCursor() {
        const letters = this.typingArea.querySelectorAll('.letter');
        letters.forEach(l => l.classList.remove('current'));
        if (this.currentPos < letters.length) {
            letters[this.currentPos].classList.add('current');
        }
    }


    handleChar(char) {
        if (this.state === 'idle') this.start();
        if (this.state !== 'running') return;

        const letters = this.typingArea.querySelectorAll('.letter');
        if (this.currentPos >= letters.length) return;

        const expected = this.text[this.currentPos];
        const letterEl = letters[this.currentPos];

        this.totalKeystrokes++;

        if (char === expected) {
            letterEl.classList.remove('incorrect');
            letterEl.classList.add('correct');
            this.currentPos++;
            this.updateCursor();
            this.updateProgress();

            if (this.currentPos >= this.text.length) {
                this.finish();
            }
        } else {
            letterEl.classList.add('incorrect');
            this.errors++;
        }

        this.updateStats();
    }
}

const texts = [
    "Солнце садилось за горизонт, окрашивая небо в яркие оттенки оранжевого и розового цвета.",
    "Тихий ветер шелестел листьями деревьев, пока солнце медленно садилось за далёкий горизонт.",
    "Кот сидел на подоконнике и смотрел на улицу, где дети весело играли в снежки под снегопадом.",
    "Старый маяк стоял на скале уже много лет, указывая путь морякам в тёмные штормовые ночи.",
    "Горный ручей весело журчал среди камней, пробивая себе дорогу сквозь густой зелёный лес.",
    "Бабушка пекла пироги с яблоками, и запах свежей выпечки разносился по всему дому.",
    "Первый снег укрыл город белым одеялом, и улицы стали тихими и по-особому красивыми."
];

let game = new Game(texts[Math.floor(Math.random() * texts.length)]);
