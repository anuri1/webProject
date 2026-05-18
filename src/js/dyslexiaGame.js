class DyslexiaGame extends Game {
    constructor(text) {
        super(text);

        this.glitchInterval = null;

        this.fakeLetters = {
            'а': 'о',
            'о': 'а',
            'е': 'ё',
            'и': 'й',
            'п': 'т',
            'ш': 'щ',
            'ь': 'ъ',
            'с': 'з',
            'b': 'd',
            'd': 'b',
            'm': 'n'
        };

        this.enableMode();
    }

    enableMode() {
        this.typingArea.classList.add('dyslexia-mode');
    }

    start() {
        super.start();

        this.glitchInterval = setInterval(() => {
            this.distortText();
        }, 700);
    }

    finish() {
        clearInterval(this.glitchInterval);
        super.finish();
    }

    restart() {
        clearInterval(this.glitchInterval);
        super.restart();
    }

    renderText() {
        this.typingArea.innerHTML = '';

        for (let i = 0; i < this.text.length; i++) {
            const span = document.createElement('span');

            span.classList.add('letter');

            span.dataset.original = this.text[i];

            span.textContent =
                this.text[i] === ' '
                    ? '\u00A0'
                    : this.text[i];

            this.typingArea.appendChild(span);
        }

        this.updateCursor();
    }

    distortText() {
        if (this.state !== 'running') return;

        const letters = this.typingArea.querySelectorAll('.letter');

        letters.forEach((letter, index) => {

            if (index < this.currentPos) return;

            const original = letter.dataset.original;

            letter.textContent =
                original === ' '
                    ? '\u00A0'
                    : original;

            letter.classList.remove(
                'shake',
                'blur',
                'glitch'
            );

            if (Math.random() < 0.18) {

                const random = Math.random();

                if (
                    this.fakeLetters[original] &&
                    random < 0.45
                ) {
                    letter.textContent =
                        this.fakeLetters[original];
                }

                if (random < 0.8) {
                    letter.classList.add('shake');
                }

                if (random < 0.4) {
                    letter.classList.add('blur');
                }

                if (random < 0.2) {
                    letter.classList.add('glitch');
                }
            }
        });
    }

    handleChar(char) {
        super.handleChar(char);

        if (Math.random() < 0.25) {
            this.screenGlitch();
        }
    }

    screenGlitch() {
        document.body.classList.add('screen-glitch');

        setTimeout(() => {
            document.body.classList.remove('screen-glitch');
        }, 120);
    }
}

const dyslexiaTexts = [
    "Солнце садилось за горизонт окрашивая небо яркими цветами.",
    "Тихий ветер шелестел листьями деревьев поздним вечером.",
    "Старый маяк стоял на скале указывая путь кораблям.",
    "Горный ручей пробивался сквозь густой лес среди камней.",
    "Бабушка пекла пироги и аромат наполнял весь дом.",
    "Первый снег медленно укрывал улицы большого города."
];

const dyslexiaGame = new DyslexiaGame(
    dyslexiaTexts[
        Math.floor(Math.random() * dyslexiaTexts.length)
        ]
);