class KeyboardHandler {
    constructor() {
        this.isGameActive = false;
        this.onChar = null;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            this.handleKeyPress(e);
        });
    }

    handleKeyPress(e) {
        const key = e.key;

        if (this.isValidKey(key)) {
            e.preventDefault();
            if (this.onChar) this.onChar(key);
        }
    }

    isValidKey(key) {
        return /^[a-zA-Z0-9а-яА-ЯёЁ\s\.,!?;:'"()\-]$/.test(key) && key.length === 1;
    }

    start() {
        this.isGameActive = true;
    }

    stop() {
        this.isGameActive = false;
    }
}