const BASE_PERFORMANCE = {
    PERFECT: {
        THRESHOLD: 1000,
        COLOR: 'rgb(255, 251, 0)',
        TITLE: 'Perfecto',
        BASE_POINTS: 5000,
        EXTRA_POINTS:2
    },
    EXCELLENT: {
        THRESHOLD: 2000,
        COLOR: 'rgb(174, 0, 255)',
        TITLE: 'Excelente',
        BASE_POINTS: 4000,
        EXTRA_POINTS:1 
    },
    GREAT: {
        THRESHOLD: 4000,
        COLOR: 'rgb(0, 162, 255)',
        TITLE: 'Genial',
        BASE_POINTS: 2500,
        EXTRA_POINTS:0.75 
    },
    GOOD: {
        THRESHOLD: 8000,
        COLOR: 'rgb(0, 255, 55)',
        TITLE: 'Bien',
        BASE_POINTS: 1500,
        EXTRA_POINTS:0.25 
    },
    OK: {
        THRESHOLD: Infinity,
        COLOR: 'rgb(255, 102, 0)',
        TITLE: 'Ok',
        BASE_POINTS: 1000,
        EXTRA_POINTS:0 
    }
};

const GAME_CONFIG = {
    trial: {
         ROUNDS: 20,
         CLEF_PROB: 0,
         DURATION: 'w',
         EXPERIENCE: 0,
         PERFORMANCE: BASE_PERFORMANCE
    },
    DEFAULT: {
         ROUNDS: 20,
         CLEF_PROB: 0,
         DURATION: 'w',
         EXPERIENCE: 17,
         PERFORMANCE: BASE_PERFORMANCE
    }
};

function getConfig(levelId) {
    return GAME_CONFIG[levelId] || GAME_CONFIG.DEFAULT;
}

export { getConfig };