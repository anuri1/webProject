class Game {
    constructor() {
        this.state = 'idle'; // idle | running | paused | finished
        this.currentPos = 0;
        this.overlay = document.getElementById('overlay');
        this.modal = document.getElementById('modal');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.state === 'idle') {
                this.start();
            }

            if (e.key === 'Escape' && this.state === 'running') {
                this.pause();
                return;
            }
            if (e.key === 'Escape' && this.state === 'paused') {
                this.resume();
                return;
            }
        });
    }

    start() {
        this.state = 'running';
    }

    pause() {
        this.state = 'paused';
        this.showPauseOverlay();
    }

    resume() {
        this.state = 'running';
        this.hidePauseOverlay();
    }

    finish() {
        this.state = 'finished';
    }

    showPauseOverlay() {
        this.overlay.style.visibility = 'visible';
        this.modal.style.display = 'block';
    }

    hidePauseOverlay() {
        this.overlay.style.visibility = 'hidden';
        this.modal.style.display = 'none';
    }
}

let game = new Game();
