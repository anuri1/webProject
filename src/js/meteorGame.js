class meteorGame extends Game {
    constructor(text) {
        super(text);

        this.meteors = [];
        this.letterQueue = text.split('').filter(c => c.trim() !== '');
        this.queueIndex = 0;
        this.processedCount = 0;
        this.lives = 5;
        this.maxLives = 5;
        this.spawnDelay = 1300;
        this.baseSpeed = 50;
        this.spawnTimerId = null;
        this.animFrameId = null;
        this.finishTimerId = null;
        this.lastTimestamp = null;
        this.won = false;

        this.setupMeteorField();
        this.bindExtraEvents();
    }

    renderText() {}

    updateCursor() {}

    setupMeteorField() {
        const container = document.querySelector('.game-container');

        this.meteorField = document.createElement('div');
        this.meteorField.className = 'meteor-field';
        container.appendChild(this.meteorField);

        this.particleLayer = document.createElement('div');
        this.particleLayer.className = 'particle-layer';
        this.particleLayer.setAttribute('aria-hidden', 'true');

        const particles = [
            { x: '8%',  size: '12px', dur: '11s', delay: '-2s',  drift: '20px' },
            { x: '22%', size: '23px', dur: '14s', delay: '-7s',  drift: '-15px' },
            { x: '37%', size: '12px', dur: '10s', delay: '-4s',  drift: '10px' },
            { x: '55%', size: '34px', dur: '16s', delay: '-10s', drift: '-25px' },
            { x: '71%', size: '22px', dur: '12s', delay: '-6s',  drift: '18px' },
            { x: '86%', size: '23px', dur: '15s', delay: '-12s', drift: '-12px' },
            { x: '14%', size: '12px', dur: '17s', delay: '-9s',  drift: '-18px' },
            { x: '63%', size: '13px', dur: '10s', delay: '-5s',  drift: '-42px' },
            { x: '12%', size: '23px', dur: '11s', delay: '-9s',  drift: '32px' },
            { x: '30%', size: '13px', dur: '12s', delay: '-5s',  drift: '-32px' },
            { x: '6%', size: '33px', dur: '13s', delay: '-3s',  drift: '2px' },
            { x: '20%', size: '13px', dur: '16s', delay: '-4s',  drift: '-40px' },
            { x: '35%', size: '25px', dur: '13s', delay: '-6s',  drift: '48px' },
        ];

        particles.forEach((p) => {
            const particle = document.createElement('span');

            particle.style.setProperty('--x', p.x);
            particle.style.setProperty('--size', p.size);
            particle.style.setProperty('--dur', p.dur);
            particle.style.setProperty('--delay', p.delay);
            particle.style.setProperty('--drift', p.drift);

            this.particleLayer.appendChild(particle);
        });

        this.meteorField.appendChild(this.particleLayer);

        this.dangerEl = document.createElement('div');
        this.dangerEl.className = 'danger-zone';
        this.meteorField.appendChild(this.dangerEl);

        this.hintEl = document.createElement('p');
        this.hintEl.className = 'field-hint';
        this.hintEl.textContent = 'Начните печатать, чтобы запустить метеоритный дождь…';
        this.meteorField.appendChild(this.hintEl);

        this.livesEl = document.createElement('div');
        this.livesEl.className = 'lives-container';
        const accuracyBox = document.querySelector('.live-stats .stat-box:last-child');
        document.querySelector('.live-stats').insertBefore(this.livesEl, accuracyBox);

        this.renderLives();
    }

    bindExtraEvents() {
        const nextBtn = document.getElementById('btn-next-level');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                window.location.href = '../level3/level3.html';
            });
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.state === 'running') this.pause();
            } else {
                if (this.state === 'paused') this.resume();
            }
        });
    }

    renderLives() {
        if (!this.livesEl) return;
        this.livesEl.innerHTML = '';
        for (let i = 0; i < this.maxLives; i++) {
            const h = document.createElement('span');
            h.className = `life ${i < this.lives ? 'active' : 'lost'}`;
            h.textContent = '♥';
            this.livesEl.appendChild(h);
        }
    }

    start() {
        if (this.hintEl) { this.hintEl.style.display = 'none'; }
        this.state = 'running';
        this.startTime = Date.now();
        this.keyboard.start();
        this.statsInterval = setInterval(() => this.updateStats(), 1000);

        this.spawnMeteor();
        this.spawnTimerId = setInterval(() => this.spawnMeteor(), this.spawnDelay);
        this.animFrameId = requestAnimationFrame(ts => this.gameLoop(ts));
    }

    pause() {
        if (this.state !== 'running') return;
        this.state = 'paused';
        this.pausedAt = Date.now();
        this.keyboard.stop();
        clearInterval(this.statsInterval);
        clearInterval(this.spawnTimerId);
        cancelAnimationFrame(this.animFrameId);
        this.lastTimestamp = null;
        this.showPauseOverlay();
    }

    resume() {
        if (this.state !== 'paused') return;
        this.state = 'running';
        this.startTime += Date.now() - this.pausedAt;
        this.keyboard.start();

        console.log('startTime после resume:', this.startTime);
        console.log('pausedAt:', this.pausedAt);

        this.statsInterval = setInterval(() => this.updateStats(), 1000);
        if (this.queueIndex < this.letterQueue.length) {
            this.spawnTimerId = setInterval(() => this.spawnMeteor(), this.spawnDelay);
        }
        this.animFrameId = requestAnimationFrame(ts => this.gameLoop(ts));
        this.hidePauseOverlay();
    }

    finish() {
        this.state = 'finished';
        this.keyboard.stop();
        clearInterval(this.statsInterval);
        clearInterval(this.spawnTimerId);
        cancelAnimationFrame(this.animFrameId);

        for (const m of this.meteors) {
            m.el.classList.add(this.won ? 'clear' : 'crash');
            setTimeout(() => m.el.remove(), 600);
        }
        this.meteors = [];

        this.finishTimerId = setTimeout(() => this.showResultModal(), 500);
    }

    restart() {
        clearInterval(this.statsInterval);
        clearInterval(this.spawnTimerId);
        cancelAnimationFrame(this.animFrameId);
        clearTimeout(this.finishTimerId);

        for (const m of this.meteors) m.el.remove();
        this.meteorField.querySelectorAll('.hit-burst, .meteor').forEach(el => el.remove());

        this.meteors = [];
        this.queueIndex = 0;
        this.processedCount = 0;
        this.lives = this.maxLives;
        this.errors = 0;
        this.totalKeystrokes = 0;
        this.startTime = null;
        this.lastTimestamp = null;
        this.state = 'idle';
        this.currentPos = 0;
        this.won = false;
        this.baseSpeed = 50;
        this.spawnDelay = 1300;
        this.pausedAt = null;

        if (this.hintEl) { this.hintEl.style.display = ''; }

        this.progressBar.style.width = '0%';
        const wpmEl = document.getElementById('live-wpm');
        const accEl = document.getElementById('live-accuracy');
        if (wpmEl) wpmEl.textContent = '0 зн/мин';
        if (accEl) accEl.textContent = '100%';

        this.renderLives();

        const btn = document.getElementById('btn-save');
        if (btn) { btn.textContent = 'Сохранить результат'; btn.disabled = false; }
        const inp = document.getElementById('player-name');
        if (inp) inp.value = '';

        this.keyboard.start();
    }

    spawnMeteor() {
        if (this.state !== 'running') return;
        if (this.queueIndex >= this.letterQueue.length) {
            clearInterval(this.spawnTimerId);
            return;
        }

        const char = this.letterQueue[this.queueIndex++];
        const fieldW = 800;
        const x = 30 + Math.random() * Math.max(fieldW - 80, 50);
        const speed = this.baseSpeed;
        this.baseSpeed += 5
        this.spawnDelay -= 5

        const el = document.createElement('div');
        el.className = 'meteor';
        el.textContent = char;
        el.style.left = x + 'px';
        el.style.top = '-52px';

        this.meteorField.appendChild(el);
        this.meteors.push({ el, char, x, y: -52, speed });
    }

    gameLoop(timestamp) {
        if (this.state !== 'running') return;

        const dt = this.lastTimestamp
            ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.05)
            : 0.016;
        this.lastTimestamp = timestamp;

        const fieldH = this.meteorField.clientHeight;
        const missed = [];

        for (const m of this.meteors) {
            m.y += m.speed * dt;
            m.el.style.top = Math.round(m.y) + 'px';
            if (m.y > fieldH) missed.push(m);
        }

        for (const m of missed) {
            m.el.remove();
            this.meteors = this.meteors.filter(x => x !== m);
            if (!this.loseLife()) return;
        }

        if (this.queueIndex >= this.letterQueue.length && this.meteors.length === 0) {
            this.won = true;
            this.finish();
            return;
        }

        this.animFrameId = requestAnimationFrame(ts => this.gameLoop(ts));
    }

    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.renderLives();

        if (this.lives <= 0) {
            this.finish();
            return false;
        }
        return true;
    }

    handleChar(char) {
        if (this.state === 'idle') this.start();
        if (this.state !== 'running') return;

        this.totalKeystrokes++;

        const match = this.meteors
            .filter(m => m.char === char)
            .sort((a, b) => b.y - a.y)[0];

        if (match) {
            this.showHitEffect(match.x, match.y, char);
            match.el.remove();
            this.meteors = this.meteors.filter(m => m !== match);
            this.processedCount++;
            this.currentPos = this.processedCount;
            this.updateProgress();
        } else {
            this.errors++;
            this.flashErrorOnMeteors();
        }

        this.updateStats();
    }

    updateStats() {
        if (!this.startTime) return;

        const now = this.state === 'paused' ? this.pausedAt : Date.now();
        const elapsedMin = (now - this.startTime) / 60000;
        const wpm = elapsedMin > 0 ? Math.round(this.processedCount / elapsedMin) : 0;
        const accuracy = this.totalKeystrokes > 0
            ? Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100)
            : 100;

        document.getElementById('live-wpm').textContent = wpm + ' зн/мин';
        document.getElementById('live-accuracy').textContent = accuracy + '%';
        console.log('now:', now, 'startTime:', this.startTime, 'разница мс:', now - this.startTime);
    }

    showHitEffect(x, y, char) {
        const burst = document.createElement('div');
        burst.className = 'hit-burst';
        burst.textContent = char;
        burst.style.left = x + 'px';
        burst.style.top = Math.max(0, y) + 'px';
        this.meteorField.appendChild(burst);
        burst.addEventListener('animationend', () => burst.remove(), { once: true });
    }

    flashErrorOnMeteors() {
        for (const m of this.meteors) m.el.classList.add('error');
        setTimeout(() => {
            for (const m of this.meteors) {
                if (m.el?.isConnected) m.el.classList.remove('error');
            }
        }, 380);
    }

    updateProgress() {
        const pct = (this.processedCount / this.letterQueue.length) * 100;
        this.progressBar.style.width = pct + '%';
    }

    showResultModal() {
        const elapsed = this.startTime ? (Date.now() - this.startTime) / 60000 : 0.001;
        const wpm = Math.round(this.processedCount / Math.max(elapsed, 0.001));
        const accuracy = this.totalKeystrokes > 0
            ? Math.round(((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100)
            : 100;

        const wpmEl = document.getElementById('final-wpm');
        const accEl = document.getElementById('final-accuracy');
        if (wpmEl) wpmEl.textContent = wpm;
        if (accEl) accEl.textContent = accuracy;

        const modal = document.getElementById('result-modal');
        const h2 = modal?.querySelector('h2');
        if (h2) h2.textContent = this.won ? 'Уровень пройден! 🎉' : 'Игра окончена 💥';
        modal?.classList.remove('hidden');
    }
}

const meteor_texts = [
    'Солнце садилось за горизонт окрашивая небо в яркие оттенки оранжевого и розового цвета.',
    'Тихий ветер шелестел листьями деревьев пока солнце медленно садилось за далёкий горизонт.',
    'Кот сидел на подоконнике и смотрел на улицу где дети весело играли в снежки под снегопадом.',
    'Старый маяк стоял на скале уже много лет указывая путь морякам в тёмные штормовые ночи.',
    'Горный ручей весело журчал среди камней пробивая себе дорогу сквозь густой зелёный лес.',
    'Бабушка пекла пироги с яблоками и запах свежей выпечки разносился по всему дому.',
    'Первый снег укрыл город белым одеялом и улицы стали тихими и по-особому красивыми.',
];

const meteor_game = new meteorGame(meteor_texts[Math.floor(Math.random() * meteor_texts.length)]);