const AudioController = {
    backgroundMusic: null,

    paths: {
        correct: '/src/audio/correct.mp3',
        incorrect: '/src/audio/incorrect.mp3',
        bg: {
            1: '../../audio/background_level1.mp3',
            2: '../../audio/background_level2.mp3',
            3: '../../audio/background_level3.mp3',
        }
    },

    playBackground(levelNumber) {
        this.stopBackground();

        if (this.paths.bg[levelNumber]) {
            this.backgroundMusic = new Audio(this.paths.bg[levelNumber]);
            this.backgroundMusic.loop = true; 
            this.backgroundMusic.volume = 0.4;

            this.backgroundMusic.play().catch(error => {
                console.log("Автовоспроизведение заблокировано браузером. Музыка включится после клика по экрану.");
            });
        }
    },
    
    stopBackground() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic = null;
        }
    },

    playCorrect() {
        const audio = new Audio(this.paths.correct);
        audio.volume = 0.5;
        audio.play().catch(() => {});
    },

    playIncorrect() {
        const audio = new Audio(this.paths.incorrect);
        audio.volume = 0.6;
        audio.play().catch(() => {});
    }
};