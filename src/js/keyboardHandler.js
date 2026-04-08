class KeyboardHandler {
    constructor() {
        this.currentInput = '';
        this.currentWordIndex = 0;
        this.isGameActive = false;
        this.onCharCorrect = null;
        this.onCharIncorrect = null;
        this.onWordComplete = null;
        this.onBackspace = null;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(e) {
        const key = e.key;

        if (key === 'Enter') {
            e.preventDefault();
            this.submitWord();
            return;
        }

        if (key === 'Backspace') {
            e.preventDefault();
            this.removeChar();
            return;
        }

        if (this.isValidKey(key)) {
            e.preventDefault();
            this.addChar(key);
        }
    }

    isValidKey(key) {
        const validKeys = /^[a-zA-Z0-9а-яА-ЯёЁ\s\.,!?;:'"()\-]$/;
        return validKeys.test(key) && key.length === 1;
    }

    addChar(char) {
        this.currentInput += char;
        this.checkCurrentChar(char);
        this.updateDisplay();
    }

    removeChar() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            if (this.onBackspace) this.onBackspace();
            this.updateDisplay();
        }
    }

    checkCurrentChar(char) {
        if (this.onCharCorrect) this.onCharCorrect(char);
    }

    submitWord() {
        if (this.currentInput.length === 0) return;

        if (this.onWordComplete) {
            this.onWordComplete(this.currentInput);
        }
        this.clearInput();
    }

    clearInput() {
        this.currentInput = '';
        this.updateDisplay();
    }

    updateDisplay() {
        const displayElement = document.getElementById('current-input');
        if (displayElement) {
            displayElement.textContent = this.currentInput;
        }
    }

    startGame() {
        this.isGameActive = true;
        this.currentInput = '';
        this.updateDisplay();
    }

    stopGame() {
        this.isGameActive = false;
    }
}